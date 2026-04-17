import CardActions from "./CardActions";

const formatSalary = (min, max, currency) => {
  if (!min && !max) return null;
  const fmt = (v) =>
    currency === "IDR"
      ? `${(v / 1_000_000).toFixed(1)}M`
      : `$${(v / 1_000).toFixed(0)}K`;
  if (min && max) return `${fmt(min)} - ${fmt(max)} ${currency || ""}`;
  if (min) return `From ${fmt(min)} ${currency || ""}`;
  return `Up to ${fmt(max)} ${currency || ""}`;
};

const JobCollectionCard = ({ item, onClick, onEdit, onDelete }) => {
  const salary = formatSalary(item.salary_min, item.salary_max, item.salary_currency);

  return (
    <div
      onClick={onClick}
      className="group relative bg-white/[0.03] border border-white/5 border-l-2 border-l-emerald-400 rounded-xl overflow-hidden cursor-pointer hover:bg-white/[0.06] hover:border-white/10 hover:border-l-emerald-400 transition-all duration-200"
    >
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-[15px] text-gray-100 line-clamp-1 group-hover:text-white transition-colors duration-200">
          {item.title}
        </h3>

        {/* Location */}
        {item.job_location && (
          <p className="text-xs text-gray-500 mt-1 truncate">
            {item.job_location}
          </p>
        )}

        {/* Chips */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {item.work_option && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {item.work_option}
            </span>
          )}
          {item.work_type && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {item.work_type}
            </span>
          )}
          {salary && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              {salary}
            </span>
          )}
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Posted date */}
        {item.created_at && (
          <p className="text-[10px] text-gray-600 mt-3">
            Posted {new Date(item.created_at).toLocaleDateString("id-ID")}
          </p>
        )}

        {/* Actions */}
        <CardActions item={item} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
};

export default JobCollectionCard;
