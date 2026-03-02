import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Contexts
import { useAuth, AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { PostsProvider } from "./context/PostsContext";
import { NotificationProvider } from "./context/NotificationContext";

// Components
import Navbar from "./components/Navbar";
import QAChat from "./components/QAChat";

// Auth Pages
import Register from "./pages/Auth/Register";
import RegisterPolice from "./pages/Auth/RegisterPolice";
import Login from "./pages/Auth/Login";

// Public Pages
import PublicHome from "./pages/PublicDashboard/PublicHome";
import AllPostings from "./pages/PublicDashboard/AllPostings";

// Dashboards (Lost)
import LostDashboardLayout from "./layouts/LostDashboardLayout";
import LostDashboardHome from "./pages/LostDashboard/LostDashboardHome";
import LostMyProfile from "./pages/LostDashboard/MyProfile";
import LostMyPostings from "./pages/LostDashboard/MyPostings";
import LostCreatePost from "./pages/LostDashboard/CreatePost";
import LostMessages from "./pages/LostDashboard/Messages";

// Dashboards (Found)
import FoundDashboardLayout from "./layouts/FoundDashboardLayout";
import FoundHome from "./pages/FoundDashboard/FoundHome";
import FoundMyProfile from "./pages/FoundDashboard/MyProfile";
import MyFoundItems from "./pages/FoundDashboard/MyFoundItems";
import PostFoundItem from "./pages/FoundDashboard/PostFoundItem";
import FoundMatches from "./pages/FoundDashboard/FoundMatches";
import FoundMessages from "./pages/FoundDashboard/Messages";

// Admin Dashboard
import AdminDashboardLayout from "./layouts/AdminDashboardLayout";
import AdminHome from "./pages/AdminDashboard/AdminHome";
import SystemStats from "./pages/AdminDashboard/SystemStats";
import ManageItems from "./pages/AdminDashboard/ManageItems";
import ManageUsers from "./pages/AdminDashboard/ManageUsers";
import ManagePoliceRegistrations from "./pages/AdminDashboard/ManagePoliceRegistrations";
import Logs from "./pages/AdminDashboard/Logs";

// Police Dashboard
import PoliceDashboardLayout from "./layouts/PoliceDashboardLayout";
import PoliceHome from "./pages/PoliceDashboard/PoliceHome";
import PostOfficialDocument from "./pages/PoliceDashboard/PostOfficialDocument";
import ManageClaims from "./pages/PoliceDashboard/ManageClaims";
import ReturnedDocuments from "./pages/PoliceDashboard/ReturnedDocuments";

function AppRoutes() {
  const { user, isAuthenticated, loading, logout } = useAuth();

  const roleMap = {
    'loser': 'lost_user',
    'finder': 'found_user',
    'police': 'police',
    'admin': 'admin'
  };

  const userRole = user ? roleMap[user.role] : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        onLogout={logout}
      />

      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicHome />} />
          <Route path="/postings" element={<AllPostings />} />
          
          {/* Auth Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/register-police" element={<RegisterPolice />} />
          <Route path="/login" element={<Login />} />

          {/* Lost Dashboard */}
          <Route 
            path="/lost-dashboard/*" 
            element={
              isAuthenticated && user?.role === 'loser' 
                ? <LostDashboardLayout /> 
                : <Navigate to="/" replace />
            }
          >
            <Route index element={<LostDashboardHome />} />
            <Route path="profile" element={<LostMyProfile />} />
            <Route path="my-postings" element={<LostMyPostings />} />
            <Route path="create-post" element={<LostCreatePost />} />
            <Route path="messages" element={<LostMessages />} />
          </Route>

          {/* Found Dashboard */}
          <Route 
            path="/found-dashboard/*" 
            element={
              isAuthenticated && user?.role === 'finder' 
                ? <FoundDashboardLayout /> 
                : <Navigate to="/" replace />
            }
          >
            <Route index element={<FoundHome />} />
            <Route path="profile" element={<FoundMyProfile />} />
            <Route path="my-found-items" element={<MyFoundItems />} />
            <Route path="post-found-item" element={<PostFoundItem />} />
            <Route path="matches" element={<FoundMatches />} />
            <Route path="messages" element={<FoundMessages />} />
          </Route>

          {/* Admin Dashboard */}
          <Route 
            path="/admin-dashboard/*" 
            element={
              isAuthenticated && user?.role === 'admin' 
                ? <AdminDashboardLayout /> 
                : <Navigate to="/" replace />
            }
          >
            <Route index element={<AdminHome />} />
            <Route path="system-stats" element={<SystemStats />} />
            <Route path="manage-items" element={<ManageItems />} />
            <Route path="manage-users" element={<ManageUsers />} />
            <Route path="manage-police-registrations" element={<ManagePoliceRegistrations />} />
            <Route path="logs" element={<Logs />} />
          </Route>

          {/* Police Dashboard */}
          <Route 
            path="/police-dashboard/*" 
            element={
              isAuthenticated && user?.role === 'police' 
                ? <PoliceDashboardLayout /> 
                : <Navigate to="/" replace />
            }
          >
            <Route index element={<PoliceHome />} />
            <Route path="upload-document" element={<PostOfficialDocument />} />
            <Route path="manage-claims" element={<ManageClaims />} />
            <Route path="returned-documents" element={<ReturnedDocuments />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <QAChat />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <NotificationProvider>
          <PostsProvider>
            <Router>
              <AppRoutes />
            </Router>
          </PostsProvider>
        </NotificationProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}