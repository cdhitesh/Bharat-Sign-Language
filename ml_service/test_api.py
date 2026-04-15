# ml_service/test_api.py

import httpx
import json
import base64
import sys
import os

BASE_URL = "http://localhost:8000"


def print_result(title: str, response: httpx.Response):
    status_icon = "✅" if response.status_code < 400 else "❌"
    print(f"\n{'='*55}")
    print(f"{status_icon} {title}")
    print(f"   Status : {response.status_code}")
    try:
        print(f"   Body   : {json.dumps(response.json(), indent=2)}")
    except Exception:
        print(f"   Body   : {response.text}")
    print("=" * 55)


def test_health():
    print("\n🔍 Testing health check...")
    r = httpx.get(f"{BASE_URL}/health")
    print_result("GET /health", r)
    assert r.status_code == 200, "Health check failed"
    assert r.json()["model_loaded"] is True, "Model not loaded!"
    print("   → Model is loaded and ready ✅")


def test_predict_file(img_path: str):
    print(f"\n🔍 Testing file upload with: {img_path}")
    if not os.path.exists(img_path):
        print(f"   ⚠️  Image not found at {img_path}, skipping.")
        return

    with open(img_path, "rb") as f:
        files = {"file": ("test.jpg", f, "image/jpeg")}
        r = httpx.post(f"{BASE_URL}/predict", files=files)

    print_result("POST /predict (file upload)", r)

    if r.status_code == 200:
        data = r.json()
        print(f"   → Predicted : {data['prediction']}")
        print(f"   → Confidence: {data['confidence']}")
        print(f"   → Confident : {data['is_confident']}")


def test_predict_base64(img_path: str):
    print(f"\n🔍 Testing base64 with: {img_path}")
    if not os.path.exists(img_path):
        print(f"   ⚠️  Image not found at {img_path}, skipping.")
        return

    with open(img_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")

    # Test with raw base64
    r = httpx.post(
        f"{BASE_URL}/predict/base64",
        json={"image": b64},
    )
    print_result("POST /predict/base64 (raw base64)", r)

    # Test with data URI prefix (like React canvas.toDataURL())
    data_uri = f"data:image/jpeg;base64,{b64}"
    r2 = httpx.post(
        f"{BASE_URL}/predict/base64",
        json={"image": data_uri},
    )
    print_result("POST /predict/base64 (data URI)", r2)


def test_invalid_inputs():
    print("\n🔍 Testing invalid inputs...")

    # Empty base64
    r = httpx.post(f"{BASE_URL}/predict/base64", json={"image": ""})
    print_result("Empty base64 (expect 422)", r)
    assert r.status_code == 422

    # Invalid base64
    r = httpx.post(
        f"{BASE_URL}/predict/base64",
        json={"image": "this_is_not_base64!!!"}
    )
    print_result("Invalid base64 (expect 422)", r)
    assert r.status_code == 422

    print("   → Invalid input handling works ✅")


if __name__ == "__main__":
    # Optional: pass image path as argument
    # python test_api.py Indian/A/1.jpg
    img_path = sys.argv[1] if len(sys.argv) > 1 else "Indian/A/1.jpg"

    print("🧪 Sign Language ML Service — API Tests")
    print(f"   Base URL  : {BASE_URL}")
    print(f"   Test image: {img_path}")

    try:
        test_health()
        test_predict_file(img_path)
        test_predict_base64(img_path)
        test_invalid_inputs()
        print("\n🎉 All tests passed!")

    except AssertionError as e:
        print(f"\n❌ Assertion failed: {e}")
        sys.exit(1)
    except httpx.ConnectError:
        print(
            "\n❌ Could not connect to ML service.\n"
            "   Make sure uvicorn is running:\n"
            "   uvicorn app.main:app --reload --port 8000"
        )
        sys.exit(1)