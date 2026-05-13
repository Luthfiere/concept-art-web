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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/job-postings/status/Active");
        setJobs(res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load jobs");
      } finally {
        setLoading(false);
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

  const selectedJob = useMemo(() => {
    if (selectedId) {
      const found = filteredJobs.find((j) => j.id === selectedId);
      if (found) return found;
    }
    return filteredJobs[0] ?? null;
  }, [filteredJobs, selectedId]);

  const setSelectedJob = (job) => setSelectedId(job?.id ?? null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] to-[#0b0f2a] text-white">
      <Navbar />

      <div className="w-full mx-auto px-4 sm:px-6 py-6">
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold">Job Hiring</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
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

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
              <p className="text-white/30 text-xs tracking-widest uppercase">
                Loading jobs
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-4 mt-4">
            <JobList
              jobs={filteredJobs}
              setSelectedJob={setSelectedJob}
              selectedJob={selectedJob}
            />
            <JobDetail job={selectedJob} />
          </div>
        )}
      </div>
    </div>
  );
};

export default JobPage;
