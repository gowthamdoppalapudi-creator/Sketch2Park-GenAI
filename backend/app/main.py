from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import Base, engine
from app.seed_data import seed_database
from app.routers import (
    auth_routes,
    project_routes,
    sketch_routes,
    generation_routes,
    review_routes,
    file_routes,
)

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Full-stack GenAI web application for theme park designers to transform sketches "
        "into photorealistic concept renders using ControlNet spatial guidance, with multi-role "
        "stakeholder review and version approval workflows."
    ),
    version="1.0.0",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permits local React dev servers on any port (5173, 3000, 8080)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_routes.router)
app.include_router(project_routes.router)
app.include_router(sketch_routes.router)
app.include_router(generation_routes.router)
app.include_router(review_routes.router)
app.include_router(file_routes.router)

@app.on_event("startup")
def on_startup():
    """Ensure database tables and sample demo data exist upon launch (skipped in test mode)."""
    import os
    if not os.environ.get("TESTING"):
        seed_database()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "env": settings.APP_ENV,
        "database": "sqlite_connected",
    }

@app.get("/api/system/info")
def system_info():
    from app.services.generator import model_status
    return {
        "app_name": settings.APP_NAME,
        "version": "1.0.0",
        "model_status": model_status.get_info(),
        "storage": {
            "sketches_dir": str(settings.SKETCHES_DIR),
            "renders_dir": str(settings.RENDERS_DIR),
            "max_upload_size_mb": settings.MAX_UPLOAD_SIZE_MB,
        }
    }
