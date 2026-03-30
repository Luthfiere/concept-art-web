import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import ArtDetail from "../pages/ArtDetail";
import Register from "../pages/Register";
import ProtectedRoute from "./ProtectedRoutes";
import JobPage from "../pages/Jobpage";
import PostJobPage from "../pages/PostJobPage";
import PostArt from "../pages/PostArt";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/Register" element={<Register />} />


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

      <Route
        path="/post-art"
        element={
          <ProtectedRoute>
            <PostArt />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
};

export default AppRoutes;