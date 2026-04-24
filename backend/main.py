from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import json
import uuid
from datetime import datetime
import os
import shutil

from database import engine, Base, get_db
from models import Task
from schemas import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    ReorderRequest,
    StatusResponse,
    AvatarUploadResponse,
)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mission Control v2 API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)


# --- Endpoints ---

@app.get("/api/status", response_model=StatusResponse)
def get_status():
    return StatusResponse(status="ok", database="connected")


@app.get("/api/tasks", response_model=List[TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    tasks = db.query(Task).order_by(Task.status, Task.column_order).all()
    result = []
    for t in tasks:
        activity_log = json.loads(t.activity_log) if t.activity_log else []
        result.append(TaskResponse(
            id=t.id,
            title=t.title,
            description=t.description,
            status=t.status,
            priority=t.priority,
            column_order=t.column_order,
            labels=json.loads(t.labels) if t.labels else [],
            activity_log=activity_log,
            created_at=t.created_at,
            updated_at=t.updated_at,
            due_date=t.due_date,
        ))
    return result


@app.post("/api/tasks", response_model=TaskResponse, status_code=201)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    if not task.title or not task.title.strip():
        raise HTTPException(status_code=422, detail="Title is required")
    if task.priority not in ("low", "medium", "high", "critical"):
        task.priority = "medium"
    # Auto-assign column_order: max in that status + 1
    max_order = db.query(func.coalesce(func.max(Task.column_order), 0)).filter(
        Task.status == task.status
    ).scalar()
    column_order = (max_order or 0) + 1

    task_dict = task.model_dump()
    task_dict["labels"] = json.dumps(task_dict.get("labels", []))
    task_dict["activity_log"] = "[]"
    task_dict["column_order"] = column_order
    task_dict["id"] = str(uuid.uuid4())

    db_task = Task(**task_dict)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    activity_log = json.loads(db_task.activity_log) if db_task.activity_log else []
    return TaskResponse(
        id=db_task.id,
        title=db_task.title,
        description=db_task.description,
        status=db_task.status,
        priority=db_task.priority,
        column_order=db_task.column_order,
        labels=json.loads(db_task.labels) if db_task.labels else [],
        activity_log=activity_log,
        created_at=db_task.created_at,
        updated_at=db_task.updated_at,
        due_date=db_task.due_date,
    )


# NOTE: Reorder must come BEFORE {task_id} routes to avoid route collision
@app.patch("/api/tasks/reorder")
def reorder_tasks(request: ReorderRequest, db: Session = Depends(get_db)):
    for item in request.reorder:
        db_task = db.query(Task).filter(Task.id == item.id).first()
        if not db_task:
            raise HTTPException(status_code=404, detail=f"Task {item.id} not found")
        if item.status is not None:
            db_task.status = item.status
        if item.column_order is not None:
            db_task.column_order = item.column_order
    db.commit()
    return {"message": f"Reordered {len(request.reorder)} tasks"}


@app.patch("/api/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: str, task: TaskUpdate, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task.model_dump(exclude_unset=True)
    if "labels" in update_data:
        update_data["labels"] = json.dumps(update_data["labels"])

    # Log status change to activity log
    old_status = db_task.status
    if "status" in update_data and update_data["status"] != old_status:
        activity_log = json.loads(db_task.activity_log) if db_task.activity_log else []
        entry = {
            "timestamp": datetime.now().isoformat(),
            "from_status": old_status,
            "to_status": update_data["status"],
        }
        activity_log.append(entry)
        # Keep only the last 50 entries
        if len(activity_log) > 50:
            activity_log = activity_log[-50:]
        db_task.activity_log = json.dumps(activity_log)

    for key, value in update_data.items():
        setattr(db_task, key, value)

    db.commit()
    db.refresh(db_task)

    activity_log = json.loads(db_task.activity_log) if db_task.activity_log else []
    return TaskResponse(
        id=db_task.id,
        title=db_task.title,
        description=db_task.description,
        status=db_task.status,
        priority=db_task.priority,
        column_order=db_task.column_order,
        labels=json.loads(db_task.labels) if db_task.labels else [],
        activity_log=activity_log,
        created_at=db_task.created_at,
        updated_at=db_task.updated_at,
        due_date=db_task.due_date,
    )


@app.post("/api/users/avatar/upload", response_model=AvatarUploadResponse)
def upload_avatar(user_id: str, file: UploadFile = File(...)):
    """Upload a user avatar image. Stores locally under /avatars/."""
    AVATAR_DIR = os.path.join(os.path.dirname(__file__), "..", "avatars")
    AVATAR_DIR = os.path.abspath(AVATAR_DIR)
    os.makedirs(AVATAR_DIR, exist_ok=True)

    # Validate file type
    allowed_types = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Invalid file type: {file.content_type}. Allowed: {', '.join(sorted(allowed_types))}")

    # Validate file size (5MB limit)
    MAX_SIZE = 5 * 1024 * 1024
    content = file.file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail=f"File too large: {len(content)} bytes (max {MAX_SIZE})")

    # Generate safe filename
    ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    filename = f"{user_id}{ext}"
    filepath = os.path.join(AVATAR_DIR, filename)

    # Save file
    with open(filepath, "wb") as f:
        f.write(content)

    return AvatarUploadResponse(
        url=f"/avatars/{filename}",
        filename=filename,
        size=len(content),
        mime_type=file.content_type,
    )


@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: str, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(db_task)
    db.commit()
    return {"message": "Task deleted"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
