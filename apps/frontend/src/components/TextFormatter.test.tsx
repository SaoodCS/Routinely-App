import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import TextFormatter from './TextFormatter';

describe('TextFormatter', () => {
   it('replaces every matching substring', () => {
      const html = renderToStaticMarkup(<TextFormatter fullText="//Buy //milk//" replace={{ text: '//', replacement: '' }} />);

      expect(html).toBe('Buy milk');
   });

   it('highlights text after applying the replacement', () => {
      const html = renderToStaticMarkup(
         <TextFormatter fullText="Buy //milk" replace={{ text: '//', replacement: '' }} highlight={{ text: 'milk', color: 'yellow' }} />,
      );

      expect(html).toBe('Buy <mark style="background-color:yellow;color:inherit">milk</mark>');
   });

   it('highlights the first case-insensitive match', () => {
      const html = renderToStaticMarkup(<TextFormatter fullText="Milk and milk" highlight={{ text: 'milk' }} />);

      expect(html).toBe('<mark style="background-color:#f2ff00;color:inherit">Milk</mark> and milk');
   });
});
