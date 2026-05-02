import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { sanitizeFields, isValidEmail } from "../utils/sanitize";

const API_BASE = "http://localhost:5000/api";
const BASE_URL = "http://localhost:5000";

// ─── Icon Components ──────────────────────────────────────────────────────────

const CameraIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const UserIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1L3 5v6c0 5.25 3.75 10.15 9 11.25C17.25 21.15 21 16.25 21 11V5l-9-4zm-1 14l-4-4 1.4-1.4L11 12.2l5.6-5.6L18 8l-7 7z" />
  </svg>
);

const AlertIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L1 21h22L12 2zm0 4l7.5 13H4.5L12 6zm-1 4v4h2v-4h-2zm0 6v2h2v-2h-2z" />
  </svg>
);

const UploadIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const StarIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
  </svg>
);

const ChatBubbleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

// ─── Reusable Sub-components ──────────────────────────────────────────────────

const SectionCard = ({ icon, title, accent = false, children }) => (
  <div
    className={`rounded-xl border mb-4 overflow-hidden backdrop-blur-md ${
      accent
        ? "bg-red-500/5 border-red-500/20"
        : "bg-[#111827]/60 border-white/10"
    }`}
  >
    <div
      className={`flex items-center gap-2.5 px-5 py-3.5 border-b ${
        accent ? "border-red-500/20" : "border-white/10"
      }`}
    >
      <div
        className={`w-6 h-6 rounded-md flex items-center justify-center p-1 ${
          accent ? "bg-red-500/10 text-red-400" : "bg-white/5 text-yellow-400"
        }`}
      >
        {icon}
      </div>
      <span
        className={`text-sm font-medium ${accent ? "text-red-400" : "text-white"}`}
      >
        {title}
      </span>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const InputField = ({ label, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">
      {label}
    </label>
    <input
      {...props}
      className="w-full px-3 py-2.5 rounded-lg
    bg-white/5 border border-white/10
    text-white text-sm placeholder:text-gray-500
      focus:outline-none focus:border-yellow-400 focus:bg-white/10
      transition"
    />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SettingsPage() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [collabSaving, setCollabSaving] = useState(false);
  const [collabError, setCollabError] = useState(null);

  const getDefaultAvatar = () => {
    const seed = user?.username || user?.email || "guest";
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}`;
  };

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUser(data.user);
      setForm((prev) => ({
        ...prev,
        username: data.user.username || "",
        email: data.user.email || "",
      }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanForm = sanitizeFields(form, ["username", "email"]);

      const payload = {};

      if (cleanForm.username) payload.username = cleanForm.username;
      if (cleanForm.email) {
        if (!isValidEmail(cleanForm.email)) {
          throw new Error("Invalid email format");
        }
        payload.email = cleanForm.email;
      }

      if (form.new_password) {
        if (form.new_password !== form.confirm_password) {
          throw new Error("Password confirmation does not match");
        }

        if (form.new_password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }

        payload.new_password = form.new_password;
        payload.current_password = form.current_password;
      }

      const res = await fetch(`${API_BASE}/users`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // 🔥 FETCH USER TERBARU
      const updatedRes = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedData = await updatedRes.json();

      // 🔥 UPDATE STATE
      setUser(updatedData.user);

      // 🔥 UPDATE LOCAL STORAGE (INI YANG PENTING)
      localStorage.setItem("user", JSON.stringify(updatedData.user));

      // 🔥 RESET PASSWORD FIELD
      setForm((prev) => ({
        ...prev,
        current_password: "",
        new_password: "",
        confirm_password: "",
      }));

      // 🔥 SUCCESS FEEDBACK
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);

      alert("success");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCollaboration = async () => {
    if (collabSaving || !user) return;
    const previous = user.collaboration_status || "open";
    const next = previous === "open" ? "closed" : "open";

    setCollabSaving(true);
    setCollabError(null);
    setUser((prev) => (prev ? { ...prev, collaboration_status: next } : prev));

    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ collaboration_status: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");

      const updated = data.user || { ...user, collaboration_status: next };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
    } catch (err) {
      setUser((prev) =>
        prev ? { ...prev, collaboration_status: previous } : prev,
      );
      setCollabError(err.message || "Could not save preference");
    } finally {
      setCollabSaving(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUploadAvatar = async () => {
    if (!avatar) return;
    const formData = new FormData();
    formData.append("profile_image", avatar);
    try {
      const res = await fetch(`${API_BASE}/users/avatar`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAvatar(null);
      setPreview(null);
      fetchUser();
    } catch (err) {
      alert(err.message);
    }
  };

  const avatarSrc =
    user?.profile_image && !user.profile_image.includes("javascript:")
      ? `${BASE_URL}/${user.profile_image}`
      : getDefaultAvatar();

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* ── Page Header ── */}
        <div className="flex items-center gap-3 mb-7">
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        </div>

        {/* ── Profile Image ── */}
        <SectionCard icon={<CameraIcon />} title="Profile image">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={avatarSrc}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-yellow-400"
              />
              <label
                htmlFor="avatarInput"
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-yellow-300 transition-colors"
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="black">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
              </label>
              <input
                id="avatarInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Info + actions */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-500 mb-3 leading-relaxed">
                JPG, PNG, or GIF. Max 2MB. Recommended 200×200px.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <label
                  htmlFor="avatarInput"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2a2a2a] text-xs text-neutral-300 cursor-pointer hover:border-yellow-400 hover:text-yellow-400 transition-colors"
                >
                  <UploadIcon /> Choose photo
                </label>
                {avatar && (
                  <button
                    onClick={handleUploadAvatar}
                    className="px-3 py-1.5 rounded-lg bg-yellow-400 text-black text-xs font-medium hover:bg-yellow-300 transition-colors"
                  >
                    Upload
                  </button>
                )}
                {preview && (
                  <span className="text-xs text-yellow-400/70 truncate max-w-[140px]">
                    {avatar?.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Profile Info + Password ── */}
        <SectionCard icon={<UserIcon />} title="Profile info">
          <form onSubmit={handleSubmit}>
            {/* Name + Email */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <InputField
                label="Username"
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="your_username"
              />
              <InputField
                label="Email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </div>

            {/* Role */}
            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">
                Role
              </label>
              <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                  <span className="text-sm capitalize text-white">
                    {user?.role || "member"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/subscription")}
                  className="flex items-center gap-1.5 px-3 py-1 bg-yellow-400 text-black rounded-md text-xs font-semibold hover:bg-yellow-300 transition-colors"
                >
                  <StarIcon />
                  Upgrade
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-[#1e1e1e]" />
              <span className="text-[11px] uppercase tracking-widest text-neutral-600">
                Change password
              </span>
              <div className="flex-1 h-px bg-[#1e1e1e]" />
            </div>

            {/* Password fields */}
            <div className="flex flex-col gap-3 mb-5">
              <InputField
                label="Current password"
                type="password"
                name="current_password"
                value={form.current_password}
                onChange={handleChange}
                placeholder="Enter current password"
              />
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="New password"
                  type="password"
                  name="new_password"
                  value={form.new_password}
                  onChange={handleChange}
                  placeholder="New password"
                />
                <InputField
                  label="Confirm password"
                  type="password"
                  name="confirm_password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm password"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-yellow-400 text-black text-sm font-semibold
                  hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed
                  transition-colors duration-150"
              >
                {loading ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    current_password: "",
                    new_password: "",
                    confirm_password: "",
                  }))
                }
                className="px-5 py-2.5 rounded-lg border border-[#2a2a2a] text-neutral-400 text-sm
                  hover:text-white hover:border-neutral-600 transition-colors duration-150"
              >
                Cancel
              </button>

              {/* Success toast */}
              {saveSuccess && (
                <span className="ml-1 flex items-center gap-1.5 text-xs text-yellow-400">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Saved!
                </span>
              )}
            </div>
          </form>
        </SectionCard>

        {/* ── Messaging ── */}
        <SectionCard icon={<ChatBubbleIcon />} title="Messaging">
          {(() => {
            const status = user?.collaboration_status || "open";
            const isOpen = status === "open";
            return (
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white mb-1">
                      Open for collaboration
                    </p>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      When closed, new users won&apos;t be able to start a
                      conversation with you. Existing conversations are not
                      affected.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleCollaboration}
                    disabled={collabSaving || !user}
                    aria-pressed={isOpen}
                    aria-label={
                      isOpen
                        ? "Currently open. Click to close DMs."
                        : "Currently closed. Click to open DMs."
                    }
                    className={`relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      isOpen ? "bg-yellow-400" : "bg-white/15"
                    } ${collabSaving || !user ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        isOpen ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <span
                    className={`text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-md border ${
                      isOpen
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300/80"
                        : "border-red-400/30 bg-red-400/10 text-red-300/80"
                    }`}
                  >
                    {isOpen ? "Open to collab" : "DMs closed"}
                  </span>
                  {collabSaving && (
                    <span className="text-[11px] text-neutral-500">
                      Saving…
                    </span>
                  )}
                  {collabError && (
                    <span className="text-[11px] text-red-300/80">
                      {collabError}
                    </span>
                  )}
                </div>
              </div>
            );
          })()}
        </SectionCard>
      </div>
    </div>
  );
}
