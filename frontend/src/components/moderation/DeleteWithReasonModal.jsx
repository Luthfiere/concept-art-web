import { useState } from "react";
import api from "../../services/api";
import { sanitizeText } from "../../utils/sanitize";

const REPORT_REASONS = [
  { value: "off_scope", label: "Off-topic / out of scope" },
  { value: "spam", label: "Spam" },
  { value: "scam", label: "Scam or misleading" },
  { value: "duplicate", label: "Duplicate" },
  { value: "inappropriate", label: "Inappropriate / explicit content" },
  { value: "other", label: "Other" },
];

const DeleteWithReasonModal = ({ entityType, entityId, title, onClose, onDeleted }) => {
  const [reason, setReason] = useState("inappropriate");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.delete(`/moderation/${entityType}/${entityId}`, {
        data: { reason, note: sanitizeText(note) || null },
      });
      onDeleted?.();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete content");
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
        className="w-full max-w-md bg-[#111427] border border-red-500/20 p-5 sm:p-6 rounded-2xl shadow-xl"
      >
        <h2 className="text-lg font-semibold text-white mb-1">Delete content</h2>
        {title && (
          <p className="text-xs text-gray-400 mb-1 truncate">"{title}"</p>
        )}
        <p className="text-xs text-gray-400 mb-4">
          This will permanently remove the post and notify the author with the reason below.
        </p>

        <label className="block text-xs font-medium text-gray-400 mb-1.5">Reason</label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full bg-[#0f1323] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/40 transition mb-4"
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
          placeholder="Optional context for the author..."
          className="w-full bg-[#0f1323] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/40 transition resize-none"
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
            {submitting ? "Deleting..." : "Delete content"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteWithReasonModal;
