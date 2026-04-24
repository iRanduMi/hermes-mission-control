---
title: Multi-Agent Kanban Handoff
status: planned
priority: medium
labels: [architecture, multi-agent, mission-control-v2]
created: 2026-04-23
---

# Multi-Agent Kanban Handoff — Implementation Plan

## Overview

Enable Hermes and Dex (two independent HermesAgent instances) to collaborate on tasks via the Mission Control V2 Kanban board. Hermes handles planning/analysis, Dex handles implementation/coding. The Kanban board serves as the shared workspace and handoff mechanism between agents.

## Architecture

```
┌──────────┐     creates task      ┌──────────┐
│  Hermes  │ ─────────────────────► │  Board   │
│ (Planner)│                        │ (V2 API) │
└──────────┘                        └──────────┘
       │                                  │
       │  reads plan complete              │ monitors status
       │                                  ▼
       │                           ┌──────────┐
       │                           │  Watcher  │
       │                           │(fast model)│
       │                           └──────────┘
       │                                  │
       │  <────────── pokes ──────────────┘
       │                                  │
       │  receives feedback ──────────────┘
       ▼
┌──────────┐     implements     ┌──────────┐
│   Dex    │ ──────────────────► │  Board   │
│(Builder) │                     └──────────┘
└──────────┘                            │
                                        │
                              human reviews
                                        ▼
                                    (done)
```

## Board Column Lifecycle

```
Requested → Plan Review → In Progress → Review → Done → Archived
```

| Column | Owner | Meaning |
|--------|-------|---------|
| Requested | Hermes/Dex | Task created, awaiting planning |
| Plan Review | Hermes | Plan written, awaiting review |
| In Progress | Dex | Implementation underway |
| Review | Human | Implementation done, needs review |
| Done | — | Reviewed and accepted |
| Archived | — | Closed, no longer active |

## Task Schema (Mission Control V2 API)

Task fields used for handoff:
- `title` — task name
- `description` — plan + conversation log between agents
- `status` — board column mapping
- `priority` — ordering hint
- `labels` — domain tags (e.g., `frontend`, `backend`, `planning`)
- `column_order` — position within column

### API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `POST /api/tasks` | Create task |
| `GET /api/tasks` | List all tasks |
| `GET /api/tasks/<id>` | Get single task |
| `PATCH /api/tasks/<id>` | Update status/description/priority/labels |
| `PATCH /api/tasks/reorder` | Reorder within column |

## Implementation Items

### Phase 1: Core Handoff Mechanics

#### 1.1 Task Creation Protocol for Hermes
- **What:** Define how Hermes creates tasks with proper structure
- **Details:** When Hermes receives a feature request, it creates a task via `POST /api/tasks` with:
  - Title: clear feature name
  - Description: initial analysis summary
  - Status: `requested`
  - Labels: `planning`, domain-specific tags
- **Status:** NOT STARTED
- **Approach:** Either a new skill or documentation of the pattern

#### 1.2 Plan File Convention
- **What:** Standardize where and how implementation plans are stored
- **Decision (2026-04-23):**
  - **Location:** `~/hermes-mission-control/docs/plans/<feature-name>.md` (separate from task description)
  - **Task description:** Concise overview + link to plan file (see format example below)
  - **Obsidian access:** Plans are a separate vault in Obsidian (not symlinked into wiki vault)
  - **Plan format:** overview, file changes, API specs, tests, risks
- **Format example (task description):**
  ```
  Implement dark mode toggle for the Mission Control V2 dashboard.

  📋 Plan: [docs/plans/dark-mode-toggle.md](file:///Users/atlas/hermes-mission-control/docs/plans/dark-mode-toggle.md)

  Notes:
  - [REVIEW] Missing API spec for color theme endpoint
  - [REVIEW] Need to define CSS variable structure
  ```
- **Status:** DECIDED

#### 1.3 Plan Review Feedback Loop
- **What:** Mechanism for Dex to reject inadequate plans
- **Details:**
  - Dex adds notes to the task description: "[REVIEW] Plan insufficient: ..."
  - Dex messages Hermes with specific feedback
  - Hermes revises plan and re-submits (moves back to `plan_review`)
- **Status:** NOT STARTED
- **Undecided:** How does Dex know when to message Hermes vs. just leave notes on the task?

#### 1.4 Task Assignment Protocol
- **What:** How tasks are assigned to specific agents
- **Decision (2026-04-23):** **Status-based routing + domain labels as secondary hint**
  - `requested` → whoever is available (or watcher assigns)
  - `plan_review` → automatically Hermes
  - `in_progress` → automatically Dex
  - `review` → human
  - Domain labels (`frontend`, `backend`, etc.) are a secondary hint for cases where both agents might plausibly handle something
  - Unlabeled tasks in `in_progress` → flagged by watcher
- **Status:** DECIDED

### Phase 2: Kanban Watcher

#### 2.1 Watcher Architecture Decision
- **What:** Choose implementation approach for the watcher
- **Decision (2026-04-23):** **Option A — Cron job** using a cheap model, runs every 15m
  - Schedule: `every 15m`
  - Model: cheap/fast (see 2.4)
  - Latency acceptable: 15-30 min stale detection is sufficient
  - Can upgrade to Option B later if needed
- **Status:** DECIDED

#### 2.2 Watcher Monitoring Rules
- **What:** Define what conditions trigger what actions
- **Decision (2026-04-23):**
  | Condition | Threshold | Action |
  |-----------|-----------|--------|
  | Task in `requested` | > 5 min | Alert assigned agent |
  | Task in `plan_review` | > 10 min | Alert Hermes to write plan |
  | Task in `in_progress` | > 24h | Alert user (blockage) |
  | Task in `review` | > 2h | Alert user to review |
  | Task with no labels in `in_progress` | Every check | Flag for assignment |
- **Status:** DECIDED

#### 2.3 Watcher Notification Mechanism
- **What:** How the watcher pokes agents/users
- **Details:**
  - To agents: Direct message via Telegram
  - To user: Telegram message with task details
  - Format: concise, actionable messages
- **Status:** NOT STARTED
- **Undecided:** Delivery method? (Telegram DM seems most natural)

#### 2.4 Watcher Model Selection
- **What:** Choose a fast/cheap model for the watcher
- **Decision (2026-04-23):** **Rule-based** — no model needed. Watcher's job is timestamp comparison against defined thresholds, which is deterministic.
- **Details:** The watcher skill reads tasks from the API, compares `updated_at` to thresholds from section 2.2, and reports any overdue items. Only natural language is needed for composing notification messages.
- **Status:** DECIDED

### Phase 3: Dex Implementation Integration

#### 3.1 Dex Kanban Task Pickup
- **What:** How Dex discovers and claims tasks
- **Decision (2026-04-23):** **Option C — Watcher-poked** (with `kanban-task-pickup` skill for claiming)
  - Watcher detects task in `plan_review` and sends a Telegram notification to Dex
  - Dex receives the alert and uses the `kanban-task-pickup` skill to claim the task
  - Dex reads the plan file referenced in the task description and begins implementation
- **Status:** DECIDED

#### 3.2 Dex Implementation Workflow
- **What:** Standard process for Dex when starting a task
- **Decision (2026-04-23):** **PR workflow with multi-step review**
  1. Dex claims task, creates branch `dex/<task-slug>`
  2. Implements according to plan, commits on the branch
  3. Creates PR when moving task to `review`
  4. Adds PR link to task description
- **Post-PR Review Flow:**
  1. **Hermes performs automated code review** on the PR
  2. If approved by Hermes → Hermes sends preview environment URL to user via Telegram
  3. **User manually tests and provides approval** (approve or reject)
  4. If user approves → Hermes merges PR and deploys to production
  5. If user rejects → task moves back to `in_progress` with feedback
- **Status:** DECIDED

### Phase 4: Cross-Agent Communication

#### 4.1 Feedback Message Format
- **What:** Standard format for agent-to-agent messages on the task
- **Decision (2026-04-23):** **Structured format with labeled sections**
  - `[FEEDBACK]` — specific comments on the implementation
  - `[BLOCKERS]` — what's preventing progress
  - `[QUESTIONS]` — things to clarify before proceeding
  - `[DECISIONS]` — key decisions made during implementation
  - Attribution prefix: `[Hermes]` or `[Dex]` for agent messages
- **Example:**
  ```
  [Dex] Implementation Notes:
  [FEEDBACK] Added dark mode toggle to header component
  [DECISIONS] Used CSS variables for theme colors (consistent with V2 design system)
  [BLOCKERS] None
  ```
- **Status:** DECIDED

#### 4.2 Conversation History on Tasks
- **What:** How to maintain a clean history of agent interactions
- **Decision (2026-04-23):** **Separate log file per task**
  - Each task gets its own conversation log at `~/hermes-mission-control/docs/logs/<task-slug>.md`
  - Log is created when the task enters `in_progress`
  - Each entry has timestamp, author ([Hermes] or [Dex]), and content
  - Task description stays clean with just the concise overview + plan link
  - Log is appended to during implementation and review cycles
  - Log is archived when task is archived
- **Status:** DECIDED

### Phase 5: Kanban Board Features

#### 5.1 Activity History on Task Cards
- **What:** Track and display column movement history for each task
- **Decision (2026-04-23):** **Stored as part of task data in the backend API**
  - Task object gains an `activity_log` array field
  - Each entry: `timestamp`, `from_status`, `to_status`, `actor`
  - Task card shows mini timeline (last 5 changes) on hover
  - Full history view available in task modal
  - History is written whenever the task status changes (via `PATCH /api/tasks/<id>`)
  - History persists with the task (not a separate file)
- **Status:** DECIDED (feature for Mission Control V2)

### Decisions Made

| # | Item | Decision |
|---|------|----------|
| 1 | Plan file location | `~/hermes-mission-control/docs/plans/` |
| 2 | Plan access in Obsidian | Separate vault (not symlinked) |
| 3 | Task description format | Concise overview + link to plan file |
| 4 | Watcher approach | Option A — Cron job, every 15m |
| 5 | Watcher time thresholds | requested:5m, plan_review:10m, in_progress:24h, review:2h, unlabeled:immediate |
| 6 | Watcher model type | Rule-based (no model, threshold comparisons only) |
| 7 | Task assignment mechanism | Status-based routing + domain labels as secondary hint |
| 8 | Dex pickup method | Option C — Watcher-poked (with kanban-task-pickup skill for claiming) |
| 9 | Dex implementation method | PR workflow with multi-step review (Dex→Hermes→User→Production) |
| 10 | Feedback format | Structured with labeled sections ([FEEDBACK], [BLOCKERS], [QUESTIONS], [DECISIONS]) |
| 11 | Conversation history | Separate log file per task (`docs/logs/<task-slug>.md`) |
| 12 | Activity history on task cards | Mini timeline (last 5 changes) + full history in modal |

## Remaining Work

The remaining items above are all **DECIDED**. The next step is implementation — building the skills and cron jobs that put this into practice.

## Implementation Order Recommendation

1. ✅ Plan file convention (foundation everyone builds on) — **DONE**
2. ✅ Task creation protocol — **DONE** (kanban-task-creation skill)
3. ✅ Plan review feedback loop — **DONE** (plan-review skill updated)
4. ✅ Kanban Watcher — **DONE** (kanban-watch skill)
5. ✅ Watcher rules/notifications — **DONE** (covered by kanban-watch skill)
6. ✅ Dex task pickup — **DONE** (dex-task-pickup skill)
7. ✅ Task assignment protocol — **DONE** (covered by plan + dex-task-pickup)
8. ✅ Feedback format — **DONE** (feedback-format skill)
9. ✅ Activity history — **DONE** (backend + frontend implementation)

**Status: ALL PHASES IMPLEMENTED — ready for testing**

## Files That Would Be Created/Modified

| File | Purpose |
|------|---------|
| `docs/plans/multi-agent-handoff.md` | This document |
| `skills/kanban-watch` | Watcher skill |
| `skills/plan-review` | Plan review skill |
| `skills/dex-task-pickup` | Dex pickup skill |
| `docs/templates/plan-format.md` | Plan file template |
| `docs/templates/feedback-format.md` | Feedback message template |
| `cron/watcher` | Watcher cron configuration |

## Risks and Considerations

1. **API rate limiting** — watcher polling frequently could hit rate limits
2. **Token cost** — watcher runs frequently; cheap model is important
3. **Conflict resolution** — what if both Hermes and Dex try to work on the same task?
4. **Task orphaning** — what if an agent dies mid-implementation?
5. **Board state consistency** — both agents read/write to the same board

---

*Created during conversation on 2026-04-23*
*To be discussed and finalized in next session*
