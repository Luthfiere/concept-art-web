import JobCard from "./JobCard";

const JobList = ({ jobs, setSelectedJob, selectedJob }) => {
  return (
    <div className="col-span-12 lg:col-span-5">
      <div className="h-[calc(100vh-240px)] overflow-y-auto pr-1">
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-fade-in">
            <p className="text-sm text-gray-500">No jobs match your filters.</p>
            <p className="text-xs text-gray-600 mt-1">
              Try adjusting your search or clearing filters.
            </p>
          </div>
        ) : (
          jobs.map((job, i) => (
            <JobCard
              key={job.id}
              job={job}
              index={i}
              setSelectedJob={setSelectedJob}
              selectedJob={selectedJob}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default JobList;
