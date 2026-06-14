import { useState, useRef, useEffect } from "react";

const EditDevlogModal = ({ form, setForm, media = [], onClose, onSubmit }) => {
  const [preview, setPreview] = useState(form.cover_image || null);
  const [isDragging, setIsDragging] = useState(false);

  const [existingMedia, setExistingMedia] = useState([]);
  const [deletedMedia, setDeletedMedia] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreview, setMediaPreview] = useState([]);
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);

  const fileInputRef = useRef();

  useEffect(() => {
    setExistingMedia(media);
    setDeletedMedia([]);
    setMediaFiles([]);
    setMediaPreview([]);
  }, [media]);

  useEffect(() => {
    if (form.cover_image && typeof form.cover_image === "string") {
      setPreview(getMediaUrl(form.cover_image));
    }
  }, [form.cover_image]);

  console.log("FORM", form);
  console.log("COVER", form.cover_image);
  const getMediaUrl = (path) => {
    if (path?.startsWith("http://") || path?.startsWith("https://")) {
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

    setForm({ ...form, [name]: value });
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
            value={form.title}
            onChange={handleChange}
            placeholder=" "
            className="w-full px-3 py-2 bg-[#020617] border border-white/10 rounded-lg text-sm outline-none focus:border-indigo-400"
          />
        </div>

        {/* CONTENT */}
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
            className="w-full px-3 py-2 bg-[#020617] border border-white/10 rounded-lg text-sm outline-none focus:border-indigo-400"
          />
        </div>

        {/* GENRE */}
        <div className="mb-3">
          <label className="text-xs font-medium text-gray-400 mb-1 block">
            Game Genre
          </label>
          <input
            name="genre"
            value={form.genre}
            onChange={handleChange}
            placeholder="e.g. 3D Platformer, FPS, Roguelike"
            className="w-full px-3 py-2 bg-[#020617] border border-white/10 rounded-lg text-sm outline-none focus:border-indigo-400"
          />
          <p className="text-[10px] text-gray-500 mt-1">
            The kind of game you're making — shown on your devlog so readers
            know the context.
          </p>
        </div>

        {/* TAG */}
        <div className="mb-3">
          <label className="text-xs font-medium text-gray-400 mb-1 block">
            Tags
          </label>
          <input
            name="tag"
            value={form.tag}
            onChange={handleChange}
            placeholder="e.g. boss fight, AI, open world"
            className="w-full px-3 py-2 bg-[#020617] border border-white/10 rounded-lg text-sm outline-none focus:border-indigo-400"
          />
          <p className="text-[10px] text-gray-500 mt-1">
            Specific features, systems, or topics covered. Separate multiple
            tags with commas.
          </p>
        </div>

        {/* STATUS */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-400 mb-1 block">
            Visibility <span className="text-red-400">*</span>
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-[#020617] border border-white/10 rounded-lg text-sm"
          >
            <option value="">Select status...</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
          <p className="text-[10px] text-gray-500 mt-1">
            Draft keeps this hidden; Published makes it visible to everyone.
          </p>
        </div>

        {/* COVER */}
        <label className="text-xs font-medium text-gray-400 mb-1 block">
          Cover Image
        </label>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative w-full mb-1 border-2 border-dashed rounded-lg p-4 transition
    ${
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

              {/* CLICK AREA */}
              <input
                ref={fileInputRef}
                type="file"
                name="cover_image"
                accept="image/*"
                onClick={(e) => (e.target.value = null)}
                onChange={handleChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-20"
              />

              {/* BADGE */}
              <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                Change
              </div>

              {/* HOVER OVERLAY */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-md">
                <span className="text-white text-sm font-medium">
                  Click to change image
                </span>
              </div>
            </div>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                name="cover_image"
                accept="image/*"
                onClick={(e) => (e.target.value = null)}
                onChange={handleChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />

              <div className="h-40 flex flex-col items-center justify-center text-center">
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

                <p className="text-sm text-gray-400">Drag & drop cover image</p>

                <p className="text-xs text-gray-600">or click to upload</p>
              </div>
            </>
          )}
        </div>

        <p className="text-[10px] text-gray-500 mb-3">
          Appears at the top of your devlog and in feed previews.
        </p>

        {/* MEDIA */}
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
          className={`
    relative overflow-hidden
    border-2 border-dashed rounded-xl
    transition-all duration-200
    ${
      isDraggingMedia
        ? "border-indigo-400 bg-indigo-400/10"
        : "border-white/10 hover:border-indigo-400/50"
    }
  `}
        >
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleMediaChange}
            className="hidden"
            id="mediaUploadEdit"
          />

          {/* Upload Area */}
          <label
            htmlFor="mediaUploadEdit"
            className="
      flex flex-col items-center justify-center
      py-8 px-4
      cursor-pointer
    "
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

            <p className="text-sm text-gray-300">
              Drag & drop media or click to upload
            </p>

            <p className="text-xs text-gray-500 mt-1">
              Images & videos • Multiple files supported
            </p>
          </label>

          {/* EXISTING MEDIA */}
          {existingMedia.length > 0 && (
            <div className="px-4 pb-4 border-t border-white/5">
              <h3 className="text-xs font-medium text-gray-400 mt-4 mb-3">
                Current Media ({existingMedia.length})
              </h3>

              <div className="grid grid-cols-3 gap-3">
                {existingMedia.map((m) => {
                  const isVideo =
                    m.media?.includes(".mp4") ||
                    m.media?.includes(".webm") ||
                    m.media?.includes(".mov");

                  return (
                    <div
                      key={m.id}
                      className="
                relative group
                rounded-lg overflow-hidden
                border border-white/10
              "
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
                        className="
                  absolute top-2 right-2
                  w-6 h-6
                  rounded-full
                  bg-black/70 hover:bg-red-500
                  text-white text-xs
                  opacity-0 group-hover:opacity-100
                  transition
                "
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
            <div className="px-4 pb-4 border-t border-white/5">
              <h3 className="text-xs font-medium text-amber-400 mt-4 mb-3">
                New Media ({mediaPreview.length})
              </h3>

              <div className="grid grid-cols-3 gap-3">
                {mediaPreview.map((m, i) => {
                  const isVideo = m.type.startsWith("video");

                  return (
                    <div
                      key={i}
                      className="
                relative group
                rounded-lg overflow-hidden
                border border-amber-400/20
              "
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
                        onClick={() => {
                          setMediaFiles((prev) =>
                            prev.filter((_, idx) => idx !== i),
                          );

                          setMediaPreview((prev) =>
                            prev.filter((_, idx) => idx !== i),
                          );
                        }}
                        className="
                  absolute top-2 right-2
                  w-6 h-6
                  rounded-full
                  bg-black/70 hover:bg-red-500
                  text-white text-xs
                  opacity-0 group-hover:opacity-100
                  transition
                "
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

        <p className="text-[10px] text-gray-500 mt-2 mb-3">
          Screenshots, concept art, gameplay clips, or other media related to
          this update.
        </p>

        {/* ACTION */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              const confirmed = window.confirm(
                "Are you sure you want to save these changes?",
              );

              if (confirmed) {
                onSubmit({
                  mediaFiles,
                  deletedMedia,
                });
              }
            }}
            className="bg-indigo-400 hover:bg-indigo-300 text-black px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDevlogModal;
