import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent

class Settings(BaseSettings):
    APP_NAME: str = "Sketch2Park — AI Theme Park Concept Renderer"
    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Security
    SECRET_KEY: str = "sketch2park_super_secret_university_demo_key_2026_change_in_prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Database: always resolves to project root sketch2park.db
    DATABASE_URL: str = f"sqlite:///{PROJECT_ROOT / 'sketch2park.db'}"

    # Storage Paths: always anchored to project root
    UPLOAD_DIR: Path = PROJECT_ROOT / "uploads"
    SKETCHES_DIR: Path = PROJECT_ROOT / "uploads" / "sketches"
    CONDITIONING_DIR: Path = PROJECT_ROOT / "uploads" / "conditioning"
    RENDERS_DIR: Path = PROJECT_ROOT / "uploads" / "renders"
    SAMPLES_DIR: Path = PROJECT_ROOT / "uploads" / "samples"

    # Upload validation limits
    MAX_UPLOAD_SIZE_MB: int = 10
    ALLOWED_EXTENSIONS: List[str] = ["jpg", "jpeg", "png"]
    MIN_IMAGE_DIMENSION: int = 64
    MAX_IMAGE_DIMENSION: int = 4096
    TARGET_IMAGE_SIZE: int = 512

    # Inference & Model Checkpoints
    DEVICE: str = "auto"
    STABLE_DIFFUSION_MODEL_ID: str = "runwayml/stable-diffusion-v1-5"
    CONTROLNET_MODEL_ID: str = "lllyasviel/sd-controlnet-canny"
    ENABLE_CPU_FALLBACK: bool = True
    DEFAULT_NUM_INFERENCE_STEPS: int = 25
    DEFAULT_GUIDANCE_SCALE: float = 7.5
    DEFAULT_CONTROLNET_SCALE: float = 0.8

    class Config:
        env_file = str(BASE_DIR / ".env")
        extra = "ignore"

settings = Settings()

# Ensure directories exist
for path in [
    settings.UPLOAD_DIR,
    settings.SKETCHES_DIR,
    settings.CONDITIONING_DIR,
    settings.RENDERS_DIR,
    settings.SAMPLES_DIR,
]:
    path.mkdir(parents=True, exist_ok=True)
