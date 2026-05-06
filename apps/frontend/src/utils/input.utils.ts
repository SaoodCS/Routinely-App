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

export function formatInputOnSpace(event: FormEvent<HTMLElement>): void {
   // Get the part of the label that comes before the cursor i.e. before where the user's typing
   const element = event.currentTarget;
   if (!(element instanceof HTMLInputElement)) return;
   const cursor = element.selectionStart;
   if (cursor === null || cursor !== element.selectionEnd) return;
   const label = element.value;
   const beforeCursor = label.slice(0, cursor);
   // Format the part of the label that comes before the cursor i.e. before where the user's typing
   let formattedBeforeCursor = beforeCursor;
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
   if (prettierMap[lastWord]) formattedBeforeCursor = `${updatedInput.slice(0, -lastWord.length)}${prettierMap[lastWord]}${inputTrailingWhitespace}`;
   if (formattedBeforeCursor === beforeCursor) return;
   element.value = formattedBeforeCursor + label.slice(cursor); // concatenate the formatted text with the part of the label that comes after the cursor
   element.setSelectionRange(formattedBeforeCursor.length, formattedBeforeCursor.length); // move the cursor to the end of the formatted text (back to where the user was typing)
}
