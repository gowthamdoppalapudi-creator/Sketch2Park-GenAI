import enum
from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    DateTime,
    ForeignKey,
    Enum,
    UniqueConstraint,
    Boolean,
)
from sqlalchemy.orm import relationship
from app.database import Base

class UserRole(str, enum.Enum):
    DESIGNER = "designer"
    REVIEWER = "reviewer"
    ADMIN = "admin"

class JobStatus(str, enum.Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class RenderStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted_for_review"
    APPROVED = "approved"
    CHANGES_REQUESTED = "changes_requested"
    REJECTED = "rejected"

class ReviewDecision(str, enum.Enum):
    APPROVED = "approved"
    CHANGES_REQUESTED = "changes_requested"
    REJECTED = "rejected"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.DESIGNER, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    owned_projects = relationship("AttractionProject", back_populates="owner", cascade="all, delete-orphan")
    assigned_reviews = relationship("ProjectReviewer", back_populates="reviewer", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="reviewer", cascade="all, delete-orphan")

class AttractionProject(Base):
    __tablename__ = "attraction_projects"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(150), nullable=False)
    attraction_type = Column(String(80), nullable=False) # e.g. "Roller Coaster", "Ferris Wheel", "Water Ride", "Dark Ride"
    description = Column(Text, nullable=True)
    scene_data = Column(Text, nullable=True) # Serialized 3D park scene graph, objects, positions & parameters
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    owner = relationship("User", back_populates="owned_projects")
    reviewers = relationship("ProjectReviewer", back_populates="project", cascade="all, delete-orphan")
    sketches = relationship("Sketch", back_populates="project", cascade="all, delete-orphan")

class ProjectReviewer(Base):
    __tablename__ = "project_reviewers"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("attraction_projects.id", ondelete="CASCADE"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("project_id", "reviewer_id", name="uq_project_reviewer"),
    )

    # Relationships
    project = relationship("AttractionProject", back_populates="reviewers")
    reviewer = relationship("User", back_populates="assigned_reviews")

class Sketch(Base):
    __tablename__ = "sketches"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("attraction_projects.id", ondelete="CASCADE"), nullable=False)
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    conditioning_file_path = Column(String(500), nullable=False)
    canny_low_threshold = Column(Integer, default=100, nullable=False)
    canny_high_threshold = Column(Integer, default=200, nullable=False)
    width = Column(Integer, nullable=False)
    height = Column(Integer, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("AttractionProject", back_populates="sketches")
    generation_requests = relationship("GenerationRequest", back_populates="sketch", cascade="all, delete-orphan")

class GenerationRequest(Base):
    __tablename__ = "generation_requests"

    id = Column(Integer, primary_key=True, index=True)
    sketch_id = Column(Integer, ForeignKey("sketches.id", ondelete="CASCADE"), nullable=False)
    source_render_id = Column(Integer, ForeignKey("renders.id", ondelete="SET NULL"), nullable=True) # for revisions
    
    prompt = Column(Text, nullable=False)
    negative_prompt = Column(Text, nullable=True)
    
    # Prompt helper choices
    theme = Column(String(100), nullable=True)
    materials = Column(String(100), nullable=True)
    time_of_day = Column(String(100), nullable=True)
    weather = Column(String(100), nullable=True)
    surroundings = Column(String(100), nullable=True)

    # Hyperparameters
    controlnet_scale = Column(Float, default=0.8, nullable=False)
    guidance_scale = Column(Float, default=7.5, nullable=False)
    num_inference_steps = Column(Integer, default=25, nullable=False)
    num_variations = Column(Integer, default=1, nullable=False) # 1 to 3
    base_seed = Column(Integer, default=-1, nullable=False)

    # Job tracking
    status = Column(Enum(JobStatus), default=JobStatus.QUEUED, nullable=False)
    error_message = Column(Text, nullable=True)
    elapsed_time_seconds = Column(Float, nullable=True)
    model_name = Column(String(150), nullable=False)
    is_sample_demo = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    sketch = relationship("Sketch", back_populates="generation_requests")
    source_render = relationship("Render", foreign_keys=[source_render_id])
    renders = relationship("Render", back_populates="generation_request", foreign_keys="Render.generation_request_id", cascade="all, delete-orphan")

class Render(Base):
    __tablename__ = "renders"

    id = Column(Integer, primary_key=True, index=True)
    generation_request_id = Column(Integer, ForeignKey("generation_requests.id", ondelete="CASCADE"), nullable=False)
    image_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    seed = Column(Integer, nullable=False)
    status = Column(Enum(RenderStatus), default=RenderStatus.DRAFT, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    generation_request = relationship("GenerationRequest", back_populates="renders", foreign_keys=[generation_request_id])
    reviews = relationship("Review", back_populates="render", cascade="all, delete-orphan")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    render_id = Column(Integer, ForeignKey("renders.id", ondelete="CASCADE"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    comment = Column(Text, nullable=False)
    decision = Column(Enum(ReviewDecision), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    render = relationship("Render", back_populates="reviews")
    reviewer = relationship("User", back_populates="reviews")


