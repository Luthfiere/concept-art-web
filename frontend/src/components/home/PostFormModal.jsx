import { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import { sanitizeFields } from "../../utils/sanitize";

const MB = 1024 * 1024;
const MAX_IMAGE = 5 * MB;
const MAX_VIDEO = 30 * MB;
const MAX_DOC = 10 * MB;
const MAX_FILES = 6;
const ACCEPT = "image/*,video/*,.pdf,.doc,.docx,.txt,.rtf,.md,.csv,.ppt,.pptx,.odt,.odp";

const PostFormModal = ({ isOpen, onClose, initialType = "post", onSuccess }) => {
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "Open",
    tag: "",
    category: initialType,
  });

  // Sync category when initialType changes (e.g. switching between Ideation/Community from FAB)
  useEffect(() => {
    if (isOpen) {
      setForm((prev) => ({ ...prev, category: initialType }));
    }
  }, [initialType, isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm({ title: "", description: "", status: "Open", tag: "", category: initialType });
      setFiles([]);
    }
  }, [isOpen, initialType]);

  const isCommunity = form.category === "community";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addFiles = (incoming) => {
    const rejected = [];
    const accepted = [];
    const currentCount = files.length;

    for (const f of incoming) {
      if (accepted.length + currentCount >= MAX_FILES) {
        rejected.push(`${f.name} (max ${MAX_FILES} files)`);
        continue;
      }
      const isImg = f.type.startsWith("image/");
      const isVid = f.type.startsWith("video/");
      const cap = isVid ? MAX_VIDEO : isImg ? MAX_IMAGE : MAX_DOC;
      const label = isVid ? "videos" : isImg ? "images" : "documents";
      if (f.size > cap) {
        rejected.push(`${f.name} (max ${cap / MB}MB for ${label})`);
        continue;
      }
      accepted.push(f);
    }

    if (accepted.length) setFiles((prev) => [...prev, ...accepted]);
    if (rejected.length) alert("Some files were skipped:\n" + rejected.join("\n"));
  };

  const removeFile = (index) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const handleFileInput = (e) => {
    addFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  const isVideo = (file) => file?.type?.startsWith("video/");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = sanitizeFields(form, ["title", "description", "tag"]);
    if (!payload.title) {
      alert("Title is required");
      return;
    }
    if (!payload.description) {
      alert("Description is required for a post");
      return;
    }
    setLoading(true);

    try {
      const res = await api.post("/concept-arts", payload);
      const artId = res.data.art.id;

      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((f) => formData.append("media", f));
        try {
          await api.post(`/art-media/art/${artId}`, formData);
        } catch (uploadErr) {
          await api.delete(`/concept-arts/${artId}`).catch(() => {});
          throw uploadErr;
        }
      }

      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="max-w-2xl w-full mx-4 bg-[#0f1225] border border-white/10 rounded-xl shadow-2xl animate-fade-in-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">
            {isCommunity ? "Community Post" : "Share an Idea"}
          </h2>

          <div className="flex items-center gap-3">
            {/* Category toggle */}
            <div className="flex items-center bg-white/5 rounded-md p-0.5">
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, category: "post" }))
                }
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all duration-200 ${
                  !isCommunity
                    ? "bg-blue-500 text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Ideation
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, category: "community" }))
                }
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all duration-200 ${
                  isCommunity
                    ? "bg-emerald-500 text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Community
              </button>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {/* Title */}
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title *"
            className="w-full px-0 py-2 bg-transparent border-b border-white/10 focus:border-yellow-500/50 outline-none text-lg text-gray-100 placeholder-gray-600 transition-all duration-200"
            required
          />

          {/* Description */}
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder={
              isCommunity
                ? "What's on your mind? Share a discussion, tutorial, or insight..."
                : "Describe your game concept, storyline, or collaboration idea..."
            }
            rows={6}
            className="w-full px-0 py-2 bg-transparent outline-none text-sm text-gray-200 placeholder-gray-600 resize-none leading-relaxed"
          />

          {/* Tag + Visibility */}
          <div className="flex gap-3">
            <input
              name="tag"
              value={form.tag}
              onChange={handleChange}
              placeholder={
                isCommunity
                  ? "Tag: e.g. Discussion, Tutorial"
                  : "Tag: e.g. Game Concept, Storyline"
              }
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-yellow-500/50 focus:bg-white/[0.07] outline-none text-xs text-gray-200 placeholder-gray-600 transition-all duration-200"
            />
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-yellow-500/50 outline-none text-xs text-gray-200 transition-all duration-200 appearance-none w-24"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 8px center",
                backgroundSize: "12px",
              }}
            >
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Attached media preview */}
          {previews.length > 0 && (
            <div className="flex gap-2 overflow-x-auto p-1 -m-1">
              {previews.map((src, i) => (
                <div
                  key={i}
                  className="relative group w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-white/5"
                >
                  {isVideo(files[i]) ? (
                    <video src={src} muted className="w-full h-full object-cover" />
                  ) : (
                    <img src={src} className="w-full h-full object-cover" alt="" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-600 hover:bg-red-500 text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bottom bar */}
          <div className="pt-3 border-t border-white/5 space-y-2">
            <p className="text-[10px] text-gray-600">
              Images up to 5MB &middot; Videos up to 30MB &middot; Docs up to 10MB &middot; Max {MAX_FILES} files
            </p>
            <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159M15.75 15.75l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              Attach
              {files.length > 0 && (
                <span className="text-gray-600">({files.length})</span>
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPT}
              onChange={handleFileInput}
              className="hidden"
            />

            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all duration-200 ${
                loading
                  ? "bg-yellow-500/50 text-black/50 cursor-not-allowed"
                  : "bg-yellow-500 text-black hover:bg-yellow-400"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Posting...
                </>
              ) : (
                "Post"
              )}
            </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostFormModal;
