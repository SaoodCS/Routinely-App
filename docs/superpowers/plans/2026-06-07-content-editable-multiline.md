# Content Editable Multiline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep task and tag labels visually wrapped while focused, with Enter still blurring and saving.

**Architecture:** Replace the internal input with a controlled, auto-height textarea while preserving the existing display span and draft state. Update only the event types and input formatter needed by that element change.

**Tech Stack:** React 19, TypeScript 5.9, Vitest 4, jsdom, Playwright

---

### Task 1: Add the regression test

**Files:**
- Create: `apps/frontend/src/components/ContentEditableField.test.tsx`

- [ ] Add jsdom component tests that assert the field renders a textarea, grows to its mocked `scrollHeight` on focus and input, prevents Enter before forwarding the key event, preserves draft text through blur, retains caller styles, and supports `handleFormatInputOnSpace`.
- [ ] Run `npm exec --workspace @repo/frontend vitest -- run src/components/ContentEditableField.test.tsx`.
- [ ] Confirm it fails because the current component renders an input and cannot auto-size.

### Task 2: Implement the textarea

**Files:**
- Modify: `apps/frontend/src/components/ContentEditableField.tsx`
- Modify: `apps/frontend/src/routes/main/routine/TaskItem.tsx`
- Modify: `apps/frontend/src/utils/element.utils.ts`

- [ ] Change props and handlers to textarea types and render `<textarea rows={1}>`.
- [ ] Add a textarea ref and a short height sync that sets `height` to `auto`, then to `scrollHeight`, on focus/value changes and input.
- [ ] Keep `Enter` prevention, the inactive highlighted span, draft persistence, wrapper styles, transparent inactive text, and minimum clickable height unchanged.
- [ ] Update `TaskItem` event types and allow the formatting utility to handle inputs or textareas.
- [ ] Run the focused Vitest command and confirm all tests pass.

### Task 3: Verify the app

**Files:**
- No committed files beyond Tasks 1 and 2.

- [ ] Run `npm run typecheck --workspace @repo/frontend`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build --workspace @repo/frontend`.
- [ ] Use a temporary local component harness and Playwright to verify desktop and mobile wrapping before focus, during focus/editing, and after Enter-triggered blur, with no relevant console errors.
- [ ] Inspect `git diff --check` and the final diff for unrelated changes.
