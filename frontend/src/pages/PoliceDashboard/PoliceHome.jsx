import React, { useState } from "react";

export default function PoliceHome() {
  const [stats] = useState([
    { label: "Items Uploaded", value: 24, icon: "📄", color: "text-red-600" },
    { label: "Claims Managed", value: 12, icon: "⚖️", color: "text-orange-600" },
    { label: "Items Returned", value: 8, icon: "✅", color: "text-green-600" },
    { label: "Pending Cases", value: 4, icon: "⏳", color: "text-yellow-600" },
  ]);

  const [recentActivities] = useState([
    { id: 1, action: "Document Uploaded", description: "National ID Card uploaded", time: "1 hour ago" },
    { id: 2, action: "Claim Processed", description: "Item returned to owner", time: "3 hours ago" },
    { id: 3, action: "Item Matched", description: "Lost item matched with officer", time: "1 day ago" },
    { id: 4, action: "Report Filed", description: "New police report filed", time: "2 days ago" },
  ]);

  return (
    <div className="space-y-8">
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
                <p className="text-4xl font-bold text-green-600">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-2">{stat.label}</p>
              </div>
              <span className="text-4xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-200">
        <h2 className="text-2xl font-bold text-green-900 mb-6">Recent Activity</h2>
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
        <div className="bg-gradient-to-br from-green-100 to-green-50 p-6 rounded-xl border-2 border-green-300 shadow-lg">
          <h3 className="text-lg font-bold text-green-900 mb-4">📤 Upload Official Item</h3>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition">
            Upload Document
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-100 to-green-50 p-6 rounded-xl border-2 border-green-300 shadow-lg">
          <h3 className="text-lg font-bold text-green-900 mb-4">📋 Manage Claims</h3>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition">
            View Claims
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
