# ml_service/app/services/model_loader.py

import os
import logging
import requests

logger = logging.getLogger(__name__)

MODEL_PATH = os.getenv("MODEL_PATH", "sign_language_interpreter_model.h5")
MODEL_URL  = os.getenv("MODEL_URL", "")


def get_confirm_token(response):
    """Handle Google Drive large file virus scan warning."""
    for key, value in response.cookies.items():
        if key.startswith("download_warning"):
            return value
    return None


def ensure_model_exists():
    """Download model from URL if not present locally."""
    if os.path.exists(MODEL_PATH):
        size_mb = os.path.getsize(MODEL_PATH) / (1024 * 1024)
        logger.info(
            f"Model found at {MODEL_PATH} ({size_mb:.1f} MB)"
        )
        return True

    if not MODEL_URL:
        logger.error(
            "Model not found and MODEL_URL not set.\n"
            "Add MODEL_URL env var on Render."
        )
        return False

    logger.info(f"⬇️  Downloading model from Google Drive...")

    try:
        session = requests.Session()

        # First request — may get virus scan warning for large files
        response = session.get(MODEL_URL, stream=True, timeout=60)

        # Handle Google Drive confirmation for large files
        token = get_confirm_token(response)
        if token:
            logger.info("   Large file detected — confirming download...")
            params = {"confirm": token}
            response = session.get(
                MODEL_URL, params=params,
                stream=True, timeout=300
            )

        response.raise_for_status()

        total_bytes = int(
            response.headers.get("content-length", 0)
        )
        downloaded  = 0
        chunk_size  = 1024 * 1024  # 1MB chunks

        with open(MODEL_PATH, "wb") as f:
            for chunk in response.iter_content(chunk_size=chunk_size):
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)

                    if total_bytes:
                        pct = (downloaded / total_bytes) * 100
                        mb  = downloaded / (1024 * 1024)
                        # Log every 20MB
                        if int(mb) % 20 == 0 and mb > 0:
                            logger.info(
                                f"   {pct:.0f}% — {mb:.0f}MB downloaded"
                            )

        final_mb = os.path.getsize(MODEL_PATH) / (1024 * 1024)

        # Sanity check — if file is tiny it's probably an error page
        if final_mb < 1:
            os.remove(MODEL_PATH)
            logger.error(
                "Downloaded file is too small — "
                "probably an error page not the model.\n"
                "   Check your MODEL_URL is a direct download link."
            )
            return False

        logger.info(
            f"Model downloaded successfully! "
            f"({final_mb:.1f} MB)"
        )
        return True

    except requests.exceptions.Timeout:
        logger.error(" Download timed out. Model is too large or network is slow.")
        if os.path.exists(MODEL_PATH):
            os.remove(MODEL_PATH)
        return False

    except Exception as e:
        logger.error(f"Download failed: {e}")
        if os.path.exists(MODEL_PATH):
            os.remove(MODEL_PATH)
        return False