import { useEffect, useState, useRef } from "react";
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
import DevlogCollectionCard from "../components/collection/DevlogCollectionCard";
import EditDevlogModal from "../components/collection/modal/EditDevlogModal";
import ApplicationDetailModal from "../components/collection/modal/AplicationDetailModal";
import EditArtModal from "../components/collection/modal/EditArtModal";
import EditPostModal from "../components/collection/modal/EditPostModal";
import EditJobModal from "../components/collection/modal/EditJobModal";
import ScriptingCollectionCard from "../components/collection/ScriptCollectionCard";
import EditScriptingModal from "../components/collection/modal/EditScriptingModal";
import TutorialCollectionCard from "../components/collection/TutorialCollectionCard";
import EditTutorialModal from "../components/collection/modal/EditTutorialModal";

const API_BASE = "/api";

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

const MyCollection = () => {
  const navigate = useNavigate();
  const [arts, setArts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [devlog, setDevlog] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [postsMode, setPostsMode] = useState("post");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreview, setMediaPreview] = useState([]);

  const [user] = useState(() => JSON.parse(localStorage.getItem("user")));
  const token = localStorage.getItem("token");

  const hasFetched = useRef(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [artForm, setArtForm] = useState({
    title: "",
    description: "",
    status: "",
    tag: "",
    category: "",
  });

  const [devlogForm, setDevlogForm] = useState({
    title: "",
    content: "",
    category: "",
    genre: "",
    tag: "",
    status: "",
    cover_image: "",
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

  const [scriptings, setScriptings] = useState([]);
  const [scriptingForm, setScriptingForm] = useState({
    title: "",
    description: "",
    status: "",
    tag: "",
  });

  const [tutorials, setTutorials] = useState([]);
  const [tutorialForm, setTutorialForm] = useState({
    title: "",
    content: "",
    tag: "",
  });

  useEffect(() => {
    if (!user || !token) navigate("/login");
  }, [user, token, navigate]);

  useEffect(() => {
    if (hasFetched.current) return;
    if (!user?.id || !token) return;

    hasFetched.current = true;

    const fetchData = async () => {
      try {
        const [artRes, jobRes, appRes, devlogRes, scriptRes, tutorialRes] =
          await Promise.all([
            fetch(`${API_BASE}/concept-arts/user/${user.id}`),
            fetch(`${API_BASE}/job-postings/user/${user.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_BASE}/job-applications`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_BASE}/devlog/user/${user.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_BASE}/script/user/${user.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            user.role === "moderator"
              ? fetch(`${API_BASE}/tutorial/user/${user.id}`)
              : Promise.resolve({ json: async () => ({ data: [] }) }),
          ]);

        const [
          artData,
          jobData,
          appData,
          devlogData,
          scriptData,
          tutorialData,
        ] = await Promise.all([
          artRes.json(),
          jobRes.json(),
          appRes.json(),
          devlogRes.json(),
          scriptRes.json(),
          tutorialRes.json(),
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

        const devs = devlogData.data || [];
        const devsWithMedia = await Promise.all(
          devs.map(async (log) => {
            try {
              const res = await fetch(
                `${API_BASE}/devlog-media/log/${log.id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                },
              );
              const data = await res.json();
              return { ...log, media: data.data || [] };
            } catch {
              return { ...log, media: [] };
            }
          }),
        );

        const scripts = scriptData.data || [];

        const scriptsWithMedia = await Promise.all(
          scripts.map(async (script) => {
            try {
              const res = await fetch(
                `${API_BASE}/script-media/question/${script.id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              );

              const data = await res.json();

              return {
                ...script,
                media: data.data || [],
              };
            } catch {
              return {
                ...script,
                media: [],
              };
            }
          }),
        );

        const rawTutorials = tutorialData.data || [];
        const tutorialsWithMedia = await Promise.all(
          rawTutorials.map(async (tutorial) => {
            try {
              const res = await fetch(
                `${API_BASE}/tutorial-media/tutorial/${tutorial.id}`,
              );
              const mediaData = await res.json();
              return { ...tutorial, media: mediaData.data || [] };
            } catch {
              return { ...tutorial, media: [] };
            }
          }),
        );

        const rawApps = appData.data || appData || [];
        const appsWithJobTitle = await Promise.all(
          rawApps.map(async (app) => {
            try {
              const res = await fetch(`${API_BASE}/job-postings/${app.job_id}`);
              const data = await res.json();
              return { ...app, job_title: data.data?.title || null };
            } catch {
              return { ...app, job_title: null };
            }
          }),
        );

        setArts(artsWithMedia);
        setJobs(jobData.data || []);
        setApplications(appsWithJobTitle);
        setDevlog(devsWithMedia);
        setScriptings(scriptsWithMedia);
        setTutorials(tutorialsWithMedia);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, token]);

  const artOnly = arts.filter((a) => a.category === "art");
  const postOnly = arts.filter((a) => a.category === "post");
  const communityOnly = arts.filter((a) => a.category === "community");
  const activePosts = postsMode === "post" ? postOnly : communityOnly;
  const totalCount =
    arts.length +
    jobs.length +
    applications.length +
    devlog.length +
    scriptings.length +
    tutorials.length;

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
      if (item.type === "devlog") {
        await fetch(`${API_BASE}/devlog/${item.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setDevlog((prev) => prev.filter((d) => d.id !== item.id));
      }
      if (item.type === "scripting") {
        await fetch(`${API_BASE}/script/${item.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setScriptings((prev) => prev.filter((d) => d.id !== item.id));
      }
      if (item.type === "tutorial") {
        await fetch(`${API_BASE}/tutorial/${item.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTutorials((prev) => prev.filter((t) => t.id !== item.id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleUpdateDevlog = async ({
    mediaFiles = [],
    deletedMedia = [],
    removeCover = false,
  }) => {
    const formData = new FormData();

    Object.keys(devlogForm).forEach((key) => {
      if (key !== "cover_image" && devlogForm[key]) {
        formData.append(key, devlogForm[key]);
      }
    });

    for (const mediaId of deletedMedia) {
      await fetch(`${API_BASE}/devlog-media/${mediaId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    if (removeCover) {
      formData.append("remove_cover", "true");
    }

    if (name === "cover_image") {
      const file = files[0];
      if (!file) return;

      setRemoveCover(false);

      setForm((prev) => ({
        ...prev,
        cover_image: file,
      }));

      setPreview(URL.createObjectURL(file));

      return;
    }

    if (devlogForm.cover_image instanceof File) {
      formData.append("cover_image", devlogForm.cover_image);
    }

    const res = await fetch(`${API_BASE}/devlog/${selectedItem.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

    if (mediaFiles.length > 0) {
      const mediaForm = new FormData();

      mediaFiles.forEach((file) => {
        mediaForm.append("media", file);
      });

      await fetch(`${API_BASE}/devlog-media/log/${selectedItem.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: mediaForm,
      });
    }

    setDevlog((prev) =>
      prev.map((d) => (d.id === selectedItem.id ? { ...d, ...data.data } : d)),
    );

    setIsEditOpen(false);

    window.location.reload();
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

    if (item.type === "devlog") {
      setDevlogForm({
        title: item.title || "",
        content: item.content || "",
        category: item.category || "",
        genre: item.genre || "",
        tag: item.tag || "",
        status: item.status || "",
        cover_image: item.cover_image || null,
      });
    }

    if (item.type === "scripting") {
      setScriptingForm({
        title: item.title || "",
        content: item.content || "",
        code_snippet: item.code_snippet || "",
        tag: item.tag || "",
      });
    }

    if (item.type === "tutorial" || item.type === "asseting") {
      setTutorialForm({
        title: item.title || "",
        content: item.content || "",
        tag: item.tag || "",
      });
    }

    setIsEditOpen(true);
  };

  const handleOpen = (item) => {
    if (item.type === "art") navigate(`/art/${item.id}`);
    if (item.type === "post") navigate(`/post/${item.id}`);
    if (item.type === "community") navigate(`/post/${item.id}`);
    if (item.type === "job") navigate(`/job/${item.id}`);
    if (item.type === "devlog") navigate(`/devlog/${item.id}`);
    if (item.type === "scripting") navigate(`/scripting/${item.id}`);
    if (item.type === "tutorial") navigate(`/Asseting/${item.id}`);

    if (item.type === "application") {
      setSelectedApplication(item);
      setIsAppModalOpen(true);
    }
  };

  const handleUpdateConceptArt = async ({
    mediaFiles = [],
    deletedMedia = [],
  }) => {
    const res = await fetch(`${API_BASE}/concept-arts/${selectedItem.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(artForm),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

    for (const mediaId of deletedMedia) {
      await fetch(`${API_BASE}/art-media/${mediaId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    if (mediaFiles.length > 0) {
      const mediaForm = new FormData();

      mediaFiles.forEach((file) => {
        mediaForm.append("media", file);
      });

      await fetch(`${API_BASE}/art-media/art/${selectedItem.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: mediaForm,
      });
    }

    setArts((prev) =>
      prev.map((a) => (a.id === selectedItem.id ? { ...a, ...data.art } : a)),
    );

    setIsEditOpen(false);

    window.location.reload();
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

  const handleUpdateScripting = async ({
    mediaFiles = [],
    deletedMedia = [],
  }) => {
    try {
      // 1. Update data text pertanyaan (title, content, code_snippet, tag)
      const res = await fetch(`${API_BASE}/script/${selectedItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: scriptingForm.title,
          content: scriptingForm.content,
          code_snippet: scriptingForm.code_snippet,
          tag: scriptingForm.tag,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // 2. Hapus media lama yang ditandai user untuk dihapus
      if (deletedMedia.length > 0) {
        await Promise.all(
          deletedMedia.map(async (id) => {
            const delRes = await fetch(`${API_BASE}/script-media/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!delRes.ok) {
              const delData = await delRes.json();
              console.error(`Failed to delete media ${id}:`, delData.message);
            }
          }),
        );
      }

      // 3. Upload media baru jika user menambahkan file baru
      if (mediaFiles.length > 0) {
        const formData = new FormData();
        mediaFiles.forEach((file) => {
          formData.append("media", file); // Sesuai dengan uploadScriptingMedia.array('media', 3)
        });

        const uploadRes = await fetch(
          `${API_BASE}/script-media/question/${selectedItem.id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`, // Biarkan Browser menentukan Content-Type secara otomatis untuk FormData
            },
            body: formData,
          },
        );

        if (!uploadRes.ok) {
          const uploadData = await uploadRes.json();
          throw new Error(uploadData.message || "Failed to upload new media.");
        }
      }

      setIsEditOpen(false);
      alert("Scripting question and media updated successfully!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleUpdateTutorial = async ({
    mediaFiles = [],
    deletedMedia = [],
  }) => {
    try {
      // A. Update teks data tutorial
      const res = await fetch(`${API_BASE}/tutorial/${selectedItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: tutorialForm.title,
          content: tutorialForm.content,
          tag: tutorialForm.tag,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // B. Hapus media lama (jika ada yang di-klik silang oleh user)
      if (deletedMedia.length > 0) {
        await Promise.all(
          deletedMedia.map(async (id) => {
            const delRes = await fetch(`${API_BASE}/tutorial-media/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!delRes.ok) {
              const delData = await delRes.json();
              console.error(`Failed to delete media ${id}:`, delData.message);
            }
          }),
        );
      }

      // C. Upload media gambar baru (Endpoint: POST /api/tutorial-media/tutorial/:id)
      if (mediaFiles.length > 0) {
        const formData = new FormData();
        mediaFiles.forEach((file) => {
          formData.append("media", file); // Sesuaikan key file upload dari multer backend kamu
        });

        const uploadRes = await fetch(
          `${API_BASE}/tutorial-media/tutorial/${selectedItem.id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          },
        );

        if (!uploadRes.ok) {
          const uploadData = await uploadRes.json();
          throw new Error(
            uploadData.message || "Failed to upload new tutorial media.",
          );
        }
      }

      setIsEditOpen(false);
      alert("Tutorial and asset media updated successfully!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleUpdateJob = async () => {
    try {
      const payload = { ...jobForm };

      Object.keys(payload).forEach((key) => {
        if (payload[key] === "" || payload[key] === null) {
          delete payload[key];
        }
      });

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

      alert("Update berhasil");
      setIsEditOpen(false);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020408] via-[#06091a] to-[#080c20] text-white break-words [overflow-wrap:anywhere]">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-indigo-500/5 blur-3xl pointer-events-none z-0" />

      <Navbar />

      <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 pt-6 sm:pt-10 pb-16 sm:pb-20">
        {/* HEADER */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-[3px] h-7 rounded-sm bg-gradient-to-b from-amber-400 to-red-400" />
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
              My Collection
            </h1>
          </div>
          <p className="text-white/35 text-sm ml-[15px] tracking-wide">
            {totalCount} items — arts, posts, jobs applications, and DevLogs
          </p>
        </div>

        {/* ──── ART SECTION ──── */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-[3px] h-6 rounded-sm bg-gradient-to-b from-amber-400 to-orange-500" />
            <h2 className="text-xl font-bold tracking-tight">Art</h2>
            <span className="text-xs text-white/30">
              {artOnly.length} items
            </span>
          </div>

          {artOnly.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {artOnly.map((art) => (
                <ArtCollectionCard
                  key={`art-${art.id}`}
                  item={{ ...art, type: "art" }}
                  onClick={() =>
                    !isEditOpen && handleOpen({ ...art, type: "art" })
                  }
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
            <h2 className="text-xl font-bold tracking-tight">
              Jobs Applications
            </h2>
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
                  onClick={() =>
                    !isEditOpen && handleOpen({ ...job, type: "job" })
                  }
                  onEdit={() => handleEdit({ ...job, type: "job" })}
                  onDelete={() => handleDelete({ ...job, type: "job" })}
                />
              ))}
              {applications.map((app) => (
                <ApplicationCollectionCard
                  key={`application-${app.id}`}
                  item={{ ...app, type: "application" }}
                  onClick={() =>
                    !isEditOpen && handleOpen({ ...app, type: "application" })
                  }
                  onEdit={() => handleEdit({ ...app, type: "application" })}
                  onDelete={() => handleDelete({ ...app, type: "application" })}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-white/[0.06] rounded-xl">
              <p className="text-white/20 text-sm">
                No jobs or applications yet
              </p>
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
                className={`cursor-pointer px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                  postsMode === "post"
                    ? "bg-blue-500 text-white shadow-sm shadow-blue-500/25"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Ideation
                <span
                  className={`ml-1 text-[10px] ${postsMode === "post" ? "text-blue-200" : "text-gray-600"}`}
                >
                  {postOnly.length}
                </span>
              </button>
              <button
                onClick={() => setPostsMode("community")}
                className={`cursor-pointer px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                  postsMode === "community"
                    ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/25"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Community
                <span
                  className={`ml-1 text-[10px] ${postsMode === "community" ? "text-emerald-200" : "text-gray-600"}`}
                >
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
                const Card =
                  type === "community"
                    ? CommunityCollectionCard
                    : PostCollectionCard;
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

        {/* DIVIDER */}
        <div className="border-t border-white/5 mb-12" />

        {/* ──── DEVLOG SECTION ──── */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-[3px] h-6 rounded-sm bg-gradient-to-b from-indigo-400 to-purple-500" />
            <h2 className="text-xl font-bold tracking-tight">Devlogs</h2>
            <span className="text-xs text-white/30">{devlog.length} items</span>
          </div>

          {devlog.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {devlog.map((log) => (
                <DevlogCollectionCard
                  key={`devlog-${log.id}`}
                  item={{ ...log, type: "devlog" }}
                  onClick={() =>
                    !isEditOpen && handleOpen({ ...log, type: "devlog" })
                  }
                  onEdit={() => handleEdit({ ...log, type: "devlog" })}
                  onDelete={() => handleDelete({ ...log, type: "devlog" })}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-white/[0.06] rounded-xl">
              <p className="text-white/20 text-sm">No devlogs yet</p>
            </div>
          )}
        </section>
        {/* ──── SCRIPTING SECTION ──── */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-[3px] h-6 rounded-sm bg-gradient-to-b from-amber-400 to-orange-500" />
            <h2 className="text-xl font-bold tracking-tight">
              Scripting Questions
            </h2>
            <span className="text-xs text-white/30">
              {scriptings.length} items
            </span>
          </div>

          {scriptings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
              {scriptings.map((script) => (
                <ScriptingCollectionCard
                  key={`script-${script.id}`}
                  item={{ ...script, type: "scripting" }}
                  onClick={() =>
                    !isEditOpen && handleOpen({ ...script, type: "scripting" })
                  }
                  onEdit={() => handleEdit({ ...script, type: "scripting" })}
                  onDelete={() =>
                    handleDelete({ ...script, type: "scripting" })
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-white/[0.06] rounded-xl">
              <p className="text-white/20 text-sm">
                No scripting questions yet
              </p>
            </div>
          )}
        </section>
        {/* ──── TUTORIAL / ASSETING MODERATION SECTION ──── */}
        {user?.role === "moderator" && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-[3px] h-6 rounded-sm bg-gradient-to-b from-amber-500 to-yellow-400" />
              <h2 className="text-xl font-bold tracking-tight">
                Tutorial & Asseting Moderation
              </h2>
              <span className="text-xs text-white/30">
                {tutorials.length} items
              </span>
            </div>

            {tutorials.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
                {tutorials.map((tutorial) => (
                  <TutorialCollectionCard
                    key={`tutorial-${tutorial.id}`}
                    item={{ ...tutorial, type: "tutorial" }}
                    onClick={() =>
                      !isEditOpen && handleOpen({ ...tutorial, type: "tutorial" })
                    }
                    onEdit={() => handleEdit({ ...tutorial, type: "tutorial" })}
                    onDelete={() =>
                      handleDelete({ ...tutorial, type: "tutorial" })
                    }
                    statusConfig={STATUS_CONFIG}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-white/[0.06] rounded-xl">
                <p className="text-white/20 text-sm">
                  No tutorials or moderation assets available.
                </p>
              </div>
            )}
          </section>
        )}
      </div>

      {isEditOpen && selectedItem && (
        <>
          {selectedItem.type === "art" && (
            <EditArtModal
              form={artForm}
              setForm={setArtForm}
              media={selectedItem.media || []}
              onClose={() => setIsEditOpen(false)}
              onSubmit={handleUpdateConceptArt}
            />
          )}

          {["post", "community"].includes(selectedItem.type) && (
            <EditPostModal
              form={artForm}
              setForm={setArtForm}
              media={selectedItem.media || []}
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

          {selectedItem.type === "devlog" && (
            <EditDevlogModal
              form={devlogForm}
              setForm={setDevlogForm}
              media={selectedItem.media || []}
              onClose={() => setIsEditOpen(false)}
              onSubmit={handleUpdateDevlog}
            />
          )}

          {selectedItem.type === "scripting" && (
            <EditScriptingModal
              form={scriptingForm}
              setForm={setScriptingForm}
              media={selectedItem.media || []}
              onClose={() => setIsEditOpen(false)}
              onSubmit={handleUpdateScripting}
            />
          )}
          {(selectedItem.type === "tutorial" ||
            selectedItem.type === "asseting") && (
            <EditTutorialModal
              form={tutorialForm}
              setForm={setTutorialForm}
              media={selectedItem.media || []}
              onClose={() => setIsEditOpen(false)}
              onSubmit={handleUpdateTutorial}
            />
          )}
        </>
      )}

      {isAppModalOpen && selectedApplication && (
        <ApplicationDetailModal
          app={selectedApplication}
          onClose={() => setIsAppModalOpen(false)}
          currentUserId={user?.id}
        />
      )}
    </div>
  );
};

export default MyCollection;
