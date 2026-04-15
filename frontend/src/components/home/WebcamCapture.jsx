// frontend/src/components/home/WebcamCapture.jsx

import { useRef, useCallback, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { FlipHorizontal, Circle } from "lucide-react";

const videoConstraints = {
  width:      640,
  height:     480,
  facingMode: "user",
};

// ── Animated corner brackets ───────────────────────────────────────────────────
const CornerBrackets = ({ active }) => {
  const color = active ? "#6c63ff" : "rgba(255,255,255,0.4)";
  const size  = 20;
  const thick = 2.5;

  const corners = [
    { top: 12, left: 12,  rotate: 0   },
    { top: 12, right: 12, rotate: 90  },
    { bottom: 12, right: 12, rotate: 180 },
    { bottom: 12, left: 12,  rotate: 270 },
  ];

  return (
    <>
      {corners.map((pos, i) => (
        <div
          key={i}
          className="absolute pointer-events-none transition-all duration-500"
          style={{
            ...pos,
            width:  size,
            height: size,
            transform: `rotate(${pos.rotate}deg)`,
          }}
        >
          {/* Horizontal line */}
          <div
            className="absolute top-0 left-0 transition-all duration-500"
            style={{
              width:            size,
              height:           thick,
              background:       color,
              borderRadius:     thick,
              boxShadow: active ? `0 0 8px ${color}` : "none",
            }}
          />
          {/* Vertical line */}
          <div
            className="absolute top-0 left-0 transition-all duration-500"
            style={{
              width:            thick,
              height:           size,
              background:       color,
              borderRadius:     thick,
              boxShadow: active ? `0 0 8px ${color}` : "none",
            }}
          />
        </div>
      ))}
    </>
  );
};

// ── Confidence ring around the center box ─────────────────────────────────────
const CenterGuide = ({ active, stableCount, maxStable }) => {
  const progress = maxStable > 0 ? stableCount / maxStable : 0;

  return (
    <div
      className="absolute top-1/2 left-1/2 pointer-events-none
                 transition-all duration-300"
      style={{
        transform:  "translate(-50%, -50%)",
        width:      160,
        height:     160,
      }}
    >
      {/* Guide box */}
      <div
        className="absolute inset-0 rounded-2xl transition-all duration-300"
        style={{
          border: `2px dashed ${
            active ? "rgba(108,99,255,0.5)" : "rgba(255,255,255,0.25)"
          }`,
          background: active
            ? "rgba(108,99,255,0.04)"
            : "transparent",
        }}
      />

      {/* Progress arc overlay */}
      {active && progress > 0 && (
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 160 160"
        >
          <rect
            x="2" y="2"
            width="156" height="156"
            rx="14" ry="14"
            fill="none"
            stroke="rgba(108,99,255,0.2)"
            strokeWidth="3"
          />
          <rect
            x="2" y="2"
            width="156" height="156"
            rx="14" ry="14"
            fill="none"
            stroke="#6c63ff"
            strokeWidth="3"
            strokeDasharray={`${600 * progress} 600`}
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 4px rgba(108,99,255,0.6))" }}
          />
        </svg>
      )}
    </div>
  );
};

// ── Scanning line animation ────────────────────────────────────────────────────
const ScanLine = ({ active }) => {
  if (!active) return null;
  return (
    <div
      className="absolute left-0 right-0 pointer-events-none"
      style={{
        height:     "2px",
        background: "linear-gradient(90deg, transparent, #6c63ff, transparent)",
        boxShadow:  "0 0 12px rgba(108,99,255,0.8)",
        animation:  "scanLine 2s ease-in-out infinite",
        top:        "50%",
      }}
    />
  );
};

// ── Pulse dot (recording indicator) ───────────────────────────────────────────
const RecordingIndicator = ({ active }) => (
  <div
    className="absolute top-3 left-3 flex items-center gap-2
               px-3 py-1.5 rounded-full transition-all duration-300"
    style={{
      background: "rgba(15,15,26,0.65)",
      backdropFilter: "blur(8px)",
      border: "1px solid rgba(255,255,255,0.1)",
      opacity: active ? 1 : 0,
      transform: active ? "scale(1)" : "scale(0.8)",
    }}
  >
    <span
      className="w-2 h-2 rounded-full"
      style={{
        background: "#ff4d6d",
        boxShadow: "0 0 8px rgba(255,77,109,0.8)",
        animation: active ? "pulse 1.2s ease-in-out infinite" : "none",
      }}
    />
    <span
      className="text-xs font-bold text-white"
      style={{ fontFamily: "DM Sans, sans-serif" }}
    >
      Detecting
    </span>
  </div>
);

// ── Permission denied state ────────────────────────────────────────────────────
const PermissionDenied = () => (
  <div
    className="flex flex-col items-center justify-center gap-4
               rounded-2xl p-10 text-center"
    style={{
      background: "var(--surface-2)",
      border: "1.5px dashed var(--border)",
      minHeight: "320px",
    }}
  >
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center
                 text-2xl"
      style={{
        background: "rgba(239,68,68,0.08)",
        border: "1.5px solid rgba(239,68,68,0.2)",
      }}
    >
      📷
    </div>
    <div>
      <p
        className="font-bold text-base mb-1"
        style={{ fontFamily: "DM Sans, sans-serif",
                 color: "var(--ink)" }}
      >
        Camera access denied
      </p>
      <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
        Allow camera access in your browser settings
        <br />and refresh the page to continue.
      </p>
    </div>
    <button
      onClick={() => window.location.reload()}
      className="btn-secondary text-sm"
    >
      Refresh Page
    </button>
  </div>
);

// ── Loading skeleton ───────────────────────────────────────────────────────────
const CameraLoading = () => (
  <div
    className="skeleton rounded-2xl flex items-center justify-center
               gap-3"
    style={{ minHeight: "320px" }}
  >
    <div
      className="w-8 h-8 rounded-full border-2 border-t-brand-500
                 animate-spin"
      style={{
        borderColor: "var(--border)",
        borderTopColor: "var(--brand)",
      }}
    />
    <span className="text-sm" style={{ color: "var(--ink-faint)" }}>
      Starting camera...
    </span>
  </div>
);

// ── Main WebcamCapture ─────────────────────────────────────────────────────────
const WebcamCapture = ({
  onCapture,
  isCapturing,
  interval     = 300,
  stableCount  = 0,
  maxStable    = 6,
}) => {
  const webcamRef                         = useRef(null);
  const intervalRef                       = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraReady,   setCameraReady]   = useState(false);
  const [mirrored,      setMirrored]      = useState(true);

  const captureFrame = useCallback(() => {
    if (!webcamRef.current || !cameraReady) return;
    const imageSrc = webcamRef.current.getScreenshot({
      width:  64,
      height: 64,
    });
    if (imageSrc) onCapture(imageSrc);
  }, [cameraReady, onCapture]);

  useEffect(() => {
    if (isCapturing && cameraReady) {
      intervalRef.current = setInterval(captureFrame, interval);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isCapturing, cameraReady, captureFrame, interval]);

  if (hasPermission === false) return <PermissionDenied />;

  return (
    <>
      {/* Scan line keyframe */}
      <style>{`
        @keyframes scanLine {
          0%   { top: 20%; opacity: 0;   }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 80%; opacity: 0;   }
        }
      `}</style>

      <div className="space-y-3">
        {/* ── Camera viewport ── */}
        <div
          className="relative rounded-2xl overflow-hidden transition-all
                     duration-300"
          style={{
            background: "#0a0a0f",
            boxShadow: isCapturing
              ? "0 0 0 2px rgba(108,99,255,0.4), var(--shadow-hover)"
              : "var(--shadow-card)",
            border: isCapturing
              ? "1.5px solid rgba(108,99,255,0.3)"
              : "1.5px solid var(--border)",
          }}
        >
          {/* Camera feed */}
          {hasPermission === null && <CameraLoading />}

          <Webcam
            ref={webcamRef}
            audio={false}
            videoConstraints={videoConstraints}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.85}
            onUserMedia={() => {
              setHasPermission(true);
              setCameraReady(true);
            }}
            onUserMediaError={() => {
              setHasPermission(false);
              setCameraReady(false);
            }}
            mirrored={mirrored}
            className="w-full block"
            style={{
              opacity: cameraReady ? 1 : 0,
              transition: "opacity 0.5s ease",
            }}
          />

          {/* Overlays — only when camera is ready */}
          {cameraReady && (
            <>
              {/* Corner brackets */}
              <CornerBrackets active={isCapturing} />

              {/* Center guide with progress ring */}
              <CenterGuide
                active={isCapturing}
                stableCount={stableCount}
                maxStable={maxStable}
              />

              {/* Scan line */}
              <ScanLine active={isCapturing} />

              {/* Recording indicator */}
              <RecordingIndicator active={isCapturing} />

              {/* Mirror toggle */}
              <button
                onClick={() => setMirrored((p) => !p)}
                className="absolute top-3 right-3 w-8 h-8 rounded-xl
                           flex items-center justify-center text-sm
                           transition-all duration-200 hover:scale-110"
                style={{
                  background: "rgba(15,15,26,0.65)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                }}
                title="Flip camera"
              >
                ↔
              </button>

              {/* Bottom label */}
              {!isCapturing && (
                <div
                  className="absolute bottom-3 left-1/2 -translate-x-1/2
                             px-4 py-2 rounded-full text-xs font-semibold
                             text-white whitespace-nowrap"
                  style={{
                    background: "rgba(15,15,26,0.65)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  Position hand inside the box
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Camera info strip ── */}
        {cameraReady && (
          <div
            className="flex items-center justify-between px-3 py-2
                       rounded-xl text-xs animate-fade-in"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="flex items-center gap-2"
              style={{ color: "var(--ink-faint)" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: isCapturing ? "#00c9a7" : "var(--border-2)",
                  boxShadow: isCapturing
                    ? "0 0 6px rgba(0,201,167,0.6)"
                    : "none",
                }}
              />
              <span className="font-medium">
                {isCapturing ? "Active" : "Ready"}
              </span>
            </div>

            <div
              className="flex items-center gap-3"
              style={{ color: "var(--ink-faint)" }}
            >
              <span>640 × 480</span>
              <span
                className="w-1 h-1 rounded-full"
                style={{ background: "var(--border-2)" }}
              />
              <span>{interval}ms interval</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default WebcamCapture;