import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  User,
  Film,
  ArrowLeft,
  Eye,
  Tag,
  X,
  Download,
  Play,
} from "lucide-react";
import Navbar from "../layout/Navbar";

export default function TutorialDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutorial, setTutorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  const isVideoMedia = (media) => {
    if (!media) return false;
    if (
      media.mimetype?.startsWith("video/") ||
      media.type?.startsWith("video/")
    ) {
      return true;
    }
    const url = media.url || "";
    return /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url);
  };

  // Handler tombol Escape untuk menutup lightbox
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setPreviewImage(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    const fetchTutorialDetail = async () => {
      try {
        // 1. Fetch detail tutorial berdasarkan ID (/api/tutorial/3)
        const response = await fetch(`/api/tutorial/${id}`);
        if (!response.ok) throw new Error("Tutorial tidak ditemukan");

        const result = await response.json();
        const tutorialData = result.data; // Mengambil objek tunggal di dalam properti 'data'

        // Hit endpoint view (increment) ke server ketika halaman diakses
        try {
          await fetch(`/api/tutorial/${id}/view`, { method: "POST" });
        } catch (e) {
          console.error("Gagal memperbarui jumlah views di server:", e);
        }

        // 2. Fetch daftar attachment media untuk tutorial terkait
        try {
          const mediaResponse = await fetch(
            `/api/tutorial-media/tutorial/${id}`,
          );
          if (mediaResponse.ok) {
            const mediaResult = await mediaResponse.json();
            const rawMedia = mediaResult.data || [];

            // Normalisasi penamaan properti URL gambar dengan base URL localhost:5000
            tutorialData.media = rawMedia.map((file) => {
              // Menangkap key "media" dari database kamu
              const rawUrl =
                file.media || file.url || file.image_url || file.path || "";

              // Sambungkan dengan port backend jika jalurnya lokal
              const finalUrl = rawUrl.startsWith("http")
                ? rawUrl
                : `/${rawUrl}`;

              return {
                ...file,
                url: finalUrl,
              };
            });
          } else {
            tutorialData.media = [];
          }
        } catch (mediaError) {
          console.error("Gagal memuat media tambahan:", mediaError);
          tutorialData.media = [];
        }

        setTutorial(tutorialData);
      } catch (error) {
        console.error("Error fetching tutorial detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorialDetail();
  }, [id]);

  // Handler Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center">
        <p className="text-gray-400 text-sm animate-pulse">
          Loading tutorial detail...
        </p>
      </div>
    );
  }

  // Handler Error Data Kosong
  if (!tutorial) {
    return (
      <div className="min-h-screen bg-[#050816] text-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400 text-sm">Tutorial tidak ditemukan.</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer"
        >
          Kembali
        </button>
      </div>
    );
  }

  const tagsArray = tutorial.tag
    ? tutorial.tag.split(",").map((t) => t.trim())
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] to-[#0b0f2a] text-white break-words [overflow-wrap:anywhere]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tombol Kembali */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-yellow-400 transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Tutorials
        </button>

        {/* Header Konten */}
        <div className="mb-6">
          <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider block mb-2">
            Tutorial Post
          </span>
          <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-4">
            {tutorial.title}
          </h1>

          {/* Metadata Grid */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 border-b border-white/10 pb-6">
            <div className="flex items-center gap-1.5">
              <User size={14} className="text-gray-500" />
              <span>By {tutorial.username || "Admin"}</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-gray-500" />
              <span>
                {tutorial.created_at
                  ? new Date(tutorial.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : ""}
              </span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5">
              <Eye size={14} className="text-yellow-400" />
              <span className="text-yellow-400">
                {tutorial.views || 0} views
              </span>
            </div>
          </div>
        </div>

        {/* Main Banner / Thumbnail Utama (Hanya muncul jika array media ke-0 ada) */}
        {tutorial.media &&
          tutorial.media.length > 0 &&
          tutorial.media[0]?.url && (
            <div className="rounded-xl overflow-hidden border border-white/5 mb-8 aspect-video bg-black shadow-xl flex items-center justify-center">
              {isVideoMedia(tutorial.media[0]) ? (
                <video
                  src={tutorial.media[0].url}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <img
                  src={tutorial.media[0].url}
                  alt="Cover Banner"
                  onClick={() => setPreviewImage(tutorial.media[0].url)}
                  className="w-full h-full object-cover cursor-zoom-in"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/800x450/0d1117/ffffff?text=Image+Not+Found";
                  }}
                />
              )}
            </div>
          )}

        {/* Isi Konten Panduan */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-200 mb-3">
            Description & Tutorial Content
          </h3>
          <div className="bg-[#111827]/50 p-6 md:p-8 rounded-xl border border-white/5 text-base text-gray-300 leading-relaxed whitespace-pre-line shadow-inner">
            {tutorial.content}
          </div>
        </div>

        {/* Bagian Loop Tags */}
        {tagsArray.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <Tag size={14} className="text-gray-500" />
            {tagsArray.map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-[#1e293b] text-gray-300 px-3 py-1 rounded-md border border-white/5"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Galeri Lampiran Media Tambahan (Hanya merender media sisa/index ke-1 dst.) */}
        {tutorial.media && tutorial.media.length > 1 && (
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-1.5">
              <Film size={16} className="text-yellow-400" />
              Attachment & Additional Media ({tutorial.media.length - 1})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-[#020617]/40 p-4 rounded-xl border border-white/5">
              {tutorial.media.slice(1).map((file, idx) =>
                isVideoMedia(file) ? (
                  <div
                    key={idx}
                    className="relative rounded-lg overflow-hidden border border-white/10 aspect-video bg-black"
                  >
                    <video
                      src={file.url}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    key={idx}
                    className="relative rounded-lg overflow-hidden border border-white/10 aspect-video bg-black group/img cursor-zoom-in"
                    onClick={() => setPreviewImage(file.url)}
                  >
                    <img
                      src={file.url}
                      alt={`Asset-Attachment-${idx}`}
                      className="w-full h-full object-cover opacity-80 group-hover/img:opacity-100 group-hover/img:scale-105 transition-all duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/600x400/0d1117/ffffff?text=Image+404";
                      }}
                    />
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {/* LIGHTBOX PREVIEW MODAL — di luar blok gallery, jadi selalu bisa
            muncul walau tutorial cuma punya 1 media (banner saja) */}
        {previewImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
            onClick={() => setPreviewImage(null)}
          >
            {/* Tombol Close */}
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Tombol Download */}
            <a
              href={previewImage}
              download
              onClick={(e) => e.stopPropagation()}
              className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              <Download size={16} />
              Download
            </a>

            {/* Gambar Full Size */}
            <img
              src={previewImage}
              alt="Preview"
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        )}
      </div>
    </div>
  );
}