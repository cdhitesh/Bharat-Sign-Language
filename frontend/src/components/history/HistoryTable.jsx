// frontend/src/components/history/HistoryTable.jsx

import { useState } from "react";
import { Star, Eye, Trash2, X } from "lucide-react";
import ConfidenceBadge from "../ui/ConfidenceBadge";
import { formatDate, truncate } from "../../utils/helpers";
import { historyAPI } from "../../api/api";

const inputTypeConfig = {
  image:  { label: "Image",  bg: "rgba(74,92,63,0.08)",   color: "var(--forest)" },
  speech: { label: "Speech", bg: "rgba(196,154,42,0.08)", color: "var(--gold-dark)" },
  text:   { label: "Text",   bg: "rgba(26,26,26,0.06)",   color: "var(--ink-muted)" },
};

// ── Top-K Bar Chart ────────────────────────────────────────────────────────────
const TopKChart = ({ topK }) => (
  <div className="space-y-2 mt-2">
    {topK.map((p, i) => (
      <div key={i} className="flex items-center gap-3">
        <span
          className="w-5 text-xs font-bold text-right shrink-0"
          style={{ color: "var(--ink-faint)" }}
        >
          {p.label}
        </span>
        <div
          className="flex-1 rounded-full overflow-hidden h-2"
          style={{ background: "var(--cream-2)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width:      `${(p.confidence * 100).toFixed(0)}%`,
              background: i === 0
                ? "var(--forest)"
                : "var(--border-2)",
            }}
          />
        </div>
        <span
          className="text-xs font-bold w-10 text-right shrink-0"
          style={{ color: i === 0 ? "var(--forest)" : "var(--ink-faint)" }}
        >
          {(p.confidence * 100).toFixed(1)}%
        </span>
      </div>
    ))}
  </div>
);

// ── Detail Modal ───────────────────────────────────────────────────────────────
const DetailModal = ({ entry, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center px-4"
    style={{
      background:     "rgba(26,26,26,0.4)",
      backdropFilter: "blur(4px)",
    }}
    onClick={onClose}
  >
    <div
      className="bg-white rounded-3xl shadow-2xl max-w-md w-full
                 overflow-hidden animate-scale-in"
      style={{
        background: "var(--surface)",
        border:     "1.5px solid var(--border)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <h3
          className="font-display text-lg font-bold"
          style={{ color: "var(--ink)" }}
        >
          Prediction Detail
        </h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center
                     justify-center transition-colors duration-200"
          style={{ color: "var(--ink-muted)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--cream-2)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* Big predicted letter */}
      <div
        className="mx-6 mt-5 rounded-2xl py-8 text-center
                   relative overflow-hidden"
        style={{ background: "var(--forest-light)" }}
      >
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, " +
              "var(--forest) 0%, transparent 70%)",
          }}
        />
        <p
          className="font-display font-bold leading-none relative z-10"
          style={{ fontSize: "6rem", color: "var(--forest)" }}
        >
          {entry.predictedSign}
        </p>
        <div className="mt-3 flex justify-center relative z-10">
          <ConfidenceBadge score={entry.confidenceScore} />
        </div>
      </div>

      {/* Details */}
      <div className="px-6 py-5 space-y-4">
        {[
          { label: "Input Type", value: entry.inputType },
          { label: "Date",       value: formatDate(entry.createdAt) },
          {
            label: "Favorited",
            value: entry.isFavorited ? "Yes" : "Not favorited",
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex justify-between items-center py-2"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <span className="section-label">{label}</span>
            <span
              className="text-sm font-bold capitalize"
              style={{ color: "var(--ink)" }}
            >
              {value}
            </span>
          </div>
        ))}

        {/* Top-K predictions */}
        {entry.metadata?.top_k?.length > 0 && (
          <div>
            <p className="section-label mb-3">Top Predictions</p>
            <TopKChart topK={entry.metadata.top_k} />
          </div>
        )}

        {/* Inference time */}
        {entry.metadata?.inference_time_ms !== undefined && (
          <div className="flex items-center justify-between pt-2">
            <span className="section-label">Inference Time</span>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{
                background: "var(--cream-2)",
                color:      "var(--ink-muted)",
              }}
            >
              {entry.metadata.inference_time_ms}ms
            </span>
          </div>
        )}
      </div>

      <div className="px-6 pb-6">
        <button onClick={onClose} className="btn-secondary w-full">
          Close
        </button>
      </div>
    </div>
  </div>
);

// ── Main Table ─────────────────────────────────────────────────────────────────
const HistoryTable = ({ data, onRefresh }) => {
  const [deletingId,    setDeletingId]    = useState(null);
  const [favoritingId,  setFavoritingId]  = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      setDeletingId(id);
      await historyAPI.delete(id);
      onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleFavorite = async (id) => {
    try {
      setFavoritingId(id);
      await historyAPI.toggleFavorite(id);
      onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setFavoritingId(null);
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div
          className="w-14 h-14 rounded-2xl flex items-center
                     justify-center mx-auto mb-4"
          style={{
            background: "var(--cream-2)",
            border:     "1.5px solid var(--border)",
          }}
        >
          <Eye size={24} color="var(--ink-faint)" strokeWidth={1.5} />
        </div>
        <p
          className="font-display font-bold text-lg mb-1"
          style={{ color: "var(--ink)" }}
        >
          No history yet
        </p>
        <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
          Start detecting signs on the Home page.
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden animate-fade-up"
        style={{
          border:     "1.5px solid var(--border)",
          boxShadow:  "var(--shadow-card)",
        }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              style={{
                background:   "var(--cream-2)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {["Date", "Type", "Input", "Prediction",
                "Confidence", "Saved", ""].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3.5 text-left section-label"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((entry, i) => {
              const typeConf =
                inputTypeConfig[entry.inputType] || inputTypeConfig.text;
              return (
                <tr
                  key={entry._id}
                  className="group transition-colors duration-150"
                  style={{
                    borderBottom:   "1px solid var(--border)",
                    animationDelay: `${i * 40}ms`,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--cream-2)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {/* Date */}
                  <td
                    className="px-4 py-3.5 whitespace-nowrap text-xs"
                    style={{ color: "var(--ink-faint)" }}
                  >
                    {formatDate(entry.createdAt)}
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3.5">
                    <span
                      className="badge"
                      style={{
                        background: typeConf.bg,
                        color:      typeConf.color,
                      }}
                    >
                      {typeConf.label}
                    </span>
                  </td>

                  {/* Input */}
                  <td
                    className="px-4 py-3.5 max-w-[140px]"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    {truncate(entry.inputContent, 28)}
                  </td>

                  {/* Prediction */}
                  <td className="px-4 py-3.5">
                    <span
                      className="font-display text-2xl font-bold"
                      style={{ color: "var(--forest)" }}
                    >
                      {entry.predictedSign}
                    </span>
                  </td>

                  {/* Confidence */}
                  <td className="px-4 py-3.5">
                    <ConfidenceBadge score={entry.confidenceScore} />
                  </td>

                  {/* Favorite */}
                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={() => handleFavorite(entry._id)}
                      disabled={favoritingId === entry._id}
                      className="transition-all duration-200
                                 hover:scale-125 disabled:opacity-40"
                      title={entry.isFavorited ? "Unfavorite" : "Favorite"}
                    >
                      <Star
                        size={16}
                        strokeWidth={2}
                        color={
                          entry.isFavorited
                            ? "var(--gold)"
                            : "var(--ink-faint)"
                        }
                        fill={entry.isFavorited ? "var(--gold)" : "none"}
                      />
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div
                      className="flex items-center gap-3 opacity-0
                                 group-hover:opacity-100 transition-opacity
                                 duration-200"
                    >
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="flex items-center gap-1 text-xs
                                   font-bold transition-colors duration-150"
                        style={{ color: "var(--forest)" }}
                      >
                        <Eye size={12} strokeWidth={2.5} />
                        View
                      </button>
                      <span style={{ color: "var(--border-2)" }}>|</span>
                      <button
                        onClick={() => handleDelete(entry._id)}
                        disabled={deletingId === entry._id}
                        className="flex items-center gap-1 text-xs
                                   font-bold transition-colors duration-150
                                   disabled:opacity-40"
                        style={{ color: "#B91C1C" }}
                      >
                        <Trash2 size={12} strokeWidth={2.5} />
                        {deletingId === entry._id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedEntry && (
        <DetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </>
  );
};

export default HistoryTable;