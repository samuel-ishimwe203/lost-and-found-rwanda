import React, { useState } from "react";

export default function ManageUsers() {
  const [users] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", role: "lost_user", status: "active", joined: "2024-01-01" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "found_user", status: "active", joined: "2024-01-02" },
    { id: 3, name: "Marie Uwimana", email: "marie@example.com", role: "found_user", status: "active", joined: "2024-01-03" },
    { id: 4, name: "Police Station 01", email: "police01@example.com", role: "police", status: "active", joined: "2024-01-01" },
  ]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-purple-900">Manage Users</h1>
          <p className="text-purple-700 mt-2">View and manage user accounts</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition">
          Create Admin Account
        </button>
      </div>

      {/* USERS TABLE */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">Name</th>
              <th className="px-6 py-4 text-left font-semibold">Email</th>
              <th className="px-6 py-4 text-left font-semibold">Role</th>
              <th className="px-6 py-4 text-left font-semibold">Status</th>
              <th className="px-6 py-4 text-left font-semibold">Joined</th>
              <th className="px-6 py-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-purple-50 transition">
                <td className="px-6 py-4 font-semibold text-gray-900">{user.name}</td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    user.role === "lost_user" ? "bg-green-100 text-green-800" :
                    user.role === "found_user" ? "bg-blue-100 text-blue-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {user.role === "lost_user" ? "Lost User" : user.role === "found_user" ? "Found User" : "Police"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">Active</span>
                </td>
                <td className="px-6 py-4 text-gray-600">{user.joined}</td>
                <td className="px-6 py-4">
                  <button className="text-purple-600 hover:text-purple-800 font-semibold text-sm">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
