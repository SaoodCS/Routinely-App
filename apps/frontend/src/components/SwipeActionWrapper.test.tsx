// @vitest-environment jsdom

import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import SwipeActionWrapper from './SwipeActionWrapper';

const mountedRoots: { container: HTMLDivElement; root: Root }[] = [];

function renderWrapper(children: ReactNode = <div>Task</div>): HTMLDivElement {
   const container = document.createElement('div');
   const root = createRoot(container);
   document.body.append(container);
   mountedRoots.push({ container, root });
   act(() => root.render(<SwipeActionWrapper leftAction={{ label: 'Toggle', onAction: vi.fn() }}>{children}</SwipeActionWrapper>));
   return container.firstElementChild!.lastElementChild as HTMLDivElement;
}

function dispatchPointer(element: Element, type: string, clientX: number): void {
   const event = new MouseEvent(type, { bubbles: true, button: 0, cancelable: true, clientX });
   Object.defineProperty(event, 'pointerId', { value: 1 });
   void act(() => element.dispatchEvent(event));
}

beforeAll(() => {
   (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
   Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', { configurable: true, value: () => undefined });
});

afterEach(() => {
   vi.restoreAllMocks();
   for (const { container, root } of mountedRoots.splice(0)) {
      act(() => root.unmount());
      container.remove();
   }
});

describe('SwipeActionWrapper', () => {
   it('does not start a swipe from elements with button role', () => {
      const setPointerCapture = vi.spyOn(HTMLElement.prototype, 'setPointerCapture');
      const content = renderWrapper(<span role="button">Action</span>);
      const action = content.querySelector('[role="button"]')!;

      dispatchPointer(action, 'pointerdown', 0);

      expect(setPointerCapture).not.toHaveBeenCalled();
   });
});
