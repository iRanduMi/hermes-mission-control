# Kanban Desktop Hover Bug Fix Plan

## Problem
When clicking a task card on desktop, a card clone follows the mouse cursor and doesn't get cleaned up.

## Root Cause Analysis
The code uses Pointer Events (designed for touch/mobile) alongside HTML5 Drag & Drop. On desktop, clicking a card triggers:
1. `pointerdown` → records starting position, sets `isDragging = false`
2. `pointermove` → if cursor moves > 10px, creates a `position: fixed` clone that follows the mouse
3. `pointerup` → should clean up the clone, but doesn't always fire or doesn't work correctly

The fundamental issue: the Pointer Events drag system was designed for touch devices where the user intentionally drags. On desktop, even a normal click with slight mouse movement triggers it.

---

## Phase 1: Isolate the Problem (Diagnosis)

### Step 1: Add console logging to identify event flow
- Add logging to `pointerdown`, `pointermove`, `pointerup`, `pointercancel`, `pointerleave` events
- Log: event type, pointerType ('mouse' vs 'touch'), current isDragging state, pointerCard existence
- Goal: determine exactly which events fire and in what order when the bug occurs

### Step 2: Check for CSS interference
- Inspect `.task-card` CSS for `touch-action: none` that might affect mouse behavior
- Check if any CSS transforms/animations on `.task-card` could cause the card itself to become fixed-position
- Check if the `dragging` class or any other class changes positioning unexpectedly
- Goal: rule out CSS as the source

### Step 3: Verify `isDragging` variable scope
- `isDragging` is used inside `setupDragAndDrop()` but never declared with `let/const` there
- It becomes a global — check if it persists incorrectly across page interactions
- Check if it's ever set to `true` and never reset
- Goal: confirm variable scope is not the culprit

---

## Phase 2: Fix the Core Issue

### Step 4: Restrict Pointer Events drag to touch devices only
- The pointer-based drag system was added for touch/mobile compatibility
- On desktop, HTML5 drag-and-drop (`draggable="true"`) already works
- Add a `pointerType === 'touch'` check in `pointerdown` — only start the pointer drag for touch input
- Goal: prevent mouse clicks from ever triggering the pointer drag system

### Step 5: If pointer drag must work on desktop too, add proper cleanup
- If the pointer drag needs to work on desktop, ensure `pointerup` always fires
- Add a `document.addEventListener('pointerup', ...)` with `capture: true` to ensure it fires
- Add `pointercancel` handler that always cleans up
- Add `pointerleave` handler that always cleans up
- Add `mouseenter` on `window` check to detect if pointer left the viewport
- Goal: ensure the clone is always cleaned up

### Step 6: Fix the `cleanupPointer` function
- Review `cleanupPointer()` to ensure it removes ALL visual artifacts
- Ensure it removes the clone from DOM
- Ensure it resets ALL inline styles on `pointerCard`
- Ensure it removes the `dragging` class
- Goal: one-shot cleanup that leaves no residual state

---

## Phase 3: Prevent Recurrence

### Step 7: Add a safety mechanism — global cleanup on interval
- Add a `setInterval` check every 500ms that verifies `pointerClone` doesn't exist when not dragging
- If `pointerClone` exists and `!isDragging`, destroy it and reset state
- Goal: safety net that catches any cleanup failure

### Step 8: Add explicit desktop/mobile detection
- Create a function `isTouchDevice()` that checks `pointerType` or `navigator.maxTouchPoints`
- Only bind pointer-based drag listeners on touch devices
- On desktop, rely solely on HTML5 drag-and-drop
- Goal: architectural separation of touch vs desktop drag behavior

### Step 9: Test on both desktop and touch
- Desktop: click cards, verify no hover behavior
- Desktop: drag-and-drop should still work via HTML5 DnD
- Touch: drag-and-drop should still work via pointer events
- Edge cases: rapid clicking, clicking while dragging, mouse leaving viewport
- Goal: verify fix works in all scenarios

---

## Risk Assessment
- **Risk**: Removing pointer-based drag on desktop could break touch/laptop with touch
- **Mitigation**: Use `pointerType === 'touch'` check, not `navigator.maxTouchPoints` (unreliable)
- **Risk**: HTML5 DnD doesn't work on mobile — but it's already disabled via `touch-action: none` on cards
