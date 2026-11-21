import os
import io
import pytest
from PIL import Image
from fastapi import HTTPException

from app.database import SessionLocal, Base, engine
from app.models import (
    User,
    UserRole,
    AttractionProject,
    ProjectReviewer,
    Sketch,
    GenerationRequest,
    Render,
    RenderStatus,
    Review,
    ReviewDecision,
    JobStatus,
)
from app.schemas import (
    AttractionProjectCreate,
    GenerationCreateRequest,
    ReviewCreateRequest,
)
from app.auth import hash_password
from app.routers.project_routes import list_projects, create_project, get_project, assign_reviewer
from app.routers.review_routes import submit_render_for_review, submit_review_decision, get_concept_sheet
from app.services.sketch_service import validate_and_process_upload, extract_canny_edges, recalculate_conditioning
from app.services.generator import synthesize_guided_concept_preview, run_generation_background_task
from app.services.storage import check_project_access, assert_project_ownership

@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()

    # Ensure baseline test accounts and sketch exist
    designer = session.query(User).filter_by(role=UserRole.DESIGNER).first()
    if not designer:
        designer = User(
            username="test_designer_alex",
            email="designer@test.com",
            full_name="Alex (Lead Designer)",
            hashed_password=hash_password("pass123"),
            role=UserRole.DESIGNER,
        )
        session.add(designer)
        session.commit()
        session.refresh(designer)

    reviewer = session.query(User).filter_by(role=UserRole.REVIEWER).first()
    if not reviewer:
        reviewer = User(
            username="test_reviewer_morgan",
            email="reviewer@test.com",
            full_name="Morgan (Creative Reviewer)",
            hashed_password=hash_password("pass123"),
            role=UserRole.REVIEWER,
        )
        session.add(reviewer)
        session.commit()
        session.refresh(reviewer)

    sketch = session.query(Sketch).first()
    if not sketch:
        proj = AttractionProject(
            owner_id=designer.id,
            title="Baseline Test Project",
            attraction_type="Roller Coaster"
        )
        session.add(proj)
        session.commit()
        session.refresh(proj)

        from app.config import settings
        cond_path = settings.CONDITIONING_DIR / "test_baseline_cond.png"
        img = Image.new("RGB", (512, 512), (0, 0, 0))
        img.save(cond_path)

        sketch = Sketch(
            project_id=proj.id,
            original_filename="baseline.png",
            stored_filename="baseline.png",
            file_path=str(cond_path),
            conditioning_file_path=str(cond_path),
            canny_low_threshold=100,
            canny_high_threshold=200,
            width=512,
            height=512,
        )
        session.add(sketch)
        session.commit()

    yield session
    session.close()

def test_role_permissions_and_project_access(db_session):
    """Verifies that designer can create and own projects, reviewer cannot create, and unassigned users are denied."""
    designer = db_session.query(User).filter_by(role=UserRole.DESIGNER).first()
    reviewer = db_session.query(User).filter_by(role=UserRole.REVIEWER).first()
    assert designer is not None
    assert reviewer is not None

    # 1. Designer creates project
    proj_in = AttractionProjectCreate(
        title="Hyperion Hypercoaster",
        attraction_type="Roller Coaster",
        description="Airtime machine with out-and-back layout."
    )
    proj = create_project(project_in=proj_in, db=db_session, current_user=designer)
    assert proj.title == "Hyperion Hypercoaster"
    assert proj.owner_id == designer.id

    # 2. Check project access before assignment (Reviewer unassigned)
    raw_proj = db_session.query(AttractionProject).filter_by(id=proj.id).first()
    assert check_project_access(designer, raw_proj, db_session) is True
    assert check_project_access(reviewer, raw_proj, db_session) is False

    # 3. Assign reviewer
    assign_reviewer(project_id=proj.id, assignment=type('Obj', (), {'reviewer_id': reviewer.id}), db=db_session, current_user=designer)
    assert check_project_access(reviewer, raw_proj, db_session) is True

    # 4. Ownership assertion: reviewer cannot modify ownership
    with pytest.raises(HTTPException) as exc:
        assert_project_ownership(reviewer, raw_proj)
    assert exc.value.status_code == 403

def test_upload_validation_and_preprocessing():
    """Validates image file content checking, dimension bounds, and Canny edge extraction."""
    # 1. Valid PNG
    valid_img = Image.new("RGB", (300, 300), (255, 255, 255))
    buf = io.BytesIO()
    valid_img.save(buf, format="PNG")
    processed_img, w, h = validate_and_process_upload(buf.getvalue(), "drawing.png")
    assert w == 300
    assert h == 300
    assert processed_img.mode == "RGB"

    # 2. Corrupted bytes rejected
    with pytest.raises(HTTPException) as exc1:
        validate_and_process_upload(b"corrupted_non_image_bytes", "fake.png")
    assert exc1.value.status_code == 400
    assert "Invalid image file" in exc1.value.detail

    # 3. Unsupported extension rejected
    with pytest.raises(HTTPException) as exc2:
        validate_and_process_upload(buf.getvalue(), "sketch.pdf")
    assert exc2.value.status_code == 400
    assert "Unsupported file format" in exc2.value.detail

    # 4. Dimension limits (< 64px rejected)
    tiny_img = Image.new("RGB", (32, 32), (0, 0, 0))
    tbuf = io.BytesIO()
    tiny_img.save(tbuf, format="PNG")
    with pytest.raises(HTTPException) as exc3:
        validate_and_process_upload(tbuf.getvalue(), "tiny.png")
    assert exc3.value.status_code == 400
    assert "smaller than minimum" in exc3.value.detail

    # 5. Canny edge extraction returns 512x512 3-channel image
    canny_out = extract_canny_edges(processed_img, low_threshold=80, high_threshold=180, target_size=512)
    assert canny_out.size == (512, 512)
    assert canny_out.mode == "RGB"

def test_generation_status_transitions_and_variations(db_session):
    """Tests job status transitions, elapsed time recording, and variation creation."""
    sketch = db_session.query(Sketch).first()
    assert sketch is not None

    gen_req = GenerationRequest(
        sketch_id=sketch.id,
        prompt="Photorealistic theme park concept with loops and wooden architecture",
        controlnet_scale=0.85,
        guidance_scale=7.5,
        num_inference_steps=20,
        num_variations=2,
        base_seed=98765,
        status=JobStatus.QUEUED,
        model_name="Diffusers-ControlNet-Test",
    )
    db_session.add(gen_req)
    db_session.commit()
    db_session.refresh(gen_req)

    assert gen_req.status == JobStatus.QUEUED
    assert len(gen_req.renders) == 0

    # Execute background worker
    run_generation_background_task(gen_req.id)
    db_session.expire_all()

    completed_req = db_session.query(GenerationRequest).filter_by(id=gen_req.id).first()
    assert completed_req.status == JobStatus.COMPLETED
    assert completed_req.elapsed_time_seconds is not None
    assert completed_req.elapsed_time_seconds >= 0.0
    assert len(completed_req.renders) == 2
    assert completed_req.renders[0].seed == 98765
    assert completed_req.renders[1].seed == 98766
    assert completed_req.renders[0].status == RenderStatus.DRAFT

def test_revision_and_approval_history_isolation(db_session):
    """
    CRUCIAL ACCEPTANCE SCENARIO TEST:
    1. Render A is submitted and reviewed with 'changes_requested'.
    2. A revision Render B is created referencing Render A as source_render_id.
    3. Reviewer approves Render B.
    4. Assert: Render B is APPROVED, Render A remains CHANGES_REQUESTED.
       Approval of newer version NEVER alters or automatically approves the older version.
    """
    designer = db_session.query(User).filter_by(role=UserRole.DESIGNER).first()
    reviewer = db_session.query(User).filter_by(role=UserRole.REVIEWER).first()
    sketch = db_session.query(Sketch).first()

    # Assign reviewer to project so they have permission
    existing_assignment = db_session.query(ProjectReviewer).filter_by(project_id=sketch.project_id, reviewer_id=reviewer.id).first()
    if not existing_assignment:
        pr = ProjectReviewer(project_id=sketch.project_id, reviewer_id=reviewer.id)
        db_session.add(pr)
        db_session.commit()

    # Step 1: Initial Render
    req_v1 = GenerationRequest(
        sketch_id=sketch.id,
        prompt="Initial dark station concept",
        status=JobStatus.COMPLETED,
        model_name="Test-Model",
    )
    db_session.add(req_v1)
    db_session.commit()

    render_v1 = Render(
        generation_request_id=req_v1.id,
        image_filename="test_v1.png",
        file_path="test_v1.png",
        seed=111,
        status=RenderStatus.DRAFT,
    )
    db_session.add(render_v1)
    db_session.commit()

    # Designer submits Render V1
    sub_v1 = submit_render_for_review(render_id=render_v1.id, db=db_session, current_user=designer)
    assert sub_v1.status == RenderStatus.SUBMITTED

    # Reviewer requests changes
    rev_decision_v1 = submit_review_decision(
        render_id=render_v1.id,
        review_in=ReviewCreateRequest(decision=ReviewDecision.CHANGES_REQUESTED, comment="Add brighter lighting to the queue platform."),
        db=db_session,
        current_user=reviewer,
    )
    assert rev_decision_v1.decision == ReviewDecision.CHANGES_REQUESTED
    db_session.expire_all()
    v1_checked = db_session.query(Render).filter_by(id=render_v1.id).first()
    assert v1_checked.status == RenderStatus.CHANGES_REQUESTED

    # Step 2: Designer creates Revision V2 linked to Render V1
    req_v2 = GenerationRequest(
        sketch_id=sketch.id,
        source_render_id=render_v1.id, # Lineage linkage!
        prompt="Revised concept with bright amber lantern illumination on station platform",
        status=JobStatus.COMPLETED,
        model_name="Test-Model",
    )
    db_session.add(req_v2)
    db_session.commit()

    render_v2 = Render(
        generation_request_id=req_v2.id,
        image_filename="test_v2_approved.png",
        file_path="test_v2_approved.png",
        seed=111,
        status=RenderStatus.SUBMITTED,
    )
    db_session.add(render_v2)
    db_session.commit()

    # Step 3: Reviewer approves Revision V2
    rev_decision_v2 = submit_review_decision(
        render_id=render_v2.id,
        review_in=ReviewCreateRequest(decision=ReviewDecision.APPROVED, comment="Station lighting is now brilliant and approved."),
        db=db_session,
        current_user=reviewer,
    )
    assert rev_decision_v2.decision == ReviewDecision.APPROVED

    db_session.expire_all()
    # Step 4: Verify strict version isolation
    v1_final = db_session.query(Render).filter_by(id=render_v1.id).first()
    v2_final = db_session.query(Render).filter_by(id=render_v2.id).first()

    assert v1_final.status == RenderStatus.CHANGES_REQUESTED
    assert v2_final.status == RenderStatus.APPROVED
    assert len(v1_final.reviews) == 1
    assert v1_final.reviews[0].decision == ReviewDecision.CHANGES_REQUESTED
    assert len(v2_final.reviews) == 1
    assert v2_final.reviews[0].decision == ReviewDecision.APPROVED
    assert req_v2.source_render_id == v1_final.id
