import { useState, useEffect, useRef } from "react";

const BACKEND_URL = "";

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
    "Funding & Publisher",
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
    "Collaboration",
  ],
};

const EditPostModal = ({ form, setForm, media = [], onClose, onSubmit }) => {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreview, setMediaPreview] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [deletedMedia, setDeletedMedia] = useState([]);

 
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const tagDropdownRef = useRef(null);

  const availableTags = TAGS_OPTIONS[form.category] || TAGS_OPTIONS.post;

  const descriptionRef = useRef(null);

  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.style.height = "auto";
      descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
    }
  }, [form.description]);

  // Handler untuk mengurus checklist tags
  const handleTagCheck = (tag) => {
    let updatedTags = [...form.tags];
    if (updatedTags.includes(tag)) {
      updatedTags = updatedTags.filter((t) => t !== tag);
    } else {
      updatedTags.push(tag);
    }
    setForm({ ...form, tags: updatedTags });
  };

  // Efek untuk menutup dropdown jika user mengklik di luar area dropdown tags
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        tagDropdownRef.current &&
        !tagDropdownRef.current.contains(event.target)
      ) {
        setIsTagDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getMediaUrl = (path) => {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    return `${BACKEND_URL}/${path}`;
  };

  const handleDeleteExisting = (id) => {
    setDeletedMedia((prev) => [...prev, id]);
    setExistingMedia((prev) => prev.filter((m) => m.id !== id));
  };

  useEffect(() => {
    setExistingMedia(media);
  }, [media]);

  const handleChange = (e) => {
    if (e.target.name === "category") {
      setForm({ ...form, [e.target.name]: e.target.value, tags: [] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#0f1323] p-5 sm:p-6 rounded-2xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="mb-4 font-bold text-white">
          Edit {form.category === "community" ? "Community Post" : "Post"}
        </h2>

        <label htmlFor="title" className="block mb-1 text-sm text-white/70">
          Title
        </label>
        <input
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full mb-3 p-2 bg-[#0a0d1a] text-white rounded-lg pointer-events-auto outline-none border border-white/10"
        />

        <div>
          <label
            htmlFor="description"
            className="block mb-1 text-xs font-medium text-gray-400"
          >
            Description
          </label>
          <textarea
            ref={descriptionRef}
            id="description"
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            placeholder="Enter description"
            rows={3}
            className="w-full p-2.5 rounded-lg bg-[#0a0d1a] border border-white/10 text-sm text-gray-200 outline-none focus:border-amber-400/50 transition-colors resize-none overflow-hidden min-h-[80px]"
          />
        </div>

        {/* Tags (Custom Checklist Dropdown) + Visibility */}
        <div className="flex gap-3 relative mb-4 items-end">
          {/* Custom Multi-Select Dropdown untuk Tags */}
          <div ref={tagDropdownRef} className="flex-1 relative">
            <label className="text-xs font-medium text-gray-400 mb-1 block">
              Tags
            </label>
            {/* Ganti button & span dropdown tags Anda dengan ini */}
            <button
              type="button"
              onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
              className="
                          cursor-pointer
                          w-full h-[42px]
                          flex items-center justify-between
                          px-3
                          rounded-lg
                          bg-[#0a0d1a]
                          border border-white/10
                          text-sm text-gray-200
                          hover:border-white/20
                          focus:border-amber-400/50
                          transition-all
                        "
            >
              {/* Menggunakan form.tags?.length atau memberikan fallback array [] */}
              <span
                className={
                  !form.tags || form.tags.length === 0
                    ? "text-gray-500 truncate"
                    : "text-gray-200 truncate"
                }
              >
                {!form.tags || form.tags.length === 0
                  ? "Select Tags..."
                  : `Tags: ${form.tags.join(", ")}`}
              </span>
              <svg
                className={`w-3 h-3 text-gray-500 transition-transform duration-200 flex-shrink-0 ml-1 ${isTagDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>

            {/* Menu Dropdown Checklist */}
            {isTagDropdownOpen && (
              <div className="absolute z-20 mt-1.5 w-full max-h-40 overflow-y-auto rounded-lg bg-[#12162c] border border-white/10 shadow-xl py-1.5">
                {availableTags.map((tag) => {
                  // Menggunakan fallback array agar includes() tidak error jika tags undefined
                  const checked = (form.tags || []).includes(tag);
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
        </div>

        {/* VISIBILITY */}
        <div className="mb-5">
          <label className="text-xs font-medium text-gray-400 mb-1 block">
            Visibility
          </label>
          <div className="relative">
            <select
              name="status"
              value={form.status || "Open"}
              onChange={handleChange}
              className="
                w-full h-[42px]
                px-3 pr-10
                rounded-lg
                bg-[#0a0d1a]
                border border-white/10
                text-sm text-gray-200
                appearance-none
                hover:border-white/20
                focus:border-amber-400/50
                outline-none
                transition-all
              "
            >
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="category"
            className="block mb-1 text-xs font-medium text-gray-400"
          >
            Category
          </label>

          <div className="relative">
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="
        w-full h-[42px]
        px-3 pr-10
        rounded-lg
        bg-[#0a0d1a]
        border border-white/10
        text-sm text-gray-200
        appearance-none
        outline-none
        hover:border-white/20
        focus:border-amber-400/50
        transition-all
      "
            >
              <option value="post" className="bg-[#0a0d1f]">
                Ideation
              </option>
              <option value="community" className="bg-[#0a0d1f]">
                Community
              </option>
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg
                className="w-3 h-3 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* MEDIA */}
        <label className="block mb-1 text-sm text-white/70">Media</label>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);

            const files = Array.from(e.dataTransfer.files);
            const totalMedia =
              existingMedia.length + mediaFiles.length + files.length;

            if (totalMedia > 6) {
              alert("Maximum 6 files");
              return;
            }

            setMediaFiles((prev) => [...prev, ...files]);

            const previews = files.map((file) => ({
              url: URL.createObjectURL(file),
              type: file.type,
            }));

            setMediaPreview((prev) => [...prev, ...previews]);
          }}
          className="mb-5"
        >
          <input
            id="mediaUploadEditPost"
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onClick={(e) => {
              e.target.value = null;
            }}
            onChange={(e) => {
              const files = Array.from(e.target.files);
              const totalMedia =
                existingMedia.length + mediaFiles.length + files.length;

              if (totalMedia > 6) {
                alert("Maximum 6 files");
                return;
              }

              setMediaFiles((prev) => [...prev, ...files]);

              const previews = files.map((file) => ({
                url: URL.createObjectURL(file),
                type: file.type,
              }));

              setMediaPreview((prev) => [...prev, ...previews]);
            }}
          />

          <label
            htmlFor="mediaUploadEditPost"
            className={`
            cursor-pointer
            flex flex-col items-center justify-center
            border-2 border-dashed
            rounded-xl
            py-8
            transition
            ${
              dragging
                ? "border-amber-400 bg-amber-400/5"
                : "border-white/10 hover:border-amber-400/50 hover:bg-white/[0.02]"
            }
          `}
          >
            <svg
              className="w-8 h-8 mb-2 text-gray-500"
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

            <p className="text-sm text-gray-400">
              Drag & drop media or click to upload
            </p>

            <p className="text-xs text-gray-500 mt-1">
              Images & videos • Max 6 files
            </p>
          </label>
        </div>

        <h3 className="text-sm text-gray-400 mb-2">Existing Media</h3>

        {existingMedia.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            {existingMedia.map((m) => {
              const isVideo =
                m.media?.toLowerCase().endsWith(".mp4") ||
                m.media?.toLowerCase().endsWith(".webm") ||
                m.media?.toLowerCase().endsWith(".mov");

              return (
                <div
                  key={m.id}
                  className="relative group rounded-lg overflow-hidden border border-white/10"
                >
                  {isVideo ? (
                    <video
                      src={getMediaUrl(m.media)}
                      className="w-full h-28 object-cover"
                    />
                  ) : (
                    <img
                      src={getMediaUrl(m.media)}
                      className="w-full h-28 object-cover"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteExisting(m.id)}
                    className="cursor-pointer absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-[2px] rounded opacity-0 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {mediaPreview.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-5">
            {mediaPreview.map((m, i) => {
              const isVideo = m.type.startsWith("video");

              return (
                <div
                  key={i}
                  className="relative rounded-lg overflow-hidden border border-white/10"
                >
                  {isVideo ? (
                    <video
                      src={m.url}
                      className="w-full h-24 object-cover"
                      controls
                    />
                  ) : (
                    <img
                      src={m.url}
                      alt=""
                      className="w-full h-24 object-cover"
                    />
                  )}

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
                    className="cursor-pointer absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 hover:bg-red-500 text-white text-xs"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="cursor-pointer flex-1 bg-white/10 hover:bg-white/20 p-2 text-white rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              const confirmed = window.confirm(
                "Are you sure you want to save these changes?",
              );

              if (confirmed) {
                onSubmit({ mediaFiles, deletedMedia });
              }
            }}
            className="cursor-pointer flex-1 bg-amber-400 hover:bg-amber-300 text-black p-2 rounded-lg font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;
