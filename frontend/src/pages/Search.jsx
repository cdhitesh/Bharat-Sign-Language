// frontend/src/pages/Search.jsx

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, SearchX, Sparkles, SlidersHorizontal } from "lucide-react";
import SignCard from "../components/library/SignCard";
import Loader from "../components/ui/Loader";
import { searchAPI } from "../api/api";

const DEBOUNCE_MS    = 350;
const QUICK_SEARCHES = [
  "Hello", "Water", "A", "Thank You",
  "Help", "Good", "Yes", "No", "Love", "Home",
];

const Search_ = () => {
  const [query,           setQuery]           = useState("");
  const [results,         setResults]         = useState([]);
  const [suggestions,     setSuggestions]     = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState(null);
  const [hasSearched,     setHasSearched]     = useState(false);
  const [difficulty,      setDifficulty]      = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focused,         setFocused]         = useState(false);

  const debounceRef = useRef(null);
  const inputRef    = useRef(null);

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchAPI.suggestions(query);
        setSuggestions(res.data || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const performSearch = useCallback(
    async (q = query) => {
      if (!q.trim()) return;
      try {
        setLoading(true);
        setError(null);
        setShowSuggestions(false);
        setHasSearched(true);
        const res = await searchAPI.search({
          q: q.trim(),
          ...(difficulty && { difficulty }),
        });
        setResults(res.data || []);
      } catch (err) {
        setError(err.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [query, difficulty]
  );

  const handleSuggestionClick = (s) => {
    setQuery(s.name);
    setShowSuggestions(false);
    performSearch(s.name);
  };

  return (
    <div className="space-y-7">

      {/* ── Header ── */}
      <div className="animate-fade-up">
        <h1
          className="font-display"
          style={{ color: "var(--ink)", fontSize: "2rem" }}
        >
          Search <span style={{ color: "var(--forest)" }}>Signs</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
          Search by name, meaning, or keywords
        </p>
      </div>

      {/* ── Search Box ── */}
      <div
        className="rounded-2xl p-5 animate-fade-up delay-75
                   transition-all duration-300"
        style={{
          background: "var(--surface)",
          border:     `1.5px solid ${
            focused ? "var(--forest)" : "var(--border)"
          }`,
          boxShadow: focused
            ? "0 0 0 3px rgba(74,92,63,0.1), var(--shadow-card)"
            : "var(--shadow-card)",
        }}
      >
        <div className="flex gap-3">
          {/* Input with suggestions */}
          <div className="relative flex-1">
            <div
              className="absolute inset-y-0 left-3.5 flex items-center
                         pointer-events-none"
            >
              <Search
                size={16}
                strokeWidth={2.5}
                style={{
                  color: focused ? "var(--forest)" : "var(--ink-faint)",
                  transition: "color 0.2s",
                }}
              />
            </div>

            <input
              ref={inputRef}
              type="text"
              placeholder='Search e.g. "Hello", "Water", "A"'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") performSearch();
                if (e.key === "Escape") setShowSuggestions(false);
              }}
              onFocus={() => {
                setFocused(true);
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onBlur={() => {
                setFocused(false);
                setTimeout(() => setShowSuggestions(false), 150);
              }}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm
                         font-medium outline-none transition-all
                         duration-200"
              style={{
                background: "var(--cream-2)",
                border:     "1.5px solid var(--border)",
                color:      "var(--ink)",
              }}
              autoComplete="off"
            />

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-2
                           rounded-xl overflow-hidden z-20
                           animate-fade-up"
                style={{
                  background: "var(--surface)",
                  border:     "1.5px solid var(--border)",
                  boxShadow:  "var(--shadow-hover)",
                }}
              >
                {suggestions.map((s, i) => (
                  <button
                    key={s._id}
                    onMouseDown={() => handleSuggestionClick(s)}
                    className="w-full flex items-center gap-3 px-4
                               py-3 text-left transition-colors
                               duration-150"
                    style={{
                      borderBottom:
                        i < suggestions.length - 1
                          ? "1px solid var(--border)"
                          : "none",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "var(--forest-light)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {s.imageUrl && (
                      <img
                        src={s.imageUrl}
                        alt={s.name}
                        className="w-9 h-9 object-cover rounded-lg
                                   shrink-0"
                        onError={(e) =>
                          (e.target.style.display = "none")
                        }
                      />
                    )}
                    <div className="min-w-0">
                      <p
                        className="text-sm font-bold truncate"
                        style={{ color: "var(--ink)" }}
                      >
                        {s.name}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{ color: "var(--ink-faint)" }}
                      >
                        {s.meaning}
                      </p>
                    </div>
                    <ChevronRight
                      size={14}
                      strokeWidth={2.5}
                      className="ml-auto shrink-0"
                      style={{ color: "var(--forest)" }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Difficulty filter */}
          <div className="relative">
            <div
              className="absolute inset-y-0 left-3 flex items-center
                         pointer-events-none"
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
              className="input text-sm py-3 pl-8 w-36"
            >
              <option value="">All levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Search button */}
          <button
            onClick={() => performSearch()}
            disabled={!query.trim() || loading}
            className="btn-primary px-6 shrink-0"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full border-2
                             border-white/30 border-t-white
                             animate-spin"
                />
                Searching
              </span>
            ) : (
              <>
                <Search size={14} strokeWidth={2.5} />
                Search
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Results ── */}
      {loading ? (
        <Loader text={`Searching for "${query}"...`} />
      ) : error ? (
        <div
          className="rounded-2xl p-4 text-sm animate-scale-in"
          style={{
            background: "rgba(185,28,28,0.06)",
            border:     "1px solid rgba(185,28,28,0.15)",
            color:      "#B91C1C",
          }}
        >
          {error}
        </div>
      ) : hasSearched ? (
        <div className="space-y-5 animate-fade-up">
          {/* Result count */}
          <div
            className="flex items-center justify-between px-4 py-3
                       rounded-xl"
            style={{
              background: "var(--cream-2)",
              border:     "1px solid var(--border)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
              {results.length > 0 ? (
                <>
                  <span
                    className="font-bold"
                    style={{ color: "var(--ink)" }}
                  >
                    {results.length}
                  </span>{" "}
                  result{results.length !== 1 ? "s" : ""} for{" "}
                  <span
                    className="font-bold"
                    style={{ color: "var(--forest)" }}
                  >
                    "{query}"
                  </span>
                </>
              ) : (
                <>
                  No results for{" "}
                  <span
                    className="font-bold"
                    style={{ color: "var(--ink)" }}
                  >
                    "{query}"
                  </span>
                </>
              )}
            </p>
            {results.length > 0 && (
              <span className="section-label">Sorted by relevance</span>
            )}
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3
                            lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {results.map((sign, i) => (
                <div
                  key={sign._id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <SignCard sign={sign} />
                </div>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-16 rounded-2xl animate-fade-in"
              style={{
                background: "var(--cream-2)",
                border:     "2px dashed var(--border)",
              }}
            >
              <SearchX
                size={32}
                color="var(--ink-faint)"
                strokeWidth={1.5}
                className="mx-auto mb-3"
              />
              <p
                className="font-display font-bold"
                style={{ color: "var(--ink)" }}
              >
                No signs found for "{query}"
              </p>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--ink-muted)" }}
              >
                Try different keywords or browse the Library.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* ── Initial state ── */
        <div className="text-center py-12 space-y-7 animate-fade-in">
          <div>
            <div
              className="w-16 h-16 rounded-2xl flex items-center
                         justify-center mx-auto mb-4 animate-float"
              style={{
                background: "var(--forest-light)",
                border:     "1.5px solid rgba(74,92,63,0.2)",
              }}
            >
              <Search
                size={28}
                color="var(--forest)"
                strokeWidth={1.5}
              />
            </div>
            <p
              className="font-display text-xl font-bold"
              style={{ color: "var(--ink)" }}
            >
              Search the sign library
            </p>
            <p
              className="text-sm mt-1 max-w-sm mx-auto"
              style={{ color: "var(--ink-muted)" }}
            >
              Try a letter like "A", a word like "Hello",
              or a concept like "greeting".
            </p>
          </div>

          {/* Quick searches */}
          <div>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles
                size={12}
                strokeWidth={2.5}
                style={{ color: "var(--ink-faint)" }}
              />
              <p className="section-label">Quick searches</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_SEARCHES.map((term, i) => (
                <button
                  key={term}
                  onClick={() => {
                    setQuery(term);
                    performSearch(term);
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-bold
                             transition-all duration-200 animate-fade-up
                             hover:-translate-y-1"
                  style={{
                    background:     "var(--surface)",
                    border:         "1.5px solid var(--border)",
                    color:          "var(--ink-muted)",
                    boxShadow:      "var(--shadow-card)",
                    animationDelay: `${i * 40}ms`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--forest)";
                    e.currentTarget.style.color       = "var(--forest)";
                    e.currentTarget.style.background  = "var(--forest-light)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color       = "var(--ink-muted)";
                    e.currentTarget.style.background  = "var(--surface)";
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Fix: Search is also a lucide import name so we export with alias
export default Search_;