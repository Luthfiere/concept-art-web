import Navbar from "../components/layout/Navbar";
import { clearAuthAndRedirect } from "../services/api";

const SubscriptionCallback = () => {
  const relogin = () => clearAuthAndRedirect();

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#050816] to-[#0b0f2a] text-white">
      <Navbar />

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-emerald-300 mb-3">
          Subscription active
        </h1>
        <p className="text-sm text-gray-300 mb-6">
          Your account has been upgraded. Sign in again so your session picks up the new role.
        </p>
        <button
          onClick={relogin}
          className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-2.5 rounded-lg font-semibold shadow-md transition"
        >
          Re-login now
        </button>
      </div>
    </div>
  );
};

export default SubscriptionCallback;
