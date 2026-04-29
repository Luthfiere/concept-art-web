import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import ArtDetail from "../pages/ArtDetail";
import Register from "../pages/Register";
import ProtectedRoute from "./ProtectedRoutes";
import JobPage from "../pages/Jobpage";
import PostJobPage from "../pages/PostJobPage";
import PostArt from "../pages/PostArt";
import PostForm from "../pages/PostForm";
import PostDetail from "../pages/PostDetail";
import MyCollection from "../pages/MyCollection";
import JobApplicantsPage from "../pages/JobApplicantsPage";
import Devlogs from "../pages/DevLogs";
import DevlogDetail from "../components/DevLogs/DevLogDetail";
import Subscription from "../pages/Subscription";
import SubscriptionCallback from "../pages/SubscriptionCallback";
import SettingsPage from "../pages/SettingsPage";
import Moderation from "../pages/Moderation";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/art/:id" element={<ArtDetail />} />
      <Route path="/post/:id" element={<PostDetail />} />
      <Route path="/job/:id" element={<JobApplicantsPage />} />
      <Route path="/devlog/:id" element={<DevlogDetail />} />

      <Route path="/Job" element={<JobPage />} />

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

      <Route
        path="/post-form"
        element={
          <ProtectedRoute>
            <PostForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mycollection"
        element={
          <ProtectedRoute>
            <MyCollection />
          </ProtectedRoute>
        }
      />

      <Route path="/DevLogs" element={<Devlogs />} />

      <Route
        path="/subscription"
        element={
          <ProtectedRoute>
            <Subscription />
          </ProtectedRoute>
        }
      />

      <Route
        path="/subscription/callback"
        element={
          <ProtectedRoute>
            <SubscriptionCallback />
          </ProtectedRoute>
        }
      />

      <Route
        path="/Settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/moderation"
        element={
          <ProtectedRoute requiredRole="moderator">
            <Moderation />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
