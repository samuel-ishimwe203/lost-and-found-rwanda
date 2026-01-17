import React, { useState } from "react";

export default function SystemStats() {
  const [stats] = useState([
    { category: "Lost Items", total: 145, active: 98, matched: 34, pending: 13 },
    { category: "Found Items", total: 89, active: 45, matched: 34, pending: 10 },
    { category: "Users", total: 328, lost_users: 165, found_users: 148, police: 15 },
    { category: "Matches", total: 34, successful: 28, pending: 6, failed: 0 },
  ]);

  const [chartData] = useState({
    weekly: [45, 52, 48, 61, 55, 67, 72],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  });

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-purple-900">System Statistics</h1>
        <p className="text-purple-700 mt-2">Comprehensive analytics and system metrics</p>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid md:grid-cols-2 gap-6">
        {stats.map((stat, idx) => (
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
                    <p className="text-xs text-gray-600 mt-1">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                  </div>
                ) : null
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ACTIVITY CHART */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-8">
        <h2 className="text-2xl font-bold text-purple-900 mb-6">Weekly Activity</h2>
        <div className="flex items-end justify-around h-64 gap-2 px-4">
          {chartData.weekly.map((value, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1">
              <div className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg" style={{height: `${(value / 72) * 100}%`}}></div>
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
