// frontend/src/components/quiz/Flashcard.jsx

import { useState } from "react";
import { Eye, CheckCircle, XCircle } from "lucide-react";

const difficultyConfig = {
  beginner:     { color: "#4A5C3F", label: "Beginner"     },
  intermediate: { color: "#A67E1A", label: "Intermediate" },
  advanced:     { color: "#B91C1C", label: "Advanced"     },
};

const Flashcard = ({ sign, onAnswer, isAnswered, userWasCorrect }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imgError,  setImgError]  = useState(false);

  const handleFlip = () => {
    if (!isAnswered) setIsFlipped((p) => !p);
  };

  const diff = difficultyConfig[sign.difficultyLevel];

  return (
    <div className="flex flex-col items-center gap-6">

      {/* ── 3D Flip Card ── */}
      <div
        className="relative w-full max-w-sm cursor-pointer select-none"
        style={{ perspective: "1200px" }}
        onClick={handleFlip}
      >
        <div
          className="relative w-full transition-transform duration-[600ms]"
          style={{
            transformStyle: "preserve-3d",
            transform:      isFlipped
              ? "rotateY(180deg)"
              : "rotateY(0deg)",
            height: "360px",
          }}
        >
          {/* ── Front ── */}
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden
                       flex flex-col"
            style={{
              backfaceVisibility: "hidden",
              background:         "var(--surface)",
              border:             "1.5px solid var(--border)",
              boxShadow:          "var(--shadow-hover)",
            }}
          >
            {/* Difficulty color bar */}
            <div
              className="h-1.5 w-full shrink-0"
              style={{ background: diff?.color || "var(--forest)" }}
            />

            {/* Image */}
            <div
              className="flex-1 flex items-center justify-center p-8"
              style={{ background: "var(--forest-light)" }}
            >
              {!imgError ? (
                <img
                  src={sign.imageUrl}
                  alt="Sign to identify"
                  className="w-full h-full object-contain
                             transition-transform duration-500
                             hover:scale-105"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-2xl animate-float"
                  style={{
                    background: "var(--forest)",
                    opacity:    0.2,
                  }}
                />
              )}
            </div>

            {/* Footer */}
            <div
              className="px-5 py-4 flex items-center justify-between
                         shrink-0"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <span className="section-label">What sign is this?</span>
              <div
                className="flex items-center gap-1.5"
                style={{ color: "var(--forest)" }}
              >
                <Eye size={13} strokeWidth={2.5} />
                <span className="text-xs font-bold">Tap to reveal</span>
              </div>
            </div>
          </div>

          {/* ── Back ── */}
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden
                       flex flex-col"
            style={{
              backfaceVisibility: "hidden",
              transform:          "rotateY(180deg)",
              background: isAnswered
                ? userWasCorrect
                  ? "#F0FDF4"
                  : "#FFF1F2"
                : "var(--forest-light)",
              border: `1.5px solid ${
                isAnswered
                  ? userWasCorrect
                    ? "#86EFAC"
                    : "#FCA5A5"
                  : "rgba(74,92,63,0.2)"
              }`,
              boxShadow: "var(--shadow-hover)",
            }}
          >
            <div
              className="h-1.5 w-full shrink-0"
              style={{
                background: isAnswered
                  ? userWasCorrect
                    ? "#4A5C3F"
                    : "#B91C1C"
                  : "var(--gold)",
              }}
            />

            <div
              className="flex-1 flex flex-col items-center
                         justify-center gap-3 px-6"
            >
              <p className="section-label">This sign means</p>
              <p
                className="font-display font-bold leading-none"
                style={{
                  fontSize: "5rem",
                  color: isAnswered
                    ? userWasCorrect
                      ? "#4A5C3F"
                      : "#B91C1C"
                    : "var(--forest)",
                }}
              >
                {sign.name}
              </p>
              <p
                className="text-sm text-center max-w-xs leading-relaxed"
                style={{ color: "var(--ink-muted)" }}
              >
                {sign.meaning}
              </p>

              {sign.keywords?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 justify-center mt-1">
                  {sign.keywords.slice(0, 4).map((kw) => (
                    <span
                      key={kw}
                      className="text-xs px-2.5 py-1 rounded-full font-bold"
                      style={{
                        background: "rgba(255,255,255,0.8)",
                        color:      "var(--ink-muted)",
                        border:     "1px solid var(--border)",
                      }}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div
              className="px-5 py-4 shrink-0"
              style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
            >
              <p className="section-label text-center">
                {isAnswered
                  ? userWasCorrect
                    ? "Well done!"
                    : "Keep practicing"
                  : "Did you get it right?"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Answer Buttons ── */}
      {isFlipped && !isAnswered && (
        <div
          className="flex gap-3 w-full max-w-sm animate-bounce-soft"
        >
          <button
            onClick={() => onAnswer(false)}
            className="flex-1 py-3.5 rounded-2xl font-bold text-sm
                       transition-all duration-200 hover:-translate-y-1
                       flex items-center justify-center gap-2"
            style={{
              background: "rgba(185,28,28,0.06)",
              color:      "#B91C1C",
              border:     "2px solid rgba(185,28,28,0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "rgba(185,28,28,0.12)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(185,28,28,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "rgba(185,28,28,0.06)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <XCircle size={18} strokeWidth={2} />
            Got it Wrong
          </button>
          <button
            onClick={() => onAnswer(true)}
            className="flex-1 py-3.5 rounded-2xl font-bold text-sm
                       transition-all duration-200 hover:-translate-y-1
                       flex items-center justify-center gap-2"
            style={{
              background: "rgba(74,92,63,0.08)",
              color:      "var(--forest)",
              border:     "2px solid rgba(74,92,63,0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "rgba(74,92,63,0.14)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(74,92,63,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "rgba(74,92,63,0.08)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <CheckCircle size={18} strokeWidth={2} />
            Got it Right
          </button>
        </div>
      )}

      {/* Hint */}
      {!isFlipped && !isAnswered && (
        <p
          className="text-sm text-center animate-fade-in"
          style={{ color: "var(--ink-faint)" }}
        >
          Study the sign, then tap to reveal the answer
        </p>
      )}
    </div>
  );
};

export default Flashcard;