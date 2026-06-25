
  # TruthQuest AI App Design

  This is a code bundle for TruthQuest AI App Design. The original project is available at https://www.figma.com/design/tEB6hzKoyXy9rIMvf0iivq/TruthQuest-AI-App-Design.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

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
  - `POST /api/v1/deepfake/analyze`

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
  
