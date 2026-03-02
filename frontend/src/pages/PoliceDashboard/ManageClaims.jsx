import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";

export default function ManageClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/police/claims');
      if (response.data.success) {
        setClaims(response.data.data.claims);
      }
    } catch (err) {
      console.error('Error fetching claims:', err);
      setError('Failed to load active matches/claims.');
    } finally {
      setLoading(false);
    }
  };

  const updateMatchStatus = async (matchId, newStatus) => {
    try {
      await apiClient.put(`/matches/${matchId}/status`, { status: newStatus });
      // Refresh the list after successful update
      fetchClaims();
      alert(`Claim marked as ${newStatus} successfully.`);
    } catch (err) {
      console.error('Error updating claim:', err);
      alert('Failed to update claim status.');
    }
  };

  if (loading) {
    return <div className="p-8 text-xl font-bold text-green-900 bg-yellow-100 min-h-screen">Loading pending matches...</div>;
  }

  return (
    <div className="space-y-6 bg-yellow-100 p-4 min-h-screen">
      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-bold text-green-900">Manage AI Matches & Claims</h1>
        <p className="text-green-700 mt-2">Process and verify ownership claims for found items currently at your station</p>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-xl border border-red-300 font-bold">{error}</div>}

      {/* CLAIMS TABLE */}
      <div className="bg-white rounded-2xl shadow-lg border border-green-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">Item Details</th>
              <th className="px-6 py-4 text-left font-semibold">Claimant (Loser)</th>
              <th className="px-6 py-4 text-left font-semibold">Contact</th>
              <th className="px-6 py-4 text-left font-semibold">AI Match Score</th>
              <th className="px-6 py-4 text-left font-semibold">Status</th>
              <th className="px-6 py-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-green-200">
            {claims.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500 font-semibold">
                  No active matches or claims found.
                </td>
              </tr>
            ) : (
              claims.map((claim) => (
                <tr key={claim.id} className="hover:bg-green-50 transition">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{claim.found_item_type}</p>
                    <p className="text-xs text-gray-500">Location: {claim.location_found}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-800 font-medium">{claim.claimer_name}</td>
                  <td className="px-6 py-4 text-gray-600">{claim.claimer_phone}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold border border-blue-300">
                      {claim.match_score}% Match
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                        claim.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                          : claim.status === "completed"
                          ? "bg-green-100 text-green-800 border-green-300"
                          : claim.status === "confirmed"
                          ? "bg-blue-100 text-blue-800 border-blue-300"
                          : "bg-red-100 text-red-800 border-red-300"
                      }`}
                    >
                      {claim.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {claim.status === "pending" || claim.status === "confirmed" ? (
                      <div className="flex gap-3">
                        <button 
                          onClick={() => updateMatchStatus(claim.id, 'completed')}
                          className="bg-green-600 text-white hover:bg-green-700 px-3 py-1 rounded shadow-sm font-semibold text-sm transition"
                        >
                          Mark Returned
                        </button>
                        <button 
                          onClick={() => updateMatchStatus(claim.id, 'rejected')}
                          className="bg-red-600 text-white hover:bg-red-700 px-3 py-1 rounded shadow-sm font-semibold text-sm transition"
                        >
                          Reject Match
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm font-semibold italic">Processed</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}