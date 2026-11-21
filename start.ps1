# Sketch2Park — PowerShell Launcher
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " Sketch2Park — AI Theme Park Concept Renderer Launcher" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan

$projectRoot = "F:\GENAI PROJECT"

Write-Host "`n[1/2] Starting Backend (FastAPI on http://localhost:8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; python -m uvicorn app.main:app --app-dir backend --reload --port 8000"

Start-Sleep -Seconds 3

Write-Host "[2/2] Starting Frontend (Vite on http://localhost:5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\frontend'; npm run dev"

Write-Host "`nServers launched in separate windows!" -ForegroundColor Cyan
Write-Host "  Frontend : http://localhost:5173" -ForegroundColor White
Write-Host "  Backend  : http://localhost:8000" -ForegroundColor White
Write-Host "  Swagger  : http://localhost:8000/docs`n" -ForegroundColor White
Write-Host "Demo Credentials:" -ForegroundColor Yellow
Write-Host "  Designer : designer_alex  / designer123" -ForegroundColor Gray
Write-Host "  Reviewer : reviewer_morgan / reviewer123" -ForegroundColor Gray
Write-Host "  Or click 'Designer' / 'Reviewer' buttons on the login page!" -ForegroundColor Magenta
