// @vitest-environment jsdom

import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import useLocalStorage from './useLocalStorage';

const STORAGE_KEY = 'test-local-storage';
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

function StorageConsumer({ index }: { index: number }): ReactElement {
   const [value, setValue] = useLocalStorage(STORAGE_KEY, 'initial');
   return (
      <div>
         <output data-index={index}>{value}</output>
         <button onClick={() => setValue('updated')}>Update {index}</button>
      </div>
   );
}

function renderConsumers(count: number = 1): HTMLDivElement {
   const container = document.createElement('div');
   const root = createRoot(container);
   document.body.append(container);
   mountedRoots.push({ container, root });
   act(() =>
      root.render(
         <>
            {Array.from({ length: count }, (_, index) => (
               <StorageConsumer index={index} key={index} />
            ))}
         </>,
      ),
   );
   return container;
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
});

describe('useLocalStorage', () => {
   it('reads an existing stored value', () => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify('stored'));

      const container = renderConsumers();

      expect(container.querySelector('output')?.textContent).toBe('stored');
   });

   it('persists updates and synchronizes consumers', () => {
      const container = renderConsumers(2);
      const updateButton = container.querySelector('button');

      void act(() => updateButton?.dispatchEvent(new MouseEvent('click', { bubbles: true })));

      expect(window.localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify('updated'));
      expect(Array.from(container.querySelectorAll('output'), (output) => output.textContent)).toEqual(['updated', 'updated']);
   });
});
