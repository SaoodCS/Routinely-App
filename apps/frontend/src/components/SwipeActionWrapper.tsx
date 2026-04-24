import { Box, Typography, useTheme } from '@mui/material';
import type { PointerEvent, ReactNode } from 'react';
import { useRef, useState } from 'react';

interface T_SwipeActionWrapperProps {
   children: ReactNode;
   leftAction?: {
      label: string;
      onAction: () => void | Promise<void>;
      icon?: ReactNode;
      backgroundColor?: string;
      color?: string;
      disabled?: boolean;
   };
   rightAction?: T_SwipeActionWrapperProps['leftAction'];
   disabled?: boolean;
}

export default function SwipeActionWrapper(props: T_SwipeActionWrapperProps): React.JSX.Element {
   const { children, leftAction, rightAction, disabled = false } = props;
   const { transitions } = useTheme();
   const pointerStartXRef = useRef<number | null>(null);
   const pointerIdRef = useRef<number | null>(null);
   const [offsetX, setOffsetX] = useState(0);
   const [isDragging, setIsDragging] = useState(false);
   const [didSwipe, setDidSwipe] = useState(false);
   const hasLeftAction = Boolean(leftAction && !leftAction.disabled);
   const hasRightAction = Boolean(rightAction && !rightAction.disabled);
   const isInteractive = !disabled && (hasLeftAction || hasRightAction);

   function handlePointerDown(event: PointerEvent<HTMLDivElement>): void {
      if (!isInteractive || event.button !== 0) return;
      pointerStartXRef.current = event.clientX;
      pointerIdRef.current = event.pointerId;
      setDidSwipe(false);
      event.currentTarget.setPointerCapture(event.pointerId);
   }

   function handlePointerMove(event: PointerEvent<HTMLDivElement>): void {
      if (pointerStartXRef.current === null || pointerIdRef.current !== event.pointerId) return;
      const offsetX = event.clientX - pointerStartXRef.current;
      const maxSwipeDistance = 112;
      const min = hasRightAction ? -maxSwipeDistance : 0;
      const max = hasLeftAction ? maxSwipeDistance : 0;
      const nextOffsetX = Math.min(Math.max(offsetX, min), max);
      if (Math.abs(nextOffsetX) > 6) {
         setIsDragging(true);
         setDidSwipe(true);
      }
      setOffsetX(nextOffsetX);
   }

   function handlePointerEnd(event: PointerEvent<HTMLDivElement>): void {
      if (pointerStartXRef.current === null || pointerIdRef.current !== event.pointerId) return;
      let actionSide: 'left' | 'right' | null = null;
      const actionThreshold = 72;
      if (offsetX >= actionThreshold && hasLeftAction) actionSide = 'left';
      if (offsetX <= -actionThreshold && hasRightAction) actionSide = 'right';
      const action = actionSide === 'left' ? leftAction : rightAction;
      if (actionSide && action && !action.disabled) void action.onAction();
      pointerStartXRef.current = null;
      pointerIdRef.current = null;
      setIsDragging(false);
      setOffsetX(0);
   }

   function handleClickCapture(event: React.MouseEvent<HTMLDivElement>): void {
      if (!didSwipe) return;
      event.preventDefault();
      event.stopPropagation();
   }

   return (
      <Box sx={{ position: 'relative', overflow: 'hidden', touchAction: 'pan-y', userSelect: isDragging ? 'none' : undefined }}>
         {leftAction && <ActionBackground action={leftAction} side="left" visible={offsetX > 0} />}
         {rightAction && <ActionBackground action={rightAction} side="right" visible={offsetX < 0} />}
         <Box
            onClickCapture={handleClickCapture}
            onPointerCancel={handlePointerEnd}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            sx={{
               position: 'relative',
               zIndex: 1,
               transform: `translateX(${offsetX}px)`,
               transition: isDragging ? 'none' : transitions.create('transform', { duration: transitions.duration.shortest }),
               willChange: isInteractive ? 'transform' : undefined,
            }}
         >
            {children}
         </Box>
      </Box>
   );
}
//
//
//
function ActionBackground(props: {
   action: Exclude<T_SwipeActionWrapperProps['leftAction'], undefined>;
   side: 'left' | 'right';
   visible: boolean;
}): React.JSX.Element {
   const { action, side, visible } = props;
   const { palette } = useTheme();
   return (
      <Box
         sx={{
            position: 'absolute',
            insetBlock: 0,
            [side]: 0,
            alignItems: 'center',
            bgcolor: action.backgroundColor ?? palette.success.dark,
            color: action.color ?? 'common.white',
            display: 'flex',
            gap: 1,
            justifyContent: side === 'left' ? 'flex-start' : 'flex-end',
            minWidth: 112,
            opacity: visible ? 1 : 0,
            px: 2,
            transition: 'opacity 120ms ease',
         }}
      >
         {action.icon}
         <Typography component="span" sx={{ fontWeight: 700 }} variant="body2">
            {action.label}
         </Typography>
      </Box>
   );
}
