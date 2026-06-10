// @vitest-environment jsdom

import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import SpinnerLoader from './SpinnerLoader';

const mountedRoots: { container: HTMLDivElement; root: Root }[] = [];

function renderSpinner(element: ReactElement): HTMLDivElement {
   const container = document.createElement('div');
   const root = createRoot(container);
   document.body.append(container);
   mountedRoots.push({ container, root });
   act(() => root.render(element));
   return container;
}

beforeAll(() => {
   (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(() => {
   for (const { container, root } of mountedRoots.splice(0)) {
      act(() => root.unmount());
      container.remove();
   }
});

describe('SpinnerLoader', () => {
   it('forwards progress props when rendered inline', () => {
      const container = renderSpinner(<SpinnerLoader aria-label="Loading tasks" size={24} />);
      const progress = container.querySelector('[role="progressbar"]');

      expect(progress).toBeInstanceOf(HTMLSpanElement);
      expect(progress?.getAttribute('aria-label')).toBe('Loading tasks');
      expect((progress as HTMLSpanElement).style.width).toBe('24px');
      expect((progress as HTMLSpanElement).style.height).toBe('24px');
   });

   it('centers the progress indicator in a translucent full-page overlay', () => {
      const container = renderSpinner(<SpinnerLoader fullPage transluscent />);
      const overlay = container.firstElementChild;

      expect(overlay).toBeInstanceOf(HTMLDivElement);
      expect(overlay?.querySelector('[role="progressbar"]')).not.toBeNull();
      expect(window.getComputedStyle(overlay!).position).toBe('fixed');
      expect(window.getComputedStyle(overlay!).backgroundColor).toBe('rgba(255, 255, 255, 0.184)');
   });
});
