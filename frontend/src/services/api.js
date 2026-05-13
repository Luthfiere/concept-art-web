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

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isModerator() {
  return getCurrentUser()?.role === "moderator";
}

export async function refreshToken() {
  try {
    const res = await api.post("/refresh");
    if (res.data?.token) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }
    return res.data;
  } catch {
    return null;
  }
}

export function clearAuthAndRedirect() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}

// Use relative URL - works with any domain (localhost, ngrok, custom domain)
const api = axios.create({
  baseURL: "/api",  // Changed from "http://localhost:5000/api"
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

    // 🚨 skip redirect kalau lagi login/register, atau 403 dari endpoint
    const isAuthSkip = url.includes("/login") || url.includes("/register");
    const isForbiddenByRule = status === 403 && url.includes("/conversations");

    if ((status === 401 || status === 403) && !isAuthSkip && !isForbiddenByRule) {
      clearAuthAndRedirect();
    }

    return Promise.reject(err);
  },
);

export default api;