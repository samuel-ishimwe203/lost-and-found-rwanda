import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../services/api";
import { getImageUrl } from "../../utils/imageHelper";

export default function FoundHome() {
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
      
      // Fetch dashboard stats
      const statsResponse = await apiClient.get('/found-items/my/stats');
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      // Fetch recent found items as activity
      const itemsResponse = await apiClient.get('/found-items/my/items?limit=3');
      if (itemsResponse.data.success) {
        const items = itemsResponse.data.data.foundItems;
        const activities = items.map(item => ({
          id: item.id,
          type: item.status === 'returned' ? 'item_returned' : item.status === 'matched' ? 'match_found' : 'item_found',
          title: item.status === 'returned' ? 'Item Successfully Returned' : item.status === 'matched' ? 'Match Found' : 'Item Posted Successfully',
          description: item.status === 'returned' ? `${item.item_type} was returned to the owner` : item.status === 'matched' ? `Your found ${item.item_type} matches a lost posting` : `Your ${item.item_type} has been posted as found`,
          timestamp: formatTimestamp(item.created_at)
        }));
        setRecentActivity(activities);
      }
    } catch (err) {
      console.error('Dashboard data error:', err);
      if (err.response?.status === 401) {
        setError('🔒 Session expired. Please login again.');
      } else if (err.message === 'Network Error') {
        setError('🌐 Network error. Please check your connection.');
      } else {
        setError('Failed to load dashboard data. Please refresh the page.');
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

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  const statsCards = [
    { label: "Total Found Items", value: stats.totalFoundItems },
    { label: "Items Reported", value: stats.activeItems },
    { label: "Matched Items", value: stats.matchedItems },
    { label: "Pending Review", value: stats.totalFoundItems - stats.matchedItems - stats.returnedItems },
  ];

  return (
    <div className="space-y-8">
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
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
              Welcome back, {user?.full_name || user?.email || 'User'}!
            </h1>
            <p className="text-green-50 text-sm md:text-lg opacity-90">
              Report found items and help reunite them with their owners
            </p>
          </div>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
          <p className="text-green-700 mt-4">Loading dashboard...</p>
        </div>
      )}

      {/* ERROR STATE */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      {/* STATS CARDS */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {statsCards.map((stat, idx) => (
              <div key={idx} className="bg-white text-green-900 p-4 md:p-6 rounded-xl shadow-md border border-green-100 hover:shadow-lg hover:border-green-200 transition">
                <p className="text-2xl md:text-3xl font-bold text-green-600">{stat.value}</p>
                <p className="text-xs md:text-sm text-green-600 mt-1 md:mt-2">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* RECENT ACTIVITY */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-green-200">
            <h2 className="text-xl md:text-2xl font-bold text-green-900 mb-6">Recent Activity</h2>

            {recentActivity.length === 0 ? (
              <div className="text-center py-6 md:py-8 text-green-600">
                <p className="text-sm md:text-base">📭 No recent activity. Start posting found items!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="border-l-4 border-green-500 pl-4 md:pl-6 py-3 md:py-4 bg-green-50 rounded-r-lg hover:bg-green-100 transition">
                    <p className="font-semibold text-green-900 text-sm md:text-base">{activity.title}</p>
                    <p className="text-green-700 text-xs md:text-sm mt-1">{activity.description}</p>
                    <p className="text-green-600 text-[10px] md:text-xs mt-2">{activity.timestamp}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* USER INFO CARD */}
      <div className="bg-gradient-to-br from-green-700 to-emerald-800 p-6 md:p-8 rounded-2xl shadow-lg border border-green-400/30">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Your Profile Summary</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-[10px] md:text-xs text-green-600 font-black uppercase tracking-widest">Full Name</p>
            <p className="text-base md:text-lg font-bold text-green-900 mt-1">{user?.full_name || 'N/A'}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-[10px] md:text-xs text-green-600 font-black uppercase tracking-widest">Email</p>
            <p className="text-base md:text-lg font-bold text-green-900 mt-1 break-all">{user?.email || 'N/A'}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-[10px] md:text-xs text-green-600 font-black uppercase tracking-widest">Phone</p>
            <p className="text-base md:text-lg font-bold text-green-900 mt-1">{user?.phone_number || 'N/A'}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-[10px] md:text-xs text-green-600 font-black uppercase tracking-widest">Location</p>
            <p className="text-base md:text-lg font-bold text-green-900 mt-1">{user?.district || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
