---
title: Fix bucket info popup text readability for overlaid cards
task_id: 4498144c-5b9b-4562-a012-a0c84ce73e3c
status: planned
priority: medium
labels: [frontend, enhancement, ux]
created: 2026-04-27
---

# Technical Plan: Fix Bucket Info Popup Text Readability

## Problem

The bucket info popup (opened by clicking the column header) has text that's hard to read when task cards appear underneath it. The root cause is insufficient text contrast:

- **Description text** uses `text-text-muted` → 35% opacity (light) / 40% (dark) — too faint
- **Next steps value** uses `text-text-muted` → same low opacity
- **Column title** uses `text-text-secondary` → 55% (light) / 65% (dark) — borderline readable

The popup background (`bg-panel` = `rgba(0,0,0,0.04)` light / `rgba(255,255,255,0.03)` dark) is semi-transparent, so underlying task cards bleed through and compound the readability issue.

## Solution

Increase text contrast by bumping text color classes up one level in the hierarchy. No structural or architectural changes needed — purely CSS class substitutions.

## File to Modify

**`frontend/src/components/KanbanColumn.tsx`** — 3 targeted changes in the popup JSX (lines 106–143)

### Change 1: Column title — `text-text-secondary` → `text-text-primary`

**Line 119:**
```diff
- <span className="text-sm font-semibold text-text-secondary">{column.title}</span>
+ <span className="text-sm font-semibold text-text-primary">{column.title}</span>
```

### Change 2: Description text — `text-text-muted` → `text-text-secondary`

**Line 134:**
```diff
- <p className="text-xs text-text-muted leading-relaxed">{column.description}</p>
+ <p className="text-xs text-text-secondary leading-relaxed">{column.description}</p>
```

### Change 3: Next steps value — `text-text-muted` → `text-text-secondary`

**Line 140:**
```diff
- <span className="text-text-muted">{column.nextSteps}</span>
+ <span className="text-text-secondary">{column.nextSteps}</span>
```

## Color Reference (from `globals.css`)

| Class | Light Mode | Dark Mode |
|---|---|---|
| `text-text-primary` | `#1a1a2e` (full) | `rgba(240,240,245,0.95)` |
| `text-text-secondary` | `rgba(0,0,0,0.55)` | `rgba(200,200,210,0.65)` |
| `text-text-muted` | `rgba(0,0,0,0.35)` | `rgba(160,160,175,0.40)` |

After changes, the popup text hierarchy becomes:
1. **Column title** → `text-primary` (fully opaque) — highest emphasis
2. **Description** → `text-secondary` (55%/65% opacity) — clearly readable
3. **Next steps label** → `text-secondary` (unchanged, already correct)
4. **Next steps value** → `text-secondary` (upgraded from muted)

## Why Not Change the Popup Background?

The popup uses `bg-panel` which is the standard panel surface color. Making it fully opaque would create visual inconsistency with other popups in the app. The text color changes alone resolve the contrast issue without introducing a solid background that could look jarring.

## Testing Strategy

1. Open the Kanban board in browser
2. Click the info trigger on each column header to open the popup
3. Verify all popup text is clearly readable (title, description, next steps)
4. Verify popup is readable when positioned over task cards
5. Verify mobile bottom-sheet version (< 360px) also has readable text
6. Verify in both light and dark modes
7. Confirm no console errors or warnings
8. Confirm no regression in drag-and-drop, add-task, or popup close behavior

## Risk Assessment

- **Risk: LOW** — cosmetic-only changes, no functional impact
- **Scope: Narrow** — 3 CSS class substitutions in one file
- **Rollback: Trivial** — revert the 3 class names

## Implementation Steps

1. Open `frontend/src/components/KanbanColumn.tsx`
2. Apply the 3 class substitutions listed above
3. Run `npm run build` to verify no build errors
4. Manual visual verification in browser (light + dark mode)
