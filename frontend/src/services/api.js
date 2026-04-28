import axios from "axios";

export function isTokenExpired() {
  const token = localStorage.getItem("token");
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function clearAuthAndRedirect() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Auto attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Redirect to login on 401/403
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const url = err.config?.url;

    // 🚨 skip redirect kalau lagi login/register
    if (
      (status === 401 || status === 403) &&
      !url.includes("/login") &&
      !url.includes("/register")
    ) {
      clearAuthAndRedirect();
    }

    return Promise.reject(err);
  },
);

export default api;
