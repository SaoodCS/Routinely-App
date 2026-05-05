// component has 0 UI library dependencies so can copy to any react project
import type { PointerEvent, ReactNode } from 'react';
import { useRef, useState } from 'react';

interface T_SwipeActionWrapperProps {
   children: ReactNode;
   leftAction?: {
      label: string;
      onAction: () => void | Promise<void>;
      icon?: ReactNode;
      bgColor?: string;
      color?: string;
      disabled?: boolean;
   };
   rightAction?: T_SwipeActionWrapperProps['leftAction'];
   disabled?: boolean;
   style?: React.CSSProperties;
}

export default function SwipeActionWrapper(props: T_SwipeActionWrapperProps): React.JSX.Element {
   const { children, leftAction, rightAction, disabled = false, style } = props;
   const pointerStartXRef = useRef<number | null>(null);
   const pointerIdRef = useRef<number | null>(null);
   const offsetXRef = useRef(0);
   const [offsetX, setOffsetX] = useState(0);
   const [isDragging, setIsDragging] = useState(false);
   const [didSwipe, setDidSwipe] = useState(false);
   const hasLeftAction = Boolean(leftAction && !leftAction.disabled);
   const hasRightAction = Boolean(rightAction && !rightAction.disabled);
   const isInteractive = !disabled && (hasLeftAction || hasRightAction);

   function handlePointerDown(event: PointerEvent<HTMLDivElement>): void {
      if (!isInteractive || event.button !== 0) return;
      if (event.target instanceof Element && event.target.closest('button')) return;
      pointerStartXRef.current = event.clientX;
      pointerIdRef.current = event.pointerId;
      setDidSwipe(false);
      event.currentTarget.setPointerCapture(event.pointerId);
   }

   function handlePointerMove(event: PointerEvent<HTMLDivElement>): void {
      if (pointerStartXRef.current === null || pointerIdRef.current !== event.pointerId) return;
      const pointerOffsetX = event.clientX - pointerStartXRef.current;
      const swipeDistance = Math.max(Math.abs(pointerOffsetX) - 18, 0);
      const rawOffsetX = Math.sign(pointerOffsetX) * swipeDistance;
      const min = hasRightAction ? -112 : 0;
      const max = hasLeftAction ? 112 : 0;
      const nextOffsetX = Math.min(Math.max(rawOffsetX, min), max);
      offsetXRef.current = nextOffsetX;
      if (nextOffsetX !== 0 && !isDragging) setIsDragging(true);
      if (Math.abs(nextOffsetX) > 6 && !didSwipe) setDidSwipe(true);
      if (nextOffsetX !== offsetX) setOffsetX(nextOffsetX);
   }

   function handlePointerEnd(event: PointerEvent<HTMLDivElement>): void {
      if (pointerStartXRef.current === null || pointerIdRef.current !== event.pointerId) return;
      const finalOffsetX = offsetXRef.current;
      if (finalOffsetX >= 72 && hasLeftAction) void leftAction?.onAction();
      if (finalOffsetX <= -72 && hasRightAction) void rightAction?.onAction();
      pointerStartXRef.current = null;
      pointerIdRef.current = null;
      offsetXRef.current = 0;
      setIsDragging(false);
      setOffsetX(0);
   }

   function handleClickCapture(event: React.MouseEvent<HTMLDivElement>): void {
      if (!didSwipe) return;
      event.preventDefault();
      event.stopPropagation();
   }

   return (
      <div style={{ position: 'relative', overflow: 'hidden', touchAction: 'pan-y', userSelect: isDragging ? 'none' : undefined, width: 'inherit' }}>
         {leftAction && <ActionBackground action={leftAction} isDragging={isDragging} revealDistance={Math.max(offsetX, 0)} side="left" />}
         {rightAction && <ActionBackground action={rightAction} isDragging={isDragging} revealDistance={Math.max(-offsetX, 0)} side="right" />}
         <div
            onClickCapture={handleClickCapture}
            onPointerCancel={handlePointerEnd}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            style={{
               position: 'relative',
               zIndex: 1,
               transform: `translateX(${offsetX}px)`,
               transition: isDragging ? 'none' : 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
               willChange: isInteractive ? 'transform' : undefined,
               ...style,
            }}
         >
            {children}
         </div>
      </div>
   );
}

function ActionBackground(props: {
   action: Exclude<T_SwipeActionWrapperProps['leftAction'], undefined>;
   isDragging: boolean;
   revealDistance: number;
   side: 'left' | 'right';
}): React.JSX.Element {
   const { action, isDragging, revealDistance, side } = props;
   const translateX = side === 'left' ? revealDistance - 112 : 112 - revealDistance;

   return (
      <div
         style={{
            position: 'absolute',
            insetBlock: 0,
            [side]: '-8px',
            alignItems: 'center',
            backgroundColor: action.bgColor ?? '#1b5e20',
            boxSizing: 'border-box',
            color: action.color ?? '#fff',
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            opacity: revealDistance > 0 ? 1 : 0,
            overflow: 'hidden',
            paddingInline: '16px',
            transform: `translateX(${translateX}px)`,
            transition: isDragging ? 'none' : 'opacity 120ms ease, transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
            width: '112px',
         }}
      >
         {action.icon}
         <span style={{ flexShrink: 0, fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.43, whiteSpace: 'nowrap' }}>{action.label}</span>
      </div>
   );
}
