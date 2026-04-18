import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import PostJobForm from "../components/job/PostJobForm";

const PostJobPage = () => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const canPost = user?.role === "pro" || user?.role === "corporate";

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#050816] to-[#0b0f2a] text-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-bold text-white">Post a Job</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2">
            Share an opportunity with the concept-art and game-dev community.
          </p>
        </div>

        {canPost ? (
          <PostJobForm />
        ) : (
          <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/5 p-5 sm:p-8 text-center">
            <h2 className="text-lg sm:text-xl font-semibold text-yellow-300 mb-3">
              Upgrade required
            </h2>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              Posting a job is available only to{" "}
              <span className="font-semibold text-white">Pro</span> and{" "}
              <span className="font-semibold text-white">Corporate</span>{" "}
              accounts.
              {user
                ? ` Your current tier is "${user.role}".`
                : " You need to sign in first."}
            </p>
            <Link
              to={user ? "/settings" : "/login"}
              className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-yellow-400/30 transition"
            >
              {user ? "Upgrade account" : "Sign in"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostJobPage;
