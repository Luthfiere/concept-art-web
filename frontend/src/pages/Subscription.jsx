import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import api from "../services/api";

const PLAN_DISPLAY = {
  pro_monthly: {
    label: "Pro — Monthly",
    tier: "Pro",
    desc: "Up to 3 active postings",
    recurring: true,
  },
  corporate_monthly: {
    label: "Corporate — Monthly",
    tier: "Corporate",
    desc: "Up to 15 active postings",
    recurring: true,
  },
  pro_per_post: {
    label: "Pro — Single post",
    tier: "Pro",
    desc: "Pay per individual posting",
    recurring: false,
  },
  corporate_per_post: {
    label: "Corporate — Single post",
    tier: "Corporate",
    desc: "Pay per individual posting",
    recurring: false,
  },
};

const Subscription = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({
    expiry: false,
  });

  // Fake payment modal state
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    cardholder: "",
    card_number: "",
    expiry: "",
    cvv: "",
  });

  useEffect(() => {
    Promise.all([api.get("/subscriptions/plans"), api.get("/subscriptions/")])
      .then(([plansRes, meRes]) => {
        setPlans(plansRes.data.data);
        setCurrentSub(meRes.data.data);
      })
      .catch(() => setError("Failed to load subscription plans"))
      .finally(() => setLoading(false));
  }, []);

  const openPaymentModal = (plan) => {
    setSelectedPlan(plan);
    setForm({ cardholder: "", card_number: "", expiry: "", cvv: "" });
    setError("");
  };

  const closeModal = () => {
    if (submitting) return;
    setSelectedPlan(null);
  };

  const handleFormChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const confirmUpgrade = async () => {
    setError("");

    if (!isValidExpiry(form.expiry)) {
      setError("Expiry date is invalid or already passed");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/subscriptions/checkout", { plan: selectedPlan.plan });
      navigate("/subscription/callback");
    } catch (err) {
      setError(err.response?.data?.message || "Upgrade failed");
      setSubmitting(false);
    }
  };

  const fmtIDR = (n) => "Rp " + Number(n).toLocaleString("id-ID");

  const formatCardNumber = (raw) =>
    raw
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();

  const formatExpiry = (raw) => {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    if (digits.length < 3) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const isValidExpiry = (expiry) => {
    if (!expiry || expiry.length !== 5) return false;

    const [mm, yy] = expiry.split("/");
    const month = parseInt(mm, 10);
    const year = parseInt(yy, 10);

    if (month < 1 || month > 12) return false;

    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 0-based
    const currentYear = now.getFullYear() % 100; // ambil 2 digit

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;

    return true;
  };

  const isFormValid =
    form.cardholder &&
    form.card_number.length >= 19 &&
    isValidExpiry(form.expiry) &&
    form.cvv.length >= 3;

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#050816] to-[#0b0f2a] text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-bold text-white">
            Upgrade to post jobs
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2">
            Only Pro and Corporate accounts can publish job postings. Pick a
            plan to continue.
          </p>
        </div>

        {currentSub?.is_active && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 mb-6">
            <p className="text-sm text-emerald-300">
              You already have an active{" "}
              <span className="font-semibold">{currentSub.plan}</span>{" "}
              subscription.
              {currentSub.active_until && (
                <>
                  {" "}
                  Valid until{" "}
                  {new Date(currentSub.active_until).toLocaleDateString()}.
                </>
              )}
            </p>
          </div>
        )}

        {error && !selectedPlan && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 mb-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-400 text-sm">Loading plans&hellip;</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plans.map((p) => {
              const meta = PLAN_DISPLAY[p.plan] || {
                label: p.plan,
                tier: p.role,
                desc: "",
              };
              return (
                <div
                  key={p.plan}
                  className="bg-[#111427]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col"
                >
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400/80">
                      {meta.tier}
                    </p>
                    <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                      {meta.label}
                    </h2>
                    <p className="text-sm text-gray-400 mt-2">{meta.desc}</p>
                    <p className="text-2xl font-bold text-white mt-4">
                      {fmtIDR(p.amount)}
                      <span className="text-xs text-gray-400 font-normal ml-1">
                        {meta.recurring ? "/ month" : "/ post"}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => openPaymentModal(p)}
                    className="mt-5 w-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-4 py-2.5 rounded-lg shadow-md transition"
                  >
                    Subscribe
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md bg-[#111427] border border-white/10 rounded-2xl p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white mb-1">
              Payment details
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              {PLAN_DISPLAY[selectedPlan.plan]?.label} &middot;{" "}
              {fmtIDR(selectedPlan.amount)}
            </p>

            <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 px-3 py-2 mb-4">
              <p className="text-[11px] text-amber-300">
                Demo mode &mdash; no actual payment is processed. Fields are
                cosmetic.
              </p>
            </div>

            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Cardholder name
            </label>
            <input
              name="cardholder"
              value={form.cardholder}
              onChange={handleFormChange}
              placeholder="Full name on card"
              className="w-full bg-[#0f1323] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/40 transition mb-4"
            />

            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Card number
            </label>
            <input
              name="card_number"
              value={form.card_number}
              onChange={(e) =>
                setForm({
                  ...form,
                  card_number: formatCardNumber(e.target.value),
                })
              }
              placeholder="0000 0000 0000 0000"
              inputMode="numeric"
              className="w-full bg-[#0f1323] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/40 transition mb-4"
            />

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Expiry (MM/YY)
                </label>

                <div className="relative">
                  <input
                    name="expiry"
                    value={form.expiry}
                    onChange={(e) => {
                      const formatted = formatExpiry(e.target.value);
                      setForm({ ...form, expiry: formatted });
                    }}
                    onBlur={() => setTouched({ ...touched, expiry: true })}
                    placeholder="MM/YY"
                    inputMode="numeric"
                    className={`w-full bg-[#0f1323] border rounded-lg px-4 py-2.5 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition
                                ${
                                  touched.expiry && form.expiry && !isValidExpiry(form.expiry)
                                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/40"
                                    : "border-white/10 focus:border-yellow-400 focus:ring-yellow-400/40"
                                }
                              `}
                  />

                  {/* ⚠️ Warning Icon */}
                  {touched.expiry &&
                    form.expiry &&
                    !isValidExpiry(form.expiry) && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-sm">
                        ⚠
                      </span>
                    )}
                </div>

                {/* ❌ Error Message */}
                {touched.expiry &&
                  form.expiry &&
                  !isValidExpiry(form.expiry) && (
                    <p className="text-xs text-red-400 mt-1">
                      Expiry date is invalid or already expired
                    </p>
                  )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  CVV
                </label>
                <input
                  name="cvv"
                  value={form.cvv}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                    })
                  }
                  placeholder="123"
                  inputMode="numeric"
                  className="w-full bg-[#0f1323] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/40 transition"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 mb-4 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={submitting}
                onClick={closeModal}
                className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting || !isFormValid}
                onClick={confirmUpgrade}
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-yellow-400 hover:bg-yellow-300 text-black transition disabled:opacity-50"
              >
                {submitting ? "Upgrading\u2026" : "Upgrade"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscription;
