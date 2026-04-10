import { useNavigate } from "react-router-dom";

const isVideo = (path) =>
  /\.(mp4|webm|mkv|avi|mov|wmv|flv|m4v|ogv)$/i.test(path);

const mediaSrc = (media) =>
  media.startsWith("http")
    ? media
    : `http://localhost:5000/${media.replace(/\\/g, "/")}`;

const HeartIcon = () => (
  <svg
    className="w-3 h-3"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
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

  return (
    <div
      onClick={() => navigate(`/art/${art.id}`)}
      className="animate-fade-in-up group relative aspect-[3/4] rounded-md overflow-hidden cursor-pointer"
      style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
    >
      {/* Media */}
      {art.media ? (
        isVideo(art.media) ? (
          <>
            <video
              src={mediaSrc(art.media)}
              muted
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
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Metadata — slides up on hover */}
      <div className="absolute inset-x-0 bottom-0 p-3 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <p className="text-sm font-semibold text-white truncate">{art.title}</p>
        <div className="flex items-center justify-between mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
          <span className="text-[11px] text-yellow-500/90 font-medium">
            {art.tag}
          </span>
          <div className="flex items-center gap-2.5 text-[11px] text-gray-300">
            <span className="flex items-center gap-1">
              <HeartIcon /> {art.likes || 0}
            </span>
            <span className="flex items-center gap-1">
              <EyeIcon /> {art.views || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtCard;
