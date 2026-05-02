const CardActions = ({ item, onEdit, onDelete }) => {
  if (!onEdit && !onDelete) return null;

  return (
    <div className="flex gap-1.5 mt-3">
      {item.type !== "application" && onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="flex-1 py-1.5 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide hover:bg-white/20 transition-all"
        >
          Edit
        </button>
      )}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={`
            py-1.5 rounded-lg border border-red-400/30 bg-red-400/15 backdrop-blur-md
            text-red-400 text-[11px] font-semibold hover:bg-red-400/30 transition-all
            ${item.type === "application" ? "flex-1" : "w-8"}
          `}
        >
          {item.type === "application" ? "Withdraw" : "\u{1F5D1}"}
        </button>
      )}
    </div>
  );
};

export default CardActions;
