import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import api from "../services/api";

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

  const isLoggedIn = !!localStorage.getItem("token");

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

        setArt({ ...artRes.data.art, images });
        setLikes(likesRes.data.data.length);
        setComments(commentsRes.data.data);

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

  const imgSrc = (img) =>
    img.startsWith("http") ? img : `http://localhost:5000/${img}`;

  if (!art) {
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

      {/* Main image area — full width dark background like ArtStation */}
      <div className="bg-black">
        <div className="max-w-5xl mx-auto relative">
          <img
            src={imgSrc(art.images[currentIndex])}
            alt={art.title}
            className="w-full max-h-[75vh] object-contain"
          />

          {art.images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentIndex((prev) =>
                    prev === 0 ? art.images.length - 1 : prev - 1,
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center transition"
              >
                ◀
              </button>
              <button
                onClick={() =>
                  setCurrentIndex((prev) =>
                    prev === art.images.length - 1 ? 0 : prev + 1,
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center transition"
              >
                ▶
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content area below image */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT — Additional images + description */}
          <div className="lg:w-2/3 space-y-6">
            {/* Thumbnail strip */}
            {art.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {art.images.map((img, i) => (
                  <img
                    key={i}
                    src={imgSrc(img)}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 shrink-0 transition ${
                      i === currentIndex
                        ? "border-yellow-500"
                        : "border-transparent hover:border-gray-600"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* All images stacked (ArtStation style) */}
            {art.images.map((img, i) => (
              <img
                key={i}
                src={imgSrc(img)}
                alt={`${art.title} - ${i + 1}`}
                className="w-full rounded-lg"
              />
            ))}

            {/* Description */}
            <div className="border-t border-gray-800 pt-6">
              <p className="text-gray-300 leading-relaxed">{art.description}</p>
            </div>

            {/* Comments section */}
            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-lg font-semibold mb-4">
                {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
              </h3>

              <div className="flex gap-3 mb-6">
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => requireLogin()}
                  className="flex-1 bg-[#1a1d2e] p-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-yellow-500 placeholder-gray-500"
                  placeholder={isLoggedIn ? "Add a comment..." : "Sign in to comment..."}
                />
                <button
                  onClick={handleComment}
                  className="bg-yellow-500 px-5 rounded-lg text-black text-sm font-semibold hover:bg-yellow-400 transition"
                >
                  Post
                </button>
              </div>

              <div className="space-y-4">
                {comments.length === 0 && (
                  <p className="text-gray-500 text-sm">No comments yet.</p>
                )}
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
                      <p className="text-sm text-gray-300 mt-0.5">
                        {c.comment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Sidebar (sticky like ArtStation) */}
          <div className="lg:w-1/3">
            <div className="sticky top-6 space-y-5">
              {/* Artist card */}
              <div className="bg-[#111427] rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${art.username || "artist"}`}
                    className="w-12 h-12 rounded-full"
                    alt=""
                  />
                  <div>
                    <p className="font-semibold">
                      {art.username || "Artist"}
                    </p>
                  </div>
                </div>

                {/* Like & Save buttons */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={handleLike}
                    disabled={likeLoading}
                    className={`flex-1 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                      liked
                        ? "bg-yellow-500 text-black"
                        : "bg-[#1b1f3a] text-white hover:bg-[#2a2f55]"
                    } ${likeLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {liked ? "👍" : "👍"} Like
                  </button>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>👍 {likes}</span>
                  <span>💬 {comments.length}</span>
                </div>
              </div>

              {/* Artwork info */}
              <div className="bg-[#111427] rounded-xl p-5">
                <h1 className="text-xl font-bold mb-2">{art.title}</h1>
                <span className="inline-block bg-[#1b1f3a] text-gray-300 text-xs px-3 py-1 rounded-full">
                  {art.tag}
                </span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtDetail;
