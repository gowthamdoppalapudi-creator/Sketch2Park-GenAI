from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field
from app.models import UserRole, JobStatus, RenderStatus, ReviewDecision

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.DESIGNER

class UserCreate(UserBase):
    password: str = Field(..., min_length=4)

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

# Project Schemas
class ProjectReviewerItem(BaseModel):
    id: int
    reviewer: UserResponse
    assigned_at: datetime

    class Config:
        from_attributes = True

class AttractionProjectCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    attraction_type: str = Field(..., min_length=2, max_length=80)
    description: Optional[str] = None
    scene_data: Optional[str] = None

class AttractionProjectUpdate(BaseModel):
    title: Optional[str] = None
    attraction_type: Optional[str] = None
    description: Optional[str] = None
    scene_data: Optional[str] = None

class AttractionProjectResponse(BaseModel):
    id: int
    owner_id: int
    title: str
    attraction_type: str
    description: Optional[str] = None
    scene_data: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    owner: UserResponse
    reviewers: List[ProjectReviewerItem] = []
    sketches_count: int = 0
    renders_count: int = 0
    approved_render_id: Optional[int] = None

    class Config:
        from_attributes = True

class ProjectReviewerAssign(BaseModel):
    reviewer_id: int

# Sketch Schemas
class SketchResponse(BaseModel):
    id: int
    project_id: int
    original_filename: str
    file_path: str
    conditioning_file_path: str
    canny_low_threshold: int
    canny_high_threshold: int
    width: int
    height: int
    uploaded_at: datetime

    class Config:
        from_attributes = True

class CannyPreviewRequest(BaseModel):
    sketch_id: int
    canny_low_threshold: int = Field(default=100, ge=10, le=300)
    canny_high_threshold: int = Field(default=200, ge=20, le=400)

class CannyPreviewResponse(BaseModel):
    sketch_id: int
    conditioning_url: str
    canny_low_threshold: int
    canny_high_threshold: int

# Review Schemas
class ReviewCreateRequest(BaseModel):
    decision: ReviewDecision
    comment: str = Field(..., min_length=2)

class ReviewResponse(BaseModel):
    id: int
    render_id: int
    reviewer_id: int
    comment: str
    decision: ReviewDecision
    created_at: datetime
    reviewer: UserResponse

    class Config:
        from_attributes = True

# Render Schemas
class RenderResponse(BaseModel):
    id: int
    generation_request_id: int
    image_filename: str
    file_path: str
    seed: int
    status: RenderStatus
    created_at: datetime
    reviews: List[ReviewResponse] = []

    class Config:
        from_attributes = True

# Generation Schemas
class GenerationCreateRequest(BaseModel):
    sketch_id: int
    source_render_id: Optional[int] = None # When revising
    prompt: str = Field(..., min_length=3)
    negative_prompt: Optional[str] = (
        "blurry, low quality, distorted, extra tracks, deformed, chaotic, bad geometry"
    )
    theme: Optional[str] = None
    materials: Optional[str] = None
    time_of_day: Optional[str] = None
    weather: Optional[str] = None
    surroundings: Optional[str] = None
    controlnet_scale: float = Field(default=0.8, ge=0.0, le=2.0)
    guidance_scale: float = Field(default=7.5, ge=1.0, le=20.0)
    num_inference_steps: int = Field(default=25, ge=5, le=50)
    num_variations: int = Field(default=1, ge=1, le=3)
    base_seed: int = -1
    is_sample_demo: bool = False

class GenerationRequestResponse(BaseModel):
    id: int
    sketch_id: int
    source_render_id: Optional[int] = None
    prompt: str
    negative_prompt: Optional[str] = None
    theme: Optional[str] = None
    materials: Optional[str] = None
    time_of_day: Optional[str] = None
    weather: Optional[str] = None
    surroundings: Optional[str] = None
    controlnet_scale: float
    guidance_scale: float
    num_inference_steps: int
    num_variations: int
    base_seed: int
    status: JobStatus
    error_message: Optional[str] = None
    elapsed_time_seconds: Optional[float] = None
    model_name: str
    is_sample_demo: bool
    created_at: datetime
    completed_at: Optional[datetime] = None
    renders: List[RenderResponse] = []

    class Config:
        from_attributes = True

class ProjectDetailResponse(AttractionProjectResponse):
    sketches: List[SketchResponse] = []
    generation_requests: List[GenerationRequestResponse] = []

class ConceptSheetResponse(BaseModel):
    project_title: str
    attraction_type: str
    description: Optional[str] = None
    owner_name: str
    original_sketch_url: str
    conditioning_image_url: str
    selected_render_url: str
    render_id: int
    final_prompt: str
    negative_prompt: Optional[str] = None
    version_tag: str
    source_render_id: Optional[int] = None
    review_status: str
    reviews: List[ReviewResponse] = []
    controlnet_scale: float
    seed: int
    model_name: str
    created_at: datetime

