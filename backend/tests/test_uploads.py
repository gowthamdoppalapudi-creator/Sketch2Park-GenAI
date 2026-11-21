import io
from PIL import Image
from app.models import AttractionProject
from app.services.sketch_service import validate_and_process_upload

def create_test_image_bytes(width=512, height=512, fmt="PNG"):
    img = Image.new("RGB", (width, height), (255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    return buf.getvalue()

def test_valid_sketch_upload(client, db, designer_user, designer_token):
    project = AttractionProject(
        owner_id=designer_user.id,
        title="Test Coaster",
        attraction_type="Roller Coaster",
    )
    db.add(project)
    db.commit()

    img_bytes = create_test_image_bytes(400, 400, "PNG")

    res = client.post(
        "/api/sketches/upload",
        headers={"Authorization": f"Bearer {designer_token}"},
        data={"project_id": project.id, "low_threshold": 80, "high_threshold": 160},
        files={"file": ("sketch.png", img_bytes, "image/png")},
    )
    assert res.status_code == 201
    data = res.json()
    assert data["original_filename"] == "sketch.png"
    assert data["canny_low_threshold"] == 80
    assert data["canny_high_threshold"] == 160
    assert data["width"] == 400
    assert data["height"] == 400

def test_reject_corrupted_file(client, db, designer_user, designer_token):
    project = AttractionProject(
        owner_id=designer_user.id,
        title="Test Project",
        attraction_type="Ferris Wheel",
    )
    db.add(project)
    db.commit()

    fake_bytes = b"not an image file at all"
    res = client.post(
        "/api/sketches/upload",
        headers={"Authorization": f"Bearer {designer_token}"},
        data={"project_id": project.id},
        files={"file": ("fake.png", fake_bytes, "image/png")},
    )
    assert res.status_code == 400
    assert "Invalid image file" in res.json()["detail"]

def test_reject_invalid_extension(client, db, designer_user, designer_token):
    project = AttractionProject(
        owner_id=designer_user.id,
        title="Test Project",
        attraction_type="Ferris Wheel",
    )
    db.add(project)
    db.commit()

    res = client.post(
        "/api/sketches/upload",
        headers={"Authorization": f"Bearer {designer_token}"},
        data={"project_id": project.id},
        files={"file": ("sketch.exe", b"test", "application/octet-stream")},
    )
    assert res.status_code == 400
    assert "Unsupported file format" in res.json()["detail"]
