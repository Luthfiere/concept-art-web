import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import noise from "../assets/images/noise.png";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async () => {
    try {
      await axios.post("http://localhost:3000/api/register", form);
      alert("Register success!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Register failed");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center text-white relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #050816, #0b0f2a)",
      }}
    >
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
      <div className="relative bg-[#111427] p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>

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

          <button
            onClick={handleRegister}
            className="w-full bg-yellow-500 text-black py-3 rounded-xl font-semibold hover:scale-105 transition"
          >
            Register
          </button>
        </div>

        <p className="text-sm text-gray-400 text-center mt-6">
          Already have an account?{" "}
          <Link to="/" className="text-yellow-500 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
