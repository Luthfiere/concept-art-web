import { useNavigate } from "react-router-dom";

const isVideo = (path) =>
  /\.(mp4|webm|mkv|avi|mov|wmv|flv|m4v|ogv)$/i.test(path);

const isDocument = (path) =>
  /\.(pdf|doc|docx|xls|xlsx|zip|rar|txt)$/i.test(path);

const DocumentIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
    />
  </svg>
);

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

const IdeationCard = ({ post, index }) => {
  const navigate = useNavigate();

  const hasDocument = post.media && isDocument(post.media);
  const hasVideo = post.media && isVideo(post.media);
  const hasImage = post.media && !hasDocument && !hasVideo;

  return (
    <div
      onClick={() => navigate(`/post/${post.id}`)}
      className="animate-fade-in-up group relative bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden cursor-pointer hover:bg-white/[0.06] hover:border-white/10 transition-all duration-200"
      style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
    >
      {/* Accent bar */}
      <div className="h-1 bg-gradient-to-r from-blue-500/60 via-purple-500/40 to-transparent" />

      <div className="p-5">
        {/* Top row: tag + attachment indicator */}
        <div className="flex items-center justify-between">
          <span className="inline-block text-[11px] font-medium bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded-full">
            {post.tag}
          </span>
          {(hasDocument || hasImage || hasVideo) && (
            <span className="flex items-center gap-1 text-[10px] text-gray-500">
              <DocumentIcon />
              {hasDocument ? "PDF/Doc" : hasVideo ? "Video" : "Image"}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[15px] text-gray-100 mt-3 line-clamp-2 group-hover:text-white transition-colors duration-200">
          {post.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
          {post.description}
        </p>

        {/* Call to action hint */}
        <div className="mt-3 px-3 py-2 rounded-lg bg-blue-500/[0.05] border border-blue-500/10">
          <p className="text-[11px] text-blue-400/70 italic">
            Looking for creative collaborators
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <HeartIcon /> {post.likes || 0}
            </span>
            <span className="flex items-center gap-1">
              <EyeIcon /> {post.views || 0}
            </span>
          </div>
          <span className="text-[11px] text-gray-600 group-hover:text-blue-400/60 transition-colors duration-200">
            View idea &rarr;
          </span>
        </div>
      </div>
    </div>
  );
};

export default IdeationCard;
