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
      <div className="bg-gradient-to-r from-teal-600 to-emerald-700 p-6 md:p-10 rounded-2xl md:rounded-[40px] border border-green-300 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 text-center md:text-left">
          <span className="px-4 py-1.5 bg-white/20 text-white rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest mb-4 inline-block backdrop-blur-md border border-white/20">System Administration</span>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tight">Admin Dashboard</h1>
          <p className="text-teal-50 text-base md:text-xl font-medium opacity-90">System Overview & Central Control Center</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 md:p-6 rounded-2xl shadow-lg border border-teal-100 hover:shadow-2xl hover:border-teal-200 transition-all duration-300 transform md:hover:scale-[1.02]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <p className={`text-2xl md:text-4xl font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
              <span className="text-3xl md:text-4xl opacity-50">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[40px] shadow-2xl border border-teal-50">
          <div className="flex items-center gap-4 mb-8">
             <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center text-xl shadow-inner"><FiInfo /></div>
             <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">System Status</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {systemStatus.map((system, idx) => (
              <div key={idx} className="border border-teal-50 rounded-2xl p-4 md:p-5 bg-slate-50 relative group hover:bg-white hover:border-teal-200 transition-all shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-black text-slate-800 text-[10px] md:text-xs uppercase tracking-widest leading-none">{system.name}</p>
                  <span className={`w-2.5 h-2.5 rounded-full ${system.status === 'healthy' ? 'bg-emerald-500 shadow-lg shadow-emerald-200 animate-pulse' : 'bg-amber-500 shadow-lg shadow-amber-200'}`}></span>
                </div>
                <p className="text-[10px] font-bold text-slate-400">Reliability Index: {system.uptime}</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: "⚙️", title: "System Settings", btn: "Configure System" },
          { icon: "👮", title: "Police Account", btn: "New Police User" },
          { icon: "📊", title: "Generate Report", btn: "Export Report" }
        ].map((action, idx) => (
          <div key={idx} className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[32px] border border-teal-100 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="text-3xl mb-4">{action.icon}</div>
            <h3 className="text-base md:text-lg font-black text-slate-900 mb-6 uppercase tracking-tight">{action.title}</h3>
            <button className="w-full bg-slate-900 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest hover:bg-black transition transform hover:translate-y-[-2px] shadow-lg">
              {action.btn}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}