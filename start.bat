@echo off
title Sketch2Park — Launcher
color 0A
echo.
echo  ============================================================
echo   Sketch2Park — AI Theme Park Concept Renderer
echo  ============================================================
echo.
echo  Starting BACKEND (FastAPI on http://localhost:8000) ...
start "Sketch2Park Backend" cmd /k "cd /d "f:\GENAI PROJECT" && python -m uvicorn app.main:app --app-dir backend --reload --port 8000"

echo  Waiting 3 seconds for backend to initialise...
timeout /t 3 /nobreak >nul

echo  Starting FRONTEND (Vite dev on http://localhost:5173) ...
start "Sketch2Park Frontend" cmd /k "cd /d "f:\GENAI PROJECT\frontend" && npm run dev"

echo.
echo  ============================================================
echo   Both servers are starting in separate windows.
echo.
echo   FRONTEND : http://localhost:5173
echo   BACKEND  : http://localhost:8000
echo   API DOCS : http://localhost:8000/docs
echo.
echo   Demo login (use on the login page):
echo     Designer  — username: designer_alex  / password: designer123
echo     Reviewer  — username: reviewer_morgan / password: reviewer123
echo.
echo   Or click the ONE-CLICK DEMO buttons on the login page.
echo  ============================================================
echo.
pause
