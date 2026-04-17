import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

const API_BASE = "http://localhost:5000/api";
const BASE_URL = "http://localhost:5000";

const CATEGORIES = [
  "all",
  "major_update",
  "minor_update",
  "patch_notes",
  "announcement",
  "feature",
  "bugfix",
  "milestone",
  "devlog",
  "postmortem",
  "game_design",
  "tech_discussion",
  "tutorial",
  "culture",
  "marketing",
];

const CATEGORY_LABELS = {
  all: "All",
  major_update: "Major update",
  minor_update: "Minor update",
  patch_notes: "Patch notes",
  announcement: "Announcement",
  feature: "Feature",
  bugfix: "Bugfix",
  milestone: "Milestone",
  devlog: "Devlog",
  postmortem: "Postmortem",
  game_design: "Game design",
  tech_discussion: "Tech discussion",
  tutorial: "Tutorial",
  culture: "Culture",
  marketing: "Marketing",
};

const BADGE_COLORS = {
  patch_notes: "bg-emerald-950/60 text-emerald-300",
  milestone: "bg-blue-950/60 text-blue-300",
  tech_discussion: "bg-violet-950/60 text-violet-300",
  game_design: "bg-pink-950/60 text-pink-300",
  devlog: "bg-white/5 text-gray-400",
  postmortem: "bg-orange-950/60 text-orange-300",
  announcement: "bg-yellow-950/60 text-yellow-300",
  feature: "bg-teal-950/60 text-teal-300",
  bugfix: "bg-red-950/60 text-red-300",
  major_update: "bg-amber-950/60 text-amber-300",
  minor_update: "bg-amber-950/40 text-amber-400",
  tutorial: "bg-cyan-950/60 text-cyan-300",
  culture: "bg-rose-950/60 text-rose-300",
  marketing: "bg-indigo-950/60 text-indigo-300",
};

export default function Devlogs() {
  const [devlogs, setDevlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDevlogs(activeFilter);
  }, [activeFilter]);

  const fetchDevlogs = async (category) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const url =
        category === "all"
          ? `${API_BASE}/devlog`
          : `${API_BASE}/devlog/category/${category}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      const raw = result.data || [];
      setDevlogs(
        raw.map((log) => ({
          ...log,
          cover_image: log.cover_image
            ? log.cover_image.startsWith("http")
              ? log.cover_image
              : `${BASE_URL}/${log.cover_image}`
            : null,
          category: log.category || "devlog",
          author: log.username || "Unknown",
          excerpt:
            log.excerpt ||
            (log.content ? log.content.slice(0, 120) + "..." : ""),
        })),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] to-[#0b0f2a] text-white">
      <Navbar />

      <div className="px-6 lg:px-10 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Devlogs</h1>
            <p className="text-gray-400 text-sm mt-1">
              Track updates, progress, and development stories
            </p>
          </div>

          <button
            onClick={() => navigate("/devlogs/create")}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-semibold px-4 py-2 rounded-lg transition shadow-sm"
          >
            <span className="text-base">+</span> New Devlog
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`text-xs px-4 py-1.5 rounded-full border whitespace-nowrap transition ${
                activeFilter === cat
                  ? "bg-yellow-400 text-black border-yellow-400 font-semibold"
                  : "border-white/10 text-gray-400 hover:border-yellow-400 hover:text-yellow-400"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-gray-500 text-sm animate-pulse">Loading...</p>
        ) : devlogs.length === 0 ? (
          <p className="text-gray-500 text-sm">No devlogs for this category.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devlogs.map((log) => (
              <div
                key={log.id}
                onClick={() => navigate(`/devlogs/${log.id}`)}
                className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden hover:border-yellow-400/40 hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                {/* Cover */}
                {log.cover_image ? (
                  <img
                    src={log.cover_image}
                    alt={log.title}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-[#0d1117] flex items-center justify-center text-gray-600 text-xs">
                    No Cover
                  </div>
                )}

                <div className="p-5">
                  {/* Badge */}
                  <span
                    className={`inline-block text-[11px] font-medium px-2.5 py-1 rounded-full mb-3 ${
                      BADGE_COLORS[log.category] || "bg-white/5 text-gray-400"
                    }`}
                  >
                    {CATEGORY_LABELS[log.category] || log.category}
                  </span>

                  {/* Title */}
                  <h2 className="text-sm font-semibold leading-snug line-clamp-2 mb-2">
                    {log.title}
                  </h2>

                  {/* Meta */}
                  <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                    <span>{log.author}</span>
                    <span>·</span>
                    <span>
                      {log.created_at
                        ? new Date(log.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                  </p>

                  {/* Excerpt */}
                  <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
                    {log.excerpt}
                  </p>

                  {/* Footer */}
                  <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-yellow-400 text-xs font-semibold flex items-center gap-1">
                      Read more →
                    </span>

                    <span className="text-xs text-gray-600">
                      {(log.views || 0).toLocaleString()} views
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
