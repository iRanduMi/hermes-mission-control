# Mission Control V2 — Implementation Plan

> **Status:** Planning phase — not yet started
> **Created:** 2026-04-22
> **Approach:** Phase-by-phase implementation. Complete one phase, review, then move to the next.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite + TypeScript + Tailwind v4 |
| **UI Components** | Radix UI primitives (dialog, popover, dropdown, tabs) |
| **Drag & Drop** | `@dnd-kit/core` + `@dnd-kit/sortable` |
| **Icons** | Lucide React |
| **Animations** | Framer Motion |
| **Backend** | Python + FastAPI (async, auto-openapi docs) |
| **Database** | SQLite (via SQLAlchemy + Alembic migrations) |
| **Design System** | Linear-inspired dark theme (from popular-web-designs skill) |
| **Dev Server** | FastAPI on `:8000`, Vite on `:5173`, CORS between them |

## Design Language: Linear

- Near-black canvas (`#08090a`), translucent panels (`rgba(255,255,255,0.02–0.05)`)
- Inter Variable font with `cv01, ss03` features
- Indigo-violet accent (`#7170ff`) for primary actions
- Semi-transparent white borders (`rgba(255,255,255,0.08)`)
- Weight 510 as default emphasis, three-tier system (400/510/590)
- Fully responsive — mobile bottom nav, desktop sidebar

## Project Structure

```
~/hermes-mission-control/
├── backend/
│   ├── main.py              # FastAPI app, CORS, routers
│   ├── database.py          # SQLAlchemy engine, session
│   ├── models.py            # SQLAlchemy ORM
│   ├── schemas.py           # Pydantic schemas
│   ├── alembic/             # DB migrations
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── KanbanCard.tsx
│   │   │   ├── KanbanColumn.tsx
│   │   │   ├── TaskModal.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── MonitoringPage.tsx
│   │   │   └── ui/
│   │   ├── hooks/
│   │   │   └── useKanban.ts
│   │   ├── lib/
│   │   │   └── api.ts
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
├── docs/plans/
└── README.md
```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/tasks` | List all tasks with column ordering |
| `POST` | `/api/tasks` | Create a new task |
| `PATCH` | `/api/tasks/{id}` | Update task fields |
| `DELETE` | `/api/tasks/{id}` | Delete a task |
| `PATCH` | `/api/tasks/reorder` | Bulk reorder tasks across columns |
| `GET` | `/api/status` | Health check (monitoring page) |

## Database Schema

```
Task:
  id              -> UUID (primary key)
  title           -> str
  description     -> text (optional, markdown)
  status          -> str (in_progress, plan_review, review, done, blocked)
  priority        -> str (low, medium, high, critical)
  column_order    -> int (position within status)
  labels          -> str (JSON array of labels)
  created_at      -> datetime
  updated_at      -> datetime
  due_date        -> datetime (optional)
```

## Pages

### 1. Kanban Board (Main Page)
- Three columns: **In Progress** → **Plan Review** → **Review** → **Done**
- Add `+` button per column for quick task creation
- Click any card → opens modal with full details
- Drag cards between columns (dnd-kit)
- Drag cards within a column to reorder
- Mobile: columns stack vertically, touch drag

### 2. Monitoring Page (Placeholder)
- Header: "Monitoring"
- Placeholder sections with "Coming soon" badges:
  - **HomeLab Status** — Box 1 (Unraid), Box 2 (Fedora), Box 3 (Mac Mini)
  - **Service Uptime** — Frigate, Mealie, Blue Iris, Home Assistant
  - **Resource Usage** — CPU, RAM, Disk per box
  - **Docker Containers** — Container list with status
- All sections are UI skeletons with mock data

## Responsive Breakpoints

- **Mobile (<640px):** Single-column kanban, bottom nav, compact cards
- **Tablet (640–1024px):** Horizontal kanban with tighter columns
- **Desktop (1024px+):** Full kanban with generous spacing, sidebar navigation

## Deployment

**Now (local dev):**
- FastAPI on `localhost:8000`
- Vite on `localhost:5173`
- CORS configured for `localhost:5173`

**Future (Unraid Docker):**
- Single Dockerfile with multi-stage build
- Tailscale network integration
- HTTPS via Tailscale MagicDNS

## Implementation Phases

### Phase 1 — Backend Foundation
- [ ] Create backend directory structure
- [ ] Set up FastAPI app with SQLAlchemy + SQLite
- [ ] Define SQLAlchemy models (Task) and Pydantic schemas
- [ ] Implement CRUD endpoints (GET list, GET by ID, POST, PATCH, DELETE, reorder)
- [ ] Add Alembic migration setup
- [ ] Test API with curl / FastAPI auto-docs
- [ ] Status: NOT STARTED

### Phase 2 — Frontend Core
- [ ] Scaffold React + Vite + TypeScript project
- [ ] Install dependencies (Tailwind v4, Radix UI, dnd-kit, Lucide, Framer Motion)
- [ ] Configure Tailwind v4 with Linear design tokens
- [ ] Set up routing (react-router-dom or TanStack Router)
- [ ] Implement Header component with navigation
- [ ] Wire up API client (fetch wrappers in `lib/api.ts`)
- [ ] Verify dev server runs and connects to backend
- [ ] Status: NOT STARTED

### Phase 3 — Kanban Board
- [ ] Implement KanbanBoard component with columns
- [ ] Implement KanbanColumn with drop zones
- [ ] Implement KanbanCard component
- [ ] Add drag-and-drop between columns (dnd-kit)
- [ ] Add drag-and-drop within columns for reorder
- [ ] Implement TaskModal (create/edit task)
- [ ] Wire up task creation from column `+` buttons
- [ ] Wire up task updates to API on drag
- [ ] Status: NOT STARTED

### Phase 4 — Polish
- [ ] Add Framer Motion animations (card enter/exit, drag, modal transitions)
- [ ] Implement responsive layouts (mobile stacking, touch drag)
- [ ] Add keyboard shortcuts (e.g., `n` for new task, `/` for search)
- [ ] Add labels/priority UI with color-coded pills
- [ ] Add due date picker in task modal
- [ ] Add empty states (no tasks yet, no search results)
- [ ] Verify mobile layout on real devices
- [ ] Status: NOT STARTED

### Phase 5 — Monitoring Placeholder
- [ ] Implement MonitoringPage component
- [ ] Create placeholder sections:
  - HomeLab Status (Box 1, 2, 3)
  - Service Uptime (Frigate, Mealie, Blue Iris, HA)
  - Resource Usage (CPU, RAM, Disk)
  - Docker Containers
- [ ] Style with Linear design tokens
- [ ] Add "Coming soon" badges
- [ ] Wire mock data to components
- [ ] Status: NOT STARTED

### Phase 6 — DevOps & Docs
- [ ] Write Dockerfile (multi-stage build)
- [ ] Write docker-compose.yml for Unraid deployment
- [ ] Write README with setup/deployment instructions
- [ ] Add .env configuration examples
- [ ] Document API endpoints
- [ ] Status: NOT STARTED

## Notes
- No authentication (Tailscale isolation is sufficient for now)
- Start fresh — no legacy data from current Flask app
- Monitoring page is UI-only placeholder — no actual monitoring logic
- Future migration path: Docker on Unraid with Tailscale exposure
