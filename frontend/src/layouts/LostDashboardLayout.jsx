import { NavLink, Link, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import apiClient from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function LostDashboardLayout() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleToggle = () => setSidebarOpen(prev => !prev);
    window.addEventListener('toggle-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-sidebar', handleToggle);
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const handleMessagesRead = () => fetchUnreadCount();
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
    { path: "/lost-dashboard", label: t("dashboard.dashboard"), end: true },
    { path: "/lost-dashboard/profile", label: t("profile.myProfile") },
    { path: "/lost-dashboard/my-postings", label: t("items.myLostItems") },
    { path: "/lost-dashboard/matches", label: t("matches.matchedItems") },
    { path: "/lost-dashboard/create-post", label: t("items.postLostItem") },
    { path: "/lost-dashboard/document-scanner", label: t("items.image") + " Scanner" },
    { path: "/lost-dashboard/messages", label: t("notifications.notifications"), badge: unreadCount },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 overflow-x-hidden font-sans">
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="flex flex-1 relative mt-[74px]">
        <aside className={`
          fixed top-[74px] left-0 h-[calc(100vh-74px)] z-[120] lg:z-30
          w-72 bg-[#108643] p-8 shadow-2xl overflow-y-auto
          transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-6 right-6 text-white/50 hover:text-white p-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="mb-12 pt-4 lg:pt-0">
             <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20 shadow-lg mb-4">
                <span className="text-white font-bold text-2xl uppercase">
                   {user?.full_name?.charAt(0) || 'L'}
                </span>
             </div>
             <div>
               <h3 className="font-bold text-white text-lg tracking-tight truncate">{user?.full_name || 'User'}</h3>
               <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mt-1">{t("profile.userRole")}</p>
             </div>
          </div>

          <nav className="space-y-1.5 flex flex-col h-[calc(100%-180px)]">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? "bg-white text-[#108643] shadow-md"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="font-bold tracking-tight text-sm">{link.label}</span>
                    {link.badge > 0 && (
                       <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${isActive ? 'bg-[#108643] text-white' : 'bg-white/20 text-white'}`}>
                          {link.badge}
                       </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex-1 lg:ml-72 flex flex-col min-w-0">
           <main className="flex-1 p-4 md:p-10 min-h-screen">
              <Outlet />
           </main>
           <footer className="bg-slate-950 text-gray-400 py-12 px-8 font-sans">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
              <div className="col-span-1">
                <div className="flex items-center gap-1 mb-6">
                  <span className="text-xl font-black tracking-tight text-white uppercase italic">{t("app.title")}</span>
                </div>
                <p className="text-xs font-medium leading-relaxed opacity-60">
                   {t("app.description")}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-6 text-xs uppercase tracking-widest">{t("footer.about")}</h4>
                <ul className="text-xs space-y-3 font-medium">
                  <li><Link to="/lost-dashboard" className="hover:text-white transition">{t("dashboard.dashboard")}</Link></li>
                  <li><Link to="/lost-dashboard/profile" className="hover:text-white transition">{t("profile.myProfile")}</Link></li>
                  <li><Link to="/lost-dashboard/messages" className="hover:text-white transition">{t("notifications.notifications")}</Link></li>
                </ul>
              </div>

              <div className="col-span-2">
                <h4 className="font-bold text-white mb-6 text-xs uppercase tracking-widest">{t("footer.terms")}</h4>
                <p className="text-[10px] font-medium leading-relaxed opacity-50 uppercase tracking-widest">
                  {t("footer.copyright")}
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
