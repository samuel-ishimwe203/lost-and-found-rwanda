import React, { useState } from "react";

export default function ManageItems() {
  const [items] = useState([
    { id: 1, name: "National ID Card", type: "Lost", location: "Kigali", status: "matched", date: "2024-01-15", owner: "John Doe" },
    { id: 2, name: "Rwandan Passport", type: "Found", location: "Kigali", status: "pending", date: "2024-01-14", owner: "Jane Smith" },
    { id: 3, name: "Wedding Ring", type: "Found", location: "Kigali", status: "matched", date: "2024-01-13", owner: "Marie Uwimana" },
    { id: 4, name: "Driving License", type: "Lost", location: "Kampala", status: "active", date: "2024-01-12", owner: "Paul Rwandan" },
  ]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-purple-900">Manage Items</h1>
        <p className="text-purple-700 mt-2">View and manage all lost and found items</p>
      </div>

      {/* FILTERS */}
      <div className="flex gap-4 flex-wrap">
        {["all", "lost", "found", "matched", "pending"].map((filter) => (
          <button key={filter} className="px-4 py-2 rounded-lg font-semibold transition bg-white text-purple-600 border-2 border-purple-300 hover:bg-purple-50">
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* ITEMS TABLE */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">Item Name</th>
              <th className="px-6 py-4 text-left font-semibold">Type</th>
              <th className="px-6 py-4 text-left font-semibold">Location</th>
              <th className="px-6 py-4 text-left font-semibold">Status</th>
              <th className="px-6 py-4 text-left font-semibold">Owner</th>
              <th className="px-6 py-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-purple-50 transition">
                <td className="px-6 py-4 font-semibold text-gray-900">{item.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    item.type === "Lost" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{item.location}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    item.status === "matched" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{item.owner}</td>
                <td className="px-6 py-4">
                  <button className="text-purple-600 hover:text-purple-800 font-semibold text-sm">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
