import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import api, { isTokenExpired } from "../services/api";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [likeLoading, setLikeLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLoggedIn = !isTokenExpired();

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
          } catch {}
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

      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* LEFT - MAIN POST */}
        <div className="flex-1 min-w-0">
          <div className="bg-[#111427] rounded-xl p-3 sm:p-4 flex gap-3 sm:gap-4">
            {/* VOTE COLUMN */}
            <div className="flex flex-col items-center text-gray-400 shrink-0">
              <button
                onClick={handleLike}
                className={`text-lg ${liked ? "text-yellow-500" : ""}`}
              >
                ▲
              </button>

              <span className="text-sm font-semibold">{likes}</span>

              <button onClick={handleLike} className="text-lg rotate-180">
                ▲
              </button>
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

                      // 🎥 VIDEO
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

                      // 🖼️ IMAGE
                      if (isImage(file)) {
                        return (
                          <img
                            key={i}
                            src={src}
                            className="w-full max-h-[60vh] sm:max-h-[500px] object-contain rounded"
                          />
                        );
                      }

                      // 📄 DOCUMENT
                      if (isDocument(file)) {
                        return (
                          <div
                            key={i}
                            className="bg-[#1a1d2e] p-4 rounded-lg flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <span>📄</span>
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
              <div className="flex gap-4 text-sm text-gray-400 border-t border-gray-800 pt-3">
                <span>💬 {comments.length} Comments</span>
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
            <p className="text-sm text-gray-400">👍 {likes} likes</p>
            <p className="text-sm text-gray-400">
              💬 {comments.length} comments
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
