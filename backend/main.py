"""
Sketch2Park Backend ASGI Entry Point.

This module exposes the FastAPI `app` instance directly at `backend/main.py`
so that running:
    cd "F:\\GENAI PROJECT\\backend"
    python -m uvicorn main:app --reload --port 8000
works seamlessly alongside:
    python -m uvicorn app.main:app --app-dir backend --reload --port 8000
"""

from app.main import app

__all__ = ["app"]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
