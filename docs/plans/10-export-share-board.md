# Plan: Add Export/Share Board Capability

## Goal
Add ability to export or share the Kanban board state externally — JSON/CSV export, shareable link, and snapshot image.

## Files to Modify
- `app.py` — new API endpoints for export and share
- `templates/kanban.html` — add export/share buttons to toolbar
- `static/js/kanban.js` — export/share logic
- `static/css/kanban-enhanced.css` — button styles

## Granular Steps

### Phase 1: Analysis
1. Check the current Kanban board data structure — what's in `window.items`?
2. Check what data is available per task: title, description, status, priority, assignee, dates
3. Identify the Kanban board toolbar where export button should go

### Phase 2: JSON Export
4. Add `GET /api/v1/kanban/export?format=json` endpoint in app.py
5. Export all tasks with: id, title, description, status, priority, assignee_id, created_at, updated_at
6. Return as a downloadable file: `kanban-export-YYYY-MM-DD.json`
7. Add a "Export JSON" button in the Kanban toolbar (next to "+ New Item")
8. Trigger a file download via JavaScript `fetch()` + `Blob` + `URL.createObjectURL()`

### Phase 3: CSV Export
9. Add `GET /api/v1/kanban/export?format=csv` endpoint
10. CSV headers: ID, Title, Description, Status, Priority, Assignee, Created, Updated
11. Escape commas and quotes in description field
12. Trigger CSV download via JavaScript

### Phase 4: Shareable Snapshot
13. Add `GET /api/v1/kanban/snapshot` endpoint — returns a JSON representation of current board
14. Add "Share Link" button that generates a URL with encoded board state
15. Use Base64 encoding of the JSON board state in the URL fragment: `/kanban#snapshot=eyJ...`
16. On page load, check for snapshot in URL fragment and display it
17. Add a "Restore from Link" button to load the shared state

### Phase 5: UI Integration
18. Add export/share buttons to the Kanban toolbar:
    - "Export" dropdown with "JSON" and "CSV" options
    - "Share" button with "Copy Link" option
19. Style buttons to match existing design system (secondary button style)
20. Add icons: `fa-download` for export, `fa-share` for share
21. Add toast notification on successful export/share

### Phase 6: Testing
22. Create multiple tasks with different statuses
23. Export as JSON → verify file content matches board state
24. Export as CSV → verify formatting and escaping
25. Generate share link → open in new tab → verify board matches
26. Test with no tasks → verify empty export works
27. Test with special characters in descriptions
28. Run full test suite
