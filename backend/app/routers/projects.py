from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.middleware.auth import get_current_user
from app.middleware.ownership import get_project_for_user
from app.models.user import User
from app.models.project import Project
from app.schemas.project import ProjectCreateRequest, ProjectUpdateRequest, ProjectResponse

router = APIRouter(prefix="/api/projects", tags=["Projects"])


@router.get("", response_model=dict, status_code=status.HTTP_200_OK)
def get_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    projects = (
        db.query(Project)
        .filter(Project.user_id == current_user.id)
        .order_by(Project.created_at.desc())
        .all()
    )

    projects_response = [ProjectResponse.model_validate(p).model_dump() for p in projects]

    return {
        "success": True,
        "message": "Projects retrieved successfully",
        "data": projects_response,
    }


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_project = Project(
        name=payload.name,
        color=payload.color or "#3B82F6",
        user_id=current_user.id,
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    project_response = ProjectResponse.model_validate(new_project)

    return {
        "success": True,
        "message": "Project created successfully",
        "data": project_response.model_dump(),
    }


@router.put("/{project_id}", response_model=dict, status_code=status.HTTP_200_OK)
def update_project(
    payload: ProjectUpdateRequest,
    project: Project = Depends(get_project_for_user),
    db: Session = Depends(get_db),
):
    if payload.name is not None:
        project.name = payload.name
    if payload.color is not None:
        project.color = payload.color

    db.commit()
    db.refresh(project)

    project_response = ProjectResponse.model_validate(project)

    return {
        "success": True,
        "message": "Project updated successfully",
        "data": project_response.model_dump(),
    }


@router.delete("/{project_id}", response_model=dict, status_code=status.HTTP_200_OK)
def delete_project(
    project: Project = Depends(get_project_for_user),
    db: Session = Depends(get_db),
):
    db.delete(project)
    db.commit()

    return {
        "success": True,
        "message": "Project and all associated tasks deleted successfully",
        "data": None,
    }
