import { useState, type FocusEvent, type JSX, type KeyboardEvent, type ReactNode, type TextareaHTMLAttributes } from 'react';

type T_ContentEditableFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children' | 'rows' | 'value'> & {
   children: ReactNode;
   text: string;
};

export default function ContentEditableField(props: T_ContentEditableFieldProps): JSX.Element {
   const { children, onBlur, onChange, onFocus, onInput, onKeyDown, style, text, ...rest } = props;
   const [isEditing, setIsEditing] = useState(false);
   const [draft, setDraft] = useState<{ base: string; value: string } | null>(null);
   const value = draft?.base === text ? draft.value : text;

   function handleBlur(event: FocusEvent<HTMLTextAreaElement>): void {
      setIsEditing(false);
      setDraft(event.currentTarget.value === text ? null : { base: text, value: event.currentTarget.value });
      onBlur?.(event);
   }

   function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
      if (event.key === 'Enter') event.preventDefault();
      onKeyDown?.(event);
   }

   return (
      <span style={{ display: 'inline-block', minHeight: '1em', minWidth: '1ch', ...style, position: 'relative' }}>
         {!isEditing && (
            <span aria-hidden style={{ pointerEvents: 'none' }}>
               {draft?.base === text ? draft.value : children}
            </span>
         )}
         <textarea
            {...rest}
            rows={1}
            value={value}
            onBlur={handleBlur}
            onChange={(event) => {
               setDraft({ base: text, value: event.currentTarget.value });
               onChange?.(event);
            }}
            onInput={(event) => {
               onInput?.(event);
               setDraft({ base: text, value: event.currentTarget.value });
            }}
            onFocus={(event) => {
               setIsEditing(true);
               setDraft({ base: text, value });
               onFocus?.(event);
            }}
            onKeyDown={handleKeyDown}
            style={{
               background: 'transparent',
               border: 0,
               boxSizing: 'border-box',
               color: isEditing ? 'inherit' : 'transparent',
               fieldSizing: 'content',
               font: 'inherit',
               inset: isEditing ? undefined : 0,
               minHeight: 'inherit',
               outline: 'none',
               overflow: 'hidden',
               padding: 0,
               position: isEditing ? 'static' : 'absolute',
               resize: 'none',
               width: '100%',
            }}
         />
      </span>
   );
}
