import { NavLink, Outlet } from "react-router-dom";

export default function PoliceDashboardLayout() {
  const navLinks = [
    { path: "/police-dashboard", label: "Dashboard", end: true },
    { path: "/police-dashboard/upload-document", label: "Upload Official Item" },
    { path: "/police-dashboard/manage-claims", label: "Manage Claims" },
    { path: "/police-dashboard/returned-documents", label: "Returned Items" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
      
      {/* MAIN CONTAINER */}
      <div className="flex flex-1">

        {/* SIDEBAR */}
        <aside className="w-64 bg-gradient-to-b from-green-700 to-emerald-800 border-r border-green-400/30 p-6 shadow-2xl sticky top-0 h-screen overflow-y-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">🚓</span>
            </div>
            <p className="mt-3 font-bold text-white text-lg">Police Station</p>
            <p className="text-green-200 text-xs mt-1">Official Records</p>
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

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-auto p-8 space-y-8">
          <Outlet />
        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-900 border-t border-gray-700 text-gray-300 py-8 px-6 mt-auto">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-white mb-3">About Us</h4>
            <p className="text-sm">
              Lost & Found Rwanda is a national platform helping citizens recover
              lost items efficiently and safely with police involvement.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">Police Functions</h4>
            <ul className="text-sm space-y-2">
              <li className="hover:text-green-300 transition cursor-pointer">Dashboard</li>
              <li className="hover:text-green-300 transition cursor-pointer">Upload Item</li>
              <li className="hover:text-green-300 transition cursor-pointer">Manage Claims</li>
              <li className="hover:text-green-300 transition cursor-pointer">Returned Items</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">Support</h4>
            <ul className="text-sm space-y-2">
              <li className="hover:text-green-300 transition cursor-pointer">Help Center</li>
              <li className="hover:text-green-300 transition cursor-pointer">Contact Us</li>
              <li className="hover:text-green-300 transition cursor-pointer">FAQ</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">Contact</h4>
            <p className="text-sm mb-2">📍 Kigali, Rwanda</p>
            <p className="text-sm mb-2">✉️ police@lostfound.rw</p>
            <p className="text-sm">📱 +250 XXX XXX XXX</p>
          </div>
        </div>

        <div className="border-t border-blue-500/40 mt-8 pt-6 text-center text-sm text-blue-200">
          <p>© {new Date().getFullYear()} Lost & Found Rwanda. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
