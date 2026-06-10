// @vitest-environment jsdom

import { act, useCallback, useRef, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import useHideOnScroll from './useHideOnScroll';

const mountedRoots: { container: HTMLDivElement; root: Root }[] = [];

class ResizeObserverMock implements ResizeObserver {
   disconnect(): void {}

   observe(): void {}

   unobserve(): void {}
}

function HideOnScrollConsumer({ hide = 'up' }: { hide?: 'up' | 'down' }): ReactElement {
   const scrollElRef = useRef<HTMLDivElement | null>(null);
   const { ref, hideOnScrollElHeight } = useHideOnScroll(scrollElRef, hide);
   const setScrollRef = useCallback((element: HTMLDivElement | null) => {
      scrollElRef.current = element;
      if (!element) return;
      Object.defineProperties(element, {
         clientHeight: { configurable: true, value: 100 },
         clientWidth: { configurable: true, value: 90 },
         offsetWidth: { configurable: true, value: 100 },
         scrollHeight: { configurable: true, value: 500 },
      });
   }, []);
   const setHiddenRef = useCallback(
      (element: HTMLDivElement | null) => {
         ref.current = element;
         if (element) Object.defineProperty(element, 'offsetHeight', { configurable: true, value: 40 });
      },
      [ref],
   );

   return (
      <div ref={setScrollRef}>
         <div data-hidden-element ref={setHiddenRef}>
            Toolbar
         </div>
         <output>{hideOnScrollElHeight}</output>
      </div>
   );
}

function renderConsumer(hide?: 'up' | 'down'): { hiddenElement: HTMLDivElement; scrollElement: HTMLDivElement } {
   const container = document.createElement('div');
   const root = createRoot(container);
   document.body.append(container);
   mountedRoots.push({ container, root });
   act(() => root.render(<HideOnScrollConsumer hide={hide} />));
   return {
      hiddenElement: container.querySelector('[data-hidden-element]') as HTMLDivElement,
      scrollElement: container.firstElementChild as HTMLDivElement,
   };
}

beforeAll(() => {
   (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
   vi.stubGlobal('ResizeObserver', ResizeObserverMock);
});

afterEach(() => {
   for (const { container, root } of mountedRoots.splice(0)) {
      act(() => root.unmount());
      container.remove();
   }
});

afterAll(() => {
   vi.unstubAllGlobals();
});

describe('useHideOnScroll', () => {
   it('measures the hidden element and moves it up when scrolling down', () => {
      const { hiddenElement, scrollElement } = renderConsumer();

      expect(hiddenElement.parentElement?.querySelector('output')?.textContent).toBe('40');

      scrollElement.scrollTop = 20;
      void act(() => scrollElement.dispatchEvent(new Event('scroll')));

      expect(hiddenElement.style.transform).toBe('translate3d(0, -48px, 0)');
      expect(hiddenElement.style.transition).toBe('transform 300ms ease-out');
   });

   it('moves the hidden element down when configured for downward hiding', () => {
      const { hiddenElement, scrollElement } = renderConsumer('down');

      scrollElement.scrollTop = 20;
      void act(() => scrollElement.dispatchEvent(new Event('scroll')));

      expect(hiddenElement.style.transform).toBe('translate3d(0, 48px, 0)');
   });

   it('shows the hidden element again when scrolling up', () => {
      const { hiddenElement, scrollElement } = renderConsumer();
      scrollElement.scrollTop = 20;
      void act(() => scrollElement.dispatchEvent(new Event('scroll')));

      scrollElement.scrollTop = 10;
      void act(() => scrollElement.dispatchEvent(new Event('scroll')));

      expect(hiddenElement.style.transform).toBe('translate3d(0, 0px, 0)');
   });
});
