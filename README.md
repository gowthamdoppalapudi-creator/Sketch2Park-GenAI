# Sketch2Park — AI Theme Park Concept Renderer

> A full-stack Generative AI web application designed for theme park attraction concept rendering, spatial sketch guidance, and multi-role stakeholder review workflows. Built for academic viva and live demonstration.

---

## Overview

Theme park designers sketch roller coasters, Ferris wheels, water rides, and themed attractions. **Sketch2Park** allows a designer to upload a hand-drawn sketch (including smartphone photos of paper drawings), customize prompt styling (theme, materials, lighting, weather, surroundings), and generate photorealistic concept renders.

The core technical capability is **sketch-guided diffusion generation**. Using OpenCV Canny edge extraction and Hugging Face ControlNet conditioning (`lllyasviel/sd-controlnet-canny` + `runwayml/stable-diffusion-v1-5`), the spatial lines of the designer's sketch (such as loop placement, lift hill angles, and station layout) guide the image synthesis pipeline.

Reviewers and investors can inspect submitted renders, compare them against the original sketch using an interactive split-slider or side-by-side view, provide actionable comments, and officially approve a concept or request changes.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Lucide Icons, Tailwind CSS |
| **Backend API** | Python 3.10+, FastAPI, Uvicorn, Pydantic v2 |
| **Database** | SQLite, SQLAlchemy 2.0 ORM |
| **AI Inference** | Hugging Face Diffusers (`diffusers`), PyTorch, ControlNet Canny, Stable Diffusion 1.5 |
| **Image Preprocessing** | OpenCV (`cv2`), Pillow (`PIL`), NumPy |
| **Authentication** | JWT (JSON Web Tokens), Salted SHA-256 / Bcrypt password hashing |
| **Testing** | Pytest, TypeScript compiler (`tsc`) |

---

## Repository Structure

```
GENAI PROJECT/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application entry & router registration
│   │   ├── config.py                # Pydantic Settings & environment variables
│   │   ├── database.py              # SQLite engine & SQLAlchemy sessionmaker
│   │   ├── models.py                # Database models (User, Project, Sketch, Render, etc.)
│   │   ├── schemas.py               # Pydantic request & response schemas
│   │   ├── auth.py                  # Password hashing & JWT token handling
│   │   ├── seed_data.py             # Pre-seeded Sunset Coaster acceptance demo data
│   │   ├── routers/
│   │   │   ├── auth_routes.py       # Login, register, demo login, reviewers list
│   │   │   ├── project_routes.py    # CRUD projects & reviewer assignment
│   │   │   ├── sketch_routes.py     # Sketch upload & Canny threshold tuning
│   │   │   ├── generation_routes.py # Background inference dispatcher & status
│   │   │   ├── review_routes.py     # Approval decisions & printable concept sheets
│   │   │   ├── evaluation_routes.py # Ablation experiments (text-alone vs guided)
│   │   │   └── file_routes.py       # Secure image streaming with permissions
│   │   └── services/
│   │       ├── sketch_service.py    # EXIF correction, resizing, Canny edge detection
│   │       ├── generator.py         # Diffusers pipeline manager & concept renderer
│   │       └── storage.py           # Access permission enforcement
│   ├── tests/
│   │   ├── test_suite.py            # Comprehensive unit & integration tests
│   │   └── conftest.py              # Test database configuration
│   ├── uploads/                     # Local storage (sketches, conditioning, renders)
│   ├── .env.example                 # Example environment variables
│   └── requirements.txt             # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── api/index.ts             # REST client with auth token interceptor
│   │   ├── types/index.ts           # TypeScript interfaces matching backend models
│   │   ├── store/AuthContext.tsx    # Session & multi-role auth context
│   │   ├── components/
│   │   │   ├── ImageComparisonSlider.tsx # Interactive before/after split slider
│   │   │   ├── PromptBuilder.tsx         # Thematic preset builder & prompt editor
│   │   │   ├── ConceptSheet.tsx          # Printable stakeholder concept sheet
│   │   │   └── SketchUploader.tsx        # Upload & interactive Canny sensitivity
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx             # 1-Click demo authentication screen
│   │   │   ├── DashboardPage.tsx         # Project portfolio & creation
│   │   │   ├── ProjectWorkspacePage.tsx  # Sketch library & version lineage tree
│   │   │   ├── GenerationStudioPage.tsx  # Parameter sliders, prompt builder, gallery
│   │   │   ├── ReviewerWorkspacePage.tsx # Review queue, feedback, approval decisions
│   │   │   └── EvaluationPage.tsx        # Technical ablation study & 1-5 rating form
│   │   ├── App.tsx                  # Root navigation & view coordinator
│   │   └── main.tsx                 # React DOM mount point
│   ├── package.json                 # Frontend dependencies
│   ├── tsconfig.json                # TypeScript compiler config
│   └── vite.config.ts               # Vite dev server & proxy config
├── documentation/
│   ├── ARCHITECTURE.md              # System Architecture & Flow Diagram
│   ├── ER_DIAGRAM.md                # Mermaid Entity-Relationship Diagram
│   └── VIVA_DEMO_GUIDE.md           # Step-by-step Viva demonstration script
└── README.md                        # Project documentation & setup instructions
```

---

## Quick Start Setup

### Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: v18 or higher (v20+ recommended)
- **Git**

### 1. Clone & Environment Setup

```powershell
# In PowerShell (Windows) or Terminal (macOS/Linux)
cd "f:\GENAI PROJECT"

# (Optional) Create virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
# source venv/bin/activate
```

### 2. Backend Setup

```powershell
# Install backend dependencies
python -m pip install -r backend/requirements.txt

# Start FastAPI backend server
python -m uvicorn app.main:app --app-dir backend --reload --port 8000
```
- API will be live at: `http://localhost:8000`
- API documentation at: `http://localhost:8000/docs`

### 3. Frontend Setup

In a new terminal window:
```powershell
cd "f:\GENAI PROJECT\frontend"

# Install frontend dependencies
npm install

# Start Vite React development server
npm run dev
```
- Open your browser to: `http://localhost:5173`

---

## Pre-Configured Demo Credentials

The application initializes with demo accounts matching the university acceptance scenario:

| Role | Username | Password | Role Description |
| :--- | :--- | :--- | :--- |
| **Designer** | `designer_alex` | `designer123` | Create projects, upload sketches, generate concepts, author revisions |
| **Reviewer** | `reviewer_morgan` | `reviewer123` | Inspect submissions, leave feedback, approve or request changes |
| **Admin** | `admin_sarah` | `admin123` | System management and full project access |

*Shortcut: Click the **"Designer"** or **"Reviewer"** buttons on the sign-in screen for instant 1-click login.*

---

## Running Verification Tests

### Backend Unit & Integration Tests (Pytest)
```powershell
$env:PYTHONPATH="backend"
python -m pytest backend/tests/test_suite.py -v
```

Verifies:
1. `test_role_permissions_and_project_access`: Designer vs Reviewer project ownership and 403 access control.
2. `test_upload_validation_and_preprocessing`: Validates JPG/PNG files, rejects corrupted bytes/invalid formats, validates dimension bounds, and tests Canny edge extraction.
3. `test_generation_status_transitions_and_variations`: Tests background worker job states (`queued` -> `running` -> `completed`), parameter recording, seed increments, and variation counts (1-3).
4. `test_revision_and_approval_history_isolation`: Validates that requesting changes on an older version and approving a newer revision strictly isolates review records (approving older never auto-approves newer).
5. `test_evaluation_summary_metrics`: Computes aggregate ablation scores and ensures counts accompany averages.

### Frontend Production Build
```powershell
cd frontend
npm run build
```
Compiles with TypeScript (`tsc`) with **0 errors**.

---

## Environmental Execution Modes

1. **AI Generation Mode (Diffusers Pipeline)**:
   - When a compatible GPU (CUDA or Apple Silicon MPS) is available, loads `lllyasviel/sd-controlnet-canny` and `runwayml/stable-diffusion-v1-5` for full real-time neural diffusion inference.
2. **Sample Demo Mode & Student Laptop Fallback**:
   - For demonstrations on standard student laptops without a high-VRAM GPU, the system includes a high-fidelity spatial concept synthesizer that uses the exact Canny edge contours as architectural boundaries.
   - The pre-seeded **"Sunset Coaster"** project provides real high-resolution concept renders, complete review threads, revision history, and printable concept sheets ready for instant presentation.

---

## University Viva Walkthrough

See [`documentation/VIVA_DEMO_GUIDE.md`](documentation/VIVA_DEMO_GUIDE.md) for the complete script covering:
- Uploading a coaster sketch with a large central loop and foreground station.
- Prompt building with sunset lighting and rustic wooden materials.
- Generating 2 variations and submitting to review.
- Reviewer requesting brighter station lighting.
- Creating a revision with linked `source_render_id`.
- Reviewer approval and printable concept sheet download.
- Ablation study comparing text-alone vs sketch-guided outputs.
