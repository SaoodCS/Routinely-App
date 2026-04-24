import { Box } from '@mui/material';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Key, PointerEvent, ReactNode } from 'react';

interface T_DragDropWrapperProps<T> {
   items: readonly T[];
   getKey: (item: T) => Key;
   renderItem: (item: T, index: number) => ReactNode;
   onDrop: (newOrder: T[]) => void;
   disabled?: boolean;
}

export function reorderArray<T>(items: readonly T[], fromIndex: number, toIndex: number): T[] {
   if (fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) return [...items];
   const nextItems = [...items];
   const [movedItem] = nextItems.splice(fromIndex, 1);
   nextItems.splice(toIndex, 0, movedItem);
   return nextItems;
}

export function getReorderIndexByPointer(props: { activeIndex: number; itemCenterYs: readonly number[]; pointerY: number }): number {
   const { activeIndex, itemCenterYs, pointerY } = props;
   if (activeIndex < 0 || activeIndex >= itemCenterYs.length) return -1;
   let nextIndex = activeIndex;
   if (pointerY > itemCenterYs[activeIndex]) {
      for (let index = activeIndex + 1; index < itemCenterYs.length; index += 1) {
         if (pointerY <= itemCenterYs[index]) break;
         nextIndex = index;
      }
   } else {
      for (let index = activeIndex - 1; index >= 0; index -= 1) {
         if (pointerY >= itemCenterYs[index]) break;
         nextIndex = index;
      }
   }
   return nextIndex;
}

export default function DragDropWrapper<T>(props: T_DragDropWrapperProps<T>): React.JSX.Element {
   const { disabled = false, getKey, items, onDrop, renderItem } = props;
   const initialOrder = useMemo(() => Array.from({ length: items.length }, (_, index) => index), [items.length]);
   const [order, setOrder] = useState(() => initialOrder);
   const renderOrder = order.length === items.length ? order : initialOrder;
   const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
   const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
   const itemCenterYsRef = useRef<number[]>([]);
   const orderRef = useRef(order);
   const activeElementRef = useRef<HTMLDivElement | null>(null);
   const pointerIdRef = useRef<number | null>(null);
   const activeIndexRef = useRef<number | null>(null);
   const dragFrameRef = useRef<number | null>(null);
   const dragTranslateYRef = useRef(0);
   const pendingPointerYRef = useRef<number | null>(null);
   const pointerOffsetYRef = useRef(0);
   const didReorderRef = useRef(false);

   function measureItemCenterYs(): void {
      itemCenterYsRef.current.length = orderRef.current.length;
      for (let index = 0; index < orderRef.current.length; index += 1) {
         const item = itemRefs.current[index];
         if (!item) continue;
         const rect = item.getBoundingClientRect();
         itemCenterYsRef.current[index] = rect.top + rect.height / 2;
      }
   }

   useEffect(() => {
      itemRefs.current.length = items.length;
      itemCenterYsRef.current.length = items.length;
   }, [items.length]);

   useEffect(() => {
      return () => {
         if (dragFrameRef.current !== null) cancelAnimationFrame(dragFrameRef.current);
      };
   }, []);

   useLayoutEffect(() => {
      if (activeIndexRef.current !== null) measureItemCenterYs();
   }, [order]);

   function handlePointerDown(event: PointerEvent<HTMLDivElement>, index: number): void {
      if (disabled || event.button !== 0) return;
      event.stopPropagation();
      const rect = event.currentTarget.getBoundingClientRect();
      activeElementRef.current = event.currentTarget;
      pointerOffsetYRef.current = event.clientY - rect.top;
      dragTranslateYRef.current = 0;
      pendingPointerYRef.current = event.clientY;
      orderRef.current = renderOrder;
      measureItemCenterYs();
      pointerIdRef.current = event.pointerId;
      activeIndexRef.current = index;
      didReorderRef.current = false;
      event.currentTarget.style.transform = 'translate3d(0, 0, 0) scale(1.01)';
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
      itemCenterYsRef.current.length = 0;
      if (didReorder) {
         orderRef.current = initialOrder;
         setOrder(initialOrder);
      }
      setDraggingIndex(null);
      if (shouldDrop) onDrop(droppedOrder.map((itemIndex) => items[itemIndex]));
   }

   function getClosestItemIndex(clientY: number): number {
      const activeIndex = activeIndexRef.current;
      if (activeIndex === null) return -1;
      if (itemCenterYsRef.current.length !== orderRef.current.length) measureItemCenterYs();
      return getReorderIndexByPointer({ activeIndex, itemCenterYs: itemCenterYsRef.current, pointerY: clientY });
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
         const translateY = pendingPointerY - pointerOffsetYRef.current - itemTop;
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
      activeElementRef.current = null;
      dragTranslateYRef.current = 0;
      pendingPointerYRef.current = null;
      pointerOffsetYRef.current = 0;
   }

   return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, touchAction: disabled ? undefined : 'none' }}>
         {renderOrder.map((childIndex, index) => {
            const item = items[childIndex];
            return (
               <Box
                  key={getKey(item)}
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
                     transition: draggingIndex === index ? 'none' : 'transform 120ms ease, opacity 120ms ease',
                     userSelect: disabled ? undefined : 'none',
                     willChange: draggingIndex === index ? 'transform' : undefined,
                     zIndex: draggingIndex === index ? 1 : undefined,
                  }}
               >
                  {renderItem(item, index)}
               </Box>
            );
         })}
      </Box>
   );
}
