import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import api from "../services/api";

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
    setFiles((prev) => [...prev, ...incoming]);
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

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const isVideo = (file) => file.type.startsWith("video/");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) {
      alert("Title is required");
      return;
    }
    setLoading(true);

    try {
      const res = await api.post("/concept-arts", form);
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

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Post New Artwork</h1>
          <p className="text-gray-400 mt-1">
            Share your concept art with the community
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* LEFT — Media upload (3/5) */}
            <div className="lg:col-span-3 space-y-4">
              <label className="text-sm font-medium text-gray-300">
                Media ({files.length} {files.length === 1 ? "file" : "files"} selected)
              </label>

              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                  dragOver
                    ? "border-yellow-500 bg-yellow-500/5"
                    : "border-gray-700 bg-[#111427] hover:border-gray-500"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0l-3 3m3-3l3 3M6.75 19.25h10.5A2.25 2.25 0 0019.5 17V7a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 7v10a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <p className="text-sm text-gray-400">
                    Drag & drop or click to browse
                  </p>
                  <p className="text-xs text-gray-600">
                    Images, videos, and documents supported
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>

              {/* Preview grid */}
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-[#111427]">
                      {isVideo(files[i]) ? (
                        <video src={src} muted className="w-full h-full object-cover" />
                      ) : (
                        <img src={src} className="w-full h-full object-cover" alt="" />
                      )}

                      {/* Video badge */}
                      {isVideo(files[i]) && (
                        <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                          VIDEO
                        </span>
                      )}

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        X
                      </button>

                      {/* File name */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition">
                        <p className="text-[10px] text-gray-300 truncate">
                          {files[i].name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT — Form fields (2/5) */}
            <div className="lg:col-span-2 space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Cyber Samurai"
                  className="w-full p-3 rounded-lg bg-[#111427] border border-gray-800 focus:border-yellow-500 outline-none text-sm transition"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your artwork..."
                  rows={4}
                  className="w-full p-3 rounded-lg bg-[#111427] border border-gray-800 focus:border-yellow-500 outline-none text-sm resize-none transition"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block">
                  Tag
                </label>
                <input
                  name="tag"
                  value={form.tag}
                  onChange={handleChange}
                  placeholder="e.g. Fantasy, Sci-Fi"
                  className="w-full p-3 rounded-lg bg-[#111427] border border-gray-800 focus:border-yellow-500 outline-none text-sm transition"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block">
                  Visibility
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-[#111427] border border-gray-800 focus:border-yellow-500 outline-none text-sm transition"
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold text-sm transition ${
                  loading
                    ? "bg-yellow-500/50 text-black/50 cursor-not-allowed"
                    : "bg-yellow-500 text-black hover:bg-yellow-400"
                }`}
              >
                {loading ? "Uploading..." : "Publish Artwork"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostArt;
