import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../services/api";
import { getImageUrl } from "../../utils/imageHelper";
import { FiClock, FiCheckCircle, FiAlertCircle, FiTrendingUp } from "react-icons/fi";
import { useLanguage } from "../../context/LanguageContext";

export default function LostHome() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const avatarUrl = getImageUrl(user?.profile_image || user?.avatar || user?.photo || user?.photo_url);
  const userInitials = (user?.full_name || user?.email || '?')
    .split(' ')
    .filter(Boolean)
    .map((name) => name[0]?.toUpperCase())
    .slice(0, 2)
    .join('');
    
  const [stats, setStats] = useState({
    totalLostItems: 0,
    activePostings: 0,
    matchedPostings: 0,
    recoveredItems: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const statsResponse = await apiClient.get('/lost-items/my/stats').catch(() => ({ data: { success: false } }));
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      } else {
        setStats({
          totalLostItems: 0,
          activePostings: 0,
          matchedPostings: 0,
          recoveredItems: 0
        });
      }

      const itemsResponse = await apiClient.get('/lost-items/my/items?limit=3');
      if (itemsResponse.data.success) {
        const items = itemsResponse.data.data.lostItems || [];
        const activities = items.map(item => ({
          id: item.id,
          type: item.status === 'recovered' ? 'item_returned' : item.status === 'matched' ? 'match_found' : 'item_reported',
          title: item.status === 'recovered' ? t("activity.itemReturned") : item.status === 'matched' ? t("activity.matchFound") : t("activity.itemPosted"),
          description: item.status === 'recovered' ? `${t("activity.itemReturned")} (${item.item_type})` : item.status === 'matched' ? `${t("activity.matchDesc")} (${item.item_type})` : `${t("activity.postedDesc")} (${item.item_type})`,
          timestamp: formatTimestamp(item.created_at)
        }));
        setRecentActivity(activities);
      }
    } catch (err) {
      console.error('Dashboard data error:', err);
      setError(t("messages.operationFailed"));
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("activity.time.now");
    if (diffMins < 60) return `${diffMins} ${diffMins !== 1 ? t("activity.time.minutes") : t("activity.time.minute")}`;
    if (diffHours < 24) return `${diffHours} ${diffHours !== 1 ? t("activity.time.hours") : t("activity.time.hour")}`;
    return `${diffDays} ${diffDays !== 1 ? t("activity.time.days") : t("activity.time.day")}`;
  };

  const statsCards = [
    { label: t("postings.itemsLost"), value: stats.totalLostItems || 0, icon: <FiAlertCircle />, color: "text-amber-600", bg: "bg-amber-50" },
    { label: t("status.active"), value: stats.activePostings || 0, icon: <FiTrendingUp />, color: "text-blue-600", bg: "bg-blue-50" },
    { label: t("matches.potentialMatches"), value: stats.matchedPostings || 0, icon: <FiCheckCircle />, color: "text-cyan-600", bg: "bg-cyan-50" },
    { label: t("status.returned"), value: stats.recoveredItems || 0, icon: <FiCheckCircle />, color: "text-green-600", bg: "bg-green-50" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
      {/* WELCOME SECTION */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-8 md:p-12 rounded-2xl border border-green-500 shadow-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/5 opacity-10"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-150"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-24 h-24 rounded-2xl border-4 border-white object-cover shadow-2xl"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl border-4 border-white bg-white/20 text-white flex items-center justify-center text-3xl font-black shadow-2xl shrink-0">
              {userInitials || '?'}
            </div>
          )}
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
              {t("admin.welcomeBack")}, {user?.full_name?.split(' ')[0] || 'Member'}!
            </h1>
            <p className="text-green-50 text-base md:text-xl opacity-90 max-w-2xl font-medium">
               {t("landing.aiLostExplainer")}
            </p>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all border-b-4 border-b-green-500 hover:-translate-y-1">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4 text-xl`}>
              {stat.icon}
            </div>
            <p className="text-3xl font-bold text-slate-900 leading-none">{stat.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* RECENT ACTIVITY */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">{t("activity.recentActivity")}</h2>
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">{t("scanner.subtitle")}</span>
          </div>

          {recentActivity.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center">
              <div className="text-4xl mb-4 grayscale opacity-30">📡</div>
              <p className="text-slate-500 font-medium">{t("activity.noActivity")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex gap-5 hover:border-green-200 transition-colors group">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:bg-green-50 transition-colors">
                    {activity.type === 'item_recovered' ? '✅' : activity.type === 'match_found' ? '🔍' : '📝'}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-slate-900">{activity.title}</p>
                      <span className="text-[10px] font-bold text-slate-300 uppercase">{activity.timestamp}</span>
                    </div>
                    <p className="text-slate-500 text-sm mt-1 font-medium">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PROFILE SUMMARY */}
        <div className="space-y-6">
           <h2 className="text-xl font-bold text-slate-900">{t("profile.myProfile")}</h2>
           <div className="bg-slate-900 p-8 rounded-3xl shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-2xl -mr-16 -mt-16"></div>
             <div className="space-y-6 relative z-10">
               <div className="space-y-1">
                 <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest">{t("auth.firstName")}</p>
                 <p className="text-white font-bold text-lg">{user?.full_name || 'N/A'}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest">{t("auth.email")}</p>
                 <p className="text-slate-300 font-bold text-sm truncate">{user?.email || 'N/A'}</p>
               </div>
               <div className="pt-4 border-t border-white/10">
                 <button 
                   onClick={() => window.location.href='/lost-dashboard/my-profile'}
                   className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all shadow-lg active:scale-95"
                 >
                   {t("profile.editProfile")}
                 </button>
               </div>
             </div>
           </div>

           <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
             <p className="text-green-800 font-bold text-sm mb-2">{t("landing.howItWorksSubtitle")}</p>
             <p className="text-green-700 text-xs font-medium leading-relaxed mb-4">{t("landing.aiLostExplainer")}</p>
           </div>
        </div>
      </div>
    </div>
  );
}
