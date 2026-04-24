# Mobile Modal Padding Fix - Implementation Plan

## Problem

The edit task modal (and new item modal) on the Mission Control Kanban board has excessive padding on mobile devices, causing:
1. Modal takes up too much vertical space on small screens
2. Content feels cramped with large 32px (var(--space-xl)) padding on all sides
3. Inner section padding (header, body, actions) still uses large values on mobile
4. `margin: 1rem` + `max-width: 95vw` creates potential horizontal overflow

## Root Cause Analysis

### Current padding values (desktop):
| Element | Top/Bottom | Left/Right |
|---------|-----------|------------|
| `.modal-content.edit-item-modal` | 32px | 32px |
| `.modal-header` | 24px | 32px |
| `.modal-body` | 32px | 32px |
| `.modal-actions` | 24px | 0 |
| `.history-section` | 24px | 32px |

### Current mobile values (style.css @media max-width: 768px):
| Element | Top/Bottom | Left/Right |
|---------|-----------|------------|
| `.modal-content` | (inherited 32px) | (inherited 32px) |
| `.modal-header/body/actions` | - | 16px |

### Issues:
1. `.modal-content.edit-item-modal` still inherits 32px padding on mobile (too much)
2. `.modal-content.new-item-modal` same issue
3. Inner sections reduced to 16px but still combined with outer 32px = excess whitespace
4. No dedicated mobile breakpoint for the modal - mixing style.css and kanban-enhanced.css

## Plan (4 Steps)

### Step 1: Add mobile-specific modal padding in kanban-enhanced.css
**File:** `static/css/kanban-enhanced.css`
**Location:** Inside existing `@media (max-width: 768px)` block (around line 525)

Reduce `.modal-content.edit-item-modal` and `.modal-content.new-item-modal` padding to `16px` on mobile.

### Step 2: Add mobile-specific inner section padding in kanban-enhanced.css
**File:** `static/css/kanban-enhanced.css`
**Location:** Inside existing `@media (max-width: 768px)` block

Reduce `.modal-header`, `.modal-body` padding to `16px` on all sides (unified, no need to override left/right separately).
- `.modal-actions` padding-top/bottom reduced to 12px (was 24px)
- `.history-section` padding reduced to 12px vertical

### Step 3: Fix horizontal overflow and margin issues in style.css
**File:** `static/css/style.css`
**Location:** Existing `@media (max-width: 768px)` block (around line 1415)

Replace `margin: 1rem` with `margin: 0` for `.modal-content` and use `left: 50%; transform: translateX(-50%)` for centering instead, so `max-width: 95vw` fully controls width.

### Step 4: Verify and test
- Verify the fix renders correctly in mobile viewport
- Check that desktop layout is not affected
- Check both edit-item-modal and new-item-modal

## Files to Modify
1. `~/hermes-mission-control/static/css/kanban-enhanced.css`
2. `~/hermes-mission-control/static/css/style.css`

## Completed Implementation

### Step 1 ✅ — Mobile outer modal padding (kanban-enhanced.css)
- `.modal-content.edit-item-modal` padding: 32px → **16px**
- `.modal-content.new-item-modal` padding: added **16px** (was missing)
- Both get `max-width: calc(100vw - var(--space-xl))` and `max-height: 85vh`

### Step 2 ✅ — Mobile inner section padding (kanban-enhanced.css)
- `.modal-header` padding: **12px 16px** (was 24px 32px)
- `.modal-body` padding: **12px 16px** (was 32px)
- `.modal-actions` padding: **12px top/bottom** (was 24px)
- `.history-section` padding: **12px 16px** (was 24px 32px)

### Step 3 ✅ — Horizontal overflow fix (style.css)
- `.modal-content` margin: `1rem` → `0 auto` (was `95vw + 32px` total width = overflow)

### Total padding reduction summary (mobile):
| Element | Before | After | Reduction |
|---------|--------|-------|-----------|
| Outer padding | 32px all sides | 16px all sides | **-50%** |
| Header | 24px/32px | 12px/16px | **-50%** |
| Body | 32px all sides | 12px/16px | **-62.5%** |
| Actions | 24px vertical | 12px vertical | **-50%** |
