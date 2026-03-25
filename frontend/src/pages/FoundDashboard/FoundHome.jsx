import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../services/api";
import { getImageUrl } from "../../utils/imageHelper";
import { useLanguage } from "../../context/LanguageContext";import { useLanguage } from "../../context/LanguageContext";
import Loading from "../../components/Loading";

export default function FoundHome() {
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
    totalFoundItems: 0,
    activeItems: 0,
    matchedItems: 0,
    returnedItems: 0
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
      
      const statsResponse = await apiClient.get('/found-items/my/stats');
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      const itemsResponse = await apiClient.get('/found-items/my/items?limit=3');
      if (itemsResponse.data.success) {
        const items = itemsResponse.data.data.foundItems;
        const activities = items.map(item => ({
          id: item.id,
          type: item.status === 'returned' ? 'item_returned' : item.status === 'matched' ? 'match_found' : 'item_found',
          title: item.status === 'returned' ? t("activity.itemReturned") : item.status === 'matched' ? t("activity.matchFound") : t("activity.itemPosted"),
          description: item.status === 'returned' ? `${item.item_type} ${t("activity.returnedDesc")}` : item.status === 'matched' ? `${t("activity.matchDesc")} (${item.item_type})` : `${t("activity.postedDesc")} (${item.item_type})`,
          timestamp: formatTimestamp(item.created_at)
        }));
        setRecentActivity(activities);
      }
    } catch (err) {
      console.error('Dashboard data error:', err);
      if (err.response?.status === 401) {
        setError('🔒 ' + t("auth.loginFailed"));
      } else {
        setError(t("messages.operationFailed"));
      }
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
    { label: t("admin.totalItems"), value: stats.totalFoundItems },
    { label: t("items.postFoundItem").split(' ')[1] + " " + t("admin.active"), value: stats.activeItems },
    { label: t("matches.matchedItems"), value: stats.matchedItems },
    { label: t("admin.status"), value: stats.totalFoundItems - stats.matchedItems - stats.returnedItems },
  ];

  if (loading) return <Loading />;

  return (
    <div className="space-y-8 pb-24">
      {/* WELCOME MESSAGE */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 md:p-8 rounded-2xl border border-green-300 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-16 h-16 rounded-full border-2 border-white object-cover shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-full border-2 border-white bg-white/20 text-white flex items-center justify-center text-2xl font-semibold shadow-md shrink-0">
              {userInitials || '?'}
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">
              {t("admin.welcomeBack")}, {user?.full_name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-green-50 text-sm md:text-base opacity-90 font-medium">
              {t("landing.aiFoundExplainer")}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 text-red-700 font-bold flex items-center gap-3">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
            <p className="text-4xl font-black text-green-600 mb-1">{stat.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* RECENT ACTIVITY */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-full">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900">{t("activity.recentActivity")}</h2>
            <div className="w-10 h-1bg-green-100 rounded-full"></div>
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm font-medium">{t("activity.noActivity")}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="relative pl-8 pb-2">
                  <div className="absolute left-0 top-1.5 w-3 h-3 bg-green-500 rounded-full border-4 border-white shadow-sm z-10"></div>
                  <div className="absolute left-1.5 top-4 bottom-0 w-px bg-slate-100"></div>
                  <p className="font-bold text-slate-900 text-sm">{activity.title}</p>
                  <p className="text-slate-500 text-xs mt-1 font-medium">{activity.description}</p>
                  <p className="text-[10px] font-bold text-green-600 uppercase tracking-tight mt-2">{activity.timestamp}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PROFILE SUMMARY */}
        <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
          <h2 className="text-xl font-bold mb-8 relative z-10">{t("profile.myProfile")}</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
              <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest mb-1">{t("auth.firstName")}</p>
              <p className="text-sm font-bold text-slate-200">{user?.full_name || 'N/A'}</p>
            </div>
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
              <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest mb-1">{t("auth.email")}</p>
              <p className="text-sm font-bold text-slate-200 truncate">{user?.email || 'N/A'}</p>
            </div>
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
              <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest mb-1">{t("auth.phone")}</p>
              <p className="text-sm font-bold text-slate-200">{user?.phone_number || 'N/A'}</p>
            </div>
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
              <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest mb-1">{t("items.location")}</p>
              <p className="text-sm font-bold text-slate-200">{t(`districts.${user?.district?.toLowerCase()}`) || user?.district || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
