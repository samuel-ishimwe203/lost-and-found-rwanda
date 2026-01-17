import React, { useState } from "react";

export default function AdminHome() {
  const [stats] = useState([
    { label: "Total Lost Items", value: 145, icon: "📋", color: "text-green-600" },
    { label: "Total Found Items", value: 89, icon: "📦", color: "text-blue-600" },
    { label: "Matched Items", value: 34, icon: "✅", color: "text-yellow-600" },
    { label: "Active Users", value: 328, icon: "👥", color: "text-purple-600" },
  ]);

  const [systemStatus] = useState([
    { name: "Database", status: "healthy", uptime: "99.9%" },
    { name: "API Server", status: "healthy", uptime: "99.8%" },
    { name: "Notifications", status: "healthy", uptime: "99.7%" },
    { name: "Search Index", status: "healthy", uptime: "100%" },
  ]);

  const [recentActivities] = useState([
    { id: 1, action: "New Lost Item Posted", user: "John Doe", time: "2 mins ago" },
    { id: 2, action: "Found Item Matched", user: "Jane Smith", time: "15 mins ago" },
    { id: 3, action: "Police Upload", user: "Police Station 01", time: "1 hour ago" },
    { id: 4, action: "User Registered", user: "New User", time: "2 hours ago" },
  ]);

  return (
    <div className="space-y-8">
      {/* WELCOME BANNER */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-8 rounded-2xl border border-green-300 shadow-lg">
        <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-green-100 text-lg">System Overview & Control Center</p>
      </div>

      {/* STATS GRID */}
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white text-gray-900 p-6 rounded-xl shadow-lg border border-green-200 hover:shadow-xl hover:border-green-300 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-4xl font-bold text-green-600">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-2">{stat.label}</p>
              </div>
              <span className="text-4xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* SYSTEM STATUS */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-200">
        <h2 className="text-2xl font-bold text-green-900 mb-6">System Status</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemStatus.map((system, idx) => (
            <div key={idx} className="border border-green-200 rounded-lg p-4 bg-green-50">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-gray-900">{system.name}</p>
                <span className={`w-3 h-3 rounded-full ${system.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              </div>
              <p className="text-xs text-gray-600">Uptime: {system.uptime}</p>
              <p className={`text-sm font-bold mt-2 ${system.status === 'healthy' ? 'text-green-600' : 'text-yellow-600'}`}>
                {system.status.charAt(0).toUpperCase() + system.status.slice(1)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-200">
        <h2 className="text-2xl font-bold text-green-900 mb-6">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition">
              <div>
                <p className="font-semibold text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-600">by {activity.user}</p>
              </div>
              <span className="text-xs text-green-600 font-semibold">{activity.time}</span>
            </div>
          ))}
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
