import uuid
from sqlalchemy import Column, String, Text, Integer, DateTime, func
from sqlalchemy.orm import relationship
from database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    status = Column(String, default="in_progress")
    priority = Column(String, default="medium")
    column_order = Column(Integer, default=0)
    labels = Column(String, default="[]")
    activity_log = Column(String, default="[]")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    due_date = Column(DateTime(timezone=True), nullable=True)
