import os
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app.models import User, Sketch, Render, AttractionProject
from app.auth import get_current_user, oauth2_scheme
from app.services.storage import check_project_access, get_safe_file_path
import jwt

router = APIRouter(prefix="/api/files", tags=["Secure Image Files"])

def resolve_user_from_header_or_query(
    token_query: Optional[str] = Query(None, alias="token"),
    auth_header: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    token = auth_header or token_query
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        if not username:
            return None
        return db.query(User).filter(User.username == username).first()
    except Exception:
        return None

@router.get("/{category}/{filename}")
def get_secure_file(
    category: str,
    filename: str,
    user: Optional[User] = Depends(resolve_user_from_header_or_query),
    db: Session = Depends(get_db)
):
    """
    Secure file streaming with permission enforcement:
    - Verifies that user is authenticated and has permission to access the project
      associated with the requested sketch or render.
    - Prevents unauthorized access or cross-project data leakage.
    """
    valid_categories = {
        "sketches": settings.SKETCHES_DIR,
        "conditioning": settings.CONDITIONING_DIR,
        "renders": settings.RENDERS_DIR,
        "samples": settings.SAMPLES_DIR,
    }

    if category not in valid_categories:
        raise HTTPException(status_code=400, detail="Invalid file category.")

    directory = valid_categories[category]
    file_path = get_safe_file_path(directory, filename)

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Requested image file not found.")

    # Samples are accessible to all authenticated users (or demo viewers)
    if category == "samples":
        return FileResponse(file_path)

    # For sketches, conditioning, and renders, enforce project access permissions
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to view project assets."
        )

    # Permission check for sketches or conditioning
    if category in ["sketches", "conditioning"]:
        sketch = (
            db.query(Sketch)
            .filter(
                (Sketch.stored_filename == filename)
                | (Sketch.file_path.endswith(filename))
                | (Sketch.conditioning_file_path.endswith(filename))
            )
            .first()
        )
        if sketch and not check_project_access(user, sketch.project, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view sketches for this project."
            )

    # Permission check for renders
    elif category == "renders":
        render = db.query(Render).filter(Render.image_filename == filename).first()
        if render and render.generation_request and render.generation_request.sketch:
            project = render.generation_request.sketch.project
            if not check_project_access(user, project, db):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to view renders for this project."
                )

    # Determine mime type
    ext = file_path.suffix.lower()
    media_type = "image/png" if ext == ".png" else "image/jpeg"

    return FileResponse(file_path, media_type=media_type)
