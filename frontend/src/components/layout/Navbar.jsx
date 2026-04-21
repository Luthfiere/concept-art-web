import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from "../../assets/images/Logo-White.png";
import { useChat } from "../../context/ChatContext";
const BASE_URL = "http://localhost:5000";

const Navbar = () => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const navigate = useNavigate();
  const { toggleChat, unreadCount } = useChat();

  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const createActions = [
    { label: "Post Art", path: "/post-art" },
    { label: "Share Idea", path: "/post-form?type=post" },
    { label: "Community Post", path: "/post-form?type=community" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const avatar = user?.profile_image
    ? `${BASE_URL}/${user.profile_image}`
    : `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username}`;

  const navLinks = [
    { name: "Art / Ideation Gallery", path: "/" },
    { name: "Job Hiring", path: "/Job" },
    { name: "Job Posting", path: "/JobPost" },
    { name: "Dev Logs", path: "/DevLogs" },
  ];

  return (
    <div
      className="sticky top-0 z-50 flex justify-between items-center px-4 sm:px-6 lg:px-10 py-3 sm:py-4
bg-[#0b0f1a]/80 backdrop-blur-md border-b border-white/10"
    >
      {/* Left: hamburger (mobile) + Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-1.5 -ml-1 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>

        <Link to="/" className="flex items-center gap-2 group">
          <img
            src={Logo}
            alt="Logo"
            className="h-8 sm:h-10 object-contain
      group-hover:drop-shadow-[0_0_8px_rgba(255,221,0,0.6)] transition"
          />
        </Link>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-6 lg:gap-8 text-gray-300 text-sm font-medium">
        {navLinks.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className="relative group hover:text-white transition"
          >
            {item.name}
            <span
              className="absolute left-0 -bottom-1 w-0 h-[2px]
        bg-yellow-400 transition-all duration-300 group-hover:w-full"
            ></span>
          </Link>
        ))}
      </div>

      {/* Right Section */}
      {user ? (
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Create (+) icon with dropdown */}
          <div className="relative">
            <button
              onClick={() => setCreateOpen(!createOpen)}
              className="w-9 h-9 rounded-full border border-white/20 hover:border-yellow-400 text-gray-300 hover:text-white flex items-center justify-center transition focus:outline-none focus:ring-2 focus:ring-yellow-400"
              aria-label="Create new post"
            >
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${createOpen ? "rotate-45" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </button>

            {createOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setCreateOpen(false)}
                />
                <div className="absolute right-0 mt-3 w-44 bg-[#111827] border border-white/10 rounded-xl shadow-xl backdrop-blur-lg z-50 overflow-hidden">
                  {createActions.map((action) => (
                    <button
                      key={action.path}
                      onClick={() => {
                        setCreateOpen(false);
                        navigate(action.path);
                      }}
                      className="block w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Chat icon */}
          <button
            onClick={toggleChat}
            className="relative w-9 h-9 rounded-full border border-white/20 hover:border-yellow-400 text-gray-300 hover:text-white flex items-center justify-center transition focus:outline-none focus:ring-2 focus:ring-yellow-400"
            aria-label="Open chat"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
              />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 ring-2 ring-[#0b0f1a]">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="rounded-full focus:ring-2 focus:ring-yellow-400"
            >
              <img
                className="w-9 h-9 rounded-full border border-white/20 hover:border-yellow-400 transition"
                src={avatar}
                alt="avatar"
              />
            </button>

            {open && (
              <div
                className="absolute right-0 mt-3 w-48
        bg-[#111827] border border-white/10 rounded-xl shadow-xl backdrop-blur-lg"
              >
                <div className="px-4 py-3 text-sm border-b border-white/10">
                  <p className="text-white font-medium">{user.username}</p>
                  <p className="text-gray-400 truncate text-xs">{user.email}</p>
                </div>

                <ul className="py-2 text-sm text-gray-300">
                  <li>
                    <Link
                      to="/mycollection"
                      className="block px-4 py-2 hover:bg-white/5"
                    >
                      My Collection
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 hover:bg-white/5"
                    >
                      Settings
                    </Link>
                  </li>

                  <li>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-white/5"
                    >
                      Sign out
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex gap-2 sm:gap-3 items-center">
          <Link
            to="/register"
            className="text-gray-300 hover:text-white px-2 sm:px-4 py-2 text-xs sm:text-sm"
          >
            Sign Up
          </Link>

          <Link
            to="/login"
            className="bg-yellow-400 hover:bg-yellow-300 text-black
        px-3 sm:px-5 py-2 rounded-lg font-semibold shadow-md text-xs sm:text-sm
        hover:shadow-yellow-400/30 transition"
          >
            Sign In
          </Link>
        </div>
      )}

      {/* Mobile slide-down menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#0a0d1f]/95 backdrop-blur-md border-b border-white/10 shadow-lg">
          <div className="flex flex-col py-2">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 border-b border-white/5 last:border-b-0 transition"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
