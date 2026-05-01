const prettierReplace: Record<string, string> = {
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

export function formatInputOnSpace(fullInput: string): string {
   // Only format if the last character of the input is a space
   if (!/\s/.test(fullInput.at(-1) ?? '')) return fullInput;
   // If there are no spaces in the input (i.e. it's just one word) or if it comes after the end of a sentence (e.g. ". "), capitalize the first letter
   const updatedInput = fullInput.slice(0, -1);
   if (!updatedInput) return fullInput;
   const lastWord = updatedInput.trim().split(/\s+/).at(-1) ?? '';
   const beforeLastWord = updatedInput.slice(0, -lastWord.length);
   if (!/\s/.test(updatedInput) || /[.!?]\s+$/.test(beforeLastWord)) return `${beforeLastWord}${lastWord[0].toUpperCase()}${lastWord.slice(1)} `;
   // If the last word is in the prettierReplace object, replace it
   if (prettierReplace[lastWord]) return `${updatedInput.slice(0, -lastWord.length)}${prettierReplace[lastWord]} `;
   return fullInput;
}
