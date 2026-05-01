import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api, { isTokenExpired } from "../../services/api";

const DeletionBanner = () => {
  const [actions, setActions] = useState([]);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isTokenExpired()) {
        if (!cancelled) setActions([]);
        return;
      }
      try {
        const res = await api.get("/moderation-actions/me");
        if (!cancelled) setActions(res.data?.data || []);
      } catch {
        if (!cancelled) setActions([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  const dismiss = async (id) => {
    try {
      await api.patch(`/moderation-actions/${id}/dismiss`);
      setActions((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to dismiss:", err);
    }
  };

  if (actions.length === 0) return null;

  return (
    <div className="fixed top-14 sm:top-[72px] left-0 right-0 z-40 flex flex-col">
      {actions.map((a) => (
        <div
          key={a.id}
          className="bg-red-600 text-white px-4 py-2.5 flex items-start sm:items-center gap-3 border-b border-red-500/40"
        >
          <svg
            className="w-5 h-5 shrink-0 mt-0.5 sm:mt-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
          <div className="flex-1 text-sm leading-snug">
            <span className="font-semibold">
              Your {a.entity_type === "art" ? "post" : a.entity_type}
              {a.entity_title_snapshot ? ` "${a.entity_title_snapshot}"` : ""} was deleted by a moderator.
            </span>{" "}
            <span className="opacity-90">Reason: {a.reason}.</span>
            {a.note && (
              <span className="opacity-90"> Note: {a.note}</span>
            )}
          </div>
          <button
            onClick={() => dismiss(a.id)}
            className="shrink-0 text-xs font-semibold bg-white/15 hover:bg-white/25 px-3 py-1 rounded-md transition"
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
};

export default DeletionBanner;
