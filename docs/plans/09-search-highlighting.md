# Plan: Add Search Text Highlighting

## Goal
The Kanban search box filters results but doesn't highlight matching text in the results. Add text highlighting for search matches.

## Files to Modify
- `static/js/kanban.js` — search filter logic and text highlighting
- `app.py` — if server-side search with highlight tokens is needed
- `templates/kanban.html` — search box UI (if any changes needed)

## Granular Steps

### Phase 1: Analysis
1. Check the current search implementation — is it client-side or server-side?
2. Identify what fields are searched: title, description, tags?
3. Check the current filter logic in kanban.js
4. Identify the task card DOM structure for text insertion

### Phase 2: Client-Side Search (if not already)
5. If search is server-side: switch to client-side for instant feedback
6. Add a debounced input handler on the search box (300ms delay)
7. Store the current search term as a variable
8. Filter tasks by matching title AND description against the search term

### Phase 3: Text Highlighting
9. Create a `highlightText(element, searchTerm)` utility function
10. For each task card, wrap matching text spans in `<mark>` tags
11. Style `<mark>` tags: yellow background (#fff3a8), rounded corners, padding 1px 3px
12. Use `case-insensitive` regex matching: `new RegExp(searchTerm, 'gi')`
13. Highlight in both title and description areas of each card
14. Preserve HTML structure — don't break existing tags

### Phase 4: Search UX
15. Add a search results count: "5 of 12 tasks match 'term'"
16. Add a clear button (X icon) when search term is active
17. Add keyboard shortcut: "/" to focus search box, "Esc" to clear
18. Add a "searching..." indicator while filtering (if there's a large dataset)
19. Handle special characters in search term (escape for regex)

### Phase 5: Server-Side Enhancement (Optional, Phase 2)
20. Add server-side search endpoint: `GET /api/tasks?search=term`
21. Return highlighted snippets alongside results
22. Support partial matching, fuzzy matching (bonus)

### Phase 6: Testing
23. Type a search term → verify matching cards are shown
24. Verify matching text is highlighted in yellow
25. Verify non-matching text is NOT highlighted
26. Clear search → verify all cards are restored with highlights removed
27. Test search with special characters and Unicode
28. Test on mobile
29. Run full test suite
