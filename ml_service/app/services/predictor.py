# ml_service/app/services/predictor.py

import os
import time
import base64
import logging
import numpy as np
from typing import Dict, Any

logger = logging.getLogger(__name__)

# ── Constants — must match training config exactly ─────────────────────────────
IMG_SIZE        = 64      # Must match img_size in train_model.py
CONF_THRESHOLD  = 0.6     # Must match CONF_THRESHOLD in live_predict_stable_sentence.py
MODEL_VERSION   = "1.0.0"

# Class labels — must match folder order in your Indian/ dataset
# Keras reads folders alphabetically:
# 1,2,3,4,5,6,7,8,9,A,B,C,...,Z
CLASS_LABELS = [
    "1", "2", "3", "4", "5", "6", "7", "8", "9",
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
    "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
    "U", "V", "W", "X", "Y", "Z"
]

# Model path — configurable via .env
MODEL_PATH = os.getenv(
    "MODEL_PATH",
    "sign_language_interpreter_model.h5"
)


class SignLanguagePredictor:
    """
    Production wrapper around your trained CNN model.

    Supports:
    - .h5 model format
    - .keras model format
    - Raw image bytes (from file upload)
    - Base64 encoded images (from React webcam)

    Preprocessing replicates live_predict_stable_sentence.py exactly:
        img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
        img = img / 255.0
        img = np.expand_dims(img, axis=0)
    """

    def __init__(self):
        self.model = None
        self.is_loaded = False
        self.loaded_model_path = None
        self._load_model()

    def _load_model(self):
        try:
            import tensorflow as tf
            from app.services.model_loader import ensure_model_exists

            # Download model if not present
            if not ensure_model_exists():
                logger.error("❌ Model could not be loaded or downloaded.")
                self.is_loaded = False
                return

            candidates = [MODEL_PATH]
            if MODEL_PATH.endswith(".h5"):
                candidates.append(MODEL_PATH.replace(".h5", ".keras"))
            elif MODEL_PATH.endswith(".keras"):
                candidates.append(MODEL_PATH.replace(".keras", ".h5"))

            loaded = False
            for path in candidates:
                if os.path.exists(path):
                    logger.info(f"Loading model from: {path}")
                    self.model = tf.keras.models.load_model(path)
                    self.is_loaded = True
                    self.loaded_model_path = path
                    loaded = True
                    logger.info(
                        f"✅ Model loaded.\n"
                        f"   Path: {path}\n"
                        f"   Input: {self.model.input_shape}\n"
                        f"   Classes: {len(CLASS_LABELS)}"
                    )
                    break

            if not loaded:
                raise FileNotFoundError(
                    f"No model file found. Tried: {candidates}"
                )

        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            self.is_loaded = False

    def _bytes_to_tensor(self, image_bytes: bytes) -> np.ndarray:
        """
        Converts raw image bytes to model input tensor.

        Replicates preprocessing from live_predict_stable_sentence.py:
            img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
            img = img / 255.0
            img = np.expand_dims(img, axis=0)
        """
        import cv2

        # Decode bytes → numpy array → OpenCV image
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            raise ValueError(
                "Could not decode image. "
                "Ensure the file is a valid JPG or PNG."
            )

        # BGR → RGB (OpenCV loads BGR, model was trained on RGB)
        img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Resize to 64×64
        img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))

        # Normalize pixel values to [0, 1]
        img = img / 255.0

        # Add batch dimension: (64,64,3) → (1,64,64,3)
        img = np.expand_dims(img, axis=0).astype(np.float32)

        return img

    def _base64_to_bytes(self, base64_string: str) -> bytes:
        """Convert base64 string to raw bytes."""
        # Strip data URI prefix if still present
        if "," in base64_string:
            base64_string = base64_string.split(",", 1)[1]
        return base64.b64decode(base64_string)

    def _run_inference(self, tensor: np.ndarray) -> Dict[str, Any]:
        """
        Core inference logic shared by both predict methods.
        Replicates:
            prediction = model.predict(img, verbose=0)
            confidence = np.max(prediction)
            class_index = np.argmax(prediction)
        """
        start_time = time.time()

        # Run model inference
        raw_output = self.model.predict(tensor, verbose=0)

        # Extract top prediction
        confidence  = float(np.max(raw_output))
        class_index = int(np.argmax(raw_output))

        # Build top-5 predictions for metadata
        top5_indices = np.argsort(raw_output[0])[::-1][:5]
        top_k = [
            {
                "label": CLASS_LABELS[i],
                "confidence": round(float(raw_output[0][i]), 4)
            }
            for i in top5_indices
        ]

        # Apply confidence threshold — same as live_predict_stable_sentence.py
        is_confident    = confidence > CONF_THRESHOLD
        predicted_label = CLASS_LABELS[class_index] if is_confident else "uncertain"
        inference_ms    = int((time.time() - start_time) * 1000)

        return {
            "prediction":   predicted_label,
            "confidence":   round(confidence, 4),
            "is_confident": is_confident,
            "metadata": {
                "top_k":            top_k,
                "conf_threshold":   CONF_THRESHOLD,
                "model_version":    MODEL_VERSION,
                "inference_time_ms": inference_ms,
            }
        }

    def predict_from_bytes(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Predict from raw image bytes.
        Used by the file upload endpoint.
        """
        try:
            tensor = self._bytes_to_tensor(image_bytes)
            return self._run_inference(tensor)
        except ValueError as e:
            raise ValueError(str(e))
        except Exception as e:
            logger.error(f"predict_from_bytes error: {e}")
            raise RuntimeError(f"Prediction failed: {str(e)}")

    def predict_from_base64(self, base64_string: str) -> Dict[str, Any]:
        """
        Predict from base64 encoded image.
        Used by the JSON endpoint (React webcam frames).
        """
        try:
            image_bytes = self._base64_to_bytes(base64_string)
            tensor      = self._bytes_to_tensor(image_bytes)
            return self._run_inference(tensor)
        except ValueError as e:
            raise ValueError(str(e))
        except Exception as e:
            logger.error(f"predict_from_base64 error: {e}")
            raise RuntimeError(f"Prediction failed: {str(e)}")


# Singleton — loaded once when FastAPI starts
predictor = SignLanguagePredictor()