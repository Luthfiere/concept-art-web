import { useState } from "react";
import api from "../../services/api";

const formatSalary = (job) => {
  const { salary_min, salary_max, salary_currency } = job;
  if (!salary_min && !salary_max) return null;
  const fmt = (n) => Number(n).toLocaleString("en-US");
  const cur = salary_currency || "IDR";
  if (salary_min && salary_max) return `${cur} ${fmt(salary_min)}–${fmt(salary_max)}`;
  if (salary_min) return `${cur} ${fmt(salary_min)}+`;
  return `Up to ${cur} ${fmt(salary_max)}`;
};

const formatDate = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const STATUS_STYLES = {
  Active: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
  Draft: "bg-white/5 border-white/10 text-gray-400",
  Expired: "bg-red-500/10 border-red-500/30 text-red-300",
  Blocked: "bg-red-500/10 border-red-500/30 text-red-300",
};

const JobDetail = ({ job }) => {
  const [file, setFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);

  if (!job) {
    return (
      <div className="col-span-12 lg:col-span-7">
        <div className="bg-[#111427]/60 backdrop-blur-sm border border-white/10 rounded-xl h-[calc(100vh-240px)] flex flex-col items-center justify-center text-center px-6 animate-fade-in">
          <p className="text-sm text-gray-500">
            Select a job to view details.
          </p>
        </div>
      </div>
    );
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Only PDF, DOC, and DOCX files are allowed!");
      return;
    }

    if (selectedFile.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB!");
      return;
    }

    setFile(selectedFile);
  };

  const applyJob = async () => {
    if (!file) {
      alert("Please upload your CV first!");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("cv", file);
      formData.append("cover_letter", coverLetter);

      await api.post(`/job-applications/job/${job.id}`, formData);

      alert("Application sent!");
      setFile(null);
      setCoverLetter("");
    } catch (err) {
      alert(err.response?.data?.message || "Error applying job");
    } finally {
      setLoading(false);
    }
  };

  const salary = formatSalary(job);
  const posted = formatDate(job.created_at);
  const expires = formatDate(job.expired_at);
  const statusCls = STATUS_STYLES[job.status] || STATUS_STYLES.Draft;
  const metaItems = [
    job.job_location,
    job.work_option,
    job.work_type,
    salary,
  ].filter(Boolean);

  return (
    <div className="col-span-12 lg:col-span-7">
      <div
        key={job.id}
        className="animate-fade-in bg-[#111427]/60 backdrop-blur-sm border border-white/10 rounded-xl h-[calc(100vh-240px)] overflow-y-auto"
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <h2 className="text-2xl font-bold text-white leading-tight">
              {job.title}
            </h2>
            {job.status && (
              <span
                className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusCls}`}
              >
                {job.status}
              </span>
            )}
          </div>

          {metaItems.length > 0 && (
            <p className="text-sm text-gray-300">{metaItems.join(" • ")}</p>
          )}

          {(posted || expires) && (
            <p className="text-xs text-gray-500 mt-2">
              {posted && <>Posted {posted}</>}
              {posted && expires && <> · </>}
              {expires && <>Expires {expires}</>}
            </p>
          )}

          <div className="border-t border-white/5 my-6" />

          {/* Description */}
          <h3 className="text-xs font-semibold uppercase tracking-wider text-yellow-400/80 mb-3">
            Description
          </h3>
          <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
            {job.description || (
              <span className="text-gray-500 italic">
                No description provided.
              </span>
            )}
          </div>

          <div className="border-t border-white/5 my-6" />

          {/* Apply */}
          <h3 className="text-xs font-semibold uppercase tracking-wider text-yellow-400/80 mb-4">
            Apply for this position
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Cover letter
              </label>
              <textarea
                placeholder="Introduce yourself, highlight relevant experience…"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={5}
                className="w-full bg-[#0f1323] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/40 transition resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                CV / Resume
              </label>
              <label className="flex items-center gap-3 bg-[#0f1323] border border-white/10 rounded-lg px-4 py-3 cursor-pointer hover:border-yellow-400/40 transition">
                <span className="bg-white/5 border border-white/10 text-xs text-gray-200 px-3 py-1 rounded whitespace-nowrap">
                  Choose file
                </span>
                <span className="text-xs text-gray-400 truncate">
                  {file
                    ? `${file.name} · ${(file.size / 1024).toFixed(0)} KB`
                    : "PDF, DOC, or DOCX — max 2MB"}
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={applyJob}
                disabled={loading}
                className={`px-6 py-2.5 rounded-lg font-semibold transition shadow-md ${
                  loading
                    ? "bg-yellow-400/50 text-black/60 cursor-not-allowed"
                    : "bg-yellow-400 hover:bg-yellow-300 text-black hover:shadow-yellow-400/30"
                }`}
              >
                {loading ? "Submitting…" : "Apply now"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
