import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Home = () => {
  const [artworks, setArtworks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const token = localStorage.getItem("token");

        // 1️⃣ Ambil concept arts
        const resArt = await fetch(
          "http://localhost:3000/api/concept-arts",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const artData = await resArt.json();
        const arts = artData.art;

        // 2️⃣ Untuk tiap art, ambil media
        const artsWithMedia = await Promise.all(
          arts.map(async (art) => {
            const resMedia = await fetch(
              `http://localhost:3000/api/art-media/art/${art.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const mediaData = await resMedia.json();

            return {
              ...art,
              media:
                mediaData.data.length > 0
                  ? mediaData.data[0].media
                  : null,
            };
          })
        );

        setArtworks(artsWithMedia);
      } catch (error) {
        console.error("Error fetching artworks:", error);
      }
    };

    fetchArtworks();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] to-[#0b0f2a] text-white">
      <Navbar />

      <div className="px-10 pt-10 pb-6">
        <h2 className="text-2xl font-bold">Newest</h2>
      </div>

      <div className="px-10 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {artworks.map((art) => (
            <div
              key={art.id}
              onClick={() => navigate(`/art/${art.id}`)}
              className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-lg hover:scale-105 transition duration-300"
            >
              {art.media ? (
                <img
                  src={`http://localhost:3000/${art.media.replace(
                    /\\/g,
                    "/"
                  )}`}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gray-800" />
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-end p-3">
                <div>
                  <p className="text-sm font-semibold">{art.title}</p>
                  <p className="text-xs text-gray-400">
                    {art.tag}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {artworks.length === 0 && (
          <p className="text-gray-500 mt-10">
            No artworks yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default Home;