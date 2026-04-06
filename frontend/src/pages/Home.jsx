import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PostArt from "./PostArt";

const Home = () => {
  const [artworks, setArtworks] = useState([]);
  const navigate = useNavigate();
  const [sort, setSort] = useState("Most Liked");
  const [openSort, setOpenSort] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openCategory, setOpenCategory] = useState(false);
  const categoryRef = useRef();

  const [search, setSearch] = useState("");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setOpenCategory(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const categories = ["All", ...new Set(artworks.map((art) => art.tag))];

  const filteredArtworks = artworks
    .filter((art) => {
      if (selectedCategory === "All") return true;
      return art.tag === selectedCategory;
    })
    .filter((art) => art.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "Most Liked") {
        return (b.likes || 0) - (a.likes || 0);
      }
      if (sort === "Most Viewed") {
        return (b.views || 0) - (a.views || 0);
      }
      return 0;
    });
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] to-[#0b0f2a] text-white">
      <Navbar />
      <div className="relative">
        <p className="items-center px-10 pt-3 text-3xl">Art</p>
      </div>
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
                  setSort("Most Liked");
                  setOpenSort(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-[#2a2d3e]"
              >
                Most Liked
              </button>

              <button
                onClick={() => {
                  setSort("Most Viewed");
                  setOpenSort(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-[#2a2d3e]"
              >
                Most Viewed
              </button>
            </div>
          )}
        </div>

        {/* CHANNEL FILTER */}
        <div className="relative" ref={categoryRef}>
          <button
            onClick={() => setOpenCategory(!openCategory)}
            className="bg-[#1a1d2e] px-4 py-2 rounded-lg flex items-center gap-6"
          >
            {selectedCategory}
            <span>▼</span>
          </button>

          {openCategory && (
            <div className="absolute mt-2 bg-[#1a1d2e] rounded-lg shadow w-48 z-50 max-h-60 overflow-y-auto">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setSelectedCategory(c);
                    setOpenCategory(false);
                  }}
                  className={`block w-full text-left px-4 py-2 hover:bg-[#2a2d3e] ${
                    selectedCategory === c ? "text-white" : "text-gray-400"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
        <input
          type="text"
          placeholder="Search art..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#1a1d2e] px-4 py-2 rounded-lg text-sm"
        />

        <button
          onClick={() => navigate("/post-art")}
          className="bg-yellow-500 text-black px-5 py-2 rounded-lg font-semibold hover:scale-105 transition"
        >
          Post Art
        </button>
      </div>

      <div className="px-10 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredArtworks.map((art) => (
            <div
              key={art.id}
              onClick={() => navigate(`/art/${art.id}`)}
              className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-lg hover:scale-105 transition duration-300"
            >
              {art.media ? (
                <img
                  src={
                    art.media.startsWith("http")
                      ? art.media
                      : `http://localhost:5000/${art.media.replace(/\\/g, "/")}`
                  }
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
