# Plan: Add Proper Description Field to Kanban Tasks

## Goal
Currently Kanban cards only show a truncated preview. Add a proper description field in the edit modal with full details, formatting support, and a card preview.

## Files to Modify
- `app.py` — API endpoint for task description (may already exist)
- `templates/kanban.html` — add description textarea to edit/new modals
- `static/js/kanban.js` — render description preview on cards
- `static/css/kanban-enhanced.css` — styles for description preview

## Granular Steps

### Phase 1: Analysis
1. Check if tasks table already has a `description` column
2. Check current API endpoints — do they accept/return description?
3. Check `renderTasks()` — how is description currently rendered?
4. Check the edit modal — does it already have a description textarea?
5. Check if there's a description column that's being ignored

### Phase 2: Database Schema
6. If no description column exists: add `description TEXT DEFAULT ''` to tasks table
7. Add a migration script `migrations/add_description_field.py`
8. Ensure the column supports NULL for backward compatibility
9. Run the migration and verify the column exists

### Phase 3: Card Preview
10. In `renderTasks()`, add a description preview line below the task title
11. Truncate to ~100 characters with "..." indicator
12. Style the preview: smaller font, muted color (text-secondary)
13. Only show preview if description is non-empty
14. Add `data-description` attribute for hover popover (if not already done)

### Phase 4: Edit Modal Enhancement
15. Ensure edit modal has a textarea named "description" with enough rows (8-10)
16. Add placeholder text: "Add details, context, or acceptance criteria..."
17. Style the textarea to match the design system (CSS variables)
18. Add a character counter below the textarea
19. Add a "Preview" toggle button to show formatted preview
20. Ensure description is loaded from the API when modal opens

### Phase 5: New Item Modal
21. Add the same description textarea to the "New Item" modal
22. Ensure consistent styling between edit and new modals
23. Verify the API accepts description in POST /api/tasks

### Phase 6: Frontend Features
24. Add markdown preview toggle (simple: render basic formatting)
25. Add auto-resize for textarea as content grows
26. Add word count display
27. Add keyboard shortcut (Ctrl+Enter to save)

### Phase 7: Testing
28. Create a task with a detailed description
29. Verify preview shows on the card
30. Edit the description — verify it saves correctly
31. View the full description in the modal
32. Test markdown preview if implemented
33. Test on mobile
34. Run full test suite
