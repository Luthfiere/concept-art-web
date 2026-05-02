import { useEffect, useState } from "react";
import { useChat } from "../../../context/ChatContext";
import { isTokenExpired } from "../../../services/api";
import { STATUS_CONFIG } from "../constants";

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

  const { openChatWithUser } = useChat();
  const isLoggedIn = !isTokenExpired();
  const [job, setJob] = useState(null);
  const token = localStorage.getItem("token");

  const statusStyle = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;

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
        console.error(err);
      }
    };

    fetchJob();
  }, [token, app?.job_id]);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0f1323] p-5 rounded-2xl"
      >
        <h2 className="text-lg font-bold mb-4">Application Detail</h2>

        <div className={`mb-4 px-3 py-1 rounded ${statusStyle}`}>
          {app.status}
        </div>

        {isLoggedIn &&
          job?.user_id !== currentUserId &&
          ["pending", "shortlist", "hired"].includes(app.status) && (
            <button
              onClick={() => {
                openChatWithUser(job.user_id);
                onClose();
              }}
              className="w-full py-2 bg-white/10 rounded-lg flex items-center justify-center gap-2"
            >
              <ChatBubbleIcon />
              Message
            </button>
          )}

        <button
          onClick={onClose}
          className="w-full mt-4 bg-white/10 py-2 rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ApplicationDetailModal;