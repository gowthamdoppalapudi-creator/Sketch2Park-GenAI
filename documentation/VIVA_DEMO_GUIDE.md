# Sketch2Park — University Viva & Live Demonstration Guide

This guide walks university examiners, professors, and students step-by-step through the technical viva and live demonstration of **Sketch2Park — AI Theme Park Concept Renderer**.

---

## 1. Quick Launch Commands

### Terminal 1: Backend API (FastAPI)
```powershell
# Navigate to workspace
cd "f:\GENAI PROJECT"

# Activate environment / install dependencies (if not done)
# python -m pip install -r backend/requirements.txt

# Start FastAPI server on port 8000
python -m uvicorn app.main:app --app-dir backend --reload --port 8000
```
- API Health Endpoint: [http://localhost:8000/api/health](http://localhost:8000/api/health)
- Interactive Swagger API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Terminal 2: Frontend Client (React + TypeScript)
```powershell
cd "f:\GENAI PROJECT\frontend"

# Launch Vite Dev Server on port 5173
npm run dev
```
- Open Web Application: [http://localhost:5173](http://localhost:5173)

---

## 2. Pre-Seeded Demonstration Accounts

For a fast, effortless presentation, the database comes pre-seeded with two accounts:

| Role | Username | Email | Password | Quick Login in UI |
| :--- | :--- | :--- | :--- | :--- |
| **Designer** | `designer_alex` | `designer@sketch2park.com` | `designer123` | Click **"Designer"** button |
| **Reviewer** | `reviewer_morgan` | `reviewer@sketch2park.com` | `reviewer123` | Click **"Reviewer"** button |

---

## 3. Walkthrough of the Final Acceptance Scenario

Follow these exact steps during your demonstration:

### Step 1: Designer View & Project Exploration
1. Open [http://localhost:5173](http://localhost:5173).
2. Click **"Designer"** for 1-click authentication as **Alex Rivera (Lead Designer)**.
3. On the Dashboard, observe the pre-seeded **"Sunset Coaster"** project.
4. Click on **"Sunset Coaster"** to enter the **Project Workspace**.
5. Inspect:
   - Attraction Category: *Roller Coaster*.
   - Lead Designer: *Alex Rivera*.
   - Assigned Reviewer: *Morgan Vance*.
   - Original Sketch: showing a large central loop and a boarding station in the foreground.
   - Conditioning Canny Map: white contours on black background.

### Step 2: Generation Studio & Parameters
1. Click **"Open in Generation Studio"** on the sketch card.
2. Demonstrate the **Prompt Builder**:
   - Thematic Style: *Rustic Adventure & Frontier*.
   - Materials: *Red Tubular Steel & Weathered Cedar Timber*.
   - Time of Day: *Sunset / Golden Hour Glow*.
   - Weather: *Crisp & Crystal Clear Sky*.
   - Final prompt automatically reflects:
     > *"Photorealistic theme park concept of a red steel roller coaster with a large central loop, a wooden boarding station in the foreground, trees around the track, and warm sunset lighting."*
3. Show the **Inference Controls**:
   - Sketch Guidance Strength (ControlNet scale): `0.85`.
   - Variations: `2 Concepts`.
   - Seed: `42100`.
   - Mode Toggle: *AI Generation Mode* (Diffusers with real Canny spatial guidance) and *Sample Demo* (fast local concept synthesis).
4. Click **"Generate 2 Concepts"**:
   - Observe live status indicator transition from `queued` to `running` to `completed`.
   - Output renders appear in the gallery.
   - Click a render card to view the interactive **Visual Comparison Slider** (drag divider ↔ to verify that loop and station match the sketch lines).
5. Click **"Submit to Review"** on Render #1.

### Step 3: Reviewer Inspection & Requesting Changes
1. Click the top-right user menu and click **Sign Out**.
2. Click **"Reviewer"** for 1-click login as **Morgan Vance (Creative Reviewer)**.
3. Open the **"Sunset Coaster"** project and click on **Render #1**.
4. In the **Reviewer Workspace**:
   - Observe the split comparison between the Canny conditioning lines and the rendered concept.
   - In the review feedback card, enter:
     > *"The loop silhouette against the sunset is breathtaking! However, the wooden station in the foreground appears slightly too shadowed. Please provide brighter station lighting along the queue platform so guests and architectural timber details stand out."*
   - Click **"Request Changes"**.
   - Observe that Render #1 status transitions to `changes_requested`.

### Step 4: Designer Creates Revision From Render #1
1. Switch back to the Designer account (**Alex Rivera**).
2. Open Render #1 in the Reviewer Workspace.
3. Click **"Revise Concept & Respond"** (or *"Create Revision From Render #1"*).
4. Notice that the Generation Studio opens pre-populated with:
   - Source Render ID linked to `#1`.
   - Previous prompt and hyperparameters preserved.
5. In the prompt editor, update the station description:
   > *"Photorealistic theme park concept of a red steel roller coaster with a large central loop, a wooden boarding station in the foreground with bright warm amber lantern lighting and illuminated queue, trees around the track, and warm vibrant sunset lighting."*
6. Click **"Generate Concept"** to produce Revision Render #3.
7. Click **"Submit to Review"** on the new render.

### Step 5: Reviewer Approves Revision & Downloads Concept Sheet
1. Switch back to Reviewer (**Morgan Vance**).
2. Open Revision Render #3.
3. In the review feedback box, enter:
   > *"Magnificent revision! The brighter station lighting illuminates the handcrafted timber trusses and boarding gates perfectly, creating a welcoming atmosphere against the sunset loop. Approved for investor and stakeholder presentation."*
4. Click **"Approve"**.
5. Observe the approved green badge on Render #3.
6. Verify version isolation:
   - Return to the Project Workspace.
   - Notice that Render #1 remains marked `changes_requested`.
   - Notice that Render #3 is marked `approved`.
   - **Crucial Rule Confirmed:** Approving Revision #3 did NOT alter or automatically approve older versions!
7. Click **"Concept Sheet"**:
   - Inspect the printable presentation sheet showing project title, original sketch, approved render, final prompt, version lineage tag `Rev-2 (Render #3) [Revision of #1]`, reviewer comments, and signatures.
   - Click **"Print Concept Sheet"** to show print layout (`@media print`).
   - Click **"Download Render"** to demonstrate asset export.

---

## 4. University Viva Evaluation & Technical Experiment

Click the **"Viva Evaluation"** tab in the top navigation bar to demonstrate the experimental ablation study:

1. **Ablation Study Concept**:
   - Compares an image generated with **Text Alone** (baseline without sketch lines) versus **Text + Sketch Guidance** (using ControlNet Canny spatial conditioning).
   - Keeps model, seed, resolution, and inference hyperparameters identical.
2. **Key Spatial Feature Checklist**:
   - Main Loop Position: without sketch guidance, the model places the loop randomly or in the center. With ControlNet, the loop is locked to the designer's sketch contour.
   - Boarding Station: matches the right foreground placement of the drawing.
   - Track Silhouette: follows the lift hill and drop curve.
3. **1–5 Rating Sliders**:
   - Preservation of Sketch Layout: `5 / 5`
   - Visual Realism: `5 / 5`
   - Agreement with Prompt: `5 / 5`
4. **Aggregate Metric Reporting**:
   - The system computes and displays average ratings **only for ratings actually entered**, accompanied by the exact count of evaluated pairs (e.g., `1 Pair Evaluated`).

---

## 5. Automated Verification & Test Execution

Run the comprehensive pytest test suite to demonstrate engineering rigor:

```powershell
$env:PYTHONPATH="backend"
python -m pytest backend/tests/test_suite.py -v
```

Expected result:
```
======================= 5 passed in ~4.6s =======================
✓ test_role_permissions_and_project_access (Designer vs Reviewer project creation, ownership, unassigned access 403)
✓ test_upload_validation_and_preprocessing (JPG/PNG checks, corrupt byte rejection, dimension bounds, Canny 512x512)
✓ test_generation_status_transitions_and_variations (queued -> running -> completed, seed recording, elapsed time)
✓ test_revision_and_approval_history_isolation (approving revision preserves older review records without auto-approval)
✓ test_evaluation_summary_metrics (ablation metric computation and count reporting)
```

Frontend production build verification:
```powershell
cd frontend
npm run build
```
Result: `✓ built in 2.3s` (zero TypeScript errors).
