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

  useEffect(() => {
    const fetchDetail = async () => {
      const token = localStorage.getItem("token");

      try {
        // 1️⃣ Ambil concept art
        const resArt = await fetch(
          `http://localhost:3000/api/concept-arts/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const artData = await resArt.json();

        // Ambil total like
        const resLikes = await fetch(
          `http://localhost:3000/api/art-likes/art/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const likesData = await resLikes.json();
        setLikes(likesData.data.length);

        // Cek user sudah like belum
        const user = JSON.parse(localStorage.getItem("user"));

        const resUserLike = await fetch(
          `http://localhost:3000/api/art-likes/user/${user.id}/art/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const userLikeData = await resUserLike.json();

        if (userLikeData.data) {
          setLiked(true);
        }

        // Ambil Comments
        const resComments = await fetch(
          `http://localhost:3000/api/art-comments/art/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const commentData = await resComments.json();
        setComments(commentData.data);
        //  Ambil media
        const resMedia = await fetch(
          `http://localhost:3000/api/art-media/art/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const mediaData = await resMedia.json();

        const image =
          mediaData.data.length > 0
            ? mediaData.data[0].media.replace(/\\/g, "/")
            : null;

        setArt({
          ...artData.art,
          image,
        });
      } catch (error) {
        console.error("Error fetching detail:", error);
      }
    };

    fetchDetail();
  }, [id]);

  const handleLike = async () => {
    const token = localStorage.getItem("token");

    try {
      if (!liked) {
        await fetch("http://localhost:3000/api/art-likes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ art_id: id }),
        });

        setLikes((prev) => prev + 1);
        setLiked(true);
      } else {
        await fetch("http://localhost:3000/api/art-likes", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ art_id: id }),
        });

        setLikes((prev) => prev - 1);
        setLiked(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:3000/api/art-comments/art/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ comment: newComment }),
        },
      );

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
            {art.image && (
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={`http://localhost:3000/${art.image}`}
                  alt={art.title}
                  className="w-full h-[600px] object-cover"
                />
              </div>
            )}

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
                className={`w-full py-2 rounded-xl transition ${
                  liked
                    ? "bg-yellow-500 text-black"
                    : "bg-[#1b1f3a] hover:bg-[#2a2f55]"
                }`}
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
