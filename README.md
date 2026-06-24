
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

  ## Backend API contract

  The app now expects a backend at `VITE_API_BASE_URL` that serves these endpoints:

  - `GET /api/v1/app/bootstrap`
    - Returns the screen data used by landing, dashboard, learning, quiz, profile, teacher, and mobile screens.
  - `POST /api/v1/content/analyze`
    - Body: `{ "mode": "url" | "text" | "image", "input": string }`
    - Returns: score, summary, chips, metrics, recommendations, and XP earned.
  - `POST /api/v1/deepfake/analyze`
    - Body: `{ "mediaType": "image" | "video" | "audio" }`
    - Returns: verdict, probability, indicators, metadata, and AI summary.

  If `VITE_API_BASE_URL` is not set, the app will try to call the same origin.
  