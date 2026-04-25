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
      scrollEl: HTMLElement;
      wrapperEl: HTMLDivElement;
      wrapperEls: HTMLDivElement[];
      start: { x: number; y: number; index: number; scrollTop: number };
      latest: { x: number; y: number };
      measures: { midpointY: number }[];
      pointer: { id: number; offsetY: number };
      currentIndex: number;
      itemHeight: number;
      rafId: number | null;
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
      const contentElPos = { height: `${height}px`, left: `${left}px`, top: `${top}px`, width: `${width}px` };
      const contentElNewStyle = { ...contentEl.style, ...contentElPos, position: 'fixed', cursor: 'grabbing', willChange: 'transform', zIndex: '2' };
      dragStateRef.current = {
         scrollEl,
         contentEl: { ...contentEl, style: contentElNewStyle },
         wrapperEl: { ...wrapperEl, style: { ...wrapperEl.style, height: contentElPos.height } },
         wrapperEls,
         start: { x: clientX, y: clientY, index: startIndex, scrollTop: scrollEl.scrollTop },
         latest: { x: clientX, y: clientY },
         currentIndex: startIndex,
         itemHeight: height,
         measures: wrapperEls.map((el) => ({ midpointY: el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2 })),
         pointer: { id: pointerId, offsetY: clientY - top },
         rafId: null,
      };
   }

   function handlePointerMove(event: PointerEvent<HTMLDivElement>): void {
      const dragState = dragStateRef.current;
      if (!dragState || dragState.pointer.id !== event.pointerId) return;
      event.preventDefault();
      event.stopPropagation();
      dragState.latest = { x: event.clientX, y: event.clientY };
      if (dragState.rafId !== null) return;
      dragState.rafId = window.requestAnimationFrame(handleDragFrame);
   }

   function handleDragFrame(): void {
      const dragState = dragStateRef.current;
      if (!dragState) return;
      const { scrollEl, latest, start, pointer, itemHeight, measures } = dragState;
      const { scrollingElement, documentElement } = document;
      const { scrollSize, maxFrameScroll } = { scrollSize: 72, maxFrameScroll: 18 };
      let scrollRect: DOMRect | { bottom: number; top: number } = dragState.scrollEl.getBoundingClientRect();
      if (scrollEl === scrollingElement || scrollEl === documentElement) scrollRect = { bottom: window.innerHeight, top: 0 };
      const { bottom, top } = scrollRect;
      let scrollAmount = 0;
      if (latest.y - top < scrollSize) scrollAmount = -Math.ceil(((scrollSize - (latest.y - top)) / scrollSize) * maxFrameScroll);
      else if (bottom - latest.y < scrollSize) scrollAmount = Math.ceil(((scrollSize - (bottom - latest.y)) / scrollSize) * maxFrameScroll);
      const previousScrollTop = scrollEl.scrollTop;
      if (scrollAmount !== 0) scrollEl.scrollTop += scrollAmount;
      dragState.rafId = scrollEl.scrollTop === previousScrollTop ? null : window.requestAnimationFrame(handleDragFrame);
      dragState.contentEl.style.transform = `translate3d(${latest.x - start.x}px, ${latest.y - start.y}px, 0)`;
      const scrollOffset = scrollEl.scrollTop - start.scrollTop;
      const draggedMidpointY = latest.y - pointer.offsetY + itemHeight / 2;
      let nextIndex = start.index;
      const step = draggedMidpointY >= measures[start.index].midpointY - scrollOffset ? 1 : -1;
      for (let i = start.index + step; i >= 0 && i < measures.length; i += step) {
         const { midpointY } = measures[i];
         const crossedMidpoint = step === 1 ? draggedMidpointY > midpointY - scrollOffset : draggedMidpointY < midpointY - scrollOffset;
         if (!crossedMidpoint) break;
         nextIndex = i;
      }
      if (nextIndex === dragState.currentIndex) return;
      dragState.currentIndex = nextIndex;
      const { currentIndex } = dragState;
      dragState.wrapperEls.forEach((el, index) => {
         if (index === start.index) return;
         el.style.transition = 'transform 120ms ease';
         const translateNeg = currentIndex > start.index && index > start.index && index <= currentIndex;
         const translatePos = currentIndex < start.index && index >= currentIndex && index < start.index;
         el.style.transform = translateNeg ? `translate3d(0, -${itemHeight}px, 0)` : translatePos ? `translate3d(0, ${itemHeight}px, 0)` : '';
      });
   }

   function handlePointerEnd(event: PointerEvent<HTMLDivElement>): void {
      const dragState = dragStateRef.current;
      if (!dragState || dragState.pointer.id !== event.pointerId) return;
      const { rafId, currentIndex, start } = dragState;
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
      if (currentIndex === start.index) return;
      const newOrderedItems = [...items];
      const [draggedItem] = newOrderedItems.splice(start.index, 1);
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
