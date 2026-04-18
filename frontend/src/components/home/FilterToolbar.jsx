import { useState, useRef, useEffect } from "react";

const ChevronDown = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  </svg>
);

const FilterToolbar = ({
  type,
  sort,
  setSort,
  categories,
  selectedCategory,
  setSelectedCategory,
  search,
  setSearch,
  count,
}) => {
  const [openSort, setOpenSort] = useState(false);
  const sortRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setOpenSort(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="px-4 sm:px-6 py-3 space-y-3">
      {/* Row 1: Sort + Search + Count */}
      <div className="flex items-center gap-3">
        {/* Sort dropdown — art only */}
        {type === "art" && sort && setSort && (
          <div className="relative shrink-0" ref={sortRef}>
            <button
              onClick={() => setOpenSort(!openSort)}
              className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/[0.08] hover:border-white/15 transition-all duration-200"
            >
              {sort}
              <ChevronDown />
            </button>

            {openSort && (
              <div className="absolute mt-2 bg-[#1a1d2e] border border-white/10 rounded-xl shadow-xl w-40 z-50 overflow-hidden animate-fade-in">
                {["Most Liked", "Most Viewed"].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSort(option);
                      setOpenSort(false);
                    }}
                    className={`block w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 ${
                      sort === option
                        ? "bg-yellow-500/10 text-yellow-500"
                        : "text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search — takes remaining width */}
        <div className="relative flex-1">
          <SearchIcon />
          <input
            type="text"
            placeholder={
              type === "art"
                ? "Search artwork..."
                : type === "ideation"
                  ? "Search ideas..."
                  : "Search posts..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:border-yellow-500/50 focus:bg-white/[0.07] outline-none transition-all duration-200"
          />
        </div>

        {/* Count */}
        <span className="hidden sm:inline text-xs text-gray-500 tabular-nums shrink-0">
          {count} items
        </span>
      </div>

      {/* Row 2: Category pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
              selectedCategory === c
                ? "bg-yellow-500 text-black"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterToolbar;
