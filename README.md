```
███████╗██╗ ██████╗ ███╗   ██╗██╗     ███████╗ █████╗ ██████╗ ███╗   ██╗
██╔════╝██║██╔════╝ ████╗  ██║██║     ██╔════╝██╔══██╗██╔══██╗████╗  ██║
███████╗██║██║  ███╗██╔██╗ ██║██║     █████╗  ███████║██████╔╝██╔██╗ ██║
╚════██║██║██║   ██║██║╚██╗██║██║     ██╔══╝  ██╔══██║██╔══██╗██║╚██╗██║
███████║██║╚██████╔╝██║ ╚████║███████╗███████╗██║  ██║██║  ██║██║ ╚████║
╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝
```

### AI-Powered Indian Sign Language Learning & Translation Platform
*Breaking communication barriers, one sign at a time.*

## 📌 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [ML Model](#-ml-model)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Team](#-team)

---

## 🌟 Overview

**SignLearn** is a full-stack, production-grade AI application built for **Smart India Hackathon 2024**. It enables real-time recognition of **Indian Sign Language (ISL)** using a custom-trained Convolutional Neural Network, and provides a complete learning platform with a sign library, quiz mode, and prediction history.

The application bridges the communication gap between the deaf and hearing communities by:

- **Translating** hand signs to text in real-time via webcam
- **Teaching** ISL through an organized sign library and flashcard quizzes
- **Tracking** learning progress through prediction history and quiz analytics

> 🇮🇳 Trained on the **Indian Sign Language dataset** — 35 classes (A–Z + 1–9), 1,200 images per class.

---

## ✨ Features

### 🔴 Real-time Sign Detection
- Webcam-based live detection using a trained CNN model
- 6-frame stability algorithm — same as `live_predict_stable_sentence.py`
- Automatic word and sentence building
- 1.5-second pause detection for space insertion
- Confidence scoring with visual feedback

### 📚 Sign Library
- Organized by subjects (Alphabets, Numbers, Greetings)
- Each sign has image, meaning, and keywords
- Difficulty levels: Beginner / Intermediate / Advanced
- Full-text search with autocomplete suggestions
- Filter by subject and difficulty

### 🧠 Quiz Mode
- Random flashcard selection using MongoDB `$sample`
- 3D flip animation to reveal answers
- Per-session accuracy tracking
- Batch result submission
- Historical quiz analytics

### 🕐 Prediction History
- Every ML prediction is saved automatically
- Filter by input type (image/text/speech)
- Star/favorite important predictions
- View top-5 predictions with confidence bars
- Paginated table with full detail modal

### 🔐 Authentication
- Powered by **Clerk** — email and Google sign-in
- JWT verification on every protected API route
- Automatic user sync to MongoDB on first login

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | SPA with hooks and functional components |
| **Styling** | Tailwind CSS v4 | Utility-first CSS with liquid glass design |
| **Auth** | Clerk | Authentication and JWT management |
| **Backend** | Node.js + Express | REST API server |
| **Database** | MongoDB + Mongoose | Data persistence |
| **ML Service** | Python + FastAPI | Sign language inference microservice |
| **ML Model** | TensorFlow/Keras CNN | Trained on Indian Sign Language dataset |
| **Image Hosting** | Cloudinary | Sign library images |
| **Deployment** | Vercel + Render | Frontend CDN + Backend hosting |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│                    React App (Vercel CDN)                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NODE.JS BACKEND (Render)                     │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Auth    │  │ History  │  │  Signs   │  │     Quiz     │  │
│  │  Routes  │  │  Routes  │  │  Routes  │  │    Routes    │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│       │              │              │                │          │
│  ┌────▼──────────────▼──────────────▼────────────────▼──────┐  │
│  │              Service Layer + Middleware                   │  │
│  │         Clerk JWT Auth │ Rate Limiting │ CORS            │  │
│  └────────────────────────┬──────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────▼──────────┐  ┌───────────────────┐  │
│  │         MongoDB Atlas             │  │  mlService.js     │  │
│  │   Users │ Signs │ History │ Quiz  │  │  (HTTP Bridge)    │  │
│  └───────────────────────────────────┘  └────────┬──────────┘  │
└────────────────────────────────────────────────────┼────────────┘
                                                     │ HTTP
                                                     ▼
                          ┌──────────────────────────────────────┐
                          │      FASTAPI ML SERVICE (Render)     │
                          │                                      │
                          │  POST /predict  │  GET /health       │
                          │                                      │
                          │  ┌──────────────────────────────┐   │
                          │  │   TensorFlow CNN Model        │   │
                          │  │   Input:  64×64 RGB image     │   │
                          │  │   Output: 35 class probs      │   │
                          │  │   Threshold: 0.6 confidence   │   │
                          │  └──────────────────────────────┘   │
                          └──────────────────────────────────────┘
```

### Request Flow — Sign Detection

```
1. React webcam captures frame (64×64 JPEG, base64)
2. POST /api/v1/history/predict  →  Node.js backend
3. Node.js mlService.js          →  POST /predict to FastAPI
4. FastAPI preprocesses image:
     BGR→RGB → resize 64×64 → normalize ÷255 → expand dims
5. CNN model.predict() → 35-class softmax probabilities
6. Confidence > 0.6 → return predicted sign
7. Node.js saves to MongoDB History collection
8. Response sent back to React
9. Stability algorithm (6 frames) builds word/sentence
```

---

## 🧠 ML Model

### Architecture

```
Input: (64, 64, 3) RGB Image
│
├── Conv2D(32, 3×3, relu)
├── MaxPooling2D(2×2)
├── Conv2D(64, 3×3, relu)
├── MaxPooling2D(2×2)
├── Conv2D(128, 3×3, relu)
├── MaxPooling2D(2×2)
├── Flatten()
├── Dense(128, relu)
└── Dense(35, softmax)  →  Output: 35 class probabilities
```

### Dataset

| Property | Value |
|----------|-------|
| Dataset | Indian Sign Language (ISL) |
| Classes | 35 (A–Z + 1–9) |
| Images per class | 1,200 |
| Total images | 42,000 |
| Image size | 64 × 64 pixels |
| Train/Val split | 80% / 20% |
| Training epochs | 10 |
| Optimizer | Adam |
| Loss | Categorical Crossentropy |

### Class Labels

```python
CLASS_LABELS = [
    "1","2","3","4","5","6","7","8","9",
    "A","B","C","D","E","F","G","H","I","J",
    "K","L","M","N","O","P","Q","R","S","T",
    "U","V","W","X","Y","Z"
]
```

### Stability Algorithm

Replicates the logic from `live_predict_stable_sentence.py`:

```
Frame captured → Model predicts → Confidence > 0.6?
    YES → Same as last prediction?
              YES → stable_count++
              NO  → stable_count = 1, update last_predicted
          stable_count == 6?
              YES → Accept letter, add to word
    NO  → No prediction for 1.5s?
              YES → Add word to sentence, reset word state
```

---

## 📁 Project Structure

```
signlearn/
│
├── 📁 backend/                    # Node.js + Express API
│   ├── 📁 config/
│   │   └── db.js                  # MongoDB connection
│   ├── 📁 controllers/
│   │   ├── authController.js      # Clerk user sync
│   │   ├── historyController.js   # Predict + CRUD history
│   │   ├── signController.js      # Sign library CRUD
│   │   ├── subjectController.js   # Subject CRUD
│   │   ├── searchController.js    # Full-text search
│   │   └── quizController.js      # Quiz + analytics
│   ├── 📁 middleware/
│   │   ├── authMiddleware.js      # Clerk JWT verification
│   │   └── errorMiddleware.js     # Global error handler
│   ├── 📁 models/
│   │   ├── User.js                # Clerk user → MongoDB
│   │   ├── Subject.js             # Sign categories
│   │   ├── Sign.js                # Individual signs
│   │   ├── History.js             # ML predictions
│   │   └── QuizAttempt.js        # Quiz results
│   ├── 📁 routes/
│   │   ├── authRoutes.js
│   │   ├── historyRoutes.js
│   │   ├── signRoutes.js
│   │   ├── subjectRoutes.js
│   │   ├── searchRoutes.js
│   │   └── quizRoutes.js
│   ├── 📁 services/
│   │   └── mlService.js           # FastAPI bridge with retry
│   ├── 📁 utils/
│   │   ├── asyncHandler.js        # Async error wrapper
│   │   └── seed.js                # Database seeder
│   ├── server.js                  # Express entry point
│   └── package.json
│
├── 📁 frontend/                   # React + Vite
│   ├── 📁 src/
│   │   ├── 📁 api/
│   │   │   └── api.js             # Axios + all API calls
│   │   ├── 📁 components/
│   │   │   ├── 📁 layout/
│   │   │   │   ├── Navbar.jsx     # Responsive navbar
│   │   │   │   └── Layout.jsx     # Page shell
│   │   │   ├── 📁 ui/
│   │   │   │   ├── Loader.jsx
│   │   │   │   ├── ErrorMessage.jsx
│   │   │   │   └── ConfidenceBadge.jsx
│   │   │   ├── 📁 home/
│   │   │   │   └── WebcamCapture.jsx  # Camera + overlays
│   │   │   ├── 📁 history/
│   │   │   │   └── HistoryTable.jsx
│   │   │   ├── 📁 library/
│   │   │   │   └── SignCard.jsx
│   │   │   └── 📁 quiz/
│   │   │       └── Flashcard.jsx  # 3D flip card
│   │   ├── 📁 context/
│   │   │   └── AuthContext.jsx    # Clerk + DB user sync
│   │   ├── 📁 hooks/
│   │   │   └── useApi.js          # Generic fetch hook
│   │   ├── 📁 pages/
│   │   │   ├── Home.jsx           # Webcam detector
│   │   │   ├── History.jsx        # Prediction history
│   │   │   ├── Library.jsx        # Sign browser
│   │   │   ├── Search.jsx         # Full-text search
│   │   │   ├── Quiz.jsx           # Flashcard quiz
│   │   │   └── NotFound.jsx
│   │   ├── 📁 utils/
│   │   │   └── helpers.js         # Formatters + utilities
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css              # Liquid glass design system
│   └── package.json
│
└── 📁 ml_service/                 # Python FastAPI
    ├── 📁 app/
    │   ├── 📁 models/
    │   │   └── schemas.py          # Pydantic schemas
    │   ├── 📁 services/
    │   │   ├── predictor.py        # CNN inference engine
    │   │   └── model_loader.py     # Auto-download model
    │   ├── 📁 routers/
    │   │   └── predict.py          # /predict + /health
    │   └── main.py                 # FastAPI entry point
    ├── requirements.txt
    └── test_api.py                 # API test suite
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | >= 18.0.0 |
| Python | >= 3.10 |
| MongoDB | Atlas or local |
| Git | Any |

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/signlearn.git
cd signlearn
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (see Environment Variables section)
npm run dev
```

### 3. ML Service Setup

```bash
cd ml_service

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\Activate.ps1

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Place your model file in ml_service/
# sign_language_interpreter_model.h5

# Start server
python -m uvicorn app.main:app --reload --port 8000
```

### 4. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

### 5. Seed the Database

```bash
cd backend
npm run seed
```

### 6. Open the app

```
Frontend:   http://localhost:5173
Backend:    http://localhost:5000/health
ML Service: http://localhost:8000/docs
```

---

## 🔑 Environment Variables

### `backend/.env`

```bash
NODE_ENV=development
PORT=5000

# MongoDB Atlas
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/signlanguage

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxx
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxx

# ML Microservice
ML_SERVICE_URL=http://localhost:8000

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

### `frontend/.env`

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxx
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### `ml_service/.env`

```bash
PORT=8000
MODEL_PATH=sign_language_interpreter_model.h5
MODEL_URL=https://drive.google.com/uc?export=download&id=YOUR_FILE_ID
ALLOWED_ORIGINS=http://localhost:5000,http://localhost:5173
```

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/sync` | Public | Sync Clerk user to MongoDB |
| GET | `/api/v1/auth/me` | ✅ | Get current user |
| PUT | `/api/v1/auth/me` | ✅ | Update profile |

### History & Predictions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/history/predict` | ✅ | Run ML prediction |
| GET | `/api/v1/history` | ✅ | Get paginated history |
| GET | `/api/v1/history/:id` | ✅ | Get single entry |
| PATCH | `/api/v1/history/:id/favorite` | ✅ | Toggle favorite |
| DELETE | `/api/v1/history/:id` | ✅ | Delete entry |
| DELETE | `/api/v1/history` | ✅ | Clear all history |

### Signs & Subjects

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/subjects` | Public | Get all subjects |
| GET | `/api/v1/subjects/:id` | Public | Get subject + signs |
| GET | `/api/v1/signs` | Public | Get paginated signs |
| GET | `/api/v1/signs/subject/:id` | Public | Get signs by subject |

### Search

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/search?q=hello` | Public | Full-text search |
| GET | `/api/v1/search/suggestions?q=hel` | Public | Autocomplete |

### Quiz

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/quiz/signs` | ✅ | Get random quiz signs |
| POST | `/api/v1/quiz/attempt` | ✅ | Submit single attempt |
| POST | `/api/v1/quiz/attempts/batch` | ✅ | Submit all attempts |
| GET | `/api/v1/quiz/stats` | ✅ | Get accuracy stats |

### ML Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | Predict from image file |
| POST | `/predict/base64` | Predict from base64 image |
| GET | `/health` | Service health check |
| GET | `/docs` | Swagger UI |

---

## ☁️ Deployment

| Service | Platform | URL |
|---------|---------|-----|
| Frontend | Vercel | `https://signlearn.vercel.app` |
| Backend | Render | `https://signlearn-backend.onrender.com` |
| ML Service | Render | `https://signlearn-ml.onrender.com` |
| Database | MongoDB Atlas | Cloud |
| Images | Cloudinary | Cloud |

### Deploy in 4 commands

```bash
# 1. Push to GitHub
git push origin main

# 2. Render auto-deploys backend + ML service

# 3. Vercel auto-deploys frontend

# 4. Seed production database
cd backend && npm run seed
```

### Keep Services Alive (for demo)

```bash
node backend/utils/keepAlive.js
```

Pings both Render services every 14 minutes to prevent cold starts during your SIH presentation.

---

## 🧪 Testing the ML API

```bash
cd ml_service
python test_api.py Indian/A/1.jpg
```

```bash
# Or with curl
curl -X POST https://signlearn-ml.onrender.com/predict \
  -F "file=@/path/to/sign_image.jpg"
```

Expected response:
```json
{
  "prediction": "A",
  "confidence": 0.9823,
  "is_confident": true,
  "metadata": {
    "top_k": [
      { "label": "A", "confidence": 0.9823 },
      { "label": "B", "confidence": 0.0102 }
    ],
    "inference_time_ms": 45,
    "model_version": "1.0.0"
  }
}
```
**Built for Smart India Hackathon 2024**
*Problem Statement: AI-powered accessibility tools for differently-abled individuals*

## 📄 License
MIT License — feel free to use, modify, and distribute.

**Made with 🤟 for the deaf community of India**
*If this project helped you, please give it a ⭐*
