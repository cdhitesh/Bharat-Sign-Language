// frontend/src/components/ui/ConfidenceBadge.jsx

import { formatConfidence } from "../../utils/helpers";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

const ConfidenceBadge = ({ score }) => {
  if (score === null || score === undefined) return null;

  const getConfig = () => {
    if (score >= 0.8) return {
      style: { background: "rgba(74,92,63,0.1)",
               color: "var(--forest)",
               border: "1px solid rgba(74,92,63,0.2)" },
      Icon: CheckCircle,
    };
    if (score >= 0.6) return {
      style: { background: "rgba(196,154,42,0.1)",
               color: "var(--gold-dark)",
               border: "1px solid rgba(196,154,42,0.25)" },
      Icon: AlertCircle,
    };
    return {
      style: { background: "rgba(185,28,28,0.08)",
               color: "#B91C1C",
               border: "1px solid rgba(185,28,28,0.15)" },
      Icon: XCircle,
    };
  };

  const { style, Icon } = getConfig();

  return (
    <span className="badge animate-scale-in" style={style}>
      <Icon size={10} strokeWidth={2.5} style={{ marginRight: "3px" }} />
      {formatConfidence(score)}
    </span>
  );
};

export default ConfidenceBadge;