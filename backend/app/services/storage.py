import os
from pathlib import Path
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import User, UserRole, AttractionProject, ProjectReviewer, Sketch, Render
from app.config import settings

def check_project_access(user: User, project: AttractionProject, db: Session) -> bool:
    """
    Checks if a user has permission to view or interact with a project.
    - Admin: always allowed.
    - Designer: allowed if owner of the project.
    - Reviewer: allowed if assigned via ProjectReviewer.
    """
    if user.role == UserRole.ADMIN:
        return True

    if user.id == project.owner_id:
        return True

    assignment = db.query(ProjectReviewer).filter(
        ProjectReviewer.project_id == project.id,
        ProjectReviewer.reviewer_id == user.id
    ).first()

    return assignment is not None

def assert_project_access(user: User, project: AttractionProject, db: Session):
    if not check_project_access(user, project, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this attraction project."
        )

def assert_project_ownership(user: User, project: AttractionProject):
    if user.role != UserRole.ADMIN and user.id != project.owner_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the project owner can perform this modification."
        )

def get_safe_file_path(directory: Path, filename: str) -> Path:
    """
    Resolves filename inside directory, preventing path traversal.
    """
    safe_name = os.path.basename(filename)
    resolved = (directory / safe_name).resolve()
    if not str(resolved).startswith(str(directory.resolve())):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file path."
        )
    return resolved
