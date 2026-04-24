# Plan: Add Priority Color Coding to Dashboard

## Goal
Dashboard cards are all the same color. Add priority-based color coding to match the Kanban board's priority indicators.

## Files to Modify
- `app.py` — dashboard route, task count queries (add priority grouping)
- `templates/dashboard.html` — add color-coded cards for each priority
- `static/css/style.css` — add priority color classes
- `static/js/dashboard.js` — dynamic color updates if needed

## Granular Steps

### Phase 1: Analysis
1. Check the Kanban board's priority color coding — what colors map to what priorities?
2. Check current dashboard card structure — how are they styled?
3. Identify the priority levels: Critical, High, Medium, Low
4. Check if the database stores priority per task

### Phase 2: Backend — Priority Counts
5. In the dashboard route, query task counts grouped by priority:
   - `SELECT priority, COUNT(*) FROM tasks WHERE status NOT IN ('deployed', 'declined') GROUP BY priority`
6. Pass priority counts to the template as `priority_counts = {'critical': 2, 'high': 3, ...}`
7. If no tasks exist for a priority, set count to 0

### Phase 3: Frontend — Priority Cards
8. In `templates/dashboard.html`, add a "Priority Overview" section below task counts
9. Create 4 cards (or a single card with colored indicators):
   - Critical: red border/badge (#dc3545 or similar danger color)
   - High: orange (#fd7e14 or warning color)
   - Medium: yellow/amber (#ffc107)
   - Low: green (#28a745 or info color)
10. Each card shows: priority name, count, and a progress bar relative to total
11. Click on a priority card → filter Kanban board to that priority

### Phase 4: Styling
12. Add `.priority-critical`, `.priority-high`, `.priority-medium`, `.priority-low` CSS classes
13. Use existing design system colors — match the Kanban board's priority colors exactly
14. Add hover effects: slight scale up, shadow intensification
15. Add a "View all" link that filters the Kanban to that priority
16. Ensure responsive: cards stack on mobile, collapse to a single row if needed

### Phase 5: Interactive Features
17. Clicking a priority card navigates to `/kanban?priority=critical` (or similar)
18. Add a "Reset Filter" button to clear any priority filter
19. Optionally: add a donut chart or bar chart showing priority distribution (Phase 2)
20. Optionally: add trend arrows showing if count increased/decreased since last check

### Phase 6: Testing
21. Create tasks with different priorities
22. Verify dashboard shows correct counts per priority
23. Verify colors match the Kanban board exactly
24. Click a priority card → verify Kanban filters to that priority
25. Test with zero tasks of a given priority
26. Run full test suite
