from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    User,
    Sketch,
    GenerationRequest,
    Render,
    JobStatus,
    RenderStatus,
)
from app.schemas import (
    GenerationCreateRequest,
    GenerationRequestResponse,
    RenderResponse,
)
from app.auth import get_current_user, require_designer
from app.services.storage import assert_project_access, assert_project_ownership
from app.services.generator import (
    model_status,
    run_generation_background_task,
)

router = APIRouter(prefix="/api/generation", tags=["Generation Studio"])

@router.get("/model-status")
def get_model_status(current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    """Returns runtime model environment, device, and supported modes."""
    return model_status.get_info()

@router.post("/request", response_model=GenerationRequestResponse, status_code=status.HTTP_201_CREATED)
def create_generation_request(
    gen_in: GenerationCreateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_designer)
):
    sketch = db.query(Sketch).filter(Sketch.id == gen_in.sketch_id).first()
    if not sketch:
        raise HTTPException(status_code=404, detail="Sketch not found.")

    assert_project_ownership(current_user, sketch.project)

    # Optional source render validation (when creating a revision)
    if gen_in.source_render_id:
        source_render = db.query(Render).filter(Render.id == gen_in.source_render_id).first()
        if not source_render:
            raise HTTPException(status_code=404, detail="Source render for revision not found.")

    model_name = (
        "Prepared Sample Demo Suite (Sunset Coaster)"
        if gen_in.is_sample_demo
        else model_status.model_name
    )

    gen_req = GenerationRequest(
        sketch_id=sketch.id,
        source_render_id=gen_in.source_render_id,
        prompt=gen_in.prompt,
        negative_prompt=gen_in.negative_prompt,
        theme=gen_in.theme,
        materials=gen_in.materials,
        time_of_day=gen_in.time_of_day,
        weather=gen_in.weather,
        surroundings=gen_in.surroundings,
        controlnet_scale=gen_in.controlnet_scale,
        guidance_scale=gen_in.guidance_scale,
        num_inference_steps=gen_in.num_inference_steps,
        num_variations=gen_in.num_variations,
        base_seed=gen_in.base_seed,
        status=JobStatus.QUEUED,
        model_name=model_name,
        is_sample_demo=gen_in.is_sample_demo,
    )
    db.add(gen_req)
    db.commit()
    db.refresh(gen_req)

    # Launch background inference task
    background_tasks.add_task(run_generation_background_task, gen_req.id)

    return gen_req

@router.get("/request/{request_id}", response_model=GenerationRequestResponse)
def get_generation_status(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    gen_req = db.query(GenerationRequest).filter(GenerationRequest.id == request_id).first()
    if not gen_req:
        raise HTTPException(status_code=404, detail="Generation request not found.")

    assert_project_access(current_user, gen_req.sketch.project, db)
    return gen_req

@router.post("/request/{request_id}/retry", response_model=GenerationRequestResponse, status_code=status.HTTP_201_CREATED)
def retry_generation_request(
    request_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_designer)
):
    """
    If generation fails, allows retrying as a new request preserving previous records.
    """
    old_req = db.query(GenerationRequest).filter(GenerationRequest.id == request_id).first()
    if not old_req:
        raise HTTPException(status_code=404, detail="Original generation request not found.")

    assert_project_ownership(current_user, old_req.sketch.project)

    new_req = GenerationRequest(
        sketch_id=old_req.sketch_id,
        source_render_id=old_req.source_render_id,
        prompt=old_req.prompt,
        negative_prompt=old_req.negative_prompt,
        theme=old_req.theme,
        materials=old_req.materials,
        time_of_day=old_req.time_of_day,
        weather=old_req.weather,
        surroundings=old_req.surroundings,
        controlnet_scale=old_req.controlnet_scale,
        guidance_scale=old_req.guidance_scale,
        num_inference_steps=old_req.num_inference_steps,
        num_variations=old_req.num_variations,
        base_seed=-1, # New random seed on retry
        status=JobStatus.QUEUED,
        model_name=old_req.model_name,
        is_sample_demo=old_req.is_sample_demo,
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)

    background_tasks.add_task(run_generation_background_task, new_req.id)
    return new_req
