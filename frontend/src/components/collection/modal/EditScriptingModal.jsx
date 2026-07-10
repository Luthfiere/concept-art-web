import { useState, useEffect, useRef } from "react";

const BACKEND_URL = "";

const TAGS_OPTIONS = [
  "Unity",
  "Godot",
  "Unreal Engine",
  "Roblox",
  "Web",
  "C#",
  "GDScript",
  "C++",
  "JavaScript",
  "TypeScript",
  "Python",
  "Lua",
  "Physics",
  "UI",
  "AI",
  "Multiplayer",
  "Shaders",
  "Animation",
  "Optimization",
];

const EditScriptingModal = ({
  form,
  setForm,
  media = [],
  onClose,
  onSubmit,
}) => {
  const contentRef = useRef(null);
  const codeRef = useRef(null);
  const tagDropdownRef = useRef(null);

  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [existingMedia, setExistingMedia] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreview, setMediaPreview] = useState([]);
  const [deletedMedia, setDeletedMedia] = useState([]);

  useEffect(() => {
    if (media) {
      setExistingMedia(media);
    }
    setMediaFiles([]);
    setMediaPreview([]);
    setDeletedMedia([]);
  }, [media]);

  const currentTags = form.tag
    ? form.tag
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = "auto";
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
    }
  }, [form.content]);

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTagCheck = (tag) => {
    let updatedTags = [...currentTags];
    if (updatedTags.includes(tag)) {
      updatedTags = updatedTags.filter((t) => t !== tag);
    } else {
      updatedTags.push(tag);
    }
    setForm({ ...form, tag: updatedTags.join(", ") });
  };

  const getMediaUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${BACKEND_URL}/${path}`;
  };

  const handleFileProcess = (files) => {
    const totalCurrentCount =
      existingMedia.length + mediaFiles.length + files.length;
    if (totalCurrentCount > 3) {
      alert("Maximum 3 files are allowed for scripting media.");
      return;
    }

    setMediaFiles((prev) => [...prev, ...files]);

    const previews = files.map((file) => {
      const isImage = file.type.startsWith("image/");
      return {
        url: URL.createObjectURL(file),
        name: file.name,
        isImage: isImage,
      };
    });
    setMediaPreview((prev) => [...prev, ...previews]);
  };

  const handleDeleteExisting = (id) => {
    setDeletedMedia((prev) => [...prev, id]);
    setExistingMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const handleDeleteNew = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreview((prev) => prev.filter((_, i) => i !== index));
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
        className="w-full max-w-lg bg-[#0f1323] p-5 sm:p-6 rounded-2xl max-h-[90vh] overflow-y-auto border border-amber-500/20"
      >
        <h2 className="mb-4 font-bold text-white flex items-center gap-2 text-base">
          <span className="text-amber-400">&lt;/&gt;</span> Edit Scripting
          Question
        </h2>
        {/* Title */}
        <div className="mb-3">
          <label
            htmlFor="title"
            className="block mb-1 text-xs font-medium text-gray-400"
          >
            Title
          </label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g., heheheha"
            className="w-full p-2.5 bg-[#0a0d1a] text-white rounded-lg outline-none border border-white/10 text-sm focus:border-amber-400/50"
          />
        </div>
        {/* Content */}
        <div className="mb-3">
          <label
            htmlFor="content"
            className="block mb-1 text-xs font-medium text-gray-400"
          >
            Content / Explanation
          </label>
          <textarea
            ref={contentRef}
            id="content"
            name="content"
            value={form.content || ""}
            onChange={handleChange}
            placeholder="e.g., kocakjugaguwe"
            rows={3}
            className="w-full p-2.5 rounded-lg bg-[#0a0d1a] border border-white/10 text-sm text-gray-200 outline-none focus:border-amber-400/50 transition-colors resize-none overflow-hidden min-h-[80px]"
          />
        </div>
        {/* Code Snippet */}
        <div className="mb-3">
          <label
            htmlFor="code_snippet"
            className="block mb-1 text-xs font-medium text-gray-400"
          >
            Code Snippet
          </label>
          <div className="relative rounded-lg overflow-hidden border border-white/10 bg-[#05070f]">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0e111a] border-b border-white/5 text-[10px] text-gray-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-red-500/60" />
              <span className="w-2 h-2 rounded-full bg-yellow-500/60" />
              <span className="w-2 h-2 rounded-full bg-green-500/60" />
              <span className="ml-2 font-semibold text-gray-400">
                editor_snippet.js
              </span>
            </div>
            <textarea
              ref={codeRef}
              id="code_snippet"
              name="code_snippet"
              value={form.code_snippet || ""}
              onChange={handleChange}
              placeholder="// Paste your code here..."
              rows={5}
              className="w-full p-3 bg-transparent text-amber-200 font-mono text-xs outline-none resize-y min-h-[120px] leading-relaxed tab-size-2"
              style={{ tabSize: 2 }}
            />
          </div>
        </div>
        {/* Tag Selector */}
        <div ref={tagDropdownRef} className="relative mb-4">
          <label className="block mb-1 text-xs font-medium text-gray-400">
            Tags
          </label>
          <button
            type="button"
            onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
            className="w-full h-[42px] flex items-center justify-between px-3 rounded-lg bg-[#0a0d1a] border border-white/10 text-sm text-gray-200 hover:border-white/20 focus:border-amber-400/50 outline-none transition-all text-left"
          >
            <span
              className={
                currentTags.length === 0
                  ? "text-gray-500 truncate"
                  : "text-gray-200 truncate"
              }
            >
              {currentTags.length === 0
                ? "Select Tags..."
                : currentTags.join(", ")}
            </span>
            <svg
              className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${isTagDropdownOpen ? "rotate-180" : ""}`}
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

          {isTagDropdownOpen && (
            <div className="absolute z-50 mt-1.5 w-full max-h-40 overflow-y-auto rounded-lg bg-[#12162c] border border-white/10 shadow-xl py-1.5">
              {TAGS_OPTIONS.map((tag) => (
                <label
                  key={tag}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-md hover:bg-white/5 text-xs text-gray-200 cursor-pointer select-none transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={currentTags.includes(tag)}
                    onChange={() => handleTagCheck(tag)}
                    className="w-4 h-4 rounded border-white/20 bg-transparent text-amber-500 focus:ring-0 accent-amber-500 cursor-pointer"
                  />
                  <span>{tag}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        {/* MEDIA DRAG & DROP AREA */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFileProcess(Array.from(e.dataTransfer.files));
          }}
          className="mb-4"
        >
          <label className="block mb-1 text-xs font-medium text-gray-400">
            Attachments (Max 3 Files)
          </label>
          <input
            id="scripting-media-input"
            type="file"
            multiple
            accept="image/*,'.js', '.jsx', '.ts', '.tsx', '.cs', '.cpp', '.c', '.h', '.hpp',
                        '.py', '.gd', '.java', '.lua', '.rb', '.php', '.json',
                        '.shader', '.hlsl', '.glsl', '.txt',"
            className="hidden"
            onChange={(e) => handleFileProcess(Array.from(e.target.files))}
          />
          <label
            htmlFor="scripting-media-input"
            className={`cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-6 transition-all ${dragging ? "border-amber-400 bg-amber-400/5" : "border-white/10 hover:border-amber-400/40 bg-[#0a0d1a]"}`}
          >
            <svg
              className="w-6 h-6 text-gray-500 mb-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
              />
            </svg>
            <p className="text-xs text-gray-400">
              Click or Drag files here to add attachment
            </p>
          </label>
        </div>

        {/* MEDIA PREVIEW LIST */}
        {(existingMedia.length > 0 || mediaPreview.length > 0) && (
          <div className="grid grid-cols-3 gap-2 mb-5">
            {/* Render file yang sudah terunggah di database */}
            {existingMedia.map((m) => {
              const isImg =
                m.media && m.media.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i);
              return (
                <div
                  key={m.id}
                  className="relative group aspect-square rounded-lg overflow-hidden border border-white/10 bg-[#060813] flex flex-col justify-center items-center p-2 text-center"
                >
                  {isImg ? (
                    <img
                      src={getMediaUrl(m.media)}
                      className="w-full h-full object-cover"
                      alt="attachment"
                    />
                  ) : (
                    <div className="flex flex-col items-center w-full px-1">
                      <span className="text-[20px] text-amber-400 mb-1">
                        📄
                      </span>
                      <span className="text-[10px] text-gray-400 truncate w-full font-mono">
                        {m.media ? m.media.split("/").pop() : "File"}
                      </span>
                    </div>
                  )}
                  {/* Tombol Hapus Existing Media */}
                  <button
                    type="button"
                    onClick={() => handleDeleteExisting(m.id)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 hover:bg-red-500 text-white text-[10px] flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>
              );
            })}

            {/* Render file baru yang siap diupload */}
            {mediaPreview.map((m, index) => (
              <div
                key={index}
                className="relative group aspect-square rounded-lg overflow-hidden border border-amber-500/20 bg-[#0c0f20] flex flex-col justify-center items-center p-2 text-center"
              >
                {m.isImage ? (
                  <img
                    src={m.url}
                    className="w-full h-full object-cover opacity-80"
                    alt="new upload"
                  />
                ) : (
                  <div className="flex flex-col items-center w-full px-1">
                    <span className="text-[20px] text-emerald-400 mb-1">
                      📝
                    </span>
                    <span className="text-[10px] text-emerald-300 truncate w-full font-mono">
                      {m.name}
                    </span>
                  </div>
                )}
                <span className="absolute bottom-1 left-1 text-[8px] bg-emerald-500/20 text-emerald-400 px-1 rounded border border-emerald-500/30">
                  New
                </span>
                {/* Tombol Hapus New Media */}
                <button
                  type="button"
                  onClick={() => handleDeleteNew(index)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 hover:bg-red-500 text-white text-[10px] flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-white/10 hover:bg-white/20 p-2 text-white rounded-lg text-sm transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure you want to save code and media changes?",
                )
              )
                onSubmit({ mediaFiles, deletedMedia });
            }}
            className="flex-1 bg-amber-400 hover:bg-amber-300 text-black p-2 rounded-lg font-medium text-sm transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditScriptingModal;
