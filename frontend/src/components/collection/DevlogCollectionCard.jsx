import { useMemo } from "react";
import { parseTags } from "../../utils/sanitize";

const BASE_URL = "http://localhost:5000";

const DevlogCollectionCard = ({ item, onClick, onEdit, onDelete }) => {
  const cover = useMemo(() => {
    if (item.cover_image) return `${BASE_URL}/${item.cover_image}`;
    if (item.media?.length > 0) return `${BASE_URL}/${item.media[0].media}`;
    return null;
  }, [item]);

  const isPublished = item.status === "Published";
  const mediaCount = item.media?.length ?? 0;

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col bg-[#0c0f1d] border border-white/10 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-[2px] hover:border-indigo-400/40"
    >
      {/* COVER */}
      <div className="relative aspect-video bg-[#060914] overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={item.title || "Devlog cover"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0d1030] to-[#1a0e2e]">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect
                x="6"
                y="10"
                width="28"
                height="20"
                rx="2"
                stroke="rgba(139,120,255,0.3)"
                strokeWidth="1"
              />
              <polygon
                points="15,14 28,20 15,26"
                fill="rgba(139,120,255,0.25)"
              />
            </svg>
          </div>
        )}

        {/* SCANLINE */}
        <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.04)_2px,rgba(0,0,0,0.04)_4px)]" />

        {/* GRADIENT */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[#0c0f1d]" />

        {/* STATUS BADGE */}
        {item.status && (
          <span
            className={`absolute top-2 right-2 z-10 px-2 py-[2px] rounded-full text-[9px] font-mono tracking-widest uppercase border ${
              isPublished
                ? "bg-emerald-400/10 text-emerald-300 border-emerald-400/30"
                : "bg-yellow-400/10 text-yellow-300 border-yellow-400/30"
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
          <span className="text-[9px] font-mono tracking-[0.18em] text-indigo-300 uppercase">
            Devlog
          </span>

          {item.genre && (
            <>
              <div className="w-[3px] h-[3px] rounded-full bg-white/20" />
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider truncate">
                {item.genre}
              </span>
            </>
          )}
        </div>

        {/* TITLE */}
        <h3 className="text-sm font-semibold text-white/90 leading-snug line-clamp-2 mb-1">
          {item.title || "Untitled Devlog"}
        </h3>

        {/* TAG */}
        {item.tag && (
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 mb-1">
            {parseTags(item.tag).map((t) => (
              <span
                key={t}
                className="text-[10px] font-mono text-amber-300 tracking-wider"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* CONTENT */}
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

          {mediaCount > 0 && (
            <span className="flex items-center gap-1 text-[9px] font-mono text-white/30">
              <svg
                width="10"
                height="10"
                viewBox="0 0 16 16"
                fill="none"
                className="opacity-40"
              >
                <rect
                  x="1"
                  y="3"
                  width="10"
                  height="10"
                  rx="1.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path d="M11 6l4-2v8l-4-2V6z" fill="currentColor" />
              </svg>
              {mediaCount} media
            </span>
          )}
        </div>
      </div>

      {/* ACTIONS */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 px-3 pb-3 pt-6 bg-gradient-to-t from-[#0c0f1d] to-transparent opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 flex gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onEdit?.(item)}
          className="flex-1 py-1.5 text-[10px] font-mono tracking-wider rounded-md border border-indigo-400/30 text-indigo-300 bg-indigo-400/10 hover:opacity-80 transition"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete?.(item)}
          className="flex-1 py-1.5 text-[10px] font-mono tracking-wider rounded-md border border-red-400/30 text-red-300 bg-red-400/10 hover:opacity-80 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default DevlogCollectionCard;