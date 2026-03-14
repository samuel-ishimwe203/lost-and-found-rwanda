import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";

export default function AdminDashboardLayout() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { path: "/admin-dashboard", label: "Dashboard", end: true },
    { path: "/admin-dashboard/system-stats", label: "System Stats" },
    { path: "/admin-dashboard/manage-items", label: "Manage Items" },
    { path: "/admin-dashboard/manage-matches", label: "Verify Matches" },
    { path: "/admin-dashboard/manage-police-registrations", label: "Police Requests" },
    { path: "/admin-dashboard/manage-users", label: "Manage Users" },
    { path: "/admin-dashboard/logs", label: "Activity Logs" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 overflow-x-hidden">

      {/* MOBILE TOP BAR */}
      <div className="lg:hidden flex items-center justify-between bg-gradient-to-r from-green-700 to-emerald-800 text-white px-4 py-3 sticky top-[74px] z-50 shadow-md">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-green-600 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        <p className="font-bold text-sm">Admin Panel</p>
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold"
          >
            ⚙️
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50">
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition font-medium"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* MAIN CONTAINER */}
      <div className="flex flex-1">

        {/* SIDEBAR */}
        <aside className={`
          fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-auto
          w-64 bg-gradient-to-b from-green-700 to-emerald-800 border-r border-green-400/30 p-6 shadow-2xl overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Close button for mobile */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 text-white/70 hover:text-white p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">⚙️</span>
            </div>
            <p className="mt-2 font-bold text-white text-sm">Admin Control</p>
            <p className="text-green-200 text-xs">System Management</p>
          </div>

          <nav className="space-y-1.5 text-sm">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-lg transition font-semibold ${
                    isActive
                      ? "bg-gradient-to-r from-green-400 to-emerald-500 text-green-900 shadow-lg"
                      : "text-green-100 hover:bg-green-700/60 hover:text-white"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* HEADER DROPDOWN - desktop only */}
          <header className="hidden lg:flex bg-white shadow-sm border-b border-green-200 px-8 py-4 justify-end items-center z-10">
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 bg-green-50 hover:bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold transition border border-green-200"
              >
                <span>Admin Profile</span>
                <span className="text-xs">▼</span>
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-sm font-bold text-gray-800">Administrator</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition font-medium"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 space-y-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}