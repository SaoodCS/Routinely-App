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
   // If there are no spaces in updatedInput (i.e. it's just one word), capitalize the first letter and return it:
   const updatedInput = fullInput.slice(0, -1);
   if (!updatedInput) return fullInput;
   const hasWhitespace = /\s/.test(updatedInput);
   if (!hasWhitespace) return `${updatedInput[0].toUpperCase()}${updatedInput.slice(1)} `;
   // if the last word is a key in the prettierReplace object, return the value of the key:
   const lastWord = updatedInput.trim().split(/\s+/).at(-1) ?? '';
   if (prettierReplace[lastWord]) return `${updatedInput.slice(0, -lastWord.length)}${prettierReplace[lastWord]} `;
   return fullInput;
}
