import { useMemo } from "react";
import CardActions from "./CardActions";
import { parseTags } from "../../utils/sanitize";

const BACKEND_URL = "";

const TutorialCollectionCard = ({ item, onClick, onEdit, onDelete }) => {
  // Menggunakan useMemo untuk konsistensi penanganan image URL layaknya DevlogCard
  const imageUrl = useMemo(() => {
    if (!item.media || item.media.length === 0) return null;
    const firstImage = item.media[0].media;
    return firstImage.startsWith("http")
      ? firstImage
      : `${BACKEND_URL}/${firstImage}`;
  }, [item]);

  const isPublished = item.status === "Published";
  const isDrafted = item.status === "Draft";
  const isArchived = item.status === "Archived";

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col bg-[#0a0d1a] border border-white/[0.06] rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-[2px] hover:border-white/20"
    >
      {/* COVER / PREVIEW IMAGE */}
      <div className="relative aspect-video bg-[#060914] overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title || "Tutorial cover"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1c160e] to-[#291b07]">
            {/* Placeholder Icon bernuansa Amber/Tutorial */}
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(245,158,11,0.3)"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.967 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
          </div>
        )}

        {/* SCANLINE EFFECT */}
        <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.04)_2px,rgba(0,0,0,0.04)_4px)]" />

        {/* GRADIENT OVERLAY */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[#0a0d1a]" />

        {/* STATUS BADGE (ABSOLUTE) */}
        {item.status && (
          <span
            className={`absolute top-2 right-2 z-10 px-2 py-[2px] rounded-full text-[9px] font-mono tracking-widest uppercase border ${
              isPublished
                ? "bg-amber-400/10 text-amber-300 border-amber-400/30"
                : isDrafted
                  ? "bg-blue-400/10 text-blue-300 border-blue-400/30"
                  : isArchived
                    ? "bg-yellow-400/10 text-yellow-300 border-yellow-400/30"
                    : "bg-amber-400/10 text-amber-300 border-amber-400/30"
            }`}
          >
            {item.status}
          </span>
        )}
      </div>

      {/* BODY */}
      <div className="flex flex-col flex-1 px-3 py-3">
        {/* LABEL */}
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[9px] font-mono tracking-[0.18em] text-amber-400 uppercase">
            Tutorial
          </span>
        </div>

        {/* TITLE */}
        <h3 className="text-sm font-semibold text-white/90 leading-snug line-clamp-2 mb-1 group-hover:text-amber-300 transition-colors">
          {item.title || "Untitled Tutorial"}
        </h3>

        {/* TAGS */}
        {item.tag && (
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 mb-1">
            {parseTags(item.tag).map((t) => (
              <span
                key={t}
                className="text-[10px] font-mono text-amber-500/80 tracking-wider"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* CONTENT DESKRIPSI */}
        {item.content && (
          <p className="text-[11px] font-mono text-white/40 leading-relaxed line-clamp-2 mb-2">
            {item.content}
          </p>
        )}

        {/* FOOTER */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
          <span className="text-[9px] font-mono text-white/30 tracking-wide">
            {new Date(item.created_at).toLocaleDateString("id-ID")}
          </span>

          <span className="text-[9px] font-mono text-white/30 flex items-center gap-1">
            {item.views || 0} views
          </span>
        </div>
      </div>

      {/* ACTIONS OVERLAY (Aksi muncul halus dari bawah saat hover) */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 px-3 pb-3 pt-6 bg-gradient-to-t from-[#0a0d1a] to-transparent opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <CardActions item={item} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
};

export default TutorialCollectionCard;
