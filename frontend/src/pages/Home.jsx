import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import api from "../services/api";

const isVideo = (path) =>
  /\.(mp4|webm|mkv|avi|mov|wmv|flv|m4v|ogv)$/i.test(path);

const Home = () => {
  const [artworks, setArtworks] = useState([]);
  const navigate = useNavigate();
  const [sort, setSort] = useState("Most Liked");
  const [openSort, setOpenSort] = useState(false);
  const [selectedArtCategory, setSelectedArtCategory] = useState("All");
  const [selectedPostCategory, setSelectedPostCategory] = useState("All");
  const [openCategory, setOpenCategory] = useState(false);
  const categoryRef = useRef();

  const [searchArt, setSearchArt] = useState("");
  const [searchPost, setSearchPost] = useState("");

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
        const resArt = await api.get("/concept-arts");
        const arts = resArt.data.art;

        const artsWithMedia = await Promise.all(
          arts.map(async (art) => {
            const resMedia = await api.get(`/art-media/art/${art.id}`);
            const allMedia = resMedia.data.data;
            const cover =
              allMedia.find((m) => !isVideo(m.media)) || allMedia[0] || null;
            return {
              ...art,
              media: cover ? cover.media : null,
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

  const artOnlyRaw = artworks.filter((item) => item.category === "art");
  const postOnlyRaw = artworks.filter((item) => item.category === "post");

  const artCategories = ["All", ...new Set(artOnlyRaw.map((art) => art.tag))];
  const postCategories = [
    "All",
    ...new Set(postOnlyRaw.map((post) => post.tag)),
  ];

  const filteredArtworks = artOnlyRaw
    .filter((art) => {
      if (selectedArtCategory === "All") return true;
      return art.tag === selectedArtCategory;
    })
    .filter((art) => art.title.toLowerCase().includes(searchArt.toLowerCase()))
    .sort((a, b) => {
      if (sort === "Most Liked") return (b.likes || 0) - (a.likes || 0);
      if (sort === "Most Viewed") return (b.views || 0) - (a.views || 0);
      return 0;
    });

  const filteredPosts = postOnlyRaw
    .filter((post) => {
      if (selectedPostCategory === "All") return true;
      return post.tag === selectedPostCategory;
    })
    .filter((post) =>
      post.title.toLowerCase().includes(searchPost.toLowerCase()),
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] to-[#0b0f2a] text-white">
      <Navbar />
      {/* Arts */}
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
            {selectedArtCategory}
            <span>▼</span>
          </button>

          {openCategory && (
            <div className="absolute mt-2 bg-[#1a1d2e] rounded-lg shadow w-48 z-50 max-h-60 overflow-y-auto">
              {artCategories.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setSelectedArtCategory(c);
                    setOpenCategory(false);
                  }}
                  className={`block w-full text-left px-4 py-2 hover:bg-[#2a2d3e] ${
                    selectedArtCategory === c ? "text-white" : "text-gray-400"
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
          value={searchArt}
          onChange={(e) => setSearchArt(e.target.value)}
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
                isVideo(art.media) ? (
                  <>
                    <video
                      src={
                        art.media.startsWith("http")
                          ? art.media
                          : `http://localhost:5000/${art.media.replace(/\\/g, "/")}`
                      }
                      muted
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                    <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded z-10">
                      VIDEO
                    </span>
                  </>
                ) : (
                  <img
                    src={
                      art.media.startsWith("http")
                        ? art.media
                        : `http://localhost:5000/${art.media.replace(/\\/g, "/")}`
                    }
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                )
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

      {/* POSTS SECTION */}
      <div className="px-10 mt-14">
        <p className="text-2xl mb-6">Posts</p>
        <div className="flex items-center gap-4 mb-6">
          <p className="text-lg">Filter Post:</p>

          <select
            value={selectedPostCategory}
            onChange={(e) => setSelectedPostCategory(e.target.value)}
            className="bg-[#1a1d2e] px-3 py-2 rounded"
          >
            {postCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search post..."
            value={searchPost}
            onChange={(e) => setSearchPost(e.target.value)}
            className="bg-[#1a1d2e] px-4 py-2 rounded-lg text-sm"
          />

          <button
            onClick={() => navigate("/post-form")}
            className="bg-yellow-500 text-black px-5 py-2 rounded-lg font-semibold hover:scale-105 transition"
          >
            Post Form
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => navigate(`/post/${post.id}`)}
              className="bg-[#1a1d2e] p-4 rounded-xl cursor-pointer hover:scale-105 transition"
            >
              {/* Badge */}
              <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded">
                POST
              </span>

              {/* Title */}
              <p className="font-semibold text-lg mt-2">{post.title}</p>

              {/* Tag */}
              <p className="text-sm text-gray-400">{post.tag}</p>

              {/* Description */}
              <p className="text-xs mt-3 text-gray-500 line-clamp-3">
                {post.description}
              </p>

              {/* Footer */}
              <div className="flex justify-between mt-4 text-xs text-gray-400">
                <span>👍 {post.likes || 0}</span>
                <span>👁 {post.views || 0}</span>
              </div>
            </div>
          ))}
        </div>

        {postOnlyRaw.length === 0 && (
          <p className="text-gray-500 mt-5">No posts yet.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
