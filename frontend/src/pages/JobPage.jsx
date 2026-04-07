import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/layout/Navbar";
import JobFilter from "../components/job/JobFilter";
import JobList from "../components/job/JobList";
import JobDetail from "../components/job/JobDetail";

const JobPage = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/job-postings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
