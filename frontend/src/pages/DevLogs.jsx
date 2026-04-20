import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreview, setMediaPreview] = useState([]);
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [devlogs, setDevlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "devlog",
    genre: "",
    tag: "",
    status: "Published",
    cover_image: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const isLoggedIn = !!localStorage.getItem("token");

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);

    setMediaFiles(files);

    const previews = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type,
    }));

    setMediaPreview(previews);
  };

  useEffect(() => {
    fetchDevlogs(activeFilter);
  }, [activeFilter]);

  const processFiles = (files) => {
    const fileArray = Array.from(files);

    const previews = fileArray.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type,
    }));

    setMediaFiles((prev) => [...prev, ...fileArray]);
    setMediaPreview((prev) => [...prev, ...previews]);
  };

  const fetchDevlogs = async (category) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const url =
        category === "all"
          ? `${API_BASE}/devlog`
          : `${API_BASE}/devlog/category/${category}`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "cover_image") {
      const file = files[0];
      if (file) {
        setForm((prev) => ({ ...prev, cover_image: file }));
        setPreview(URL.createObjectURL(file));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, cover_image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    setSubmitting(true);

    try {
      // =========================
      // 1. CREATE DEVLOG
      // =========================
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("content", form.content);
      formData.append("category", form.category);
      formData.append("genre", form.genre);
      formData.append("tag", form.tag);
      formData.append("status", form.status);

      if (form.cover_image) {
        formData.append("cover_image", form.cover_image);
      }

      const res = await fetch(`${API_BASE}/devlog`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      const devlogId = result.data.id;

      // =========================
      // 2. UPLOAD MEDIA (MULTIPLE)
      // =========================
      if (mediaFiles.length > 0) {
        const mediaForm = new FormData();

        mediaFiles.forEach((file) => {
          mediaForm.append("media", file);
        });

        mediaForm.append("log_id", devlogId);

        await fetch(`${API_BASE}/devlog-media/log/${devlogId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: mediaForm,
        });
      }

      // =========================
      // RESET
      // =========================
      setShowModal(false);
      setForm({
        title: "",
        content: "",
        category: "devlog",
        genre: "",
        tag: "",
        status: "Published",
        cover_image: null,
      });

      setMediaFiles([]);
      setMediaPreview([]);

      alert("Post Success 🚀");

      fetchDevlogs(activeFilter);
    } catch (err) {
      console.error(err);
      alert("Failed to create devlog");
    } finally {
      setSubmitting(false);
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

          {isLoggedIn ? (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-semibold px-4 py-2 rounded-lg transition shadow-sm"
            >
              <span className="text-base">+</span> New Devlog
            </button>
          ) : (
            <Link
              to="/login?redirect=/DevLogs"
              className="flex items-center gap-2 bg-yellow-400/80 hover:bg-yellow-300 text-black text-sm font-semibold px-4 py-2 rounded-lg transition shadow-sm"
            >
              Sign in to post
            </Link>
          )}
        </div>

        {/* Filter */}
        <div className="flex gap-5 mb-8 overflow-x-auto pb-1 scrollbar-none">
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
                onClick={() => navigate(`/devlog/${log.id}`)}
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
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0f172a] w-full max-w-lg rounded-xl p-6 border border-white/10 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Create Devlog</h2>

            {/* Title */}
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Title..."
              className="w-full mb-3 px-3 py-2 bg-[#020617] border border-white/10 rounded-lg text-sm outline-none focus:border-yellow-400"
            />

            {/* Content */}
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={4}
              placeholder="Write your devlog..."
              className="w-full mb-3 px-3 py-2 bg-[#020617] border border-white/10 rounded-lg text-sm outline-none focus:border-yellow-400"
            />

            {/* Category */}
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full mb-3 px-3 py-2 bg-[#020617] border border-white/10 rounded-lg text-sm outline-none"
            >
              {CATEGORIES.filter((c) => c !== "all").map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>

            {/* Genre */}
            <input
              type="text"
              name="genre"
              value={form.genre}
              onChange={handleChange}
              placeholder="ex. 3D Platformer, First Person Shooter, 2D Platformer"
              className="w-full mb-3 px-3 py-2 bg-[#020617] border border-white/10 rounded-lg text-sm outline-none focus:border-yellow-400"
            />

            {/* Tag */}
            <input
              type="text"
              name="tag"
              value={form.tag}
              onChange={handleChange}
              placeholder="ex. Boss, Ai, open world, survival"
              className="w-full mb-3 px-3 py-2 bg-[#020617] border border-white/10 rounded-lg text-sm outline-none focus:border-yellow-400"
            />

            {/* Cover */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`w-full mb-4 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition relative
                ${
                  isDragging
                    ? "border-yellow-400 bg-yellow-400/10 scale-[1.02]"
                    : "border-white/10 hover:border-yellow-400"
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                name="cover_image"
                accept="image/*"
                onClick={(e) => {
                  e.target.value = null; // 🔥 reset sebelum pilih file
                }}
                onChange={handleChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />

              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-40 object-cover rounded-md"
                  />

                  {/* overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center text-xs text-white transition">
                    Change Image
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreview(null);
                        setForm((prev) => ({ ...prev, cover_image: null }));
                      }}
                      className="absolute top-2 right-2 bg-black/60 text-xs px-2 py-1 rounded"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-sm">
                  <p className="mb-1">Drag & drop cover image here</p>
                  <p className="text-xs text-gray-600">or click to upload</p>
                </div>
              )}
            </div>

            {/* DEVLOG MEDIA */}
            <div
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingMedia(false);
                processFiles(e.dataTransfer.files);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingMedia(true);
              }}
              onDragLeave={() => setIsDraggingMedia(false)}
              className={`w-full mb-4 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition
                ${
                  isDraggingMedia
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-white/10 hover:border-yellow-400"
                }`}
            >
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleMediaChange}
                className="hidden"
                id="mediaUpload"
              />

              <label htmlFor="mediaUpload" className="cursor-pointer">
                <p className="text-sm text-gray-400">
                  Drag & drop media here or click to upload
                </p>
              </label>

              {/* Preview */}
              {mediaPreview.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {mediaPreview.map((m, i) => {
                    const isVideo = m.type.startsWith("video");

                    return (
                      <div
                        key={i}
                        className="relative group rounded-lg overflow-hidden border border-white/10 bg-black"
                      >
                        {isVideo ? (
                          <video
                            src={m.url}
                            className="w-full h-28 object-cover opacity-90 group-hover:opacity-100 transition"
                          />
                        ) : (
                          <img
                            src={m.url}
                            className="w-full h-28 object-cover group-hover:scale-105 transition"
                          />
                        )}

                        {/* TYPE BADGE */}
                        <div className="absolute top-1 left-1 text-[10px] px-2 py-[2px] rounded bg-black/70 text-white">
                          {isVideo ? "VIDEO" : "IMAGE"}
                        </div>

                        {/* REMOVE BUTTON */}
                        <button
                          onClick={() => {
                            setMediaFiles((prev) =>
                              prev.filter((_, idx) => idx !== i),
                            );
                            setMediaPreview((prev) =>
                              prev.filter((_, idx) => idx !== i),
                            );
                          }}
                          className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-[2px] rounded opacity-0 group-hover:opacity-100 transition"
                        >
                          ✕
                        </button>

                        {/* HOVER OVERLAY */}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs text-white pointer-events-none">
                          Preview
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded-lg text-sm font-semibold"
              >
                {submitting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
