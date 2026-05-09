// component has 0 UI library dependencies so can copy to any react project
interface T_TextHighlighterProps {
   highlightText: string;
   fullText: string;
   highlightColor?: string;
   style?: React.CSSProperties;
}

export default function TextHighlighter(props: T_TextHighlighterProps): React.JSX.Element {
   const { highlightText, fullText, highlightColor = '#f2ff00', style } = props;
   const matchIndex = highlightText ? fullText.toLowerCase().indexOf(highlightText.toLowerCase()) : -1;
   const before = fullText.slice(0, matchIndex);
   const match = fullText.slice(matchIndex, matchIndex + highlightText.length);
   const after = fullText.slice(matchIndex + highlightText.length);

   if (matchIndex === -1) return <>{fullText}</>;

   return (
      <>
         {before}
         <mark style={{ backgroundColor: highlightColor, color: 'inherit', ...style }}>{match}</mark>
         {after}
      </>
   );
}
