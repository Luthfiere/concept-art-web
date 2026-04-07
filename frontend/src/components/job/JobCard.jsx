const JobCard = ({ job, setSelectedJob, selectedJob }) => {

  return (
    <div
      onClick={() => setSelectedJob(job)}
      className={`p-4 mb-4 rounded-lg cursor-pointer
      ${selectedJob?.id === job.id
        ? "bg-[#23263a]"
        : "bg-[#1a1d2e] hover:bg-[#23263a]"
      }`}
    >

      <h3 className="text-yellow-400 font-semibold">
        {job.title}
      </h3>

      <p className="text-gray-400 text-sm">
        {job.company}
      </p>

      <p className="text-gray-500 text-xs">
        {job.location}
      </p>

    </div>
  );

};

export default JobCard;