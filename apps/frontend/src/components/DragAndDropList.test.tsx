// @vitest-environment jsdom

import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import DragAndDropList from './DragAndDropList';

const items = [{ id: 'before' }, { id: 'tall' }, { id: 'after' }];
const mountedRoots: { container: HTMLDivElement; root: Root }[] = [];

function renderList(onDrop: (orderedItems: typeof items) => void): HTMLDivElement {
   const container = document.createElement('div');
   const root = createRoot(container);
   document.body.append(container);
   mountedRoots.push({ container, root });
   act(() =>
      root.render(
         <DragAndDropList
            items={items}
            onDrop={onDrop}
            renderItem={(item, dragElProps): ReactElement => (
               <div data-item-id={item.id}>
                  <button {...dragElProps}>Drag</button>
               </div>
            )}
         />,
      ),
   );
   return container.firstElementChild as HTMLDivElement;
}

function setRect(element: Element, top: number, height: number): void {
   vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      bottom: top + height,
      height,
      left: 0,
      right: 100,
      top,
      width: 100,
      x: 0,
      y: top,
      toJSON: () => ({}),
   });
}

function dispatchPointer(element: Element, type: string, clientY: number): void {
   const event = new MouseEvent(type, { bubbles: true, button: 0, cancelable: true, clientX: 10, clientY });
   Object.defineProperty(event, 'pointerId', { value: 1 });
   void act(() => element.dispatchEvent(event));
}

function prepareTallItemDrag(list: HTMLDivElement): { dragHandle: HTMLButtonElement; runFrame: () => void } {
   const wrappers = Array.from(list.children);
   const tallContent = wrappers[1].firstElementChild;
   const dragHandle = tallContent?.querySelector('button');
   expect(tallContent).toBeInstanceOf(HTMLDivElement);
   expect(dragHandle).toBeInstanceOf(HTMLButtonElement);
   setRect(wrappers[0], 0, 100);
   setRect(wrappers[1], 100, 300);
   setRect(wrappers[2], 400, 100);
   setRect(tallContent!, 100, 300);

   let frame: FrameRequestCallback | undefined;
   vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frame = callback;
      return 1;
   });
   vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);

   return {
      dragHandle: dragHandle!,
      runFrame: () => {
         expect(frame).toBeDefined();
         act(() => frame!(0));
      },
   };
}

beforeAll(() => {
   (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
   Object.defineProperties(HTMLElement.prototype, {
      hasPointerCapture: { configurable: true, value: () => true },
      releasePointerCapture: { configurable: true, value: () => undefined },
      setPointerCapture: { configurable: true, value: () => undefined },
   });
});

afterEach(() => {
   vi.restoreAllMocks();
   for (const { container, root } of mountedRoots.splice(0)) {
      act(() => root.unmount());
      container.remove();
   }
});

describe('DragAndDropList', () => {
   it('moves a tall item down when its top reaches the next compacted midpoint', () => {
      const onDrop = vi.fn();
      const list = renderList(onDrop);
      const { dragHandle, runFrame } = prepareTallItemDrag(list);

      dispatchPointer(dragHandle, 'pointerdown', 110);
      dispatchPointer(dragHandle, 'pointermove', 160);
      runFrame();
      dispatchPointer(dragHandle, 'pointerup', 160);

      expect(onDrop).toHaveBeenCalledWith([items[0], items[2], items[1]]);
   });

   it('moves a tall item up when its top crosses the previous midpoint', () => {
      const onDrop = vi.fn();
      const list = renderList(onDrop);
      const { dragHandle, runFrame } = prepareTallItemDrag(list);

      dispatchPointer(dragHandle, 'pointerdown', 110);
      dispatchPointer(dragHandle, 'pointermove', 59);
      runFrame();
      dispatchPointer(dragHandle, 'pointerup', 59);

      expect(onDrop).toHaveBeenCalledWith([items[1], items[0], items[2]]);
   });
});
