// frontend/src/components/library/SignCard.jsx

import { useState } from "react";
import { X, Tag } from "lucide-react";

const difficultyConfig = {
  beginner:     { label: "Beginner",     color: "#4A5C3F", bg: "rgba(74,92,63,0.08)"   },
  intermediate: { label: "Intermediate", color: "#A67E1A", bg: "rgba(196,154,42,0.1)"  },
  advanced:     { label: "Advanced",     color: "#B91C1C", bg: "rgba(185,28,28,0.08)"  },
};

// ── Sign Modal ─────────────────────────────────────────────────────────────────
const SignModal = ({ sign, imgError, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center px-4"
    style={{
      background:     "rgba(26,26,26,0.45)",
      backdropFilter: "blur(6px)",
    }}
    onClick={onClose}
  >
    <div
      className="rounded-3xl shadow-2xl max-w-sm w-full
                 overflow-hidden animate-scale-in"
      style={{
        background: "var(--surface)",
        border:     "1.5px solid var(--border)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Image */}
      <div
        className="relative aspect-square flex items-center
                   justify-center overflow-hidden"
        style={{ background: "var(--forest-light)" }}
      >
        {!imgError ? (
          <img
            src={sign.imageUrl}
            alt={sign.name}
            className="w-full h-full object-contain p-8
                       transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div
            className="w-24 h-24 rounded-2xl flex items-center
                       justify-center animate-float"
            style={{ background: "var(--forest)",
                     opacity: 0.3 }}
          />
        )}

        {/* Difficulty badge */}
        <div className="absolute top-3 right-3">
          <span
            className="badge"
            style={{
              background: difficultyConfig[sign.difficultyLevel]?.bg
                || "rgba(26,26,26,0.06)",
              color: difficultyConfig[sign.difficultyLevel]?.color
                || "var(--ink-muted)",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            {difficultyConfig[sign.difficultyLevel]?.label
              || sign.difficultyLevel}
          </span>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 left-3 w-8 h-8 rounded-full
                     flex items-center justify-center
                     transition-colors duration-200"
          style={{
            background:     "rgba(253,250,244,0.9)",
            backdropFilter: "blur(4px)",
            border:         "1px solid var(--border)",
            color:          "var(--ink-muted)",
          }}
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* Info */}
      <div className="p-6 space-y-4">
        <div>
          <h2
            className="font-display text-3xl font-bold tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            {sign.name}
          </h2>
          <p
            className="text-sm mt-1.5 leading-relaxed"
            style={{ color: "var(--ink-muted)" }}
          >
            {sign.meaning}
          </p>
        </div>

        {sign.keywords?.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Tag
                size={11}
                strokeWidth={2.5}
                style={{ color: "var(--ink-faint)" }}
              />
              <p className="section-label">Keywords</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sign.keywords.map((kw) => (
                <span
                  key={kw}
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: "var(--forest-light)",
                    color:      "var(--forest)",
                    border:     "1px solid rgba(74,92,63,0.15)",
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        <button onClick={onClose} className="btn-secondary w-full">
          Close
        </button>
      </div>
    </div>
  </div>
);

// ── Sign Card ──────────────────────────────────────────────────────────────────
const SignCard = ({ sign }) => {
  const [imgError,   setImgError]   = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isHovered,  setIsHovered]  = useState(false);

  const diff = difficultyConfig[sign.difficultyLevel];

  return (
    <>
      <div
        onClick={() => setShowDetail(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="rounded-2xl overflow-hidden cursor-pointer
                   transition-all duration-300 animate-fade-up"
        style={{
          background: "var(--surface)",
          border:     "1.5px solid var(--border)",
          boxShadow:  isHovered
            ? "var(--shadow-hover)"
            : "var(--shadow-card)",
          transform: isHovered
            ? "translateY(-4px) scale(1.01)"
            : "translateY(0) scale(1)",
        }}
      >
        {/* Image */}
        <div
          className="relative aspect-square overflow-hidden"
          style={{ background: "var(--forest-light)" }}
        >
          {!imgError ? (
            <img
              src={sign.imageUrl}
              alt={`Sign: ${sign.name}`}
              className="w-full h-full object-cover transition-transform
                         duration-500"
              style={{
                transform: isHovered ? "scale(1.08)" : "scale(1)",
              }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center
                            justify-center"
            >
              <div
                className="w-16 h-16 rounded-2xl"
                style={{
                  background: "var(--forest)",
                  opacity:    0.2,
                }}
              />
            </div>
          )}

          {/* Difficulty dot */}
          <div className="absolute top-2.5 right-2.5">
            <span
              className="w-2.5 h-2.5 rounded-full block"
              style={{
                background: diff?.color || "var(--ink-faint)",
                boxShadow:  `0 0 6px ${diff?.color || "var(--ink-faint)"}88`,
              }}
            />
          </div>

          {/* Hover overlay */}
          <div
            className="absolute inset-0 flex items-center
                       justify-center transition-opacity duration-300"
            style={{
              background: "rgba(74,92,63,0.85)",
              opacity:    isHovered ? 1 : 0,
            }}
          >
            <span
              className="text-white text-xs font-bold tracking-widest
                         uppercase"
            >
              View Details
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5">
          <p
            className="font-display font-bold text-base tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            {sign.name}
          </p>
          <p
            className="text-xs mt-0.5 line-clamp-1"
            style={{ color: "var(--ink-faint)" }}
          >
            {sign.meaning}
          </p>

          {sign.keywords?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {sign.keywords.slice(0, 2).map((kw) => (
                <span
                  key={kw}
                  className="text-[10px] px-2 py-0.5 rounded-full
                             font-bold"
                  style={{
                    background: "var(--cream-2)",
                    color:      "var(--ink-faint)",
                  }}
                >
                  {kw}
                </span>
              ))}
              {sign.keywords.length > 2 && (
                <span
                  className="text-[10px]"
                  style={{ color: "var(--ink-faint)" }}
                >
                  +{sign.keywords.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {showDetail && (
        <SignModal
          sign={sign}
          imgError={imgError}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
};

export default SignCard;