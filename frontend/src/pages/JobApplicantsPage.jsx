import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

const API_BASE = "http://localhost:5000/api";

const STATUS_CONFIG = {
  pending: {
    style: "bg-yellow-400/10 text-yellow-300 border-yellow-400/20",
    dot: "bg-yellow-400",
    label: "Pending",
  },
  shortlisted: {
    style: "bg-blue-400/10 text-blue-300 border-blue-400/20",
    dot: "bg-blue-400",
    label: "Shortlisted",
  },
  rejected: {
    style: "bg-red-400/10 text-red-300 border-red-400/20",
    dot: "bg-red-400",
    label: "Rejected",
  },
  hired: {
    style: "bg-green-400/10 text-green-300 border-green-400/20",
    dot: "bg-green-400",
    label: "Hired",
  },
};

const FILTERS = ["all", "pending", "shortlisted", "hired", "rejected"];

const JobApplicantsPage = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [jobRes, appRes] = await Promise.all([
          fetch(`${API_BASE}/job-postings/${jobId}`),
          fetch(`${API_BASE}/job-applications/job/${jobId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const jobData = await jobRes.json();
        const appData = await appRes.json();

        setJob(jobData.data || jobData);
        setApplicants(appData.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId, token, navigate]);

  const updateStatus = async (appId, status) => {
    try {
      setUpdatingId(appId);

      const res = await fetch(`${API_BASE}/job-applications/${appId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setApplicants((prev) =>
        prev.map((a) =>
          a.id === appId ? { ...a, status: data.data.status } : a,
        ),
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const counts = FILTERS.slice(1).reduce((acc, s) => {
    acc[s] = applicants.filter((a) => a.status === s).length;
    return acc;
  }, {});

  const filtered =
    activeFilter === "all"
      ? applicants
      : applicants.filter((a) => a.status === activeFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020408] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
            <p className="text-white/30 text-sm tracking-widest uppercase">
              Loading applicants
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020408] text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* ── BACK ── */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-white/30 hover:text-yellow-400 text-sm mb-10 transition-colors duration-200"
        >
          <span className="group-hover:-translate-x-1 transition-transform duration-200">
            ←
          </span>
          Back
        </button>

        {/* ── PAGE HEADER ── */}
        <div className="mb-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-yellow-400 text-xs tracking-[0.2em] uppercase font-medium mb-2">
                Job Applicants
              </p>
              <h1 className="text-3xl font-bold text-white leading-tight">
                {job?.title || "Job Detail"}
              </h1>
              {job?.company_name && (
                <p className="text-white/40 text-sm mt-1">{job.company_name}</p>
              )}
            </div>

            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2">
              <span className="text-2xl font-bold text-white">
                {applicants.length}
              </span>
              <span className="text-white/40 text-sm leading-tight">
                Total
                <br />
                Applicants
              </span>
            </div>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            {
              key: "pending",
              color: "text-yellow-400",
              border: "border-yellow-400/20",
            },
            {
              key: "shortlisted",
              color: "text-blue-400",
              border: "border-blue-400/20",
            },
            {
              key: "hired",
              color: "text-green-400",
              border: "border-green-400/20",
            },
            {
              key: "rejected",
              color: "text-red-400",
              border: "border-red-400/20",
            },
          ].map(({ key, color, border }) => (
            <button
              key={key}
              onClick={() =>
                setActiveFilter(activeFilter === key ? "all" : key)
              }
              className={`p-4 rounded-xl border bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200 text-left
                ${activeFilter === key ? border + " " + "bg-white/[0.06]" : "border-white/[0.06]"}`}
            >
              <p className={`text-2xl font-bold ${color}`}>
                {counts[key] || 0}
              </p>
              <p className="text-white/40 text-xs capitalize mt-0.5">{key}</p>
            </button>
          ))}
        </div>

        {/* ── FILTER TABS ── */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all duration-200
                ${
                  activeFilter === f
                    ? "bg-yellow-400 text-black border-yellow-400"
                    : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                }`}
            >
              {f === "all" ? "All" : STATUS_CONFIG[f]?.label}
            </button>
          ))}
        </div>

        {/* ── APPLICANT LIST ── */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-20 border border-white/[0.06] rounded-2xl">
              <p className="text-white/20 text-sm">
                No applicants in this category
              </p>
            </div>
          )}

          {filtered.map((app, i) => {
            const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
            const isExpanded = expandedId === app.id;

            return (
              <div
                key={app.id}
                style={{ animationDelay: `${i * 40}ms` }}
                className="group border border-white/[0.07] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl transition-all duration-200"
              >
                {/* CARD HEADER */}
                <div className="flex items-center gap-4 p-5">
                  {/* Avatar initials */}
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-400/5 border border-yellow-400/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-300 text-sm font-bold">
                      {String(app.applicant_id).slice(-2).toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">
                      Applicant #{app.applicant_id}
                    </p>
                    <p className="text-white/30 text-xs mt-0.5">
                      {new Date(app.applied_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-full border ${cfg.style}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>

                  {/* Expand toggle */}
                  {(app.cover_letter || app.cv) && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : app.id)}
                      className="text-white/20 hover:text-white/60 text-xs border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition-all duration-150"
                    >
                      {isExpanded ? "Hide" : "Detail"}
                    </button>
                  )}
                </div>

                {/* EXPANDED DETAIL */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-white/[0.06] pt-4">
                    {app.cover_letter && (
                      <div className="mb-4">
                        <p className="text-white/30 text-xs uppercase tracking-widest mb-2">
                          Cover Letter
                        </p>
                        <p className="text-white/70 text-sm leading-relaxed">
                          {app.cover_letter}
                        </p>
                      </div>
                    )}
                    {app.cv && (
                      <a
                        href={`http://localhost:5000/${app.cv}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-xs text-yellow-400 hover:text-yellow-300 border border-yellow-400/20 hover:border-yellow-400/40 rounded-lg px-3 py-2 transition-all duration-150"
                      >
                        ↗ View CV
                      </a>
                    )}
                  </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="flex gap-2 px-5 pb-5">
                  {app.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(app.id, "shortlisted")}
                        className="px-4 py-2 text-xs font-medium rounded-lg bg-blue-400/10 text-blue-300 border border-blue-400/20 hover:bg-blue-400/20 hover:border-blue-400/40 transition-all duration-150"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => updateStatus(app.id, "rejected")}
                        className="px-4 py-2 text-xs font-medium rounded-lg bg-red-400/10 text-red-300 border border-red-400/20 hover:bg-red-400/20 hover:border-red-400/40 transition-all duration-150"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {app.status === "shortlisted" && (
                    <>
                      <button
                        onClick={() => updateStatus(app.id, "hired")}
                        className="px-4 py-2 text-xs font-medium rounded-lg bg-green-400/10 text-green-300 border border-green-400/20 hover:bg-green-400/20 hover:border-green-400/40 transition-all duration-150"
                      >
                        ✓ Hire
                      </button>
                      <button
                        onClick={() => updateStatus(app.id, "rejected")}
                        className="px-4 py-2 text-xs font-medium rounded-lg bg-red-400/10 text-red-300 border border-red-400/20 hover:bg-red-400/20 hover:border-red-400/40 transition-all duration-150"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {(app.status === "hired" || app.status === "rejected") && (
                    <p className="text-white/20 text-xs py-2">
                      {app.status === "hired"
                        ? "🎉 Applicant has been hired"
                        : "Application has been closed"}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default JobApplicantsPage;
