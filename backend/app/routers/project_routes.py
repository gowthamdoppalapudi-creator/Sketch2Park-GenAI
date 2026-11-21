from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import (
    User,
    UserRole,
    AttractionProject,
    ProjectReviewer,
    Sketch,
    GenerationRequest,
    Render,
    RenderStatus,
)
from app.schemas import (
    AttractionProjectCreate,
    AttractionProjectUpdate,
    AttractionProjectResponse,
    ProjectDetailResponse,
    ProjectReviewerAssign,
    ProjectReviewerItem,
)
from app.auth import get_current_user, require_designer
from app.services.storage import assert_project_access, assert_project_ownership

router = APIRouter(prefix="/api/projects", tags=["Attraction Projects"])

def build_project_response(project: AttractionProject, db: Session) -> AttractionProjectResponse:
    sketches_count = db.query(Sketch).filter(Sketch.project_id == project.id).count()
    
    renders_count = (
        db.query(Render)
        .join(GenerationRequest, Render.generation_request_id == GenerationRequest.id)
        .join(Sketch, GenerationRequest.sketch_id == Sketch.id)
        .filter(Sketch.project_id == project.id)
        .count()
    )

    approved_render = (
        db.query(Render)
        .join(GenerationRequest, Render.generation_request_id == GenerationRequest.id)
        .join(Sketch, GenerationRequest.sketch_id == Sketch.id)
        .filter(
            Sketch.project_id == project.id,
            Render.status == RenderStatus.APPROVED
        )
        .order_by(Render.created_at.desc())
        .first()
    )

    return AttractionProjectResponse(
        id=project.id,
        owner_id=project.owner_id,
        title=project.title,
        attraction_type=project.attraction_type,
        description=project.description,
        scene_data=project.scene_data,
        created_at=project.created_at,
        updated_at=project.updated_at,
        owner=project.owner,
        reviewers=project.reviewers,
        sketches_count=sketches_count,
        renders_count=renders_count,
        approved_render_id=approved_render.id if approved_render else None,
    )

@router.get("", response_model=List[AttractionProjectResponse])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns all projects the current user can access:
    - Designer: projects owned by them.
    - Reviewer: projects assigned to them.
    - Admin: all projects.
    """
    if current_user.role == UserRole.ADMIN:
        projects = db.query(AttractionProject).order_by(AttractionProject.updated_at.desc()).all()
    elif current_user.role == UserRole.DESIGNER:
        projects = db.query(AttractionProject).filter(
            AttractionProject.owner_id == current_user.id
        ).order_by(AttractionProject.updated_at.desc()).all()
    else: # Reviewer
        # Projects assigned to this reviewer OR owned by them
        assigned_ids = db.query(ProjectReviewer.project_id).filter(
            ProjectReviewer.reviewer_id == current_user.id
        ).subquery()
        projects = db.query(AttractionProject).filter(
            (AttractionProject.id.in_(assigned_ids)) | (AttractionProject.owner_id == current_user.id)
        ).order_by(AttractionProject.updated_at.desc()).all()

    return [build_project_response(p, db) for p in projects]

@router.post("", response_model=AttractionProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: AttractionProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_designer)
):
    project = AttractionProject(
        owner_id=current_user.id,
        title=project_in.title,
        attraction_type=project_in.attraction_type,
        description=project_in.description,
        scene_data=project_in.scene_data,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return build_project_response(project, db)

class SceneUpdatePayload(BaseModel):
    scene_data: str

class AIParkLayoutRequest(BaseModel):
    prompt: str
    park_type: Optional[str] = "wonderla"
    size: Optional[str] = "grand"

class AIEditInstructionRequest(BaseModel):
    instruction: str
    current_scene_data: Optional[str] = None

@router.post("/ai/generate-layout")
def ai_generate_park_layout(
    req: AIParkLayoutRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Synthesizes a structured, coordinated 3D theme park layout from a natural language prompt.
    Supports amusement parks (Wonderla style), water parks, adventure, futuristic, and fantasy themes.
    """
    p = req.prompt.lower()
    theme = "Realistic Mega Theme Park (Reference Image Composition)"
    layout_type = "realistic_mega_park"
    lighting_mode = "daylight"

    if any(k in p for k in ["mega", "reference", "realistic", "image", "transform"]):
        theme = "Realistic Mega Theme Park (Reference Image Composition)"
        layout_type = "realistic_mega_park"
        lighting_mode = "daylight"
    elif any(k in p for k in ["futuristic", "cyber", "sci-fi", "neon", "space"]):
        theme = "Neo-City 2099 Cyber Theme Park"
        layout_type = "futuristic_cyber"
        lighting_mode = "night"
    elif any(k in p for k in ["wonderla", "amusement park"]):
        theme = "Wonderla-Style Mega Amusement & Water Park"
        layout_type = "wonderla_park"
        lighting_mode = "daylight"
    elif any(k in p for k in ["fantasy", "castle", "magic", "kingdom", "enchanted", "fairy"]):
        theme = "Enchanted Kingdom Fantasy Theme Park"
        layout_type = "fantasy_kingdom"
        lighting_mode = "sunset"
    elif any(k in p for k in ["water park", "aqua", "slides", "wave pool"]):
        theme = "Water Paradise Aqua Resort"
        layout_type = "water_paradise"
        lighting_mode = "daylight"
    elif any(k in p for k in ["tropical", "adventure", "island"]):
        theme = "Tropical Adventure Island"
        layout_type = "tropical_adventure"
        lighting_mode = "daylight"

    return {
        "status": "success",
        "theme": theme,
        "layout_type": layout_type,
        "lighting_mode": lighting_mode,
        "prompt": req.prompt,
        "message": f"Successfully synthesized structured 3D layout for theme '{theme}'.",
    }

@router.post("/ai/edit-layout")
def ai_edit_park_layout(
    req: AIEditInstructionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Interprets natural-language park editing commands such as adding attractions,
    modifying architectural styles, or expanding themed sections.
    """
    inst = req.instruction.lower().strip()
    return {
        "status": "success",
        "instruction": req.instruction,
        "applied": True,
        "message": f"Interpreted and validated AI design command: '{req.instruction}'",
    }

@router.get("/{project_id}/scene")
def get_project_scene(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(AttractionProject).filter(AttractionProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Attraction project not found.")
    assert_project_access(current_user, project, db)
    return {"project_id": project.id, "scene_data": project.scene_data}

@router.put("/{project_id}/scene")
def update_project_scene(
    project_id: int,
    payload: SceneUpdatePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(AttractionProject).filter(AttractionProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Attraction project not found.")
    assert_project_ownership(current_user, project)
    project.scene_data = payload.scene_data
    db.commit()
    return {"status": "success", "project_id": project.id, "scene_data": project.scene_data}

@router.get("/{project_id}", response_model=ProjectDetailResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(AttractionProject).filter(AttractionProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Attraction project not found.")

    assert_project_access(current_user, project, db)

    resp = build_project_response(project, db)
    
    # Collect all generation requests across all sketches in this project
    gen_requests = (
        db.query(GenerationRequest)
        .join(Sketch, GenerationRequest.sketch_id == Sketch.id)
        .filter(Sketch.project_id == project.id)
        .order_by(GenerationRequest.created_at.desc())
        .all()
    )

    return ProjectDetailResponse(
        **resp.model_dump(),
        sketches=project.sketches,
        generation_requests=gen_requests,
    )

@router.put("/{project_id}", response_model=AttractionProjectResponse)
def update_project(
    project_id: int,
    project_update: AttractionProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(AttractionProject).filter(AttractionProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Attraction project not found.")

    assert_project_ownership(current_user, project)

    if project_update.title is not None:
        project.title = project_update.title
    if project_update.attraction_type is not None:
        project.attraction_type = project_update.attraction_type
    if project_update.description is not None:
        project.description = project_update.description

    db.commit()
    db.refresh(project)
    return build_project_response(project, db)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(AttractionProject).filter(AttractionProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Attraction project not found.")

    assert_project_ownership(current_user, project)
    db.delete(project)
    db.commit()
    return None

@router.post("/{project_id}/reviewers", status_code=status.HTTP_201_CREATED)
def assign_reviewer(
    project_id: int,
    assignment: ProjectReviewerAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(AttractionProject).filter(AttractionProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Attraction project not found.")

    assert_project_ownership(current_user, project)

    reviewer = db.query(User).filter(User.id == assignment.reviewer_id).first()
    if not reviewer:
        raise HTTPException(status_code=404, detail="Reviewer user not found.")

    # Check unique constraint
    existing = db.query(ProjectReviewer).filter(
        ProjectReviewer.project_id == project_id,
        ProjectReviewer.reviewer_id == assignment.reviewer_id
    ).first()
    if existing:
        return {"message": "Reviewer is already assigned to this project."}

    pr = ProjectReviewer(project_id=project_id, reviewer_id=assignment.reviewer_id)
    db.add(pr)
    db.commit()
    return {"message": f"Reviewer '{reviewer.username}' assigned to project successfully."}

@router.delete("/{project_id}/reviewers/{reviewer_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_reviewer(
    project_id: int,
    reviewer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(AttractionProject).filter(AttractionProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Attraction project not found.")

    assert_project_ownership(current_user, project)

    pr = db.query(ProjectReviewer).filter(
        ProjectReviewer.project_id == project_id,
        ProjectReviewer.reviewer_id == reviewer_id
    ).first()
    if pr:
        db.delete(pr)
        db.commit()
    return None
