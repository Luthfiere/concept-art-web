import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/layout/Navbar";
import JobFilter from "../components/job/JobFilter";
import JobList from "../components/job/JobList";
import JobDetail from "../components/job/JobDetail";
import api from "../services/api";

const JobPage = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [workOption, setWorkOption] = useState("All");
  const [workType, setWorkType] = useState("All");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/job-postings");
        const allJobs = res.data.data || [];
        setJobs(allJobs.filter((j) => j.status === "Active"));
      } catch (err) {
        console.log(err.response?.data || err.message);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter((job) => {
      if (workOption !== "All" && job.work_option !== workOption) return false;
      if (workType !== "All" && job.work_type !== workType) return false;
      if (q) {
        const hay = `${job.title || ""} ${job.job_location || ""} ${
          job.description || ""
        }`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [jobs, search, workOption, workType]);

  const selectedJob =
    filteredJobs.find((j) => j.id === selectedId) ?? filteredJobs[0] ?? null;

  const setSelectedJob = (job) => setSelectedId(job?.id ?? null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] to-[#0b0f2a] text-white">
      <Navbar />

      <div className="w-full mx-auto px-6 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Job Hiring</h1>
          <p className="text-sm text-gray-400 mt-1">
            Find your next role in the game-art community.
          </p>
        </div>

        <JobFilter
          search={search}
          setSearch={setSearch}
          workOption={workOption}
          setWorkOption={setWorkOption}
          workType={workType}
          setWorkType={setWorkType}
          totalCount={jobs.length}
          filteredCount={filteredJobs.length}
        />

        <div className="grid grid-cols-12 gap-4 mt-4">
          <JobList
            jobs={filteredJobs}
            setSelectedJob={setSelectedJob}
            selectedJob={selectedJob}
          />
          <JobDetail job={selectedJob} />
        </div>
      </div>
    </div>
  );
};

export default JobPage;
