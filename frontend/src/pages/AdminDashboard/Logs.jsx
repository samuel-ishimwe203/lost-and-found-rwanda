import React, { useState } from "react";

export default function Logs() {
  const [logs] = useState([
    { id: 1, timestamp: "2024-01-15 10:45:23", action: "User Login", user: "john@example.com", status: "Success", details: "Lost user logged in" },
    { id: 2, timestamp: "2024-01-15 10:30:15", action: "Item Posted", user: "jane@example.com", status: "Success", details: "New found item posted" },
    { id: 3, timestamp: "2024-01-15 09:15:42", action: "Item Matched", user: "System", status: "Success", details: "Found item matched with lost posting" },
    { id: 4, timestamp: "2024-01-15 08:22:10", action: "User Registered", user: "new_user@example.com", status: "Success", details: "New found user registered" },
    { id: 5, timestamp: "2024-01-15 07:45:00", action: "Police Upload", user: "police01@example.com", status: "Success", details: "Police official item uploaded" },
  ]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-purple-900">Activity Logs</h1>
        <p className="text-purple-700 mt-2">System audit trail and activity history</p>
      </div>

      {/* LOGS TABLE */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">Timestamp</th>
              <th className="px-6 py-4 text-left font-semibold">Action</th>
              <th className="px-6 py-4 text-left font-semibold">User</th>
              <th className="px-6 py-4 text-left font-semibold">Status</th>
              <th className="px-6 py-4 text-left font-semibold">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-purple-50 transition text-sm">
                <td className="px-6 py-4 font-semibold text-gray-900">{log.timestamp}</td>
                <td className="px-6 py-4 text-gray-600">{log.action}</td>
                <td className="px-6 py-4 text-gray-600">{log.user}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    {log.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
