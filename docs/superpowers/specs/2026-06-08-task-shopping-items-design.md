# Clickable Task Shopping Items Design

## Goal

Allow routine task labels to mark shopping-list entries with paired asterisks. Text inside each complete pair is underlined and clickable while the asterisks remain visible.

Examples:

- `Buy *milk*` exposes one clickable item named `milk`.
- `Buy *milk and eggs*` exposes one clickable item named `milk and eggs`.
- `Buy *milk* and *eggs*` exposes two independent clickable items.

## Behavior

- Only complete `*...*` pairs with non-whitespace content are interactive.
- The original task label, including asterisks and inner spacing, remains visible.
- The shopping-item label is the enclosed text trimmed of surrounding whitespace.
- Clicking an interactive segment appends a new unchecked shopping item.
- Duplicate matching trims labels and compares them case-insensitively.
- A duplicate is not added. A snackbar reports `"<item>" is already in the shopping list.`
- Unmatched asterisks and pairs containing only whitespace remain ordinary task text.
- Clicking ordinary task text continues to focus the editable textarea.
- Clicking an interactive segment does not focus the textarea or initiate a swipe.
- Existing task search highlighting continues to apply to the rendered label.

## Components

### Task label renderer

Add a routine-specific component beside `TaskItem.tsx`. It will:

- Parse the task label from left to right into ordinary text, visible delimiters, and interactive inner text.
- Render each valid inner segment as a semantic button with link-like underlining and inherited typography.
- Keep both surrounding asterisks as ordinary text.
- Call an `onAddShoppingItem(label)` callback with the trimmed inner text.
- Apply the existing search highlighting to rendered text without changing task data.

Keeping this renderer in the routine folder avoids coupling shopping-list behavior to the generic `TextHighlighter` component.

### ContentEditableField

Extend the existing display overlay with a narrowly scoped opt-in for interactive children. In display mode:

- The transparent textarea remains responsible for focusing when ordinary text is clicked.
- Interactive descendants render above the textarea and accept pointer events.
- Existing callers retain their current non-interactive behavior by default.
- Editing mode remains unchanged and displays the raw label, including asterisks.

### TaskItem

`TaskItem` will read `shoppingList` and `setShoppingListDb` from the existing Firestore context. Its add handler will:

1. Normalize the clicked label with `trim().toLocaleLowerCase()`.
2. Compare it with normalized existing shopping-item labels.
3. Set a local duplicate snackbar message when a match exists.
4. Otherwise append `AppUtils.createNewShoppingItem({ label })`.

The snackbar will use the project's existing MUI `Snackbar` and `Alert` pattern. No global notification system or new dependency is needed.

## Data Flow

1. The task renderer identifies a valid paired segment.
2. The user clicks its underlined inner text.
3. `TaskItem` checks the current shopping-list context value.
4. A unique item is appended through `setShoppingListDb`.
5. A duplicate leaves Firestore unchanged and opens the informational snackbar.

## Error Handling

Firestore write failures continue to use the existing error snackbar in `FirestoreContextProvider`. This feature adds only duplicate feedback; it does not duplicate persistence-error handling.

## Testing

Use the existing Vitest and jsdom setup.

- Renderer tests cover multi-word pairs, multiple independent pairs, visible delimiters, unmatched asterisks, whitespace-only pairs, and callback labels.
- `ContentEditableField` tests verify that opt-in interactive children receive clicks while ordinary text still focuses the textarea.
- `TaskItem` interaction tests use a mocked Firestore context to cover case-insensitive duplicate prevention, duplicate snackbar feedback, and unique-item creation through the existing shopping-item factory.
- Run focused Vitest tests, frontend type checking, and the repository lint command.

## Out of Scope

- Removing a shopping item by clicking the task segment again.
- Marking a task segment as already added.
- Navigating to the shopping-list page after adding an item.
- Supporting escaping or nesting of asterisks.
- Adding a global toast service.
