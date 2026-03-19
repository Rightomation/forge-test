from fastapi import Depends, HTTPException, status, Path
from sqlalchemy.orm import Session
from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.task import Task


def get_project_for_user(
    project_id: str = Path(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "message": "Project not found",
                "errors": [{"field": None, "message": f"Project with id '{project_id}' does not exist"}],
            },
        )

    if project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "success": False,
                "message": "Access denied",
                "errors": [{"field": None, "message": "You do not have permission to access this project"}],
            },
        )

    return project


def get_task_for_user(
    task_id: str = Path(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Task:
    task = db.query(Task).filter(Task.id == task_id).first()

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "message": "Task not found",
                "errors": [{"field": None, "message": f"Task with id '{task_id}' does not exist"}],
            },
        )

    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "success": False,
                "message": "Access denied",
                "errors": [{"field": None, "message": "You do not have permission to access this task"}],
            },
        )

    return task
