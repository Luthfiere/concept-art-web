import { STATUS_CONFIG } from "./constants";
import CardActions from "./CardActions";

const ApplicationCollectionCard = ({ item, onClick, onEdit, onDelete }) => {
  const statusStyle = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;

  return (
    <div
      onClick={onClick}
      className="group relative bg-white/[0.03] border border-white/5 border-l-2 border-l-red-400 rounded-xl overflow-hidden cursor-pointer hover:bg-white/[0.06] hover:border-white/10 hover:border-l-red-400 transition-all duration-200"
    >
      <div className="p-4">
        {/* Status badge */}
        <div
          className={`inline-block px-2.5 py-0.5 rounded-lg border text-[11px] font-medium capitalize ${statusStyle}`}
        >
          {item.status}
        </div>

        {/* Job ID */}
        <div className="mt-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">
            Applied to Job
          </p>
          <p className="text-red-400 text-lg font-bold font-mono mt-0.5">
            #{item.job_id}
          </p>
        </div>

        {/* Applied date */}
        {item.applied_at && (
          <p className="text-[10px] text-gray-600 mt-2">
            Applied {new Date(item.applied_at).toLocaleDateString("id-ID")}
          </p>
        )}

        {/* Cover letter preview */}
        {item.cover_letter && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
            {item.cover_letter}
          </p>
        )}

        {/* Actions */}
        <CardActions item={item} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
};

export default ApplicationCollectionCard;
