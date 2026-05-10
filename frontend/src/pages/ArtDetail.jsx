import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import api, { isTokenExpired } from "../services/api";
import { parseTags } from "../utils/sanitize";
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

const ArtDetail = () => {
  const { id: rawId } = useParams();
  const id = Number(rawId);
  const navigate = useNavigate();
  const [art, setArt] = useState(null);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const isLoggedIn = !isTokenExpired();
  const storedUser = localStorage.getItem("user");
  const currentUserId = storedUser ? JSON.parse(storedUser).id : null;

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const [artRes, mediaRes, likesRes, commentsRes] = await Promise.all([
          api.get(`/concept-arts/${id}`),
          api.get(`/art-media/art/${id}`),
          api.get(`/likes/art/${id}`),
          api.get(`/comments/art/${id}`),
        ]);

        const images = mediaRes.data.data.map((m) =>
          m.media.replace(/\\/g, "/"),
        );

        const artData = artRes.data.art;
        setArt({ ...artData, images });
        setLikes(likesRes.data.data.length);
        setComments(commentsRes.data.data);

        const isAuthor =
          currentUserId && Number(currentUserId) === Number(artData.user_id);
        if (!isAuthor) {
          api
            .post(`/concept-arts/${id}/view`)
            .then((res) => {
              const v = res?.data?.views;
              if (typeof v === "number") {
                setArt((prev) => (prev ? { ...prev, views: v } : prev));
              }
            })
            .catch(() => {});
        }

        if (isLoggedIn) {
          const statusRes = await api.get(`/likes/art/${id}/status`);
          setLiked(!!statusRes.data.liked);
        }
      } catch (error) {
        console.error("Error fetching detail:", error);
      }
    };

    fetchDetail();
  }, [id]);

  const requireLogin = () => {
    if (!isLoggedIn) {
      navigate(`/login?redirect=/art/${id}`);
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
    path.startsWith("http") ? path : `/${path}`;

  const isVideo = (path) =>
    /\.(mp4|webm|mkv|avi|mov|wmv|flv|m4v|ogv)$/i.test(path);

  if (!art) {
    return (
      <div className="min-h-screen bg-[#0a0d1f] text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="w-10 h-10 border-2 border-white/10 border-t-yellow-500 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading artwork...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0d1f] text-white flex flex-col">
      <Navbar />

      {/* ──── MAIN: side-by-side layout ──── */}
      <div className="flex-1 flex flex-col lg:flex-row animate-fade-in">
        {/* ──── LEFT: Image viewer ──── */}
        <div className="lg:flex-1 bg-black flex flex-col">
          {/* Image/Video display */}
          <div className="group relative flex-1 flex items-center justify-center min-h-[40vh] sm:min-h-[50vh] lg:min-h-0">
            {isVideo(art.images[currentIndex]) ? (
              <video
                key={currentIndex}
                src={mediaSrc(art.images[currentIndex])}
                controls
                className="w-full h-full max-h-[60vh] lg:max-h-[85vh] object-contain animate-fade-in"
              />
            ) : (
              <img
                key={currentIndex}
                src={mediaSrc(art.images[currentIndex])}
                alt={art.title}
                className="w-full h-full max-h-[60vh] lg:max-h-[85vh] object-contain animate-fade-in"
              />
            )}

            {art.images.length > 1 && (
              <>
                {/* Edge fades */}
                <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black/60 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black/60 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Prev */}
                <button
                  onClick={() =>
                    setCurrentIndex((prev) =>
                      prev === 0 ? art.images.length - 1 : prev - 1,
                    )
                  }
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-white/20 transition-all duration-300"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                {/* Next */}
                <button
                  onClick={() =>
                    setCurrentIndex((prev) =>
                      prev === art.images.length - 1 ? 0 : prev + 1,
                    )
                  }
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-white/20 transition-all duration-300"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                {/* Slide counter */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-sm text-white/80 text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                  {currentIndex + 1} / {art.images.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {art.images.length > 1 && (
            <div className="bg-[#0a0d1f] border-t border-white/5 px-3 sm:px-4 py-2 sm:py-3">
              <div className="flex gap-2 overflow-x-auto p-1 -m-1">
                {art.images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`relative w-16 h-12 sm:w-20 sm:h-14 rounded-md cursor-pointer shrink-0 overflow-hidden transition-all duration-200 ${
                      i === currentIndex
                        ? "ring-2 ring-yellow-500 ring-offset-1 ring-offset-[#0a0d1f]"
                        : "opacity-50 hover:opacity-100"
                    }`}
                  >
                    {isVideo(img) ? (
                      <>
                        <video
                          src={mediaSrc(img)}
                          muted
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[7px] font-bold px-1 rounded">
                          VIDEO
                        </span>
                      </>
                    ) : (
                      <img
                        src={mediaSrc(img)}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ──── RIGHT: Info panel (scrollable) ──── */}
        <div className="w-full lg:w-[380px] xl:w-[420px] lg:h-[calc(100vh-64px)] lg:overflow-y-auto lg:border-l border-t lg:border-t-0 border-white/5 bg-[#0a0d1f] shrink-0">
          <div className="p-4 sm:p-5 space-y-0">
            {/* Back button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors duration-200 mb-5"
            >
              <ArrowLeftIcon />
              Back
            </button>

            {/* Artist row */}
            <Link
              to={art.user_id ? `/profile/${art.user_id}` : "#"}
              className="flex items-center gap-3 mb-5 group"
            >
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${art.username || "artist"}`}
                className="w-10 h-10 rounded-full transition group-hover:ring-2 group-hover:ring-yellow-400/50"
                alt=""
              />
              <div>
                <p className="font-semibold text-sm text-white group-hover:text-yellow-300 transition-colors">
                  {art.username || "Artist"}
                </p>
                <p className="text-[11px] text-gray-500">
                  Creator · view profile
                </p>
              </div>
            </Link>

            {/* Title + Tag */}
            <div className="mb-4">
              <h1 className="text-base sm:text-lg font-bold text-white leading-snug">
                {art.title}
              </h1>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {parseTags(art.tag).map((t) => (
                  <span
                    key={t}
                    className="inline-block bg-yellow-500/10 text-yellow-500 text-[11px] font-medium px-2.5 py-0.5 rounded-md"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Like button + Stats */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={handleLike}
                disabled={likeLoading}
                className={`flex-1 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm ${
                  liked
                    ? "bg-yellow-500 text-black"
                    : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                } ${likeLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <HeartIcon className="w-4 h-4" filled={liked} />
                {liked ? "Liked" : "Like"}
              </button>
            </div>

            {/* Report button */}
            {isLoggedIn && art.user_id !== currentUserId && (
              <div className="mb-4">
                <button
                  onClick={() => setReportOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors duration-200"
                >
                  <FlagIcon className="w-3.5 h-3.5" />
                  Report
                </button>
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-500 mb-5">
              <span className="flex items-center gap-1">
                <HeartIcon className="w-3.5 h-3.5" />
                {likes} {likes === 1 ? "like" : "likes"}
              </span>
              <span className="flex items-center gap-1">
                <ChatBubbleIcon className="w-3.5 h-3.5" />
                {comments.length}{" "}
                {comments.length === 1 ? "comment" : "comments"}
              </span>
            </div>

            {/* Description */}
            {art.description && (
              <div className="border-t border-white/5 pt-4 mb-5">
                <p className="text-sm text-gray-300 leading-relaxed">
                  {art.description}
                </p>
              </div>
            )}

            {/* Comments section */}
            <div className="border-t border-white/5 pt-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5 text-gray-200">
                <ChatBubbleIcon className="w-4 h-4 text-gray-500" />
                {comments.length}{" "}
                {comments.length === 1 ? "Comment" : "Comments"}
              </h3>

              {/* Comment input */}
              <div className="flex gap-2 mb-4 min-w-0">
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => requireLogin()}
                  className="flex-1 min-w-0 bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-sm text-gray-200 outline-none focus:border-yellow-500/50 focus:bg-white/[0.07] placeholder-gray-500 transition-all duration-200"
                  placeholder={
                    isLoggedIn ? "Add a comment..." : "Sign in to comment..."
                  }
                />
                <button
                  onClick={handleComment}
                  className="shrink-0 bg-yellow-500 px-3 sm:px-4 rounded-lg text-black text-xs font-semibold hover:bg-yellow-400 transition-colors duration-200"
                >
                  Post
                </button>
              </div>

              {/* Comments list */}
              <div className="space-y-0.5">
                {comments.length === 0 && (
                  <p className="text-gray-600 text-xs text-center py-6">
                    No comments yet.
                  </p>
                )}
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="flex gap-2.5 p-2.5 rounded-lg hover:bg-white/[0.03] transition-colors duration-200"
                  >
                    <Link
                      to={c.user_id ? `/profile/${c.user_id}` : "#"}
                      className="shrink-0"
                    >
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.username}`}
                        className="w-8 h-8 rounded-full hover:ring-2 hover:ring-yellow-400/50 transition"
                        alt=""
                      />
                    </Link>

                    <div className="min-w-0">
                      <Link
                        to={c.user_id ? `/profile/${c.user_id}` : "#"}
                        className="text-xs font-medium text-yellow-500 hover:underline"
                      >
                        {c.username}
                      </Link>

                      <p className="text-xs text-gray-300 mt-0.5 break-words leading-relaxed">
                        {c.comment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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

export default ArtDetail;
