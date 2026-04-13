import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

const API_BASE = "http://localhost:5000/api";

const TYPE_CONFIG = {
  art: {
    label: "Art",
    dot: "bg-amber-400",
    dotGlow: "shadow-amber-400/50",
    text: "text-amber-400",
    border: "border-amber-400/30",
    bg: "bg-amber-400/10",
    badge: "border-amber-400/30 text-amber-400",
  },
  post: {
    label: "Post",
    dot: "bg-blue-400",
    dotGlow: "shadow-blue-400/50",
    text: "text-blue-400",
    border: "border-blue-400/30",
    bg: "bg-blue-400/10",
    badge: "border-blue-400/30 text-blue-400",
  },
  community: {
    label: "Community",
    dot: "bg-violet-400",
    dotGlow: "shadow-violet-400/50",
    text: "text-violet-400",
    border: "border-violet-400/30",
    bg: "bg-violet-400/10",
    badge: "border-violet-400/30 text-violet-400",
  },
  job: {
    label: "Job",
    dot: "bg-emerald-400",
    dotGlow: "shadow-emerald-400/50",
    text: "text-emerald-400",
    border: "border-emerald-400/30",
    bg: "bg-emerald-400/10",
    badge: "border-emerald-400/30 text-emerald-400",
  },
  application: {
    label: "Application",
    dot: "bg-red-400",
    dotGlow: "shadow-red-400/50",
    text: "text-red-400",
    border: "border-red-400/30",
    bg: "bg-red-400/10",
    badge: "border-red-400/30 text-red-400",
  },
};
const EditArtModal = ({ form, setForm, onClose, onSubmit }) => {
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70"
      onMouseDown={(e) => {
        e.stopPropagation(); // 🔥 penting
        if (e.target === e.currentTarget) onClose();
      }}
      onClick={(e) => e.stopPropagation()} // 🔥 tambah ini juga
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#0f1323] p-6 rounded-2xl"
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
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70"
      onMouseDown={(e) => {
        e.stopPropagation(); // 🔥 penting
        if (e.target === e.currentTarget) onClose();
      }}
      onClick={(e) => e.stopPropagation()} // 🔥 tambah ini juga
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0f1323] p-6 rounded-2xl"
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

        <input
          name="work_option"
          value={form.work_option}
          onChange={handleChange}
          placeholder="Remote / Onsite"
          className="w-full mb-3 p-2 bg-[#0a0d1a] pointer-events-auto"
        />

        <input
          name="work_type"
          value={form.work_type}
          onChange={handleChange}
          placeholder="Fulltime / Parttime"
          className="w-full mb-3 p-2 bg-[#0a0d1a] pointer-events-auto"
        />

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

        <input
          name="salary_currency"
          value={form.salary_currency}
          onChange={handleChange}
          placeholder="Currency"
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
          <option value="Closed">Closed</option>
        </select>

        <input
          name="expired_at"
          value={form.expired_at}
          onChange={handleChange}
          placeholder="DD-MM-YYYY"
          className="w-full mb-4 p-2 bg-[#0a0d1a] pointer-events-auto"
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

const FILTERS = ["all", "art", "post", "community", "job", "application"];

const MyCollection = () => {
  const navigate = useNavigate();
  const [arts, setArts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);

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

  const collection = [
    ...arts.map((a) => ({ ...a, type: a.category })),
    ...jobs.map((j) => ({ ...j, type: "job" })),
    ...applications.map((a) => ({ ...a, type: "application" })),
  ];

  const filtered = collection.filter((item) =>
    filter === "all" ? true : item.type === filter,
  );

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] =
      f === "all"
        ? collection.length
        : collection.filter((i) => i.type === f).length;
    return acc;
  }, {});

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
        expired_at: item.expired_at || "",
      });
    }

    setIsEditOpen(true);
  };
  const handleOpen = (item) => {
    if (item.type === "art") navigate(`/art/${item.id}`);
    if (item.type === "post") navigate(`/post/${item.id}`);
    if (item.type === "job") navigate(`/job/${item.id}`);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
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

    setArts((prev) =>
      prev.map((a) => (a.id === selectedItem.id ? data.art : a)),
    );
  };

  const handleUpdateJob = async () => {
    const payload = { ...jobForm };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === "") delete payload[key];
    });

    const res = await fetch(`${API_BASE}/job-postings/${selectedItem.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);
    
    alert("Update Success");

    setJobs((prev) =>
      prev.map((j) => (j.id === selectedItem.id ? data.data : j)),
    );
  };

  const renderMedia = (item) => {
    const firstMedia = item.media?.[0];
    if (!firstMedia) {
      if (item.type === "post") {
        return (
          <div className="w-full h-full flex items-end p-5 bg-gradient-to-br from-[#0d1b2a] to-[#1a2744]">
            <p className="text-sm text-white font-semibold leading-snug line-clamp-4 opacity-90">
              {item.title}
            </p>
          </div>
        );
      }
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#0f0f1a] to-[#1a1030]">
          <span className="text-4xl opacity-10">🎨</span>
          <span className="text-[10px] text-white/20 tracking-widest uppercase">
            No Media
          </span>
        </div>
      );
    }
    const src = firstMedia.media;
    const isVideo = src?.match(/\.(mp4|webm|ogg)$/i);
    if (isVideo) {
      return (
        <video
          src={src}
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      );
    }
    return (
      <img
        src={src}
        alt={item.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
    );
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

      <div className="relative z-10 w-full px-6 md:px-8 pt-10 pb-20">
        {/* HEADER */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-[3px] h-7 rounded-sm bg-gradient-to-b from-amber-400 to-red-400" />
            <h1 className="text-3xl font-bold tracking-tight">My Collection</h1>
          </div>
          <p className="text-white/35 text-sm ml-[15px] tracking-wide">
            {collection.length} items — arts, posts, jobs & applications
          </p>
        </div>

        {/* FILTER TABS */}
        <div className="flex flex-wrap gap-2 mb-10 p-1.5 bg-white/[0.03] border border-white/[0.06] rounded-2xl w-fit">
          {FILTERS.map((f) => {
            const cfg = TYPE_CONFIG[f];
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`
                  flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold
                  tracking-wide capitalize transition-all duration-200 border
                  ${
                    isActive
                      ? f === "all"
                        ? "bg-white/10 text-white border-white/20"
                        : `${cfg.bg} ${cfg.text} ${cfg.border}`
                      : "bg-transparent text-white/35 border-transparent hover:text-white/60"
                  }
                `}
              >
                {f !== "all" && (
                  <span
                    className={`
                    w-1.5 h-1.5 rounded-full inline-block transition-all
                    ${isActive ? `${cfg.dot} shadow-sm` : "bg-white/20"}
                  `}
                  />
                )}
                {f === "all" ? "All" : cfg?.label}
                <span
                  className={`
                  text-[10px] px-1.5 py-px rounded-full transition-all
                  ${
                    isActive
                      ? f === "all"
                        ? "bg-white/15 text-white"
                        : `bg-white/10 ${cfg.text}`
                      : "bg-white/5 text-white/25"
                  }
                `}
                >
                  {counts[f]}
                </span>
              </button>
            );
          })}
        </div>

        {/* GRID */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((item) => {
              const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.art;
              const isHovered = hoveredId === `${item.type}-${item.id}`;
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={(e) => {
                    if (isEditOpen) return; // 🔥 cegah click pas modal buka
                    handleOpen(item);
                  }}
                  onMouseEnter={() => setHoveredId(`${item.type}-${item.id}`)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`
                    group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer
                    bg-[#0a0d1a] border transition-all duration-300
                    ${
                      isHovered
                        ? `${cfg.border} -translate-y-1 scale-[1.01] shadow-2xl`
                        : "border-white/[0.06] shadow-lg"
                    }
                  `}
                >
                  {/* MEDIA */}
                  <div className="absolute inset-0 overflow-hidden">
                    {["art", "post", "community"].includes(item.type) &&
                      renderMedia(item)}

                    {item.type === "job" && (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-5 bg-gradient-to-br from-[#0a1f0f] via-[#0d2818] to-[#071a10]">
                        <span className="text-3xl opacity-60">💼</span>
                        <p className="text-white/80 text-sm font-semibold text-center leading-snug line-clamp-3">
                          {item.title}
                        </p>
                      </div>
                    )}

                    {item.type === "application" && (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-5 bg-gradient-to-br from-[#1a0808] via-[#200d0d] to-[#120606]">
                        <span className="text-3xl opacity-60">📋</span>
                        <p className="text-white/40 text-[11px] tracking-wide">
                          Applied to Job
                        </p>
                        <p className="text-red-400 text-lg font-bold font-mono">
                          #{item.job_id}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* GRADIENT OVERLAY */}
                  <div
                    className={`
                    pointer-events-none
                    absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent
                    transition-opacity duration-300
                    ${isHovered ? "opacity-100" : "opacity-50"}
                  `}
                  />

                  {/* TYPE BADGE */}
                  <div
                    className={`
                    absolute top-2 left-2 flex items-center gap-1.5
                    bg-black/55 backdrop-blur-md border rounded-lg px-2 py-1
                    ${cfg.badge}
                  `}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    <span className="text-[9px] font-bold tracking-widest uppercase">
                      {cfg.label}
                    </span>
                  </div>

                  {/* HOVER CONTENT */}
                  <div
                    className={`
                    absolute bottom-0 left-0 right-0 p-3 transition-all duration-300
                    ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
                  `}
                  >
                    {item.title && (
                      <p className="text-xs font-semibold text-white leading-snug line-clamp-2 mb-2">
                        {item.title}
                      </p>
                    )}

                    {/* ACTIONS */}
                    <div className="flex gap-1.5">
                      {item.type !== "application" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(item);
                          }}
                          className="flex-1 py-1.5 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide hover:bg-white/20 transition-all"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item);
                        }}
                        className={`
                          py-1.5 rounded-lg border border-red-400/30 bg-red-400/15 backdrop-blur-md
                          text-red-400 text-[11px] font-semibold hover:bg-red-400/30 transition-all
                          ${item.type === "application" ? "flex-1" : "w-8"}
                        `}
                      >
                        {item.type === "application" ? "Withdraw" : "🗑"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-4xl">
              📂
            </div>
            <div className="text-center">
              <p className="text-white/50 text-sm font-semibold mb-1">
                No items found
              </p>
              <p className="text-white/20 text-xs">
                Try a different filter or add something new
              </p>
            </div>
          </div>
        )}
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
    </div>
  );
};

export default MyCollection;
