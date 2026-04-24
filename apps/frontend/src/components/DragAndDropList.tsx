import type { CSSProperties, JSX, PointerEvent, PointerEventHandler, ReactNode } from 'react';
const dragStates = new WeakMap<
   HTMLDivElement,
   {
      contentEl: HTMLDivElement;
      currentIndex: number;
      itemHeight: number;
      latestClientX: number;
      latestClientY: number;
      measures: { height: number; midpointY: number; top: number }[];
      pointerId: number;
      pointerOffsetY: number;
      rafId: number | null;
      startClientX: number;
      startClientY: number;
      startIndex: number;
      wrapperEl: HTMLDivElement;
      wrapperEls: HTMLDivElement[];
   }
>();

interface T_DragAndDropListProps<TItem extends { id: number | string }> {
   items: TItem[];
   onDrop: (newOrderedItems: TItem[]) => void;
   renderItem: (
      item: TItem,
      dragElProps: {
         onPointerCancel: PointerEventHandler<HTMLElement>;
         onPointerDown: PointerEventHandler<HTMLElement>;
         onPointerMove: PointerEventHandler<HTMLElement>;
         onPointerUp: PointerEventHandler<HTMLElement>;
         style: CSSProperties;
      },
   ) => ReactNode;
}

export default function DragAndDropList<TItem extends { id: number | string }>(props: T_DragAndDropListProps<TItem>): JSX.Element {
   const { items, onDrop, renderItem } = props;

   function getListEl(handleEl: HTMLElement): HTMLDivElement | null {
      const listEl = handleEl.closest('[data-drag-and-drop-list]');
      return listEl instanceof HTMLDivElement ? listEl : null;
   }

   function getListElements(listEl: HTMLDivElement): { contentEls: HTMLDivElement[]; wrapperEls: HTMLDivElement[] } | null {
      const wrapperEls = Array.from(listEl.children).filter((element): element is HTMLDivElement => element instanceof HTMLDivElement);
      const contentEls = wrapperEls
         .map((wrapperEl) => wrapperEl.firstElementChild)
         .filter((element): element is HTMLDivElement => element instanceof HTMLDivElement);
      return wrapperEls.length === items.length && contentEls.length === items.length ? { contentEls, wrapperEls } : null;
   }

   function handlePointerDown(event: PointerEvent<HTMLElement>, startIndex: number): void {
      const listEl = getListEl(event.currentTarget);
      if (event.button !== 0 || !listEl || dragStates.has(listEl)) return;

      event.preventDefault();
      event.stopPropagation();

      const listElements = getListElements(listEl);
      if (!items[startIndex] || !listElements) return;

      const { contentEls, wrapperEls } = listElements;
      const wrapperEl = wrapperEls[startIndex];
      const contentEl = contentEls[startIndex];
      if (!wrapperEl || !contentEl) return;

      const measures = wrapperEls.map((wrapperEl) => {
         const rect = wrapperEl.getBoundingClientRect();
         return { height: rect.height, midpointY: rect.top + rect.height / 2, top: rect.top };
      });

      const itemRect = contentEl.getBoundingClientRect();
      try {
         event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
         // Synthetic pointer events used by browser checks may not register as active pointers.
      }
      wrapperEl.style.height = `${itemRect.height}px`;
      contentEl.style.height = `${itemRect.height}px`;
      contentEl.style.left = `${itemRect.left}px`;
      contentEl.style.position = 'fixed';
      contentEl.style.top = `${itemRect.top}px`;
      contentEl.style.width = `${itemRect.width}px`;
      contentEl.style.zIndex = '1000';
      contentEl.style.willChange = 'transform';
      contentEl.style.cursor = 'grabbing';

      dragStates.set(listEl, {
         contentEl,
         currentIndex: startIndex,
         itemHeight: itemRect.height,
         latestClientX: event.clientX,
         latestClientY: event.clientY,
         measures,
         pointerId: event.pointerId,
         pointerOffsetY: event.clientY - itemRect.top,
         rafId: null,
         startClientX: event.clientX,
         startClientY: event.clientY,
         startIndex,
         wrapperEl,
         wrapperEls,
      });
   }

   function handlePointerMove(event: PointerEvent<HTMLElement>): void {
      const listEl = getListEl(event.currentTarget);
      const dragState = listEl ? dragStates.get(listEl) : undefined;
      if (!listEl || !dragState || dragState.pointerId !== event.pointerId) return;

      event.preventDefault();
      event.stopPropagation();
      dragState.latestClientX = event.clientX;
      dragState.latestClientY = event.clientY;
      if (dragState.rafId !== null) return;

      dragState.rafId = window.requestAnimationFrame(() => {
         const dragState = dragStates.get(listEl);
         if (!dragState) return;

         dragState.rafId = null;
         dragState.contentEl.style.transform = `translate3d(${dragState.latestClientX - dragState.startClientX}px, ${dragState.latestClientY - dragState.startClientY}px, 0)`;

         const draggedMidpointY = dragState.latestClientY - dragState.pointerOffsetY + dragState.itemHeight / 2;
         let nextIndex = dragState.startIndex;

         for (let index = dragState.startIndex + 1; index < dragState.measures.length; index += 1) {
            if (draggedMidpointY > dragState.measures[index].midpointY) nextIndex = index;
            else break;
         }

         for (let index = dragState.startIndex - 1; index >= 0; index -= 1) {
            if (draggedMidpointY < dragState.measures[index].midpointY) {
               nextIndex = index;
            } else break;
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

   function handlePointerEnd(event: PointerEvent<HTMLElement>): void {
      const listEl = getListEl(event.currentTarget);
      const dragState = listEl ? dragStates.get(listEl) : undefined;
      if (!listEl || !dragState || dragState.pointerId !== event.pointerId) return;

      event.preventDefault();
      event.stopPropagation();
      if (dragState.rafId !== null) window.cancelAnimationFrame(dragState.rafId);

      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      dragState.contentEl.style.cursor = '';
      dragState.contentEl.style.height = '';
      dragState.contentEl.style.left = '';
      dragState.contentEl.style.position = '';
      dragState.contentEl.style.top = '';
      dragState.contentEl.style.transform = '';
      dragState.contentEl.style.width = '';
      dragState.contentEl.style.willChange = '';
      dragState.contentEl.style.zIndex = '';
      dragState.wrapperEl.style.height = '';

      dragState.wrapperEls.forEach((wrapperEl) => {
         wrapperEl.style.transform = '';
         wrapperEl.style.transition = '';
      });

      dragStates.delete(listEl);

      if (dragState.currentIndex === dragState.startIndex) return;

      const newOrderedItems = [...items];
      const [draggedItem] = newOrderedItems.splice(dragState.startIndex, 1);
      if (!draggedItem) return;

      newOrderedItems.splice(dragState.currentIndex, 0, draggedItem);
      onDrop(newOrderedItems);
   }

   return (
      <div data-drag-and-drop-list="">
         {items.map((item, index) => (
            <div key={item.id}>
               {renderItem(item, {
                  onPointerCancel: handlePointerEnd,
                  onPointerDown: (event) => handlePointerDown(event, index),
                  onPointerMove: handlePointerMove,
                  onPointerUp: handlePointerEnd,
                  style: { cursor: 'grab', touchAction: 'none', userSelect: 'none' },
               })}
            </div>
         ))}
      </div>
   );
}
