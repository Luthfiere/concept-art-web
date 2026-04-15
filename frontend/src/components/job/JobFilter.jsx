const WORK_OPTIONS = ["All", "On-site", "Hybrid", "Remote"];
const WORK_TYPES = ["All", "Full-time", "Part-time", "Contract", "Casual"];

const JobFilter = ({
  search,
  setSearch,
  workOption,
  setWorkOption,
  workType,
  setWorkType,
  totalCount,
  filteredCount,
}) => {
  const inputCls =
    "bg-[#0f1323] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/40 transition";

  return (
    <div className="bg-[#111427]/60 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
      <div className="relative flex-1">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search jobs by title, location, or description…"
          className={`${inputCls} w-full pr-9`}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition flex items-center justify-center text-sm leading-none"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      <select
        value={workOption}
        onChange={(e) => setWorkOption(e.target.value)}
        className={`${inputCls} sm:w-40`}
      >
        {WORK_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt === "All" ? "All locations" : opt}
          </option>
        ))}
      </select>

      <select
        value={workType}
        onChange={(e) => setWorkType(e.target.value)}
        className={`${inputCls} sm:w-36`}
      >
        {WORK_TYPES.map((opt) => (
          <option key={opt} value={opt}>
            {opt === "All" ? "All types" : opt}
          </option>
        ))}
      </select>

      <div className="text-xs text-gray-400 sm:ml-2 whitespace-nowrap">
        Showing{" "}
        <span className="text-white font-semibold">{filteredCount}</span> of{" "}
        {totalCount}
      </div>
    </div>
  );
};

export default JobFilter;
