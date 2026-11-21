from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    User,
    UserRole,
    Render,
    RenderStatus,
    Review,
    ReviewDecision,
    GenerationRequest,
    Sketch,
)
from app.schemas import (
    ReviewCreateRequest,
    ReviewResponse,
    RenderResponse,
    ConceptSheetResponse,
    GenerationCreateRequest,
)
from app.auth import get_current_user, require_designer, require_reviewer
from app.services.storage import assert_project_access, assert_project_ownership

router = APIRouter(prefix="/api/reviews", tags=["Reviews & Approval"])

@router.post("/submit/{render_id}", response_model=RenderResponse)
def submit_render_for_review(
    render_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_designer)
):
    """Designer submits a draft render for stakeholder review."""
    render = db.query(Render).filter(Render.id == render_id).first()
    if not render:
        raise HTTPException(status_code=404, detail="Render not found.")

    project = render.generation_request.sketch.project
    assert_project_ownership(current_user, project)

    render.status = RenderStatus.SUBMITTED
    db.commit()
    db.refresh(render)
    return render

@router.post("/decision/{render_id}", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def submit_review_decision(
    render_id: int,
    review_in: ReviewCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_reviewer)
):
    """
    Reviewer submits a decision (Approved / Changes Requested / Rejected) with comment.
    Enforces that approval of an older version never automatically approves a newer one.
    """
    render = db.query(Render).filter(Render.id == render_id).first()
    if not render:
        raise HTTPException(status_code=404, detail="Render not found.")

    project = render.generation_request.sketch.project
    assert_project_access(current_user, project, db)

    # Record review decision
    review = Review(
        render_id=render.id,
        reviewer_id=current_user.id,
        comment=review_in.comment,
        decision=review_in.decision,
    )
    db.add(review)

    # Update this render's specific status
    if review_in.decision == ReviewDecision.APPROVED:
        render.status = RenderStatus.APPROVED
    elif review_in.decision == ReviewDecision.CHANGES_REQUESTED:
        render.status = RenderStatus.CHANGES_REQUESTED
    elif review_in.decision == ReviewDecision.REJECTED:
        render.status = RenderStatus.REJECTED

    db.commit()
    db.refresh(review)
    return review

@router.get("/render/{render_id}", response_model=RenderResponse)
def get_render_details(
    render_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    render = db.query(Render).filter(Render.id == render_id).first()
    if not render:
        raise HTTPException(status_code=404, detail="Render not found.")

    assert_project_access(current_user, render.generation_request.sketch.project, db)
    return render

@router.get("/concept-sheet/{render_id}", response_model=ConceptSheetResponse)
def get_concept_sheet(
    render_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generates printable concept sheet metadata for stakeholder presentation.
    """
    render = db.query(Render).filter(Render.id == render_id).first()
    if not render:
        raise HTTPException(status_code=404, detail="Render not found.")

    gen_req = render.generation_request
    sketch = gen_req.sketch
    project = sketch.project

    assert_project_access(current_user, project, db)

    # Version tag: V1 or V2 (revision of render X)
    version_tag = f"Rev-{gen_req.id} (Render #{render.id})"
    if gen_req.source_render_id:
        version_tag += f" [Revision of #{gen_req.source_render_id}]"

    return ConceptSheetResponse(
        project_title=project.title,
        attraction_type=project.attraction_type,
        description=project.description,
        owner_name=project.owner.full_name or project.owner.username,
        original_sketch_url=f"/api/files/sketches/{sketch.stored_filename}",
        conditioning_image_url=f"/api/files/conditioning/{sketch.conditioning_file_path.split('/')[-1].split(chr(92))[-1]}",
        selected_render_url=f"/api/files/renders/{render.image_filename}",
        render_id=render.id,
        final_prompt=gen_req.prompt,
        negative_prompt=gen_req.negative_prompt,
        version_tag=version_tag,
        source_render_id=gen_req.source_render_id,
        review_status=render.status.value,
        reviews=render.reviews,
        controlnet_scale=gen_req.controlnet_scale,
        seed=render.seed,
        model_name=gen_req.model_name,
        created_at=render.created_at,
    )
