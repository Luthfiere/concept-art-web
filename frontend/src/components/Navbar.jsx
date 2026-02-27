import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="flex justify-between items-center px-10 py-5 border-b border-gray-800">
      <h1 className="text-yellow-500 font-bold text-xl">LOGO</h1>

      <div className="flex gap-6 text-gray-300">
        <Link to="/home">Concept Art</Link>
        <span>Community</span>
        <span>Job Hiring</span>
        <span>Dev Logs</span>
      </div>

      <div className="flex gap-4">
        <Link to="/register" className="text-gray-300 hover:text-white px-4 py-2">
          Sign Up
        </Link>
        <Link to="/" className="bg-yellow-500 px-4 py-2 rounded text-black">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default Navbar;