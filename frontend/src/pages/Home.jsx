import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Home = () => {
  const [artworks, setArtworks] = useState([]);
  const navigate = useNavigate();
  const [sort, setSort] = useState("Newest");
  const [channel, setChannel] = useState("All Channels");
  const [openSort, setOpenSort] = useState(false);

  const channels = [
  "All Channels",
  "Tutorials",
  "Game Art",
  "Character Animation",
  "Environment",
  "Props",
  "Concept Design",
  "Sketches",
  "UI Design"
];

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const resArt = await fetch("http://localhost:5000/api/concept-arts");

        const artData = await resArt.json();
        const arts = artData.art;

        const artsWithMedia = await Promise.all(
          arts.map(async (art) => {
            const resMedia = await fetch(
              `http://localhost:5000/api/art-media/art/${art.id}`,
            );

            const mediaData = await resMedia.json();

            return {
              ...art,
              media: mediaData.data.length > 0 ? mediaData.data[0].media : null,
            };
          }),
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

      <div className="px-10 pt-10 pb-6 flex items-center gap-6">
        {/* SORT DROPDOWN */}
        <div className="relative">
          <button
            onClick={() => setOpenSort(!openSort)}
            className="bg-[#1a1d2e] px-4 py-2 rounded-lg flex items-center gap-11"
          >
            {sort}
            <span>▼</span>
          </button>

          {openSort && (
            <div className="absolute mt-2 bg-[#1a1d2e] rounded-lg shadow w-35 z-50">
              <button
                onClick={() => {
                  setSort("Newest");
                  setOpenSort(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-[#2a2d3e]"
              >
                Newest
              </button>

              <button
                onClick={() => {
                  setSort("Popular");
                  setOpenSort(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-[#2a2d3e]"
              >
                Popular
              </button>
            </div>
          )}
        </div>

        {/* CHANNEL FILTER */}
        <div className="flex gap-4 overflow-x-auto">
          {channels.map((c) => (
            <button
              key={c}
              onClick={() => setChannel(c)}
              className={`px-10 py-2 rounded-full text-base transition
        ${
          channel === c
            ? "border border-white text-white"
            : "text-gray-400 hover:text-white"
        }`}
            >
              {c}
            </button>
          ))}
        </div>
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
                  src={art.media.startsWith('http') ? art.media : `http://localhost:5000/${art.media.replace(/\\/g, "/")}`}
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
                  <p className="text-xs text-gray-400">{art.tag}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {artworks.length === 0 && (
          <p className="text-gray-500 mt-10">No artworks yet.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
