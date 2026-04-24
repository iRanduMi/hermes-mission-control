# Plan: Fix Edit Modal Text Wrapping

## Goal
When editing a task, the UI is not wrapped appropriately — text overflows or is cut off.

## Files to Modify
- `static/css/kanban-enhanced.css` or `static/css/style.css` — modal overlay and content styles
- `static/js/kanban.js` — modal opening logic
- `templates/kanban.html` — modal HTML structure

## Granular Steps

### Phase 1: Analysis
1. Open the Kanban board → click "Edit Item" on any task
2. Identify the exact overflow issue: is it the title, description, or both?
3. Check current CSS for `.edit-item-modal` — is there a width constraint?
4. Check the modal content container — is it using `white-space: nowrap`?
5. Check responsive behavior — does it wrap correctly on mobile?
6. Check if the modal uses flexbox/grid and whether wrapping is enabled

### Phase 2: CSS Fix
7. Ensure `.edit-item-modal .modal-content` has `max-width: 600px` and `width: 90vw`
8. Add `word-wrap: break-word` and `overflow-wrap: break-word` to all text containers
9. Ensure `white-space` is NOT set to `nowrap` on any modal text element
10. Add `min-height` and `max-height` constraints to textarea for description
11. Ensure the modal overlay uses `overflow-y: auto` for scrollable content
12. Check and fix z-index layering — ensure modal appears above everything

### Phase 3: JavaScript Fix
13. In `openEditModal()` — verify the modal content is populated with full text
14. Ensure `openEditModal()` sets the textarea value WITHOUT truncating
15. Check if there's any character limit being applied in JS that shouldn't be
16. Ensure `closeEditModal()` properly resets all form fields

### Phase 4: Responsive
17. Test on mobile viewport — modal should be full-width with scroll
18. Test on tablet — modal should resize proportionally
19. Add `@media` queries for breakpoint adjustments if needed
20. Ensure modal centering works on all screen sizes

### Phase 5: Testing
21. Create a task with a long description (200+ characters)
22. Open edit modal — verify text wraps correctly
23. Edit the task — verify changes save
24. Close and reopen — verify text is still fully visible
25. Test on mobile viewport
26. Run full test suite
