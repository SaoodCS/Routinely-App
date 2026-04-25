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
      const pointerOffsetX = event.clientX - pointerStartXRef.current;
      const swipeDistance = Math.max(Math.abs(pointerOffsetX) - 18, 0);
      const offsetX = Math.sign(pointerOffsetX) * swipeDistance;
      const min = hasRightAction ? -112 : 0;
      const max = hasLeftAction ? 112 : 0;
      const nextOffsetX = Math.min(Math.max(offsetX, min), max);
      if (nextOffsetX !== 0) setIsDragging(true);
      if (Math.abs(nextOffsetX) > 6) setDidSwipe(true);
      setOffsetX(nextOffsetX);
   }

   function handlePointerEnd(event: PointerEvent<HTMLDivElement>): void {
      if (pointerStartXRef.current === null || pointerIdRef.current !== event.pointerId) return;
      let actionSide: 'left' | 'right' | null = null;
      if (offsetX >= 72 && hasLeftAction) actionSide = 'left';
      if (offsetX <= -72 && hasRightAction) actionSide = 'right';
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

   function revealDistance(side: 'left' | 'right'): number {
      if (side === 'left') return Math.max(offsetX, 0);
      return Math.max(-offsetX, 0);
   }

   return (
      <div style={{ position: 'relative', overflow: 'hidden', touchAction: 'pan-y', userSelect: isDragging ? 'none' : undefined }}>
         {[leftAction, rightAction].map(
            (action, i) =>
               action && (
                  <div
                     key={i}
                     style={{
                        position: 'absolute',
                        insetBlock: 0,
                        [i === 0 ? 'left' : 'right']: 0,
                        alignItems: 'center',
                        backgroundColor: action.backgroundColor ?? '#1b5e20',
                        boxSizing: 'border-box',
                        color: action.color ?? '#fff',
                        display: 'flex',
                        gap: '8px',
                        justifyContent: 'center',
                        opacity: revealDistance(i === 0 ? 'left' : 'right') > 0 ? 1 : 0,
                        overflow: 'hidden',
                        paddingInline: '16px',
                        transform: `translateX(${i === 0 ? revealDistance('left') - 112 : 112 - revealDistance('right')}px)`,
                        transition: isDragging ? 'none' : 'opacity 120ms ease, transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                        width: `${112}px`,
                     }}
                  >
                     {action.icon}
                     <span style={{ flexShrink: 0, fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.43, whiteSpace: 'nowrap' }}>
                        {action.label}
                     </span>
                  </div>
               ),
         )}
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
            }}
         >
            {children}
         </div>
      </div>
   );
}
