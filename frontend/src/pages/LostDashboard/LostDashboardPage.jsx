import Navbar from "../../components/Navbar";
import LostDashboardLayout from "../../layouts/LostDashboardLayout";

export default function LostDashboardPage() {
  const handleLogout = () => {
    // demo logout
    window.location.href = "/";
  };

  

  return (
    <>
      {/* LANDING NAVBAR WITH LOGOUT */}
      <Navbar isAuthenticated={true} onLogout={handleLogout} />

      {/* DASHBOARD BODY */}
      <LostDashboardLayout />
    </>
  );
}
