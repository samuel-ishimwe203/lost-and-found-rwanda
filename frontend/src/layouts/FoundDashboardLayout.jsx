import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import apiClient from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function FoundDashboardLayout() {
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
    { path: "/found-dashboard", label: "Dashboard", end: true },
    { path: "/found-dashboard/profile", label: "My Profile" },
    { path: "/found-dashboard/my-found-items", label: "My Found Items" },
    { path: "/found-dashboard/post-found-item", label: "Post Found Item" },
    { path: "/found-dashboard/matches", label: "Potential Matches" },
    { path: "/found-dashboard/document-scanner", label: "Document Scanner" },
    { path: "/found-dashboard/messages", label: "Messages", badge: unreadCount },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-100 overflow-x-hidden">
      
      {/* MOBILE TOP BAR */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-blue-200 px-4 py-3 sticky top-[74px] z-[60] shadow-sm">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition shadow-sm border border-blue-200"
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
          <p className="font-black text-xs text-blue-900 uppercase tracking-tighter">{user?.full_name?.split(' ')[0] || 'Finder'}</p>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-[10px] font-black shadow-md">
            {user?.full_name?.charAt(0)?.toUpperCase() || 'F'}
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
          w-72 bg-[#0f172a] border-r border-white/5 p-6 shadow-2xl overflow-y-auto
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

          <div className="mb-10 pt-4 lg:pt-0">
            <div className="relative inline-block group">
              {user?.profile_image ? (
                <img
                  src={user.profile_image}
                  alt={user.full_name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500/30 shadow-2xl group-hover:scale-105 transition duration-500"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30 shadow-2xl group-hover:scale-105 transition duration-500">
                  <span className="text-blue-400 font-black text-2xl">
                    {user?.full_name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 border-2 border-[#0f172a] rounded-full shadow-lg" />
            </div>
            <div className="mt-4">
              <h3 className="font-black text-white text-lg leading-tight truncate">{user?.full_name || 'Found User'}</h3>
              <p className="text-blue-400/60 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Discovery Dashboard</p>
            </div>
          </div>

          <nav className="space-y-1">
            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-4 px-2">Manage Discoveries</p>
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
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
      <footer className="bg-slate-950 border-t border-white/5 text-slate-400 py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
             <div className="flex items-center gap-2 mb-6">
                <span className="text-xl font-black tracking-tighter text-white">LOST</span>
                <span className="text-xl font-black tracking-tighter text-blue-500">FOUND</span>
             </div>
            <p className="text-sm leading-relaxed">
              Rwanda's premium platform for connecting lost items with their rightful owners through verified discoveries.
            </p>
          </div>

          <div>
            <h4 className="font-black text-white mb-6 text-xs uppercase tracking-widest">Navigation</h4>
            <ul className="text-sm space-y-4">
              <li className="hover:text-blue-400 transition cursor-pointer">Main Dashboard</li>
              <li className="hover:text-blue-400 transition cursor-pointer">Account Settings</li>
              <li className="hover:text-blue-400 transition cursor-pointer">Discovery History</li>
              <li className="hover:text-blue-400 transition cursor-pointer">Secure Messages</li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-white mb-6 text-xs uppercase tracking-widest">Help & Support</h4>
            <ul className="text-sm space-y-4">
              <li className="hover:text-blue-400 transition cursor-pointer">User Guidelines</li>
              <li className="hover:text-blue-400 transition cursor-pointer">Privacy Policy</li>
              <li className="hover:text-blue-400 transition cursor-pointer">Terms of Service</li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-white mb-6 text-xs uppercase tracking-widest">Official Contact</h4>
            <div className="space-y-4 text-sm">
               <p className="flex items-center gap-2">📍 Kigali, Rwanda</p>
               <p className="flex items-center gap-2">✉️ contact@lostfound.rw</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-8 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Lost & Found Rwanda. Premium Recovery System.</p>
        </div>
      </footer>
    </div>
  );
}
