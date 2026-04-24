# Mobile Drag-and-Drop Replacement Plan

**Task:** Replace mobile drag-and-drop with edit button + status dropdown
**Created:** 2026-04-23
**Status:** Plan Review

## Problem

On mobile devices, touch drag-and-drop causes conflicts between:
- Scrolling the column vertically
- Dragging a card to another column

The touch activation threshold (distance + delay) creates a poor UX where users can't reliably scroll past cards without triggering a drag gesture.

## Solution

Replace drag-and-drop entirely on mobile with an "Edit" button on each card that opens a dropdown for moving the task between columns.

## Implementation Plan

### 1. Add Status Dropdown to KanbanCard (frontend/src/components/KanbanCard.tsx)

- Add a visible "Edit" button (or chevron icon) at the bottom-right of each card
- On tap/click, show a dropdown with all kanban columns (using existing `KANBAN_COLUMNS` from `@/types`)
- Each option shows the column title with its accent color dot
- On selection, call the update API directly to move the task (no modal needed)
- Show a brief toast/snackbar confirming the move

**Key changes to KanbanCard:**
- Import `KANBAN_COLUMNS` from `@/types`
- Import `useUpdateTask` from `@/hooks/useTasks`
- Add a new `useState` for dropdown visibility
- Add a new `handleStatusChange` function that calls the update mutation
- Render an "Edit" button (or chevron/arrow icon) using `lucide-react`
- Render the dropdown below the button (or inline) with all columns
- The dropdown should use the existing `DropdownMenu` component or a simple custom one

### 2. Hide Drag-and-Drop on Mobile (CSS/media query)

- Add a `@media (max-width: 768px)` rule to hide drag-related visual cues:
  - Remove `cursor-grab` / `cursor-grabbing` styles
  - Hide any drag handle indicators
  - Remove `touchAction: 'none'` from the card wrapper
- The card should look like a regular clickable card on mobile

### 3. Disable dnd-kit Sensors on Mobile (frontend/src/components/KanbanBoard.tsx)

- Use a `useMediaQuery` hook (or `window.matchMedia`) to detect mobile
- Conditionally create sensors:
  - Desktop: `useSensors(useSensor(PointerSensor), useSensor(TouchSensor))` — current behavior
  - Mobile: `useSensors()` — no sensors, disabling drag-and-drop entirely
- Alternatively, conditionally render `DndContext` with different sensor configurations
- The `DndContext` itself should always be present; just change the active sensors

### 4. Wire Up TaskCard with New Props

- KanbanBoard already passes `onEditTask` or similar callback pattern
- Pass the `updateTask` mutation from `useUpdateTask` into KanbanColumn, then to KanbanCard
- KanbanCard receives the mutation and calls it on dropdown selection

### 5. Test

- [ ] Desktop: drag-and-drop still works as-is
- [ ] Mobile: columns scroll normally without drag interference
- [ ] Mobile: tapping "Edit" opens dropdown with all columns
- [ ] Mobile: selecting a column moves the card immediately
- [ ] Mobile: visual feedback (toast) confirms the move
- [ ] Card looks clean without drag handles on mobile

## Files to Modify

| File | Change |
|------|--------|
| `frontend/src/components/KanbanCard.tsx` | Add visible Edit button + status dropdown |
| `frontend/src/components/KanbanBoard.tsx` | Conditional sensors (desktop vs mobile) |
| `frontend/src/components/KanbanColumn.tsx` | Pass update mutation down to cards |
| `frontend/src/styles/globals.css` | Mobile media query for drag-related styles |

## Design Decisions

1. **Dropdown vs Modal:** Use a dropdown (inline or floating) instead of a full modal — it's faster and takes less screen space on mobile
2. **Always-visible Edit button:** Not just on hover — must be tappable on mobile at all times
3. **No partial mobile drag support:** Full disable on mobile, not a hybrid approach
4. **Re-use existing dropdown component:** Use the existing `DropdownMenu` from shadcn/ui to keep consistency
5. **Toast notification:** Confirm the move with a brief toast (can use a simple state-driven toast)
