# Sketch2Park — System Architecture Documentation

## System Architecture Diagram

```mermaid
flowchart TD
    subgraph Browser ["Frontend Client (React + TypeScript)"]
        UI_Dash["Dashboard Screen<br/>(Project Overview & Stats)"]
        UI_Work["Project Workspace<br/>(Sketches & History Tree)"]
        UI_Studio["Generation Studio<br/>(Prompt Builder & Sensitivity)"]
        UI_Review["Reviewer Workspace<br/>(Split Slider & Decisions)"]
        UI_Eval["Ablation Evaluation<br/>(1-5 Metrics Form & Stats)"]
    end

    subgraph API ["Backend API Gateway (FastAPI)"]
        AuthMid["JWT Auth & Role Enforcement<br/>(Designer vs Reviewer vs Admin)"]
        ProjRouter["/api/projects<br/>(CRUD & Assignments)"]
        SketchRouter["/api/sketches<br/>(Upload & Canny Tuning)"]
        GenRouter["/api/generation<br/>(Background Job Dispatcher)"]
        RevRouter["/api/reviews<br/>(Decisions & Concept Sheet)"]
        EvalRouter["/api/evaluation<br/>(Ablation Experiment Hub)"]
        FileRouter["/api/files<br/>(Secure Stream with Permission Check)"]
    end

    subgraph Storage ["Persistent Storage Systems"]
        DB[("SQLite Database<br/>(SQLAlchemy ORM)")]
        FileStore[("Local Filesystem Storage<br/>• uploads/sketches/<br/>• uploads/conditioning/<br/>• uploads/renders/<br/>• uploads/samples/")]
    end

    subgraph InferenceWorker ["AI Generation & Preprocessing Engine"]
        Preprocessor["OpenCV / Pillow Preprocessor<br/>(EXIF Transpose, Aspect Pad, Canny Edges)"]
        Worker["FastAPI Background Task Worker<br/>(Async Job Transitions & Seeds)"]
        DiffusersPipe["Hugging Face Diffusers Pipeline<br/>• Stable Diffusion v1.5<br/>• ControlNet Canny"]
        DemoFallback["Sample Demo & Concept Synthesis<br/>(Instant Laptop Demo & CPU Fallback)"]
    end

    Browser <-->|HTTP / REST JSON & Form-Data| API

    API -->|Read / Write Metadata| DB
    API -->|Stream Authorized Images| FileStore

    SketchRouter --> Preprocessor
    Preprocessor -->|Save Clean Edge Map| FileStore

    GenRouter --> Worker
    Worker -->|Read Conditioning Map| FileStore
    Worker --> DiffusersPipe
    Worker --> DemoFallback
    Worker -->|Save Concept Renders| FileStore
    Worker -->|Update Status & Seeds| DB
```

## Architectural Highlights

### 1. Separation of Concerns
- **Frontend (`frontend/`)**: React 18 with TypeScript and Vite. Modular state management with AuthContext, API client module, and dedicated workspaces for designers and reviewers.
- **Backend API (`backend/app/`)**: FastAPI application organized into discrete routers (`routers/`), models (`models.py`), schemas (`schemas.py`), services (`services/`), and configuration (`config.py`).
- **Inference Engine (`backend/app/services/generator.py`)**: Hugging Face Diffusers pipeline manager separated from core application logic. Detects hardware (CUDA, MPS, CPU) and supports two operating modes:
  1. **AI Generation**: Full ControlNet Canny + Stable Diffusion 1.5 pipeline.
  2. **Sample Demo**: Instant pre-rendered concept suite allowing demonstration and grading on standard student laptops without a dedicated GPU.

### 2. Multi-Role Permission Enforcement
- Backend validates permissions on every request:
  - Designers can create projects, upload sketches, generate concepts, and author revisions.
  - Reviewers can view assigned projects, inspect submitted renders, record formal decisions (`approved`, `changes_requested`, `rejected`), and leave feedback comments.
  - Image downloads and streaming (`/api/files/{category}/{filename}`) check project ownership and reviewer assignment to prevent unauthorized asset access.

### 3. Spatial ControlNet Conditioning
- Sketches are uploaded as JPG or PNG (including smartphone photos of paper drawings).
- PIL corrects EXIF orientation and standardizes dimensions (512x512) preserving aspect ratio.
- OpenCV extracts Canny edge maps with adjustable low and high sensitivity thresholds.
- Spatial lines act as spatial conditioning guides so roller coaster loops, stations, and tracks remain locked in place while the diffusion model renders materials, lighting, and atmosphere.

### 4. Version Revision & Approval Lineage
- If a reviewer requests changes, the designer spawns a revision request referencing the original render ID (`source_render_id`).
- All previous renders, comments, and review decisions are permanently archived.
- Approving an older version never approves a newer version, and approving a newer version preserves historical review decisions on older drafts.
