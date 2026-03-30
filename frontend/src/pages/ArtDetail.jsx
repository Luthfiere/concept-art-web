import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

const ArtDetail = () => {
  const { id } = useParams();
  const [art, setArt] = useState(null);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      const token = localStorage.getItem("token");

      try {
        // 1️⃣ Ambil concept art
        const resArt = await fetch(
          `http://localhost:5000/api/concept-arts/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const artData = await resArt.json();

        // Ambil total like
        const resLikes = await fetch(
          `http://localhost:5000/api/likes/art/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const likesData = await resLikes.json();
        setLikes(likesData.data.length);

     
        const resUserLike = await fetch(
          `http://localhost:5000/api/likes/art/${id}/status`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const userLikeData = await resUserLike.json();

        setLiked(!!userLikeData.liked);

        // Ambil Comments
        const resComments = await fetch(
          `http://localhost:5000/api/comments/art/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const commentData = await resComments.json();
        setComments(commentData.data);
        //  Ambil media
        const resMedia = await fetch(
          `http://localhost:5000/api/art-media/art/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const mediaData = await resMedia.json();

        const images = mediaData.data.map((m) => m.media.replace(/\\/g, "/"));

        setArt({
          ...artData.art,
          images,
        });
      } catch (error) {
        console.error("Error fetching detail:", error);
      }
    };

    fetchDetail();
  }, [id]);

  const fetchLikes = async () => {
    const res = await fetch(`http://localhost:5000/api/likes/art/${id}`);
    const data = await res.json();
    setLikes(data.total);
  };

  const handleLike = async () => {
    const token = localStorage.getItem("token");

    if (likeLoading) return;
    setLikeLoading(true);

    try {
      if (!liked) {
        const res = await fetch("http://localhost:5000/api/likes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            entity_type: "art",
            entity_id: id,
          }),
        });

        if (!res.ok) {
          let errorMessage;
          try {
            const json = await res.json();
            errorMessage = json.message;
          } catch {
            errorMessage = await res.text();
          }
          throw new Error(errorMessage);
        }

        setLiked(true);
        setLikes((prev) => prev + 1);
        await fetchLikes();
      } else {
        const res = await fetch("http://localhost:5000/api/likes", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            entity_type: "art",
            entity_id: id,
          }),
        });

        if (!res.ok) {
          let errorMessage;
          try {
            const json = await res.json();
            errorMessage = json.message;
          } catch {
            errorMessage = await res.text();
          }
          throw new Error(errorMessage);
        }

        setLiked(false);
        setLikes((prev) => prev - 1);
        await fetchLikes();
      }
    } catch (err) {
      console.error("LIKE ERROR:", err.message);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleComment = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:5000/api/comments/art/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: newComment }),
      });

      const data = await res.json();

      setComments((prev) => [...prev, data.data]);
      setNewComment("");
    } catch (err) {
      console.error(err);
    }
  };

  if (!art) return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0b0f2a] text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT */}
          <div className="lg:col-span-8 space-y-8">
            {art.images && art.images.length > 0 && (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                {/* IMAGE */}
                <img
                  src={
                    art.images[currentIndex].startsWith("http")
                      ? art.images[currentIndex]
                      : `http://localhost:5000/${art.images[currentIndex]}`
                  }
                  alt={art.title}
                  className="w-full h-[600px] object-cover"
                />

                {/* LEFT BUTTON */}
                <button
                  onClick={() =>
                    setCurrentIndex((prev) =>
                      prev === 0 ? art.images.length - 1 : prev - 1,
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 px-3 py-2 rounded-lg"
                >
                  ◀
                </button>

                {/* RIGHT BUTTON */}
                <button
                  onClick={() =>
                    setCurrentIndex((prev) =>
                      prev === art.images.length - 1 ? 0 : prev + 1,
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 px-3 py-2 rounded-lg"
                >
                  ▶
                </button>

                {/* DOT INDICATOR */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {art.images.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i === currentIndex ? "bg-yellow-500" : "bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* {thumbnail} */}
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {art.images.map((img, i) => (
                <img
                  key={i}
                  src={
                    img.startsWith("http")
                      ? img
                      : `http://localhost:5000/${img}`
                  }
                  onClick={() => setCurrentIndex(i)}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 ${
                    i === currentIndex
                      ? "border-yellow-500"
                      : "border-transparent"
                  }`}
                />
              ))}
            </div>

            {/* Extra content biar ga kosong */}
            <div className="bg-[#111427] p-8 rounded-2xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4">About this artwork</h2>
              <p className="text-gray-300 leading-relaxed">{art.description}</p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-[#111427] p-6 rounded-2xl shadow-xl space-y-6">
              <div>
                <h1 className="text-2xl font-bold mb-1">{art.title}</h1>
                <p className="text-sm text-gray-400">{art.tag}</p>
              </div>

              <button
                onClick={handleLike}
                disabled={likeLoading}
                className={`w-full py-2 rounded-xl transition ${
                  liked
                    ? "bg-yellow-500 text-black"
                    : "bg-[#1b1f3a] hover:bg-[#2a2f55]"
                } ${likeLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                ❤️ {likes}
              </button>

              <div>
                <h2 className="text-lg font-semibold mb-3">
                  Comments ({comments.length})
                </h2>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                  {comments.map((c) => (
                    <div key={c.id} className="bg-[#1b1f3a] p-3 rounded-xl">
                      <p className="text-xs text-gray-400">
                        {c.user?.username}
                      </p>
                      <p className="text-sm">{c.comment}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-4">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 bg-[#1b1f3a] p-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Write a comment..."
                  />
                  <button
                    onClick={handleComment}
                    className="bg-yellow-500 px-4 rounded-xl text-black text-sm font-semibold"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtDetail;
