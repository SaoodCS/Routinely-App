import type { CSSProperties, JSX, PointerEvent, ReactNode } from 'react';
import { useRef } from 'react';

interface T_DragAndDropListProps<TItem extends { id: number | string }> {
   items: TItem[];
   onDrop: (newOrderedItems: TItem[]) => void;
   renderItem: (
      item: TItem,
      dragElProps: {
         'data-drag-handle': string;
         'data-drag-index': number;
         style: CSSProperties;
      },
   ) => ReactNode;
}

type T_DragState = {
   contentEl: HTMLDivElement;
   currentIndex: number;
   itemHeight: number;
   latestClientX: number;
   latestClientY: number;
   measures: { midpointY: number }[];
   pointerId: number;
   pointerOffsetY: number;
   rafId: number | null;
   startClientX: number;
   startClientY: number;
   startIndex: number;
   wrapperEl: HTMLDivElement;
   wrapperEls: HTMLDivElement[];
};

const dragHandleStyle: CSSProperties = { cursor: 'grab', touchAction: 'none', userSelect: 'none' };

export default function DragAndDropList<TItem extends { id: number | string }>(props: T_DragAndDropListProps<TItem>): JSX.Element {
   const { items, onDrop, renderItem } = props;
   const dragStateRef = useRef<T_DragState | null>(null);

   function getListElements(listEl: HTMLDivElement): { contentEls: HTMLDivElement[]; wrapperEls: HTMLDivElement[] } | null {
      const wrapperEls = Array.from(listEl.children).filter((element): element is HTMLDivElement => element instanceof HTMLDivElement);
      const contentEls = wrapperEls
         .map((wrapperEl) => wrapperEl.firstElementChild)
         .filter((element): element is HTMLDivElement => element instanceof HTMLDivElement);

      return wrapperEls.length === items.length && contentEls.length === items.length ? { contentEls, wrapperEls } : null;
   }

   function getHandleEl(event: PointerEvent<HTMLDivElement>): HTMLElement | null {
      const target = event.target;
      if (!(target instanceof Element)) return null;

      const handleEl = target.closest('[data-drag-handle]');
      return handleEl instanceof HTMLElement && event.currentTarget.contains(handleEl) ? handleEl : null;
   }

   function handlePointerDown(event: PointerEvent<HTMLDivElement>): void {
      const handleEl = getHandleEl(event);
      const startIndex = Number(handleEl?.dataset.dragIndex);
      if (event.button !== 0 || !handleEl || !Number.isInteger(startIndex) || dragStateRef.current) return;

      event.preventDefault();
      event.stopPropagation();

      const listElements = getListElements(event.currentTarget);
      if (!items[startIndex] || !listElements) return;

      const { contentEls, wrapperEls } = listElements;
      const wrapperEl = wrapperEls[startIndex];
      const contentEl = contentEls[startIndex];
      if (!wrapperEl || !contentEl) return;

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

      dragState.rafId = window.requestAnimationFrame(() => {
         dragState.rafId = null;
         dragState.contentEl.style.transform = `translate3d(${dragState.latestClientX - dragState.startClientX}px, ${dragState.latestClientY - dragState.startClientY}px, 0)`;

         const draggedMidpointY = dragState.latestClientY - dragState.pointerOffsetY + dragState.itemHeight / 2;
         let nextIndex = dragState.startIndex;

         for (let index = dragState.startIndex + 1; index < dragState.measures.length; index += 1) {
            if (draggedMidpointY > dragState.measures[index].midpointY) nextIndex = index;
            else break;
         }

         for (let index = dragState.startIndex - 1; index >= 0; index -= 1) {
            if (draggedMidpointY < dragState.measures[index].midpointY) nextIndex = index;
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
                     style: dragHandleStyle,
                  })}
               </div>
            </div>
         ))}
      </div>
   );
}
