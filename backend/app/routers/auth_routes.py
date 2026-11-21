from datetime import timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, UserRole
from app.schemas import UserCreate, UserResponse, Token, UserLogin
from app.auth import hash_password, verify_password, create_access_token, get_current_user
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if username or email exists
    existing = db.query(User).filter(
        (User.username == user_data.username) | (User.email == user_data.email)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered."
        )

    user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name or user_data.username,
        hashed_password=hash_password(user_data.password),
        role=user_data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.username, "role": user.role.value})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.username == login_data.username) | (User.email == login_data.username)
    ).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(data={"sub": user.username, "role": user.role.value})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/reviewers", response_model=List[UserResponse])
def get_all_reviewers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reviewers = db.query(User).filter(
        (User.role == UserRole.REVIEWER) | (User.role == UserRole.ADMIN)
    ).all()
    return reviewers

@router.post("/demo-login/{role}", response_model=Token)
def demo_login(role: str, db: Session = Depends(get_db)):
    """
    1-Click demo authentication for university viva and presentation.
    Role can be 'designer' or 'reviewer'.
    """
    target_role = UserRole.DESIGNER if role.lower() == "designer" else UserRole.REVIEWER
    user = db.query(User).filter(User.role == target_role).first()
    if not user:
        # Fallback to any user
        user = db.query(User).first()
        if not user:
            raise HTTPException(status_code=404, detail="No demo accounts seeded yet.")

    token = create_access_token(data={"sub": user.username, "role": user.role.value})
    return {"access_token": token, "token_type": "bearer", "user": user}
