import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import api from "../services/api";
import { sanitizeFields } from "../utils/sanitize";

const MB = 1024 * 1024;
const MAX_IMAGE = 5 * MB;
const MAX_VIDEO = 30 * MB;
const MAX_FILES = 6;
const ACCEPT = "image/*,video/*";

const PostArt = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "Open",
    tag: "",
    category: "art",
  });

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
      if (!isImg && !isVid) {
        rejected.push(`${f.name} (only images or videos)`);
        continue;
      }
      const cap = isVid ? MAX_VIDEO : MAX_IMAGE;
      if (f.size > cap) {
        const capMB = cap / MB;
        rejected.push(`${f.name} (max ${capMB}MB for ${isVid ? "videos" : "images"})`);
        continue;
      }
      accepted.push(f);
    }

    if (accepted.length) setFiles((prev) => [...prev, ...accepted]);
    if (rejected.length) alert("Some files were skipped:\n" + rejected.join("\n"));
  };

  const removeFile = (index) => {
  setFiles((prevFiles) => {
    const newFiles = prevFiles.filter((_, i) => i !== index);
    return newFiles;
  });

  setPreviews((prevPreviews) => {
    URL.revokeObjectURL(prevPreviews[index]);
    return prevPreviews.filter((_, i) => i !== index);
  });
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

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const isVideo = (file) => file.type.startsWith("video/");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = sanitizeFields(form, ["title", "description", "tag"]);
    if (!payload.title) {
      alert("Title is required");
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

      alert("Art + media uploaded!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d1f] text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 animate-fade-in-up">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors duration-200 mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back
        </button>

        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl font-bold">Post New Artwork</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Share your concept art with the community
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title — full width */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-400 mb-1 block">
              Artwork Title <span className="text-red-400">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Cyber Samurai"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-yellow-500/50 focus:bg-white/[0.07] outline-none text-base text-gray-100 placeholder-gray-600 transition-all duration-200"
              required
            />
          </div>

          {/* Two columns: Media (left) + Fields (right) */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* LEFT — Media upload */}
            <div className="lg:flex-1 space-y-3">
              <label className="text-xs font-medium text-gray-400 block">
                Media
                <span className="text-gray-600 ml-1.5">
                  ({files.length} {files.length === 1 ? "file" : "files"})
                </span>
              </label>

              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 ${
                  previews.length > 0 ? "min-h-[140px] sm:min-h-[180px]" : "min-h-[200px] sm:min-h-[280px] lg:min-h-[340px]"
                } ${
                  dragOver
                    ? "border-yellow-500 bg-yellow-500/5"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex flex-col items-center gap-2 text-center px-6">
                  <div className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-300 font-medium">
                    Drag & drop or click to browse
                  </p>
                  <p className="text-[10px] text-gray-600">
                    Images up to 5MB &middot; Videos up to 30MB &middot; Max {MAX_FILES} files
                  </p>
                  <p className="text-[9px] text-gray-700 mt-0.5">
                    PNG, JPG, WEBP, GIF, AVIF, MP4, WEBM, MOV, OGG
                  </p>
                </div>
                <input ref={fileInputRef} type="file" multiple accept={ACCEPT} onChange={handleFileInput} className="hidden" />
              </div>

              {/* Preview grid */}
              {previews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  {previews.map((src, i) => (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-white/5">
                      {isVideo(files[i]) ? (
                        <video src={src} muted className="w-full h-full object-cover" />
                      ) : (
                        <img src={src} className="w-full h-full object-cover" alt="" />
                      )}
                      {isVideo(files[i]) && (
                        <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[8px] font-semibold px-1 py-0.5 rounded">
                          VIDEO
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 text-white text-[10px] flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200"
                      >
                        &times;
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <p className="text-[8px] text-gray-300 truncate">{files[i].name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT — Form fields */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1 block">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your artwork, inspiration, techniques used..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-yellow-500/50 focus:bg-white/[0.07] outline-none text-sm text-gray-200 placeholder-gray-600 resize-none transition-all duration-200"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[150px]">
                  <label className="text-xs font-medium text-gray-400 mb-1 block">
                    Tag
                  </label>
                  <input
                    name="tag"
                    value={form.tag}
                    onChange={handleChange}
                    placeholder="e.g. Fantasy, Sci-Fi"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-yellow-500/50 focus:bg-white/[0.07] outline-none text-sm text-gray-200 placeholder-gray-600 transition-all duration-200"
                  />
                </div>
                <div className="w-32">
                  <label className="text-xs font-medium text-gray-400 mb-1 block">
                    Visibility
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full px-3 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-yellow-500/50 focus:bg-white/[0.07] outline-none text-sm text-gray-200 transition-all duration-200 appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 10px center",
                      backgroundSize: "14px",
                    }}
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                  loading
                    ? "bg-yellow-500/50 text-black/50 cursor-not-allowed"
                    : "bg-yellow-500 text-black hover:bg-yellow-400"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Publish Artwork
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostArt;
