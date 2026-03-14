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

      {/* MOBILE TOP BAR - Standardized across dashboards */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-green-200 px-4 py-3 sticky top-[74px] z-[60] shadow-sm">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition shadow-sm border border-green-200"
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
          <p className="font-black text-xs text-green-900 uppercase tracking-tighter">{user?.full_name?.split(' ')[0] || 'User'}</p>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-[10px] font-black shadow-md">
            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
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
          w-72 bg-[#1a2f23] border-r border-white/5 p-6 shadow-2xl overflow-y-auto
          transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Close button for mobile - moved down to be visible */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-6 right-6 text-white/40 hover:text-white p-2 rounded-full hover:bg-white/5 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="mb-10 pt-4 lg:pt-0">
            <div className="relative inline-block group">
              {user?.profile_image ? (
                <img
                  src={user.profile_image}
                  alt={user.full_name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-green-500/30 shadow-2xl group-hover:scale-105 transition duration-500"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-2xl flex items-center justify-center border border-green-500/30 shadow-2xl group-hover:scale-105 transition duration-500">
                  <span className="text-green-400 font-black text-2xl">
                    {user?.full_name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-[#1a2f23] rounded-full shadow-lg" />
            </div>
            <div className="mt-4">
              <h3 className="font-black text-white text-lg leading-tight truncate">{user?.full_name || 'Lost User'}</h3>
              <p className="text-green-400/60 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Loss Management Account</p>
            </div>
          </div>

          <nav className="space-y-1">
            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-4 px-2">Main Navigation</p>
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full bg-current transition-all duration-500 group-hover:scale-150 ${location.pathname === link.path ? 'scale-100 opacity-100' : 'scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100'}`} />
                  <span className="font-bold tracking-tight">{link.label}</span>
                </div>
                {link.badge > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-black rounded-lg px-1.5 py-0.5 shadow-lg">
                    {link.badge > 9 ? '9+' : link.badge}
                  </span>
                )}
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
