import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";

export default function PoliceHome() {
  const [stats, setStats] = useState([
    { label: "Items Uploaded", value: 0, icon: "📄", color: "text-red-600" },
    { label: "Active Items", value: 0, icon: "🔍", color: "text-blue-600" },
    { label: "Items Returned", value: 0, icon: "✅", color: "text-green-600" },
    { label: "Pending Claims", value: 0, icon: "⏳", color: "text-yellow-600" },
  ]);
  const [loading, setLoading] = useState(true);

  // We keep static recent activities for now, unless you add an audit trail endpoint later
  const [recentActivities] = useState([
    { id: 1, action: "Dashboard Accessed", description: "Police user logged in securely", time: "Just now" },
    { id: 2, action: "System Update", description: "AI match detection is active", time: "System" },
  ]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/police/stats');
      if (response.data.success) {
        const data = response.data.data;
        setStats([
          { label: "Total Uploads", value: data.totalUploads, icon: "📄", color: "text-red-600" },
          { label: "Active Tracking", value: data.activeItems, icon: "🔍", color: "text-blue-600" },
          { label: "Items Returned", value: data.returnedItems, icon: "✅", color: "text-green-600" },
          { label: "Pending Matches", value: data.pendingClaims, icon: "⏳", color: "text-yellow-600" },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch police stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-4 bg-yellow-100 min-h-screen">
      {/* WELCOME BANNER */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-8 rounded-2xl border border-green-300 shadow-lg">
        <h1 className="text-4xl font-bold text-white mb-2">Police Department Dashboard</h1>
        <p className="text-green-100 text-lg">Official Item Management & Case Processing</p>
      </div>

      {/* STATS GRID */}
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white text-gray-900 p-6 rounded-xl shadow-lg border border-green-200 hover:shadow-xl hover:border-green-300 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-4xl font-bold ${stat.color}`}>
                  {loading ? '...' : stat.value}
                </p>
                <p className="text-sm text-gray-600 mt-2 font-semibold">{stat.label}</p>
              </div>
              <span className="text-4xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-200">
        <h2 className="text-2xl font-bold text-green-900 mb-6">System Status</h2>
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition">
              <div>
                <p className="font-semibold text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.description}</p>
              </div>
              <span className="text-xs text-green-600 font-semibold">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-100 to-green-50 p-6 rounded-xl border-2 border-green-300 shadow-lg flex flex-col justify-between">
          <h3 className="text-lg font-bold text-green-900 mb-4">📤 Upload Official Item</h3>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition" onClick={() => window.location.href = '/police/upload'}>
            Upload Document
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-100 to-green-50 p-6 rounded-xl border-2 border-green-300 shadow-lg flex flex-col justify-between">
          <h3 className="text-lg font-bold text-green-900 mb-4">📋 Manage Matches</h3>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition" onClick={() => window.location.href = '/police/claims'}>
            View Claims
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-100 to-green-50 p-6 rounded-xl border-2 border-green-300 shadow-lg flex flex-col justify-between">
          <h3 className="text-lg font-bold text-green-900 mb-4">✅ Verify Returns</h3>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition" onClick={() => window.location.href = '/police/returned'}>
            View Returned Items
          </button>
        </div>
      </div>
    </div>
  );
}