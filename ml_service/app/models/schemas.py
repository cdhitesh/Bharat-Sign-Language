# ml_service/app/models/schemas.py

from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Any, Optional
import base64


class TopPrediction(BaseModel):
    label: str
    confidence: float


class PredictBase64Request(BaseModel):
    """Request schema for base64 encoded image (from React webcam)."""
    image: str = Field(
        ...,
        description="Base64 encoded image string. Can include data URI prefix."
    )

    @field_validator("image")
    @classmethod
    def validate_base64(cls, v: str) -> str:
        # Strip data URI prefix if present
        # e.g. "data:image/jpeg;base64,/9j/4AAQ..." → "/9j/4AAQ..."
        if "," in v:
            v = v.split(",", 1)[1]

        if not v.strip():
            raise ValueError("Image data cannot be empty.")

        # Validate it's valid base64
        try:
            base64.b64decode(v, validate=True)
        except Exception:
            raise ValueError("Invalid base64 encoded image.")

        return v.strip()


class PredictResponse(BaseModel):
    """Unified response for both file upload and base64 endpoints."""
    prediction: str = Field(
        ...,
        description="Predicted sign label e.g. 'A', 'B', '1', or 'uncertain'"
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence score between 0 and 1"
    )
    is_confident: bool = Field(
        ...,
        description="True if confidence exceeds threshold (0.6)"
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Top-k predictions, model version, inference time"
    )


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str
    classes: int
    model_path: str