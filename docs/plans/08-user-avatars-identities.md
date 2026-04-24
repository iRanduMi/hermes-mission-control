# Plan: Add User Avatars and Identity Display

## Goal
Every task says "Unassigned" and history shows "User 1". Add proper user avatars, initials, and identity display throughout the UI.

## Files to Modify
- `app.py` — API endpoints that return user data
- `templates/kanban.html` — task cards and history display
- `templates/dashboard.html` — recent activity display
- `static/js/kanban.js` — avatar rendering logic
- `static/css/kanban-enhanced.css` — avatar styles

## Granular Steps

### Phase 1: Analysis
1. Check the users table schema — what fields exist (username, name, email, avatar_url)?
2. Check the current "Unassigned" display — where is it rendered?
3. Check the history trail — how is user identity displayed?
4. Check if there's already an avatar/avatar_url field in the users table

### Phase 2: Database Schema
5. If no avatar field exists: add `avatar_url TEXT` to users table
6. Add a `full_name` or `display_name` field if not present
7. Add a migration script for the schema change
8. Backfill any existing users with default avatar initials

### Phase 3: Avatar Generation
9. Create a function `get_initials(username)` — returns first letter of first/last name or first two chars
10. Create a function `get_avatar_color(username)` — returns a deterministic color based on username hash
11. Create an SVG avatar component: circle with initials, colored background
12. Handle avatars for users without names: show username first two chars

### Phase 4: Kanban Board Integration
13. In task card rendering, replace "Unassigned" with the assignee's avatar + initials
14. Show "Unassigned" only if no user is assigned — add a small icon indicator
15. In the edit modal, show the assignee's avatar next to the assignment dropdown
16. In the history trail, replace "User 1" with the user's avatar + name

### Phase 5: Dashboard Integration
17. In the "Recent Activity" section, show the actor's avatar next to each activity item
18. In the dashboard user list, show avatars for each user
19. Add hover tooltip showing full name and email

### Phase 6: Styling
20. Create `.avatar` CSS class — circular, fixed size (32px for cards, 24px for inline)
21. Background color is deterministic based on user identity (hash-based)
22. Text is white initials, centered, bold
23. Add a ring/border for the currently logged-in user
24. Add a pulsing ring for online users
25. Ensure avatars work with existing design system variables

### Phase 7: Testing
26. Create users with different names — verify avatars are unique
27. Verify "Unassigned" still shows correctly for unassigned tasks
28. Verify history trail shows user avatars + names
29. Test on mobile
30. Run full test suite
