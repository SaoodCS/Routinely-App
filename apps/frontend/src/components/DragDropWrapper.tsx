import { Box } from '@mui/material';
import { Children, isValidElement, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent, ReactNode } from 'react';

interface T_DragDropWrapperProps<T = ReactNode> {
   children: ReactNode;
   onDrop: (newOrder: T[]) => void;
   items?: readonly T[];
   disabled?: boolean;
}

export function reorderArray<T>(items: readonly T[], fromIndex: number, toIndex: number): T[] {
   if (fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) return [...items];
   const nextItems = [...items];
   const [movedItem] = nextItems.splice(fromIndex, 1);
   nextItems.splice(toIndex, 0, movedItem);
   return nextItems;
}

export function getDragTranslateY(props: { itemTop: number; pointerOffsetY: number; pointerY: number }): number {
   return props.pointerY - props.pointerOffsetY - props.itemTop;
}

function getInitialOrder(itemCount: number): number[] {
   return Array.from({ length: itemCount }, (_, index) => index);
}

export default function DragDropWrapper<T = ReactNode>(props: T_DragDropWrapperProps<T>): React.JSX.Element {
   const { children, disabled = false, items, onDrop } = props;
   const childArray = useMemo(() => Children.toArray(children), [children]);
   const orderedValues = (items ?? childArray) as readonly T[];
   const initialOrder = useMemo(() => getInitialOrder(childArray.length), [childArray.length]);
   const [order, setOrder] = useState(() => initialOrder);
   const renderOrder = order.length === childArray.length ? order : initialOrder;
   const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
   const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
   const orderRef = useRef(order);
   const activeElementRef = useRef<HTMLDivElement | null>(null);
   const pointerIdRef = useRef<number | null>(null);
   const activeIndexRef = useRef<number | null>(null);
   const dragFrameRef = useRef<number | null>(null);
   const dragTranslateYRef = useRef(0);
   const pendingPointerYRef = useRef<number | null>(null);
   const pointerOffsetYRef = useRef(0);
   const didReorderRef = useRef(false);

   useEffect(() => {
      return () => {
         if (dragFrameRef.current !== null) cancelAnimationFrame(dragFrameRef.current);
      };
   }, []);

   function handlePointerDown(event: PointerEvent<HTMLDivElement>, index: number): void {
      if (disabled || event.button !== 0) return;
      event.stopPropagation();
      const rect = event.currentTarget.getBoundingClientRect();
      activeElementRef.current = event.currentTarget;
      pointerOffsetYRef.current = event.clientY - rect.top;
      dragTranslateYRef.current = 0;
      pendingPointerYRef.current = event.clientY;
      orderRef.current = renderOrder;
      pointerIdRef.current = event.pointerId;
      activeIndexRef.current = index;
      didReorderRef.current = false;
      event.currentTarget.style.transition = 'none';
      event.currentTarget.style.transform = 'translate3d(0, 0, 0) scale(1.01)';
      event.currentTarget.style.willChange = 'transform';
      setDraggingIndex(index);
      event.currentTarget.setPointerCapture(event.pointerId);
   }

   function handlePointerMove(event: PointerEvent<HTMLDivElement>): void {
      if (pointerIdRef.current !== event.pointerId || activeIndexRef.current === null) return;
      event.stopPropagation();
      queueDragTransform(event.clientY);
      const nextIndex = getClosestItemIndex(event.clientY);
      const activeIndex = activeIndexRef.current;
      if (nextIndex === -1 || nextIndex === activeIndex) return;
      const nextOrder = reorderArray(orderRef.current, activeIndex, nextIndex);
      orderRef.current = nextOrder;
      activeIndexRef.current = nextIndex;
      didReorderRef.current = true;
      setDraggingIndex(nextIndex);
      setOrder(nextOrder);
   }

   function handlePointerEnd(event: PointerEvent<HTMLDivElement>, shouldCommit = true): void {
      if (pointerIdRef.current !== event.pointerId) return;
      event.stopPropagation();
      const didReorder = didReorderRef.current;
      const shouldDrop = shouldCommit && didReorder;
      const droppedOrder = orderRef.current;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      clearDragFrame();
      resetActiveElementStyles();
      pointerIdRef.current = null;
      activeIndexRef.current = null;
      didReorderRef.current = false;
      if (didReorder) {
         orderRef.current = initialOrder;
         setOrder(initialOrder);
      }
      setDraggingIndex(null);
      if (shouldDrop) onDrop(droppedOrder.map((itemIndex) => orderedValues[itemIndex]));
   }

   function getClosestItemIndex(clientY: number): number {
      const activeIndex = activeIndexRef.current;
      if (activeIndex === null) return -1;
      let closestIndex = activeIndex;
      for (let index = 0; index < orderRef.current.length; index += 1) {
         if (index === activeIndex) continue;
         const item = itemRefs.current[index];
         if (!item) continue;
         const rect = item.getBoundingClientRect();
         const itemCenterY = rect.top + rect.height / 2;
         if (index > activeIndex && clientY > itemCenterY) {
            closestIndex = index;
         } else if (index < activeIndex && clientY < itemCenterY) {
            closestIndex = index;
            break;
         }
      }
      return closestIndex;
   }

   function queueDragTransform(pointerY: number): void {
      pendingPointerYRef.current = pointerY;
      if (dragFrameRef.current !== null) return;
      dragFrameRef.current = requestAnimationFrame(() => {
         dragFrameRef.current = null;
         const element = activeElementRef.current;
         const pendingPointerY = pendingPointerYRef.current;
         if (!element || pendingPointerY === null) return;
         const rect = element.getBoundingClientRect();
         const itemTop = rect.top - dragTranslateYRef.current;
         const translateY = getDragTranslateY({ itemTop, pointerOffsetY: pointerOffsetYRef.current, pointerY: pendingPointerY });
         dragTranslateYRef.current = translateY;
         element.style.transform = `translate3d(0, ${translateY}px, 0) scale(1.01)`;
      });
   }

   function clearDragFrame(): void {
      if (dragFrameRef.current === null) return;
      cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
   }

   function resetActiveElementStyles(): void {
      const element = activeElementRef.current;
      if (!element) return;
      element.style.transform = '';
      element.style.transition = '';
      element.style.willChange = '';
      activeElementRef.current = null;
      dragTranslateYRef.current = 0;
      pendingPointerYRef.current = null;
      pointerOffsetYRef.current = 0;
   }

   return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, touchAction: disabled ? undefined : 'none' }}>
         {renderOrder.map((childIndex, index) => {
            const child = childArray[childIndex];
            return (
               <Box
                  key={isValidElement(child) && child.key !== null ? child.key : childIndex}
                  ref={(element: HTMLDivElement | null) => {
                     itemRefs.current[index] = element;
                  }}
                  onPointerCancel={(event) => handlePointerEnd(event, false)}
                  onPointerDown={(event) => handlePointerDown(event, index)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerEnd}
                  sx={{
                     cursor: disabled ? undefined : draggingIndex === index ? 'grabbing' : 'grab',
                     opacity: draggingIndex === index ? 0.9 : 1,
                     position: 'relative',
                     transition: 'transform 120ms ease, opacity 120ms ease',
                     userSelect: disabled ? undefined : 'none',
                     zIndex: draggingIndex === index ? 1 : undefined,
                  }}
               >
                  {child}
               </Box>
            );
         })}
      </Box>
   );
}
