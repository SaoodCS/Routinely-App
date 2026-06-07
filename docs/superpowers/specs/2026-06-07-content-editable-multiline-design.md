# Content Editable Multiline Design

## Goal

Preserve visual line wrapping when `ContentEditableField` receives focus, while keeping the existing behavior where pressing Enter prevents a newline and lets each caller blur and save the field.

## Root Cause

The unfocused field renders text in a `<span>`, which naturally wraps within the available width. On focus, that display layer is removed and a single-line `<input>` becomes static content. HTML inputs cannot wrap, so the focused field collapses to one visual line.

## Design

Replace the internal `<input>` with a controlled `<textarea rows={1}>`. Keep the existing wrapper, draft state, highlighted unfocused display layer, transparent inactive editing surface, and caller-provided styles.

The textarea will have hidden overflow and no manual resize handle. A local resize function will reset its height to `auto` and then set it to `scrollHeight`, allowing its height to shrink or grow with visual wrapping. It will run when editing begins, when input changes, and when the rendered value or available width requires another measurement.

The component remains a single field rather than accepting stored newline characters. `ContentEditableField` will continue to prevent Enter before forwarding `onKeyDown`; `TaskItem` and `TagsPage` retain their current blur/save keyboard behavior.

## Type Changes

`ContentEditableField` props and event handlers will use textarea attribute and event types. Callers that explicitly type focus or keyboard events will be updated from `HTMLInputElement` to `HTMLTextAreaElement`.

`ElementUtils.handleFormatInputOnSpace` will accept either an input or textarea and retain the same cursor-preserving formatting behavior.

## Compatibility

- Unfocused highlighted content remains unchanged.
- Draft values and parent-provided value updates retain their current behavior.
- Caller styles remain on the wrapper so task colors, font sizes, decoration, width, and padding continue to apply.
- Empty fields retain a clickable minimum height.
- Swipe, drag, and task action behavior are outside the component change and must remain unaffected.
- No new dependencies are required.

## Testing

Restore a focused component test file using the existing Vitest and jsdom dependencies. Tests will cover:

- the textarea replacing the input without using `contentEditable`;
- auto-sizing from `scrollHeight` on focus and input;
- Enter being prevented before the caller handler runs;
- draft persistence through blur and parent rerender;
- external text prop updates;
- caller styles and empty-field minimum sizing;
- formatting utility behavior with the textarea.

Run the focused test in red before implementation, then green after the change. Finish with frontend typecheck, repository lint, frontend build, and rendered browser validation through Playwright because the Browser plugin is unavailable. Rendered validation will compare the field before focus, after focus, after wrapping, and after Enter-triggered blur at desktop and mobile widths where practical.
