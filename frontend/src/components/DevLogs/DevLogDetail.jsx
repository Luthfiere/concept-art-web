import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api, { isTokenExpired } from "../../services/api";
import { parseTags } from "../../utils/sanitize";
import Navbar from "../layout/Navbar";
import ReportModal, { FlagIcon } from "../moderation/ReportModal";

const API_BASE = "/api";
const BASE_URL = "";

export default function DevlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [devlog, setDevlog] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [media, setMedia] = useState([]);
  const [comments, setComments] = useState([]);
  const [totalcomments, setTotalComments] = useState([]);
  const [likeLoading, setLikeLoading] = useState(false);
  const [lightbox, setLightbox] = useState(null); // { url, index }
  const [reportOpen, setReportOpen] = useState(false);
  const isLoggedIn = !isTokenExpired();
  const storedUser = localStorage.getItem("user");
  const currentUserId = storedUser ? JSON.parse(storedUser).id : null;

  const getAvatar = (user) => {
    if (user?.profile_image) {
      return user.profile_image.startsWith("http")
        ? user.profile_image
        : `${BASE_URL}/${user.profile_image}`;
    }
    return `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || "user"}`;
  };

  useEffect(() => {
    fetchDevlog();
    fetchDevLogDetails();
    const handleScroll = () => setScrolled(window.scrollY > 60);
    const handleKeyDown = (e) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const fetchDevlog = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/devlog/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const result = await res.json();
      const log = result.data;
      setDevlog({
        ...log,
        cover_image: log.cover_image
          ? log.cover_image.startsWith("http")
            ? log.cover_image
            : `${BASE_URL}/${log.cover_image}`
          : null,
      });

      const isAuthor =
        currentUserId && Number(currentUserId) === Number(log.user_id);
      if (!isAuthor) {
        api
          .post(`/devlog/${id}/view`)
          .then((res) => {
            const v = res?.data?.views;
            if (typeof v === "number") {
              setDevlog((prev) => (prev ? { ...prev, views: v } : prev));
            }
          })
          .catch(() => {});
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDevLogDetails = async () => {
    try {
      const [likeres, commentres, mediares] = await Promise.all([
        api.get(`/likes/devlog/${id}`),
        api.get(`/comments/devlog/${id}`),
        api.get(`/devlog-media/log/${id}`),
      ]);

      setLikes(likeres.data.data.length);
      setComments(commentres.data.data);
      setTotalComments(commentres.data.total);
      setMedia(mediares.data.data);

      if (isLoggedIn) {
        const statusRes = await api.get(`/likes/devlog/${id}/status`);
        setLiked(!!statusRes.data.liked);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const handleLike = async () => {
    if (!isLoggedIn) {
      alert("Login dulu");
      return;
    }
    setLikeLoading(true);
    try {
      if (liked) {
        await api.delete(`/likes`, { data: { entity_type: "devlog", entity_id: id } });
        setLikes((prev) => prev - 1);
        setLiked(false);
      } else {
        await api.post(`/likes`, { entity_type: "devlog", entity_id: id });
        setLikes((prev) => prev + 1);
        setLiked(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/comments/devlog/${id}`, { comment: newComment });
      setComments((prev) => [res.data.data, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error(err);
    }
  };

  const imageMedia = media.filter((m) => {
    const file = m.file_path || m.media;
    return file && !/\.(mp4|webm|ogg)$/i.test(file);
  });

  const openLightbox = (url, index) => setLightbox({ url, index });

  const lightboxNav = (dir) => {
    const next = (lightbox.index + dir + imageMedia.length) % imageMedia.length;
    const file = imageMedia[next].file_path || imageMedia[next].media;
    const url = file.startsWith("http") ? file : `${BASE_URL}/${file}`;
    setLightbox({ url, index: next });
  };

  if (!devlog) {
    return (
      <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-[#888] text-sm tracking-widest uppercase">Loading devlog</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] to-[#0b0f2a] text-white font-sans">
      <Navbar />

      {/* HERO */}
      {devlog.cover_image ? (
        <div className="relative w-full h-[460px] overflow-hidden">
          <img
            src={devlog.cover_image}
            alt={devlog.title}
            className="w-full h-full object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/40 to-transparent" />

          {/* Title overlay on hero */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 max-w-6xl mx-auto w-full">
            <span className="inline-block text-xs uppercase tracking-widest text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-3 py-1 rounded mb-3">
              {devlog.category || "Devlog"}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight max-w-3xl">
              {devlog.title}
            </h1>
          </div>
        </div>
      ) : (
        <div className="w-full h-[120px] bg-gradient-to-br from-[#050816] to-[#0b0f2a]" />
      )}

      {/* BACK */}
      <div className="max-w-6xl mx-auto px-6 pt-8">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-yellow-400 flex items-center gap-2 mb-8 transition"
        >
          ← Back to devlogs
        </button>
      </div>

      {/* MAIN LAYOUT */}
      <div className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-[1fr_260px] gap-12">

        {/* ARTICLE */}
        <article>
          {/* Show category + title only if NO cover image */}
          {!devlog.cover_image && (
            <div className="mb-6">
              <span className="text-xs uppercase tracking-widest text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-3 py-1 rounded">
                {devlog.category || "Devlog"}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold mt-4 leading-tight">
                {devlog.title}
              </h1>
            </div>
          )}

          {/* META ROW */}
          <div className="flex items-center gap-3 py-4 mb-6 border-y border-white/10">
            <Link
              to={devlog.user_id ? `/profile/${devlog.user_id}` : "#"}
              className="flex items-center gap-3 group"
            >
              <img
                src={getAvatar(devlog)}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-yellow-400/50 transition"
              />
              <div>
                <p className="text-sm font-semibold text-gray-100 leading-tight group-hover:text-yellow-300 transition-colors">
                  {devlog.username}
                </p>
                <p className="text-xs text-gray-500">{formatDate(devlog.created_at)}</p>
              </div>
            </Link>

            {/* spacer */}
            <div className="flex-1" />

            {/* TAGS inline */}
            <div className="flex gap-2">
              {devlog.genre && (
                <span className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-400">
                  {devlog.genre}
                </span>
              )}
              {parseTags(devlog.tag).map((t) => (
                <span
                  key={t}
                  className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-400 hover:text-yellow-400 hover:border-yellow-400/40 transition"
                >
                  #{t}
                </span>
              ))}
            </div>

            {/* LIKE BUTTON inline */}
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition border ${
                liked
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "bg-transparent text-gray-400 border-white/15 hover:border-yellow-400/40 hover:text-yellow-400"
              }`}
            >
              <span>{liked ? "❤️" : "🤍"}</span>
              <span>{likes}</span>
            </button>

            {/* REPORT button */}
            {isLoggedIn && devlog.user_id !== currentUserId && (
              <button
                onClick={() => setReportOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors duration-200"
              >
                <FlagIcon className="w-3.5 h-3.5" />
                Report
              </button>
            )}
          </div>

          {/* CONTENT */}
          <div className="text-gray-300 leading-relaxed text-[15px] whitespace-pre-line mb-10">
            {devlog.content}
          </div>

          {/* MEDIA GRID */}
          {media.length > 0 && (
            <div className="mb-12">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Media</p>
              <div
                className={`grid gap-3 ${
                  media.length === 1
                    ? "grid-cols-1"
                    : media.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-2 md:grid-cols-3"
                }`}
              >
                {media.map((m, idx) => {
                  const file = m.file_path || m.media;
                  if (!file) return null;
                  const url = file.startsWith("http") ? file : `${BASE_URL}/${file}`;
                  const isVideo = /\.(mp4|webm|ogg)$/i.test(file);
                  const imgIndex = imageMedia.findIndex((im) => (im.file_path || im.media) === file);

                  return isVideo ? (
                    <video
                      key={m.id}
                      src={url}
                      controls
                      className="rounded-xl w-full aspect-video object-cover bg-white/5"
                    />
                  ) : (
                    <div
                      key={m.id}
                      className="overflow-hidden rounded-xl group relative cursor-zoom-in"
                      onClick={() => openLightbox(url, imgIndex)}
                    >
                      <img
                        src={url}
                        alt=""
                        className="w-full aspect-video object-cover group-hover:scale-105 transition duration-300 group-hover:brightness-75"
                      />
                      {/* zoom hint */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                        <div className="bg-black/50 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center text-white text-lg">
                          ⤢
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* COMMENTS */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="text-base font-semibold">Comments</h3>
              <span className="text-xs text-gray-500 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                {totalcomments}
              </span>
            </div>

            {/* INPUT */}
            {isLoggedIn && (
              <div className="mb-8 flex gap-3">
                <img
                  src={getAvatar(JSON.parse(storedUser || "{}"))}
                  alt="you"
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-1"
                />
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-yellow-400/50 rounded-xl p-3 text-sm text-white placeholder:text-gray-600 outline-none transition resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleComment}
                      disabled={!newComment.trim()}
                      className="bg-yellow-400 disabled:opacity-40 text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-300 transition"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* COMMENT LIST */}
            <div className="space-y-5">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  {c.user_id ? (
                    <Link to={`/profile/${c.user_id}`} className="shrink-0 mt-0.5">
                      <img
                        src={getAvatar(c)}
                        alt="avatar"
                        className="w-9 h-9 rounded-full object-cover hover:ring-2 hover:ring-yellow-400/50 transition"
                      />
                    </Link>
                  ) : (
                    <img
                      src={getAvatar(c)}
                      alt="avatar"
                      className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-0.5"
                    />
                  )}
                  <div className="flex-1 bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3">
                    {c.user_id ? (
                      <Link
                        to={`/profile/${c.user_id}`}
                        className="text-sm font-medium text-gray-200 mb-0.5 hover:text-yellow-300 hover:underline"
                      >
                        {c.username}
                      </Link>
                    ) : (
                      <p className="text-sm font-medium text-gray-200 mb-0.5">{c.username}</p>
                    )}
                    <p className="text-sm text-gray-400 leading-relaxed">{c.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>

        {/* SIDEBAR */}
        <aside className="space-y-4 self-start sticky top-6">

          {/* ABOUT */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5">
            <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-4">About</p>
            <p className="text-sm text-gray-200 font-medium mb-4 leading-snug">{devlog.title}</p>
            <div className="space-y-2.5 text-sm divide-y divide-white/5">
              <div className="flex justify-between pt-0">
                <span className="text-gray-500">Genre</span>
                <span className="text-gray-300">{devlog.genre || "—"}</span>
              </div>
              <div className="flex justify-between pt-2.5">
                <span className="text-gray-500">Category</span>
                <span className="text-gray-300">{devlog.category || "—"}</span>
              </div>
              <div className="flex justify-between pt-2.5">
                <span className="text-gray-500">Published</span>
                <span className="text-gray-300 text-right text-xs">{formatDate(devlog.created_at)}</span>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5">
            <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-4">Stats</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Views", value: (devlog.views || 0).toLocaleString() },
                { label: "Likes", value: (likes || 0).toLocaleString() },
                { label: "Comments", value: (totalcomments || 0).toLocaleString() },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 rounded-lg px-3 py-3 text-center">
                  <p className="text-lg font-semibold text-white">{s.value}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AUTHOR */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5">
            <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-4">Author</p>
            <Link
              to={devlog.user_id ? `/profile/${devlog.user_id}` : "#"}
              className="flex items-center gap-3 group"
            >
              <img
                src={getAvatar(devlog)}
                alt="avatar"
                className="w-11 h-11 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-yellow-400/50 transition"
              />
              <div>
                <p className="text-sm font-medium text-white group-hover:text-yellow-300 transition-colors">
                  {devlog.username}
                </p>
                <p className="text-xs text-gray-500">View profile</p>
              </div>
            </Link>
          </div>

          {/* SHARE */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied!");
            }}
            className="w-full bg-yellow-400 text-black py-2.5 rounded-xl text-sm font-semibold hover:bg-yellow-300 transition"
          >
            Copy Link
          </button>
        </aside>
      </div>

      {/* LIGHTBOX */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white text-lg flex items-center justify-center transition"
            onClick={() => setLightbox(null)}
          >
            ✕
          </button>

          {/* Prev */}
          {imageMedia.length > 1 && (
            <button
              className="absolute left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center transition"
              onClick={(e) => { e.stopPropagation(); lightboxNav(-1); }}
            >
              ‹
            </button>
          )}

          {/* Image */}
          <img
            src={lightbox.url}
            alt=""
            className="max-h-[88vh] max-w-[88vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          {imageMedia.length > 1 && (
            <button
              className="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center transition"
              onClick={(e) => { e.stopPropagation(); lightboxNav(1); }}
            >
              ›
            </button>
          )}

          {/* Counter */}
          {imageMedia.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
              {imageMedia.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-200 ${
                    i === lightbox.index
                      ? "w-5 h-1.5 bg-yellow-400"
                      : "w-1.5 h-1.5 bg-white/30"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* SCROLL TO TOP */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 right-6 w-10 h-10 rounded-full bg-yellow-400 text-black flex items-center justify-center shadow-lg transition-all duration-300 ${
          scrolled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        ↑
      </button>

      {reportOpen && (
        <ReportModal
          entityType="devlog"
          entityId={Number(id)}
          onClose={() => setReportOpen(false)}
        />
      )}
    </div>
  );
}