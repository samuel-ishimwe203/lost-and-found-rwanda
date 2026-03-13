import React, { useState, useEffect } from "react"
import apiClient from "../../services/api"
import SendMessageModal from "../../components/SendMessageModal"
import { AlertCircle, Lightbulb } from "lucide-react"

export default function FoundMatches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingMatch, setUpdatingMatch] = useState(null)
  const [messageModalOpen, setMessageModalOpen] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState(null)

  useEffect(() => { fetchMatches() }, [])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/matches')
      setMatches(response.data.data.matches || [])
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load matches')
    } finally {
      setLoading(false)
    }
  }

  const handleContactOwner = (match) => {
    const itemData = {
      id: match.lost_item_id,
      item_type: match.lost_item_type,
      category: match.lost_category,
      district: match.lost_district,
      contact_name: match.loser_name,
      contact_phone: match.loser_phone,
      user_id: match.loser_id,
      item_source: 'lost'
    }
    setSelectedMatch(itemData)
    setMessageModalOpen(true)
  }

  const handleMarkReturned = async (matchId) => {
    if (!window.confirm('Are you sure you want to mark this item as returned to the owner?')) { return }
    try {
      setUpdatingMatch(matchId)
      await apiClient.put(`/matches/${matchId}/complete`, { notes: 'Item returned to owner' })
      await fetchMatches()
      alert('✅ Item marked as returned successfully!')
    } catch (err) {
      alert('❌ Failed to mark item as returned: ' + (err.response?.data?.message || err.message))
    } finally {
      setUpdatingMatch(null)
    }
  }

  const getStatusLabel = (status) => {
    const map = { pending: 'Pending Contact', confirmed: 'Contacted', completed: 'Returned', rejected: 'Not a Match' }
    return map[status] || status
  }

  const statusStyles = {
    pending: "bg-orange-50 border-orange-200",
    confirmed: "bg-yellow-50 border-yellow-200",
    completed: "bg-green-50 border-green-200",
    rejected: "bg-gray-50 border-gray-200",
  }
  const statusBadgeStyles = {
    pending: "bg-orange-200 text-orange-800",
    confirmed: "bg-yellow-200 text-yellow-800",
    completed: "bg-green-200 text-green-800",
    rejected: "bg-gray-200 text-gray-800",
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading matches...</p>
      </div>
    </div>
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-center">
        <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
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
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-900">Potential Matches</h1>
        <div className="text-sm text-blue-600">Total Matches: <span className="font-bold">{matches.length}</span></div>
      </div>
      {matches.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Matches Found</h3>
          <p className="text-gray-500">
            You don't have any potential matches yet. Keep your found items active and we'll notify you when matches are found.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className={`rounded-xl shadow-lg border-2 p-6 transition hover:shadow-xl ${statusStyles[match.status] || statusStyles.pending}`}
            >
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900">
                    {match.found_item_type}
                  </h3>
                  <p className="text-gray-700 text-sm">
                    <span className="font-semibold">Found Item:</span>{" "}
                    {match.found_item_type}
                  </p>
                  <p className="text-gray-700 text-sm">
                    <span className="font-semibold">Lost Posting:</span>{" "}
                    {match.lost_item_type}
                  </p>
                  <p className="text-gray-700 text-sm">
                    <span className="font-semibold">Lost Date:</span>{" "}
                    {new Date(match.matched_at).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700 text-sm">
                    <span className="font-semibold">District:</span>{" "}
                    {match.lost_district}
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900">Lost Item Owner</h4>
                  <p className="text-gray-700 text-sm">
                    <span className="font-semibold">Name:</span> {match.loser_name}
                  </p>
                  <p className="text-gray-700 text-sm">
                    <span className="font-semibold">Phone:</span>{" "}
                    {match.loser_phone}
                  </p>
                  {match.reward_amount && match.reward_amount > 0 && (
                    <p className="text-gray-700 text-sm">
                      <span className="font-semibold">Reward:</span>{" "}
                      <span className="text-green-600 font-bold">{match.reward_amount.toLocaleString()} RWF</span>
                    </p>
                  )}
                  <p className="text-gray-700 text-sm">
                    <span className="font-semibold">Status:</span>{" "}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusBadgeStyles[match.status] || statusBadgeStyles.pending}`}
                    >
                      {getStatusLabel(match.status)}
                    </span>
                  </p>
                </div>
                <div className="flex flex-col justify-between items-end">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 shadow-lg">
                      <span className="text-white font-bold text-2xl">
                        {Math.round(match.match_score)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Match Score</p>
                  </div>
                  <div className="flex gap-2 w-full">
                    <button 
                      onClick={() => handleContactOwner(match)}
                      disabled={match.status === 'completed'}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-semibold transition text-sm"
                    >
                      Contact Owner
                    </button>
                    <button 
                      onClick={() => handleMarkReturned(match.id)}
                      disabled={match.status === 'completed' || updatingMatch === match.id}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-semibold transition text-sm"
                    >
                      {updatingMatch === match.id ? 'Updating...' : 'Mark Returned'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMatch && (
        <SendMessageModal
          isOpen={messageModalOpen}
          onClose={() => {
            setMessageModalOpen(false)
            setSelectedMatch(null)
          }}
          item={selectedMatch}
          isFoundItem={false}
        />
      )}
    </div>
  )
}