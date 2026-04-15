// frontend/src/pages/History.jsx

import { useState, useCallback } from "react";
import { Trash2 } from "lucide-react";
import HistoryTable from "../components/history/HistoryTable";
import Loader from "../components/ui/Loader";
import ErrorMessage from "../components/ui/ErrorMessage";
import useApi from "../hooks/useApi";
import { historyAPI } from "../api/api";

const ITEMS_PER_PAGE = 10;

const FILTERS = [
  { label: "All",    value: ""       },
  { label: "Image",  value: "image"  },
  { label: "Text",   value: "text"   },
  { label: "Speech", value: "speech" },
];

// ── Stat Card ──────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, delay }) => (
  <div
    className="card animate-fade-up"
    style={{ animationDelay: delay }}
  >
    <p className="section-label mb-1">{label}</p>
    <p
      className="font-display text-3xl font-bold"
      style={{ color: "var(--forest)" }}
    >
      {value}
    </p>
  </div>
);

const History = () => {
  const [page,      setPage]      = useState(1);
  const [inputType, setInputType] = useState("");
  const [clearing,  setClearing]  = useState(false);

  const fetchHistory = useCallback(
    () =>
      historyAPI.getAll({
        page,
        limit: ITEMS_PER_PAGE,
        ...(inputType && { inputType }),
      }),
    [page, inputType]
  );

  const { data, loading, error, refetch } = useApi(
    fetchHistory,
    null,
    [page, inputType]
  );

  const history    = data?.data       || [];
  const pagination = data?.pagination || {};

  const handleClearAll = async () => {
    if (!window.confirm(
      "Delete ALL history? This cannot be undone."
    )) return;
    try {
      setClearing(true);
      await historyAPI.clearAll();
      refetch();
    } catch (err) {
      alert(err.message);
    } finally {
      setClearing(false);
    }
  };

  const handleFilterChange = (type) => {
    setInputType(type);
    setPage(1);
  };

  return (
    <div className="space-y-7">

      {/* ── Header ── */}
      <div
        className="flex flex-col sm:flex-row sm:items-end
                   justify-between gap-4 animate-fade-up"
      >
        <div>
          <h1
            className="font-display"
            style={{ color: "var(--ink)", fontSize: "2rem" }}
          >
            Prediction{" "}
            <span style={{ color: "var(--forest)" }}>History</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
            All your sign language predictions in one place
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            disabled={clearing}
            className="btn-danger text-sm shrink-0
                       flex items-center gap-2"
          >
            <Trash2 size={14} strokeWidth={2.5} />
            {clearing ? "Clearing..." : "Clear All"}
          </button>
        )}
      </div>

      {/* ── Stats ── */}
      {pagination.total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Total Predictions"
            value={pagination.total}
            delay="0ms"
          />
          <StatCard
            label="This Page"
            value={history.length}
            delay="75ms"
          />
          <StatCard
            label="Current Page"
            value={`${page} / ${pagination.totalPages || 1}`}
            delay="150ms"
          />
          <StatCard
            label="Favorited"
            value={history.filter((h) => h.isFavorited).length}
            delay="225ms"
          />
        </div>
      )}

      {/* ── Filters ── */}
      <div
        className="flex items-center gap-2 flex-wrap
                   animate-fade-up delay-150"
      >
        <span
          className="section-label mr-1"
          style={{ color: "var(--ink-faint)" }}
        >
          Filter
        </span>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilterChange(f.value)}
            className="px-4 py-1.5 rounded-lg text-sm font-bold
                       border transition-all duration-200
                       hover:-translate-y-0.5"
            style={
              inputType === f.value
                ? {
                    background:  "var(--forest)",
                    color:       "white",
                    border:      "2px solid var(--forest)",
                    boxShadow:   "0 4px 12px rgba(74,92,63,0.25)",
                  }
                : {
                    background:  "var(--surface)",
                    color:       "var(--ink-muted)",
                    border:      "1.5px solid var(--border)",
                  }
            }
          >
            {f.label}
          </button>
        ))}

        {pagination.total !== undefined && (
          <span
            className="ml-auto text-xs font-bold"
            style={{ color: "var(--ink-faint)" }}
          >
            {pagination.total} total entries
          </span>
        )}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <Loader text="Loading history..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={refetch} />
      ) : (
        <>
          <HistoryTable data={history} onRefresh={refetch} />

          {/* ── Pagination ── */}
          {pagination.totalPages > 1 && (
            <div
              className="flex items-center justify-center gap-2
                         pt-2 animate-fade-in"
            >
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={!pagination.hasPrevPage}
                className="btn-secondary text-sm px-4 py-2
                           disabled:opacity-40"
              >
                ← Prev
              </button>

              <div className="flex items-center gap-1">
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                )
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === pagination.totalPages ||
                      Math.abs(p - page) <= 1
                  )
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span
                        key={`e-${i}`}
                        className="px-1.5"
                        style={{ color: "var(--ink-faint)" }}
                      >
                        ···
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className="w-9 h-9 rounded-lg text-sm font-bold
                                   transition-all duration-200
                                   hover:-translate-y-0.5"
                        style={
                          page === p
                            ? {
                                background: "var(--forest)",
                                color:      "white",
                                border:     "2px solid var(--forest)",
                                boxShadow:  "0 4px 12px rgba(74,92,63,0.25)",
                              }
                            : {
                                background: "var(--surface)",
                                color:      "var(--ink-muted)",
                                border:     "1.5px solid var(--border)",
                              }
                        }
                      >
                        {p}
                      </button>
                    )
                  )}
              </div>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNextPage}
                className="btn-secondary text-sm px-4 py-2
                           disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default History;