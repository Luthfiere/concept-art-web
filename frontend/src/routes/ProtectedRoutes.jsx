import { Navigate } from "react-router-dom";
import { isTokenExpired } from "../services/api";

const ProtectedRoute = ({ children }) => {
  if (isTokenExpired()) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
