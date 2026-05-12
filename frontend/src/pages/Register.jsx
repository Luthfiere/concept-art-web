import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../features/Auth/authService";
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

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [captchaToken, setCaptchaToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async () => {
    if (form.password !== form.confirm_password) {
      alert("Passwords do not match.");
      return;
    }
    if (!captchaToken) {
      alert("Please complete the captcha.");
      return;
    }
    try {
      const { confirm_password, ...payload } = form;
      const response = await registerUser({ ...payload, captcha_token: captchaToken });
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Register failed");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 text-white relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #050816, #0b0f2a)",
      }}
    >
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

      {/* CONTENT */}
      <div className="relative bg-[#111427] p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center">Create Account</h1>

        <div className="space-y-4">
          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-[#1b1f3a] outline-none focus:ring-2 focus:ring-yellow-500"
          />

          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-[#1b1f3a] outline-none focus:ring-2 focus:ring-yellow-500"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleChange}
              className="w-full p-3 pr-11 rounded-xl bg-[#1b1f3a] outline-none focus:ring-2 focus:ring-yellow-500"
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

          <div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                placeholder="Confirm password"
                onChange={handleChange}
                className="w-full p-3 pr-11 rounded-xl bg-[#1b1f3a] outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition"
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {form.confirm_password && form.password !== form.confirm_password && (
              <p className="text-xs text-red-400 mt-1.5 ml-1">Passwords do not match.</p>
            )}
          </div>

          <div className="flex justify-center">
            <Captcha onChange={setCaptchaToken} />
          </div>

          <button
            onClick={handleRegister}
            disabled={!captchaToken}
            className="w-full bg-yellow-500 disabled:bg-yellow-500/40 disabled:cursor-not-allowed text-black py-3 rounded-xl font-semibold hover:scale-105 disabled:hover:scale-100 transition"
          >
            Register
          </button>
        </div>

        <p className="text-sm text-gray-400 text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-yellow-500 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
