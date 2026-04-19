import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useChat } from "../context/ChatContext";
import { isTokenExpired } from "../services/api";
import { STATUS_CONFIG } from "../components/collection/constants";
import ArtCollectionCard from "../components/collection/ArtCollectionCard";
import PostCollectionCard from "../components/collection/PostCollectionCard";
import CommunityCollectionCard from "../components/collection/CommunityCollectionCard";
import JobCollectionCard from "../components/collection/JobCollectionCard";
import ApplicationCollectionCard from "../components/collection/ApplicationCollectionCard";

const API_BASE = "http://localhost:5000/api";

const ChatBubbleIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
    />
  </svg>
);

const ApplicationDetailModal = ({ app, onClose, currentUserId }) => {
  if (!app) return null;

  const { openChatWithArt } = useChat();
  const isLoggedIn = !isTokenExpired();
  const [job, setJob] = useState(null);
  const token = localStorage.getItem("token");

  const statusStyle = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;

  // ✅ Fetch job langsung dari app.job_id
  useEffect(() => {
    if (!token || !app?.job_id) return;

    const fetchJob = async () => {
      try {
        const res = await fetch(`${API_BASE}/job-postings/${app.job_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setJob(data.data);
      } catch (err) {
        console.error("Fetch job error:", err);
      }
    };

    fetchJob();
  }, [token, app]);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0f1323] p-5 sm:p-6 rounded-2xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-lg font-bold mb-4">Application Detail</h2>

        {/* STATUS */}
        <div
          className={`mb-4 inline-block px-3 py-1 rounded-lg border text-sm ${statusStyle}`}
        >
          Status: {app.status}
        </div>

        {/* JOB */}
        <p className="text-sm text-white/50 mb-1">Job ID</p>
        <p className="mb-4 font-semibold">#{app.job_id}</p>

        {/* DATE */}
        <p className="text-sm text-white/50 mb-1">Applied At</p>
        <p className="mb-4 text-sm">
          {new Date(app.applied_at).toLocaleString("id-ID")}
        </p>

        {/* COVER LETTER */}
        {app.cover_letter && (
          <>
            <p className="text-sm text-white/50 mb-1">Cover Letter</p>
            <p className="mb-4 text-sm text-white/70">{app.cover_letter}</p>
          </>
        )}

        {/* MESSAGE BUTTON */}
        {isLoggedIn &&
          job?.user_id &&
          job.user_id !== currentUserId &&
          ["pending", "shortlist", "hired"].includes(app.status) && ( // 💡 opsional: hanya kalau accepted
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => {
                  openChatWithArt(job.id, job.user_id);
                  onClose(); // 🔥 lebih proper daripada setIsAppModalOpen
                }}
                className="flex-1 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm bg-white/5 border border-white/10 text-white hover:bg-white/10"
              >
                <ChatBubbleIcon className="w-4 h-4" />
                Message Posters
              </button>
            </div>
          )}

        {/* CV */}
        {app.cv && (
          <a
            href={`http://localhost:5000/${app.cv}`}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-sm text-yellow-400 underline mb-4"
          >
            View CV
          </a>
        )}

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="w-full bg-white/10 py-2 rounded-lg hover:bg-white/20 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const EditArtModal = ({ form, setForm, onClose, onSubmit }) => {
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(e) => {
        e.stopPropagation(); // 🔥 penting
        if (e.target === e.currentTarget) onClose();
      }}
      onClick={(e) => e.stopPropagation()} // 🔥 tambah ini juga
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#0f1323] p-5 sm:p-6 rounded-2xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="mb-4 font-bold">Edit Art</h2>

        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full mb-3 p-2 bg-[#0a0d1a] pointer-events-auto"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full mb-3 p-2 bg-[#0a0d1a] pointer-events-auto"
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full mb-3 p-2 bg-[#0a0d1a] pointer-events-auto"
        >
          <option value="">Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Closed">Closed</option>
        </select>

        <input
          name="tag"
          value={form.tag}
          onChange={handleChange}
          placeholder="Tag"
          className="w-full mb-3 p-2 bg-[#0a0d1a] pointer-events-auto"
        />

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full mb-4 p-2 bg-[#0a0d1a] pointer-events-auto"
        >
          <option value="">Category</option>
          <option value="art">Art</option>
          <option value="post">Post</option>
          <option value="community">Community</option>
        </select>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 bg-white/10 p-2">
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 bg-amber-400 text-black p-2"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const EditJobModal = ({ form, setForm, onClose, onSubmit }) => {
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(e) => {
        e.stopPropagation(); // 🔥 penting
        if (e.target === e.currentTarget) onClose();
      }}
      onClick={(e) => e.stopPropagation()} // 🔥 tambah ini juga
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0f1323] p-5 sm:p-6 rounded-2xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="mb-4 font-bold">Edit Job</h2>

        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full mb-3 p-2 bg-[#0a0d1a] pointer-events-auto"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full mb-3 p-2 bg-[#0a0d1a] pointer-events-auto"
        />

        <input
          name="job_location"
          value={form.job_location}
          onChange={handleChange}
          placeholder="Location"
          className="w-full mb-3 p-2 bg-[#0a0d1a] pointer-events-auto"
        />

        <select
          name="work_option"
          value={form.work_option}
          onChange={handleChange}
          className="w-full mb-3 p-2 bg-[#0a0d1a]"
        >
          <option value="">Work Option</option>
          <option value="On-site">On-site</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Remote">Remote</option>
        </select>

        <select
          name="work_type"
          value={form.work_type}
          onChange={handleChange}
          className="w-full mb-3 p-2 bg-[#0a0d1a]"
        >
          <option value="">Work Type</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Casual">Casual</option>
        </select>

        <div className="flex gap-2 mb-3">
          <input
            name="salary_min"
            value={form.salary_min}
            onChange={handleChange}
            placeholder="Min"
            className="w-1/2 p-2 bg-[#0a0d1a] pointer-events-auto"
          />
          <input
            name="salary_max"
            value={form.salary_max}
            onChange={handleChange}
            placeholder="Max"
            className="w-1/2 p-2 bg-[#0a0d1a] pointer-events-auto"
          />
        </div>

        <select
          name="salary_currency"
          value={form.salary_currency}
          onChange={handleChange}
          className="w-full mb-3 p-2 bg-[#0a0d1a]"
        >
          <option value="">Currency</option>
          <option value="IDR">IDR</option>
          <option value="USD">USD</option>
        </select>

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full mb-3 p-2 bg-[#0a0d1a] pointer-events-auto"
        >
          <option value="">Status</option>
          <option value="Draft">Draft</option>
          <option value="Active">Active</option>
          <option value="Expired">Expired</option>
          <option value="Blocked">Blocked</option>
        </select>

        <input
          type="date"
          name="expired_at"
          value={form.expired_at || ""}
          onChange={handleChange}
          className="w-full mb-4 p-2 bg-[#0a0d1a]"
        />

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 bg-white/10 p-2">
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 bg-emerald-400 text-black p-2"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const MyCollection = () => {
  const navigate = useNavigate();
  const [arts, setArts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [postsMode, setPostsMode] = useState("post");
  const [selectedApplication, setSelectedApplication] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [artForm, setArtForm] = useState({
    title: "",
    description: "",
    status: "",
    tag: "",
    category: "",
  });

  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    job_location: "",
    work_option: "",
    work_type: "",
    salary_min: "",
    salary_max: "",
    salary_currency: "",
    status: "",
    expired_at: "",
  });

  useEffect(() => {
    if (!user || !token) navigate("/login");
  }, [user, token, navigate]);

  useEffect(() => {
    if (!user || !token) return;
    const fetchData = async () => {
      try {
        const [artRes, jobRes, appRes] = await Promise.all([
          fetch(`${API_BASE}/concept-arts/user/${user.id}`),
          fetch(`${API_BASE}/job-postings/user/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/job-applications`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const [artData, jobData, appData] = await Promise.all([
          artRes.json(),
          jobRes.json(),
          appRes.json(),
        ]);
        const arts = artData.art || [];
        const artsWithMedia = await Promise.all(
          arts.map(async (art) => {
            try {
              const res = await fetch(`${API_BASE}/art-media/art/${art.id}`);
              const data = await res.json();
              return { ...art, media: data.data || [] };
            } catch {
              return { ...art, media: [] };
            }
          }),
        );
        setArts(artsWithMedia);
        setJobs(jobData.data || []);
        setApplications(appData.data || appData || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, token]);

  // Split arts by category
  const artOnly = arts.filter((a) => a.category === "art");
  const postOnly = arts.filter((a) => a.category === "post");
  const communityOnly = arts.filter((a) => a.category === "community");
  const activePosts = postsMode === "post" ? postOnly : communityOnly;
  const totalCount = arts.length + jobs.length + applications.length;

  const handleDelete = async (item) => {
    if (!window.confirm("Hapus item ini?")) return;
    try {
      if (["art", "post", "community"].includes(item.type)) {
        await fetch(`${API_BASE}/concept-arts/${item.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setArts((prev) => prev.filter((a) => a.id !== item.id));
      }
      if (item.type === "job") {
        await fetch(`${API_BASE}/job-postings/${item.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setJobs((prev) => prev.filter((j) => j.id !== item.id));
      }
      if (item.type === "application") {
        await fetch(`${API_BASE}/job-applications/${item.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplications((prev) => prev.filter((a) => a.id !== item.id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);

    if (["art", "post", "community"].includes(item.type)) {
      setArtForm({
        title: item.title || "",
        description: item.description || "",
        status: item.status || "",
        tag: item.tag || "",
        category: item.category || "",
      });
    }

    if (item.type === "job") {
      setJobForm({
        title: item.title || "",
        description: item.description || "",
        job_location: item.job_location || "",
        work_option: item.work_option || "",
        work_type: item.work_type || "",
        salary_min: item.salary_min || "",
        salary_max: item.salary_max || "",
        salary_currency: item.salary_currency || "",
        status: item.status || "",
        expired_at: item.expired_at ? item.expired_at.split("T")[0] : "",
      });
    }

    setIsEditOpen(true);
  };

  const handleOpen = (item) => {
    if (item.type === "art") navigate(`/art/${item.id}`);
    if (item.type === "post") navigate(`/post/${item.id}`);
    if (item.type === "community") navigate(`/post/${item.id}`);
    if (item.type === "job") navigate(`/job/${item.id}`);

    if (item.type === "application") {
      setSelectedApplication(item);
      setIsAppModalOpen(true);
    }
  };

  const handleUpdateConceptArt = async () => {
    const res = await fetch(`${API_BASE}/concept-arts/${selectedItem.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(artForm),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    alert("Update Success");
    setIsEditOpen(false);

    setArts((prev) =>
      prev.map((a) => (a.id === selectedItem.id ? data.art : a)),
    );
  };

  const handleUpdateJob = async () => {
    try {
      const payload = { ...jobForm };

      // 🧹 Remove empty
      Object.keys(payload).forEach((key) => {
        if (payload[key] === "" || payload[key] === null) {
          delete payload[key];
        }
      });

      // 🔢 Convert salary
      if (payload.salary_min) payload.salary_min = Number(payload.salary_min);
      if (payload.salary_max) payload.salary_max = Number(payload.salary_max);

      const res = await fetch(`${API_BASE}/job-postings/${selectedItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update job");
      }

      setJobs((prev) =>
        prev.map((j) =>
          j.id === selectedItem.id ? { ...j, ...data.data } : j,
        ),
      );

      alert("Update Success");
      setIsEditOpen(false);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020408] via-[#06091a] to-[#080c20]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-9 h-9 rounded-full border-2 border-white/5 border-t-amber-400/80 animate-spin" />
          <p className="text-white/30 text-xs tracking-[0.15em] font-mono uppercase">
            Loading Collection
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020408] via-[#06091a] to-[#080c20] text-white">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-indigo-500/5 blur-3xl pointer-events-none z-0" />

      <Navbar />

      <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 pt-6 sm:pt-10 pb-16 sm:pb-20">
        {/* HEADER */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-[3px] h-7 rounded-sm bg-gradient-to-b from-amber-400 to-red-400" />
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight">My Collection</h1>
          </div>
          <p className="text-white/35 text-sm ml-[15px] tracking-wide">
            {totalCount} items — arts, posts, jobs applications
          </p>
        </div>

        {/* ──── ART SECTION ──── */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-[3px] h-6 rounded-sm bg-gradient-to-b from-amber-400 to-orange-500" />
            <h2 className="text-xl font-bold tracking-tight">Art</h2>
            <span className="text-xs text-white/30">{artOnly.length} items</span>
          </div>

          {artOnly.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {artOnly.map((art) => (
                <ArtCollectionCard
                  key={`art-${art.id}`}
                  item={{ ...art, type: "art" }}
                  onClick={() => !isEditOpen && handleOpen({ ...art, type: "art" })}
                  onEdit={() => handleEdit({ ...art, type: "art" })}
                  onDelete={() => handleDelete({ ...art, type: "art" })}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-white/[0.06] rounded-xl">
              <p className="text-white/20 text-sm">No artworks yet</p>
            </div>
          )}
        </section>

        {/* DIVIDER */}
        <div className="border-t border-white/5 mb-12" />

        {/* ──── JOBS & APPLICATIONS SECTION ──── */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-[3px] h-6 rounded-sm bg-gradient-to-b from-emerald-400 to-teal-500" />
            <h2 className="text-xl font-bold tracking-tight">Jobs Applications</h2>
            <span className="text-xs text-white/30">
              {jobs.length} jobs &middot; {applications.length} applications
            </span>
          </div>

          {jobs.length > 0 || applications.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              {jobs.map((job) => (
                <JobCollectionCard
                  key={`job-${job.id}`}
                  item={{ ...job, type: "job" }}
                  onClick={() => !isEditOpen && handleOpen({ ...job, type: "job" })}
                  onEdit={() => handleEdit({ ...job, type: "job" })}
                  onDelete={() => handleDelete({ ...job, type: "job" })}
                />
              ))}
              {applications.map((app) => (
                <ApplicationCollectionCard
                  key={`application-${app.id}`}
                  item={{ ...app, type: "application" }}
                  onClick={() => !isEditOpen && handleOpen({ ...app, type: "application" })}
                  onEdit={() => handleEdit({ ...app, type: "application" })}
                  onDelete={() => handleDelete({ ...app, type: "application" })}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-white/[0.06] rounded-xl">
              <p className="text-white/20 text-sm">No jobs or applications yet</p>
            </div>
          )}
        </section>

        {/* DIVIDER */}
        <div className="border-t border-white/5 mb-12" />

        {/* ──── IDEATION / COMMUNITY SECTION ──── */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-[3px] h-6 rounded-sm bg-gradient-to-b from-blue-400 to-violet-500" />
            <h2 className="text-xl font-bold tracking-tight">
              {postsMode === "post" ? "Ideation" : "Community"}
            </h2>

            {/* Pill toggle */}
            <div className="flex items-center bg-white/5 rounded-lg p-0.5">
              <button
                onClick={() => setPostsMode("post")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                  postsMode === "post"
                    ? "bg-blue-500 text-white shadow-sm shadow-blue-500/25"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Ideation
                <span className={`ml-1 text-[10px] ${postsMode === "post" ? "text-blue-200" : "text-gray-600"}`}>
                  {postOnly.length}
                </span>
              </button>
              <button
                onClick={() => setPostsMode("community")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                  postsMode === "community"
                    ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/25"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Community
                <span className={`ml-1 text-[10px] ${postsMode === "community" ? "text-emerald-200" : "text-gray-600"}`}>
                  {communityOnly.length}
                </span>
              </button>
            </div>
          </div>

          {activePosts.length > 0 ? (
            <div
              key={postsMode}
              className="animate-fade-in grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start"
            >
              {activePosts.map((item) => {
                const type = item.category;
                const Card = type === "community" ? CommunityCollectionCard : PostCollectionCard;
                return (
                  <Card
                    key={`${type}-${item.id}`}
                    item={{ ...item, type }}
                    onClick={() => !isEditOpen && handleOpen({ ...item, type })}
                    onEdit={() => handleEdit({ ...item, type })}
                    onDelete={() => handleDelete({ ...item, type })}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 border border-white/[0.06] rounded-xl">
              <p className="text-white/20 text-sm">
                {postsMode === "post"
                  ? "No ideation posts yet"
                  : "No community posts yet"}
              </p>
            </div>
          )}
        </section>
      </div>
      {isEditOpen && selectedItem && (
        <>
          {["art", "post", "community"].includes(selectedItem.type) && (
            <EditArtModal
              form={artForm}
              setForm={setArtForm}
              onClose={() => setIsEditOpen(false)}
              onSubmit={handleUpdateConceptArt}
            />
          )}

          {selectedItem.type === "job" && (
            <EditJobModal
              form={jobForm}
              setForm={setJobForm}
              onClose={() => setIsEditOpen(false)}
              onSubmit={handleUpdateJob}
            />
          )}
        </>
      )}
      {isAppModalOpen && selectedApplication && (
        <ApplicationDetailModal
          app={selectedApplication}
          onClose={() => setIsAppModalOpen(false)}
        />
      )}
    </div>
  );
};

export default MyCollection;
