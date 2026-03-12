import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import ArtDetail from "../pages/ArtDetail";
import Register from "../pages/Register";
import ProtectedRoute from "./ProtectedRoutes";
import JobPage from "../pages/Jobpage";
import PostJobPage from "../pages/PostJobPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/Register" element={<Register />} />
      

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

      <Route
        path="/Job"
        element={
          <ProtectedRoute>
            <JobPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/JobPost"
        element={
          <ProtectedRoute>
            <PostJobPage />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
};

export default AppRoutes;