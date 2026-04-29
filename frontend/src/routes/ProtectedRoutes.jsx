import { Navigate } from "react-router-dom";
import { isTokenExpired } from "../services/api";

const ProtectedRoute = ({ children, requiredRole }) => {
  if (isTokenExpired()) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" />;
  }

  if (requiredRole) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== requiredRole) return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
