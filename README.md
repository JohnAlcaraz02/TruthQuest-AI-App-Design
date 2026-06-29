
# TruthQuest AI

TruthQuest is an evidence-guided media-literacy prototype. It turns suspicious content into extracted claims, transparent verification signals, targeted learning, and a teacher intervention workflow.

TruthQuest does not claim to determine objective truth or visually detect deepfakes. Its media-integrity tool inspects signatures, metadata, dimensions, hashes, container structure, and embedded provenance markers.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

Run `npm run test:backend` for deterministic backend regression tests.

Run `npm run evaluate` for the 30-case offline heuristic evaluation. This measures agreement with curated language/claim-extraction expectations; it is not real-world factual accuracy.

  ## Backend service

  The repo now includes a FastAPI backend scaffold in `backend/`.

  ### Run the backend

  ```bash
  cd backend
  pip install -r requirements.txt
  uvicorn --app-dir . app.main:app --reload --port 8000
  ```

  ### Endpoints

  - `GET /health`
  - `GET /api/v1/app/bootstrap`
  - `POST /api/v1/content/analyze`
  - `POST /api/v1/deepfake/analyze` (legacy API path; media-integrity semantics)

  The frontend can point `VITE_API_BASE_URL` at `http://localhost:8000`.

  ### Credibility evidence search

  The content analyzer uses free, no-key evidence sources when the backend has network access:

  - Wikipedia page search
  - Crossref scholarly metadata
  - PubMed / NCBI E-utilities
  - arXiv Atom API
  - GDELT document search

  `POST /api/v1/content/analyze` searches extracted claims, excludes the original source domain, and labels claims as independently supported, partially supported, source-only, or needing evidence. No paid search API is required.

  ### Optional local OCR for image posts

  Image uploads are analyzed locally for file signature, dimensions, hash, entropy, and embedded generator markers. If the free `tesseract` command-line tool is installed, the backend also extracts text from memes/screenshots and runs that text through the same claim analyzer.

  macOS:

  ```bash
  brew install tesseract
  ```

  Ubuntu/Debian:

  ```bash
  sudo apt-get install tesseract-ocr
  ```

  ## Backend API contract

  The app now expects a backend at `VITE_API_BASE_URL` that serves these endpoints:

  - `GET /api/v1/app/bootstrap`
    - Returns the screen data used by landing, dashboard, learning, quiz, profile, teacher, and mobile screens.
  - `POST /api/v1/content/analyze`
    - Body: `{ "mode": "url" | "text" | "image", "input": string }`
    - Returns: score, summary, chips, metrics, recommendations, source signals, extracted claims, evidence sources, score breakdown, and XP earned.
  - `POST /api/v1/deepfake/analyze`
    - Body: multipart form data with `media_type` and `file`.
    - Returns: verdict, probability, indicators, metadata, and AI summary.

  If `VITE_API_BASE_URL` is not set, the app will try to call the same origin.

## Deployment

- Frontend: build with `npm run build` and deploy `dist/`. `vercel.json` provides SPA route rewrites.
- Backend: build from `backend/Dockerfile`, or run the documented Uvicorn command.
- Set `VITE_API_BASE_URL` to the deployed backend origin before building the frontend.
- Restrict CORS origins and publish retention/subprocessor policies before any school pilot.

## Validation status

The included evaluation set is a transparent regression baseline, not a benchmark. Before claiming product accuracy, run a labeled external evaluation with reviewers, report per-class precision/recall, document failure cases, and conduct a measured classroom pre/post pilot.
  
