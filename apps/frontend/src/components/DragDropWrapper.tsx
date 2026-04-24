import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, Key, PointerEvent, ReactNode } from 'react';

const disabledListStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 8 };
const listStyle: CSSProperties = { ...disabledListStyle, touchAction: 'none' };
const itemStyle: CSSProperties = {
   cursor: 'grab',
   position: 'relative',
   transition: 'transform 120ms ease, opacity 120ms ease',
   userSelect: 'none',
};
const draggingItemStyle: CSSProperties = {
   ...itemStyle,
   cursor: 'grabbing',
   opacity: 0.9,
   transition: 'none',
   willChange: 'transform',
   zIndex: 1,
};

interface T_DragDropWrapperProps<T> {
   items: readonly T[];
   getKey: (item: T) => Key;
   renderItem: (item: T, index: number) => ReactNode;
   onDrop: (newOrder: T[]) => void;
   disabled?: boolean;
}

export default function DragDropWrapper<T>(props: T_DragDropWrapperProps<T>): React.JSX.Element {
   const { disabled = false, getKey, items, onDrop, renderItem } = props;
   const initialOrder = useMemo(() => Array.from({ length: items.length }, (_, index) => index), [items.length]);
   const [order, setOrder] = useState(() => initialOrder);
   const renderOrder = order.length === items.length ? order : initialOrder;
   const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
   const listRef = useRef<HTMLDivElement | null>(null);
   const itemCenterYsRef = useRef<number[]>([]);
   const orderRef = useRef(order);
   const activeElementRef = useRef<HTMLDivElement | null>(null);
   const pointerIdRef = useRef<number | null>(null);
   const activeIndexRef = useRef<number | null>(null);
   const dragFrameRef = useRef<number | null>(null);
   const dragTranslateYRef = useRef(0);
   const pendingPointerYRef = useRef<number | null>(null);
   const pointerOffsetYRef = useRef(0);
   const scrollFrameRef = useRef<number | null>(null);
   const scrollOffsetYRef = useRef(0);
   const scrollTargetRef = useRef<HTMLElement | null>(null);
   const didReorderRef = useRef(false);

   function measureItemCenterYs(): void {
      const itemElements = listRef.current?.children;
      if (!itemElements) return;
      scrollOffsetYRef.current = 0;
      itemCenterYsRef.current.length = orderRef.current.length;
      for (let index = 0; index < orderRef.current.length; index += 1) {
         const item = itemElements.item(index);
         if (!(item instanceof HTMLElement)) continue;
         const rect = item.getBoundingClientRect();
         itemCenterYsRef.current[index] = rect.top + rect.height / 2;
      }
   }

   useEffect(() => {
      return () => {
         if (dragFrameRef.current !== null) cancelAnimationFrame(dragFrameRef.current);
         if (scrollFrameRef.current !== null) cancelAnimationFrame(scrollFrameRef.current);
      };
   }, []);

   useLayoutEffect(() => {
      if (activeIndexRef.current !== null) measureItemCenterYs();
   }, [order]);

   function handlePointerDown(event: PointerEvent<HTMLDivElement>): void {
      if (disabled || event.button !== 0) return;
      let itemElement = event.target instanceof Element ? event.target : null;
      while (itemElement && itemElement.parentElement !== event.currentTarget) itemElement = itemElement.parentElement;
      if (!(itemElement instanceof HTMLDivElement)) return;
      const index = Number(itemElement.dataset.dragIndex);
      if (!Number.isInteger(index)) return;
      event.stopPropagation();
      const rect = itemElement.getBoundingClientRect();
      let scrollTarget = itemElement.parentElement;
      while (scrollTarget) {
         const overflowY = getComputedStyle(scrollTarget).overflowY;
         const isScrollable = scrollTarget.scrollHeight > scrollTarget.clientHeight && (overflowY === 'auto' || overflowY === 'scroll');
         if (isScrollable) break;
         scrollTarget = scrollTarget.parentElement;
      }
      activeElementRef.current = itemElement;
      pointerOffsetYRef.current = event.clientY - rect.top;
      dragTranslateYRef.current = 0;
      pendingPointerYRef.current = event.clientY;
      scrollTargetRef.current = scrollTarget ?? (document.scrollingElement as HTMLElement | null) ?? document.documentElement;
      orderRef.current = renderOrder;
      measureItemCenterYs();
      pointerIdRef.current = event.pointerId;
      activeIndexRef.current = index;
      didReorderRef.current = false;
      itemElement.style.transform = 'translate3d(0, 0, 0)';
      setDraggingIndex(index);
      itemElement.setPointerCapture(event.pointerId);
   }

   function handlePointerMove(event: PointerEvent<HTMLDivElement>): void {
      const { pointerId, clientY } = event;
      if (pointerIdRef.current !== pointerId || activeIndexRef.current === null) return;
      event.stopPropagation();
      const activeIndex = activeIndexRef.current;
      pendingPointerYRef.current = clientY;
      if (scrollFrameRef.current === null) scrollFrameRef.current = requestAnimationFrame(scrollWhileDragging);
      if (dragFrameRef.current === null) {
         dragFrameRef.current = requestAnimationFrame(() => {
            dragFrameRef.current = null;
            const pendingPointerY = pendingPointerYRef.current;
            if (pendingPointerY !== null) moveActiveElementToPointer(pendingPointerY);
         });
      }
      if (itemCenterYsRef.current.length !== orderRef.current.length) measureItemCenterYs();
      if (activeIndex < 0 || activeIndex >= itemCenterYsRef.current.length) return;
      updateOrderForPointer(clientY, activeIndex);
   }

   function moveActiveElementToPointer(clientY: number): void {
      const element = activeElementRef.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const itemTop = rect.top - dragTranslateYRef.current;
      const translateY = clientY - pointerOffsetYRef.current - itemTop;
      dragTranslateYRef.current = translateY;
      element.style.transform = `translate3d(0, ${translateY}px, 0)`;
   }

   function updateOrderForPointer(clientY: number, activeIndex: number): void {
      let nextIndex = activeIndex;
      const scrollOffsetY = scrollOffsetYRef.current;
      const direction = clientY > itemCenterYsRef.current[activeIndex] - scrollOffsetY ? 1 : -1;
      for (let index = activeIndex + direction; index >= 0 && index < itemCenterYsRef.current.length; index += direction) {
         const itemCenterY = itemCenterYsRef.current[index] - scrollOffsetY;
         const hasNotCrossedItem = direction === 1 ? clientY <= itemCenterY : clientY >= itemCenterY;
         if (hasNotCrossedItem) break;
         nextIndex = index;
      }
      if (nextIndex === activeIndex) return;
      const nextOrder = [...orderRef.current];
      const [movedItem] = nextOrder.splice(activeIndex, 1);
      if (movedItem === undefined) return;
      nextOrder.splice(nextIndex, 0, movedItem);
      orderRef.current = nextOrder;
      activeIndexRef.current = nextIndex;
      didReorderRef.current = true;
      setDraggingIndex(nextIndex);
      setOrder(nextOrder);
   }

   function scrollWhileDragging(): void {
      scrollFrameRef.current = null;
      const scrollTarget = scrollTargetRef.current;
      const pointerY = pendingPointerYRef.current;
      if (!scrollTarget || pointerY === null) return;
      const isPageScroll = scrollTarget === document.scrollingElement || scrollTarget === document.documentElement || scrollTarget === document.body;
      const { bottom, top } = isPageScroll ? { bottom: window.innerHeight, top: 0 } : scrollTarget.getBoundingClientRect();
      const edgeSize = 64;
      const edgeDistance = pointerY < top + edgeSize ? pointerY - top - edgeSize : pointerY > bottom - edgeSize ? pointerY - bottom + edgeSize : 0;
      if (edgeDistance === 0) return;

      const previousScrollTop = scrollTarget.scrollTop;
      scrollTarget.scrollTop += Math.sign(edgeDistance) * Math.ceil(Math.min(1, Math.abs(edgeDistance) / edgeSize) * 18);
      const scrollDelta = scrollTarget.scrollTop - previousScrollTop;
      if (scrollDelta === 0) return;
      moveActiveElementToPointer(pointerY);
      scrollOffsetYRef.current += scrollDelta;
      if (activeIndexRef.current !== null) updateOrderForPointer(pointerY, activeIndexRef.current);
      scrollFrameRef.current = requestAnimationFrame(scrollWhileDragging);
   }

   function handlePointerEnd(event: PointerEvent<HTMLDivElement>, shouldCommit = true): void {
      if (pointerIdRef.current !== event.pointerId) return;
      event.stopPropagation();
      const didReorder = didReorderRef.current;
      const shouldDrop = shouldCommit && didReorder;
      const droppedOrder = orderRef.current;
      const activeElement = activeElementRef.current;
      if (activeElement?.hasPointerCapture(event.pointerId)) activeElement.releasePointerCapture(event.pointerId);
      if (dragFrameRef.current !== null) cancelAnimationFrame(dragFrameRef.current);
      if (scrollFrameRef.current !== null) cancelAnimationFrame(scrollFrameRef.current);
      dragFrameRef.current = null;
      scrollFrameRef.current = null;
      if (activeElement) activeElement.style.transform = '';
      activeElementRef.current = null;
      dragTranslateYRef.current = 0;
      pendingPointerYRef.current = null;
      pointerOffsetYRef.current = 0;
      scrollOffsetYRef.current = 0;
      scrollTargetRef.current = null;
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

   return (
      <div
         ref={listRef}
         onPointerCancel={(event) => handlePointerEnd(event, false)}
         onPointerDown={handlePointerDown}
         onPointerMove={handlePointerMove}
         onPointerUp={handlePointerEnd}
         style={disabled ? disabledListStyle : listStyle}
      >
         {renderOrder.map((childIndex, index) => {
            const item = items[childIndex];
            return (
               <div key={getKey(item)} data-drag-index={index} style={disabled ? undefined : draggingIndex === index ? draggingItemStyle : itemStyle}>
                  {renderItem(item, index)}
               </div>
            );
         })}
      </div>
   );
}
