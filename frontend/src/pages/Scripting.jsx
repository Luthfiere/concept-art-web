import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { sanitizeFields, sanitizeText, parseTags } from "../utils/sanitize";
import { isModerator } from "../services/api";

const API_BASE = "/api";
const MAX_FILES = 3;
const MAX_SIZE = 2 * 1024 * 1024;

const ALLOWED_EXTS = [
  ".js", ".jsx", ".ts", ".tsx", ".cs", ".cpp", ".c", ".h", ".hpp", ".py", ".gd", ".java", ".lua", ".rb", ".php", ".json", ".shader", ".hlsl", ".glsl", ".txt",
];

// Pilihan tag untuk scripting
const AVAILABLE_TAGS = [
  "Unity", "Godot", "Unreal Engine", "Roblox", "Web",
  "C#", "GDScript", "C++", "JavaScript", "TypeScript", "Python", "Lua",
  "Physics", "UI", "AI", "Multiplayer", "Shaders", "Animation", "Optimization"
];

const ArrowUpIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
  </svg>
);

const ChatBubbleIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
  </svg>
);

const EyeIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5 nudge-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const PaperclipIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
  </svg>
);

const Scripting = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const isLoggedIn = !!localStorage.getItem("token");
  const moderator = isModerator();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    body: "",
    code_snippet: "",
    tag: "",
  });
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Menutup dropdown checklist jika pengguna mengklik di luar area dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowTagDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/script`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const result = await res.json();
      setQuestions(result.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return questions.filter((item) => {
      if (!q) return true;
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchTags = (item.tags || item.tag)?.toLowerCase().includes(q);
      return matchTitle || matchTags;
    });
  }, [questions, search]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleTagCheck = (tagValue) => {
    const currentTags = form.tag ? form.tag.split(",").map(t => t.trim()).filter(Boolean) : [];
    let updatedTags;
    if (currentTags.includes(tagValue)) {
      updatedTags = currentTags.filter(t => t !== tagValue);
    } else {
      updatedTags = [...currentTags, tagValue];
    }
    setForm({ ...form, tag: updatedTags.join(", ") });
  };

  const selectedTagsArray = useMemo(() => {
    return form.tag ? form.tag.split(",").map(t => t.trim()).filter(Boolean) : [];
  }, [form.tag]);

  const addFiles = (incoming) => {
    const accepted = [];
    const rejected = [];
    Array.from(incoming).forEach((f) => {
      if (files.length + accepted.length >= MAX_FILES) {
        rejected.push(`${f.name} (max ${MAX_FILES} files)`);
        return;
      }

      const fileExt = f.name.substring(f.name.lastIndexOf(".")).toLowerCase();
      if (!ALLOWED_EXTS.includes(fileExt)) {
        rejected.push(`${f.name} (invalid script type)`);
        return;
      }

      if (f.size > MAX_SIZE) {
        rejected.push(`${f.name} (max 2MB)`);
        return;
      }
      accepted.push(f);
    });
    if (accepted.length) setFiles((prev) => [...prev, ...accepted]);
    if (rejected.length)
      alert("Some files were skipped:\n" + rejected.join("\n"));
  };

  const removeFile = (i) =>
    setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const openModal = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must login first!");
      navigate("/login");
      return;
    }

    setForm({ title: "", body: "", code_snippet: "", tag: "" });
    setFiles([]);
    setError("");
    setShowTagDropdown(false);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const payload = sanitizeFields(
      {
        title: form.title,
        content: form.body,
        code_snippet: form.code_snippet || "",
        tag: form.tag,
      },
      ["title", "content", "tag", "code_snippet"],
    );

    if (!payload.title.trim()) return setError("Title is required.");
    if (!payload.content.trim())
      return setError("Please describe your question.");
    if (!payload.tag.trim()) return setError("Please select at least one tag.");

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/script`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to post question");

      const newId = result.data?.id;
      if (files.length > 0 && newId) {
        const mediaForm = new FormData();
        files.forEach((f) => mediaForm.append("media", f));

        const mediaRes = await fetch(
          `${API_BASE}/script-media/question/${newId}`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: mediaForm,
          },
        );
        const mediaResult = await mediaRes.json();
        if (!mediaRes.ok)
          throw new Error(
            mediaResult.message || "Failed to upload attached files",
          );
      }

      setShowModal(false);
      fetchQuestions();
    } catch (err) {
      setError(err.message || "Failed to post question");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuestionClick = (questionId) => {
    fetch(`${API_BASE}/script/${questionId}/view`, {
      method: "POST",
    }).catch((err) => console.error("Failed to increment view:", err));

    navigate(`/scripting/${questionId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] to-[#0b0f2a] text-white break-words [overflow-wrap:anywhere]">
      <Navbar />

      <div className="mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-[3px] h-6 rounded-sm bg-gradient-to-b from-yellow-400 to-amber-500" />
              <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
                Scripting Q&amp;A
              </h1>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm ml-[15px]">
              Ask and answer scripting problems — search and classify using tags.
            </p>
          </div>

          {!moderator && (
            <button
              onClick={openModal}
              className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-semibold px-4 py-2.5 rounded-lg shadow-md hover:shadow-yellow-400/30 transition"
            >
              <span className="text-base leading-none">+</span> Ask a question
            </button>
          )}
        </div>

        {/* FILTER TOOLBAR */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search titles or tags (e.g. unity, physics)…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:border-yellow-500/50 focus:bg-white/[0.07] outline-none transition-all duration-200"
              />
            </div>
            <span className="hidden sm:inline text-xs text-gray-500 shrink-0">
              {filtered.length} question{filtered.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {/* LIST */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-white/10 border-t-yellow-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-white/[0.06] rounded-xl">
            <p className="text-white/30 text-sm">
              {questions.length === 0
                ? "No scripting questions yet. Be the first to ask."
                : "No questions match your search."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {filtered.map((q, i) => {
              return (
                <div
                  key={q.id}
                  onClick={() => handleQuestionClick(q.id)}
                  style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
                  className="animate-fade-in-up group relative bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden cursor-pointer hover:bg-white/[0.06] hover:border-white/10 transition-all duration-200"
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center flex-wrap gap-1.5 mb-2.5">
                      {parseTags(q.tags || q.tag).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10 font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <h3 className="font-semibold text-[15px] text-gray-100 line-clamp-2 group-hover:text-white transition-colors duration-200">
                      {q.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                      {q.content || q.body}
                    </p>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <ArrowUpIcon /> {q.votes || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <ChatBubbleIcon /> {q.answers ?? q.answer_count ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <EyeIcon /> {q.views || 0}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-600 truncate max-w-[100px]">
                        {q.username || "user"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ASK QUESTION MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !submitting)
              setShowModal(false);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#0f1323] border border-white/10 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="px-5 sm:px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">
                Ask a scripting question
              </h2>
              <button
                onClick={() => !submitting && setShowModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. [Godot] Why does move_and_slide collide strangely?"
                  className="w-full px-3 py-2.5 bg-[#0a0d1a] border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/40 transition"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">
                  Details <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="body"
                  value={form.body}
                  onChange={handleChange}
                  rows={4}
                  placeholder="What have you tried, what error do you get, and describe your objective..."
                  className="w-full px-3 py-2.5 bg-[#0a0d1a] border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/40 transition resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">
                  Code Snippet (Optional)
                </label>
                <textarea
                  name="code_snippet"
                  value={form.code_snippet}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Paste your code block here..."
                  className="w-full px-3 py-2.5 bg-[#0a0d1a] border border-white/10 rounded-lg font-mono text-xs text-yellow-300 placeholder-gray-600 outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/40 transition resize-none"
                />
              </div>

              {/* DROPDOWN CHECKLIST FOR TAGS */}
              <div className="relative" ref={dropdownRef}>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">
                  Tags <span className="text-red-400">*</span>
                </label>
                
                {/* Trigger Button Dropdown */}
                <button
                  type="button"
                  onClick={() => setShowTagDropdown(!showTagDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-[#0a0d1a] border border-white/10 rounded-lg text-sm text-left text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/40 transition"
                >
                  <span className={selectedTagsArray.length === 0 ? "text-gray-500" : "text-white"}>
                    {selectedTagsArray.length === 0 
                      ? "-- Select Question Tags --" 
                      : `Selected (${selectedTagsArray.length})`}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${showTagDropdown ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {/* List badge tags yang sedang terpilih */}
                {selectedTagsArray.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedTagsArray.map((t) => (
                      <span 
                        key={t} 
                        className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 font-medium flex items-center gap-1"
                      >
                        {t}
                        <span 
                          className="cursor-pointer font-bold text-gray-400 hover:text-white"
                          onClick={() => handleTagCheck(t)}
                        >
                          &times;
                        </span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Dropdown Menu Overlay List */}
                {showTagDropdown && (
                  <div className="absolute left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto bg-[#0a0d1a] border border-white/10 rounded-lg shadow-xl p-2 space-y-0.5 custom-scrollbar">
                    {AVAILABLE_TAGS.map((tag) => {
                      const isChecked = selectedTagsArray.includes(tag);
                      return (
                        <label
                          key={tag}
                          className={`flex items-center gap-3 px-2.5 py-2 rounded-md cursor-pointer text-sm select-none transition ${
                            isChecked ? "bg-white/5 text-yellow-400" : "text-gray-300 hover:bg-white/[0.03]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTagCheck(tag)}
                            className="w-4 h-4 rounded border-white/10 bg-[#020617] text-yellow-500 focus:ring-0 focus:ring-offset-0 accent-yellow-400"
                          />
                          <span>{tag}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
                
                <p className="text-[10px] text-gray-500 mt-1">
                  Select game engine, language, or system tags related to your script problem.
                </p>
              </div>

              {/* ATTACH CODE FILES AREA */}
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">
                  Attach Script Files (.gd, .js, .cs, .py, .txt)
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
                  }}
                  className={`border-2 border-dashed rounded-xl p-4 text-center transition cursor-pointer ${
                    dragging
                      ? "border-yellow-400 bg-yellow-400/5"
                      : "border-white/10 hover:border-white/20 bg-white/[0.01]"
                  }`}
                  onClick={() => document.getElementById("file-input").click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) addFiles(e.target.files);
                    }}
                  />
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-gray-400">
                      <PaperclipIcon />
                    </span>
                    <p className="text-xs text-gray-300 font-medium">
                      Click or Drag script files here
                    </p>
                    <p className="text-[10px] text-gray-500">
                      Max 3 files, up to 2MB each
                    </p>
                  </div>
                </div>

                {/* ATTACHED FILES LIST */}
                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.map((f, i) => {
                      const ext = f.name
                        .substring(f.name.lastIndexOf("."))
                        .replace(".", "")
                        .toUpperCase();
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2.5 bg-white/5 border border-white/10 rounded-lg text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="px-1.5 py-0.5 font-mono font-bold rounded bg-yellow-400/20 text-yellow-400 text-[10px]">
                              {ext || "FILE"}
                            </span>
                            <p className="text-gray-300 truncate font-medium" title={f.name}>
                              {f.name}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="text-gray-500 hover:text-red-400 text-sm font-bold px-1"
                          >
                            &times;
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => !submitting && setShowModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm font-medium py-2.5 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed text-black text-sm font-semibold py-2.5 rounded-lg transition"
                >
                  {submitting ? "Posting…" : "Post question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scripting;