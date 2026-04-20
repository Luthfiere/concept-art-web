import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../layout/Navbar";

const API_BASE = "http://localhost:5000/api";
const BASE_URL = "http://localhost:5000";

export default function DevlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [devlog, setDevlog] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetchDevlog();
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (!devlog) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-[#fa5c5c] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#888] text-sm tracking-widest uppercase">
          Loading devlog
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] to-[#0b0f2a] text-white font-sans">
      <Navbar />

      {/* HERO */}
      {devlog.cover_image ? (
        <div className="relative w-full h-[420px] overflow-hidden">
          <img
            src={devlog.cover_image}
            alt={devlog.title}
            className="w-full h-full object-cover brightness-90 hover:scale-[1.02] transition"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f2a] via-transparent to-transparent" />
        </div>
      ) : (
        <div className="w-full h-[320px] bg-gradient-to-br from-[#050816] via-[#0b0f2a] to-[#111827]" />
      )}

      {/* BACK */}
      <div className="max-w-6xl mx-auto px-6 pt-10">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-400 hover:text-yellow-400 flex items-center gap-2 mb-8"
        >
          ← Back to devlogs
        </button>
      </div>

      {/* MAIN */}
      <div className="max-w-6xl mx-auto px-6 pb-20 grid md:grid-cols-[1fr_280px] gap-10">
        {/* ARTICLE */}
        <article>
          {/* CATEGORY */}
          <span className="text-xs uppercase tracking-widest text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-3 py-1 rounded">
            {devlog.category || "Devlog"}
          </span>

          {/* TITLE */}
          <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-4 leading-tight">
            {devlog.title}
          </h1>

          {/* TAGS */}
          <div className="flex flex-wrap gap-2 mb-6">
            {devlog.genre && (
              <span className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-300">
                {devlog.genre}
              </span>
            )}
            {devlog.tag && (
              <span className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-400 hover:text-yellow-400 hover:border-yellow-400/40 transition">
                #{devlog.tag}
              </span>
            )}
          </div>

          {/* META */}
          <div className="flex items-center gap-4 border-y border-white/10 py-4 mb-8">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-black flex items-center justify-center text-sm font-bold">
              {getInitials(devlog.username)}
            </div>

            <div className="text-sm font-medium text-gray-200">
              {devlog.username}
            </div>

            <span className="text-gray-600">·</span>

            <div className="text-sm text-gray-400">
              {formatDate(devlog.created_at)}
            </div>
          </div>

          {/* CONTENT */}
          <div className="text-gray-300 leading-relaxed whitespace-pre-line text-[15px]">
            {devlog.content}
          </div>
        </article>

        {/* SIDEBAR */}
        <aside className="space-y-5">
          {/* ABOUT */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-5">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">
              About
            </p>

            <p className="text-sm text-gray-200 mb-4">{devlog.title}</p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Genre</span>
                <span className="text-gray-300">{devlog.genre || "—"}</span>
              </div>

              <div className="flex justify-between text-gray-400">
                <span>Category</span>
                <span className="text-gray-300">{devlog.category || "—"}</span>
              </div>

              <div className="flex justify-between text-gray-400">
                <span>Published</span>
                <span className="text-gray-300">
                  {formatDate(devlog.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* STATS (REAL DATA) */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-5">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">
              Stats
            </p>

            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Views</span>
              <span className="text-gray-300">
                {(devlog.views || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Likes</span>
              <span className="text-gray-300">
                {(devlog.like_count || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between text-sm text-gray-400">
              <span>Comments</span>
              <span className="text-gray-300">
                {(devlog.comment_count || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* SHARE (SIMPLE VERSION) */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-5">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">
              Share
            </p>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied!");
              }}
              className="w-full bg-yellow-400 text-black py-2 rounded text-sm font-semibold hover:bg-yellow-300 transition"
            >
              Copy Link
            </button>
          </div>

          {/* AUTHOR */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-5">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-4">
              Author
            </p>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-black flex items-center justify-center font-bold">
                {getInitials(devlog.username)}
              </div>

              <div>
                <p className="text-sm font-medium text-white">
                  {devlog.username}
                </p>
                <p className="text-xs text-gray-500">indie developer</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* SCROLL TO TOP */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 right-6 w-10 h-10 rounded-full bg-yellow-400 text-black flex items-center justify-center transition ${
          scrolled ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        ↑
      </button>
    </div>
  );
}
