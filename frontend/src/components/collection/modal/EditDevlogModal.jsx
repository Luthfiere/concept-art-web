import { useState, useRef, useEffect } from "react";
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

// Data Opsi Game Genre
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

// Data Opsi Tags dikelompokkan berdasarkan Kategori
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

const EditDevlogModal = ({ form, setForm, media = [], onClose, onSubmit }) => {
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [existingMedia, setExistingMedia] = useState([]);
  const [deletedMedia, setDeletedMedia] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreview, setMediaPreview] = useState([]);
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);

  const descriptionRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-resize textarea berdasarkan content
  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.style.height = "auto";
      descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
    }
  }, [form.content]);

  // Sync media dari props
  useEffect(() => {
    setExistingMedia(media);
    setDeletedMedia([]);
    setMediaFiles([]);
    setMediaPreview([]);
  }, [media]);

  // Handle URL untuk cover image awal
  useEffect(() => {
    if (form.cover_image && typeof form.cover_image === "string") {
      setPreview(getMediaUrl(form.cover_image));
    } else if (!form.cover_image) {
      setPreview(null);
    }
  }, [form.cover_image]);

  // Cleanup Object URLs untuk menghindari memory leak
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
      mediaPreview.forEach((m) => {
        if (m.url.startsWith("blob:")) URL.revokeObjectURL(m.url);
      });
    };
  }, [preview, mediaPreview]);

  const getMediaUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    return `http://localhost:5000/${path}`;
  };

  const handleDeleteExisting = (id) => {
    setDeletedMedia((prev) => [...prev, id]);
    setExistingMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "cover_image") {
      const file = files[0];
      if (!file) return;

      setForm((prev) => ({ ...prev, cover_image: file }));
      setPreview(URL.createObjectURL(file));
      return;
    }

    // PERBAIKAN: Jika name adalah description, update key 'content' di form
    if (name === "description") {
      setForm((prev) => ({ ...prev, content: value }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // COVER DROP
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    setForm((prev) => ({ ...prev, cover_image: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  // MEDIA
  const handleMediaChange = (e) => {
    processFiles(e.target.files);
  };

  const processFiles = (files) => {
    const newFiles = Array.from(files);

    const previews = newFiles.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type,
    }));

    setMediaFiles((prev) => [...prev, ...newFiles]);
    setMediaPreview((prev) => [...prev, ...previews]);
  };

  const handleRemoveNewMedia = (index) => {
    // Revoke object URL yang dihapus agar hemat memori
    if (mediaPreview[index]?.url.startsWith("blob:")) {
      URL.revokeObjectURL(mediaPreview[index].url);
    }
    setMediaFiles((prev) => prev.filter((_, idx) => idx !== index));
    setMediaPreview((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0f172a] p-6 rounded-xl border border-white/10 shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-lg font-semibold mb-4">Edit Devlog</h2>

        {/* TITLE */}
        <div className="mb-3">
          <label className="text-xs font-medium text-gray-400 mb-1 block">
            Devlog Title <span className="text-red-400">*</span>
          </label>
          <input
            name="title"
            value={form.title || ""}
            onChange={handleChange}
            placeholder="Enter title"
            className="w-full px-3 py-2 bg-[#020617] border border-white/10 rounded-lg text-sm outline-none focus:border-indigo-400"
          />
        </div>

        {/* CONTENT */}
        <div className="mb-3">
          <label
            htmlFor="description"
            className="block mb-1 text-xs font-medium text-gray-400"
          >
            Description
          </label>
          <div className="relative w-full">
            <textarea
              ref={descriptionRef}
              id="description"
              name="description"
              value={form.content || ""}
              onChange={handleChange}
              placeholder="Enter description"
              rows={3}
              className="w-full px-3 py-2 bg-[#020617] border border-white/10 rounded-lg text-sm outline-none focus:border-indigo-400 resize-none overflow-hidden"
            />
          </div>
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
            {GAME_GENRES.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-gray-500 mt-1">
            The kind of game you're making — shown on your devlog so readers
            know the context.
          </p>
        </div>

        {/* Tags (Ubah menjadi Checklist dengan struktur Pills samping) */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-400 mb-1 block">
            Tags <span className="text-red-400">*</span>
          </label>

          <div className="space-y-3 bg-[#020617] p-3 rounded-lg border border-white/5">
            {Object.entries(TAG_CATEGORIES).map(([categoryName, tags]) => (
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
            ))}
          </div>
          <p className="text-[10px] text-gray-500 mt-1">
            Select platforms, engine tools, or current team state relevant to
            this development post.
          </p>
        </div>

        {/* STATUS */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-400 mb-1 block">
            Visibility <span className="text-red-400">*</span>
          </label>
          <select
            name="status"
            value={form.status || "Published"}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-[#020617] border border-white/10 rounded-lg text-sm"
          >
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        {/* COVER IMAGE */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-400 mb-1 block">
            Cover Image
          </label>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative w-full border-2 border-dashed rounded-lg p-4 transition ${
              isDragging
                ? "border-indigo-400 bg-indigo-400/10"
                : "border-white/10 hover:border-indigo-400"
            }`}
          >
            {preview ? (
              <div className="relative group">
                <img
                  src={preview}
                  alt="Cover Preview"
                  className="w-full h-40 object-cover rounded-md"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  name="cover_image"
                  accept="image/*"
                  onChange={handleChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-20"
                />
                <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                  Change
                </div>
              </div>
            ) : (
              <div className="relative h-40 flex flex-col items-center justify-center text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  name="cover_image"
                  accept="image/*"
                  onChange={handleChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <p className="text-sm text-gray-400">
                  Drag & drop cover image or click to upload
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ADDITIONAL MEDIA */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-400 mb-1 block">
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
            className={`relative overflow-hidden border-2 border-dashed rounded-xl p-4 transition ${
              isDraggingMedia
                ? "border-indigo-400 bg-indigo-400/10"
                : "border-white/10 hover:border-indigo-400/50"
            }`}
          >
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleMediaChange}
              className="hidden"
              id="mediaUploadEdit"
            />
            <label
              htmlFor="mediaUploadEdit"
              className="flex flex-col items-center justify-center py-4 cursor-pointer"
            >
              <p className="text-sm text-gray-300">
                Drag & drop media or click to upload
              </p>
            </label>

            {/* EXISTING MEDIA */}
            {existingMedia.length > 0 && (
              <div className="mt-4 border-t border-white/5 pt-3">
                <h3 className="text-xs font-medium text-gray-400 mb-2">
                  Current Media ({existingMedia.length})
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {existingMedia.map((m) => {
                    const isVideo = m.media?.match(/\.(mp4|webm|mov)$/i);
                    return (
                      <div
                        key={m.id}
                        className="relative group rounded-lg overflow-hidden border border-white/10"
                      >
                        {isVideo ? (
                          <video
                            src={getMediaUrl(m.media)}
                            className="w-full h-28 object-cover"
                            controls
                          />
                        ) : (
                          <img
                            src={getMediaUrl(m.media)}
                            alt=""
                            className="w-full h-28 object-cover"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteExisting(m.id)}
                          className="cursor-pointer absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 hover:bg-red-500 text-white text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* NEW MEDIA PREVIEW */}
            {mediaPreview.length > 0 && (
              <div className="mt-4 border-t border-white/5 pt-3">
                <h3 className="text-xs font-medium text-amber-400 mb-2">
                  New Media ({mediaPreview.length})
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {mediaPreview.map((m, i) => {
                    const isVideo = m.type.startsWith("video");
                    return (
                      <div
                        key={i}
                        className="relative group rounded-lg overflow-hidden border border-amber-400/20"
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
                        <button
                          type="button"
                          onClick={() => handleRemoveNewMedia(i)}
                          className="cursor-pointer absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 hover:bg-red-500 text-white text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (
                window.confirm("Are you sure you want to save these changes?")
              ) {
                onSubmit({
                  ...form, // PERBAIKAN: Mengirim semua data teks form ter-update
                  mediaFiles,
                  deletedMedia,
                });
              }
            }}
            className="bg-indigo-400 hover:bg-indigo-300 text-black px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDevlogModal;
