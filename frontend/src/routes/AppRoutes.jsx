import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import ArtDetail from "../pages/ArtDetail";
import ProtectedRoute from "./ProtectedRoutes";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/art/:id"
        element={
          <ProtectedRoute>
            <ArtDetail />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;