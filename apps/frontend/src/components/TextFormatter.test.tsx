// @vitest-environment jsdom

import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import TextFormatter from './TextFormatter';

const mountedRoots: { container: HTMLDivElement; root: Root }[] = [];

function renderFormatter(element: ReactElement): HTMLDivElement {
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

describe('TextFormatter', () => {
   it('returns formatted text directly when no active formatting rules exist', () => {
      const result = TextFormatter({
         fullText: '//Buy milk',
         rules: [
            { text: '//', replacement: '' },
            { text: '', style: { backgroundColor: 'yellow' } },
         ],
      });

      expect(result).toBe('Buy milk');
   });

   it('returns formatted text directly when no rule matches', () => {
      const result = TextFormatter({
         fullText: 'Buy milk',
         rules: [{ text: 'bread', style: { backgroundColor: 'yellow' } }],
      });

      expect(result).toBe('Buy milk');
   });

   it('applies every replacement to all matching substrings', () => {
      const html = renderToStaticMarkup(
         <TextFormatter
            fullText="//Buy **milk** and //bread"
            rules={[
               { text: '//', replacement: '' },
               { text: '**', replacement: '' },
            ]}
         />,
      );

      expect(html).toBe('Buy milk and bread');
   });

   it('applies replacements case-insensitively by default', () => {
      const html = renderToStaticMarkup(<TextFormatter fullText="Milk, milk, MILK" rules={[{ text: 'milk', replacement: 'oat' }]} />);

      expect(html).toBe('oat, oat, oat');
   });

   it('applies highlight styles to every configured text after replacements', () => {
      const html = renderToStaticMarkup(
         <TextFormatter
            fullText="Buy //Milk and bread, then milk"
            rules={[
               { text: '//', replacement: '' },
               { text: 'milk', style: { backgroundColor: 'yellow' } },
               { text: 'bread', style: { backgroundColor: 'orange' } },
            ]}
         />,
      );

      expect(html).toBe(
         'Buy <span style="background-color:yellow">Milk</span> and <span style="background-color:orange">bread</span>, then <span style="background-color:yellow">milk</span>',
      );
   });

   it('only formats exact-case matches when case-sensitive', () => {
      const html = renderToStaticMarkup(
         <TextFormatter
            fullText="Milk, milk, MILK"
            rules={[{ text: 'milk', style: { backgroundColor: 'yellow' }, caseSensitive: true }]}
         />,
      );

      expect(html).toBe('Milk, <span style="background-color:yellow">milk</span>, MILK');
   });

   it('does not expose separate formatting props', () => {
      // @ts-expect-error Formatting is configured through rules.
      const formatter = <TextFormatter fullText="Milk" styles={[{ text: 'milk', style: {} }]} />;

      expect(formatter).toBeDefined();
   });

   it('combines styles and a click action for matching text', () => {
      const handleClick = vi.fn();
      const container = renderFormatter(
         <TextFormatter
            fullText="Buy milk and bread"
            rules={[
               { text: 'milk', style: { cursor: 'pointer', textDecoration: 'underline' }, action: handleClick },
               { text: 'bread', style: { fontWeight: 700 } },
            ]}
         />,
      );
      const milk = Array.from(container.querySelectorAll<HTMLSpanElement>('span[role="button"]')).find((element) => element.textContent === 'milk');
      const bread = Array.from(container.querySelectorAll('span')).find((element) => element.textContent === 'bread');

      expect(milk?.getAttribute('role')).toBe('button');
      expect(milk?.tabIndex).toBe(-1);
      expect(milk?.style.cursor).toBe('pointer');
      expect(milk?.style.textDecoration).toBe('underline');
      expect(milk?.style.pointerEvents).toBe('auto');
      expect(milk?.style.position).toBe('relative');
      expect(milk?.style.zIndex).toBe('1');
      expect(bread?.style.fontWeight).toBe('700');

      void act(() => milk?.dispatchEvent(new MouseEvent('click', { bubbles: true })));

      expect(handleClick).toHaveBeenCalledOnce();
      expect(handleClick).toHaveBeenCalledWith('milk');
   });

   it('keeps each repeated click match independent', () => {
      const handleClick = vi.fn();
      const container = renderFormatter(<TextFormatter fullText="Milk then milk" rules={[{ text: 'milk', action: handleClick }]} />);
      const matches = container.querySelectorAll('span[role="button"]');

      void act(() => matches[0].dispatchEvent(new MouseEvent('click', { bubbles: true })));
      void act(() => matches[1].dispatchEvent(new MouseEvent('click', { bubbles: true })));

      expect(handleClick).toHaveBeenNthCalledWith(1, 'Milk');
      expect(handleClick).toHaveBeenNthCalledWith(2, 'milk');
   });

   it('preserves overlapping styles without wrapping unformatted text', () => {
      const html = renderToStaticMarkup(
         <TextFormatter
            fullText="abcde"
            rules={[
               { text: 'abc', style: { color: 'red' } },
               { text: 'bcd', style: { fontWeight: 700 } },
            ]}
         />,
      );

      expect(html).toBe('<span style="color:red">a</span><span style="color:red;font-weight:700">bc</span><span style="font-weight:700">d</span>e');
   });
});
