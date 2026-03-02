import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function AdminDashboardLayout() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { path: "/admin-dashboard", label: "Dashboard", end: true },
    { path: "/admin-dashboard/system-stats", label: "System Stats" },
    { path: "/admin-dashboard/manage-items", label: "Manage Items" },
    { path: "/admin-dashboard/manage-users", label: "Manage Users" },
    { path: "/admin-dashboard/logs", label: "Activity Logs" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
      
      {/* MAIN CONTAINER */}
      <div className="flex flex-1">

        {/* SIDEBAR */}
        <aside className="w-64 bg-gradient-to-b from-green-700 to-emerald-800 border-r border-green-400/30 p-6 shadow-2xl sticky top-0 h-screen overflow-y-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">⚙️</span>
            </div>
            <p className="mt-3 font-bold text-white text-lg">Admin Control</p>
            <p className="text-green-200 text-xs mt-1">System Management</p>
          </div>

          <nav className="space-y-2 text-sm">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg transition font-semibold ${
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
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* HEADER DROPDOWN */}
          <header className="bg-white shadow-sm border-b border-green-200 px-8 py-4 flex justify-end items-center z-10">
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

          <main className="flex-1 overflow-auto p-8 space-y-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}