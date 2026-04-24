# Mission Control v2

A Linear-inspired dark-themed Kanban board for project tracking. Built with React, FastAPI, and SQLite.

## Features

- **Drag & drop** task management with DndKit
- **Linear-inspired** dark theme with polished UI
- **Responsive** — works on desktop and mobile
- **Priority labels** with color-coded pills
- **Due dates** and comma-separated labels
- **Full CRUD** via REST API
- **Auto-open** Swagger docs at `/api/docs`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + TypeScript + Tailwind v4 |
| UI | Radix UI primitives |
| Icons | Lucide React |
| Animations | Framer Motion |
| Backend | Python + FastAPI |
| Database | SQLite (SQLAlchemy + Alembic) |

## Quick Start (Dev)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
# → http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

## Docker Deployment

```bash
docker-compose up --build
# → http://localhost:8080 (frontend)
# → http://localhost:8080/api/docs (backend API docs)
```

## Unraid Deployment

1. Copy `docker-compose.yml` to your Unraid `docker` directory (e.g., `/mnt/user/appdata/mission-control/`)
2. Run: `docker compose up -d --build`
3. Access the board at your Unraid IP on port 8080

**Data persistence:** SQLite database is stored in the `mission-data` Docker volume under `/app` in the backend container. Back up this volume regularly.

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/{id}` | Update a task |
| DELETE | `/api/tasks/{id}` | Delete a task |
| PATCH | `/api/tasks/reorder` | Reorder tasks across columns |
| GET | `/api/status` | Health check |

Auto-generated docs: `http://localhost:8080/api/docs` (or `/api/redoc` for ReDoc).

## Development

```bash
# Run both services
docker-compose up

# Build only
docker-compose build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Design

Inspired by [Linear](https://linear.app) — near-black canvas, translucent panels, indigo-violet accent (`#7170ff`), and semi-transparent borders.
