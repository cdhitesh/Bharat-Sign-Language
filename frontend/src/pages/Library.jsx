// frontend/src/pages/Library.jsx

import { useState } from "react";
import { ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import SignCard from "../components/library/SignCard";
import Loader from "../components/ui/Loader";
import ErrorMessage from "../components/ui/ErrorMessage";
import useApi from "../hooks/useApi";
import { subjectAPI, signAPI } from "../api/api";

const DIFFICULTY_OPTIONS = [
  { label: "All Levels",   value: ""             },
  { label: "Beginner",     value: "beginner"     },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced",     value: "advanced"     },
];

const Library = () => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [difficulty,      setDifficulty]      = useState("");
  const [search,          setSearch]          = useState("");

  const {
    data: subjects,
    loading: subjectsLoading,
    error: subjectsError,
    refetch: refetchSubjects,
  } = useApi(subjectAPI.getAll, null, []);

  const {
    data: signsData,
    loading: signsLoading,
    error: signsError,
    refetch: refetchSigns,
  } = useApi(
    selectedSubject
      ? () => signAPI.getBySubject(selectedSubject._id)
      : () => Promise.resolve({ data: [] }),
    null,
    [selectedSubject?._id]
  );

  const signs = signsData || [];

  const filteredSigns = signs.filter((sign) => {
    const matchesDifficulty =
      !difficulty || sign.difficultyLevel === difficulty;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      sign.name.toLowerCase().includes(q) ||
      sign.meaning.toLowerCase().includes(q) ||
      sign.keywords?.some((k) => k.toLowerCase().includes(q));
    return matchesDifficulty && matchesSearch;
  });

  return (
    <div className="space-y-7">

      {/* ── Header ── */}
      <div className="animate-fade-up">
        <h1
          className="font-display"
          style={{ color: "var(--ink)", fontSize: "2rem" }}
        >
          Sign <span style={{ color: "var(--forest)" }}>Library</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
          Browse all signs organized by subject
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ── Subject Sidebar ── */}
        <div className="lg:col-span-1 animate-slide-right">
          <div
            className="rounded-2xl overflow-hidden sticky top-24"
            style={{
              border:    "1.5px solid var(--border)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3.5"
              style={{
                background:   "var(--cream-2)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <p className="section-label">Subjects</p>
            </div>

            {subjectsLoading ? (
              <div className="p-3 space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="skeleton h-12 rounded-xl"
                    style={{ animationDelay: `${i * 80}ms` }}
                  />
                ))}
              </div>
            ) : subjectsError ? (
              <div className="p-4">
                <ErrorMessage
                  message={subjectsError}
                  onRetry={refetchSubjects}
                />
              </div>
            ) : (
              <div>
                {subjects?.map((subject, i) => (
                  <button
                    key={subject._id}
                    onClick={() => {
                      setSelectedSubject(subject);
                      setSearch("");
                      setDifficulty("");
                    }}
                    className="w-full flex items-center gap-3 px-4
                               py-3.5 text-left transition-all
                               duration-200 group"
                    style={{
                      borderBottom:  "1px solid var(--border)",
                      background:
                        selectedSubject?._id === subject._id
                          ? "var(--forest-light)"
                          : "transparent",
                      animationDelay: `${i * 50}ms`,
                    }}
                    onMouseEnter={(e) => {
                      if (selectedSubject?._id !== subject._id) {
                        e.currentTarget.style.background =
                          "var(--cream-2)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedSubject?._id !== subject._id) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    {/* Subject icon box */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center
                                 justify-center text-sm shrink-0
                                 transition-transform duration-200
                                 group-hover:scale-110"
                      style={{
                        background:
                          selectedSubject?._id === subject._id
                            ? "var(--forest)"
                            : "var(--cream-2)",
                        color:
                          selectedSubject?._id === subject._id
                            ? "white"
                            : "var(--ink-muted)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {subject.icon || "📖"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className="font-bold text-sm truncate"
                        style={{
                          color:
                            selectedSubject?._id === subject._id
                              ? "var(--forest)"
                              : "var(--ink)",
                        }}
                      >
                        {subject.name}
                      </p>
                      {subject.description && (
                        <p
                          className="text-xs truncate"
                          style={{ color: "var(--ink-faint)" }}
                        >
                          {subject.description}
                        </p>
                      )}
                    </div>

                    {selectedSubject?._id === subject._id && (
                      <ChevronRight
                        size={14}
                        strokeWidth={2.5}
                        className="ml-auto shrink-0"
                        style={{ color: "var(--forest)" }}
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Signs Panel ── */}
        <div className="lg:col-span-3 space-y-5">
          {selectedSubject ? (
            <>
              {/* Toolbar */}
              <div
                className="flex flex-col sm:flex-row gap-3
                           sm:items-center justify-between
                           animate-fade-up"
              >
                <div>
                  <h2
                    className="font-display text-xl font-bold"
                    style={{ color: "var(--ink)" }}
                  >
                    {selectedSubject.name}
                  </h2>
                  {!signsLoading && (
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--ink-faint)" }}
                    >
                      {filteredSigns.length} sign
                      {filteredSigns.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {/* Search */}
                  <div className="relative">
                    <div
                      className="absolute inset-y-0 left-3
                                 flex items-center pointer-events-none"
                    >
                      <Search
                        size={13}
                        strokeWidth={2.5}
                        style={{ color: "var(--ink-faint)" }}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="input text-sm py-2 pl-8 w-36"
                    />
                  </div>

                  {/* Difficulty */}
                  <div className="relative">
                    <div
                      className="absolute inset-y-0 left-3
                                 flex items-center pointer-events-none"
                    >
                      <SlidersHorizontal
                        size={13}
                        strokeWidth={2.5}
                        style={{ color: "var(--ink-faint)" }}
                      />
                    </div>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="input text-sm py-2 pl-8 w-40"
                    >
                      {DIFFICULTY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Signs grid */}
              {signsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3
                                xl:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="skeleton rounded-2xl"
                      style={{
                        height:         "220px",
                        animationDelay: `${i * 60}ms`,
                      }}
                    />
                  ))}
                </div>
              ) : signsError ? (
                <ErrorMessage
                  message={signsError}
                  onRetry={refetchSigns}
                />
              ) : filteredSigns.length === 0 ? (
                <div
                  className="text-center py-16 rounded-2xl
                             animate-fade-in"
                  style={{
                    background: "var(--cream-2)",
                    border:     "2px dashed var(--border)",
                  }}
                >
                  <Search
                    size={28}
                    color="var(--ink-faint)"
                    strokeWidth={1.5}
                    className="mx-auto mb-3"
                  />
                  <p
                    className="font-bold"
                    style={{ color: "var(--ink)" }}
                  >
                    No signs match your filters
                  </p>
                  <button
                    onClick={() => {
                      setSearch("");
                      setDifficulty("");
                    }}
                    className="text-sm mt-2 font-bold"
                    style={{ color: "var(--forest)" }}
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3
                                xl:grid-cols-4 gap-4">
                  {filteredSigns.map((sign, i) => (
                    <div
                      key={sign._id}
                      className="animate-fade-up"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <SignCard sign={sign} />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div
              className="flex flex-col items-center justify-center
                         h-72 text-center rounded-2xl animate-fade-in"
              style={{
                background: "var(--cream-2)",
                border:     "2px dashed var(--border)",
              }}
            >
              <ChevronRight
                size={32}
                color="var(--ink-faint)"
                strokeWidth={1.5}
                className="mb-3 animate-float"
                style={{ transform: "rotate(180deg)" }}
              />
              <p
                className="font-display font-bold"
                style={{ color: "var(--ink)" }}
              >
                Select a subject
              </p>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--ink-muted)" }}
              >
                Choose from the list on the left
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Library;