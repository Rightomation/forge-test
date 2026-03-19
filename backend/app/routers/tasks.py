from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from typing import Optional
from app.database import get_db
from app.middleware.auth import get_current_user
from app.middleware.ownership import get_project_for_user, get_task_for_user
from app.models.user import User
from app.models.project import Project
from app.models.task import Task, Priority
from app.schemas.task import TaskCreateRequest, TaskUpdateRequest, TaskResponse

router = APIRouter(tags=["Tasks"])


@router.get(
    "/api/projects/{project_id}/tasks",
    response_model=dict,
    status_code=status.HTTP_200_OK,
)
def get_tasks(
    priority: Optional[Priority] = Query(None, description="Filter by priority: LOW, MEDIUM, HIGH"),
    completed: Optional[bool] = Query(None, description="Filter by completion status"),
    sort_by_due_date: Optional[str] = Query(None, description="Sort by due date: asc or desc"),
    project: Project = Depends(get_project_for_user),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Task).filter(
        Task.project_id == project.id,
        Task.user_id == current_user.id,
    )

    if priority is not None:
        query = query.filter(Task.priority == priority)

    if completed is not None:
        query = query.filter(Task.completed == completed)

    if sort_by_due_date is not None:
        if sort_by_due_date.lower() == "asc":
            query = query.order_by(asc(Task.due_date))
        elif sort_by_due_date.lower() == "desc":
            query = query.order_by(desc(Task.due_date))
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False,
                    "message": "Invalid sort parameter",
                    "errors": [
                        {
                            "field": "sort_by_due_date",
                            "message": "sort_by_due_date must be 'asc' or 'desc'",
                        }
                    ],
                },
            )
    else:
        query = query.order_by(desc(Task.created_at))

    tasks = query.all()
    tasks_response = [TaskResponse.model_validate(t).model_dump() for t in tasks]

    return {
        "success": True,
        "message": "Tasks retrieved successfully",
        "data": tasks_response,
    }


@router.post(
    "/api/projects/{project_id}/tasks",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
)
def create_task(
    payload: TaskCreateRequest,
    project: Project = Depends(get_project_for_user),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_task = Task(
        title=payload.title,
        description=payload.description,
        due_date=payload.due_date,
        priority=payload.priority or Priority.MEDIUM,
        completed=payload.completed or False,
        project_id=project.id,
        user_id=current_user.id,
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    task_response = TaskResponse.model_validate(new_task)

    return {
        "success": True,
        "message": "Task created successfully",
        "data": task_response.model_dump(),
    }


@router.put(
    "/api/tasks/{task_id}",
    response_model=dict,
    status_code=status.HTTP_200_OK,
)
def update_task(
    payload: TaskUpdateRequest,
    task: Task = Depends(get_task_for_user),
    db: Session = Depends(get_db),
):
    if payload.title is not None:
        task.title = payload.title
    if payload.description is not None:
        task.description = payload.description
    if payload.due_date is not None:
        task.due_date = payload.due_date
    if payload.priority is not None:
        task.priority = payload.priority
    if payload.completed is not None:
        task.completed = payload.completed

    db.commit()
    db.refresh(task)

    task_response = TaskResponse.model_validate(task)

    return {
        "success": True,
        "message": "Task updated successfully",
        "data": task_response.model_dump(),
    }


@router.delete(
    "/api/tasks/{task_id}",
    response_model=dict,
    status_code=status.HTTP_200_OK,
)
def delete_task(
    task: Task = Depends(get_task_for_user),
    db: Session = Depends(get_db),
):
    db.delete(task)
    db.commit()

    return {
        "success": True,
        "message": "Task deleted successfully",
        "data": None,
    }
