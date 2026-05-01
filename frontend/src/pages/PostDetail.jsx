import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import api, { isTokenExpired } from "../services/api";
import ReportModal, { FlagIcon } from "../components/moderation/ReportModal";

const HeartIcon = ({ className = "w-4 h-4", filled = false }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke={filled ? "none" : "currentColor"}
    strokeWidth={filled ? 0 : 1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"
    />
  </svg>
);

const ChatBubbleIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
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

const DocumentIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
    />
  </svg>
);

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

const PostDetail = () => {
  const { id: rawId } = useParams();
  const id = Number(rawId);
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [likeLoading, setLikeLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);

  const isLoggedIn = !isTokenExpired();
  const storedUser = localStorage.getItem("user");
  const currentUserId = storedUser ? JSON.parse(storedUser).id : null;

  const isImage = (path) => /\.(jpg|jpeg|png|gif|webp)$/i.test(path);

  const isDocument = (path) => /\.(pdf|doc|docx|xls|xlsx|zip|rar)$/i.test(path);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const [postRes, mediaRes] = await Promise.all([
          api.get(`/concept-arts/${id}`),
          api.get(`/art-media/art/${id}`),
        ]);

        // media
        const images = mediaRes.data.data.map((m) =>
          m.media.replace(/\\/g, "/"),
        );

        const raw = postRes.data.post || postRes.data.art;

        const postData = {
          ...raw,
          images,
        };
        setPost(postData);

        const isAuthor =
          currentUserId && Number(currentUserId) === Number(raw.user_id);
        if (!isAuthor) {
          api.post(`/concept-arts/${id}/view`).catch(() => {});
        }

        // likes (optional)
        try {
          const likesRes = await api.get(`/likes/art/${id}`);
          setLikes(likesRes.data.data.length);
        } catch {
          setLikes(0);
        }

        // comments (optional)
        try {
          const commentsRes = await api.get(`/comments/art/${id}`);
          setComments(commentsRes.data.data);
        } catch {
          setComments([]);
        }

        // liked status
        if (isLoggedIn) {
          try {
            const statusRes = await api.get(`/likes/art/${id}/status`);
            setLiked(!!statusRes.data.liked);
          } catch {
            setLiked(false);
          }
        }
      } catch (err) {
        console.error("Fetch detail error:", err);
      }
    };

    fetchDetail();
  }, [id]);

  const requireLogin = () => {
    if (!isLoggedIn) {
      navigate(`/login?redirect=/post/${id}`);
      return true;
    }
    return false;
  };

  const handleLike = async () => {
    if (requireLogin()) return;
    if (likeLoading) return;
    setLikeLoading(true);

    try {
      if (!liked) {
        await api.post("/likes", { entity_type: "art", entity_id: id });
        setLiked(true);
        setLikes((prev) => prev + 1);
      } else {
        await api.delete("/likes", {
          data: { entity_type: "art", entity_id: id },
        });
        setLiked(false);
        setLikes((prev) => prev - 1);
      }
    } catch (err) {
      console.error("Like error:", err.message);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleComment = async () => {
    if (requireLogin()) return;
    if (!newComment.trim()) return;

    try {
      const res = await api.post(`/comments/art/${id}`, {
        comment: newComment,
      });
      setComments((prev) => [...prev, res.data.data]);
      setNewComment("");
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleComment();
    }
  };

  const mediaSrc = (path) =>
    path.startsWith("http") ? path : `http://localhost:5000/${path}`;

  const isVideo = (path) =>
    /\.(mp4|webm|mkv|avi|mov|wmv|flv|m4v|ogv)$/i.test(path);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0a0d1f] text-white">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-gray-400 text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0d1f] text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 pt-6">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors duration-200 mb-5"
        >
          <ArrowLeftIcon />
          Back
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-6 flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* LEFT - MAIN POST */}
        <div className="flex-1 min-w-0">
          <div className="bg-[#111427] rounded-xl p-3 sm:p-4 flex gap-3 sm:gap-4">
            {/* LIKE COLUMN */}
            <div className="flex flex-col items-center text-gray-400 shrink-0">
              <button
                onClick={handleLike}
                disabled={likeLoading}
                className={`p-1.5 rounded-md transition-colors duration-200 ${
                  liked
                    ? "text-yellow-500"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                } ${likeLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                aria-label={liked ? "Unlike" : "Like"}
              >
                <HeartIcon className="w-5 h-5" filled={liked} />
              </button>

              <span className="text-sm font-semibold mt-1">{likes}</span>
            </div>

            {/* CONTENT */}
            <div className="flex-1 min-w-0 space-y-4">
              {/* Title */}
              <h1 className="text-lg sm:text-xl font-bold break-words">{post.title}</h1>

              {/* Author */}
              <p className="text-xs text-gray-400">
                Posted by {post.username || "Posters"}
              </p>
              {/* Image / Video */}
              <div className="bg-black rounded-lg overflow-hidden">
                {post.images?.length > 0 && (
                  <div className="space-y-3">
                    {post.images.map((file, i) => {
                      const src = mediaSrc(file);
                      const fileName = file.split("/").pop();

                      // VIDEO
                      if (isVideo(file)) {
                        return (
                          <video
                            key={i}
                            src={src}
                            controls
                            className="w-full max-h-[60vh] sm:max-h-[500px] object-contain rounded"
                          />
                        );
                      }

                      // IMAGE
                      if (isImage(file)) {
                        return (
                          <img
                            key={i}
                            src={src}
                            className="w-full max-h-[60vh] sm:max-h-[500px] object-contain rounded"
                          />
                        );
                      }

                      // DOCUMENT
                      if (isDocument(file)) {
                        return (
                          <div
                            key={i}
                            className="bg-[#1a1d2e] p-4 rounded-lg flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2 text-sm text-gray-300 min-w-0">
                              <DocumentIcon className="w-4 h-4 shrink-0 text-yellow-500" />
                              <span className="truncate max-w-[200px]">
                                {fileName}
                              </span>
                            </div>

                            <a
                              href={src}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="bg-yellow-500 text-black px-3 py-1 rounded text-xs font-semibold hover:bg-yellow-400"
                            >
                              Download
                            </a>
                          </div>
                        );
                      }

                      // fallback
                      return null;
                    })}
                  </div>
                )}
              </div>

              {/* Thumbnail (optional tetap dipake) */}
              {post.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {post.images.map((img, i) => (
                    <img
                      key={i}
                      src={mediaSrc(img)}
                      onClick={() => setCurrentIndex(i)}
                      className={`w-16 h-12 sm:w-20 sm:h-14 shrink-0 object-cover rounded cursor-pointer ${
                        i === currentIndex
                          ? "ring-2 ring-yellow-500"
                          : "opacity-60"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Description */}
              <p className="text-gray-300 text-sm whitespace-pre-line">
                {post.description}
              </p>

              {/* Actions */}
              <div className="flex gap-4 text-sm text-gray-400 border-t border-gray-800 pt-3 items-center">
                <span className="flex items-center gap-1.5">
                  <ChatBubbleIcon className="w-4 h-4" />
                  {comments.length} Comments
                </span>
                {isLoggedIn && post.user_id !== Number(currentUserId) && (
                  <button
                    onClick={() => setReportOpen(true)}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors duration-200"
                  >
                    <FlagIcon className="w-3.5 h-3.5" />
                    Report
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* COMMENTS */}
          <div className="bg-[#111427] rounded-xl p-3 sm:p-4 mt-4">
            <h3 className="font-semibold mb-4">Comments ({comments.length})</h3>

            {/* Input */}
            <div className="flex gap-2 mb-4 min-w-0">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 min-w-0 bg-[#1a1d2e] p-2 rounded text-sm"
                placeholder="Write a comment..."
              />
              <button
                onClick={handleComment}
                className="shrink-0 bg-yellow-500 px-3 sm:px-4 rounded text-black text-sm"
              >
                Post
              </button>
            </div>

            {/* Comment list */}
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.username}`}
                    className="w-9 h-9 rounded-full shrink-0"
                    alt=""
                  />
                  <div>
                    <p className="text-sm font-medium text-yellow-500">
                      {c.username}
                    </p>
                    <p className="text-sm text-gray-300 mt-0.5">{c.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT - SIDEBAR */}
        <div className="w-full lg:w-72 shrink-0 space-y-4">
          <div className="bg-[#111427] rounded-xl p-4">
            <p className="font-semibold mb-2">About Artist</p>

            <div className="flex items-center gap-3 mb-4">
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${post.username || "user"}`}
                className="w-12 h-12 rounded-full"
                alt=""
              />
              <div>
                <p className="font-semibold">{post.username || "User"}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#111427] rounded-xl p-4">
            <p className="font-semibold mb-2">Post Info</p>
            <p className="text-sm text-gray-400 flex items-center gap-1.5">
              <HeartIcon className="w-3.5 h-3.5" />
              {likes} likes
            </p>
            <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-1">
              <ChatBubbleIcon className="w-3.5 h-3.5" />
              {comments.length} comments
            </p>
          </div>
        </div>
      </div>

      {reportOpen && (
        <ReportModal
          entityType="art"
          entityId={id}
          onClose={() => setReportOpen(false)}
        />
      )}
    </div>
  );
};

export default PostDetail;
