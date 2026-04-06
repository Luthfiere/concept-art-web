import { Link, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from "../assets/images/Logo-White.png";

const Navbar = () => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const avatar =
    user?.profile_picture ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username}`;

  return (
    <div className="relative z-50 flex justify-between items-center px-10 py-5 border-b border-gray-800">
      <Link
        to="/"
        className=" px-3 py-1 rounded-md backdrop-blur-sm"
      >
        <img src={Logo} alt="Logo" className="h-12 object-contain" />
      </Link>

      <div className="flex gap-6 text-gray-300">
        <Link to="/">Concept Art</Link>
        <span>Community</span>
        <Link to="/Job">Job Hiring</Link>
        <Link to="/JobPost">Job Posting</Link>
        <span>Dev Logs</span>
      </div>

      {user ? (
        <div className="relative">
          {/* Avatar Button */}
          <button
            onClick={() => setOpen(!open)}
            className="flex text-sm rounded-full focus:ring-2 focus:ring-gray-500"
          >
            <img className="w-8 h-8 rounded-full" src={avatar} alt="avatar" />
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-3 w-44 bg-gray-900 border border-gray-700 rounded shadow-lg">
              <div className="px-4 py-3 text-sm border-b border-gray-700">
                <span className="block text-white font-medium">
                  {user.username}
                </span>
                <span className="block text-gray-400 truncate">
                  {user.email}
                </span>
              </div>

              <ul className="py-2 text-sm text-gray-300">
                <li>
                  <Link
                    to="/mycollection"
                    className="block px-4 py-2 hover:bg-gray-800"
                  >
                    My Collection
                  </Link>
                </li>

                <li>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 hover:bg-gray-800"
                  >
                    Settings
                  </Link>
                </li>

                <li>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-800"
                  >
                    Sign out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-4">
          <Link
            to="/register"
            className="text-gray-300 hover:text-white px-4 py-2"
          >
            Sign Up
          </Link>

          <Link
            to="/login"
            className="bg-yellow-500 px-4 py-2 rounded text-black"
          >
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;
