import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, Navigate } from "react-router-dom";
import api, { isTokenExpired } from "../services/api";
import { useChat } from "../context/ChatContext";
import Navbar from "../components/layout/Navbar";
import ArtCollectionCard from "../components/collection/ArtCollectionCard";
import PostCollectionCard from "../components/collection/PostCollectionCard";
import CommunityCollectionCard from "../components/collection/CommunityCollectionCard";
import JobCollectionCard from "../components/collection/JobCollectionCard";
import DevlogCollectionCard from "../components/collection/DevlogCollectionCard";

const API_BASE = "/api";
const ASSET_BASE = "";

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

const ArrowLeftIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
    />
  </svg>
);

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openChatWithUser } = useChat();

  const profileId = parseInt(id);
  const isLoggedIn = !isTokenExpired();
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();
  const isSelf = currentUser?.id === profileId;

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  const [arts, setArts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [devlog, setDevlog] = useState([]);

  const [postsMode, setPostsMode] = useState("post");
  const [chatBusy, setChatBusy] = useState(false);
  const [chatError, setChatError] = useState(null);

  useEffect(() => {
    if (!profileId || Number.isNaN(profileId)) {
      setProfileError("Invalid profile id");
      setProfileLoading(false);
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      try {
        const res = await api.get(`/users/${profileId}`);
        if (!cancelled) setProfile(res.data.user);
      } catch (err) {
        if (!cancelled) {
          setProfileError(err.response?.data?.message || "Profile not found");
        }
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  useEffect(() => {
    if (!profileId || Number.isNaN(profileId)) return;

    let cancelled = false;

    const loadCollections = async () => {
      try {
        const [artRes, jobRes, devlogRes] = await Promise.all([
          fetch(`${API_BASE}/concept-arts/user/${profileId}`),
          fetch(`${API_BASE}/job-postings/user/${profileId}/public`),
          fetch(`${API_BASE}/devlog/user/${profileId}/public`),
        ]);
        const [artData, jobData, devlogData] = await Promise.all([
          artRes.json(),
          jobRes.json(),
          devlogRes.json(),
        ]);

        const rawArts = artData.art || [];
        const artsWithMedia = await Promise.all(
          rawArts.map(async (art) => {
            try {
              const r = await fetch(`${API_BASE}/art-media/art/${art.id}`);
              const d = await r.json();
              return { ...art, media: d.data || [] };
            } catch {
              return { ...art, media: [] };
            }
          }),
        );

        const rawDevs = devlogData.data || [];
        const devsWithMedia = await Promise.all(
          rawDevs.map(async (log) => {
            try {
              const r = await fetch(`${API_BASE}/devlog-media/log/${log.id}`);
              const d = await r.json();
              return { ...log, media: d.data || [] };
            } catch {
              return { ...log, media: [] };
            }
          }),
        );

        if (cancelled) return;
        setArts(artsWithMedia);
        setJobs(jobData.data || []);
        setDevlog(devsWithMedia);
      } catch (err) {
        console.error("Profile collections fetch error:", err);
      }
    };

    loadCollections();
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  const handleOpen = (item) => {
    if (item.type === "art") navigate(`/art/${item.id}`);
    if (item.type === "post") navigate(`/post/${item.id}`);
    if (item.type === "community") navigate(`/post/${item.id}`);
    if (item.type === "job") navigate(`/job/${item.id}`);
    if (item.type === "devlog") navigate(`/devlog/${item.id}`);
  };

  const handleMessage = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (chatBusy) return;
    setChatBusy(true);
    setChatError(null);
    const result = await openChatWithUser(profileId);
    setChatBusy(false);
    if (!result?.ok) {
      setChatError(result?.message || "Failed to open chat");
    }
  };

  if (isSelf) {
    return <Navigate to="/mycollection" replace />;
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020408] via-[#06091a] to-[#080c20]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-9 h-9 rounded-full border-2 border-white/5 border-t-amber-400/80 animate-spin" />
          <p className="text-white/30 text-xs tracking-[0.15em] font-mono uppercase">
            Loading Profile
          </p>
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#020408] via-[#06091a] to-[#080c20] text-white">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 pt-20 text-center">
          <h1 className="text-xl font-bold mb-2">User not found</h1>
          <p className="text-white/40 text-sm mb-6">
            {profileError || "We couldn't find that profile."}
          </p>
          <Link to="/" className="text-amber-400 hover:underline text-sm">
            ← Back home
          </Link>
        </div>
      </div>
    );
  }

  const avatar = profile.profile_image
    ? `${ASSET_BASE}/${profile.profile_image}`
    : `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`;

  const artOnly = arts.filter((a) => a.category === "art");
  const postOnly = arts.filter((a) => a.category === "post");
  const communityOnly = arts.filter((a) => a.category === "community");
  const activePosts = postsMode === "post" ? postOnly : communityOnly;

  const isClosed = profile.collaboration_status === "closed";

  let messageButtonLabel = "Message";
  let messageButtonDisabled = false;
  let messageButtonTitle = "Send a direct message";

  if (chatBusy) {
    messageButtonLabel = "Opening…";
    messageButtonDisabled = true;
  } else if (isClosed) {
    messageButtonLabel = "Not accepting messages";
    messageButtonDisabled = true;
    messageButtonTitle = "This user is not accepting new messages";
  } else if (!isLoggedIn) {
    messageButtonTitle = "Log in to send a message";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020408] via-[#06091a] to-[#080c20] text-white">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-indigo-500/5 blur-3xl pointer-events-none z-0" />

      <Navbar />

      <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 pt-6 sm:pt-10 pb-16 sm:pb-20">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors duration-200 mb-5"
        >
          <ArrowLeftIcon />
          Back
        </button>

        {/* PROFILE HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-12">
          <img
            src={avatar}
            alt={profile.username}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-white/15 object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {profile.username}
              </h1>
              <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-white/60">
                {profile.role}
              </span>
              <span
                className={`text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-md border ${
                  isClosed
                    ? "border-red-400/30 bg-red-400/10 text-red-300/80"
                    : "border-emerald-400/30 bg-emerald-400/10 text-emerald-300/80"
                }`}
              >
                {isClosed ? "DMs closed" : "Open to collab"}
              </span>
            </div>
            <p className="text-white/40 text-xs mt-1 tracking-wide">
              {arts.length} works · {jobs.length} active jobs · {devlog.length} devlogs
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <button
              onClick={handleMessage}
              disabled={messageButtonDisabled}
              title={messageButtonTitle}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                messageButtonDisabled
                  ? "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
                  : "bg-white/10 border border-white/15 text-white hover:bg-white/15"
              }`}
            >
              <ChatBubbleIcon className="w-4 h-4" />
              {messageButtonLabel}
            </button>
            {chatError && (
              <p className="text-[11px] text-red-300/80">{chatError}</p>
            )}
          </div>
        </div>

        {/* ART */}
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
                  onClick={() => handleOpen({ ...art, type: "art" })}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-white/[0.06] rounded-xl">
              <p className="text-white/20 text-sm">No artworks yet</p>
            </div>
          )}
        </section>

        <div className="border-t border-white/5 mb-12" />

        {/* JOB POSTINGS */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-[3px] h-6 rounded-sm bg-gradient-to-b from-emerald-400 to-teal-500" />
            <h2 className="text-xl font-bold tracking-tight">Active Job Postings</h2>
            <span className="text-xs text-white/30">{jobs.length} jobs</span>
          </div>
          {jobs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              {jobs.map((job) => (
                <JobCollectionCard
                  key={`job-${job.id}`}
                  item={{ ...job, type: "job" }}
                  onClick={() => handleOpen({ ...job, type: "job" })}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-white/[0.06] rounded-xl">
              <p className="text-white/20 text-sm">No active job postings</p>
            </div>
          )}
        </section>

        <div className="border-t border-white/5 mb-12" />

        {/* IDEATION / COMMUNITY */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-[3px] h-6 rounded-sm bg-gradient-to-b from-blue-400 to-violet-500" />
            <h2 className="text-xl font-bold tracking-tight">
              {postsMode === "post" ? "Ideation" : "Community"}
            </h2>
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
                <span
                  className={`ml-1 text-[10px] ${
                    postsMode === "post" ? "text-blue-200" : "text-gray-600"
                  }`}
                >
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
                <span
                  className={`ml-1 text-[10px] ${
                    postsMode === "community" ? "text-emerald-200" : "text-gray-600"
                  }`}
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
                    onClick={() => handleOpen({ ...item, type })}
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

        <div className="border-t border-white/5 mb-12" />

        {/* DEVLOGS */}
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
                  onClick={() => handleOpen({ ...log, type: "devlog" })}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-white/[0.06] rounded-xl">
              <p className="text-white/20 text-sm">No devlogs yet</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default UserProfile;
