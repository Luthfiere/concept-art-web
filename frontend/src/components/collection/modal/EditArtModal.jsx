import { useState, useEffect } from "react";

const BACKEND_URL = "http://localhost:5000";

const EditArtModal = ({ form, setForm, media = [], onClose, onSubmit }) => {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreview, setMediaPreview] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [deletedMedia, setDeletedMedia] = useState([]);

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
    console.log("media: ", media);
  }, [media]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(e) => {
        e.stopPropagation(); // 🔥 penting
        if (e.target === e.currentTarget) onClose();
      }}
      onClick={(e) => e.stopPropagation()} // 🔥 tambah ini juga
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#0f1323] p-5 sm:p-6 rounded-2xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="mb-4 font-bold">Edit Art</h2>

        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full mb-3 p-2 bg-[#0a0d1a] pointer-events-auto"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full mb-3 p-2 bg-[#0a0d1a] pointer-events-auto"
        />

        <input
          name="tag"
          value={form.tag}
          onChange={handleChange}
          placeholder="Tag"
          className="w-full mb-3 p-2 bg-[#0a0d1a] pointer-events-auto"
        />

        {/* CATEGORY */}
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full mb-4 p-2 bg-[#0a0d1a] pointer-events-auto"
        >
          <option value="art">Art</option>
          <option value="post">Post</option>
          <option value="community">Community</option>
        </select>

        {/* MEDIA */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => {
            setDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);

            const files = Array.from(e.dataTransfer.files);

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
            id="mediaUploadEdit"
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

              if (mediaFiles.length + files.length > 6) {
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
            htmlFor="mediaUploadEdit"
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
                    className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-[2px] rounded opacity-0 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* PREVIEW */}
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
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 hover:bg-red-500 text-white text-xs"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-white/10 hover:bg-white/20 p-2 rounded-lg"
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
            className="flex-1 bg-amber-400 hover:bg-amber-300 text-black p-2 rounded-lg font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditArtModal;
