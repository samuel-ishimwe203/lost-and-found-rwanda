import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/logs");
      setLogs(response.data.data.logs || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch activity logs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-xl text-purple-600 font-semibold animate-pulse">Loading system logs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-purple-900">Activity Logs</h1>
          <p className="text-purple-700 mt-2">System audit trail and activity history</p>
        </div>
        <button 
          onClick={fetchLogs} 
          className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold py-2 px-4 rounded-lg transition"
        >
          ↻ Refresh Logs
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* LOGS TABLE */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Timestamp</th>
                <th className="px-6 py-4 text-left font-semibold">Action</th>
                <th className="px-6 py-4 text-left font-semibold">User</th>
                <th className="px-6 py-4 text-left font-semibold">Entity Type</th>
                <th className="px-6 py-4 text-left font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No activity logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-purple-50 transition text-sm">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-800">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <p className="font-semibold">{log.user_name || "Unknown User"}</p>
                      <p className="text-xs text-gray-500">{log.user_email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 uppercase text-xs font-bold">
                      {log.entity_type}
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}