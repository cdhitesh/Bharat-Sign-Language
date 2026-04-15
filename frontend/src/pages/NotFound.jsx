// frontend/src/pages/NotFound.jsx

import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center
                    min-h-[70vh] text-center gap-7 animate-scale-in">
      <div
        className="w-20 h-20 rounded-3xl flex items-center
                   justify-center animate-float"
        style={{
          background: "var(--forest-light)",
          border:     "1.5px solid rgba(74,92,63,0.2)",
        }}
      >
        <Home size={36} color="var(--forest)" strokeWidth={1.5} />
      </div>
      <div>
        <p
          className="font-display font-bold mb-2 select-none"
          style={{ fontSize: "6rem", color: "var(--border)",
                   lineHeight: 1 }}
        >
          404
        </p>
        <h2
          className="font-display text-2xl font-bold mb-2"
          style={{ color: "var(--ink)" }}
        >
          Page Not Found
        </h2>
        <p className="text-sm max-w-sm" style={{ color: "var(--ink-muted)" }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary flex items-center gap-2"
        >
          <ArrowLeft size={15} strokeWidth={2.5} /> Go Back
        </button>
        <button
          onClick={() => navigate("/")}
          className="btn-primary flex items-center gap-2"
        >
          <Home size={15} strokeWidth={2.5} /> Go Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;