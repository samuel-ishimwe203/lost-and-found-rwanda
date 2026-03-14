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
    { path: "/admin-dashboard", label: "Overview", end: true },
    { path: "/admin-dashboard/system-stats", label: "Analytics" },
    { path: "/admin-dashboard/manage-items", label: "Items Pool" },
    { path: "/admin-dashboard/manage-matches", label: "Verify Pairs" },
    { path: "/admin-dashboard/manage-police-registrations", label: "Police Access" },
    { path: "/admin-dashboard/manage-users", label: "User Accounts" },
    { path: "/admin-dashboard/logs", label: "System Logs" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] overflow-x-hidden">

      {/* MOBILE TOP BAR */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 sticky top-[74px] z-[60] shadow-sm">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition shadow-sm border border-slate-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        
        <p className="font-black text-[10px] tracking-widest text-slate-400 uppercase">System Admin</p>
        
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20"
          >
            <span className="text-[10px] font-black">AD</span>
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-[130] animate-fadeIn">
               <div className="px-4 py-2 border-b border-slate-100 mb-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signed in as</p>
                 <p className="text-xs font-bold text-slate-900 truncate">Administrator</p>
               </div>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-xs font-black text-red-600 hover:bg-red-50 transition border-none outline-none uppercase tracking-wider"
              >
                Terminate Session
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110]"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* MAIN CONTAINER */}
      <div className="flex flex-1 relative">

        {/* SIDEBAR */}
        <aside className={`
          fixed lg:sticky top-0 lg:top-[74px] left-0 h-screen lg:h-[calc(100vh-74px)] z-[120] lg:z-30
          w-72 bg-[#0f172a] p-8 shadow-2xl overflow-y-auto
          transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Close button for mobile */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-6 right-6 text-white/40 hover:text-white p-2 rounded-full hover:bg-white/5 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="mb-12">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20 mb-6">
              <span className="text-xl">🛡️</span>
            </div>
            <h3 className="font-black text-white text-xl tracking-tighter">Root Console</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Superuser Access</p>
          </div>

          <nav className="space-y-1">
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-6 px-1">Infrastructure</p>
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? "bg-white/10 text-white shadow-xl shadow-black/20 border border-white/10"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                <div className={`w-1 h-1 rounded-full bg-current transition-all duration-500 ${location.pathname === link.path ? 'scale-150 opacity-100' : 'scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100'}`} />
                <span className="font-black text-[11px] uppercase tracking-wider">{link.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-10">
             <button 
               onClick={handleLogout}
               className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all duration-500 border border-red-500/20"
             >
                Exit Console
             </button>
          </div>
        </aside>

        {/* MAIN CONTENT Area */}
        <div className="flex-1 flex flex-col min-w-0">
           {/* Desktop Only Sub-Header */}
           <header className="hidden lg:flex bg-white border-b border-slate-200 px-10 py-5 justify-between items-center sticky top-[74px] z-20">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Online</span>
              </div>
              <div className="flex items-center gap-6">
                 <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition">Global Notifications</button>
                 <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition">Support Ticket</button>
              </div>
           </header>

           <main className="flex-1 p-4 md:p-8 lg:p-12 space-y-8 min-h-screen relative overflow-x-hidden">
             <div className="max-w-7xl mx-auto">
                <Outlet />
             </div>
           </main>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-white/5 text-slate-600 py-12 px-10 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
          <div className="flex items-center gap-6">
            <span className="text-white">Admin Engine v2.4</span>
            <span className="text-slate-800">|</span>
            <span className="hover:text-white transition cursor-pointer">Security Policy</span>
            <span className="hover:text-white transition cursor-pointer">Infrastructure Status</span>
          </div>
          <p>© {new Date().getFullYear()} Lost & Found Rwanda. Internal Admin Network.</p>
        </div>
      </footer>
    </div>
  );
}