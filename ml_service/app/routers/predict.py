# ml_service/app/routers/predict.py

import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.schemas import (
    PredictBase64Request,
    PredictResponse,
    HealthResponse,
)
from app.services.predictor import (
    predictor,
    MODEL_VERSION,
    CLASS_LABELS,
    MODEL_PATH,
)

logger = logging.getLogger(__name__)

router = APIRouter()

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}
MAX_FILE_SIZE_MB = 5


def _check_model_ready():
    """Reusable guard — raises 503 if model isn't loaded."""
    if not predictor.is_loaded:
        raise HTTPException(
            status_code=503,
            detail=(
                "ML model is not loaded. "
                "Place sign_language_interpreter_model.h5 "
                "inside the ml_service/ folder and restart."
            ),
        )


# ── Endpoint 1: File Upload ────────────────────────────────────────────────────

@router.post(
    "/predict",
    response_model=PredictResponse,
    summary="Predict sign from image file upload",
    description=(
        "Upload a JPG or PNG image of a hand sign. "
        "Compatible with test_predict.py."
    ),
    tags=["Prediction"],
)
async def predict_file(file: UploadFile = File(...)):
    """
    Accepts multipart file upload.
    Used for:
    - Direct testing via test_predict.py
    - Postman / Swagger UI testing
    - Any client that sends multipart/form-data
    """
    _check_model_ready()

    # Validate content type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail=(
                f"Unsupported file type '{file.content_type}'. "
                f"Allowed: JPG, PNG, WEBP."
            ),
        )

    # Read bytes
    image_bytes = await file.read()

    # Validate size
    size_mb = len(image_bytes) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({size_mb:.1f}MB). Max is {MAX_FILE_SIZE_MB}MB.",
        )

    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        result = predictor.predict_from_bytes(image_bytes)
        return PredictResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        logger.error(f"File prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── Endpoint 2: Base64 JSON ────────────────────────────────────────────────────

@router.post(
    "/predict/base64",
    response_model=PredictResponse,
    summary="Predict sign from base64 encoded image",
    description=(
        "Send a base64 encoded image from React webcam. "
        "Accepts raw base64 or full data URI."
    ),
    tags=["Prediction"],
)
async def predict_base64(request: PredictBase64Request):
    """
    Accepts JSON body with base64 image.
    Used by React frontend webcam capture:
        canvas.toDataURL('image/jpeg') → send here
    """
    _check_model_ready()

    try:
        result = predictor.predict_from_base64(request.image)
        return PredictResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        logger.error(f"Base64 prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── Health Check ───────────────────────────────────────────────────────────────

@router.get(
    "/health",
    response_model=HealthResponse,
    summary="ML service health check",
    tags=["Health"],
)
async def health():
    """
    Called by Node.js backend mlService.js to verify
    ML service is alive before sending predictions.
    """
    return HealthResponse(
        status="ok" if predictor.is_loaded else "degraded",
        model_loaded=predictor.is_loaded,
        version=MODEL_VERSION,
        classes=len(CLASS_LABELS),
        model_path=MODEL_PATH,
    )