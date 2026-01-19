import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import apiClient from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function LostDashboardLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    
    // Listen for messagesRead event to update badge immediately
    const handleMessagesRead = () => {
      fetchUnreadCount();
    };
    window.addEventListener('messagesRead', handleMessagesRead);
    
    // If on messages page, check more frequently
    const interval = location.pathname.includes('/messages') 
      ? setInterval(fetchUnreadCount, 3000) // Every 3 seconds on messages page
      : setInterval(fetchUnreadCount, 15000); // Every 15 seconds elsewhere
    
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
      
      // Get unique senders who have sent unread messages TO ME
      const uniqueSendersWithUnread = new Set();
      messages.forEach(msg => {
        // Only count if: message is unread AND I am the receiver
        if (!msg.is_read && msg.receiver_id === user.id) {
          uniqueSendersWithUnread.add(msg.sender_id);
        }
      });
      
      // Count number of unique conversations (senders) with unread messages
      setUnreadCount(uniqueSendersWithUnread.size);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const navLinks = [
    { path: "/lost-dashboard", label: "Dashboard", end: true },
    { path: "/lost-dashboard/profile", label: "My Profile" },
    { path: "/lost-dashboard/my-postings", label: "My Postings" },
    { path: "/lost-dashboard/create-post", label: "Create Post" },
    { path: "/lost-dashboard/messages", label: "Messages", badge: unreadCount },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
      
      {/* MAIN CONTAINER */}
      <div className="flex flex-1">

        {/* SIDEBAR */}
        <aside className="w-64 bg-gradient-to-b from-green-700 to-emerald-800 border-r border-green-400/30 p-6 shadow-2xl sticky top-0 h-screen overflow-y-auto">
          <div className="text-center mb-8">
            {user?.profile_image ? (
              <img
                src={user.profile_image}
                alt={user.full_name}
                className="w-20 h-20 mx-auto rounded-full object-cover border-4 border-green-300 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">
                  {user?.full_name
                    ?.split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'LU'}
                </span>
              </div>
            )}
            <p className="mt-3 font-bold text-white text-lg">{user?.full_name || 'Lost User'}</p>
            <p className="text-green-200 text-xs mt-1">Dashboard</p>
          </div>

          <nav className="space-y-2 text-sm">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg transition font-semibold relative ${
                    isActive
                      ? "bg-gradient-to-r from-green-400 to-emerald-500 text-green-900 shadow-lg"
                      : "text-green-100 hover:bg-green-700/60 hover:text-white"
                  }`
                }
              >
                <span className="flex items-center justify-between">
                  {link.label}
                  {link.badge > 0 && (
                    <span className="ml-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
                      {link.badge > 9 ? '9+' : link.badge}
                    </span>
                  )}
                </span>
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
              lost items efficiently and safely.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">Quick Links</h4>
            <ul className="text-sm space-y-2">
              <li className="hover:text-green-300 transition cursor-pointer">Dashboard</li>
              <li className="hover:text-green-300 transition cursor-pointer">My Profile</li>
              <li className="hover:text-green-300 transition cursor-pointer">My Postings</li>
              <li className="hover:text-green-300 transition cursor-pointer">Messages</li>
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
            <p className="text-sm mb-2">✉️ support@lostfound.rw</p>
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
