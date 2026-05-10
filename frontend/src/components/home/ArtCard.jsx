import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { parseTags } from "../../utils/sanitize";

const isVideo = (path) =>
  /\.(mp4|webm|mkv|avi|mov|wmv|flv|m4v|ogv)$/i.test(path);

const mediaSrc = (media) =>
  media.startsWith("http")
    ? media
    : `/${media.replace(/\\/g, "/")}`;

const HeartIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
  </svg>
);

const EyeIcon = () => (
  <svg
    className="w-3 h-3"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const ArtCard = ({ art, index }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.play().catch(() => {});
  };

  const handleMouseLeave = () => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
  };

  return (
    <div
      onClick={() => navigate(`/art/${art.id}`)}
      className="animate-fade-in-up group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer transition-all-300 hover:scale-[1.04] hover:-translate-y-2 hover:shadow-2xl hover:shadow-black-/50"
      style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Media */}
      {art.media ? (
        isVideo(art.media) ? (
          <>
            <video
              ref={videoRef}
              src={mediaSrc(art.media)}
              muted
              playsInline
              loop
              preload="metadata"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full z-10">
              VIDEO
            </span>
          </>
        ) : (
          <img
            src={mediaSrc(art.media)}
            alt={art.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )
      ) : (
        <div className="w-full h-full bg-[#1a1d2e] flex items-center justify-center">
          <span className="text-gray-600 text-sm">No image</span>
        </div>
      )}

      {/* Bottom gradient — always partially visible */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Metadata — always visible on mobile, slides up on hover (md+) */}
      <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 md:translate-y-2 md:group-hover:translate-y-0 transition-transform duration-300">
        <p className="text-xs sm:text-sm font-semibold text-white truncate">{art.title}</p>
        <div className="flex items-center justify-between gap-2 mt-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 delay-75">
          <div className="flex flex-wrap gap-1 min-w-0">
            {parseTags(art.tag).map((t) => (
              <span
                key={t}
                className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-300 border border-yellow-400/20 font-medium"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2.5 text-[11px] text-gray-300 shrink-0">
            <span className="flex items-center gap-1">
              <HeartIcon /> {art.likes || 0}
            </span>
            <span className="flex items-center gap-1">
              <EyeIcon /> {art.views || 0}
            </span>
          </div>
        </div>
      </div>
      <div
        className="
        absolute inset-0 rounded-xl border border-transparent
        group-hover:border-yellow-400/40
        group-hover:shadow-[0_0_25px_rgba(255,221,0,0.15)]
        transition
        "
      />
    </div>
  );
};

export default ArtCard;
