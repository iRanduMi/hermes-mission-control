from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


class TaskBase(BaseModel):
    title: str
    description: str = ""
    status: str = "in_progress"
    priority: str = "medium"
    column_order: int = 0
    labels: List[str] = []
    due_date: Optional[datetime] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    column_order: Optional[int] = None
    labels: Optional[List[str]] = None
    due_date: Optional[datetime] = None


class TaskResponse(BaseModel):
    id: str
    title: str
    description: str
    status: str
    priority: str
    column_order: int
    labels: List[str]
    activity_log: List[dict]
    created_at: datetime
    updated_at: datetime
    due_date: Optional[datetime] = None

    model_config = {"from_attributes": True}


class TaskReorderItem(BaseModel):
    id: str
    status: Optional[str] = None
    column_order: Optional[int] = None


class ReorderRequest(BaseModel):
    reorder: List[TaskReorderItem] = Field(...)


class AvatarUploadResponse(BaseModel):
    url: str
    filename: str
    size: int
    mime_type: str

    model_config = {"from_attributes": True}


class StatusResponse(BaseModel):
    status: str = "ok"
    database: str = "connected"
