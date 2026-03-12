import { useState } from "react";
import { loginUser } from "../features/auth/authService";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import noise from "../assets/images/noise.png";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await loginUser(form);

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      console.log("user: ", JSON.stringify(response.user));

      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden text-white">
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
        className="relative bg-gray-900/80 backdrop-blur-md p-8 rounded-xl w-96 
        shadow-[0_20px_60px_rgba(0,0,0,0.6)] 
        border border-gray-700"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400 tracking-wide">
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
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 mt-1 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-500 text-black py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-all duration-200 hover:scale-[1.02]"
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
