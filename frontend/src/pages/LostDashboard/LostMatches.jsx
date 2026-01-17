import React, { useState, useEffect } from 'react'
import apiClient from "../../services/api";
import SendMessageModal from "../../components/SendMessageModal";

export default function LostMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingMatch, setUpdatingMatch] = useState(null);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/matches');
      setMatches(response.data.data.matches || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError(err.response?.data?.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const handleContactFinder = (match) => {
    // Open message modal with the finder info
    const itemData = {
      id: match.found_item_id,
      item_type: match.found_item_type,
      category: match.found_category,
      district: match.found_district,
      contact_name: match.finder_name,
      contact_phone: match.finder_phone,
      user_id: match.finder_id,
      item_source: 'found'
    };
    setSelectedMatch(itemData);
    setMessageModalOpen(true);
  };

  const handleMarkReceived = async (matchId) => {
    if (!window.confirm('Are you sure you want to confirm that you received your item back?')) {
      return;
    }

    try {
      setUpdatingMatch(matchId);
      await apiClient.put(`/matches/${matchId}/complete`, {
        notes: 'Item received by owner'
      });
      
      // Refresh matches
      await fetchMatches();
      alert('✅ Item marked as received successfully!');
    } catch (err) {
      console.error('Error marking as received:', err);
      alert('❌ Failed to mark item as received: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingMatch(null);
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'pending': 'Pending Contact',
      'confirmed': 'In Contact',
      'completed': 'Received',
      'rejected': 'Not a Match'
    };
    return statusMap[status] || status;
  };

  const statusStyles = {
    pending: "bg-orange-50 border-orange-200",
    confirmed: "bg-yellow-50 border-yellow-200",
    completed: "bg-green-50 border-green-200",
    rejected: "bg-gray-50 border-gray-200",
  };

  const statusBadgeStyles = {
    pending: "bg-orange-200 text-orange-800",
    confirmed: "bg-yellow-200 text-yellow-800",
    completed: "bg-green-200 text-green-800",
    rejected: "bg-gray-200 text-gray-800",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-red-800 font-semibold">Error Loading Matches</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
        <button 
          onClick={fetchMatches}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-xl p-12 text-center">
        <div className="mb-6">
          <svg className="w-24 h-24 mx-auto text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">No Matches Yet</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          We haven't found any items matching your lost reports yet. We'll notify you as soon as someone reports finding something similar!
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Potential Matches</h2>
        <p className="text-gray-600">Items that might match your lost reports</p>
      </div>

      <div className="grid gap-6">
        {matches.map((match) => (
          <div 
            key={match.id} 
            className={`bg-white rounded-xl border-2 shadow-md hover:shadow-lg transition-all overflow-hidden ${statusStyles[match.status]}`}
          >
            <div className="p-6">
              {/* Match Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  {/* Match Score Badge */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{match.match_score}</div>
                        <div className="text-xs text-white/80">Match</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{match.found_item_type}</h3>
                    <p className="text-gray-600 flex items-center mt-1">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {match.found_district}
                    </p>
                  </div>
                </div>

                <div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusBadgeStyles[match.status]}`}>
                    {getStatusLabel(match.status)}
                  </span>
                </div>
              </div>

              {/* Found Item Details */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 text-lg flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Found Item Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium text-gray-900">{match.found_category}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium text-gray-900">{match.found_district}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Date Found:</span>
                      <span className="font-medium text-gray-900">{new Date(match.found_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 text-lg flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Finder Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium text-gray-900">{match.finder_name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium text-gray-900">{match.finder_phone}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Match Score:</span>
                      <span className="font-bold text-red-600">{match.match_score}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleContactFinder(match)}
                  className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white py-3 px-6 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Contact Finder
                </button>

                {match.status !== 'completed' && (
                  <button
                    onClick={() => handleMarkReceived(match.id)}
                    disabled={updatingMatch === match.id}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {updatingMatch === match.id ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Mark as Received
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Send Message Modal */}
      {messageModalOpen && selectedMatch && (
        <SendMessageModal
          item={selectedMatch}
          isOpen={messageModalOpen}
          onClose={() => {
            setMessageModalOpen(false);
            setSelectedMatch(null);
          }}
        />
      )}
    </div>
  )
}
