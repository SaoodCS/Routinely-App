// component has 0 UI library dependencies so can copy to any react project
import type { CSSProperties, ReactNode } from 'react';

export type T_TextFormatterRules = { textMatch: string; replaceWith?: string; style?: CSSProperties; action?: (textMatch: string) => void };

export interface T_TextFormatterProps {
   fullText: string;
   rules?: T_TextFormatterRules[];
   matchCase?: boolean;
}

export default function TextFormatter(props: T_TextFormatterProps): ReactNode {
   const { fullText, rules, matchCase } = props;
   if (!rules?.length) return fullText;
   let newText = fullText;
   let formatRules: (Omit<T_TextFormatterRules, 'replaceWith'> & { next: number; start: number; end: number })[] | undefined;

   for (const rule of rules) {
      const { textMatch, replaceWith, style, action } = rule;
      if (!textMatch) continue;
      if (replaceWith !== undefined) newText = newText.replaceAll(textMatch, replaceWith);
      if (!(style || action)) continue;
      (formatRules ??= []).push({ textMatch: matchCase ? textMatch : textMatch.toLowerCase(), next: -1, start: -1, end: -1, style, action });
   }

   if (!formatRules) return newText;

   const normalizedText = matchCase ? newText : newText.toLowerCase();

   let hasMatch = false;
   for (const rule of formatRules) {
      rule.next = normalizedText.indexOf(rule.textMatch);
      if (rule.next !== -1) hasMatch = true;
   }
   if (!hasMatch) return newText;

   const content: ReactNode[] = [];
   for (let cursor = 0; cursor < newText.length; ) {
      let nextBoundary = newText.length;
      let segmentStyle: CSSProperties | undefined;
      let actions: { action: NonNullable<T_TextFormatterRules['action']>; textMatch: T_TextFormatterRules['textMatch'] }[] | undefined;
      let handleClick: (() => void) | undefined;
      let role: 'button' | undefined;
      let tabIndex: number | undefined;

      for (const rule of formatRules) {
         if (rule.next === cursor) {
            rule.start = cursor;
            rule.end = cursor + rule.textMatch.length;
            rule.next = normalizedText.indexOf(rule.textMatch, rule.end);
         }
         if (rule.end > cursor && rule.end < nextBoundary) nextBoundary = rule.end;
         if (rule.next > cursor && rule.next < nextBoundary) nextBoundary = rule.next;
         if (rule.end <= cursor) continue;
         if (rule.style) segmentStyle = segmentStyle ? { ...segmentStyle, ...rule.style } : rule.style;
         if (rule.action) (actions ??= []).push({ action: rule.action, textMatch: newText.slice(rule.start, rule.end) });
      }

      const text = newText.slice(cursor, nextBoundary);
      if (actions) {
         segmentStyle = { ...segmentStyle, pointerEvents: 'auto', position: 'relative', zIndex: 1 };
         role = 'button';
         tabIndex = -1;
         handleClick = () => {
            for (const item of actions) item.action(item.textMatch);
         };
      }

      if (!segmentStyle && !actions) content.push(text);
      else {
         content.push(
            <span key={cursor} role={role} tabIndex={tabIndex} style={segmentStyle} onClick={handleClick}>
               {text}
            </span>,
         );
      }
      cursor = nextBoundary;
   }
   return content;
}
