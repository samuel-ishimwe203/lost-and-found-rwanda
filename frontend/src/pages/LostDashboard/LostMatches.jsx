import React, { useState, useEffect } from 'react'
import { CheckCircle, FileText, MapPin, User, AlertCircle, MessageCircle, CheckCircle2 } from "lucide-react"
import apiClient from "../../services/api"
import SendMessageModal from "../../components/SendMessageModal"

export default function LostMatches() {
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

  const handleContactFinder = (match) => {
    const itemData = {
      id: match.found_item_id,
      item_type: match.found_item_type,
      category: match.found_category,
      district: match.found_district,
      contact_name: match.finder_name,
      contact_phone: match.finder_phone,
      user_id: match.finder_id,
      item_source: 'found'
    }
    setSelectedMatch(itemData)
    setMessageModalOpen(true)
  }

  const handleMarkReceived = async (matchId) => {
    if (!window.confirm('Are you sure you want to confirm that you received your item back?')) { return }
    try {
      setUpdatingMatch(matchId)
      await apiClient.put(`/matches/${matchId}/complete`, { notes: 'Item received by owner' })
      await fetchMatches()
      alert('✅ Item marked as received successfully!')
    } catch (err) {
      alert('❌ Failed to mark item as received: ' + (err.response?.data?.message || err.message))
    } finally {
      setUpdatingMatch(null)
    }
  }

  const getStatusLabel = (status) => {
    const map = { pending: 'Pending Contact', confirmed: 'In Contact', completed: 'Received', rejected: 'Not a Match' }
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
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

  if (matches.length === 0) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-xl p-12 text-center">
        <div className="mb-6">
          <FileText className="w-24 h-24 mx-auto text-red-300" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">No Matches Yet</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          We haven't found any items matching your lost reports yet. We'll notify you as soon as someone reports finding something similar!
        </p>
      </div>
    )
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
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
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
                      <MapPin className="w-4 h-4 mr-1" />
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
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 text-lg flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
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
                    <User className="w-5 h-5 mr-2 text-blue-600" />
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
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleContactFinder(match)}
                  className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white py-3 px-6 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
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
                        <CheckCircle2 className="w-5 h-5 mr-2" />
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
      {messageModalOpen && selectedMatch && (
        <SendMessageModal
          item={selectedMatch}
          isOpen={messageModalOpen}
          onClose={() => {
            setMessageModalOpen(false)
            setSelectedMatch(null)
          }}
        />
      )}
    </div>
  )
}