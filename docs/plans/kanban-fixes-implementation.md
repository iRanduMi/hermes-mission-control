# Mission Control Kanban - All Fixes Implementation Plan

## Overview

This document covers all fixes for the Kanban board, organized into 7 areas. Most have been previously implemented but some have remaining gaps or bugs. Each step is designed for an independent sub-agent to implement.

---

## Fix Status Summary

| # | Fix Area | Status | Action Needed |
|---|----------|--------|---------------|
| 1 | Modal padding consistency | ⚠️ Partially done | Add `.modal-content.new-item-modal` padding |
| 2 | Status persistence | ✅ Done | No action needed |
| 3 | Activity history icon alignment | ✅ Done | No action needed |
| 4 | Description hover popovers | ✅ Done | No action needed |
| 5 | Delete buttons on cards | ✅ Done | No action needed |
| 6 | Mobile touch drag-and-drop | ⚠️ Disabled | Enable by removing UA guard, using pointer events |
| 7 | Modal form styling | ✅ Done | No action needed |

---

## Outstanding Steps

### Step 1: Add `.modal-content.new-item-modal` padding

**Files:** `static/css/kanban-enhanced.css`

**Problem:** `.modal-content.edit-item-modal` has explicit `padding: var(--space-xl)` (line 114), but `.modal-content.new-item-modal` has no padding override. The new-item modal uses Bootstrap defaults, creating visual inconsistency.

**Fix:** Add `.modal-content.new-item-modal` with matching padding in kanban-enhanced.css.

**Location:** Right after line 115 (after `.modal-content.edit-item-modal` closing brace).

---

### Step 2: Fix responsive CSS media query brace misplacement

**Files:** `static/css/kanban-enhanced.css`

**Problem:** Line 725 has a closing `}` that is incorrectly positioned. The `@media (max-width: 768px)` started on line 540 should have been closed around line 554, but instead it's being closed at line 725. This means the entire "History Trail Section" (lines 556-724) is incorrectly nested inside the responsive media query and won't apply on desktop.

**Fix:** 
- Add a closing `}` after line 554 (after the `.modal-content.edit-item-modal` responsive rules)
- The `.history-section` and all history trail styles (lines 559-724) should be OUTSIDE the media query, at the top level

---

### Step 3: Remove duplicate `.btn-danger` from kanban-enhanced.css

**Files:** `static/css/kanban-enhanced.css`

**Problem:** `.btn-danger` is defined in both:
- `style.css` line 1220 (authoritative source)
- `kanban-enhanced.css` lines 239-258 (duplicate)

This creates ambiguity about which styles take precedence and makes maintenance harder.

**Fix:** Remove lines 239-258 from kanban-enhanced.css. The `style.css` version is the canonical one.

---

### Step 4: Enable mobile touch drag-and-drop

**Files:** `static/js/kanban.js`

**Problem:** Lines 406-409 have a UA-string-based mobile check (`isMobileDevice()`) that skips all touch-drag code. Lines 152-153 also set `draggable="false"` on mobile cards. This effectively disables drag-and-drop on all mobile devices.

**Fix:** Replace the UA-based guard with a pointer-events capability check. Use Pointer Events API (Pointer Events Level 2) to handle both mouse and touch uniformly:

1. Remove the `isMobileDevice()` function (or deprecate it)
2. Change `draggable` attribute to always be `"true"` 
3. Replace separate `touchstart/touchmove/touchend` listeners with `pointerdown/pointermove/pointerup` listeners
4. Add `touch-action: none` to `.task-card` in CSS for touch devices
5. The pointer events API natively handles both mouse and touch — no need for separate code paths

**Key changes:**
- `setupDragAndDrop()`: Replace entire mobile block with pointer events listeners
- `createItemCard()`: Always use `draggable="true"`
- `kanban-enhanced.css`: Add `touch-action: none` for `.task-card`

---

### Step 5: Verify all fixes visually

**Steps:**
1. Restart Mission Control server
2. Hard-reload browser (Cmd+Shift+R)
3. Check each fix area:
   - New item modal padding matches edit modal
   - History trail section visible on desktop AND mobile
   - `.btn-danger` works consistently (no double-definition issues)
   - Drag-and-drop works on mobile touch devices
4. Run any existing tests

---

## Implementation Order

1. **Step 2** first (CSS structure fix) — fixes the media query nesting bug
2. **Step 3** second (CSS cleanup) — removes duplicate `.btn-danger`
3. **Step 1** third (new-item-modal padding) — completes modal consistency
4. **Step 4** fourth (mobile drag-and-drop) — requires JS changes, can be done last
5. **Step 5** fifth (verification) — test everything together

Steps 2, 3, 1 are CSS-only and can be done by one sub-agent together. Step 4 is JS-only and needs a separate sub-agent.

---

## Files Affected

| File | Changes |
|------|---------|
| `static/css/kanban-enhanced.css` | Responsive brace fix, new-item-modal padding, remove duplicate btn-danger |
| `static/css/style.css` | Add `touch-action: none` for .task-card |
| `static/js/kanban.js` | Replace touch listeners with pointer events, remove UA guard |
| `templates/kanban.html` | No changes needed |
