import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../services/api";

export default function LostDashboardHome() {
  const { user } = useAuth();
  const avatarUrl = user?.profile_image || user?.avatar || user?.photo || user?.photo_url;
  const userInitials = (user?.full_name || user?.email || '?')
    .split(' ')
    .filter(Boolean)
    .map((name) => name[0]?.toUpperCase())
    .slice(0, 2)
    .join('');
  const [stats, setStats] = useState({
    totalPostings: 0,
    activePostings: 0,
    waitingApproval: 0,
    totalMatches: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's lost items
      const itemsResponse = await apiClient.get('/lost-items/my/items');
      const items = itemsResponse.data.data?.lostItems || [];
      
      // Calculate statistics
      const totalPostings = items.length;
      const activePostings = items.filter(item => item.status === 'active').length;
      const waitingApproval = items.filter(item => item.status === 'pending').length;
      
      // Fetch matches for the user
      const matchesResponse = await apiClient.get('/matches');
      const matches = matchesResponse.data.matches || [];
      
      setStats({
        totalPostings,
        activePostings,
        waitingApproval,
        totalMatches: matches.length
      });

      // Build recent activity from items and matches
      const activities = [];
      
      // Add recent matches
      matches.slice(0, 2).forEach(match => {
        activities.push({
          id: `match-${match.id}`,
          type: "match_found",
          title: "Potential Match Found",
          description: `A found item matches your ${match.lost_item_name || 'item'}`,
          timestamp: formatTimeAgo(match.created_at)
        });
      });
      
      // Add recent postings
      items.slice(0, 2).forEach(item => {
        if (item.status === 'active') {
          activities.push({
            id: `item-${item.id}`,
            type: "posting_active",
            title: "Posting Activated",
            description: `Your ${item.item_type} posting is now active`,
            timestamp: formatTimeAgo(item.created_at)
          });
        }
      });
      
      setRecentActivity(activities.slice(0, 3));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'recently';
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-green-600">Loading dashboard...</div>
      </div>
    );
  }

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
              Manage your lost item postings and track potential matches
            </p>
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white text-green-900 p-4 md:p-6 rounded-xl shadow-md border border-green-100 hover:shadow-lg hover:border-green-200 transition">
          <p className="text-2xl md:text-3xl font-bold text-green-600">{stats.totalPostings}</p>
          <p className="text-xs md:text-sm text-green-600 mt-1 md:mt-2">Total Postings</p>
        </div>
        <div className="bg-white text-green-900 p-4 md:p-6 rounded-xl shadow-md border border-green-100 hover:shadow-lg hover:border-green-200 transition">
          <p className="text-2xl md:text-3xl font-bold text-green-600">{stats.activePostings}</p>
          <p className="text-xs md:text-sm text-green-600 mt-1 md:mt-2">Active Postings</p>
        </div>
        <div className="bg-white text-green-900 p-4 md:p-6 rounded-xl shadow-md border border-green-100 hover:shadow-lg hover:border-green-200 transition">
          <p className="text-2xl md:text-3xl font-bold text-green-600">{stats.waitingApproval}</p>
          <p className="text-xs md:text-sm text-green-600 mt-1 md:mt-2">Waiting Approval</p>
        </div>
        <div className="bg-white text-green-900 p-4 md:p-6 rounded-xl shadow-md border border-green-100 hover:shadow-lg hover:border-green-200 transition">
          <p className="text-2xl md:text-3xl font-bold text-green-600">{stats.totalMatches}</p>
          <p className="text-xs md:text-sm text-green-600 mt-1 md:mt-2">Total Matches</p>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-green-200">
        <h2 className="text-xl md:text-2xl font-bold text-green-900 mb-6">Recent Activity</h2>

        {recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="border-l-4 border-green-500 pl-4 md:pl-6 py-3 md:py-4 bg-green-50 rounded-r-lg hover:bg-green-100 transition">
                <p className="font-semibold text-green-900 text-sm md:text-base">{activity.title}</p>
                <p className="text-green-700 text-xs md:text-sm mt-1">{activity.description}</p>
                <p className="text-green-600 text-[10px] md:text-xs mt-2">{activity.timestamp}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 md:py-8 text-green-600">
            <p className="text-sm md:text-base">No recent activity yet. Start by creating your first lost item post!</p>
          </div>
        )}
      </div>

      {/* USER INFO CARD */}
      <div className="bg-gradient-to-br from-green-700 to-emerald-800 p-6 md:p-8 rounded-2xl shadow-lg border border-green-400/30">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Your Profile Summary</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-[10px] md:text-xs text-green-600 font-black uppercase tracking-widest">Full Name</p>
            <p className="text-base md:text-lg font-bold text-green-900 mt-1">{user?.full_name || 'Not provided'}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-[10px] md:text-xs text-green-600 font-black uppercase tracking-widest">Email</p>
            <p className="text-base md:text-lg font-bold text-green-900 mt-1 break-all">{user?.email || 'Not provided'}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-[10px] md:text-xs text-green-600 font-black uppercase tracking-widest">Phone</p>
            <p className="text-base md:text-lg font-bold text-green-900 mt-1">{user?.phone_number || 'Not provided'}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-[10px] md:text-xs text-green-600 font-black uppercase tracking-widest">Role</p>
            <p className="text-base md:text-lg font-bold text-green-900 mt-1 capitalize">{user?.role || 'User'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
