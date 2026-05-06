// @vitest-environment jsdom

import { act, useState, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { InputUtils } from '../utils';
import ContentEditableInput from './ContentEditableInput';

const mountedRoots: { container: HTMLDivElement; root: Root }[] = [];

function renderContentEditableInput(element: ReactElement): HTMLDivElement {
   const container = document.createElement('div');
   const root = createRoot(container);
   document.body.append(container);
   mountedRoots.push({ container, root });
   act(() => {
      root.render(element);
   });
   return container;
}

function getInputElement(container: HTMLDivElement): HTMLInputElement {
   const inputElement = container.querySelector('input');
   if (!inputElement) throw new Error('Input element not found');
   return inputElement;
}

beforeAll(() => {
   (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(() => {
   for (const { container, root } of mountedRoots.splice(0)) {
      act(() => {
         root.unmount();
      });
      container.remove();
   }
});

describe('ContentEditableInput', () => {
   it('renders highlighted children over a real input without contentEditable', () => {
      const container = renderContentEditableInput(
         <ContentEditableInput text="Task">
            <mark>Task</mark>
         </ContentEditableInput>,
      );

      expect(container.querySelector('[contenteditable]')).toBeNull();
      expect(container.querySelector('mark')?.textContent).toBe('Task');
      expect(getInputElement(container).value).toBe('Task');
   });

   it('does not duplicate edited text after blur and parent rerender', () => {
      function TestInput(): ReactElement {
         const [label, setLabel] = useState('');
         return (
            <ContentEditableInput text={label} onBlur={(event) => setLabel(event.currentTarget.value)}>
               {label ? <mark>{label}</mark> : ''}
            </ContentEditableInput>
         );
      }

      const container = renderContentEditableInput(<TestInput />);
      const inputElement = getInputElement(container);

      act(() => {
         inputElement.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      });
      inputElement.value = 'Task';
      act(() => {
         inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      });
      act(() => {
         inputElement.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
      });

      expect(getInputElement(container).value).toBe('Task');
      expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe('Task');
   });

   it('uses the latest text prop when it changes outside the input', () => {
      function TestInput(): ReactElement {
         const [label, setLabel] = useState('Old');
         return (
            <>
               <button onClick={() => setLabel('New')}>Update</button>
               <ContentEditableInput text={label}>{label}</ContentEditableInput>
            </>
         );
      }

      const container = renderContentEditableInput(<TestInput />);

      act(() => {
         container.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(getInputElement(container).value).toBe('New');
      expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe('New');
   });

   it('keeps the input surface stable while allowing caller styles', () => {
      const container = renderContentEditableInput(
         <ContentEditableInput text="Task" style={{ color: 'red' }}>
            Task
         </ContentEditableInput>,
      );
      const wrapperElement = container.firstElementChild as HTMLSpanElement;
      const inputElement = getInputElement(container);

      expect(wrapperElement.style.color).toBe('red');
      expect(wrapperElement.style.display).toBe('inline-block');
      expect(wrapperElement.style.minHeight).toBe('1em');
      expect(wrapperElement.style.minWidth).toBe('1ch');
      expect(wrapperElement.style.position).toBe('relative');
      expect(inputElement.style.background).toBe('transparent');
      expect(inputElement.style.border).toBe('0px');
      expect(inputElement.style.minHeight).toBe('inherit');
      expect(inputElement.style.outline).toBe('none');
   });

   it('keeps an empty input clickable', () => {
      const container = renderContentEditableInput(<ContentEditableInput text="">{''}</ContentEditableInput>);
      const wrapperElement = container.firstElementChild as HTMLSpanElement;
      const inputElement = getInputElement(container);

      expect(wrapperElement.style.minHeight).toBe('1em');
      expect(inputElement.style.minHeight).toBe('inherit');
      expect(inputElement.value).toBe('');
   });

   it('prevents enter before forwarding keydown', () => {
      const onKeyDown = vi.fn();
      const container = renderContentEditableInput(
         <ContentEditableInput text="Task" onKeyDown={onKeyDown}>
            Task
         </ContentEditableInput>,
      );
      const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter' });

      act(() => {
         getInputElement(container).dispatchEvent(event);
      });

      expect(event.defaultPrevented).toBe(true);
      expect(onKeyDown).toHaveBeenCalledOnce();
   });

   it('formats input text on space', () => {
      const container = renderContentEditableInput(
         <ContentEditableInput text="" onInput={InputUtils.formatInputOnSpace}>
            {''}
         </ContentEditableInput>,
      );
      const inputElement = getInputElement(container);

      act(() => {
         inputElement.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      });
      inputElement.value = 'i ';
      inputElement.setSelectionRange(2, 2);
      act(() => {
         inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      });
      act(() => {
         inputElement.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
      });

      expect(inputElement.value).toBe('I ');
      expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe('I ');
   });

   it('formats mapped words on space', () => {
      const container = renderContentEditableInput(
         <ContentEditableInput text="" onInput={InputUtils.formatInputOnSpace}>
            {''}
         </ContentEditableInput>,
      );
      const inputElement = getInputElement(container);

      act(() => {
         inputElement.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      });
      inputElement.value = 'Milk and ';
      inputElement.setSelectionRange(9, 9);
      act(() => {
         inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      });

      expect(inputElement.value).toBe('Milk & ');
      expect(inputElement.selectionStart).toBe(7);
   });
});
