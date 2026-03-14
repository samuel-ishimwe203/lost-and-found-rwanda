import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import apiClient from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function LostDashboardLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    fetchUnreadCount();

    const handleMessagesRead = () => {
      fetchUnreadCount();
    };
    window.addEventListener('messagesRead', handleMessagesRead);

    const interval = location.pathname.includes('/messages')
      ? setInterval(fetchUnreadCount, 10000)
      : setInterval(fetchUnreadCount, 60000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('messagesRead', handleMessagesRead);
    };
  }, [location.pathname]);

  const fetchUnreadCount = async () => {
    try {
      if (!user?.id) return;

      const response = await apiClient.get('/messages');
      const messages = response.data.data || [];

      const uniqueSendersWithUnread = new Set();
      messages.forEach(msg => {
        if (!msg.is_read && msg.receiver_id === user.id) {
          uniqueSendersWithUnread.add(msg.sender_id);
        }
      });

      setUnreadCount(uniqueSendersWithUnread.size);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const navLinks = [
    { path: "/lost-dashboard", label: "Dashboard", end: true },
    { path: "/lost-dashboard/profile", label: "My Profile" },
    { path: "/lost-dashboard/my-postings", label: "My Postings" },
    { path: "/lost-dashboard/matches", label: "My Matches" },
    { path: "/lost-dashboard/create-post", label: "Create Post" },
    { path: "/lost-dashboard/document-scanner", label: "Document Scanner" },
    { path: "/lost-dashboard/messages", label: "Messages", badge: unreadCount },
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
        <p className="font-bold text-sm">{user?.full_name || 'Dashboard'}</p>
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">
          {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
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
            {user?.profile_image ? (
              <img
                src={user.profile_image}
                alt={user.full_name}
                className="w-16 h-16 mx-auto rounded-full object-cover border-4 border-green-300 shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">
                  {user?.full_name
                    ?.split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'LU'}
                </span>
              </div>
            )}
            <p className="mt-2 font-bold text-white text-sm">{user?.full_name || 'Lost User'}</p>
            <p className="text-green-200 text-xs">Dashboard</p>
          </div>

          <nav className="space-y-1.5 text-sm">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-lg transition font-semibold relative ${isActive
                    ? "bg-gradient-to-r from-green-400 to-emerald-500 text-green-900 shadow-lg"
                    : "text-green-100 hover:bg-green-700/60 hover:text-white"
                  }`
                }
              >
                <span className="flex items-center justify-between">
                  {link.label}
                  {link.badge > 0 && (
                    <span className="ml-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
                      {link.badge > 9 ? '9+' : link.badge}
                    </span>
                  )}
                </span>
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
              lost items efficiently and safely.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 text-sm">Quick Links</h4>
            <ul className="text-xs space-y-1.5">
              <li className="hover:text-green-300 transition cursor-pointer">Dashboard</li>
              <li className="hover:text-green-300 transition cursor-pointer">My Profile</li>
              <li className="hover:text-green-300 transition cursor-pointer">My Postings</li>
              <li className="hover:text-green-300 transition cursor-pointer">Messages</li>
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
            <p className="text-xs mb-1">✉️ support@lostfound.rw</p>
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
