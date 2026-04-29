import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import api from "../services/api";
import DeleteWithReasonModal from "../components/moderation/DeleteWithReasonModal";

const BASE_URL = "http://localhost:5000";

const ENTITY_LABEL = {
  art: "Art / Ideation",
  devlog: "Devlog",
  job: "Job Posting",
};

const ENTITY_VIEW_PATH = {
  art: (id, category) => (category === "art" ? `/art/${id}` : `/post/${id}`),
  devlog: (id) => `/devlog/${id}`,
  job: (id) => `/job/${id}`,
};

const FILTERS = [
  { value: "all", label: "All" },
  { value: "art", label: "Art / Ideation" },
  { value: "devlog", label: "Devlog" },
  { value: "job", label: "Job" },
];

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString();
};

const reasonBreakdown = (reasons) => {
  if (!reasons || reasons.length === 0) return "";
  const counts = reasons.reduce((acc, r) => {
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([r, n]) => `${r} (${n})`)
    .join(", ");
};

const thumbnailFor = (row) => {
  if (row.entity_type === "art" && row.art_thumbnail) {
    return `${BASE_URL}/${row.art_thumbnail.replace(/\\/g, "/")}`;
  }
  if (row.entity_type === "devlog" && row.devlog_cover) {
    return `${BASE_URL}/${row.devlog_cover.replace(/\\/g, "/")}`;
  }
  return null;
};

const Moderation = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [target, setTarget] = useState(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get("/moderation/queue");
      setQueue(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const visible =
    filter === "all" ? queue : queue.filter((r) => r.entity_type === filter);

  const handleDeleted = () => {
    fetchQueue();
  };

  return (
    <div className="min-h-screen bg-[#0a0d1f] text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Moderation queue
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Reported content sorted by report count. Deleting will notify the author with the reason you choose.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                filter === f.value
                  ? "bg-yellow-400 text-black"
                  : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-white/10 border-t-yellow-500 rounded-full animate-spin" />
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-20 border border-white/[0.06] rounded-xl">
            <p className="text-white/40 text-sm">
              {filter === "all"
                ? "No reported content. Nothing to review."
                : `No reported ${ENTITY_LABEL[filter] || filter} items.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((row) => {
              const thumb = thumbnailFor(row);
              const viewPath =
                ENTITY_VIEW_PATH[row.entity_type]?.(row.entity_id, row.art_category) || "#";
              return (
                <div
                  key={`${row.entity_type}-${row.entity_id}`}
                  className="bg-[#111427] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row gap-4"
                >
                  <div className="w-full sm:w-32 h-28 sm:h-20 shrink-0 rounded-md bg-black/40 overflow-hidden flex items-center justify-center">
                    {thumb ? (
                      <img src={thumb} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider text-gray-500">
                        {ENTITY_LABEL[row.entity_type] || row.entity_type}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-[11px] uppercase tracking-wider text-gray-300">
                        {ENTITY_LABEL[row.entity_type] || row.entity_type}
                      </span>
                      <span className="text-[11px] text-red-400 font-semibold">
                        {row.report_count} report{row.report_count === 1 ? "" : "s"}
                      </span>
                    </div>
                    <p className="font-semibold text-sm text-white truncate">
                      {row.title || `(no title - id ${row.entity_id})`}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      by{" "}
                      <span className="text-gray-200">
                        {row.author_username || `user ${row.author_id}`}
                      </span>{" "}
                      &middot; last reported {formatDate(row.last_reported_at)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1.5">
                      Reasons: {reasonBreakdown(row.reasons)}
                    </p>
                    {row.notes && row.notes.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1 italic line-clamp-2">
                        Latest note: "{row.notes[0]}"
                      </p>
                    )}
                  </div>

                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <a
                      href={viewPath}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 text-center"
                    >
                      View
                    </a>
                    <button
                      onClick={() =>
                        setTarget({
                          entityType: row.entity_type,
                          entityId: row.entity_id,
                          title: row.title,
                        })
                      }
                      className="px-3 py-1.5 rounded-md text-xs font-semibold bg-red-500 hover:bg-red-400 text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {target && (
        <DeleteWithReasonModal
          entityType={target.entityType}
          entityId={target.entityId}
          title={target.title}
          onClose={() => setTarget(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
};

export default Moderation;
