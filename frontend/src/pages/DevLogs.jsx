import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { sanitizeText, sanitizeFields } from "../utils/sanitize";
import { isModerator } from "../services/api";

const API_BASE = "/api";
const BASE_URL = "";
const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB

const CATEGORIES = [
  "all",
  "update",
  "announcement",
  "milestone",
  "devlog",
  "postmortem",
  "game_design",
  "tech_discussion",
  "tutorial",
];

const CATEGORY_LABELS = {
  all: "All",
  update: "Update",
  announcement: "Announcement",
  milestone: "Milestone",
  devlog: "Devlog",
  postmortem: "Postmortem",
  game_design: "Game design",
  tech_discussion: "Tech discussion",
  tutorial: "Tutorial",
};

const GAME_GENRES = [
  "Action",
  "Adventure",
  "RPG",
  "Simulation",
  "Strategy",
  "Puzzle",
  "Platformer",
  "Horror",
  "Visual Novel",
  "Racing / Sports",
];

const TAG_CATEGORIES = {
  Platform: ["PC", "Web Browser", "Mobile", "Console"],
  "Engine & Tools": [
    "Unity",
    "Unreal Engine",
    "Godot",
    "GameMaker",
    "RPG Maker",
  ],
  "Project Status": [
    "Prototype",
    "Demo",
    "Early Access",
    "Released",
    "Looking for Team",
  ],
};

const BADGE_COLORS = {
  milestone: "bg-blue-950/60 text-blue-300",
  tech_discussion: "bg-violet-950/60 text-violet-300",
  game_design: "bg-pink-950/60 text-pink-300",
  devlog: "bg-white/5 text-gray-400",
  postmortem: "bg-orange-950/60 text-orange-300",
  announcement: "bg-yellow-950/60 text-yellow-300",
  update: "bg-amber-950/40 text-amber-400",
  tutorial: "bg-cyan-950/60 text-cyan-300",
};

const MAX_FILES = 8;

export default function Devlogs() {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreview, setMediaPreview] = useState([]);
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);
  const [devlogs, setDevlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "devlog",
    genre: "",
    tag: [], 
    status: "Published",
    cover_image: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const isLoggedIn = !!localStorage.getItem("token");

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    let remaining = MAX_FILES - mediaFiles.length;

    if (remaining <= 0) {
      alert(`Maksimal hanya ${MAX_FILES} file`);
      return;
    }

    const validFiles = [];
    const previews = [];

    files.slice(0, remaining).forEach((file) => {
      const isVideo = file.type.startsWith("video");
      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        alert(`Video "${file.name}" melebihi 20MB`);
        return;
      }
      validFiles.push(file);
      previews.push({
        url: URL.createObjectURL(file),
        type: file.type,
      });
    });

    setMediaFiles((prev) => [...prev, ...validFiles]);
    setMediaPreview((prev) => [...prev, ...previews]);
  };

  useEffect(() => {
    fetchDevlogs(activeFilter);
  }, [activeFilter]);

  const processFiles = (files) => {
    const incoming = Array.from(files);
    let remaining = MAX_FILES - mediaFiles.length;

    if (remaining <= 0) {
      setError(`Maksimal hanya ${MAX_FILES} file`);
      return;
    }

    setError("");
    const validFiles = [];
    const previews = [];

    incoming.slice(0, remaining).forEach((file) => {
      const isVideo = file.type.startsWith("video");
      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        setError(`Video "${file.name}" melebihi 20MB`);
        return;
      }
      validFiles.push(file);
      previews.push({
        url: URL.createObjectURL(file),
        type: file.type,
      });
    });

    setMediaFiles((prev) => [...prev, ...validFiles]);
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
        raw
          .filter((log) => log.status === "Published")
          .map((log) => ({
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

  const incrementView = async (id) => {
    try {
      await fetch(`${API_BASE}/devlog/${id}/view`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Failed to increment view:", err);
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

  const handleTagCheck = (tagValue) => {
    setForm((prev) => {
      const isExist = prev.tag.includes(tagValue);
      const updatedTags = isExist
        ? prev.tag.filter((t) => t !== tagValue)
        : [...prev.tag, tagValue];
      return { ...prev, tag: updatedTags };
    });
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
    const missingFields = [];

    if (!form.title.trim()) missingFields.push("Devlog Title");
    if (!form.content.trim()) missingFields.push("Description");
    if (!form.genre) missingFields.push("Game Genre");
    if (form.tag.length === 0) missingFields.push("Tags (At least select one)");
    if (!form.cover_image) missingFields.push("Cover Image");

    if (missingFields.length > 0) {
      alert(
        `Please fill the following fields:\n\n• ${missingFields.join("\n• ")}`,
      );
      return;
    }

    setSubmitting(true);

    try {
      const stringifiedTags = form.tag.join(", ");

      const dataToSanitize = {
        ...form,
        tag: stringifiedTags,
        status: "Published",
      };

      const formData = new FormData();
      const cleanForm = sanitizeFields(dataToSanitize, [
        "title",
        "content",
        "category",
        "genre",
        "tag",
        "status",
      ]);

      formData.append("title", cleanForm.title);
      formData.append("content", cleanForm.content);
      formData.append("category", cleanForm.category);
      formData.append("genre", cleanForm.genre);
      formData.append("tag", cleanForm.tag);
      formData.append("status", cleanForm.status);

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

      setShowModal(false);
      setForm({
        title: "",
        content: "",
        category: "devlog",
        genre: "",
        tag: [],
        status: "Published",
        cover_image: null,
      });

      setPreview(null);
      setMediaFiles([]);
      setMediaPreview([]);

      alert("Post Behasil!");
      fetchDevlogs(activeFilter);
    } catch (err) {
      console.error(err);
      alert("Failed to create devlog");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    const missingFields = [];

    if (!form.title.trim()) missingFields.push("Devlog Title");
    if (!form.content.trim()) missingFields.push("Description");
    if (!form.genre) missingFields.push("Game Genre");
    if (form.tag.length === 0) missingFields.push("Tags (At least select one)");
    if (!form.cover_image) missingFields.push("Cover Image");

    if (missingFields.length > 0) {
      alert(
        `Please fill the following fields:\n\n• ${missingFields.join("\n• ")}`,
      );
      return;
    }

    setSubmitting(true);

    try {
      const stringifiedTags = form.tag.join(", ");

      const dataToSanitize = {
        ...form,
        tag: stringifiedTags,
        status: "Draft",
      };

      const formData = new FormData();
      const cleanForm = sanitizeFields(dataToSanitize, [
        "title",
        "content",
        "category",
        "genre",
        "tag",
        "status",
      ]);

      formData.append("title", cleanForm.title);
      formData.append("content", cleanForm.content);
      formData.append("category", cleanForm.category);
      formData.append("genre", cleanForm.genre);
      formData.append("tag", cleanForm.tag);
      formData.append("status", cleanForm.status);

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

      setShowModal(false);
      setForm({
        title: "",
        content: "",
        category: "devlog",
        genre: "",
        tag: [],
        status: "Published",
        cover_image: null,
      });

      setPreview(null);
      setMediaFiles([]);
      setMediaPreview([]);

      alert("Save berhasil");
      fetchDevlogs(activeFilter);
    } catch (err) {
      console.error(err);
      alert("Failed to create devlog");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] to-[#0b0f2a] text-white break-words [overflow-wrap:anywhere]">
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

          {isLoggedIn && !isModerator() ? (
            <button
              onClick={() => setShowModal(true)}
              className="cursor-pointer flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-semibold px-4 py-2 rounded-lg transition shadow-sm"
            >
              <span className="text-base">+</span> New Devlog
            </button>
          ) : !isLoggedIn ? (
            <Link
              to="/login?redirect=/DevLogs"
              className="flex items-center gap-2 bg-yellow-400/80 hover:bg-yellow-300 text-black text-sm font-semibold px-4 py-2 rounded-lg transition shadow-sm"
            >
              Sign in to post
            </Link>
          ) : null}
        </div>

        {/* Filter */}
        <div className="flex gap-5 mb-8 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`cursor-pointer text-xs px-4 py-1.5 rounded-full border whitespace-nowrap transition ${
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
                onClick={async () => {
                  await incrementView(log.id);
                  navigate(`/devlog/${log.id}`);
                }}
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
                    {sanitizeText(log.title)}
                  </h2>

                  {/* Meta */}
                  <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                    <span>{sanitizeText(log.author)}</span>
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
                    {sanitizeText(log.excerpt)}
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
          <div className="bg-[#0f172a] w-full max-w-lg rounded-xl border border-white/10 shadow-xl flex flex-col max-h-[90vh]">
            {/* SCROLL AREA */}
            <div
              className="p-6 overflow-y-auto
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-track]:bg-[#020617]
                [&::-webkit-scrollbar-thumb]:bg-[#1e293b]
                [&::-webkit-scrollbar-thumb]:rounded-full
                hover:[&::-webkit-scrollbar-thumb]:bg-[#334155]"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#1e293b #020617",
              }}
            >
              <h2 className="text-lg font-semibold mb-4">Create Devlog</h2>

              {/* Title */}
              <div className="mb-3">
                <label className="text-xs font-medium text-gray-400 mb-1 block">
                  Devlog Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#020617] border border-white/10 rounded-lg text-sm outline-none focus:border-yellow-400 text-white"
                />
              </div>

              {/* Content */}
              <div className="mb-3">
                <label className="text-xs font-medium text-gray-400 mb-1 block">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe what you built, fixed, or learned in this update..."
                  className="w-full px-3 py-2 bg-[#020617] border border-white/10 rounded-lg text-sm outline-none focus:border-yellow-400 text-white"
                />
              </div>

              {/* Category */}
              <div className="mb-3">
                <label className="text-xs font-medium text-gray-400 mb-1 block">
                  Post Type <span className="text-red-400">*</span>
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#020617] border border-white/10 rounded-lg text-sm outline-none text-white"
                >
                  {CATEGORIES.filter((c) => c !== "all").map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Game Genre (Ubah menjadi Select Dropdown) */}
              <div className="mb-3">
                <label className="text-xs font-medium text-gray-400 mb-1 block">
                  Game Genre <span className="text-red-400">*</span>
                </label>
                <select
                  name="genre"
                  value={form.genre}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#020617] border border-white/10 rounded-lg text-sm outline-none text-white focus:border-yellow-400"
                >
                  <option value="" disabled>
                    -- Select Game Genre --
                  </option>
                  {GAME_GENRES.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-1">
                  The kind of game you're making — shown on your devlog so
                  readers know the context.
                </p>
              </div>

              {/* Tags (Ubah menjadi Checklist dengan struktur Pills samping) */}
              <div className="mb-4">
                <label className="text-xs font-medium text-gray-400 mb-1 block">
                  Tags <span className="text-red-400">*</span>
                </label>

                <div className="space-y-3 bg-[#020617] p-3 rounded-lg border border-white/5">
                  {Object.entries(TAG_CATEGORIES).map(
                    ([categoryName, tags]) => (
                      <div key={categoryName}>
                        <span className="text-[11px] font-semibold text-gray-500 tracking-wider block mb-1.5 uppercase">
                          {categoryName}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => {
                            const isChecked = form.tag.includes(tag);
                            return (
                              <button
                                type="button"
                                key={tag}
                                onClick={() => handleTagCheck(tag)}
                                className={`cursor-pointer text-xs px-3 py-1 rounded-full border transition-all duration-150 ${
                                  isChecked
                                    ? "bg-yellow-400/20 border-yellow-400 text-yellow-400 font-medium"
                                    : "border-white/10 text-gray-400 bg-white/[0.02] hover:border-white/30"
                                }`}
                              >
                                {tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ),
                  )}
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Select platforms, engine tools, or current team state relevant
                  to this development post.
                </p>
              </div>

              {/* COVER IMAGE */}
              <label className="text-xs font-medium text-gray-400 mb-2 block">
                Cover Image <span className="text-red-400">*</span>
              </label>

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative overflow-hidden border-2 border-dashed rounded-xl transition-all duration-200
                  ${
                    isDragging
                      ? "border-yellow-400 bg-yellow-400/10 scale-[1.01]"
                      : "border-white/10 hover:border-yellow-400/50 hover:bg-white/[0.02]"
                  }`}
              >
                <input
                  required
                  ref={fileInputRef}
                  type="file"
                  name="cover_image"
                  accept="image/*"
                  onClick={(e) => (e.target.value = null)}
                  onChange={handleChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />

                {preview ? (
                  <div className="relative group">
                    <img
                      src={preview}
                      alt="Cover Preview"
                      className="w-full h-52 object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur px-3 py-1 rounded-full text-xs text-white">
                      Change Image
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                      <span className="text-white text-sm font-medium">
                        Click or drop another image
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <svg
                      className="w-10 h-10 mb-3 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                      />
                    </svg>
                    <p className="text-sm text-gray-300">
                      Drag & drop cover image here
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, WEBP • Recommended 16:9
                    </p>
                  </div>
                )}
              </div>

              <p className="text-[10px] text-gray-500 mt-2 mb-4">
                Appears at the top of your devlog and in feed previews.
              </p>

              {/* MEDIA */}
              <label className="text-xs font-medium text-gray-400 mb-2 block">
                Additional Media
              </label>

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
                className={`relative overflow-hidden border-2 border-dashed rounded-xl transition-all duration-200
                  ${
                    isDraggingMedia
                      ? "border-yellow-400 bg-yellow-400/10 scale-[1.01]"
                      : "border-white/10 hover:border-yellow-400/50 hover:bg-white/[0.02]"
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

                <label
                  htmlFor="mediaUpload"
                  className="cursor-pointer flex flex-col items-center justify-center py-10 px-4"
                >
                  <svg
                    className="w-10 h-10 mb-3 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                    />
                  </svg>
                  <p className="text-sm text-gray-300">
                    Drag & drop media files here
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Images & Videos • Max 8 files
                  </p>
                </label>

                {mediaPreview.length > 0 && (
                  <>
                    <div className="border-t border-white/10" />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-300">
                          Selected Media
                        </h4>
                        <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-gray-400">
                          {mediaPreview.length} file
                          {mediaPreview.length > 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
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
                                  className="w-full h-28 object-cover"
                                />
                              ) : (
                                <img
                                  src={m.url}
                                  alt=""
                                  className="w-full h-28 object-cover"
                                />
                              )}

                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition" />

                              <button
                                type="button"
                                onClick={() => {
                                  setMediaFiles((prev) =>
                                    prev.filter((_, idx) => idx !== i),
                                  );
                                  setMediaPreview((prev) =>
                                    prev.filter((_, idx) => idx !== i),
                                  );
                                }}
                                className="cursor-pointer absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition"
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <p className="text-[10px] text-gray-500 mt-2 mb-4">
                Screenshots or short clips that illustrate the update. Videos up
                to 20MB • Maximum 8 files.
              </p>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 p-4 border-t border-white/10 bg-[#0f172a] sticky bottom-0">
              <button
                onClick={() => setShowModal(false)}
                className="cursor-pointer px-4 py-2 text-sm text-gray-400 hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={submitting}
                className="cursor-pointer bg-blue-400 hover:bg-blue-300 text-black px-4 py-2 rounded-lg text-sm font-semibold"
              >
                {submitting ? "Saving to Draft..." : "Save"}
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="cursor-pointer bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded-lg text-sm font-semibold"
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
