import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ImageIcon = () => (
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
      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159M15.75 15.75l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
    />
  </svg>
);

const LightbulbIcon = () => (
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
      d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
    />
  </svg>
);

const ChatIcon = () => (
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
      d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
    />
  </svg>
);

const FloatingCreateButton = ({ onCreatePost }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const fabRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (fabRef.current && !fabRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const actions = [
    {
      label: "Post Art", key: "art", action: () => {

        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login?redirect=/post-art");
        } else {
          navigate("/post-art");
        }
      },
      icon: <ImageIcon />
    },
    { label: "Share Idea", key: "idea", action: () => onCreatePost?.("post"), icon: <LightbulbIcon /> },
    { label: "Community Post", key: "community", action: () => onCreatePost?.("community"), icon: <ChatIcon /> },
  ];

  return (
    <div
      ref={fabRef}
      className="hidden sm:flex fixed sm:bottom-8 sm:right-8 z-50 flex-col-reverse items-end gap-3"
    >
      {/* Main FAB */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-14 h-14 rounded-full bg-yellow-500 text-black shadow-lg shadow-yellow-500/25 flex items-center justify-center hover:scale-110 hover:shadow-yellow-500/40 transition-all duration-200 ${open ? "rotate-45" : ""
          }`}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
      </button>

      {/* Speed-dial options */}
      {open &&
        actions.map((action, i) => (
          <button
            key={action.key}
            onClick={() => {
              action.action();
              setOpen(false);
            }}
            className="flex items-center gap-2 animate-fade-in-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <span className="bg-[#1a1d2e] border border-white/10 text-gray-300 text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
              {action.label}
            </span>
            <div className="w-10 h-10 rounded-full bg-[#1a1d2e] border border-white/10 text-yellow-500 flex items-center justify-center shadow-lg">
              {action.icon}
            </div>
          </button>
        ))}
    </div>
  );
};

export default FloatingCreateButton;
