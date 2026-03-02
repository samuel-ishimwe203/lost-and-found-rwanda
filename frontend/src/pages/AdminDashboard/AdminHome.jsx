import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";

export default function AdminHome() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [systemStatus] = useState([
    { name: "Database", status: "healthy", uptime: "99.9%" },
    { name: "API Server", status: "healthy", uptime: "99.8%" },
    { name: "Notifications", status: "healthy", uptime: "99.7%" },
    { name: "Search Index", status: "healthy", uptime: "100%" },
  ]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/stats");
      setDashboardData(response.data.data);
      setError("");
    } catch (err) {
      setError("Failed to load dashboard statistics. " + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-xl text-green-600 font-semibold animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  // Construct dynamic stats based on API response
  const stats = [
    { label: "Total Lost Items", value: dashboardData?.lostItems?.total || 0, icon: "📋", color: "text-green-600" },
    { label: "Total Found Items", value: dashboardData?.foundItems?.total || 0, icon: "📦", color: "text-blue-600" },
    { label: "Matched Items", value: dashboardData?.matches?.total || 0, icon: "✅", color: "text-yellow-600" },
    { label: "Active Users", value: dashboardData?.users?.total || 0, icon: "👥", color: "text-purple-600" },
  ];

  return (
    <div className="space-y-8">
      {/* WELCOME BANNER */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-8 rounded-2xl border border-green-300 shadow-lg">
        <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-green-100 text-lg">System Overview & Control Center</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* STATS GRID */}
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white text-gray-900 p-6 rounded-xl shadow-lg border border-green-200 hover:shadow-xl hover:border-green-300 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-gray-600 mt-2">{stat.label}</p>
              </div>
              <span className="text-4xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* SYSTEM STATUS */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-200">
          <h2 className="text-2xl font-bold text-green-900 mb-6">System Status</h2>
          <div className="grid grid-cols-2 gap-4">
            {systemStatus.map((system, idx) => (
              <div key={idx} className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900">{system.name}</p>
                  <span className={`w-3 h-3 rounded-full ${system.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                </div>
                <p className="text-xs text-gray-600">Uptime: {system.uptime}</p>
              </div>
            ))}
          </div>
        </div>

        {/* DETAILED STATS */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-200">
           <h2 className="text-2xl font-bold text-green-900 mb-6">User Breakdown</h2>
           <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Lost Users</span>
                <span className="font-bold text-gray-900">{dashboardData?.users?.losers || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Found Users</span>
                <span className="font-bold text-gray-900">{dashboardData?.users?.finders || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Police Stations</span>
                <span className="font-bold text-gray-900">{dashboardData?.users?.police || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Admins</span>
                <span className="font-bold text-gray-900">{dashboardData?.users?.admins || 0}</span>
              </div>
           </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-100 to-green-50 p-6 rounded-xl border-2 border-green-300 shadow-lg">
          <h3 className="text-lg font-bold text-green-900 mb-4">⚙️ System Settings</h3>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition">
            Configure System
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-100 to-green-50 p-6 rounded-xl border-2 border-green-300 shadow-lg">
          <h3 className="text-lg font-bold text-green-900 mb-4">👮 Create Police Account</h3>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition">
            New Police User
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-100 to-green-50 p-6 rounded-xl border-2 border-green-300 shadow-lg">
          <h3 className="text-lg font-bold text-green-900 mb-4">📊 Generate Report</h3>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition">
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
}