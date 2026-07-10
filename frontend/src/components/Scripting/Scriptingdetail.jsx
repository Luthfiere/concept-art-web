import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../layout/Navbar";
import api, { isTokenExpired, isModerator } from "../../services/api";
import { parseTags } from "../../utils/sanitize";
import { Trash2 } from "lucide-react";

const API_BASE = "/api";
const BASE_URL = "";

const decodeHtmlEntities = (str) => {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
};

const ArrowLeftIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
    />
  </svg>
);

const ArrowUpIcon = ({ className = "w-5 h-5", filled = false }) => (
  <svg
    className={className}
    fill={filled ? "currentColor" : "none"}
    viewBox="0 0 24 24"
    stroke={filled ? "none" : "currentColor"}
    strokeWidth={2.2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 15.75l7.5-7.5 7.5 7.5"
    />
  </svg>
);

const EyeIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const ChatBubbleIcon = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
    />
  </svg>
);

const CodeIcon = () => (
  <svg
    className="w-5 h-5 text-yellow-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
    />
  </svg>
);

const CopyIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z"
    />
  </svg>
);

export default function ScriptingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [media, setMedia] = useState([]);
  const [answers, setAnswers] = useState([]);

  const [totalLikes, setTotalLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const [newAnswer, setNewAnswer] = useState("");
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const isLoggedIn = !isTokenExpired();
  const storedUser = localStorage.getItem("user");
  const currentUserId = storedUser ? JSON.parse(storedUser).id : null;
  const moderator = isModerator();

  const [previewCode, setPreviewCode] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [newCodeSnippet, setNewCodeSnippet] = useState("");

  const getAvatar = (user) =>
    user?.profile_image
      ? user.profile_image.startsWith("http")
        ? user.profile_image
        : `${BASE_URL}/${user.profile_image}`
      : `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || "user"}`;

  useEffect(() => {
    if (id) {
      fetchQuestionAndLikes();
      fetchAnswersAndMedia();
      fetchComments();
      window.scrollTo({ top: 0 });
    }
  }, [id, currentUserId]);

  const fetchQuestionAndLikes = async () => {
    try {
      const token = localStorage.getItem("token");

      const requests = [
        fetch(`${API_BASE}/script/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
        fetch(`${API_BASE}/likes/scripting/${id}`),
      ];

      if (isLoggedIn) {
        requests.push(
          fetch(`${API_BASE}/likes/scripting/${id}/status`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        );
      }

      const responses = await Promise.all(requests);
      const [scriptRes, likesRes, statusRes] = responses;

      if (!scriptRes.ok)
        throw new Error(
          `Gagal memuat detail script: Status ${scriptRes.status}`,
        );
      const scriptResult = await scriptRes.json();
      setQuestion(scriptResult.data);

      const isAuthor =
        currentUserId &&
        scriptResult.data?.user_id &&
        String(currentUserId) === String(scriptResult.data.user_id);
      if (!isAuthor) {
        fetch(`${API_BASE}/script/${id}/view`, { method: "POST" }).catch(
          () => {},
        );
      }

      if (likesRes.ok) {
        const likesResult = await likesRes.json();

        if (typeof likesResult.count === "number") {
          setTotalLikes(likesResult.count);
        } else if (Array.isArray(likesResult.data)) {
          setTotalLikes(likesResult.data.length);
        } else if (Array.isArray(likesResult)) {
          setTotalLikes(likesResult.length);
        } else {
          setTotalLikes(likesResult.data?.count || 0);
        }
      }
      if (statusRes && statusRes.ok) {
        const statusResult = await statusRes.json();

        const checkStatus =
          statusResult.isLiked ??
          statusResult.liked ??
          statusResult.data?.isLiked ??
          statusResult.data?.liked ??
          false;

        setIsLiked(!!checkStatus);
      } else {
        setIsLiked(false);
      }
    } catch (err) {
      console.error("Error pada fetchQuestionAndLikes:", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to delete comment");
      }

      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Delete comment error:", err);
      alert(err.message || "Failed to delete comment");
    }
  };

  const handleViewFile = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Gagal membaca file");

      const text = await response.text();
      setPreviewCode(text);
      setPreviewTitle(fileName);
      setIsPreviewOpen(true);
    } catch (err) {
      console.error("Error membaca file:", err);
      window.open(fileUrl, "_blank");
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_BASE}/comments/scripting/${id}`);
      if (res.ok) {
        const result = await res.json();
        setComments(result.data || result || []);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const fetchAnswersAndMedia = async () => {
    const token = localStorage.getItem("token");
    try {
      const [mediaRes, answersRes] = await Promise.all([
        fetch(`${API_BASE}/script-media/question/${id}`),
        fetch(`${API_BASE}/script/question/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
      ]);

      if (mediaRes.ok) {
        const mediaData = await mediaRes.json();
        setMedia(mediaData.data || []);
      } else {
        setMedia([]);
      }

      if (answersRes.ok) {
        const answersData = await answersRes.json();
        setAnswers(answersData.data || []);
      } else {
        setAnswers([]);
      }
    } catch (err) {
      console.error("Error pada fetchAnswersAndMedia:", err);
    }
  };

  const handlePostComment = async () => {
    if (requireLogin()) return;
    if (!newComment.trim() || commentLoading) return;

    setCommentLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/comments/scripting/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          comment: newComment.trim(),
          code_snippet: newCodeSnippet.trim() || undefined,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setComments((prev) => [...prev, result.data || result]);
        setNewComment("");
        setNewCodeSnippet("");
      }
    } catch (err) {
      console.error("Error posting comment:", err);
    } finally {
      setCommentLoading(false);
    }
  };

  const requireLogin = () => {
    if (!isLoggedIn) {
      navigate(`/login`);
      return true;
    }
    return false;
  };

  const handleLike = async () => {
    if (requireLogin()) return;
    if (likeLoading) return;
    setLikeLoading(true);

    const token = localStorage.getItem("token");
    try {
      if (!isLiked) {
        const res = await fetch(`${API_BASE}/likes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            entity_type: "scripting",
            entity_id: parseInt(id, 10) || id,
          }),
        });

        if (res.ok) {
          setIsLiked(true);
          setTotalLikes((prev) => prev + 1);
        }
      } else {
        const res = await fetch(`${API_BASE}/likes`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            entity_type: "scripting",
            entity_id: parseInt(id, 10) || id,
          }),
        });

        if (res.ok) {
          setIsLiked(false);
          setTotalLikes((prev) => Math.max(prev - 1, 0));
        }
      }
    } catch (err) {
      console.error("Error liking/unliking:", err);
    } finally {
      setLikeLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Gagal mengunduh file");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error mendownload file:", err);
      window.open(fileUrl, "_blank");
    }
  };

  if (!question) {
    return (
      <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-[#888] text-sm tracking-widest uppercase font-semibold">
          Loading question
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] to-[#0b0f2a] text-white font-sans break-words [overflow-wrap:anywhere]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-20">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-yellow-400 transition-colors duration-200 mb-6"
        >
          <ArrowLeftIcon /> Back to questions
        </button>

        {/* HEADER */}
        <div className="flex items-center flex-wrap gap-2 mb-4">
          {parseTags(question.tags || question.tag).map((t) => (
            <span
              key={t}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-gray-400 border border-white/10"
            >
              #{t}
            </span>
          ))}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-5">
          {question.title}
        </h1>

        {/* META ROW */}
        <div className="flex items-center gap-3 py-4 mb-6 border-y border-white/10">
          <Link
            to={question.user_id ? `/profile/${question.user_id}` : "#"}
            className="flex items-center gap-3 group"
          >
            <img
              src={getAvatar(question)}
              alt="avatar"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-yellow-400/50 transition"
            />
            <div>
              <p className="text-sm font-semibold text-gray-100 leading-tight group-hover:text-yellow-300 transition-colors">
                {question.username}
              </p>
              <p className="text-xs text-gray-500">
                {question.created_at
                  ? new Date(question.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : ""}
              </p>
            </div>
          </Link>

          <div className="flex-1" />

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <ChatBubbleIcon /> {answers.length}
            </span>
            <span className="flex items-center gap-1">
              <EyeIcon /> {question.views || 0}
            </span>
          </div>
        </div>

        {/* BODY + LIKE COLUMN */}
        <div className="flex gap-4 sm:gap-5 mb-6">
          {!moderator && (
            <div className="flex flex-col items-center shrink-0">
              <button
                onClick={handleLike}
                disabled={likeLoading}
                className={`p-2 rounded-lg border transition-colors duration-200 ${
                  isLiked
                    ? "bg-yellow-400 text-black border-yellow-400"
                    : "bg-white/5 text-gray-400 border-white/10 hover:border-yellow-400/40 hover:text-yellow-400"
                } ${likeLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                aria-label={isLiked ? "Unlike" : "Like"}
              >
                <ArrowUpIcon filled={isLiked} />
              </button>
              <span className="text-sm font-semibold mt-1.5">
                {totalLikes} {/* Memperbaiki penayangan data totalLikes baru */}
              </span>
            </div>
          )}

          <div className="min-w-0 flex-1 text-gray-300 leading-relaxed text-[15px] whitespace-pre-line">
            {question.content}
          </div>
        </div>

        {/* CODE SNIPPET PREVIEW */}
        {question.code_snippet && (
          <div className="mb-10 rounded-xl overflow-hidden border border-white/10 bg-[#0d1117] shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-gray-400 font-mono ml-2">
                  {question.tag || "snippet"}
                </span>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(decodeHtmlEntities(question.code_snippet))
                }
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-yellow-400 bg-white/5 px-2.5 py-1 rounded border border-white/5 hover:border-yellow-400/20 transition-all"
              >
                <CopyIcon />
                <span>{copiedSnippet ? "Copied!" : "Copy Code"}</span>
              </button>
            </div>
            <div className="p-4 overflow-x-auto max-h-[450px] font-mono text-xs sm:text-sm text-gray-200 leading-relaxed bg-[#0f141c]">
              <pre>
                <code>{decodeHtmlEntities(question.code_snippet)}</code>
              </pre>
            </div>
          </div>
        )}

        {/* ATTACHMENTS CODE FILES */}
        {media.length > 0 && (
          <div className="mb-12">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-4 font-semibold">
              Attached Code Files ({media.length})
            </p>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              {media.map((m, idx) => {
                const filePath = m.media || m.file_path;
                if (!filePath) return null;
                const url = filePath.startsWith("http")
                  ? filePath
                  : `${BASE_URL}/${filePath}`;

                const fileName =
                  filePath.split("/").pop() || `attached_file_${idx + 1}`;
                const ext = fileName
                  .substring(fileName.lastIndexOf("."))
                  .replace(".", "")
                  .toUpperCase();

                return (
                  <div
                    key={m.id || idx}
                    className="flex flex-col bg-white/[0.03] border border-white/10 rounded-xl p-4 hover:border-yellow-400/30 transition duration-200 group"
                  >
                    <div className="flex items-center gap-3 mb-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex flex-col items-center justify-center font-mono text-[10px] font-bold text-yellow-400 shadow-inner shrink-0">
                        <CodeIcon />
                        <span className="text-[8px] tracking-tight mt-0.5">
                          {ext || "CODE"}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-sm font-medium text-gray-200 truncate font-mono"
                          title={fileName}
                        >
                          {fileName}
                        </p>
                        <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                          .{ext.toLowerCase()} file
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-auto pt-2 border-t border-white/5">
                      <button
                        onClick={() => handleViewFile(url, fileName)}
                        className="flex-1 text-center bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 font-medium py-1.5 rounded-lg transition"
                      >
                        View File
                      </button>

                      <button
                        onClick={() => handleDownload(url, fileName)}
                        className="flex-1 text-center bg-yellow-400 hover:bg-yellow-300 text-xs text-black font-semibold py-1.5 rounded-lg transition"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* COMMENTS SECTION */}
        <div className="mt-10 pt-10 border-t border-white/10">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-base font-semibold">Comments</h3>
            <span className="text-xs text-gray-500 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
              {comments.length}
            </span>
          </div>

          {/* Form Input Komentar */}
          {isLoggedIn && !moderator && (
            <div className="mb-8 flex gap-3">
              <img
                src={getAvatar(JSON.parse(storedUser || "{}"))}
                alt="you"
                className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-1"
              />
              <div className="flex-1 space-y-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-yellow-400/50 rounded-xl p-3 text-sm text-white placeholder:text-gray-600 outline-none transition resize-none"
                />

                <textarea
                  value={newCodeSnippet}
                  onChange={(e) => setNewCodeSnippet(e.target.value)}
                  placeholder="Optional: attach a code snippet..."
                  maxLength={3000}
                  rows={3}
                  className="w-full bg-[#0d1117] border border-white/10 font-mono text-xs text-amber-200 rounded-lg p-2 outline-none focus:border-amber-400/40 resize-none"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handlePostComment}
                    disabled={!newComment.trim() || commentLoading}
                    className="bg-yellow-400 disabled:opacity-40 text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-300 transition"
                  >
                    {commentLoading ? "Posting..." : "Post comment"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* List Menampilkan Komentar */}
          <div className="space-y-4">
            {comments.length === 0 && (
              <p className="text-gray-600 text-xs text-center py-4">
                No comments yet.
              </p>
            )}
            {comments.map((c) => {
              const commentUserId = c.user_id || c.user?.id;
              const profilePath = commentUserId
                ? `/profile/${commentUserId}`
                : "#";
              const canDelete =
                isLoggedIn &&
                (Number(commentUserId) === Number(currentUserId) || moderator);

              return (
                <div key={c.id} className="flex gap-3 min-w-0">
                  <Link to={profilePath} className="flex-shrink-0 mt-0.5 group">
                    <img
                      src={getAvatar(c.user || c)}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 group-hover:ring-yellow-400/50 transition duration-200"
                    />
                  </Link>

                  <div className="min-w-0 flex-1 bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <Link to={profilePath} className="group">
                        <p className="text-xs font-medium text-gray-300 group-hover:text-yellow-400 transition duration-200">
                          {c.username || c.user?.username}
                        </p>
                      </Link>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500">
                          {c.created_at
                            ? new Date(c.created_at).toLocaleDateString()
                            : ""}
                        </span>
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="cursor-pointer text-[11px] text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                            title="Delete comment"
                            aria-label="Delete comment"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap break-words">
                      {c.comment || c.content}
                    </p>
                    {c.code_snippet && (
                      <pre className="mt-2 bg-[#0d1117] border border-white/10 rounded-lg p-2.5 text-[11px] font-mono text-amber-200 overflow-x-auto">
                        <code>{c.code_snippet}</code>
                      </pre>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* MODAL CODE PREVIEW */}
        {isPreviewOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="bg-[#0d1117] border border-white/10 rounded-xl w-full max-w-3xl flex flex-col max-h-[85vh] shadow-2xl">
              {/* Header Modal */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-[#161b22]">
                <span className="text-sm font-mono text-gray-200">
                  {previewTitle}
                </span>
                <button
                  onClick={() => {
                    setIsPreviewOpen(false);
                    setPreviewCode(null);
                  }}
                  className="text-gray-400 hover:text-white text-sm bg-white/5 hover:bg-white/10 px-3 py-1 rounded-md transition"
                >
                  Close
                </button>
              </div>
              {/* Isi Teks Code */}
              <div className="p-5 overflow-auto font-mono text-xs sm:text-sm text-gray-200 bg-[#0f141c] flex-1">
                <pre className="whitespace-pre-wrap break-all">
                  <code>{previewCode || "Loading atau file kosong..."}</code>
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
