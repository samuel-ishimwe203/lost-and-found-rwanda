import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";

export default function MyPostings() {
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchPostings();
  }, []);

  const fetchPostings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.get('/lost-items/my/items');
      const items = response.data.data?.lostItems || [];
      setPostings(items);
    } catch (error) {
      console.error('Error fetching postings:', error);
      setError(error.response?.data?.message || 'Failed to load postings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this posting?')) {
      return;
    }
    
    try {
      await apiClient.delete(`/lost-items/${id}`);
      setPostings(postings.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting posting:', error);
      alert(error.response?.data?.message || 'Failed to delete posting');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatReward = (amount) => {
    if (!amount || amount === 0) return 'No reward';
    return `${Number(amount).toLocaleString()} RWF`;
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'active': 'Active',
      'pending': 'Pending',
      'found': 'Found',
      'returned': 'Resolved',
      'expired': 'Expired'
    };
    return statusMap[status?.toLowerCase()] || status;
  };

  const getLocationDisplay = (item) => {
    return `${item.location_lost}${item.district ? ' - ' + item.district : ''}`;
  };

  const getAdditionalInfo = (item) => {
    try {
      return item.additional_info ? JSON.parse(item.additional_info) : {};
    } catch {
      return {};
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-green-700 mt-4">Loading your postings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-bold text-green-900">My Postings</h1>
        <p className="text-green-700 mt-2">
          View and manage all your lost item postings ({postings.length} total)
        </p>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* EMPTY STATE */}
      {postings.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-green-200">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-2xl font-bold text-green-900 mb-2">No Postings Yet</h3>
          <p className="text-green-700 mb-6">You haven't posted any lost items yet.</p>
          <a
            href="/lost-dashboard/create-post"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Create Your First Posting
          </a>
        </div>
      )}

      {/* POSTINGS TABLE */}
      {postings.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto border border-green-200">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-700 to-emerald-800 border-b border-green-300">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                  Item Title
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                  Date Posted
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                  Reward
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                  Matches
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-100">
              {postings.map((posting) => {
                const additionalInfo = getAdditionalInfo(posting);
                return (
                  <tr key={posting.id} className="hover:bg-green-50 transition">
                    <td className="px-6 py-4 text-green-900 font-medium">
                      {posting.item_type}
                    </td>
                    <td className="px-6 py-4 text-green-700">{posting.category}</td>
                    <td className="px-6 py-4 text-green-700 text-sm">{getLocationDisplay(posting)}</td>
                    <td className="px-6 py-4 text-green-700 text-sm">{formatDate(posting.created_at)}</td>
                    <td className="px-6 py-4 text-green-600 font-semibold">{formatReward(posting.reward_amount)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          posting.status === "active"
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : posting.status === "pending"
                            ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                            : "bg-gray-100 text-gray-700 border border-gray-300"
                        }`}
                      >
                        {getStatusLabel(posting.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-cyan-600 font-semibold bg-cyan-100 px-3 py-1 rounded border border-cyan-300">
                        {posting.match_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button 
                        onClick={() => window.location.href = `/lost-dashboard/postings/${posting.id}`}
                        className="text-green-600 hover:text-green-800 font-semibold"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => window.location.href = `/lost-dashboard/edit-post/${posting.id}`}
                        className="text-emerald-600 hover:text-emerald-800 font-semibold"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(posting.id)}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* POSTING DETAILS SECTION */}
      {postings.length > 0 && (
        <div className="grid md:grid-cols-1 gap-6">
          {postings.slice(0, 2).map((posting) => {
            const additionalInfo = getAdditionalInfo(posting);
            return (
              <div key={posting.id} className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl shadow-lg border-l-4 border-green-700">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-teal-900">{posting.item_type}</h3>
                    <p className="text-teal-700 text-sm mt-1">{posting.description || 'No description provided'}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-lg font-semibold ml-4 ${
                    posting.status === "active" 
                      ? "bg-green-100 text-green-700 border border-green-300" 
                      : posting.status === "pending"
                      ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                      : "bg-gray-100 text-gray-700 border border-gray-300"
                  }`}>
                    {getStatusLabel(posting.status)}
                  </span>
                </div>

                {/* Image Preview */}
                {posting.image_url && (
                  <div className="mb-4">
                    <img 
                      src={`http://localhost:3001${posting.image_url}`} 
                      alt={posting.item_type}
                      className="max-w-md max-h-64 rounded-lg border-2 border-teal-300 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-white p-3 rounded-lg border border-teal-200">
                    <p className="text-teal-600 font-semibold">Category</p>
                    <p className="font-semibold text-teal-900 mt-1">{posting.category}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-teal-200">
                    <p className="text-teal-600 font-semibold">Color</p>
                    <p className="font-semibold text-teal-900 mt-1">{additionalInfo.color || 'Not specified'}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-teal-200">
                    <p className="text-teal-600 font-semibold">Location Lost</p>
                    <p className="font-semibold text-teal-900 mt-1">{getLocationDisplay(posting)}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-teal-200">
                    <p className="text-teal-600 font-semibold">Date of Loss</p>
                    <p className="font-semibold text-teal-900 mt-1">{formatDate(posting.date_lost)}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-teal-200">
                    <p className="text-teal-600 font-semibold">Reward</p>
                    <p className="font-semibold text-teal-600 text-lg mt-1">{formatReward(posting.reward_amount)}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-teal-200">
                    <p className="text-teal-600 font-semibold">Posted</p>
                    <p className="font-semibold text-teal-900 mt-1">{formatDate(posting.created_at)}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-teal-200">
                    <p className="text-teal-600 font-semibold">Potential Matches</p>
                    <p className="font-semibold text-cyan-600 text-lg mt-1">{posting.match_count || 0}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-teal-200">
                    <p className="text-teal-600 font-semibold">ID</p>
                    <p className="font-semibold text-teal-900 mt-1">#{posting.id}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
