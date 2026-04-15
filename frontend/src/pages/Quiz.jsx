// frontend/src/pages/Quiz.jsx

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Brain, Trophy, ChevronRight, X, RotateCcw,
  CheckCircle, XCircle,
} from "lucide-react";
import Flashcard from "../components/quiz/Flashcard";
import Loader from "../components/ui/Loader";
import ErrorMessage from "../components/ui/ErrorMessage";
import useApi from "../hooks/useApi";
import { quizAPI, subjectAPI } from "../api/api";


const QUIZ_SIZES = [5, 10, 15, 20];

// ── Stats Preview ──────────────────────────────────────────────────────────────
const StatsPreview = () => {
  const { data, loading } = useApi(quizAPI.getStats, null, []);
  if (loading || !data || data.total === 0) return null;

  return (
    <div
      className="rounded-2xl p-5 animate-fade-up delay-300"
      style={{
        background: "var(--forest-light)",
        border:     "1.5px solid rgba(74,92,63,0.15)",
      }}
    >
      <p
        className="section-label mb-4"
        style={{ color: "var(--forest)" }}
      >
        Your Stats
      </p>
      <div className="grid grid-cols-3 gap-4 text-center mb-4">
        {[
          { label: "Attempts", value: data.total,               color: "var(--forest)" },
          { label: "Correct",  value: data.correct,             color: "#4A5C3F"       },
          { label: "Accuracy", value: `${data.accuracyPercent}%`, color: "var(--ink)"  },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <p
              className="font-display text-2xl font-bold"
              style={{ color }}
            >
              {value}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--ink-faint)" }}
            >
              {label}
            </p>
          </div>
        ))}
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: "rgba(74,92,63,0.15)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width:      `${data.accuracyPercent}%`,
            background: "var(--forest)",
          }}
        />
      </div>
    </div>
  );
};

// ── Quiz Setup ─────────────────────────────────────────────────────────────────
const QuizSetup = ({ subjects, onStart }) => {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [difficulty,      setDifficulty]      = useState("");
  const [quizSize,        setQuizSize]        = useState(10);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState(null);

  const handleStart = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { limit: quizSize };
      if (selectedSubject) params.subjectId  = selectedSubject;
      if (difficulty)      params.difficulty = difficulty;
      const res = await quizAPI.getSigns(params);
      onStart({ signs: res.data, sessionId: res.sessionId });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Hero */}
      <div className="text-center space-y-3 animate-fade-up">
        <div
          className="w-16 h-16 rounded-2xl flex items-center
                     justify-center mx-auto animate-float"
          style={{
            background: "var(--forest-light)",
            border:     "1.5px solid rgba(74,92,63,0.2)",
          }}
        >
          <Brain
            size={28}
            color="var(--forest)"
            strokeWidth={1.5}
          />
        </div>
        <h1
          className="font-display"
          style={{ color: "var(--ink)", fontSize: "2rem" }}
        >
          Quiz <span style={{ color: "var(--forest)" }}>Mode</span>
        </h1>
        <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
          Test your sign language knowledge with flashcards
        </p>
      </div>

      {/* Config */}
      <div className="card space-y-6 animate-fade-up delay-75">

        {/* Subject */}
        <div>
          <p className="section-label mb-2">Subject</p>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="input"
          >
            <option value="">All Subjects</option>
            {subjects?.map((s) => (
              <option key={s._id} value={s._id}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty */}
        <div>
          <p className="section-label mb-3">Difficulty</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "All",    value: ""             },
              { label: "Easy",   value: "beginner"     },
              { label: "Medium", value: "intermediate" },
              { label: "Hard",   value: "advanced"     },
            ].map((d) => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className="py-2.5 rounded-xl text-xs font-bold
                           border transition-all duration-200
                           hover:-translate-y-0.5"
                style={
                  difficulty === d.value
                    ? {
                        background: "var(--forest)",
                        color:      "white",
                        border:     "2px solid var(--forest)",
                        boxShadow:  "0 4px 12px rgba(74,92,63,0.25)",
                      }
                    : {
                        background: "var(--cream-2)",
                        color:      "var(--ink-muted)",
                        border:     "1.5px solid var(--border)",
                      }
                }
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Card count */}
        <div>
          <p className="section-label mb-3">Number of Cards</p>
          <div className="grid grid-cols-4 gap-2">
            {QUIZ_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setQuizSize(size)}
                className="py-2.5 rounded-xl text-sm font-bold
                           border transition-all duration-200
                           hover:-translate-y-0.5"
                style={
                  quizSize === size
                    ? {
                        background: "var(--forest)",
                        color:      "white",
                        border:     "2px solid var(--forest)",
                        boxShadow:  "0 4px 12px rgba(74,92,63,0.25)",
                      }
                    : {
                        background: "var(--cream-2)",
                        color:      "var(--ink-muted)",
                        border:     "1.5px solid var(--border)",
                      }
                }
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div
            className="rounded-xl p-3 text-sm animate-scale-in"
            style={{
              background: "rgba(185,28,28,0.06)",
              border:     "1px solid rgba(185,28,28,0.15)",
              color:      "#B91C1C",
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={loading}
          className="btn-primary w-full py-3.5 text-base
                     flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span
                className="w-4 h-4 rounded-full border-2
                           border-white/30 border-t-white animate-spin"
              />
              Loading signs...
            </>
          ) : (
            <>
              <Brain size={16} strokeWidth={2.5} />
              Start Quiz
            </>
          )}
        </button>
      </div>

      <StatsPreview />
    </div>
  );
};

// ── Quiz Results ───────────────────────────────────────────────────────────────
const QuizResults = ({ results, total, onRestart }) => {
  const correct  = results.filter((r) => r.isCorrect).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const [saved,  setSaved]  = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const save = async () => {
      if (results.length === 0) return;
      try {
        setSaving(true);
        await quizAPI.submitBatch({
          attempts:  results,
          sessionId: results[0]?.sessionId,
        });
        setSaved(true);
      } catch (err) {
        console.error("Failed to save results:", err.message);
      } finally {
        setSaving(false);
      }
    };
    save();
  }, []);

  const trophyColor =
    accuracy >= 80 ? "var(--forest)"
    : accuracy >= 60 ? "var(--gold)"
    : "#B91C1C";

  return (
    <div className="max-w-lg mx-auto space-y-5 animate-fade-up">

      {/* Score card */}
      <div className="card text-center py-8 space-y-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center
                     justify-center mx-auto animate-bounce-soft"
          style={{
            background: `${trophyColor}15`,
            border:     `1.5px solid ${trophyColor}30`,
          }}
        >
          <Trophy size={28} color={trophyColor} strokeWidth={1.5} />
        </div>

        <div>
          <p
            className="font-display font-bold"
            style={{ fontSize: "4rem", color: trophyColor }}
          >
            {accuracy}%
          </p>
          <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
            {correct} of {total} correct
          </p>
        </div>

        <div
          className="h-3 rounded-full overflow-hidden mx-4"
          style={{ background: "var(--cream-2)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width:      `${accuracy}%`,
              background: trophyColor,
            }}
          />
        </div>

        <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
          {accuracy >= 80
            ? "Excellent! You are mastering sign language!"
            : accuracy >= 60
            ? "Good job! Keep practicing to improve."
            : accuracy >= 40
            ? "You are getting there! Review the Library."
            : "Keep going! Check the Library to study signs."}
        </p>

        <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
          {saving && "Saving results..."}
          {saved && (
            <span style={{ color: "var(--forest)" }}>
              Results saved
            </span>
          )}
        </p>
      </div>

      {/* Breakdown */}
      <div className="card">
        <p className="section-label mb-4">Card Breakdown</p>
        <div className="space-y-2 max-h-56 overflow-y-auto
                        scrollbar-hide pr-1">
          {results.map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-3.5
                         py-2.5 rounded-xl text-sm font-bold
                         animate-fade-up"
              style={{
                animationDelay: `${i * 30}ms`,
                background: r.isCorrect
                  ? "rgba(74,92,63,0.08)"
                  : "rgba(185,28,28,0.06)",
                color: r.isCorrect ? "var(--forest)" : "#B91C1C",
                border: `1px solid ${
                  r.isCorrect
                    ? "rgba(74,92,63,0.2)"
                    : "rgba(185,28,28,0.15)"
                }`,
              }}
            >
              <span>
                {i + 1}. {r.signName}
              </span>
              {r.isCorrect ? (
                <CheckCircle size={16} strokeWidth={2.5} />
              ) : (
                <XCircle size={16} strokeWidth={2.5} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onRestart}
          className="btn-secondary flex-1 flex items-center
                     justify-center gap-2"
        >
          <RotateCcw size={14} strokeWidth={2.5} />
          Change Settings
        </button>
        <button
          onClick={onRestart}
          className="btn-primary flex-1 flex items-center
                     justify-center gap-2"
        >
          <RotateCcw size={14} strokeWidth={2.5} />
          Quiz Again
        </button>
      </div>
    </div>
  );
};

// ── Main Quiz Page ─────────────────────────────────────────────────────────────
const Quiz = () => {
  const [phase,          setPhase]          = useState("setup");
  const [signs,          setSigns]          = useState([]);
  const [sessionId,      setSessionId]      = useState(null);
  const [currentIndex,   setCurrentIndex]   = useState(0);
  const [results,        setResults]        = useState([]);
  const [isAnswered,     setIsAnswered]     = useState(false);
  const [userWasCorrect, setUserWasCorrect] = useState(null);
  const startTimeRef = useRef(null);

  const {
    data: subjects,
    loading,
    error,
  } = useApi(subjectAPI.getAll, null, []);

  const handleStart = ({ signs, sessionId }) => {
    setSigns(signs);
    setSessionId(sessionId);
    setCurrentIndex(0);
    setResults([]);
    setIsAnswered(false);
    setUserWasCorrect(null);
    startTimeRef.current = Date.now();
    setPhase("playing");
  };

  const handleAnswer = (isCorrect) => {
    const timeTakenMs = Date.now() - startTimeRef.current;
    const sign = signs[currentIndex];
    setUserWasCorrect(isCorrect);
    setIsAnswered(true);
    setResults((prev) => [
      ...prev,
      {
        signId:      sign._id,
        subjectId:   sign.subjectId,
        signName:    sign.name,
        isCorrect,
        timeTakenMs,
        sessionId,
      },
    ]);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= signs.length) {
      setPhase("results");
    } else {
      setCurrentIndex((p) => p + 1);
      setIsAnswered(false);
      setUserWasCorrect(null);
      startTimeRef.current = Date.now();
    }
  };

  const handleRestart = () => {
    setPhase("setup");
    setSigns([]);
    setSessionId(null);
    setCurrentIndex(0);
    setResults([]);
    setIsAnswered(false);
    setUserWasCorrect(null);
  };

  if (phase === "setup") {
    if (loading) return <Loader text="Loading quiz options..." />;
    if (error)   return <ErrorMessage message={error} />;
    return <QuizSetup subjects={subjects} onStart={handleStart} />;
  }

  if (phase === "results") {
    return (
      <QuizResults
        results={results}
        total={signs.length}
        onRestart={handleRestart}
      />
    );
  }

  const currentSign = signs[currentIndex];
  const progress    =
    ((currentIndex + (isAnswered ? 1 : 0)) / signs.length) * 100;

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-up">

      {/* ── Progress Header ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleRestart}
          className="flex items-center gap-1.5 text-sm font-bold
                     transition-colors duration-200"
          style={{ color: "var(--ink-muted)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--ink)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--ink-muted)")
          }
        >
          <X size={14} strokeWidth={2.5} />
          Exit
        </button>

        <div
          className="px-4 py-1.5 rounded-lg text-sm font-bold"
          style={{
            background: "var(--cream-2)",
            color:      "var(--ink-muted)",
            border:     "1px solid var(--border)",
          }}
        >
          {currentIndex + 1} / {signs.length}
        </div>

        <div className="flex items-center gap-2 text-sm font-bold">
          <span style={{ color: "var(--forest)" }}>
            {results.filter((r) => r.isCorrect).length} correct
          </span>
          <span style={{ color: "var(--border-2)" }}>·</span>
          <span style={{ color: "#B91C1C" }}>
            {results.filter((r) => !r.isCorrect).length} wrong
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: "var(--cream-2)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width:      `${progress}%`,
            background: "var(--forest)",
          }}
        />
      </div>

      {/* Flashcard */}
      <Flashcard
        key={currentSign._id}
        sign={currentSign}
        onAnswer={handleAnswer}
        isAnswered={isAnswered}
        userWasCorrect={userWasCorrect}
      />

      {/* Next Button */}
      {isAnswered && (
        <button
          onClick={handleNext}
          className="btn-primary w-full py-3.5 text-base
                     animate-bounce-soft flex items-center
                     justify-center gap-2"
        >
          {currentIndex + 1 >= signs.length ? (
            <>
              <Trophy size={16} strokeWidth={2} />
              See Results
            </>
          ) : (
            <>
              Next Card
              <ChevronRight size={16} strokeWidth={2.5} />
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default Quiz;