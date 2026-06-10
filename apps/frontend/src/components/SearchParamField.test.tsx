// @vitest-environment jsdom

import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, useLocation } from 'react-router';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import SearchParamField from './SearchParamField';

const mountedRoots: { container: HTMLDivElement; root: Root }[] = [];

function LocationProbe(): ReactElement {
   const location = useLocation();
   return <output data-location>{location.search}</output>;
}

function renderField(initialEntry: string): HTMLDivElement {
   const container = document.createElement('div');
   const root = createRoot(container);
   document.body.append(container);
   mountedRoots.push({ container, root });
   act(() =>
      root.render(
         <MemoryRouter initialEntries={[initialEntry]}>
            <SearchParamField placeholder="Find tasks" />
            <LocationProbe />
         </MemoryRouter>,
      ),
   );
   return container;
}

function getInput(container: HTMLDivElement): HTMLInputElement {
   const input = container.querySelector('input');
   expect(input).toBeInstanceOf(HTMLInputElement);
   return input as HTMLInputElement;
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

describe('SearchParamField', () => {
   it('reads and updates the search parameter while preserving other parameters', () => {
      const container = renderField('/tasks?search=milk&filter=open');
      const input = getInput(container);

      expect(input.value).toBe('milk');
      expect(input.placeholder).toBe('Find tasks');

      const setInputValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.bind(input);
      expect(setInputValue).toBeDefined();
      void act(() => {
         setInputValue?.('bread');
         input.dispatchEvent(new Event('input', { bubbles: true }));
      });

      expect(container.querySelector('[data-location]')?.textContent).toBe('?search=bread&filter=open');
   });

   it('removes the search parameter from the clear button', () => {
      const container = renderField('/tasks?search=milk&filter=open');
      const clearButton = container.querySelector('button');

      expect(clearButton).toBeInstanceOf(HTMLButtonElement);
      void act(() => clearButton?.dispatchEvent(new MouseEvent('click', { bubbles: true })));

      expect(getInput(container).value).toBe('');
      expect(container.querySelector('[data-location]')?.textContent).toBe('?filter=open');
      expect(container.querySelector('button')).toBeNull();
   });
});
