// NOTE: SET OVERFLOW: AUTO IN THE PARENT ELEMENT THAT WRAPS AROUND THIS COMPONENT TO ENABLE SCROLLING
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
      contentElStyle: string;
      scrollEl: HTMLElement;
      wrapperEl: HTMLDivElement;
      wrapperElStyle: string;
      wrapperEls: HTMLDivElement[];
      start: { x: number; y: number; index: number; scrollTop: number };
      latest: { x: number; y: number };
      midpointYs: number[];
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
      const wrapperEls = Array.from(currentTarget.children);
      if (!items[startIndex] || wrapperEls.length !== items.length || !wrapperEls.every((element) => element instanceof HTMLDivElement)) return;
      const wrapperEl = wrapperEls[startIndex];
      const contentEl = wrapperEl?.firstElementChild;
      if (!(contentEl instanceof HTMLDivElement)) return;
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
      const contentElStyle = contentEl.style.cssText;
      const wrapperElStyle = wrapperEl.style.cssText;
      Object.assign(contentEl.style, { ...contentElPos, position: 'fixed', cursor: 'grabbing', willChange: 'transform', zIndex: '2' });
      wrapperEl.style.height = contentElPos.height;
      dragStateRef.current = {
         scrollEl,
         contentEl,
         contentElStyle,
         wrapperEl,
         wrapperElStyle,
         wrapperEls,
         start: { x: clientX, y: clientY, index: startIndex, scrollTop: scrollEl.scrollTop },
         latest: { x: clientX, y: clientY },
         currentIndex: startIndex,
         itemHeight: height,
         midpointYs: wrapperEls.map((el) => {
            const { height, top } = el.getBoundingClientRect();
            return top + height / 2;
         }),
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
      const { scrollEl, latest, start, pointer, itemHeight, midpointYs } = dragState;
      const { scrollingElement, documentElement } = document;
      let scrollRect: DOMRect | { bottom: number; top: number } = dragState.scrollEl.getBoundingClientRect();
      if (scrollEl === scrollingElement || scrollEl === documentElement) scrollRect = { bottom: window.innerHeight, top: 0 };
      const { bottom, top } = scrollRect;
      let scrollAmount = 0;
      if (latest.y - top < 72) scrollAmount = -Math.ceil(((72 - (latest.y - top)) / 72) * 18);
      else if (bottom - latest.y < 72) scrollAmount = Math.ceil(((72 - (bottom - latest.y)) / 72) * 18);
      const previousScrollTop = scrollEl.scrollTop;
      if (scrollAmount !== 0) scrollEl.scrollTop += scrollAmount;
      dragState.rafId = scrollEl.scrollTop === previousScrollTop ? null : window.requestAnimationFrame(handleDragFrame);
      dragState.contentEl.style.transform = `translate3d(${latest.x - start.x}px, ${latest.y - start.y}px, 0)`;
      const scrollOffset = scrollEl.scrollTop - start.scrollTop;
      const draggedMidpointY = latest.y - pointer.offsetY + itemHeight / 2;
      let low = 0;
      let high = midpointYs.length;
      const movingDown = draggedMidpointY + scrollOffset >= midpointYs[start.index];
      while (low < high) {
         const mid = (low + high) >> 1;
         if (movingDown ? midpointYs[mid] < draggedMidpointY + scrollOffset : midpointYs[mid] <= draggedMidpointY + scrollOffset) low = mid + 1;
         else high = mid;
      }
      const nextIndex = movingDown ? Math.max(start.index, low - 1) : low;
      const previousIndex = dragState.currentIndex;
      if (nextIndex === previousIndex) return;
      dragState.currentIndex = nextIndex;
      const fromIndex = Math.min(previousIndex, nextIndex);
      const toIndex = Math.max(previousIndex, nextIndex);
      for (let index = fromIndex; index <= toIndex; index++) {
         const el = dragState.wrapperEls[index];
         if (!el) continue;
         if (index === start.index) continue;
         el.style.transition = 'transform 120ms ease';
         const translateNeg = nextIndex > start.index && index > start.index && index <= nextIndex;
         const translatePos = nextIndex < start.index && index >= nextIndex && index < start.index;
         el.style.transform = translateNeg ? `translate3d(0, -${itemHeight}px, 0)` : translatePos ? `translate3d(0, ${itemHeight}px, 0)` : '';
      }
   }

   function handlePointerEnd(event: PointerEvent<HTMLDivElement>): void {
      const dragState = dragStateRef.current;
      if (!dragState || dragState.pointer.id !== event.pointerId) return;
      const { rafId, currentIndex, start } = dragState;
      event.preventDefault();
      event.stopPropagation();
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (event.target instanceof HTMLElement && event.target.hasPointerCapture(event.pointerId)) event.target.releasePointerCapture(event.pointerId);
      dragState.contentEl.style.cssText = dragState.contentElStyle;
      dragState.wrapperEl.style.cssText = dragState.wrapperElStyle;
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
