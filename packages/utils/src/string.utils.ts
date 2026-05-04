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
   const inputTrailingWhitespace = fullInput.at(-1) ?? '';
   if (!/\s/.test(inputTrailingWhitespace)) return fullInput;
   const updatedInput = fullInput.slice(0, -1);
   // If there are no spaces in the updated input (i.e. it's just one word) or if it comes after the end of a sentence (e.g. ". "), capitalize the first letter
   if (!updatedInput) return fullInput;
   const lastWord = updatedInput.trim().split(/\s+/).at(-1) ?? '';
   const beforeLastWord = updatedInput.slice(0, -lastWord.length);
   if (!/\s/.test(updatedInput) || /[.!?]\s+$/.test(beforeLastWord)) {
      return `${beforeLastWord}${lastWord[0].toUpperCase()}${lastWord.slice(1)}${inputTrailingWhitespace}`;
   }
   // If the last word is in the prettierReplace object, replace it
   if (prettierReplace[lastWord]) return `${updatedInput.slice(0, -lastWord.length)}${prettierReplace[lastWord]}${inputTrailingWhitespace}`;
   return fullInput;
}
