# Plan: Add Cron Jobs Dashboard Section

## Goal
Dashboard currently shows task counts but no scheduled cron jobs visualization. Add a "Scheduled Tasks" section to the dashboard showing upcoming and running cron jobs.

## Files to Modify
- `app.py` — dashboard route, cron jobs API endpoint
- `templates/dashboard.html` — add cron jobs section
- `static/css/style.css` — styles for cron jobs cards
- `static/js/dashboard.js` — cron jobs display logic

## Granular Steps

### Phase 1: Analysis
1. Check if there's already a cron jobs table/model in the database
2. Check the `/cronjobs` page — how does it display cron jobs?
3. Check what data is available: name, schedule, next_run, status, last_run
4. Check if there's an API endpoint to list cron jobs
5. Check the current dashboard layout — where to insert the cron section

### Phase 2: API Endpoint
6. If no API endpoint exists: create `GET /api/v1/cronjobs` endpoint
7. Return list of cron jobs with: id, name, schedule, next_run, last_run, status, enabled
8. Filter out disabled jobs by default
9. Include a "status" field: "upcoming", "running", "failed", "completed"
10. Handle timezone-aware datetime display (use UTC or user's timezone)

### Phase 3: Dashboard Layout
11. Add a new section to `templates/dashboard.html` below the task count cards
12. Title: "Scheduled Tasks" with a "View all →" link to /cronjobs
13. Display up to 5 upcoming cron jobs as cards (similar to recent activity cards)
14. Each card shows: job name, next run time (relative like "in 2 hours"), status badge
15. Color-code by status: green=upcoming, blue=running, red=failed

### Phase 4: Dashboard Template Logic
16. In the dashboard route (GET /dashboard), fetch cron jobs data
17. Pass `cron_jobs` to the template alongside existing data
18. Use Jinja2 loops to render cron job cards
19. Handle empty state: show "No scheduled tasks" with a "+ Add" button
20. Add relative time formatting: "in 5 minutes", "in 2 hours", "yesterday"

### Phase 5: Styling
21. Create `.cron-job-card` CSS class using existing design system variables
22. Style status badges: `bg-success` for upcoming, `bg-info` for running, `bg-danger` for failed
23. Ensure cards match the existing dashboard card style (same padding, border-radius, shadow)
24. Add hover effects consistent with other dashboard cards
25. Ensure responsive: stack vertically on mobile

### Phase 6: Interactive Features
26. Add a "Run Now" button for each cron job (calls POST /api/v1/cronjobs/<id>/run)
27. Add a toggle to enable/disable a job inline
28. Add a refresh button to update the list without full page reload
29. Use polling or WebSocket for real-time status updates (optional, phase 2)

### Phase 7: Testing
30. Create a test cron job → verify it appears on dashboard
31. Verify relative time display works correctly
32. Verify status badges update when job status changes
33. Test empty state (no cron jobs)
34. Test on mobile viewport
35. Run full test suite
