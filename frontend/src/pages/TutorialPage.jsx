import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Film, Search } from "lucide-react";
import Navbar from "../components/layout/Navbar";

export default function TutorialPage() {
  const navigate = useNavigate();
  const [tutorials, setTutorials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        const response = await fetch("/api/tutorial");
        if (!response.ok) throw new Error("Gagal memuat data tutorial");

        const result = await response.json();
        const tutorialList = result.data || [];

        const tutorialsWithMedia = await Promise.all(
          tutorialList.map(async (tutorial) => {
            try {
              const mediaResponse = await fetch(
                `/api/tutorial-media/tutorial/${tutorial.id}`,
              );
              if (mediaResponse.ok) {
                const mediaResult = await mediaResponse.json();
                const rawMedia = mediaResult.data || [];

                // Normalisasi properti URL berdasarkan struktur key "media" dari API kamu
                const normalizedMedia = rawMedia.map((file) => {
                  // Mengambil dari file.media sesuai payload response API kamu
                  const rawUrl = file.media || file.url || file.image_url || file.path || "";
                  
                  // Gabungkan dengan host backend jika path-nya lokal (tidak diawali http)
                  const finalUrl = rawUrl.startsWith("http") ? rawUrl : `/${rawUrl}`;

                  return {
                    ...file,
                    url: finalUrl,
                  };
                });

                return { ...tutorial, media: normalizedMedia };
              }
            } catch (mediaError) {
              console.error(
                `Gagal mengambil media untuk tutorial ${tutorial.id}:`,
                mediaError,
              );
            }
            return { ...tutorial, media: [] };
          }),
        );
        setTutorials(tutorialsWithMedia);
      } catch (error) {
        console.error("Error fetching tutorials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorials();
  }, []);

  const handleViewTutorial = (tutorial) => {
    navigate(`/Asseting/${tutorial.id}`);
  };

  // FILTERING: Fitur pencarian berdasarkan judul tutorial
  const filteredTutorials = tutorials.filter((t) =>
    t.title?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] to-[#0b0f2a] text-white break-words [overflow-wrap:anywhere]">
      <Navbar />

      <div className="px-6 lg:px-10 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tutorials</h1>
            <p className="text-gray-400 text-sm mt-1">
              Explore step-by-step guides and asset media from administrators
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search tutorials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#020617] border border-white/10 rounded-lg text-sm outline-none focus:border-yellow-400 text-white placeholder-gray-500 transition-all"
            />
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex justify-center items-center h-64 text-gray-400 text-sm">
            Loading tutorials...
          </div>
        ) : filteredTutorials.length === 0 ? (
          <div className="flex justify-center items-center h-64 text-gray-500 text-sm">
            No tutorials found.
          </div>
        ) : (
          /* MAIN GRID CONTENT */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutorials.map((tutorial) => {
              // Menangkap item media indeks ke-0 (foto pertama) sebagai cover card
              const mainCover =
                tutorial.media && tutorial.media.length > 0
                  ? tutorial.media[0]
                  : null;

              return (
                <div
                  key={tutorial.id}
                  onClick={() => handleViewTutorial(tutorial)}
                  className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden hover:border-yellow-400/40 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    {/* Thumbnail / Cover */}
                    <div className="aspect-video bg-[#0d1117] relative overflow-hidden flex items-center justify-center border-b border-white/5">
                      {mainCover && mainCover.url ? (
                        <img
                          src={mainCover.url}
                          alt={tutorial.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://placehold.co/600x400/0d1117/ffffff?text=Image+Not+Found";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-1.5 bg-[#0a0f1d]">
                          <Film size={20} className="text-gray-700" />
                          <span className="text-[11px] uppercase tracking-wider font-medium text-gray-500">
                            No Cover Banner
                          </span>
                        </div>
                      )}

                      {/* Media Count Badge */}
                      <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur px-2.5 py-1 rounded-md text-[11px] text-gray-300 flex items-center gap-1">
                        <Film size={12} /> {tutorial.media?.length || 0} Media
                      </div>
                    </div>

                    {/* Text Area */}
                    <div className="p-5">
                      {/* Category Badge */}
                      <span className="inline-block text-[11px] font-medium px-2.5 py-1 rounded-full mb-3 bg-cyan-950/60 text-cyan-300">
                        Tutorial
                      </span>

                      {/* Title */}
                      <h2 className="text-sm font-semibold leading-snug line-clamp-2 mb-2 group-hover:text-yellow-400 transition-colors">
                        {tutorial.title}
                      </h2>

                      {/* Meta Info */}
                      <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                        <span>{tutorial.username || "Admin"}</span>
                        <span>·</span>
                        <span>
                          {tutorial.created_at
                            ? new Date(tutorial.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : ""}
                        </span>
                      </p>

                      {/* Short Content / Preview Description */}
                      <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
                        {tutorial.content}
                      </p>
                    </div>
                  </div>

                  {/* Footer Card */}
                  <div className="px-5 pb-5 pt-0">
                    <div className="mt-2 pt-4 border-t border-white/5 flex justify-between items-center">
                      <span className="text-yellow-400 text-xs font-semibold flex items-center gap-1 group-hover:text-yellow-300">
                        Read more →
                      </span>
                      <span className="text-xs text-gray-600">
                        {(tutorial.views || 0).toLocaleString()} views
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}