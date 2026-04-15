// frontend/src/components/ui/ErrorMessage.jsx

import { AlertTriangle } from "lucide-react";

const ErrorMessage = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center
                  gap-5 py-16 animate-scale-in">
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center"
      style={{
        background: "rgba(185,28,28,0.06)",
        border:     "1.5px solid rgba(185,28,28,0.15)",
      }}
    >
      <AlertTriangle size={24} color="#B91C1C" strokeWidth={2} />
    </div>
    <div className="text-center">
      <h3
        className="font-display text-lg font-bold mb-1"
        style={{ color: "var(--ink)" }}
      >
        Something went wrong
      </h3>
      <p className="text-sm max-w-md" style={{ color: "var(--ink-muted)" }}>
        {message || "An unexpected error occurred. Please try again."}
      </p>
    </div>
    {onRetry && (
      <button onClick={onRetry} className="btn-primary">
        Try Again
      </button>
    )}
  </div>
);

export default ErrorMessage;