import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

const MAX_MEDIA = 8;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

const TAGS_OPTIONS = [
  "3D Modeling",
  "Sculpting",
  "Texturing",
  "Rigging",
  "Animation",
  "Retopology",
  "UV Unwrapping",

  "2D Art",
  "Pixel Art",
  "Vector",
  "Concept Art",
  "Sprite Sheet",
  "Texture Mapping",
  "UI Design",

  "Blender",
  "Substance Painter",
  "Photoshop",
  "Maya",
  "ZBrush",
  "Aseprite",
  "Figma",

  "Unity",
  "Unreal Engine",
  "Godot",
  "Roblox Studio",

  "VFX",
  "Shaders",
  "Particle System",
  "Lighting",
  "Baking",

  "Level Design",
  "Audio",
  "SFX",
  "Music",

  "Dasar (Beginner)",
  "Menengah (Intermediate)",
  "Mahir (Advanced)",
];

const PostAsseting = () => {
  const navigate = useNavigate();

  // State untuk Data Teks Tutorial
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  // State UI Dropdown Checkbox
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // State untuk Data Media (Gambar)
  const [selectedImages, setSelectedImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  // State UI / Status
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTagChange = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > MAX_MEDIA) {
      alert(
        `Maksimal media yang boleh diunggah adalah ${MAX_MEDIA} file (gambar/video).`,
      );
      e.target.value = "";
      return;
    }

    const invalidFiles = [];

    files.forEach((file) => {
      const isVideo = file.type.startsWith("video/");
      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

      if (file.size > maxSize) {
        const limitLabel = isVideo ? "50MB" : "5MB";
        invalidFiles.push(`${file.name} — melebihi batas ${limitLabel}`);
      }
    });

    if (invalidFiles.length > 0) {
      alert(`Beberapa file tidak valid:\n\n${invalidFiles.join("\n")}`);
      e.target.value = "";
      return;
    }

    setSelectedImages(files);
    const filePreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      isVideo: file.type.startsWith("video/"),
    }));
    setPreviews(filePreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("Judul (title) dan isi materi (content) wajib diisi!");
      return;
    }

    if (selectedTags.length === 0) {
      alert("Pilih minimal satu Tag / Kategori!");
      return;
    }

    setLoading(true);
    setMessage("");
    setIsSuccess(false);

    try {
      const token = localStorage.getItem("token");

      setMessage("Membuat artikel tutorial...");
      const textResponse = await fetch("/api/tutorial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          tag: selectedTags.join(", "),
        }),
      });

      const textData = await textResponse.json();
      if (!textResponse.ok) {
        throw new Error(textData.message || "Gagal membuat tutorial text.");
      }

      const createdTutorialId = textData.data?.id || textData.data?.tutorial_id;
      if (!createdTutorialId) {
        throw new Error("Gagal mendapatkan ID Tutorial dari server.");
      }
      if (selectedImages.length > 0) {
        setMessage("Mengunggah media tutorial pendukung...");
        const formData = new FormData();
        selectedImages.forEach((image) => {
          formData.append("media", image);
        });

        const mediaResponse = await fetch(
          `/api/tutorial-media/tutorial/${createdTutorialId}`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          },
        );

        const mediaData = await mediaResponse.json();
        if (!mediaResponse.ok) {
          throw new Error(
            mediaData.message ||
              "Tutorial teks berhasil dibuat, namun gagal mengunggah gambar pendukung.",
          );
        }
      }

      setIsSuccess(true);
      setMessage("Tutorial dan Media pendukung sukses dipublikasikan!");

      // Reset Form input
      setTitle("");
      setContent("");
      setSelectedTags([]);
      setSelectedImages([]);
      setPreviews([]);

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error(error);
      setIsSuccess(false);
      setMessage(error.message || "Terjadi masalah saat memproses data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-lg">
          <div className="border-b border-white/5 pb-4 mb-6">
            <h1 className="text-xl font-bold text-yellow-400">
              Create New Tutorial
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Halaman Khusus Moderator — Publikasikan tutorial teks beserta
              gambar lampirannya secara langsung.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* INPUT TITLE */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Judul Tutorial *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Belajar Scripting Dasar untuk Pemula"
                className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-yellow-400 text-sm text-white transition"
                required
              />
            </div>

            {/* INPUT CONTENT */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Konten Materi Tutorial *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tuliskan materi tutorial atau langkah-langkah lengkapnya di sini..."
                rows={6}
                className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-yellow-400 text-sm text-white transition resize-y"
                required
              />
            </div>

            {/* CUSTOM DROPDOWN CHECKBOX */}
            <div ref={dropdownRef} className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Tag / Kategori *
              </label>

              {/* Tombol Utama Dropdown */}
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-yellow-400 text-sm text-white transition text-left"
              >
                <span className="truncate">
                  {selectedTags.length > 0
                    ? selectedTags.join(", ")
                    : "Pilih Kategori Tutorial (multiselect)"}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Panel Menu Checkbox */}
              {isOpen && (
                <div className="absolute z-10 w-full mt-2 bg-[#1f2937] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto p-2 space-y-1">
                  {TAGS_OPTIONS.map((option) => {
                    const isChecked = selectedTags.includes(option);
                    return (
                      <label
                        key={option}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer transition select-none ${
                          isChecked
                            ? "bg-yellow-400/10 text-yellow-400 font-medium"
                            : "hover:bg-white/5 text-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTagChange(option)}
                          className="w-4 h-4 rounded text-yellow-400 bg-black/40 border-white/10 focus:ring-0 focus:ring-offset-0 accent-yellow-400"
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* INPUT MEDIA FILES (MULTIPLE IMAGES) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Gambar Pendukung / Screenshots (Opsional)
              </label>
              <div className="border-2 border-dashed border-white/10 hover:border-yellow-400/50 rounded-xl p-5 text-center cursor-pointer transition relative bg-black/10">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/mp4,video/webm,video/quicktime,video/ogg"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <svg
                  className="mx-auto h-8 w-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="mt-2 text-xs text-gray-300">
                  Klik atau drag berkas gambar ke area ini
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  Maksimum {MAX_MEDIA} file (gambar atau video) • Gambar maks
                  5MB, video maks 50MB per file
                </p>
              </div>
            </div>

            {/* IMAGE PREVIEWS */}
            {previews.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-400 mb-2">
                  Pratinjau Media Terpilih ({previews.length}/8):
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {previews.map((p, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border border-white/10 bg-black/30"
                    >
                      {p.isVideo ? (
                        <video
                          src={p.url}
                          muted
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={p.url}
                          alt={`preview-${index}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STATUS NOTIFIKASI */}
            {message && (
              <div
                className={`p-3 rounded-xl text-xs transition border ${
                  isSuccess
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : "bg-blue-500/5 text-yellow-400 border-yellow-400/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  {loading && (
                    <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>{message}</span>
                </div>
              </div>
            )}

            {/* TOMBOL AKSI */}
            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={loading}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition disabled:opacity-40"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md transition hover:shadow-yellow-400/10 disabled:opacity-50"
              >
                {loading ? "Memproses..." : "Publish Tutorial"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostAsseting;
