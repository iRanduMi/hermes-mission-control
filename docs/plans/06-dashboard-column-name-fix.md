# Plan: Fix Dashboard "0 Tasks To Do" Column Name Mismatch

## Goal
Dashboard shows "0 Tasks To Do" but the Kanban board uses "REQUESTED" as the column name. The dashboard should match the Kanban column names and show accurate counts.

## Files to Modify
- `app.py` — dashboard route, task count queries
- `templates/dashboard.html` — column labels and counts
- `static/css/style.css` — if any styles need updating

## Granular Steps

### Phase 1: Analysis
1. Check the dashboard route — how does it calculate task counts?
2. Check what SQL query is used for the "Tasks To Do" count
3. Verify the Kanban board column names: REQUESTED, IN_PROGRESS, IN_REVIEW, COMPLETED (or similar)
4. Check the Kanban columns definition in kanban.html or app.py
5. Check if the dashboard counts match the Kanban counts

### Phase 2: Fix Column Names
6. Update dashboard template to use exact Kanban column names:
   - "Tasks To Do" → "REQUESTED" (or "To Do" if preferred)
   - "In Progress" → "IN_PROGRESS"
   - "In Review" → "IN_REVIEW"  
   - "Completed" → "COMPLETED"
7. Ensure the labels match what's shown on the Kanban board exactly
8. If the Kanban uses different names, sync both to use the same constants

### Phase 3: Fix Counts
9. Verify the SQL query for each count matches the Kanban's filtering logic
10. Check if there are any filters being applied (e.g., only current user's tasks)
11. Ensure the "Tasks To Do" count includes all statuses that are active (not just one)
12. Check for off-by-one errors in the count queries
13. Add a debug toggle to show raw query results (for development only)

### Phase 4: Consistency
14. Create a shared constant/module for Kanban column names
15. Both dashboard and kanban routes reference the same constants
16. Add a test that verifies dashboard counts match Kanban counts
17. Handle timezone-aware datetime filtering consistently

### Phase 5: Testing
18. Create tasks in different Kanban columns
19. Verify dashboard shows correct column names and counts
20. Verify counts update immediately after Kanban changes (refresh dashboard)
21. Test with zero tasks in a column → verify "0" displays correctly
22. Run full test suite
