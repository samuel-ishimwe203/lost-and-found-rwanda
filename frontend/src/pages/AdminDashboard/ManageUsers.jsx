import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/users");
      setUsers(response.data.data.users || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) return;
    
    try {
      await apiClient.put(`/admin/users/${userId}`, {
        is_active: !currentStatus
      });
      // Refresh the user list after updating
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-xl text-purple-600 font-semibold animate-pulse">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-purple-900">Manage Users</h1>
          <p className="text-purple-700 mt-2">View and manage user accounts</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition shadow-lg">
          + Create Admin Account
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* USERS TABLE */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 overflow-hidden">
        <div className="overflow-x-auto">
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
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No users found in the system.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-purple-50 transition">
                    <td className="px-6 py-4 font-semibold text-gray-900">{user.full_name}</td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        user.role === "lost_user" ? "bg-green-100 text-green-800 border border-green-200" :
                        user.role === "found_user" ? "bg-blue-100 text-blue-800 border border-blue-200" :
                        user.role === "admin" ? "bg-purple-100 text-purple-800 border border-purple-200" :
                        "bg-red-100 text-red-800 border border-red-200"
                      }`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        user.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleStatus(user.id, user.is_active)}
                        className={`font-semibold text-sm transition ${
                          user.is_active 
                            ? "text-red-600 hover:text-red-800" 
                            : "text-green-600 hover:text-green-800"
                        }`}
                      >
                        {user.is_active ? "Deactivate" : "Activate"}
                      </button>
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