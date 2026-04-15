// frontend/src/pages/Home.jsx

import { useState, useCallback, useRef } from "react";
import { useAuth, SignInButton } from "@clerk/clerk-react";
import { Camera, Zap, BookOpen, Brain, Clock,
         Copy, Check, Lightbulb } from "lucide-react";
import WebcamCapture from "../components/home/WebcamCapture";
import ConfidenceBadge from "../components/ui/ConfidenceBadge";
import { historyAPI } from "../api/api";

const STABLE_FRAMES_REQUIRED = 6;
const SPACE_DELAY_MS          = 1500;
const CAPTURE_INTERVAL_MS     = 300;

const features = [
  {
    Icon:  Camera,
    title: "Real-time Detection",
    desc:  "CNN model reads hand signs frame by frame with stability detection.",
    color: "var(--forest)",
    bg:    "var(--forest-light)",
  },
  {
    Icon:  Zap,
    title: "35 Signs",
    desc:  "Numbers 1–9 and all A–Z letters of Indian Sign Language.",
    color: "var(--gold)",
    bg:    "var(--gold-light)",
  },
  {
    Icon:  Brain,
    title: "Quiz Mode",
    desc:  "Flashcard quizzes with accuracy tracking across sessions.",
    color: "var(--forest)",
    bg:    "var(--forest-light)",
  },
  {
    Icon:  BookOpen,
    title: "Sign Library",
    desc:  "Browse all signs by subject with meanings and keywords.",
    color: "var(--gold)",
    bg:    "var(--gold-light)",
  },
];

const Home = () => {
  const { isSignedIn } = useAuth();

  const [isCapturing,   setIsCapturing]   = useState(false);
  const [currentLetter, setCurrentLetter] = useState("");
  const [currentWord,   setCurrentWord]   = useState("");
  const [sentence,      setSentence]      = useState("");
  const [confidence,    setConfidence]    = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);
  const [copied,        setCopied]        = useState(false);
  const [stableCount,   setStableCount]   = useState(0);

  const stableCountRef       = useRef(0);
  const lastPredictedRef     = useRef("");
  const acceptedLetterRef    = useRef("");
  const lastConfidentTimeRef = useRef(Date.now());
  const spaceAddedRef        = useRef(false);
  const currentWordRef       = useRef("");

  const handleCapture = useCallback(async (imageSrc) => {
    if (loading) return;
    try {
      setLoading(true);
      setError(null);
      const response = await historyAPI.predict(imageSrc);
      const { predictedSign, confidenceScore } = response.data;
      setConfidence(confidenceScore);
      const now = Date.now();

      if (response.data.metadata?.is_confident) {
        lastConfidentTimeRef.current = now;
        setCurrentLetter(predictedSign);
        if (predictedSign === lastPredictedRef.current) {
          stableCountRef.current += 1;
        } else {
          stableCountRef.current   = 1;
          lastPredictedRef.current = predictedSign;
        }
        setStableCount(stableCountRef.current);
        if (
          stableCountRef.current === STABLE_FRAMES_REQUIRED &&
          predictedSign !== acceptedLetterRef.current
        ) {
          currentWordRef.current    += predictedSign;
          acceptedLetterRef.current  = predictedSign;
          spaceAddedRef.current      = false;
          setCurrentWord(currentWordRef.current);
        }
      } else {
        setCurrentLetter("");
        setStableCount(0);
        stableCountRef.current = 0;
        if (
          currentWordRef.current &&
          !spaceAddedRef.current &&
          now - lastConfidentTimeRef.current > SPACE_DELAY_MS
        ) {
          setSentence((prev) => prev + currentWordRef.current + " ");
          currentWordRef.current    = "";
          acceptedLetterRef.current = "";
          lastPredictedRef.current  = "";
          spaceAddedRef.current     = true;
          setCurrentWord("");
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const handleStartStop = () => {
    if (isCapturing && currentWordRef.current) {
      setSentence((prev) => prev + currentWordRef.current);
      currentWordRef.current = "";
      setCurrentWord("");
    }
    setIsCapturing((prev) => !prev);
    setCurrentLetter("");
    setStableCount(0);
    setError(null);
  };

  const handleClear = () => {
    setSentence("");
    setCurrentWord("");
    setCurrentLetter("");
    setConfidence(null);
    setStableCount(0);
    currentWordRef.current    = "";
    acceptedLetterRef.current = "";
    lastPredictedRef.current  = "";
    stableCountRef.current    = 0;
    spaceAddedRef.current     = false;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sentence + currentWord);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Landing ───────────────────────────────────────────────────────────────
  if (!isSignedIn) {
    return (
      <div className="space-y-20">
        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12
                        items-center pt-8">
          <div className="space-y-7 animate-fade-up">
            {/* Eyebrow */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2
                         rounded-lg text-sm font-bold"
              style={{
                background: "var(--forest-light)",
                color:      "var(--forest)",
                border:     "1.5px solid rgba(74,92,63,0.2)",
              }}
            >
              <Zap size={14} strokeWidth={2.5} />
              AI-Powered Sign Language Learning
            </div>

            <h1
              className="font-display leading-tight"
              style={{ fontSize: "3.5rem", color: "var(--ink)" }}
            >
              Learn Signs,
              <br />
              <span style={{ color: "var(--forest)" }}>
                Break Barriers
              </span>
            </h1>

            <p
              className="text-lg leading-relaxed max-w-md"
              style={{ color: "var(--ink-muted)" }}
            >
              Show your hand to the camera. Our CNN model recognizes
              Indian Sign Language letters in real-time and builds
              complete sentences — effortlessly.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <SignInButton mode="modal">
                <button className="btn-primary text-base px-7 py-3">
                  Start Learning
                </button>
              </SignInButton>
              <a href="/library">
                <button className="btn-secondary text-base px-6 py-3">
                  Browse Library
                </button>
              </a>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-6 pt-2">
              {[
                { value: "35", label: "Signs" },
                { value: "A–Z", label: "Letters" },
                { value: "1–9", label: "Numbers" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p
                    className="font-display text-2xl font-bold"
                    style={{ color: "var(--forest)" }}
                  >
                    {value}
                  </p>
                  <p
                    className="text-xs font-bold tracking-widest uppercase"
                    style={{ color: "var(--ink-faint)" }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Decorative blob */}
          <div
            className="hidden lg:flex items-center justify-center
                       relative h-80 animate-fade-in delay-300"
          >
            <div
              className="blob w-72 h-72 flex items-center
                         justify-center animate-float"
              style={{ background: "var(--forest-light)" }}
            >
              <div
                className="w-48 h-48 rounded-3xl flex items-center
                           justify-center"
                style={{ background: "var(--forest)" }}
              >
                <Camera
                  size={80}
                  color="white"
                  strokeWidth={1.5}
                />
              </div>
            </div>
            {/* Floating accent */}
            <div
              className="absolute top-8 right-8 w-14 h-14 rounded-2xl
                         flex items-center justify-center animate-float
                         shadow-warm-md"
              style={{
                background:     "var(--gold)",
                animationDelay: "1s",
              }}
            >
              <Zap size={24} color="white" strokeWidth={2} />
            </div>
            <div
              className="absolute bottom-8 left-8 w-12 h-12 rounded-xl
                         flex items-center justify-center animate-float
                         shadow-warm-md"
              style={{
                background:     "var(--forest-light)",
                border:         "1.5px solid rgba(74,92,63,0.2)",
                animationDelay: "0.5s",
              }}
            >
              <Brain
                size={20}
                color="var(--forest)"
                strokeWidth={2}
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="divider" />

        {/* Features */}
        <div>
          <p className="section-label text-center mb-8">
            Everything you need
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2
                          lg:grid-cols-4 gap-5">
            {features.map(({ Icon, title, desc, color, bg }, i) => (
              <div
                key={title}
                className="card card-hover animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center
                             justify-center mb-4"
                  style={{ background: bg, border: `1px solid ${color}25` }}
                >
                  <Icon size={20} color={color} strokeWidth={2} />
                </div>
                <h3
                  className="font-display text-base font-bold mb-1.5"
                  style={{ color: "var(--ink)" }}
                >
                  {title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--ink-muted)" }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Main detector ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <h1
          className="font-display"
          style={{ color: "var(--ink)", fontSize: "2rem" }}
        >
          Sign <span style={{ color: "var(--forest)" }}>Detector</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
          Hold a sign steady for 6 frames to register a letter
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Webcam ── */}
        <div className="lg:col-span-3 space-y-4 animate-fade-up delay-75">
          <WebcamCapture
            onCapture={handleCapture}
            isCapturing={isCapturing}
            interval={CAPTURE_INTERVAL_MS}
            stableCount={stableCount}
            maxStable={STABLE_FRAMES_REQUIRED}
          />

          <div className="flex gap-3">
            <button
              onClick={handleStartStop}
              className="flex-1 py-3 rounded-xl font-bold text-sm
                         transition-all duration-300 flex items-center
                         justify-center gap-2"
              style={isCapturing ? {
                background: "#B91C1C",
                color:      "white",
                border:     "2px solid #B91C1C",
                boxShadow:  "0 4px 16px rgba(185,28,28,0.25)",
              } : {
                background: "var(--forest)",
                color:      "white",
                border:     "2px solid var(--forest)",
                boxShadow:  "0 4px 16px rgba(74,92,63,0.2)",
              }}
            >
              {isCapturing ? (
                <>
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ background: "white" }}
                  />
                  Stop Detection
                </>
              ) : (
                <>
                  <Camera size={16} strokeWidth={2.5} />
                  Start Detection
                </>
              )}
            </button>
            <button
              onClick={handleClear}
              className="btn-secondary px-5"
              disabled={!sentence && !currentWord}
            >
              Clear
            </button>
          </div>

          {error && (
            <div
              className="rounded-xl p-3.5 text-sm animate-scale-in
                         flex items-center gap-2"
              style={{
                background: "rgba(185,28,28,0.06)",
                border:     "1.5px solid rgba(185,28,28,0.15)",
                color:      "#B91C1C",
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* ── Results Panel ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Current letter */}
          <div
            className="card text-center py-8 relative overflow-hidden
                       animate-fade-up delay-150"
          >
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 100%, " +
                  "rgba(74,92,63,0.08) 0%, transparent 70%)",
              }}
            />
            <p className="section-label mb-3">Detecting</p>
            <div
              className="font-display font-bold leading-none
                         min-h-[100px] flex items-center justify-center
                         transition-all duration-200"
              style={{
                fontSize: "7rem",
                color: currentLetter
                  ? "var(--forest)"
                  : "var(--border)",
              }}
            >
              {currentLetter || "—"}
            </div>
            <div className="mt-3 min-h-[22px] flex justify-center">
              <ConfidenceBadge score={confidence} />
            </div>
          </div>

          {/* Current word */}
          <div className="card animate-fade-up delay-225">
            <p className="section-label mb-2">Current Word</p>
            <p
              className="font-display text-3xl font-bold tracking-[0.15em]
                         min-h-[44px] transition-all duration-200"
              style={{
                color: currentWord ? "var(--ink)" : "var(--border)",
              }}
            >
              {currentWord || "···"}
            </p>
          </div>

          {/* Sentence */}
          <div className="card animate-fade-up delay-300">
            <div className="flex items-center justify-between mb-2">
              <p className="section-label">Sentence</p>
              {(sentence || currentWord) && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs
                             font-bold transition-colors duration-200"
                  style={{
                    color: copied ? "var(--forest)" : "var(--ink-faint)",
                  }}
                >
                  {copied
                    ? <><Check size={12} /> Copied</>
                    : <><Copy size={12} /> Copy</>
                  }
                </button>
              )}
            </div>
            <p
              className="text-base leading-relaxed min-h-[26px]
                         transition-all duration-200"
              style={{
                color: (sentence || currentWord)
                  ? "var(--ink)"
                  : "var(--border)",
              }}
            >
              {sentence + currentWord || "Your sentence appears here..."}
            </p>
          </div>

          {/* Tips */}
          <div className="card-forest rounded-xl p-4 animate-fade-up
                          delay-400">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb
                size={14}
                color="var(--forest)"
                strokeWidth={2.5}
              />
              <p
                className="text-xs font-bold"
                style={{ color: "var(--forest)" }}
              >
                How it works
              </p>
            </div>
            <ul
              className="text-xs space-y-1.5"
              style={{ color: "var(--ink-muted)" }}
            >
              <li>• Hold sign steady — registers after 6 stable frames</li>
              <li>• Pause your hand 1.5s to add a space</li>
              <li>• Good lighting improves accuracy</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;