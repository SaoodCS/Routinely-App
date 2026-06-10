// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import PWADialog from './PWADialog';

const mountedRoots: { container: HTMLDivElement; root: Root }[] = [];

function createMemoryStorage(): Storage {
   const values = new Map<string, string>();
   return {
      get length() {
         return values.size;
      },
      clear: () => values.clear(),
      getItem: (key) => values.get(key) ?? null,
      key: (index) => Array.from(values.keys())[index] ?? null,
      removeItem: (key) => {
         values.delete(key);
      },
      setItem: (key, value) => values.set(key, value),
   };
}

class StorageEventMock extends Event {
   readonly key: string | null;
   readonly newValue: string | null;
   readonly storageArea: Storage | null;

   constructor(type: string, eventInitDict: StorageEventInit = {}) {
      super(type);
      this.key = eventInitDict.key ?? null;
      this.newValue = eventInitDict.newValue ?? null;
      this.storageArea = eventInitDict.storageArea ?? null;
   }
}

function mockStandaloneDisplay(matches: boolean): void {
   vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
         addEventListener: vi.fn(),
         addListener: vi.fn(),
         dispatchEvent: vi.fn(),
         matches,
         media: '(display-mode: standalone)',
         onchange: null,
         removeEventListener: vi.fn(),
         removeListener: vi.fn(),
      }),
   );
}

function renderDialog(): void {
   const container = document.createElement('div');
   const root = createRoot(container);
   document.body.append(container);
   mountedRoots.push({ container, root });
   act(() => root.render(<PWADialog />));
}

beforeAll(() => {
   (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
   Object.defineProperty(window, 'localStorage', { configurable: true, value: createMemoryStorage() });
   Object.defineProperty(globalThis, 'StorageEvent', { configurable: true, value: StorageEventMock });
});

afterEach(() => {
   for (const { container, root } of mountedRoots.splice(0)) {
      act(() => root.unmount());
      container.remove();
   }
   window.localStorage.clear();
   vi.unstubAllGlobals();
});

describe('PWADialog', () => {
   it('shows installation guidance and remembers when it is closed', () => {
      mockStandaloneDisplay(false);
      renderDialog();
      const dialog = document.body.querySelector('[role="dialog"]');
      const closeButton = Array.from(document.body.querySelectorAll('button')).find((button) => button.textContent === 'Close');

      expect(dialog?.textContent).toContain('Install this app as a PWA');
      expect(dialog?.textContent).toContain('To access all features of this app, install it as a PWA.');
      expect(closeButton).toBeInstanceOf(HTMLButtonElement);

      void act(() => closeButton?.dispatchEvent(new MouseEvent('click', { bubbles: true })));

      expect(window.localStorage.getItem('pwa-dialog-seen')).toBe('true');
   });

   it('does not open after the dialog has been seen', () => {
      window.localStorage.setItem('pwa-dialog-seen', 'true');
      mockStandaloneDisplay(false);

      renderDialog();

      expect(document.body.querySelector('[role="dialog"]')).toBeNull();
   });

   it('does not open when the app is installed', () => {
      mockStandaloneDisplay(true);

      renderDialog();

      expect(document.body.querySelector('[role="dialog"]')).toBeNull();
   });
});
