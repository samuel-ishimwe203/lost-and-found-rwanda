import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function PoliceDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { path: "/police-dashboard", label: "Overview", end: true },
    { path: "/police-dashboard/upload-document", label: "Post Local Discovery" },
    { path: "/police-dashboard/manage-claims", label: "Verify Claims" },
    { path: "/police-dashboard/returned-documents", label: "Archive Items" },
    { path: "/police-dashboard/document-scanner", label: "AI Document Scanner" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 overflow-x-hidden">
      
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
        
        <div className="flex items-center gap-2">
          <p className="font-black text-[10px] text-slate-900 uppercase tracking-widest px-2 py-1 bg-slate-100 rounded-md">Official Unit</p>
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white text-xs font-black shadow-md">
            🚓
          </div>
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
          w-72 bg-[#020617] p-8 shadow-2xl overflow-y-auto
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
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner mb-6">
              <span className="text-3xl">🚓</span>
            </div>
            <h3 className="font-black text-white text-xl tracking-tight leading-none">Rwanda Police</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Station Portal</p>
          </div>

          <nav className="space-y-1">
            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-6 px-1">Officer Tools</p>
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? "bg-white text-slate-900 shadow-xl shadow-white/5"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                <div className={`w-1 h-1 rounded-full bg-current transition-all ${location.pathname === link.path ? 'scale-150' : 'scale-0'}`} />
                <span className="font-black text-xs uppercase tracking-wider">{link.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-10">
             <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Security Note</p>
                <p className="text-[10px] text-slate-400 leading-relaxed italic">Unauthorized access is strictly prohibited. All actions logged.</p>
             </div>
          </div>
        </aside>

        {/* MAIN CONTENT Area */}
        <div className="flex-1 flex flex-col min-w-0">
           <main className="flex-1 p-4 md:p-8 lg:p-12 space-y-8 bg-white/50 min-h-screen">
             <div className="max-w-7xl mx-auto">
                <Outlet />
             </div>
           </main>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-white/5 text-slate-500 py-12 px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
          <div className="flex items-center gap-6">
            <span className="text-white">Police Portal</span>
            <span className="text-slate-700">|</span>
            <span className="hover:text-white transition cursor-pointer">Security Protocols</span>
            <span className="hover:text-white transition cursor-pointer">Audit Logs</span>
          </div>
          <p>© {new Date().getFullYear()} Rwanda National Police. Digital Exhibits Dept.</p>
        </div>
      </footer>
    </div>
  );
}
