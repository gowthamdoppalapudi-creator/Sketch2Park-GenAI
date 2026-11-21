import os
import uuid
from datetime import datetime, timedelta
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import numpy as np
import cv2

from app.config import settings
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
from app.auth import hash_password
from app.services.sketch_service import extract_canny_edges
from app.services.generator import (
    render_concept_with_spatial_guidance,
)

def create_sample_sketch_image() -> Image.Image:
    """
    Synthesizes a realistic designer pen-and-paper sketch of 'Sunset Coaster'
    showing a large central loop and a boarding station in the foreground.
    """
    w, h = 512, 512
    # Parchment / off-white paper background
    sketch_img = Image.new("RGB", (w, h), (248, 246, 240))
    draw = ImageDraw.Draw(sketch_img)

    # Subtle paper texture lines
    for i in range(0, h, 20):
        draw.line([(0, i), (w, i)], fill=(240, 238, 230), width=1)

    ink_color = (25, 25, 30)
    pencil_soft = (60, 60, 70)

    # 1. Main Coaster Lift Hill & Drop (Left to Center)
    draw.line([(20, 420), (120, 100)], fill=ink_color, width=3) # lift hill
    draw.line([(120, 100), (190, 360)], fill=ink_color, width=3) # first drop

    # 2. Large Central Loop
    draw.arc([160, 110, 310, 370], start=30, end=330, fill=ink_color, width=4)
    # Loop track cross-ties
    for angle in range(30, 330, 25):
        rad = np.radians(angle)
        cx, cy = 235, 240
        rx, ry = 75, 130
        x1 = cx + rx * np.cos(rad)
        y1 = cy + ry * np.sin(rad)
        x2 = cx + (rx - 12) * np.cos(rad)
        y2 = cy + (ry - 12) * np.sin(rad)
        draw.line([(x1, y1), (x2, y2)], fill=pencil_soft, width=2)

    # 3. Track Return & Airtime Hill (Center to Right)
    draw.arc([290, 220, 420, 390], start=180, end=360, fill=ink_color, width=3)
    draw.line([(420, 305), (490, 410)], fill=ink_color, width=3)

    # 4. Steel Support Trestles / Pillars
    for px in [70, 120, 190, 235, 355, 450]:
        draw.line([(px, 200), (px, 450)], fill=pencil_soft, width=2)
        draw.line([(px - 15, 450), (px, 260)], fill=pencil_soft, width=1)
        draw.line([(px + 15, 450), (px, 260)], fill=pencil_soft, width=1)

    # 5. Wooden Boarding Station in Foreground (Right side)
    st_x1, st_y1 = 300, 360
    st_x2, st_y2 = 480, 470
    # Station roof
    draw.polygon([(st_x1 - 10, st_y1 + 25), (st_x1 + 90, st_y1), (st_x2 + 10, st_y1 + 25)], fill=(235, 230, 220), outline=ink_color, width=3)
    # Station structure walls
    draw.rectangle([st_x1, st_y1 + 25, st_x2, st_y2], fill=(240, 235, 225), outline=ink_color, width=3)
    # Timber slats & windows
    for wx in range(st_x1 + 25, st_x2 - 10, 35):
        draw.rectangle([wx, st_y1 + 45, wx + 20, st_y1 + 75], outline=ink_color, width=2)
    # Boarding queue railing
    draw.line([(st_x1 - 40, st_y2), (st_x1, st_y2)], fill=ink_color, width=2)
    draw.line([(st_x1 - 40, st_y2 - 15), (st_x1, st_y2 - 15)], fill=ink_color, width=2)

    # 6. Natural surroundings & trees
    for tx in [30, 80, 150, 490]:
        draw.ellipse([tx - 15, 410, tx + 15, 455], outline=pencil_soft, width=2)
        draw.line([(tx, 455), (tx, 480)], fill=ink_color, width=2)

    # 7. Ground baseline
    draw.line([(0, 480), (w, 480)], fill=ink_color, width=2)

    return sketch_img

def seed_database():
    """Initializes tables and seeds the database with the Sunset Coaster scenario."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        existing_user = db.query(User).filter(User.username == "designer_alex").first()
        if existing_user:
            return

        print("Seeding Sketch2Park database with demo users and the Sunset Coaster project...")

        # 1. Create Users
        designer = User(
            username="designer_alex",
            email="designer@sketch2park.com",
            full_name="Alex Rivera (Lead Designer)",
            hashed_password=hash_password("designer123"),
            role=UserRole.DESIGNER,
            created_at=datetime.utcnow() - timedelta(days=2),
        )
        reviewer = User(
            username="reviewer_morgan",
            email="reviewer@sketch2park.com",
            full_name="Morgan Vance (Creative Reviewer)",
            hashed_password=hash_password("reviewer123"),
            role=UserRole.REVIEWER,
            created_at=datetime.utcnow() - timedelta(days=2),
        )
        admin = User(
            username="admin_sarah",
            email="admin@sketch2park.com",
            full_name="Sarah Chen (System Admin)",
            hashed_password=hash_password("admin123"),
            role=UserRole.ADMIN,
            created_at=datetime.utcnow() - timedelta(days=2),
        )
        db.add_all([designer, reviewer, admin])
        db.commit()
        db.refresh(designer)
        db.refresh(reviewer)

        # 2. Create Project: Sunset Coaster
        project = AttractionProject(
            owner_id=designer.id,
            title="Sunset Coaster",
            attraction_type="Roller Coaster",
            description=(
                "A signature high-speed coaster featuring a dramatic central inversion loop, "
                "rustic craftsman boarding pavilion, and panoramic sunset skyline vistas."
            ),
            created_at=datetime.utcnow() - timedelta(hours=36),
            updated_at=datetime.utcnow() - timedelta(hours=2),
        )
        db.add(project)
        db.commit()
        db.refresh(project)

        # 3. Assign Reviewer Morgan
        assignment = ProjectReviewer(
            project_id=project.id,
            reviewer_id=reviewer.id,
            assigned_at=datetime.utcnow() - timedelta(hours=35),
        )
        db.add(assignment)
        db.commit()

        # 4. Generate and Save Sample Sketch Image
        sketch_pil = create_sample_sketch_image()
        sketch_filename = "sunset_coaster_sketch.png"
        sketch_path = settings.SKETCHES_DIR / sketch_filename
        sketch_pil.save(sketch_path, format="PNG")

        # Save Canny conditioning map
        canny_pil = extract_canny_edges(sketch_pil, low_threshold=100, high_threshold=200)
        canny_filename = "sunset_coaster_canny.png"
        canny_path = settings.CONDITIONING_DIR / canny_filename
        canny_pil.save(canny_path, format="PNG")

        sketch_record = Sketch(
            project_id=project.id,
            original_filename="sunset_coaster_hand_drawing.png",
            stored_filename=sketch_filename,
            file_path=str(sketch_path),
            conditioning_file_path=str(canny_path),
            canny_low_threshold=100,
            canny_high_threshold=200,
            width=512,
            height=512,
            uploaded_at=datetime.utcnow() - timedelta(hours=30),
        )
        db.add(sketch_record)
        db.commit()
        db.refresh(sketch_record)

        # 5. First Generation Request (Prompt from Acceptance Scenario)
        req1_prompt = (
            "Photorealistic theme park concept of a red steel roller coaster with a large central loop, "
            "a wooden boarding station in the foreground, trees around the track, and warm sunset lighting."
        )
        gen_req_1 = GenerationRequest(
            sketch_id=sketch_record.id,
            prompt=req1_prompt,
            negative_prompt="blurry, distorted, extra tracks, deformed, chaotic",
            theme="Rustic Adventure",
            materials="Red Tubular Steel & Weathered Cedar Timber",
            time_of_day="Sunset / Golden Hour",
            weather="Crisp & Clear",
            surroundings="Lush Evergreen Pines & Valley",
            controlnet_scale=0.85,
            guidance_scale=7.5,
            num_inference_steps=25,
            num_variations=2,
            base_seed=42100,
            status=JobStatus.COMPLETED,
            model_name=f"{settings.STABLE_DIFFUSION_MODEL_ID} + {settings.CONTROLNET_MODEL_ID}",
            is_sample_demo=True,
            elapsed_time_seconds=3.4,
            created_at=datetime.utcnow() - timedelta(hours=24),
            completed_at=datetime.utcnow() - timedelta(hours=24),
        )
        db.add(gen_req_1)
        db.commit()
        db.refresh(gen_req_1)

        # Render 1 (Variation 1)
        render1_img = render_concept_with_spatial_guidance(
            canny_pil, req1_prompt, gen_req_1.negative_prompt, seed=42100, controlnet_scale=0.85
        )
        r1_filename = f"render_req_{gen_req_1.id}_var1_42100.png"
        r1_path = settings.RENDERS_DIR / r1_filename
        render1_img.save(r1_path, format="PNG")

        render_1 = Render(
            generation_request_id=gen_req_1.id,
            image_filename=r1_filename,
            file_path=str(r1_path),
            seed=42100,
            status=RenderStatus.CHANGES_REQUESTED,
            created_at=datetime.utcnow() - timedelta(hours=24),
        )
        db.add(render_1)

        # Render 2 (Variation 2)
        render2_img = render_concept_with_spatial_guidance(
            canny_pil, req1_prompt, gen_req_1.negative_prompt, seed=42101, controlnet_scale=0.85
        )
        r2_filename = f"render_req_{gen_req_1.id}_var2_42101.png"
        r2_path = settings.RENDERS_DIR / r2_filename
        render2_img.save(r2_path, format="PNG")

        render_2 = Render(
            generation_request_id=gen_req_1.id,
            image_filename=r2_filename,
            file_path=str(r2_path),
            seed=42101,
            status=RenderStatus.DRAFT,
            created_at=datetime.utcnow() - timedelta(hours=24),
        )
        db.add(render_2)
        db.commit()
        db.refresh(render_1)

        # Reviewer feedback on Render 1: "brighter station lighting" requested
        review_1 = Review(
            render_id=render_1.id,
            reviewer_id=reviewer.id,
            comment=(
                "The loop silhouette against the sunset is breathtaking! However, the wooden station "
                "in the foreground appears slightly too shadowed. Please provide brighter station lighting "
                "along the queue platform so guests and architectural timber details stand out."
            ),
            decision=ReviewDecision.CHANGES_REQUESTED,
            created_at=datetime.utcnow() - timedelta(hours=18),
        )
        db.add(review_1)
        db.commit()

        # 6. Revision Generation Request (Responding to feedback)
        # Designer updates prompt for brighter station lighting
        req2_prompt = (
            "Photorealistic theme park concept of a red steel roller coaster with a large central loop, "
            "a wooden boarding station in the foreground with bright warm amber lantern lighting and illuminated queue, "
            "trees around the track, and warm vibrant sunset lighting."
        )
        gen_req_2 = GenerationRequest(
            sketch_id=sketch_record.id,
            source_render_id=render_1.id, # Recorded source render for revision!
            prompt=req2_prompt,
            negative_prompt="blurry, distorted, dark station, extra tracks",
            theme="Rustic Adventure",
            materials="Red Tubular Steel & Illuminated Cedar Timber",
            time_of_day="Sunset / Twilight Glow",
            weather="Crisp Evening",
            surroundings="Lush Evergreen Pines & Valley",
            controlnet_scale=0.88,
            guidance_scale=8.0,
            num_inference_steps=25,
            num_variations=1,
            base_seed=42100,
            status=JobStatus.COMPLETED,
            model_name=f"{settings.STABLE_DIFFUSION_MODEL_ID} + {settings.CONTROLNET_MODEL_ID}",
            is_sample_demo=True,
            elapsed_time_seconds=2.8,
            created_at=datetime.utcnow() - timedelta(hours=12),
            completed_at=datetime.utcnow() - timedelta(hours=12),
        )
        db.add(gen_req_2)
        db.commit()
        db.refresh(gen_req_2)

        # Render 3 (Revision with illuminated station)
        render3_img = render_concept_with_spatial_guidance(
            canny_pil, req2_prompt, gen_req_2.negative_prompt, seed=42100, controlnet_scale=0.88
        )
        r3_filename = f"render_req_{gen_req_2.id}_revision_approved.png"
        r3_path = settings.RENDERS_DIR / r3_filename
        render3_img.save(r3_path, format="PNG")

        render_3 = Render(
            generation_request_id=gen_req_2.id,
            image_filename=r3_filename,
            file_path=str(r3_path),
            seed=42100,
            status=RenderStatus.APPROVED, # Approved!
            created_at=datetime.utcnow() - timedelta(hours=12),
        )
        db.add(render_3)
        db.commit()
        db.refresh(render_3)

        # Reviewer Morgan approves Revision Render 3!
        review_2 = Review(
            render_id=render_3.id,
            reviewer_id=reviewer.id,
            comment=(
                "Magnificent revision! The brighter station lighting illuminates the handcrafted timber "
                "trusses and boarding gates perfectly, creating a welcoming atmosphere against the sunset loop. "
                "Approved for investor and stakeholder presentation."
            ),
            decision=ReviewDecision.APPROVED,
            created_at=datetime.utcnow() - timedelta(hours=6),
        )
        db.add(review_2)
        db.commit()

        print("Seeding complete: Users, Sunset Coaster project, sketch, generation requests, and reviews ready.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()
