import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import HeroSection from "../components/home/HeroSection";
import FilterToolbar from "../components/home/FilterToolbar";
import ArtCard from "../components/home/ArtCard";
import PostCard from "../components/home/PostCard";
import IdeationCard from "../components/home/IdeationCard";
import FloatingCreateButton from "../components/home/FloatingCreateButton";
import PostFormModal from "../components/home/PostFormModal";
import api from "../services/api";

const isVideo = (path) =>
  /\.(mp4|webm|mkv|avi|mov|wmv|flv|m4v|ogv)$/i.test(path);

const POSTS_PREVIEW_COUNT = 6;

const Home = () => {
  const [artworks, setArtworks] = useState([]);
  const [sort, setSort] = useState("Most Liked");
  const [selectedArtCategory, setSelectedArtCategory] = useState("All");
  const [searchArt, setSearchArt] = useState("");

  // Posts section — shared between ideation & community
  const [postsMode, setPostsMode] = useState("ideation");
  const [selectedPostCategory, setSelectedPostCategory] = useState("All");
  const [searchPost, setSearchPost] = useState("");
  const [showAllPosts, setShowAllPosts] = useState(false);

  // Post form modal
  const [postFormOpen, setPostFormOpen] = useState(false);
  const [postFormType, setPostFormType] = useState("post");
  const [fetchKey, setFetchKey] = useState(0);

  const handleCreatePost = (type) => {
    setPostFormType(type);
    setPostFormOpen(true);
  };

  const handlePostCreated = () => {
    setPostFormOpen(false);
    setFetchKey((k) => k + 1);
  };

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
  }, [fetchKey]);

  // Reset filters when switching modes
  const handleModeSwitch = (mode) => {
    setPostsMode(mode);
    setSelectedPostCategory("All");
    setSearchPost("");
    setShowAllPosts(false);
  };

  // Split by category
  const artOnly = artworks.filter((item) => item.category === "art");
  const ideationOnly = artworks.filter((item) => item.category === "post");
  const communityOnly = artworks.filter(
    (item) => item.category === "community",
  );

  // Art filters
  const artCategories = ["All", ...new Set(artOnly.map((a) => a.tag))];

  const filteredArtworks = artOnly
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

  // Posts filters (driven by postsMode toggle)
  const activePostsRaw =
    postsMode === "ideation" ? ideationOnly : communityOnly;

  const postCategories = [
    "All",
    ...new Set(activePostsRaw.map((p) => p.tag)),
  ];

  const filteredPosts = activePostsRaw
    .filter((post) => {
      if (selectedPostCategory === "All") return true;
      return post.tag === selectedPostCategory;
    })
    .filter((post) =>
      post.title.toLowerCase().includes(searchPost.toLowerCase()),
    );

  const visiblePosts = showAllPosts
    ? filteredPosts
    : filteredPosts.slice(0, POSTS_PREVIEW_COUNT);


  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] to-[#0b0f2a] text-white">
      <Navbar />
      <HeroSection />

      {/* ──── ART GALLERY (full-width, outside container) ──── */}
      <section id="art-section" className="scroll-mt-14">
        <FilterToolbar
          type="art"
          sort={sort}
          setSort={setSort}
          categories={artCategories}
          selectedCategory={selectedArtCategory}
          setSelectedCategory={setSelectedArtCategory}
          search={searchArt}
          setSearch={setSearchArt}
          count={filteredArtworks.length}
        />

        <div className="px-1.5 pb-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5">
            {filteredArtworks.map((art, i) => (
              <ArtCard key={art.id} art={art} index={i} />
            ))}
          </div>

          {filteredArtworks.length === 0 && (
            <p className="text-gray-500 text-center mt-16 text-sm">
              No artworks found.
            </p>
          )}
        </div>
      </section>

      {/* ──── DIVIDER ──── */}
      <div className="px-4 sm:px-6">
        <div className="border-t border-white/5" />
      </div>

      {/* ──── POSTS SECTION ──── */}
      <section id="posts-section" className="scroll-mt-14 pt-2">
        {/* Header: title + pill toggle + description */}
        <div className="px-4 sm:px-6 pt-8 pb-1">
          <div className="flex items-center flex-wrap gap-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {postsMode === "ideation" ? "Ideation" : "Community"}
            </h2>

            {/* Pill toggle */}
            <div className="flex items-center bg-white/5 rounded-lg p-0.5">
              <button
                onClick={() => handleModeSwitch("ideation")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                  postsMode === "ideation"
                    ? "bg-blue-500 text-white shadow-sm shadow-blue-500/25"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Ideation
                <span
                  className={`ml-1 text-[10px] ${
                    postsMode === "ideation" ? "text-blue-200" : "text-gray-600"
                  }`}
                >
                  {ideationOnly.length}
                </span>
              </button>
              <button
                onClick={() => handleModeSwitch("community")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                  postsMode === "community"
                    ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/25"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Community
                <span
                  className={`ml-1 text-[10px] ${
                    postsMode === "community"
                      ? "text-emerald-200"
                      : "text-gray-600"
                  }`}
                >
                  {communityOnly.length}
                </span>
              </button>
            </div>

            <span className="text-[11px] text-gray-600 hidden sm:inline">
              &mdash;{" "}
              {postsMode === "ideation"
                ? "Game concepts & collaboration requests"
                : "Discussions, tutorials & insights"}
            </span>
          </div>
        </div>

        <FilterToolbar
          type={postsMode}
          categories={postCategories}
          selectedCategory={selectedPostCategory}
          setSelectedCategory={setSelectedPostCategory}
          search={searchPost}
          setSearch={setSearchPost}
          count={filteredPosts.length}
        />

        <div className="px-4 sm:px-6 pb-20">
          <div
            key={postsMode}
            className="animate-fade-in grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
          >
            {visiblePosts.map((post, i) =>
              postsMode === "ideation" ? (
                <IdeationCard key={post.id} post={post} index={i} />
              ) : (
                <PostCard key={post.id} post={post} index={i} />
              ),
            )}
          </div>

          {filteredPosts.length > POSTS_PREVIEW_COUNT && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setShowAllPosts(!showAllPosts)}
                className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 hover:bg-white/10 hover:border-white/15 transition-all duration-200"
              >
                {showAllPosts
                  ? "Show Less"
                  : `See All (${filteredPosts.length})`}
              </button>
            </div>
          )}

          {filteredPosts.length === 0 && (
            <p className="text-gray-500 text-center mt-16 text-sm">
              {postsMode === "ideation"
                ? "No ideation posts yet. Share your game concept!"
                : "No community posts yet. Start a discussion!"}
            </p>
          )}
        </div>
      </section>

      <FloatingCreateButton onCreatePost={handleCreatePost} />
      <PostFormModal
        isOpen={postFormOpen}
        onClose={() => setPostFormOpen(false)}
        initialType={postFormType}
        onSuccess={handlePostCreated}
      />
    </div>
  );
};

export default Home;
