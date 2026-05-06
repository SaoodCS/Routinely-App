import { useState, type FocusEvent, type InputHTMLAttributes, type JSX, type KeyboardEvent, type ReactNode } from 'react';

type T_ContentEditableInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'children' | 'value'> & {
   children: ReactNode;
   text: string;
};

export default function ContentEditableInput(props: T_ContentEditableInputProps): JSX.Element {
   const { children, onBlur, onChange, onFocus, onInput, onKeyDown, style, text, ...rest } = props;
   const [isEditing, setIsEditing] = useState(false);
   const [draft, setDraft] = useState<{ base: string; value: string } | null>(null);
   const value = draft?.base === text ? draft.value : text;

   function handleBlur(event: FocusEvent<HTMLInputElement>): void {
      setIsEditing(false);
      setDraft(event.currentTarget.value === text ? null : { base: text, value: event.currentTarget.value });
      onBlur?.(event);
   }

   function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
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
         <input
            {...rest}
            value={value}
            onBlur={handleBlur}
            onChange={onChange}
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
               font: 'inherit',
               inset: isEditing ? undefined : 0,
               minHeight: 'inherit',
               outline: 'none',
               padding: 0,
               position: isEditing ? 'static' : 'absolute',
               width: '100%',
            }}
         />
      </span>
   );
}
