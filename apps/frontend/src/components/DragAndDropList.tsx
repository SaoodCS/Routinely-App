import type { CSSProperties, JSX, PointerEvent, ReactNode } from 'react';
import { useRef } from 'react';

interface T_DragAndDropListProps<TItem extends { id: number | string }> {
   items: TItem[];
   onDrop: (newOrderedItems: TItem[]) => void;
   renderItem: (item: TItem, dragElProps: { 'data-drag-handle': string; 'data-drag-index': number; style: CSSProperties }) => ReactNode;
}

export default function DragAndDropList<TItem extends { id: number | string }>(props: T_DragAndDropListProps<TItem>): JSX.Element {
   const { items, onDrop, renderItem } = props;
   const dragStateRef = useRef<{
      contentEl: HTMLDivElement;
      currentIndex: number;
      itemHeight: number;
      latestX: number;
      latestY: number;
      measures: { midpointY: number }[];
      pointerId: number;
      pointerOffsetY: number;
      rafId: number | null;
      scrollEl: HTMLElement;
      startScrollTop: number;
      startX: number;
      startY: number;
      startIndex: number;
      wrapperEl: HTMLDivElement;
      wrapperEls: HTMLDivElement[];
   } | null>(null);

   function handlePointerDown(event: PointerEvent<HTMLDivElement>): void {
      const { target, currentTarget, button, pointerId, clientX, clientY } = event;
      if (!(target instanceof Element) || dragStateRef.current) return;
      const handleEl = target.closest('[data-drag-handle]');
      if (!(handleEl instanceof HTMLElement) || !currentTarget.contains(handleEl)) return;
      const startIndex = handleEl instanceof HTMLElement ? Number(handleEl.dataset.dragIndex) : NaN;
      if (button !== 0 || !Number.isInteger(startIndex)) return;
      event.preventDefault();
      event.stopPropagation();
      const wrapperEls = Array.from(currentTarget.children).filter((element) => element instanceof HTMLDivElement);
      const contentEls = wrapperEls.map((wrapperEl) => wrapperEl.firstElementChild).filter((element) => element instanceof HTMLDivElement);
      if (!items[startIndex] || wrapperEls.length !== items.length || contentEls.length !== items.length) return;
      const wrapperEl = wrapperEls[startIndex];
      const contentEl = contentEls[startIndex];
      if (!wrapperEl || !contentEl) return;
      let scrollEl = currentTarget.parentElement;
      while (scrollEl) {
         const { overflowY } = window.getComputedStyle(scrollEl);
         if ((overflowY === 'auto' || overflowY === 'scroll') && scrollEl.scrollHeight > scrollEl.clientHeight) break;
         scrollEl = scrollEl.parentElement;
      }
      scrollEl ??= document.scrollingElement instanceof HTMLElement ? document.scrollingElement : document.documentElement;
      handleEl.setPointerCapture(pointerId);
      const { height, left, top, width } = contentEl.getBoundingClientRect();
      dragStateRef.current = {
         contentEl: {
            ...contentEl,
            style: {
               ...contentEl.style,
               position: 'fixed',
               cursor: 'grabbing',
               height: `${height}px`,
               left: `${left}px`,
               top: `${top}px`,
               width: `${width}px`,
               willChange: 'transform',
               zIndex: '2',
            },
         },
         currentIndex: startIndex,
         itemHeight: height,
         latestX: clientX,
         latestY: clientY,
         measures: wrapperEls.map((el) => {
            return { midpointY: el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2 };
         }),
         pointerId: pointerId,
         pointerOffsetY: clientY - top,
         rafId: null,
         scrollEl,
         startScrollTop: scrollEl.scrollTop,
         startX: clientX,
         startY: clientY,
         startIndex,
         wrapperEl: { ...wrapperEl, style: { ...wrapperEl.style, height: `${height}px` } },
         wrapperEls,
      };
   }

   function handlePointerMove(event: PointerEvent<HTMLDivElement>): void {
      const dragState = dragStateRef.current;
      if (!dragState || dragState.pointerId !== event.pointerId) return;
      event.preventDefault();
      event.stopPropagation();
      dragState.latestX = event.clientX;
      dragState.latestY = event.clientY;
      if (dragState.rafId !== null) return;
      dragState.rafId = window.requestAnimationFrame(handleDragFrame);
   }

   function handleDragFrame(): void {
      const dragState = dragStateRef.current;
      if (!dragState) return;
      const { scrollEl, latestY, latestX, startX, startY, startScrollTop, startIndex, pointerOffsetY, itemHeight, measures } = dragState;
      const { scrollingElement, documentElement } = document;
      const { scrollSize, maxFrameScroll } = { scrollSize: 72, maxFrameScroll: 18 };
      let scrollRect: DOMRect | { bottom: number; top: number } = dragState.scrollEl.getBoundingClientRect();
      if (scrollEl === scrollingElement || scrollEl === documentElement) scrollRect = { bottom: window.innerHeight, top: 0 };
      const { bottom, top } = scrollRect;
      let scrollAmount = 0;
      if (latestY - top < scrollSize) scrollAmount = -Math.ceil(((scrollSize - (latestY - top)) / scrollSize) * maxFrameScroll);
      else if (bottom - latestY < scrollSize) scrollAmount = Math.ceil(((scrollSize - (bottom - latestY)) / scrollSize) * maxFrameScroll);
      const previousScrollTop = scrollEl.scrollTop;
      if (scrollAmount !== 0) scrollEl.scrollTop += scrollAmount;
      dragState.rafId = scrollEl.scrollTop === previousScrollTop ? null : window.requestAnimationFrame(handleDragFrame);
      dragState.contentEl.style.transform = `translate3d(${latestX - startX}px, ${latestY - startY}px, 0)`;
      const scrollOffset = scrollEl.scrollTop - startScrollTop;
      const draggedMidpointY = latestY - pointerOffsetY + itemHeight / 2;
      let nextIndex = startIndex;
      const step = draggedMidpointY >= measures[startIndex].midpointY - scrollOffset ? 1 : -1;
      for (let i = startIndex + step; i >= 0 && i < measures.length; i += step) {
         const { midpointY } = measures[i];
         const crossedMidpoint = step === 1 ? draggedMidpointY > midpointY - scrollOffset : draggedMidpointY < midpointY - scrollOffset;
         if (!crossedMidpoint) break;
         nextIndex = i;
      }
      if (nextIndex === dragState.currentIndex) return;
      dragState.currentIndex = nextIndex;
      const { currentIndex } = dragState;
      dragState.wrapperEls.forEach((el, index) => {
         if (index === startIndex) return;
         el.style.transition = 'transform 120ms ease';
         if (currentIndex > startIndex && index > startIndex && index <= currentIndex) el.style.transform = `translate3d(0, -${itemHeight}px, 0)`;
         else if (currentIndex < startIndex && index >= currentIndex && index < startIndex) el.style.transform = `translate3d(0, ${itemHeight}px, 0)`;
         else el.style.transform = '';
      });
   }

   function handlePointerEnd(event: PointerEvent<HTMLDivElement>): void {
      const dragState = dragStateRef.current;
      if (!dragState || dragState.pointerId !== event.pointerId) return;
      const { rafId, currentIndex, startIndex } = dragState;
      event.preventDefault();
      event.stopPropagation();
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (event.target instanceof HTMLElement && event.target.hasPointerCapture(event.pointerId)) event.target.releasePointerCapture(event.pointerId);
      dragState.contentEl.removeAttribute('style');
      dragState.wrapperEl.style.height = '';
      dragState.wrapperEls.forEach((wrapperEl) => {
         wrapperEl.style.transform = '';
         wrapperEl.style.transition = '';
      });
      dragStateRef.current = null;
      if (currentIndex === startIndex) return;
      const newOrderedItems = [...items];
      const [draggedItem] = newOrderedItems.splice(startIndex, 1);
      if (!draggedItem) return;
      newOrderedItems.splice(currentIndex, 0, draggedItem);
      onDrop(newOrderedItems);
   }

   return (
      <div onPointerCancel={handlePointerEnd} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerEnd}>
         {items.map((item, index) => (
            <div key={item.id}>
               {renderItem(item, {
                  'data-drag-handle': '',
                  'data-drag-index': index,
                  style: { cursor: 'grab', touchAction: 'none', userSelect: 'none' },
               })}
            </div>
         ))}
      </div>
   );
}
