"""
Sketch2Park Root ASGI Entry Point.

Allows running uvicorn from the project root directory:
    uvicorn main:app --reload --port 8000
    python -m uvicorn main:app --reload --port 8000
    python main.py
"""
import os
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Import the FastAPI application
from app.main import app

__all__ = ["app"]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
