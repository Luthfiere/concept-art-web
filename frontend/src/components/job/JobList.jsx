import JobCard from "./JobCard";

const JobList = ({ jobs, setSelectedJob, selectedJob }) => {

  return (
    <div className="col-span-4 h-[600px] overflow-y-auto">

      {jobs.map(job => (

        <JobCard
          key={job.id}
          job={job}
          setSelectedJob={setSelectedJob}
          selectedJob={selectedJob}
        />

      ))}

    </div>
  );

};

export default JobList;