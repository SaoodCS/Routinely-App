interface T_SearchTextHighlighterProps {
   query: string;
   fullText: string;
   highlightColor?: string;
   style?: React.CSSProperties;
}

export default function SearchTextHighlighter(props: T_SearchTextHighlighterProps): React.JSX.Element {
   const { query, fullText, highlightColor = '#f2ff00', style } = props;
   const matchIndex = query ? fullText.toLowerCase().indexOf(query.toLowerCase()) : -1;
   const before = fullText.slice(0, matchIndex);
   const match = fullText.slice(matchIndex, matchIndex + query.length);
   const after = fullText.slice(matchIndex + query.length);

   if (matchIndex === -1) return <>{fullText}</>;

   return (
      <>
         {before}
         <mark style={{ backgroundColor: highlightColor, color: 'inherit', ...style }}>{match}</mark>
         {after}
      </>
   );
}
