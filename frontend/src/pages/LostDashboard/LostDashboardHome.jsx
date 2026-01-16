import React, { useState } from "react";

export default function LostDashboardHome() {
  const [user] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+250788123456",
    location: "Kigali",
  });

  const [stats] = useState([
    { label: "Total Comments", value: 8 },
    { label: "Active Postings", value: 5 },
    { label: "Waiting Approval", value: 2 },
    { label: "Total Postings", value: 12 },
  ]);

  const [recentActivity] = useState([
    {
      id: 1,
      type: "match_found",
      title: "Potential Match Found",
      description: "Someone found a National ID Card similar to yours",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      type: "posting_active",
      title: "Posting Activated",
      description: "Your Rwandan Passport posting is now active",
      timestamp: "1 day ago",
    },
    {
      id: 3,
      type: "item_recovered",
      title: "Item Recovered",
      description: "Your Driving License has been recovered successfully",
      timestamp: "3 days ago",
    },
  ]);

  return (
    <div className="space-y-8">
      {/* WELCOME MESSAGE */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 rounded-2xl border border-green-300 shadow-lg">
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome back, {user.firstName} {user.lastName}!
        </h1>
        <p className="text-green-100 text-lg">
          Manage your lost item postings and track potential matches
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white text-green-900 p-6 rounded-xl shadow-lg border border-green-200 hover:shadow-xl hover:border-green-300 transition">
            <p className="text-3xl font-bold text-green-600">{stat.value}</p>
            <p className="text-sm text-green-600 mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-200">
        <h2 className="text-2xl font-bold text-green-900 mb-6">Recent Activity</h2>

        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="border-l-4 border-green-500 pl-6 py-4 bg-green-50 rounded-r-lg hover:bg-green-100 transition">
              <p className="font-semibold text-green-900">{activity.title}</p>
              <p className="text-green-700 text-sm mt-1">{activity.description}</p>
              <p className="text-green-600 text-xs mt-2">{activity.timestamp}</p>
            </div>
          ))}
        </div>
      </div>

      {/* USER INFO CARD */}
      <div className="bg-gradient-to-br from-green-700 to-emerald-800 p-8 rounded-2xl shadow-lg border border-green-400/30">
        <h2 className="text-2xl font-bold text-white mb-6">Your Profile Summary</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 font-semibold">Full Name</p>
            <p className="text-lg font-semibold text-green-900 mt-1">{user.firstName} {user.lastName}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 font-semibold">Email</p>
            <p className="text-lg font-semibold text-green-900 mt-1">{user.email}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 font-semibold">Phone</p>
            <p className="text-lg font-semibold text-green-900 mt-1">{user.phone}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 font-semibold">Location</p>
            <p className="text-lg font-semibold text-green-900 mt-1">{user.location}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
