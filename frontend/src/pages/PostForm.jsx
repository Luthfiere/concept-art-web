import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import api from "../services/api";

const PostForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type") || "post";
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "Open",
    tag: "",
    category: "post",
  });

  // Set category from URL param on mount
  useEffect(() => {
    if (typeParam === "community" || typeParam === "post") {
      setForm((prev) => ({ ...prev, category: typeParam }));
    }
  }, [typeParam]);

  const isCommunity = form.category === "community";

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

  const isVideo = (file) => file.type.startsWith("video/");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) {
      alert("Title is required");
      return;
    }
    if (!form.description) {
      alert("Description is required for a post");
      return;
    }
    setLoading(true);

    const payload = {
      ...form,
      category: form.category,
    };

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

      alert("Post uploaded!");
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

      <div className="max-w-2xl mx-auto px-6 py-6 animate-fade-in-up">
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

        {/* Card container */}
        <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
          {/* Header bar */}
          <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
            <h1 className="text-base font-semibold">
              {isCommunity ? "Community Post" : "Share an Idea"}
            </h1>

            {/* Category toggle */}
            <div className="flex items-center bg-white/5 rounded-md p-0.5">
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, category: "post" }))
                }
                className={`px-3 py-1 rounded text-[11px] font-medium transition-all duration-200 ${
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
                className={`px-3 py-1 rounded text-[11px] font-medium transition-all duration-200 ${
                  isCommunity
                    ? "bg-emerald-500 text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Community
              </button>
            </div>
          </div>

          {/* Form body */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Title */}
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Title *"
              className="w-full px-0 py-2 bg-transparent border-b border-white/10 focus:border-yellow-500/50 outline-none text-lg text-gray-100 placeholder-gray-600 transition-all duration-200"
              required
            />

            {/* Description — the hero field */}
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder={
                isCommunity
                  ? "What's on your mind? Share a discussion, tutorial, or insight..."
                  : "Describe your game concept, storyline, or collaboration idea..."
              }
              rows={8}
              className="w-full px-0 py-2 bg-transparent outline-none text-sm text-gray-200 placeholder-gray-600 resize-none leading-relaxed"
            />

            {/* Tag + Visibility — inline row */}
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  name="tag"
                  value={form.tag}
                  onChange={handleChange}
                  placeholder={
                    isCommunity
                      ? "Tag: e.g. Discussion, Tutorial"
                      : "Tag: e.g. Game Concept, Storyline"
                  }
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-yellow-500/50 focus:bg-white/[0.07] outline-none text-xs text-gray-200 placeholder-gray-600 transition-all duration-200"
                />
              </div>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-yellow-500/50 outline-none text-xs text-gray-200 transition-all duration-200 appearance-none w-28"
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

            {/* Media attachments — compact */}
            {previews.length > 0 && (
              <div className="flex gap-2 overflow-x-auto p-1 -m-1">
                {previews.map((src, i) => (
                  <div
                    key={i}
                    className="relative group w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-white/5"
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
                    {isVideo(files[i]) && (
                      <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[7px] font-bold px-1 rounded">
                        VID
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-600 hover:bg-red-500 text-white text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom bar: attach + post */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              {/* Attach button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors duration-200"
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
                Attach media
                {files.length > 0 && (
                  <span className="text-gray-600">({files.length})</span>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileInput}
                className="hidden"
              />

              {/* Post button */}
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostForm;
