import CardActions from "./CardActions";
import { parseTags } from "../../utils/sanitize";

const HeartIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const PostCollectionCard = ({ item, onClick, onEdit, onDelete }) => {
  return (
    <div
      onClick={onClick}
      className="group relative bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden cursor-pointer hover:bg-white/[0.06] hover:border-white/10 transition-all duration-200"
    >
      {/* Accent bar */}
      <div className="h-1 bg-gradient-to-r from-blue-500/60 via-purple-500/40 to-transparent" />

      <div className="p-5">
        {/* Tag pill */}
        <div className="flex flex-wrap items-center gap-2">
          {parseTags(item.tag).map((t) => (
            <span
              key={t}
              className="inline-block text-[11px] font-medium bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded-full"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[15px] text-gray-100 mt-3 line-clamp-2 group-hover:text-white transition-colors duration-200">
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
          {item.description}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-4 pt-3 border-t border-white/5">
          <span className="flex items-center gap-1">
            <HeartIcon /> {item.likes || 0}
          </span>
          <span className="flex items-center gap-1">
            <EyeIcon /> {item.views || 0}
          </span>
        </div>

        {/* Actions */}
        <CardActions item={item} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
};

export default PostCollectionCard;
