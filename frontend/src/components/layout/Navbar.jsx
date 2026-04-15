import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from "../../assets/images/Logo-White.png";

const Navbar = () => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const avatar =
    user?.profile_picture ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username}`;

  return (
    <div
      className="sticky top-0 z-50 flex justify-between items-center px-10 py-4 
bg-[#0b0f1a]/80 backdrop-blur-md border-b border-white/10"
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <img
          src={Logo}
          alt="Logo"
          className="h-10 object-contain 
    group-hover:drop-shadow-[0_0_8px_rgba(255,221,0,0.6)] transition"
        />
      </Link>

      {/* Menu */}
      <div className="flex gap-8 text-gray-300 text-sm font-medium">
        {[
          { name: "Art / Ideation Gallery", path: "/" },
          { name: "Post", path: "/Post" },
          { name: "Job Hiring", path: "/Job" },
          { name: "Job Posting", path: "/JobPost" },
          { name: "Dev Logs", path: "/DevLogs" },
        ].map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className="relative group hover:text-white transition"
          >
            {item.name}

            {/* underline hover */}
            <span
              className="absolute left-0 -bottom-1 w-0 h-[2px] 
        bg-yellow-400 transition-all duration-300 group-hover:w-full"
            ></span>
          </Link>
        ))}
      </div>

      {/* Right Section */}
      {user ? (
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
      ) : (
        <div className="flex gap-3 items-center">
          <Link
            to="/register"
            className="text-gray-300 hover:text-white px-4 py-2 text-sm"
          >
            Sign Up
          </Link>

          <Link
            to="/login"
            className="bg-yellow-400 hover:bg-yellow-300 text-black 
        px-5 py-2 rounded-lg font-semibold shadow-md 
        hover:shadow-yellow-400/30 transition"
          >
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;
