import { useState, useEffect, useRef } from "react";

const BACKEND_URL = "http://localhost:5000";

const TAG_OPTIONS = [
  "Fantasy", "Sci-Fi", "Cyberpunk", "Anime", "Realistic", "Dark Fantasy",
  "Steampunk", "Horror", "Abstract", "Stylized", "Retro / Neon", "Portrait",
  "Landscape", "Character Design", "Concept Art", "Fan Art", "Original",
  "Environment Art", "UI Asset", "Sprite Sheet", "Texture / Material",
  "Pixel Art", "Voxel Art", "Low Poly", "High Poly / Sculpting",
  "Digital Painting", "Vector Art", "3D Render",
];

const EditArtModal = ({ form, setForm, media = [], onClose, onSubmit }) => {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreview, setMediaPreview] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [deletedMedia, setDeletedMedia] = useState([]);

  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const descriptionRef = useRef(null);

  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.style.height = "auto";
      descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
    }
  }, [form.description]);

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

  const toggleTag = (tag) => {
    const currentTags = form.tags || [];
    if (currentTags.includes(tag)) {
      setForm({ ...form, tags: currentTags.filter((t) => t !== tag) });
    } else {
      setForm({ ...form, tags: [...currentTags, tag] });
    }
  };

  useEffect(() => {
    setExistingMedia(media);
  }, [media]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setTagDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#0f1323] p-5 sm:p-6 rounded-2xl max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col gap-4"
      >
        <h2 className="font-bold text-white text-lg">Edit Art</h2>

        {/* TITLE */}
        <div>
          <label
            htmlFor="title"
            className="block mb-1 text-xs font-medium text-gray-400"
          >
            Title
          </label>
          <input
            id="title"
            name="title"
            value={form.title || ""}
            onChange={handleChange}
            placeholder="Enter title"
            className="w-full p-2.5 rounded-lg bg-[#0a0d1a] border border-white/10 text-sm text-gray-200 outline-none focus:border-amber-400/50 transition-colors"
          />
        </div>

        {/* DESCRIPTION (Sudah dipisah div & auto-expand tanpa scrollbar internal) */}
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

        {/* TAGS DROPDOWN */}
        <div className="relative" ref={dropdownRef}>
          <label className="block mb-1 text-xs font-medium text-gray-400">
            Tags
          </label>

          <button
            type="button"
            onClick={() => setTagDropdownOpen(!tagDropdownOpen)}
            className="cursor-pointer w-full flex items-center justify-between p-2.5 rounded-lg bg-[#0a0d1a] border border-white/10 text-sm text-gray-200 text-left outline-none focus:border-amber-400/50 transition-colors"
          >
            <span className="truncate max-w-[90%]">
              {form.tags && form.tags.length > 0
                ? form.tags.join(", ")
                : "Select tags..."}
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${tagDropdownOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {tagDropdownOpen && (
            <div className="absolute z-20 mt-1.5 w-full max-h-48 overflow-y-auto rounded-lg bg-[#12162c] border border-white/10 shadow-xl py-1.5 custom-scrollbar">
              {TAG_OPTIONS.map((tag) => {
                const checked = form.tags?.includes(tag) || false;
                return (
                  <label
                    key={tag}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-200 hover:bg-white/5 cursor-pointer transition-colors duration-150"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTag(tag)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 accent-amber-400 cursor-pointer"
                    />
                    {tag}
                  </label>
                );
              })}
            </div>
          )}
          <p className="text-[11px] text-gray-500 mt-1">
            Pilih satu atau lebih tag yang sesuai.
          </p>
        </div>

        {/* VISIBILITY */}
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1 block">
            Visibility
          </label>
          <div className="relative">
            <select
              name="status"
              value={form.status || "Open"}
              onChange={handleChange}
              className="w-full p-2.5 rounded-lg bg-[#0a0d1a] border border-white/10 outline-none text-sm text-gray-200 transition-all duration-200 appearance-none"
            >
              <option value="Open" className="bg-[#0a0d1f]">Open</option>
              <option value="Closed" className="bg-[#0a0d1f]">Closed</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* MEDIA */}
        <div>
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
              const totalMedia = existingMedia.length + mediaFiles.length + files.length;

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
          >
            <input
              id="mediaUploadEditPost"
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onClick={(e) => { e.target.value = null; }}
              onChange={(e) => {
                const files = Array.from(e.target.files);
                const totalMedia = existingMedia.length + mediaFiles.length + files.length;

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
                cursor-pointer flex flex-col items-center justify-center
                border-2 border-dashed rounded-xl py-8 transition
                ${dragging ? "border-amber-400 bg-amber-400/5" : "border-white/10 hover:border-amber-400/50 hover:bg-white/[0.02]"}
              `}
            >
              <svg
                className="w-8 h-8 mb-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
              </svg>
              <p className="text-sm text-gray-400">Drag & drop media or click to upload</p>
              <p className="text-xs text-gray-500 mt-1">Images & videos • Max 6 files</p>
            </label>
          </div>
        </div>

        {existingMedia.length > 0 && (
          <div>
            <h3 className="text-sm text-gray-400 mb-2">Existing Media</h3>
            <div className="grid grid-cols-3 gap-3">
              {existingMedia.map((m) => {
                const isVideo = m.media?.toLowerCase().endsWith(".mp4") || m.media?.toLowerCase().endsWith(".webm") || m.media?.toLowerCase().endsWith(".mov");
                return (
                  <div key={m.id} className="relative group rounded-lg overflow-hidden border border-white/10">
                    {isVideo ? (
                      <video src={getMediaUrl(m.media)} className="w-full h-28 object-cover" />
                    ) : (
                      <img src={getMediaUrl(m.media)} className="w-full h-28 object-cover" />
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
          </div>
        )}

        {mediaPreview.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {mediaPreview.map((m, i) => {
              const isVideo = m.type.startsWith("video");
              return (
                <div key={i} className="relative rounded-lg overflow-hidden border border-white/10">
                  {isVideo ? (
                    <video src={m.url} className="w-full h-24 object-cover" controls />
                  ) : (
                    <img src={m.url} alt="" className="w-full h-24 object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMediaFiles((prev) => prev.filter((_, idx) => idx !== i));
                      setMediaPreview((prev) => prev.filter((_, idx) => idx !== i));
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

        {/* ACTION BUTTONS */}
        <div className="flex gap-2.5 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer flex-1 bg-white/10 hover:bg-white/15 text-white p-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Are you sure you want to save these changes?")) {
                onSubmit({ mediaFiles, deletedMedia });
              }
            }}
            className="cursor-pointer flex-1 bg-amber-400 hover:bg-amber-300 text-black p-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditArtModal;