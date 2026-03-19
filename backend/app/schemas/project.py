from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional
import re


class ProjectCreateRequest(BaseModel):
    name: str
    color: Optional[str] = "#3B82F6"

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Project name cannot be empty")
        if len(v) < 1 or len(v) > 100:
            raise ValueError("Project name must be between 1 and 100 characters")
        return v

    @field_validator("color")
    @classmethod
    def color_is_valid_hex(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return "#3B82F6"
        pattern = r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
        if not re.match(pattern, v):
            raise ValueError("Color must be a valid hex color code (e.g., #3B82F6)")
        return v


class ProjectUpdateRequest(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if not v:
            raise ValueError("Project name cannot be empty")
        if len(v) < 1 or len(v) > 100:
            raise ValueError("Project name must be between 1 and 100 characters")
        return v

    @field_validator("color")
    @classmethod
    def color_is_valid_hex(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        pattern = r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
        if not re.match(pattern, v):
            raise ValueError("Color must be a valid hex color code (e.g., #3B82F6)")
        return v


class ProjectResponse(BaseModel):
    id: str
    name: str
    color: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True
