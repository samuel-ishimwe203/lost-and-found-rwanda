import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";

export default function SystemStats() {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [chartData] = useState({
    weekly: [45, 52, 48, 61, 55, 67, 72],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/stats");
      setStatsData(response.data.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch system statistics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-xl text-purple-600 font-semibold animate-pulse">Loading system stats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  // Format data for display cards based on backend response structure
  const displayStats = [
    { 
      category: "Lost Items", 
      total: statsData?.lostItems?.total || 0, 
      active: statsData?.lostItems?.active || 0, 
      matched: statsData?.lostItems?.matched || 0, 
      resolved: statsData?.lostItems?.resolved || 0 
    },
    { 
      category: "Found Items", 
      total: statsData?.foundItems?.total || 0, 
      active: statsData?.foundItems?.active || 0, 
      police_uploads: statsData?.foundItems?.policeUploads || 0 
    },
    { 
      category: "Users", 
      total: statsData?.users?.total || 0, 
      losers: statsData?.users?.losers || 0, 
      finders: statsData?.users?.finders || 0, 
      police: statsData?.users?.police || 0,
      admins: statsData?.users?.admins || 0
    },
    { 
      category: "Matches", 
      total: statsData?.matches?.total || 0, 
      pending: statsData?.matches?.pending || 0, 
      confirmed: statsData?.matches?.confirmed || 0, 
      completed: statsData?.matches?.completed || 0 
    },
  ];

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-purple-900">System Statistics</h1>
          <p className="text-purple-700 mt-2">Comprehensive analytics and system metrics</p>
        </div>
        <button 
          onClick={fetchStats}
          className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold py-2 px-4 rounded-lg transition"
        >
          🔄 Refresh Data
        </button>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid md:grid-cols-2 gap-6">
        {displayStats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-6">
            <h3 className="text-xl font-bold text-purple-900 mb-4">{stat.category}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">{stat.total}</p>
                <p className="text-xs text-gray-600 mt-1">Total</p>
              </div>
              {Object.entries(stat).map(([key, value]) => 
                key !== 'category' && key !== 'total' ? (
                  <div key={key} className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-xl font-bold text-purple-600">{value}</p>
                    <p className="text-xs text-gray-600 mt-1">{key.replace('_', ' ').charAt(0).toUpperCase() + key.replace('_', ' ').slice(1)}</p>
                  </div>
                ) : null
              )}
            </div>
          </div>
        ))}
      </div>

      {/* REWARD STATS */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl shadow-lg border-2 border-yellow-200 p-6">
         <h3 className="text-xl font-bold text-yellow-900 mb-4">Financial Overview (Rewards)</h3>
         <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 text-sm">Total Rewards Offered</p>
              <p className="text-3xl font-bold text-yellow-600">
                {new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(statsData?.rewards?.totalOffered || 0)}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Rewards Paid</p>
              <p className="text-3xl font-bold text-green-600">
                {new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(statsData?.rewards?.totalPaid || 0)}
              </p>
            </div>
         </div>
      </div>

      {/* ACTIVITY CHART */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-8">
        <h2 className="text-2xl font-bold text-purple-900 mb-6">Weekly Activity (Simulated)</h2>
        <div className="flex items-end justify-around h-64 gap-2 px-4">
          {chartData.weekly.map((value, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1">
              <div className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all duration-500" style={{height: `${(value / 72) * 100}%`}}></div>
              <p className="text-xs text-gray-600 mt-2">{chartData.days[idx]}</p>
              <p className="text-sm font-bold text-purple-600">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PERFORMANCE METRICS */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-300 shadow-lg">
          <h3 className="font-bold text-green-900 mb-4">System Uptime</h3>
          <p className="text-4xl font-bold text-green-600">99.9%</p>
          <p className="text-sm text-green-700 mt-2">Excellent performance</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-300 shadow-lg">
          <h3 className="font-bold text-blue-900 mb-4">Avg Response Time</h3>
          <p className="text-4xl font-bold text-blue-600">245ms</p>
          <p className="text-sm text-blue-700 mt-2">Fast and responsive</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border-2 border-yellow-300 shadow-lg">
          <h3 className="font-bold text-yellow-900 mb-4">Database Size</h3>
          <p className="text-4xl font-bold text-yellow-600">2.4 GB</p>
          <p className="text-sm text-yellow-700 mt-2">Healthy database</p>
        </div>
      </div>
    </div>
  );
}