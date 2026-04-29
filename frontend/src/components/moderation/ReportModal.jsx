import { useState } from "react";
import api from "../../services/api";
import { sanitizeText } from "../../utils/sanitize";

export const FlagIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 21V4.5a1.5 1.5 0 011.5-1.5h12.69a.75.75 0 01.61 1.187L14.25 9.75l3.55 5.563a.75.75 0 01-.61 1.187H4.5"
    />
  </svg>
);

const REPORT_REASONS = [
  { value: "off_scope", label: "Off-topic / out of scope" },
  { value: "spam", label: "Spam" },
  { value: "scam", label: "Scam or misleading" },
  { value: "duplicate", label: "Duplicate" },
  { value: "inappropriate", label: "Inappropriate / explicit content" },
  { value: "other", label: "Other" },
];

const ReportModal = ({ entityType, entityId, onClose }) => {
  const [reason, setReason] = useState("inappropriate");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.post("/reports", {
        entity_type: entityType,
        entity_id: entityId,
        reason,
        note: sanitizeText(note) || null,
      });
      alert("Report submitted. A moderator will review it shortly.");
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#111427] border border-white/10 p-5 sm:p-6 rounded-2xl shadow-xl"
      >
        <h2 className="text-lg font-semibold text-white mb-1">Report this content</h2>
        <p className="text-xs text-gray-400 mb-4">
          A moderator will review this report. False reports may result in account action.
        </p>

        <label className="block text-xs font-medium text-gray-400 mb-1.5">Reason</label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full bg-[#0f1323] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/40 transition mb-4"
        >
          {REPORT_REASONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>

        <label className="block text-xs font-medium text-gray-400 mb-1.5">Note (optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Add context for the moderator..."
          className="w-full bg-[#0f1323] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/40 transition resize-none"
        />

        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={submit}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-500 hover:bg-red-400 text-white transition disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit report"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
