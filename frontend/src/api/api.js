// frontend/src/api/api.js

import axios from "axios";

// ── Axios Instance ─────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://sign-h37w.onrender.com/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor — attach Clerk token ───────────────────────────────────
// Token is injected by AuthContext before each request
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// ── Response Interceptor — normalize errors ────────────────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong.";
    return Promise.reject(new Error(message));
  }
);

// ── Token Setter — called from AuthContext ─────────────────────────────────────
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════════════

export const authAPI = {
  sync: (data) => api.post("/auth/sync", data),
  getMe: () => api.get("/auth/me"),
  updateMe: (data) => api.put("/auth/me", data),
};

// ══════════════════════════════════════════════════════════════════════════════
// HISTORY
// ══════════════════════════════════════════════════════════════════════════════

export const historyAPI = {
  predict: (imageBase64) =>
    api.post("/history/predict", {
      inputType: "image",
      inputContent: imageBase64,
    }),

  getAll: (params) => api.get("/history", { params }),

  getById: (id) => api.get(`/history/${id}`),

  toggleFavorite: (id) => api.patch(`/history/${id}/favorite`),

  delete: (id) => api.delete(`/history/${id}`),

  clearAll: () => api.delete("/history"),
};

// ══════════════════════════════════════════════════════════════════════════════
// SUBJECTS
// ══════════════════════════════════════════════════════════════════════════════

export const subjectAPI = {
  getAll: () => api.get("/subjects"),
  getById: (id) => api.get(`/subjects/${id}`),
  getBySlug: (slug) => api.get(`/subjects/slug/${slug}`),
};

// ══════════════════════════════════════════════════════════════════════════════
// SIGNS
// ══════════════════════════════════════════════════════════════════════════════

export const signAPI = {
  getAll: (params) => api.get("/signs", { params }),
  getById: (id) => api.get(`/signs/${id}`),
  getBySubject: (subjectId) => api.get(`/signs/subject/${subjectId}`),
};

// ══════════════════════════════════════════════════════════════════════════════
// SEARCH
// ══════════════════════════════════════════════════════════════════════════════

export const searchAPI = {
  search: (params) => api.get("/search", { params }),
  suggestions: (q) => api.get("/search/suggestions", { params: { q } }),
};

// ══════════════════════════════════════════════════════════════════════════════
// QUIZ
// ══════════════════════════════════════════════════════════════════════════════

export const quizAPI = {
  getSigns: (params) => api.get("/quiz/signs", { params }),
  submitBatch: (data) => api.post("/quiz/attempts/batch", data),
  getStats: (subjectId) =>
    api.get("/quiz/stats", { params: subjectId ? { subjectId } : {} }),
  getHistory: (params) => api.get("/quiz/history", { params }),
};

export default api;