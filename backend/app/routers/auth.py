from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
)
from app.core.config import settings
from app.models.user import User
from app.schemas.user import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    TokenResponse,
)
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "success": False,
                "message": "Registration failed",
                "errors": [{"field": "email", "message": "An account with this email already exists"}],
            },
        )

    hashed_password = get_password_hash(payload.password)
    new_user = User(
        email=payload.email,
        password_hash=hashed_password,
        name=payload.name,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(
        subject=new_user.id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    user_response = UserResponse.model_validate(new_user)

    return {
        "success": True,
        "message": "Account created successfully",
        "data": TokenResponse(
            token=access_token,
            token_type="bearer",
            user=user_response,
        ).model_dump(),
    }


@router.post("/login", response_model=dict, status_code=status.HTTP_200_OK)
def login(payload: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "message": "Login failed",
                "errors": [{"field": None, "message": "Invalid email or password"}],
            },
        )

    access_token = create_access_token(
        subject=user.id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    user_response = UserResponse.model_validate(user)

    return {
        "success": True,
        "message": "Login successful",
        "data": TokenResponse(
            token=access_token,
            token_type="bearer",
            user=user_response,
        ).model_dump(),
    }


@router.get("/me", response_model=dict, status_code=status.HTTP_200_OK)
def get_me(current_user: User = Depends(get_current_user)):
    user_response = UserResponse.model_validate(current_user)

    return {
        "success": True,
        "message": "User retrieved successfully",
        "data": user_response.model_dump(),
    }
