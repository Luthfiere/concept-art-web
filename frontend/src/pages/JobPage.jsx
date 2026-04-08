import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import JobFilter from "../components/job/JobFilter";
import JobList from "../components/job/JobList";
import JobDetail from "../components/job/JobDetail";
import api from "../services/api";

const JobPage = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get("/job-postings");
      const jobList = res.data.data;

      setJobs(jobList);
      setSelectedJob(jobList.length > 0 ? jobList[0] : null);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <Navbar />

      <JobFilter />

      <div className="px-10 grid grid-cols-12 gap-6">
        <JobList
          jobs={jobs}
          setSelectedJob={setSelectedJob}
          selectedJob={selectedJob}
        />

        <JobDetail job={selectedJob} />
      </div>
    </div>
  );
};

export default JobPage;
