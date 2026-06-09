import type { CSSProperties, ReactNode } from 'react';
// component has 0 UI library dependencies so can copy to any react project

export interface T_TextFormatterProps {
   fullText: string;
   rules?: { text: string; style?: CSSProperties; action?: (text: string) => void; replacement?: string; caseSensitive?: boolean }[];
}

export default function TextFormatter(props: T_TextFormatterProps): ReactNode {
   const { fullText, rules } = props;
   if (!rules?.length) return fullText;
   let newText = fullText;
   let formatRules: { text: string; next: number; start: number; end: number; style?: CSSProperties; action?: (text: string) => void }[] | undefined;
   for (const rule of rules) if (rule.text && rule.replacement !== undefined) newText = newText.replaceAll(rule.text, rule.replacement);
   for (const { action, style, text } of rules)
      if (text && (style || action)) (formatRules ??= []).push({ text: text.toLowerCase(), next: -1, start: -1, end: -1, style, action });
   if (!formatRules) return newText;

   const normalizedText = newText.toLowerCase();
   let hasMatch = false;
   for (const rule of formatRules) {
      rule.next = normalizedText.indexOf(rule.text);
      if (rule.next !== -1) hasMatch = true;
   }
   if (!hasMatch) return newText;

   const content: ReactNode[] = [];
   for (let cursor = 0; cursor < newText.length; ) {
      for (const rule of formatRules) {
         if (rule.next !== cursor) continue;
         rule.start = cursor;
         rule.end = cursor + rule.text.length;
         rule.next = normalizedText.indexOf(rule.text, rule.end);
      }

      let nextBoundary = newText.length;
      for (const rule of formatRules) {
         if (rule.end > cursor && rule.end < nextBoundary) nextBoundary = rule.end;
         if (rule.next > cursor && rule.next < nextBoundary) nextBoundary = rule.next;
      }

      let segmentStyle: CSSProperties | undefined;
      let actions: { action: (text: string) => void; text: string }[] | undefined;
      for (const rule of formatRules) {
         if (rule.end <= cursor) continue;
         if (rule.style) segmentStyle = segmentStyle ? { ...segmentStyle, ...rule.style } : rule.style;
         if (rule.action) (actions ??= []).push({ action: rule.action, text: newText.slice(rule.start, rule.end) });
      }
      if (actions) segmentStyle = { ...segmentStyle, pointerEvents: 'auto', position: 'relative', zIndex: 1 };

      const text = newText.slice(cursor, nextBoundary);
      if (!segmentStyle && !actions) content.push(text);
      else {
         content.push(
            <span
               key={cursor}
               role={actions ? 'button' : undefined}
               tabIndex={actions ? -1 : undefined}
               style={segmentStyle}
               onClick={
                  actions
                     ? () => {
                          for (const item of actions) item.action(item.text);
                       }
                     : undefined
               }
            >
               {text}
            </span>,
         );
      }
      cursor = nextBoundary;
   }
   return content;
}
