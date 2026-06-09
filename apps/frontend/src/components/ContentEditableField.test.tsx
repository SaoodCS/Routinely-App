// @vitest-environment jsdom

import { act, useState, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ElementUtils } from '../utils';
import ContentEditableField from './ContentEditableField';

const mountedRoots: { container: HTMLDivElement; root: Root }[] = [];

function renderField(element: ReactElement): HTMLDivElement {
   const container = document.createElement('div');
   const root = createRoot(container);
   document.body.append(container);
   mountedRoots.push({ container, root });
   act(() => root.render(element));
   return container;
}

function getTextarea(container: HTMLDivElement): HTMLTextAreaElement {
   const textarea = container.querySelector('textarea');
   expect(textarea).toBeInstanceOf(HTMLTextAreaElement);
   return textarea as HTMLTextAreaElement;
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

describe('ContentEditableField', () => {
   it('uses native content sizing while preserving highlighted display content', () => {
      const container = renderField(
         <ContentEditableField text="A task that wraps">
            <mark>A task that wraps</mark>
         </ContentEditableField>,
      );
      const textarea = getTextarea(container);

      void act(() => textarea.dispatchEvent(new FocusEvent('focusin', { bubbles: true })));
      textarea.value = 'A task that wraps onto another visual line';
      void act(() => textarea.dispatchEvent(new Event('input', { bubbles: true })));

      expect((textarea.style as CSSStyleDeclaration & { fieldSizing: string }).fieldSizing).toBe('content');
      expect(textarea.style.position).toBe('static');
      expect(textarea.rows).toBe(1);
      expect(container.querySelector('[contenteditable]')).toBeNull();
      expect(container.querySelector('mark')).toBeNull();
   });

   it('keeps Enter and blur draft behavior unchanged', () => {
      const handleKeyDown = vi.fn();

      function TestField(): ReactElement {
         const [label, setLabel] = useState('Task');
         return (
            <ContentEditableField text={label} onBlur={(event) => setLabel(event.currentTarget.value)} onKeyDown={handleKeyDown}>
               {label}
            </ContentEditableField>
         );
      }

      const container = renderField(<TestField />);
      const textarea = getTextarea(container);
      void act(() => textarea.dispatchEvent(new FocusEvent('focusin', { bubbles: true })));
      textarea.value = 'Updated task';
      void act(() => textarea.dispatchEvent(new Event('input', { bubbles: true })));
      const enterEvent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter' });
      void act(() => textarea.dispatchEvent(enterEvent));
      void act(() => textarea.dispatchEvent(new FocusEvent('focusout', { bubbles: true })));

      expect(enterEvent.defaultPrevented).toBe(true);
      expect(handleKeyDown).toHaveBeenCalledOnce();
      expect(getTextarea(container).value).toBe('Updated task');
   });

   it('retains caller styles and formats text on input', () => {
      const container = renderField(
         <ContentEditableField text="" onInput={ElementUtils.handleFormatInputOnSpace} style={{ color: 'red', width: '100%' }}>
            {''}
         </ContentEditableField>,
      );
      const wrapper = container.firstElementChild as HTMLSpanElement;
      const textarea = getTextarea(container);

      void act(() => textarea.dispatchEvent(new FocusEvent('focusin', { bubbles: true })));
      textarea.value = 'i ';
      textarea.setSelectionRange(2, 2);
      void act(() => textarea.dispatchEvent(new Event('input', { bubbles: true })));

      expect(wrapper.style.color).toBe('red');
      expect(wrapper.style.width).toBe('100%');
      expect(wrapper.style.minHeight).toBe('1em');
      expect(textarea.style.background).toBe('transparent');
      expect(textarea.style.minHeight).toBe('inherit');
      expect(textarea.style.overflow).toBe('hidden');
      expect(textarea.style.resize).toBe('none');
      expect(textarea.value).toBe('I ');
   });
});
