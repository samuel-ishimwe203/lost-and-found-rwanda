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
    { path: "/police-dashboard", label: "Dashboard", end: true },
    { path: "/police-dashboard/upload-document", label: "Upload Official Item" },
    { path: "/police-dashboard/manage-claims", label: "Manage Claims" },
    { path: "/police-dashboard/returned-documents", label: "Returned Items" },
    { path: "/police-dashboard/document-scanner", label: "Document Scanner" },
  ];

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
        <p className="font-bold text-sm">Police Station</p>
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">
          🚓
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
              <span className="text-white font-bold text-xl">🚓</span>
            </div>
            <p className="mt-2 font-bold text-white text-sm">Police Station</p>
            <p className="text-green-200 text-xs">Official Records</p>
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

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 space-y-6 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-900 border-t border-gray-700 text-gray-300 py-8 px-4 md:px-6 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-bold text-white mb-3 text-sm">About Us</h4>
            <p className="text-xs leading-relaxed">
              Lost & Found Rwanda is a national platform helping citizens recover
              lost items efficiently and safely with police involvement.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 text-sm">Police Functions</h4>
            <ul className="text-xs space-y-1.5">
              <li className="hover:text-green-300 transition cursor-pointer">Dashboard</li>
              <li className="hover:text-green-300 transition cursor-pointer">Upload Item</li>
              <li className="hover:text-green-300 transition cursor-pointer">Manage Claims</li>
              <li className="hover:text-green-300 transition cursor-pointer">Returned Items</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 text-sm">Support</h4>
            <ul className="text-xs space-y-1.5">
              <li className="hover:text-green-300 transition cursor-pointer">Help Center</li>
              <li className="hover:text-green-300 transition cursor-pointer">Contact Us</li>
              <li className="hover:text-green-300 transition cursor-pointer">FAQ</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 text-sm">Contact</h4>
            <p className="text-xs mb-1">📍 Kigali, Rwanda</p>
            <p className="text-xs mb-1">✉️ police@lostfound.rw</p>
            <p className="text-xs">📱 +250 XXX XXX XXX</p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-6 pt-4 text-center text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Lost & Found Rwanda. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
