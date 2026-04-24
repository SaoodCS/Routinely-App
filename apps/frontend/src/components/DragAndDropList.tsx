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
      latestClientX: number;
      latestClientY: number;
      measures: { midpointY: number }[];
      pointerId: number;
      pointerOffsetY: number;
      rafId: number | null;
      scrollEl: HTMLElement;
      startScrollTop: number;
      startClientX: number;
      startClientY: number;
      startIndex: number;
      wrapperEl: HTMLDivElement;
      wrapperEls: HTMLDivElement[];
   } | null>(null);

   function handlePointerDown(event: PointerEvent<HTMLDivElement>): void {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const handleEl = target.closest('[data-drag-handle]');
      const startIndex = handleEl instanceof HTMLElement ? Number(handleEl.dataset.dragIndex) : NaN;
      if (
         event.button !== 0 ||
         !(handleEl instanceof HTMLElement) ||
         !event.currentTarget.contains(handleEl) ||
         !Number.isInteger(startIndex) ||
         dragStateRef.current
      ) {
         return;
      }

      event.preventDefault();
      event.stopPropagation();

      const wrapperEls = Array.from(event.currentTarget.children).filter((element): element is HTMLDivElement => element instanceof HTMLDivElement);
      const contentEls = wrapperEls
         .map((wrapperEl) => wrapperEl.firstElementChild)
         .filter((element): element is HTMLDivElement => element instanceof HTMLDivElement);
      if (!items[startIndex] || wrapperEls.length !== items.length || contentEls.length !== items.length) return;

      const wrapperEl = wrapperEls[startIndex];
      const contentEl = contentEls[startIndex];
      if (!wrapperEl || !contentEl) return;

      let scrollEl = event.currentTarget.parentElement;
      while (scrollEl) {
         const overflowY = window.getComputedStyle(scrollEl).overflowY;
         if ((overflowY === 'auto' || overflowY === 'scroll') && scrollEl.scrollHeight > scrollEl.clientHeight) break;
         scrollEl = scrollEl.parentElement;
      }
      scrollEl ??= document.scrollingElement instanceof HTMLElement ? document.scrollingElement : document.documentElement;

      const itemRect = contentEl.getBoundingClientRect();
      try {
         handleEl.setPointerCapture(event.pointerId);
      } catch {
         // Synthetic pointer events used by browser checks may not register as active pointers.
      }

      wrapperEl.style.height = `${itemRect.height}px`;
      contentEl.style.cursor = 'grabbing';
      contentEl.style.height = `${itemRect.height}px`;
      contentEl.style.left = `${itemRect.left}px`;
      contentEl.style.position = 'fixed';
      contentEl.style.top = `${itemRect.top}px`;
      contentEl.style.width = `${itemRect.width}px`;
      contentEl.style.willChange = 'transform';
      contentEl.style.zIndex = '1000';

      dragStateRef.current = {
         contentEl,
         currentIndex: startIndex,
         itemHeight: itemRect.height,
         latestClientX: event.clientX,
         latestClientY: event.clientY,
         measures: wrapperEls.map((wrapperEl) => {
            const rect = wrapperEl.getBoundingClientRect();
            return { midpointY: rect.top + rect.height / 2 };
         }),
         pointerId: event.pointerId,
         pointerOffsetY: event.clientY - itemRect.top,
         rafId: null,
         scrollEl,
         startScrollTop: scrollEl.scrollTop,
         startClientX: event.clientX,
         startClientY: event.clientY,
         startIndex,
         wrapperEl,
         wrapperEls,
      };
   }

   function handlePointerMove(event: PointerEvent<HTMLDivElement>): void {
      const dragState = dragStateRef.current;
      if (!dragState || dragState.pointerId !== event.pointerId) return;

      event.preventDefault();
      event.stopPropagation();
      dragState.latestClientX = event.clientX;
      dragState.latestClientY = event.clientY;
      if (dragState.rafId !== null) return;

      dragState.rafId = window.requestAnimationFrame(handleDragFrame);
   }

   function handleDragFrame(): void {
      const dragState = dragStateRef.current;
      if (!dragState) return;
      const scrollEdgeSize = 72;
      const maxScrollPerFrame = 18;
      const scrollRect =
         dragState.scrollEl === document.scrollingElement || dragState.scrollEl === document.documentElement
            ? { bottom: window.innerHeight, top: 0 }
            : dragState.scrollEl.getBoundingClientRect();
      const scrollAmount =
         dragState.latestClientY - scrollRect.top < scrollEdgeSize
            ? -Math.ceil(((scrollEdgeSize - (dragState.latestClientY - scrollRect.top)) / scrollEdgeSize) * maxScrollPerFrame)
            : scrollRect.bottom - dragState.latestClientY < scrollEdgeSize
              ? Math.ceil(((scrollEdgeSize - (scrollRect.bottom - dragState.latestClientY)) / scrollEdgeSize) * maxScrollPerFrame)
              : 0;

      const previousScrollTop = dragState.scrollEl.scrollTop;
      if (scrollAmount !== 0) dragState.scrollEl.scrollTop += scrollAmount;
      dragState.rafId = dragState.scrollEl.scrollTop === previousScrollTop ? null : window.requestAnimationFrame(handleDragFrame);
      dragState.contentEl.style.transform = `translate3d(${dragState.latestClientX - dragState.startClientX}px, ${dragState.latestClientY - dragState.startClientY}px, 0)`;

      const scrollOffset = dragState.scrollEl.scrollTop - dragState.startScrollTop;
      const draggedMidpointY = dragState.latestClientY - dragState.pointerOffsetY + dragState.itemHeight / 2;
      let nextIndex = dragState.startIndex;

      for (let index = dragState.startIndex + 1; index < dragState.measures.length; index += 1) {
         if (draggedMidpointY > dragState.measures[index].midpointY - scrollOffset) nextIndex = index;
         else break;
      }

      for (let index = dragState.startIndex - 1; index >= 0; index -= 1) {
         if (draggedMidpointY < dragState.measures[index].midpointY - scrollOffset) nextIndex = index;
         else break;
      }

      if (nextIndex === dragState.currentIndex) return;

      dragState.currentIndex = nextIndex;
      dragState.wrapperEls.forEach((wrapperEl, index) => {
         if (index === dragState.startIndex) return;

         wrapperEl.style.transition = 'transform 120ms ease';
         if (dragState.currentIndex > dragState.startIndex && index > dragState.startIndex && index <= dragState.currentIndex) {
            wrapperEl.style.transform = `translate3d(0, -${dragState.itemHeight}px, 0)`;
         } else if (dragState.currentIndex < dragState.startIndex && index >= dragState.currentIndex && index < dragState.startIndex) {
            wrapperEl.style.transform = `translate3d(0, ${dragState.itemHeight}px, 0)`;
         } else {
            wrapperEl.style.transform = '';
         }
      });
   }

   function handlePointerEnd(event: PointerEvent<HTMLDivElement>): void {
      const dragState = dragStateRef.current;
      if (!dragState || dragState.pointerId !== event.pointerId) return;

      event.preventDefault();
      event.stopPropagation();
      if (dragState.rafId !== null) window.cancelAnimationFrame(dragState.rafId);
      if (event.target instanceof HTMLElement && event.target.hasPointerCapture(event.pointerId)) event.target.releasePointerCapture(event.pointerId);

      dragState.contentEl.removeAttribute('style');
      dragState.wrapperEl.style.height = '';
      dragState.wrapperEls.forEach((wrapperEl) => {
         wrapperEl.style.transform = '';
         wrapperEl.style.transition = '';
      });
      dragStateRef.current = null;

      if (dragState.currentIndex === dragState.startIndex) return;

      const newOrderedItems = [...items];
      const [draggedItem] = newOrderedItems.splice(dragState.startIndex, 1);
      if (!draggedItem) return;

      newOrderedItems.splice(dragState.currentIndex, 0, draggedItem);
      onDrop(newOrderedItems);
   }

   return (
      <div onPointerCancel={handlePointerEnd} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerEnd}>
         {items.map((item, index) => (
            <div key={item.id}>
               <div>
                  {renderItem(item, {
                     'data-drag-handle': '',
                     'data-drag-index': index,
                     style: { cursor: 'grab', touchAction: 'none', userSelect: 'none' },
                  })}
               </div>
            </div>
         ))}
      </div>
   );
}
