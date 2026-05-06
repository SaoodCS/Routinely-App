import type { FormEvent } from 'react';

const prettierMap: Record<string, string> = {
   '->': '→',
   '-->': '→',
   '🡪': '→',
   '<->': '↔',
   and: '&',
   And: '&',
   i: 'I',
   ive: "I've",
   Ive: "I've",
   im: "I'm",
   Im: "I'm",
   "i've": "I've",
   "i'm": "I'm",
};

export function formatInputOnSpace(event: FormEvent<HTMLSpanElement>): void {
   // Get the part of the label that comes before the cursor i.e. before where the user's typing
   const element = event.currentTarget;
   const selection = window.getSelection();
   if (!selection?.rangeCount) return;
   const { endContainer, endOffset } = selection.getRangeAt(0);
   if (!element.contains(endContainer)) return;
   const range = document.createRange();
   range.selectNodeContents(element);
   range.setEnd(endContainer, endOffset);
   const label = element.textContent ?? '';
   const beforeCursor = label.slice(0, range.toString().length);
   // Format the part of the label that comes before the cursor i.e. before where the user's typing
   let formattedBeforeCursor: string = beforeCursor;
   const inputTrailingWhitespace = beforeCursor.at(-1) ?? '';
   if (!/\s/.test(inputTrailingWhitespace)) return; // If the final character of the input before the cursor is not a space, don't format the input
   const updatedInput = beforeCursor.slice(0, -1);
   if (!updatedInput) return;
   // If there are no spaces in the updated input (i.e. it's just one word) or if it comes after the end of a sentence (e.g. ". "), capitalize the first letter
   const lastWord = updatedInput.trim().split(/\s+/).at(-1) ?? '';
   const beforeLastWord = updatedInput.slice(0, -lastWord.length);
   if (!/\s/.test(updatedInput) || /[.!?]\s+$/.test(beforeLastWord)) {
      formattedBeforeCursor = `${beforeLastWord}${lastWord[0].toUpperCase()}${lastWord.slice(1)}${inputTrailingWhitespace}`;
   }
   // If the last word is in the prettierMap object, replace it
   if (prettierMap[lastWord]) {
      formattedBeforeCursor = `${updatedInput.slice(0, -lastWord.length)}${prettierMap[lastWord]}${inputTrailingWhitespace}`;
   }
   element.textContent = formattedBeforeCursor + label.slice(beforeCursor.length); // concatenate the formatted text with the part of the label that comes after the cursor
   selection.collapse(element.firstChild, formattedBeforeCursor.length); // move the cursor to the end of the formatted text (back to where the user was typing)
}
