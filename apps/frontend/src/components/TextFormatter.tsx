// component has 0 UI library dependencies so can copy to any react project
interface T_TextFormatterProps {
   fullText: string;
   highlight?: { text: string; color?: string };
   replace?: { text: string; replacement: string };
   style?: React.CSSProperties;
}

export default function TextFormatter(props: T_TextFormatterProps): React.JSX.Element {
   const { highlight, fullText, replace, style } = props;
   const { text: highlightText, color: highlightColor = '#f2ff00' } = highlight ?? {};
   const formattedText = replace?.text ? fullText.replaceAll(replace.text, replace.replacement) : fullText;
   const matchIndex = highlightText ? formattedText.toLowerCase().indexOf(highlightText.toLowerCase()) : -1;

   if (!highlightText || matchIndex === -1) return <>{formattedText}</>;

   return (
      <>
         {formattedText.slice(0, matchIndex)}
         <mark style={{ backgroundColor: highlightColor, color: 'inherit', ...style }}>
            {formattedText.slice(matchIndex, matchIndex + highlightText.length)}
         </mark>
         {formattedText.slice(matchIndex + highlightText.length)}
      </>
   );
}
