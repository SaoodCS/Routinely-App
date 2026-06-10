// @vitest-environment jsdom

import { StrictMode, act, useCallback, useRef, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import useScrollSaver from './useScrollSaver';

const STORAGE_KEY = 'test-scroll.scrollPos';
const mountedRoots: { container: HTMLDivElement; root: Root }[] = [];

function ScrollContainer({ contentReady = true }: { contentReady?: boolean }): ReactElement {
   const { ref } = useScrollSaver('test-scroll');
   const scrollTopRef = useRef(0);
   const setRef = useCallback(
      (element: HTMLDivElement | null) => {
         ref.current = element;
         if (!element) return;
         Object.defineProperty(element, 'scrollTop', {
            configurable: true,
            get: () => scrollTopRef.current,
            set: (scrollTop: number) => {
               const maxScrollTop = Number(element.dataset.maxScrollTop);
               scrollTopRef.current = Math.min(scrollTop, maxScrollTop);
            },
         });
      },
      [ref],
   );

   return (
      <div ref={setRef} data-max-scroll-top={contentReady ? 500 : 0}>
         {contentReady && <div>Scrollable content</div>}
      </div>
   );
}

function renderScrollContainer(
   contentReady: boolean = true,
   strictMode: boolean = false,
): {
   element: HTMLDivElement;
   rerender: (nextContentReady: boolean) => Promise<void>;
   root: Root;
} {
   const container = document.createElement('div');
   const root = createRoot(container);
   const renderElement = (nextContentReady: boolean): ReactElement =>
      strictMode ? (
         <StrictMode>
            <ScrollContainer contentReady={nextContentReady} />
         </StrictMode>
      ) : (
         <ScrollContainer contentReady={nextContentReady} />
      );
   document.body.append(container);
   mountedRoots.push({ container, root });
   act(() => root.render(renderElement(contentReady)));
   return {
      element: container.firstElementChild as HTMLDivElement,
      rerender: async (nextContentReady) => {
         await act(async () => {
            root.render(renderElement(nextContentReady));
            await Promise.resolve();
         });
      },
      root,
   };
}

beforeAll(() => {
   (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(() => {
   for (const { container, root } of mountedRoots.splice(0)) {
      act(() => root.unmount());
      container.remove();
   }
   sessionStorage.clear();
});

describe('useScrollSaver', () => {
   it('restores the saved scroll position', () => {
      sessionStorage.setItem(STORAGE_KEY, '120');

      const { element } = renderScrollContainer();

      expect(element.scrollTop).toBe(120);
   });

   it('saves the scroll position when scrolling ends', () => {
      const { element } = renderScrollContainer();
      element.scrollTop = 80;

      void act(() => element.dispatchEvent(new Event('scroll')));
      expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();

      void act(() => element.dispatchEvent(new Event('scrollend')));
      expect(sessionStorage.getItem(STORAGE_KEY)).toBe('80');
   });

   it('saves the latest scroll position on unmount', () => {
      const { element, root } = renderScrollContainer();
      element.scrollTop = 60;

      act(() => root.unmount());

      expect(sessionStorage.getItem(STORAGE_KEY)).toBe('60');
   });

   it('restores after delayed content without overwriting the saved position', async () => {
      sessionStorage.setItem(STORAGE_KEY, '120');
      const { element, rerender } = renderScrollContainer(false, true);

      expect(element.scrollTop).toBe(0);
      expect(sessionStorage.getItem(STORAGE_KEY)).toBe('120');

      await rerender(true);

      expect(element.scrollTop).toBe(120);
      expect(sessionStorage.getItem(STORAGE_KEY)).toBe('120');
   });
});
