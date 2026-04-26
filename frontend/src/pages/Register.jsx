import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../features/auth/authService";
import noise from "../assets/images/noise.png";
import Captcha from "../components/Captcha";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [captchaToken, setCaptchaToken] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async () => {
    if (!captchaToken) {
      alert("Please complete the captcha.");
      return;
    }
    try {
      const response = await registerUser({ ...form, captcha_token: captchaToken });
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

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-[#1b1f3a] outline-none focus:ring-2 focus:ring-yellow-500"
          />

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
