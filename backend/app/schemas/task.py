from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional
from app.models.task import Priority


class TaskCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[Priority] = Priority.MEDIUM
    completed: Optional[bool] = False

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Task title cannot be empty")
        if len(v) > 200:
            raise ValueError("Task title must be 200 characters or fewer")
        return v

    @field_validator("description")
    @classmethod
    def description_max_length(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if len(v) > 2000:
            raise ValueError("Description must be 2000 characters or fewer")
        return v


class TaskUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[Priority] = None
    completed: Optional[bool] = None

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if not v:
            raise ValueError("Task title cannot be empty")
        if len(v) > 200:
            raise ValueError("Task title must be 200 characters or fewer")
        return v

    @field_validator("description")
    @classmethod
    def description_max_length(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if len(v) > 2000:
            raise ValueError("Description must be 2000 characters or fewer")
        return v


class TaskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    due_date: Optional[datetime]
    priority: Priority
    completed: bool
    project_id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
