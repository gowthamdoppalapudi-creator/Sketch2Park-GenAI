from app.models import (
    AttractionProject,
    ProjectReviewer,
    Sketch,
    GenerationRequest,
    Render,
    RenderStatus,
    ReviewDecision,
)

def test_revision_and_approval_isolation(
    client, db, designer_user, reviewer_user, designer_token, reviewer_token
):
    # 1. Setup project, assigned reviewer, and sketch
    project = AttractionProject(owner_id=designer_user.id, title="Sunset Coaster Test", attraction_type="Roller Coaster")
    db.add(project)
    db.commit()

    pr = ProjectReviewer(project_id=project.id, reviewer_id=reviewer_user.id)
    db.add(pr)

    sketch = Sketch(
        project_id=project.id,
        original_filename="sketch.png",
        stored_filename="sketch.png",
        file_path="dummy.png",
        conditioning_file_path="dummy.png",
        width=512,
        height=512,
    )
    db.add(sketch)
    db.commit()

    # 2. First generation request and Render 1
    req1 = GenerationRequest(
        sketch_id=sketch.id,
        prompt="Red roller coaster with loop and wooden station",
        model_name="test-model",
    )
    db.add(req1)
    db.commit()

    render1 = Render(
        generation_request_id=req1.id,
        image_filename="render1.png",
        file_path="dummy.png",
        seed=1001,
        status=RenderStatus.DRAFT,
    )
    db.add(render1)
    db.commit()

    # 3. Designer submits Render 1 for review
    sub_res = client.post(
        f"/api/reviews/submit/{render1.id}",
        headers={"Authorization": f"Bearer {designer_token}"},
    )
    assert sub_res.status_code == 200
    assert sub_res.json()["status"] == "submitted_for_review"

    # 4. Reviewer requests changes with comment
    dec_res = client.post(
        f"/api/reviews/decision/{render1.id}",
        headers={"Authorization": f"Bearer {reviewer_token}"},
        json={
            "decision": "changes_requested",
            "comment": "Station is too dark. Please add brighter station lighting.",
        },
    )
    assert dec_res.status_code == 201
    assert dec_res.json()["decision"] == "changes_requested"

    # 5. Designer creates Revision Request linked to Render 1
    rev_res = client.post(
        "/api/generation/request",
        headers={"Authorization": f"Bearer {designer_token}"},
        json={
            "sketch_id": sketch.id,
            "source_render_id": render1.id,
            "prompt": "Red roller coaster with brighter station lighting along platform",
            "controlnet_scale": 0.85,
            "num_variations": 1,
            "base_seed": 1001,
        },
    )
    assert rev_res.status_code == 201
    rev_req_id = rev_res.json()["id"]
    assert rev_res.json()["source_render_id"] == render1.id

    # Create Revision Render 2
    render2 = Render(
        generation_request_id=rev_req_id,
        image_filename="render2_revision.png",
        file_path="dummy.png",
        seed=1001,
        status=RenderStatus.DRAFT,
    )
    db.add(render2)
    db.commit()

    # 6. Reviewer approves Revision Render 2
    app_res = client.post(
        f"/api/reviews/decision/{render2.id}",
        headers={"Authorization": f"Bearer {reviewer_token}"},
        json={
            "decision": "approved",
            "comment": "Brighter lighting looks fantastic! Approved.",
        },
    )
    assert app_res.status_code == 201

    db.expire_all()
    # CRITICAL CHECK: Render 2 is approved, but Render 1 remains 'changes_requested'!
    r1 = db.query(Render).filter_by(id=render1.id).first()
    r2 = db.query(Render).filter_by(id=render2.id).first()

    assert r2.status == RenderStatus.APPROVED
    assert r1.status == RenderStatus.CHANGES_REQUESTED
    assert len(r1.reviews) == 1
    assert len(r2.reviews) == 1
    assert r1.reviews[0].decision == ReviewDecision.CHANGES_REQUESTED
    assert r2.reviews[0].decision == ReviewDecision.APPROVED
