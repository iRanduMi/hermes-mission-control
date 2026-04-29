---
title: Sub-Status Visibility on Kanban Cards
status: completed
priority: medium
labels: [frontend, enhancement]
created: 2026-04-26
completed: 2026-04-26
---

# Sub-Status Visibility on Kanban Cards

## Overview

Add visual sub-status indicators to Kanban task cards and the task detail modal. Currently the `sub_status` field (`idle`/`active`/`blocked`) exists in the API but is never rendered anywhere in the UI — it's a data-blind spot.

## Architecture / Design

### Card-Level Display

Add a small sub-status badge/pill to the task card, positioned alongside the existing priority badge and labels row. This gives at-a-glance visibility of task health without opening the modal.

**Visual design:**
- Small pill/badge similar in size to the priority badge (~9px font, ~8px height)
- Positioned after priority badge + labels row (or before priority badge)
- Color-coded per sub-status value:
  - `idle` → gray/slate (neutral, no urgency)
  - `active` → blue/cyan (work in progress)
  - `blocked` → red/amber (attention needed)
- Only show when `sub_status !== "idle"` (since `idle` is the default and adds noise)
- Icon + text: e.g. 🟡 idle, 🟢 active, 🔴 blocked (or simple dot + text)

### Modal-Level Display

Add a sub-status section to the TaskModal edit dialog:
- Display current sub-status in the task details header (near priority/status)
- Allow editing via a small dropdown selector

### File Changes

- **`frontend/src/components/KanbanCard.tsx`** — Add sub-status badge rendering to the card
- **`frontend/src/components/TaskModal.tsx`** — Add sub-status display + edit dropdown in modal
- **`frontend/src/types/index.ts`** — Consider formalizing sub_status as an enum if needed
- **`frontend/src/styles/globals.css`** — Add CSS variables for sub-status colors (if not reusing priority colors)

## Implementation Steps

1. Add sub-status color constants (CSS variables or Tailwind-compatible values)
2. Modify `KanbanCard.tsx` to render a sub-status pill (only when non-idle)
3. Modify `TaskModal.tsx` to display current sub-status in the header area
4. Add a sub-status dropdown selector to the TaskModal edit section
5. Wire up the PATCH API call to update sub_status
6. Test with all three sub-status values across light/dark modes

## Testing Strategy

- Verify badge renders correctly for `idle` (hidden), `active` (visible blue), `blocked` (visible red)
- Check both light and dark mode color contrast
- Verify the badge doesn't overflow or crowd existing card elements
- Test sub-status edit flow in the modal (select → save → verify update)
- Verify drag-and-drop still works with the new badge in place

## Risks / Considerations

- Card height may increase slightly with a second row of badges — check minimum card height
- Mobile view: ensure badge doesn't cause text wrapping issues
- Should `blocked` have a pulsing animation to draw attention? (defer to follow-up)
