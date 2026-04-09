import { useNavigate } from "react-router-dom";

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

const ChatBubbleIcon = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
    />
  </svg>
);

const PostCard = ({ post, index }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/post/${post.id}`)}
      className="animate-fade-in-up group relative bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden cursor-pointer hover:bg-white/[0.06] hover:border-white/10 transition-all duration-200"
      style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
    >
      {/* Accent bar */}
      <div className="h-1 bg-gradient-to-r from-emerald-500/60 via-teal-500/40 to-transparent" />

      <div className="p-5">
        {/* Tag pill + community badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full">
            <ChatBubbleIcon />
            {post.tag}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[15px] text-gray-100 mt-3 line-clamp-2 group-hover:text-white transition-colors duration-200">
          {post.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
          {post.description}
        </p>

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
          <span className="text-[11px] text-gray-600 group-hover:text-emerald-400/60 transition-colors duration-200">
            Join discussion &rarr;
          </span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
