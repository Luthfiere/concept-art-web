import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import JobFilter from "../components/JobFilter";
import JobList from "../components/JobList";
import JobDetail from "../components/JobDetail";

const JobPage = () => {

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {

    const res = await axios.get(
      "http://localhost:3000/api/job-postings",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setJobs(res.data);
    setSelectedJob(res.data[0]);
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

        <JobDetail
          job={selectedJob}
        />

      </div>

    </div>
  );
};

export default JobPage;