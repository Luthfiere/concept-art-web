import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import ReportModal, { FlagIcon } from "../moderation/ReportModal";

const BASE_URL = "";

const getAvatar = (user) => {
  if (user?.profile_image) {
    return user.profile_image.startsWith("http")
      ? user.profile_image
      : `${BASE_URL}/${user.profile_image}`;
  }
  return `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || "user"}`;
};

const formatSalary = (job) => {
  const { salary_min, salary_max, salary_currency } = job;
  if (!salary_min && !salary_max) return null;
  const fmt = (n) => Number(n).toLocaleString("en-US");
  const cur = salary_currency || "IDR";
  if (salary_min && salary_max) return `${cur} ${fmt(salary_min)}\u2013${fmt(salary_max)}`;
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
  Blocked: "bg-yellow-500/10 border-yellow-500/30 text-yellow-300",
  "Auto-Closed": "bg-red-500/10 border-red-500/30 text-red-300",
};

const JobDetail = ({ job }) => {
  const [file, setFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const isLoggedIn = !!localStorage.getItem("token");
  const isOwnPosting = currentUser && job && currentUser.id === job.user_id;

  if (!job) {
    return (
      <div className="col-span-12 lg:col-span-7">
        <div className="bg-[#111427]/60 backdrop-blur-sm border border-white/10 rounded-xl min-h-[200px] lg:h-[calc(100vh-240px)] flex flex-col items-center justify-center text-center px-6 py-8 animate-fade-in">
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

  const isActive = job.status === "Active";
  const isBlocked = job.status === "Blocked";
  const isExpired = job.status === "Expired";

  return (
    <div className="col-span-12 lg:col-span-7">
      {reportOpen && (
        <ReportModal
          entityType="job"
          entityId={job.id}
          onClose={() => setReportOpen(false)}
        />
      )}

      <div
        key={job.id}
        className="animate-fade-in bg-[#111427]/60 backdrop-blur-sm border border-white/10 rounded-xl lg:h-[calc(100vh-240px)] overflow-y-auto"
      >
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight break-words min-w-0">
              {job.title}
            </h2>
            <div className="shrink-0 flex items-center gap-2">
              {job.status && (
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusCls}`}
                >
                  {job.status}
                </span>
              )}
              {isLoggedIn && !isOwnPosting && (
                <button
                  type="button"
                  onClick={() => setReportOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors duration-200"
                  title="Report this posting"
                >
                  <FlagIcon className="w-3.5 h-3.5" />
                  Report
                </button>
              )}
            </div>
          </div>

          {metaItems.length > 0 && (
            <p className="text-sm text-gray-300">{metaItems.join(" \u2022 ")}</p>
          )}

          {(posted || expires) && (
            <p className="text-xs text-gray-500 mt-2">
              {posted && <>Posted {posted}</>}
              {posted && expires && <> &middot; </>}
              {expires && <>Expires {expires}</>}
            </p>
          )}

          {/* Poster */}
          <Link
            to={job.user_id ? `/profile/${job.user_id}` : "#"}
            className="flex items-center gap-3 mt-4 py-3 border-y border-white/10 group"
          >
            <img
              src={getAvatar(job)}
              alt={`${job.username || "poster"} avatar`}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-yellow-400/50 transition"
            />
            <div>
              <p className="text-[11px] uppercase tracking-wider text-gray-500">
                Posted by
              </p>
              <p className="text-sm font-semibold text-gray-100 leading-tight group-hover:text-yellow-300 transition-colors">
                {job.username || "Unknown"}
              </p>
            </div>
          </Link>

          {/* Status banners */}
          {isExpired && (
            <div className="mt-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-300">This job posting has expired and is no longer accepting applications.</p>
            </div>
          )}
          {isBlocked && (
            <div className="mt-4 px-4 py-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-300">This job is no longer accepting applications.</p>
            </div>
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

          {!isActive ? (
            <div className={`px-4 py-6 rounded-xl border text-center ${
              isExpired
                ? "bg-red-500/5 border-red-500/20"
                : "bg-yellow-500/5 border-yellow-500/20"
            }`}>
              <p className={`text-sm font-medium ${
                isExpired ? "text-red-300" : "text-yellow-300"
              }`}>
                {isExpired
                  ? "This job posting has expired"
                  : isBlocked
                    ? "This job is no longer accepting applications"
                    : "This job is not yet published"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                You cannot apply to this position at this time.
              </p>
            </div>
          ) : !isLoggedIn ? (
            <div className="px-4 py-6 rounded-xl border border-yellow-400/30 bg-yellow-400/5 text-center">
              <p className="text-sm text-yellow-300 mb-4">
                Sign in to apply for this position.
              </p>
              <Link
                to="/login?redirect=/Job"
                className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-5 py-2 rounded-lg shadow-md transition"
              >
                Sign in to apply
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Cover letter
                </label>
                <textarea
                  placeholder="Introduce yourself, highlight relevant experience\u2026"
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
                      ? `${file.name} \u00b7 ${(file.size / 1024).toFixed(0)} KB`
                      : "PDF, DOC, or DOCX \u2014 max 2MB"}
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
                  {loading ? "Submitting\u2026" : "Apply now"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
