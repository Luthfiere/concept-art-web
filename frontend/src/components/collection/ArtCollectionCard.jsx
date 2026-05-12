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
  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.art;

  return (
    <div
      onClick={onClick}
      className="
        group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer
        bg-[#0a0d1a] border border-white/[0.06] shadow-lg
        transition-all duration-300
        hover:-translate-y-1 hover:scale-[1.01] hover:shadow-2xl hover:border-white/20
      "
    >
      {/* MEDIA */}
      <div className="absolute inset-0 overflow-hidden">
        {renderMedia(item)}
      </div>

      {/* GRADIENT OVERLAY */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

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

      {/* BOTTOM STRIP — title + actions, always visible */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
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
