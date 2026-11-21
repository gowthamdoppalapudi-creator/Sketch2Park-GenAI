import time
from app.models import AttractionProject, Sketch, GenerationRequest, JobStatus
from app.services.generator import run_generation_background_task
from app.config import settings
from PIL import Image

def test_generation_status_transitions_and_metadata(client, db, designer_user, designer_token):
    # Setup project and sketch
    project = AttractionProject(owner_id=designer_user.id, title="Falcon Flight", attraction_type="Roller Coaster")
    db.add(project)
    db.commit()

    # Create dummy conditioning image on disk
    dummy_cond = Image.new("RGB", (512, 512), (0, 0, 0))
    cond_path = settings.CONDITIONING_DIR / "test_flow_cond.png"
    dummy_cond.save(cond_path)

    sketch = Sketch(
        project_id=project.id,
        original_filename="flight.png",
        stored_filename="flight.png",
        file_path=str(cond_path),
        conditioning_file_path=str(cond_path),
        canny_low_threshold=100,
        canny_high_threshold=200,
        width=512,
        height=512,
    )
    db.add(sketch)
    db.commit()

    # Create generation request via API
    res = client.post(
        "/api/generation/request",
        headers={"Authorization": f"Bearer {designer_token}"},
        json={
            "sketch_id": sketch.id,
            "prompt": "Theme park coaster in high mountains",
            "controlnet_scale": 0.85,
            "guidance_scale": 7.5,
            "num_inference_steps": 20,
            "num_variations": 2,
            "base_seed": 1000,
            "is_sample_demo": False,
        },
    )
    assert res.status_code == 201
    gen_id = res.json()["id"]
    assert res.json()["status"] == "queued"
    assert res.json()["controlnet_scale"] == 0.85

    # Run the worker task directly
    run_generation_background_task(gen_id)

    # Check status transitioned to completed and created renders
    db.expire_all()
    completed_req = db.query(GenerationRequest).filter_by(id=gen_id).first()
    assert completed_req.status == JobStatus.COMPLETED
    assert completed_req.elapsed_time_seconds is not None
    assert len(completed_req.renders) == 2
    assert completed_req.renders[0].seed == 1000
    assert completed_req.renders[1].seed == 1001

def test_retry_on_failed_request(client, db, designer_user, designer_token):
    project = AttractionProject(owner_id=designer_user.id, title="Broken Coaster", attraction_type="Roller Coaster")
    db.add(project)
    db.commit()

    # Sketch pointing to non-existent file will trigger failure
    sketch = Sketch(
        project_id=project.id,
        original_filename="broken.png",
        stored_filename="broken.png",
        file_path="nonexistent_file.png",
        conditioning_file_path="nonexistent_cond.png",
        width=512,
        height=512,
    )
    db.add(sketch)
    db.commit()

    gen_req = GenerationRequest(
        sketch_id=sketch.id,
        prompt="Broken ride",
        status=JobStatus.QUEUED,
        model_name="test",
    )
    db.add(gen_req)
    db.commit()

    # Run task -> fails gracefully
    run_generation_background_task(gen_req.id)
    db.expire_all()

    req = db.query(GenerationRequest).filter_by(id=gen_req.id).first()
    assert req.status == JobStatus.FAILED
    assert req.error_message is not None

    # Retry creates a new request while preserving the failed one
    retry_res = client.post(
        f"/api/generation/request/{req.id}/retry",
        headers={"Authorization": f"Bearer {designer_token}"},
    )
    assert retry_res.status_code == 201
    new_req_id = retry_res.json()["id"]
    assert new_req_id != req.id
    assert retry_res.json()["status"] == "queued"
