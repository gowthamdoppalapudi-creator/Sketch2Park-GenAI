from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, AttractionProject, Sketch
from app.schemas import SketchResponse, CannyPreviewRequest, CannyPreviewResponse
from app.auth import get_current_user, require_designer
from app.services.storage import assert_project_access, assert_project_ownership
from app.services.sketch_service import (
    validate_and_process_upload,
    save_sketch_and_conditioning,
    recalculate_conditioning,
)

router = APIRouter(prefix="/api/sketches", tags=["Sketches & Preprocessing"])

@router.post("/upload", response_model=SketchResponse, status_code=status.HTTP_201_CREATED)
async def upload_sketch(
    project_id: int = Form(...),
    low_threshold: int = Form(100),
    high_threshold: int = Form(200),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_designer)
):
    project = db.query(AttractionProject).filter(AttractionProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    assert_project_ownership(current_user, project)

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")

    # Validate file, correct orientation, get dimensions
    img, width, height = validate_and_process_upload(file_bytes, file.filename or "sketch.png")

    # Save original sketch and extract initial Canny edges
    (
        stored_sketch_filename,
        sketch_path,
        stored_cond_filename,
        cond_path,
    ) = save_sketch_and_conditioning(
        img,
        file.filename or "sketch.png",
        low_threshold=low_threshold,
        high_threshold=high_threshold,
    )

    sketch = Sketch(
        project_id=project.id,
        original_filename=file.filename or "sketch.png",
        stored_filename=stored_sketch_filename,
        file_path=sketch_path,
        conditioning_file_path=cond_path,
        canny_low_threshold=low_threshold,
        canny_high_threshold=high_threshold,
        width=width,
        height=height,
    )
    db.add(sketch)
    db.commit()
    db.refresh(sketch)

    return sketch

@router.post("/preview-canny", response_model=CannyPreviewResponse)
def preview_canny_sensitivity(
    req: CannyPreviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sketch = db.query(Sketch).filter(Sketch.id == req.sketch_id).first()
    if not sketch:
        raise HTTPException(status_code=404, detail="Sketch not found.")

    assert_project_access(current_user, sketch.project, db)

    # Recalculate Canny edges
    new_cond_filename, new_cond_path = recalculate_conditioning(
        sketch.file_path,
        low_threshold=req.canny_low_threshold,
        high_threshold=req.canny_high_threshold,
    )

    # Update sketch record with latest thresholds and path
    sketch.canny_low_threshold = req.canny_low_threshold
    sketch.canny_high_threshold = req.canny_high_threshold
    sketch.conditioning_file_path = new_cond_path
    db.commit()

    return CannyPreviewResponse(
        sketch_id=sketch.id,
        conditioning_url=f"/api/files/conditioning/{new_cond_filename}",
        canny_low_threshold=req.canny_low_threshold,
        canny_high_threshold=req.canny_high_threshold,
    )

@router.get("/{sketch_id}", response_model=SketchResponse)
def get_sketch(
    sketch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sketch = db.query(Sketch).filter(Sketch.id == sketch_id).first()
    if not sketch:
        raise HTTPException(status_code=404, detail="Sketch not found.")

    assert_project_access(current_user, sketch.project, db)
    return sketch
