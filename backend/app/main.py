from __future__ import annotations

import logging

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .schemas import (
    ContentAnalyzeRequest,
    ContentAnalysisResponse,
    DeepfakeAnalysisResponse,
)
from .analysis import (
    build_bootstrap_data,
    build_content_analysis_response,
    build_deepfake_analysis_response,
)

logger = logging.getLogger(__name__)


app = FastAPI(title="TruthQuest AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/app/bootstrap")
def get_bootstrap() -> dict:
    return build_bootstrap_data()


@app.post("/api/v1/content/analyze", response_model=ContentAnalysisResponse)
def analyze_content(payload: ContentAnalyzeRequest) -> ContentAnalysisResponse:
    result = build_content_analysis_response(payload.mode, payload.input)
    return ContentAnalysisResponse(**result)


@app.post("/api/v1/deepfake/analyze", response_model=DeepfakeAnalysisResponse)
async def analyze_deepfake(
    media_type: str = Form(...),
    file: UploadFile = File(...),
) -> DeepfakeAnalysisResponse:
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    result = build_deepfake_analysis_response(
        media_type=media_type,
        filename=file.filename or "upload",
        content_type=file.content_type or "",
        data=contents,
    )
    return DeepfakeAnalysisResponse(**result)


# Optional health probe used by the frontend bootstrap flow.
@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
