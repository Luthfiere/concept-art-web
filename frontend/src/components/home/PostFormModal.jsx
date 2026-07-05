import { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import { sanitizeFields } from "../../utils/sanitize";

const MB = 1024 * 1024;
const MAX_IMAGE = 5 * MB;
const MAX_VIDEO = 30 * MB;
const MAX_DOC = 10 * MB;
const MAX_FILES = 6;
const ACCEPT =
  "image/*,video/*,.pdf,.doc,.docx,.txt,.rtf,.md,.csv,.ppt,.pptx,.odt,.odp";


const TAGS_OPTIONS = {
  post: [
    
    "Game Concept", 
    "Storyline", 
    "Character Design", 
    "Level Design", 
    "Mechanics",
    "UI/UX Design",
    "World Building",
    "Programming",
    "Shader/VFX",
    "Optimization",
    "AI & Pathfinding",
    "Plugins & Tools",
    "2D Art",
    "3D Modeling",
    "Pixel Art",
    "Animation",
    "Sound Design",
    "Music/OST",
    "Project Management",
    "Marketing & PR",
    "Funding & Publisher"
  ],
  
  community: [
    
    "Discussion", 
    "Tutorial", 
    "Insight", 
    "Feedback", 
    "Event",
    "General Chat",
    "Q&A / Ask Help",     
    "Recruitment / LFG", 
    "Showcase",          
    "Playtest",          
    "Game Jam",          
    "Industry News",     
    "Collaboration"      
  ],
};

const PostFormModal = ({
  isOpen,
  onClose,
  initialType = "post",
  onSuccess,
}) => {
  const fileInputRef = useRef(null);
  const tagDropdownRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "Open",
    tags: [], 
    category: initialType,
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target)) {
        setIsTagDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync category ketika initialType berubah
  useEffect(() => {
    if (isOpen) {
      setForm((prev) => ({ ...prev, category: initialType, tags: [] }));
    }
  }, [initialType, isOpen]);

  // Reset form ketika modal dibuka
  useEffect(() => {
    if (isOpen) {
      setForm({
        title: "",
        description: "",
        status: "Open",
        tags: [],
        category: initialType,
      });
      setFiles([]);
    }
  }, [isOpen, initialType]);

  const isCommunity = form.category === "community";
  const availableTags = TAGS_OPTIONS[form.category] || [];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handler untuk mengelola checklist pada tags
  const handleTagCheck = (tag) => {
    setForm((prev) => {
      const isChecked = prev.tags.includes(tag);
      const updatedTags = isChecked
        ? prev.tags.filter((t) => t !== tag) // Hapus jika sudah ada
        : [...prev.tags, tag]; // Tambah jika belum ada
      return { ...prev, tags: updatedTags };
    });
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
    if (rejected.length)
      alert("Some files were skipped:\n" + rejected.join("\n"));
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
    

    const formattedTags = form.tags.join(", ");

    const payload = sanitizeFields(
      { ...form, tag: formattedTags }, 
      ["title", "description", "tag"]
    );

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

  // Lock body scroll ketika modal terbuka
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
                  setForm((prev) => ({ ...prev, category: "post", tags: [] }))
                }
                className={`cursor-pointer px-2.5 py-1 rounded text-[11px] font-medium transition-all duration-200 ${
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
                  setForm((prev) => ({ ...prev, category: "community", tags: [] }))
                }
                className={`cursor-pointer px-2.5 py-1 rounded text-[11px] font-medium transition-all duration-200 ${
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
              className="cursor-pointer w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
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

          {/* Tags (Custom Checklist Dropdown) + Visibility */}
          <div className="flex gap-3 relative">
            
            {/* Custom Multi-Select Dropdown untuk Tags */}
            <div ref={tagDropdownRef} className="flex-1 relative ">
              <button
                type="button"
                onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                className="cursor-pointer w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-left text-xs text-gray-200 outline-none hover:bg-white/[0.07] transition-all duration-200 flex justify-between items-center min-h-[34px] overscroll-y-auto"
              >
                <span className={form.tags.length === 0 ? "text-gray-600" : "text-gray-200"}>
                  {form.tags.length === 0
                    ? "Select Tags..."
                    : `Tags: ${form.tags.join(", ")}`}
                </span>
                <svg
                  className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${isTagDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* Menu Dropdown Checklist */}
              {isTagDropdownOpen && (
                <div className="absolute z-20 mt-1.5 w-full max-h-25 overflow-y-auto rounded-lg bg-[#12162c] border border-white/10 shadow-xl py-1.5">
                  {availableTags.map((tag) => {
                    const checked = form.tags.includes(tag);
                    return (
                      <label
                        key={tag}
                        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-white/5 text-xs text-gray-200 cursor-pointer select-none transition-colors duration-150"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleTagCheck(tag)}
                          className="w-3.5 h-3.5 rounded border-white/20 bg-transparent text-yellow-500 focus:ring-0 focus:ring-offset-0 accent-yellow-500"
                        />
                        <span>{tag}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Visibility Status */}
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
              <option value="Open" className="bg-[#0a0d1f] text-gray-200">
                Open
              </option>
              <option value="Closed" className="bg-[#0a0d1f] text-gray-200">
                Closed
              </option>
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
                    <video
                      src={src}
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={src}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="cursor-pointer absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-600 hover:bg-red-500 text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
              Images up to 5MB &middot; Videos up to 30MB &middot; Docs up to
              10MB &middot; Max {MAX_FILES} files
            </p>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159M15.75 15.75l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                  />
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
                className={`cursor-pointer px-6 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all duration-200 ${
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