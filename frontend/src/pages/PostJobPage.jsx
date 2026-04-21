import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import PostJobForm from "../components/job/PostJobForm";
import api from "../services/api";

const PostJobPage = () => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const hasPayingRole = user?.role === "pro" || user?.role === "corporate";

  const [sub, setSub] = useState(null);
  const [loadingSub, setLoadingSub] = useState(hasPayingRole);

  useEffect(() => {
    if (!hasPayingRole) return;
    api
      .get("/subscriptions/")
      .then((res) => setSub(res.data.data))
      .catch(() => setSub(null))
      .finally(() => setLoadingSub(false));
  }, [hasPayingRole]);

  const hasActiveSub = sub?.is_active;
  const canPost = hasPayingRole && hasActiveSub;

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

        {loadingSub ? (
          <p className="text-sm text-gray-400">Checking subscription&hellip;</p>
        ) : canPost ? (
          <PostJobForm />
        ) : !user ? (
          <GateCard
            title="Sign in required"
            body="You need to sign in before posting a job."
            ctaLabel="Sign in"
            to="/login?redirect=/JobPost"
          />
        ) : !hasPayingRole ? (
          <GateCard
            title="Upgrade required"
            body={
              <>
                Posting a job is available only to{" "}
                <span className="font-semibold text-white">Pro</span> and{" "}
                <span className="font-semibold text-white">Corporate</span> accounts.
                Your current tier is &quot;{user.role}&quot;.
              </>
            }
            ctaLabel="Upgrade account"
            to="/subscription"
          />
        ) : (
          <GateCard
            title="Renew subscription"
            body={
              <>
                Your <span className="font-semibold text-white">{user.role}</span> account does not
                have an active subscription. Renew to continue posting jobs.
              </>
            }
            ctaLabel="Renew now"
            to="/subscription"
          />
        )}
      </div>
    </div>
  );
};

const GateCard = ({ title, body, ctaLabel, to }) => (
  <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/5 p-5 sm:p-8 text-center">
    <h2 className="text-lg sm:text-xl font-semibold text-yellow-300 mb-3">{title}</h2>
    <p className="text-sm text-gray-300 mb-6 leading-relaxed">{body}</p>
    <Link
      to={to}
      className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-yellow-400/30 transition"
    >
      {ctaLabel}
    </Link>
  </div>
);

export default PostJobPage;
