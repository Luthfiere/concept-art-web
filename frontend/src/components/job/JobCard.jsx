const formatSalary = (job) => {
  const { salary_min, salary_max, salary_currency } = job;
  if (!salary_min && !salary_max) return null;
  const fmt = (n) => Number(n).toLocaleString("en-US");
  const cur = salary_currency || "IDR";
  if (salary_min && salary_max) return `${cur} ${fmt(salary_min)}–${fmt(salary_max)}`;
  if (salary_min) return `${cur} ${fmt(salary_min)}+`;
  return `Up to ${cur} ${fmt(salary_max)}`;
};

const formatPosted = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const Chip = ({ children }) => (
  <span className="bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-[10px] text-gray-300">
    {children}
  </span>
);

const JobCard = ({ job, setSelectedJob, selectedJob, index = 0 }) => {
  const isSelected = selectedJob?.id === job.id;
  const salary = formatSalary(job);
  const posted = formatPosted(job.created_at);

  return (
    <div
      onClick={() => setSelectedJob(job)}
      style={{
        animationDelay: `${index * 40}ms`,
        animationFillMode: "backwards",
      }}
      className={`animate-fade-in-up p-4 mb-2 rounded-xl cursor-pointer border transition-all duration-200 ease-out ${
        isSelected
          ? "bg-white/[0.06] border-white/10 border-l-2 border-l-yellow-400"
          : "bg-[#111427]/60 border-white/5 hover:bg-white/[0.04] hover:translate-x-[2px] hover:border-white/10"
      }`}
    >
      <div className="flex items-center gap-1.5">
        <h3
          className={`text-sm font-semibold truncate ${
            isSelected ? "text-yellow-300" : "text-white"
          }`}
        >
          {job.title}
        </h3>
        {(job.report_count ?? 0) >= 15 && (
          <span
            title="This posting has been reported by multiple users"
            className="shrink-0 text-[10px] leading-none text-amber-400"
          >
            &#9888;
          </span>
        )}
      </div>

      {job.job_location && (
        <p className="text-xs text-gray-400 mt-1 truncate">
          {job.job_location}
        </p>
      )}

      {(job.work_option || job.work_type || salary) && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {job.work_option && <Chip>{job.work_option}</Chip>}
          {job.work_type && <Chip>{job.work_type}</Chip>}
          {salary && <Chip>{salary}</Chip>}
        </div>
      )}

      {posted && (
        <p className="text-[10px] text-gray-500 mt-2">Posted {posted}</p>
      )}
    </div>
  );
};

export default JobCard;
