import pytest
from app.models import AttractionProject, ProjectReviewer

def test_designer_can_create_project(client, designer_token):
    response = client.post(
        "/api/projects",
        headers={"Authorization": f"Bearer {designer_token}"},
        json={
            "title": "Quantum Coaster",
            "attraction_type": "Roller Coaster",
            "description": "High-tech linear induction launch coaster.",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Quantum Coaster"
    assert data["attraction_type"] == "Roller Coaster"

def test_reviewer_cannot_create_project(client, reviewer_token):
    response = client.post(
        "/api/projects",
        headers={"Authorization": f"Bearer {reviewer_token}"},
        json={
            "title": "Unauthorized Project",
            "attraction_type": "Water Ride",
        },
    )
    assert response.status_code == 403
    assert "Designer permission required" in response.json()["detail"]

def test_assigned_reviewer_can_access_project(client, db, designer_user, reviewer_user, reviewer_token, other_reviewer_token):
    project = AttractionProject(
        owner_id=designer_user.id,
        title="Alpine Splash",
        attraction_type="Water Ride",
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    # Assign reviewer_user
    pr = ProjectReviewer(project_id=project.id, reviewer_id=reviewer_user.id)
    db.add(pr)
    db.commit()

    # Assigned reviewer can view metadata
    res = client.get(
        f"/api/projects/{project.id}",
        headers={"Authorization": f"Bearer {reviewer_token}"},
    )
    assert res.status_code == 200
    assert res.json()["title"] == "Alpine Splash"

    # Unassigned reviewer is blocked
    res_unassigned = client.get(
        f"/api/projects/{project.id}",
        headers={"Authorization": f"Bearer {other_reviewer_token}"},
    )
    assert res_unassigned.status_code == 403
    assert "do not have permission" in res_unassigned.json()["detail"]
