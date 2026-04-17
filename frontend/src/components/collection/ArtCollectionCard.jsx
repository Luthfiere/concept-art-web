import { useState } from "react";
import { TYPE_CONFIG } from "./constants";
import CardActions from "./CardActions";

const renderMedia = (item) => {
  const firstMedia = item.media?.[0];
  if (!firstMedia) {
    if (item.type === "post") {
      return (
        <div className="w-full h-full flex items-end p-5 bg-gradient-to-br from-[#0d1b2a] to-[#1a2744]">
          <p className="text-sm text-white font-semibold leading-snug line-clamp-4 opacity-90">
            {item.title}
          </p>
        </div>
      );
    }
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#0f0f1a] to-[#1a1030]">
        <span className="text-4xl opacity-10">{"\u{1F3A8}"}</span>
        <span className="text-[10px] text-white/20 tracking-widest uppercase">
          No Media
        </span>
      </div>
    );
  }
  const src = firstMedia.media;
  const isVideo = src?.match(/\.(mp4|webm|ogg)$/i);
  if (isVideo) {
    return (
      <video
        src={src}
        muted
        loop
        playsInline
        preload="metadata"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
    );
  }
  return (
    <img
      src={src}
      alt={item.title}
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
    />
  );
};

const ArtCollectionCard = ({ item, onClick, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.art;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer
        bg-[#0a0d1a] border transition-all duration-300
        ${
          isHovered
            ? `${cfg.border} -translate-y-1 scale-[1.01] shadow-2xl`
            : "border-white/[0.06] shadow-lg"
        }
      `}
    >
      {/* MEDIA */}
      <div className="absolute inset-0 overflow-hidden">
        {renderMedia(item)}
      </div>

      {/* GRADIENT OVERLAY */}
      <div
        className={`
          pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent
          transition-opacity duration-300
          ${isHovered ? "opacity-100" : "opacity-50"}
        `}
      />

      {/* TYPE BADGE */}
      <div
        className={`
          absolute top-2 left-2 flex items-center gap-1.5
          bg-black/55 backdrop-blur-md border rounded-lg px-2 py-1
          ${cfg.badge}
        `}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        <span className="text-[9px] font-bold tracking-widest uppercase">
          {cfg.label}
        </span>
      </div>

      {/* HOVER CONTENT */}
      <div
        className={`
          absolute bottom-0 left-0 right-0 p-3 transition-all duration-300
          ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
        `}
      >
        {item.title && (
          <p className="text-xs font-semibold text-white leading-snug line-clamp-2 mb-2">
            {item.title}
          </p>
        )}
        <CardActions item={item} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
};

export default ArtCollectionCard;
