# Plan: Remove Admin Test User & Add First-Run Setup

## Goal
Remove hardcoded admin/admin123 default credentials. Add a first-run setup wizard that creates the initial admin user.

## Files to Modify
- `app.py` — init_db(), login routes, templates
- `templates/login.html` — remove admin hint
- `templates/setup.html` — NEW file for first-run setup

## Granular Steps

### Phase 1: Analysis
1. Search app.py for all 'admin' string literals
2. Search app.py for 'admin123' hardcoded password
3. Check init_db() function — how does it create the default user?
4. Check create_users.py — what does it do?
5. Check templates/login.html for admin hints
6. Check templates/base.html for admin references

### Phase 2: Create Setup Route & Template
7. Create `templates/setup.html` — simple form with username/password/password_confirm fields
8. Add `@app.route('/setup', methods=['GET', 'POST'])` in app.py
9. GET: check if users table has rows; if yes redirect to /login, if no show form
10. POST: validate form (unique username, password min 6 chars, confirm match)
11. POST: hash password and insert first user into DB
12. POST: after success, redirect to /login with a "created" flash message
13. Add `@app.before_request` or middleware to redirect / to /setup if no users exist

### Phase 3: Remove Hardcoded Defaults
14. Modify `init_db()` to only run if users table is empty AND no setup has been done
15. Remove the hardcoded admin/admin123 creation from init_db()
16. Update login template — remove any "Try admin/admin123" hints
17. Update any error messages that reference admin

### Phase 4: Create Users Script
18. Update `create_users.py` to work without hardcoded defaults
19. Add a --force flag to recreate the first user (for development only)
20. Document in README that setup is first-run only

### Phase 5: Testing
21. Test: clear DB → visit / → should redirect to /setup
22. Test: fill out setup form → should create user → redirect to /login
23. Test: login with new user → should work
24. Test: admin123 no longer works
25. Test: visit /setup again after setup → should redirect to /login
26. Run full test suite
