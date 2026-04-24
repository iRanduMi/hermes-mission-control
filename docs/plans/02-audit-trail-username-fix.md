# Plan: Fix Audit Trail — Show Correct Username Instead of "User 1"

## Goal
History trail shows "User 1" or "User 2" instead of actual usernames (admin, jkortje, etc.)

## Files to Modify
- `app.py` — history trail API endpoint (GET /api/tasks/<id>/history)
- `templates/kanban.html` — history section template
- `static/css/kanban-enhanced.css` — any history-related styling
- `static/js/kanban.js` — history display logic

## Granular Steps

### Phase 1: Analysis
1. Search app.py for the history trail endpoint (likely `/api/tasks/<id>/history`)
2. Check how user_id is stored in the history table
3. Check if there's a users table with username field
4. Check the current SQL query — is it joining with users table?
5. Check the JSON response structure — does it include username?

### Phase 2: Backend Fix
6. Update the history query to JOIN users table: `JOIN users ON history.user_id = users.id`
7. Add `username` field to the JSON response: `{"username": row['username'], ...}`
8. Handle NULL usernames gracefully (fallback to "Unknown")
9. Verify the users table schema has a `username` or `name` column

### Phase 3: Frontend Display Fix
10. In kanban.js, update the history rendering to use `entry.username` instead of `entry.user_id`
11. Ensure the UI shows: "admin changed status to deployed" not "User 1 changed status to deployed"
12. Add a fallback: if username is None, show "Unknown" with a subtle indicator
13. Test: open task modal → view history → verify usernames are correct
14. Test: verify it works for all users (admin, jkortje, hermes, etc.)

### Phase 4: Edge Cases
15. Handle deleted users — if a user is deleted but history references them, show "Deleted User"
16. Add a migration if users table doesn't have a username column yet
17. Update the history creation code to pass the current user's name

### Phase 5: Testing
18. Login as different users → make changes → verify history shows correct names
19. Delete a user → verify their history shows "Deleted User" or similar
20. Run full test suite
