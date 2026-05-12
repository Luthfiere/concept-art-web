import { useState, useEffect } from "react";
import { loginUser } from "../features/Auth/authService";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useRef } from "react";
import noise from "../assets/images/noise.png";
import Captcha from "../components/Captcha";

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L9.88 9.88" />
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const captchaRef = useRef(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  const [captchaToken, setCaptchaToken] = useState(null);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("SUBMIT TRIGGERED");

    setError("");

    if (!captchaToken) {
      setError("Please complete the captcha.");
      return;
    }

    try {
      console.log("Sending request...");
      const response = await loginUser({
        ...form,
        captcha_token: captchaToken,
      });
      console.log("Response:", response);

      if (!response?.token) {
        throw new Error("Invalid token");
      }

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      navigate(searchParams.get("redirect") || "/");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login gagal");

      setForm((prev) => ({
        ...prev,
        password: "",
      }));

      setCaptchaToken(null);

      // 🔥 reset captcha UI
      if (captchaRef.current) {
        captchaRef.current.reset();
      }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 bg-black overflow-hidden text-white">
      <Link
        to="/"
        className="absolute top-5 left-5 z-10 flex items-center gap-1.5 text-sm text-gray-400 hover:text-yellow-400 transition"
      >
        <span>&larr;</span> Back to home
      </Link>

      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>

      {/* Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,200,0,0.08),transparent_60%)]"></div>

      {/* Noise Overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url(${noise})`,
        }}
      ></div>

      {/* Login Card */}
      <div
        className="relative bg-gray-900/80 backdrop-blur-md p-6 sm:p-8 rounded-xl w-full max-w-sm
        shadow-[0_20px_60px_rgba(0,0,0,0.6)]
        border border-gray-700"
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-yellow-400 tracking-wide">
          Welcome Back
        </h2>

        {error && (
          <p className="text-red-500 mb-4 text-sm text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-sm text-gray-400">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 mt-1 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
              placeholder="Email@example.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="text-sm text-gray-400">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full p-3 pr-11 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div className="mb-4 flex justify-center">
            <Captcha ref={captchaRef} onChange={setCaptchaToken} />
          </div>

          <button
            type="submit"
            disabled={!captchaToken}
            className="w-full bg-yellow-500 disabled:bg-yellow-500/40 disabled:cursor-not-allowed text-black py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100"
          >
            Sign In
          </button>
        </form>
        <p className="text-sm text-gray-400 text-center mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-yellow-500 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
