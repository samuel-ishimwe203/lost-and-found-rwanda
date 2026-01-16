import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

/* ================= COMPONENTS ================= */
import Navbar from "./components/Navbar";
import QAChat from "./components/QAChat";

/* ================= PUBLIC PAGES ================= */
import PublicHome from "./pages/PublicDashboard/PublicHome";
import AllPostings from "./pages/PublicDashboard/AllPostings";

/* ================= LOST DASHBOARD ================= */
import LostDashboardLayout from "./layouts/LostDashboardLayout";
import LostDashboardHome from "./pages/LostDashboard/LostDashboardHome";
import MyProfile from "./pages/LostDashboard/MyProfile";
import MyPostings from "./pages/LostDashboard/MyPostings";
import CreatePost from "./pages/LostDashboard/CreatePost";
import Messages from "./pages/LostDashboard/Messages";

function AppRoutes() {
  // 🔴 AUTH STATE
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // "lost_user" or "found_user"
  const navigate = useNavigate();
  const location = useLocation();

  // Update auth state based on current location
  useEffect(() => {
    if (location.pathname.startsWith("/lost-dashboard")) {
      setIsAuthenticated(true);
      setUserRole("lost_user");
    } else if (location.pathname.startsWith("/found-dashboard")) {
      setIsAuthenticated(true);
      setUserRole("found_user");
    }
  }, [location.pathnamse]);

  const handleLoginSuccess = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
    console.log("User logged in as:", role);
  };

  const handleLogout = () => {
    // Clear auth state and redirect to home
    setIsAuthenticated(false);
    setUserRole(null);
    navigate("/");
    // Trigger login modal on landing page
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("open-login"));
    }, 100);
  };

  return (
    <>
      {/* ================= GLOBAL NAVBAR ================= */}
      <Navbar
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />

      {/* ================= ROUTES ================= */}
      <Routes>
        {/* -------- PUBLIC -------- */}
        <Route path="/" element={<PublicHome onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/postings" element={<AllPostings />} />

        {/* -------- LOST USER DASHBOARD -------- */}
        <Route path="/lost-dashboard" element={<LostDashboardLayout />}>
          <Route index element={<LostDashboardHome />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="my-postings" element={<MyPostings />} />
          <Route path="create-post" element={<CreatePost />} />
          <Route path="messages" element={<Messages />} />
        </Route>
      </Routes>

      {/* ================= Q&A CHAT (GLOBAL) ================= */}
      <QAChat />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
