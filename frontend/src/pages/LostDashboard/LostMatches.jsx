
import React, { useState, useEffect } from 'react'
import { 
  FiFileText, FiMapPin, FiCalendar, FiTag, FiDollarSign, FiInfo, 
  FiExternalLink, FiClock, FiShield, FiUser, FiPhone, FiMail, FiAlertCircle,
  FiCheckCircle, FiMessageSquare, FiEye, FiTrash2, FiSearch
} from "react-icons/fi"
// Removing Lu icons and using Fi for better stability
const LuMessageSquare = FiMessageSquare;
const LuCheckCircle2 = FiCheckCircle;
const LuEye = FiEye;
const LuSearch = FiSearch;
import apiClient from "../../services/api"
import SendMessageModal from "../../components/SendMessageModal"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const BACKEND_URL = API_URL.replace(/\/api\/?$/, '');

export default function LostMatches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingMatch, setUpdatingMatch] = useState(null)
  const [messageModalOpen, setMessageModalOpen] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [viewingMatch, setViewingMatch] = useState(null)

  useEffect(() => { fetchMatches() }, [])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/matches')
      console.log('API RESPONSE [matches]:', response.data);
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

  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm('Are you sure you want to dismiss this match? It will be removed from your list.')) { return }
    try {
      setUpdatingMatch(matchId)
      await apiClient.delete(`/matches/${matchId}`)
      await fetchMatches()
    } catch (err) {
      alert('❌ Failed to dismiss match: ' + (err.response?.data?.message || err.message))
    } finally {
      setUpdatingMatch(null)
    }
  }

  const getStatusLabel = (status) => {
    const map = { pending: 'Pending Contact', confirmed: 'In Contact', completed: 'Successful Recovery', rejected: 'Not a Match' }
    return map[status] || status
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-green-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Scanning for matches...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-red-100">
        <div className="bg-red-500 p-8 text-center text-white">
          <FiAlertCircle className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-black">Connection Error</h2>
        </div>
        <div className="p-8 text-center">
          <p className="text-slate-600 mb-8">{error}</p>
          <button 
            onClick={fetchMatches}
            className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="bg-white rounded-[40px] shadow-2xl p-16 text-center border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
          <div className="relative z-10">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-12 transition-transform hover:rotate-0">
              <LuEye className="w-12 h-12" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-4">No Matches Yet</h3>
            <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
              Our matching engine is constantly scanning new reports. We'll alert you the moment we find a potential connection to your lost items.
            </p>
            <div className="mt-10 flex justify-center gap-4">
               <div className="px-6 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-widest">
                 System: Active
               </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Group matches by lost_item_id
  const groupedMatches = matches.reduce((acc, match) => {
    const itemId = match.lost_item_id
    if (!acc[itemId]) {
      acc[itemId] = {
        item_type: match.lost_item_type,
        category: match.lost_category,
        district: match.lost_district,
        items: []
      }
    }
    acc[itemId].items.push(match)
    return acc
  }, {})

  return (
    <div className="max-w-6xl mx-auto px-6 pb-20">
      <div className="flex items-end justify-between mb-12">
        <div>
          <span className="inline-block px-4 py-1 rounded-full bg-green-100 text-green-700 text-xs font-black uppercase tracking-widest mb-4">
            Matching Intelligence
          </span>
          <h1 className="text-5xl font-black text-slate-900 leading-tight">Potential Matches</h1>
          <p className="text-slate-500 text-lg mt-2">Highly relevant items discovered by our neural scanner.</p>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100 text-center min-w-[120px]">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Total Hits</p>
           <p className="text-3xl font-black text-green-600">{matches.length}</p>
        </div>
      </div>

      <div className="space-y-16">
        {Object.entries(groupedMatches).map(([itemId, group]) => (
          <div key={itemId} className="space-y-8">
            {/* Group Header */}
            <div className="flex items-center gap-6 pb-4 border-b-2 border-slate-100">
               <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl">
                  <FiTag />
               </div>
               <div>
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Matches For Your Posting</p>
                    <span className="px-3 py-0.5 bg-green-100 text-green-700 rounded-full text-[9px] font-black">
                      {group.items.length} HITS
                    </span>
                  </div>
                  <h2 className="text-3xl font-black text-slate-900">{group.item_type} <span className="text-slate-300 font-medium font-serif italic ml-2">in {group.district}</span></h2>
               </div>
            </div>

            {/* Matches in this group */}
            <div className="grid gap-8">
              {group.items.map((match) => (
                <div 
                  key={match.id} 
                  className="group relative bg-white rounded-[32px] border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row h-full">
                    {/* Image Section */}
                    <div className="md:w-72 h-64 md:h-auto relative overflow-hidden bg-slate-100">
                      {match.found_image_url ? (
                        <img 
                          src={`${BACKEND_URL}${match.found_image_url}`} 
                          alt={match.found_item_type}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                          <FiFileText className="w-16 h-16" />
                          <span className="text-[10px] font-bold uppercase tracking-widest mt-2">No Image available</span>
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <div className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-black text-slate-900 uppercase tracking-widest shadow-lg">
                          {match.found_category}
                        </div>
                      </div>
                      <div className="absolute bottom-4 right-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-md ${
                          match.match_score >= 80 ? 'bg-green-500/90 text-white' : 'bg-amber-500/90 text-white'
                        }`}>
                          <div className="text-center">
                            <p className="text-lg font-black leading-none">{Math.round(match.match_score)}%</p>
                            <p className="text-[8px] font-black uppercase opacity-60">Score</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-8 flex flex-col">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-3xl font-black text-slate-900 group-hover:text-green-600 transition-colors uppercase tracking-tight">{match.found_item_type}</h3>
                          <div className="flex items-center gap-4 mt-2 text-slate-400 text-sm font-semibold">
                             <span className="flex items-center gap-1"><FiMapPin /> {match.found_district}</span>
                             <span className="flex items-center gap-1"><FiClock /> {new Date(match.matched_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          match.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' : 
                          match.status === 'confirmed' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {getStatusLabel(match.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Found Item</p>
                          <p className="text-sm font-bold text-slate-700 truncate">{match.found_item_type}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Matches Your Post</p>
                          <p className="text-sm font-bold text-slate-700 truncate">{match.lost_item_type}</p>
                        </div>
                      </div>

                      <div className="mt-auto flex flex-wrap gap-4">
                         <button
                          onClick={() => handleContactFinder(match)}
                          className="flex-1 min-w-[160px] py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition shadow-lg flex items-center justify-center gap-2 group/btn"
                        >
                          <LuMessageSquare className="w-4 h-4 transition-transform group-hover/btn:-translate-y-0.5" />
                          Contact Finder
                        </button>
                        {match.status !== 'completed' && (
                          <button
                            onClick={() => handleMarkReceived(match.id)}
                            disabled={updatingMatch === match.id}
                            className="px-8 py-4 bg-green-500 text-white rounded-2xl font-black text-sm hover:bg-green-600 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {updatingMatch === match.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                            ) : (
                              <LuCheckCircle2 className="w-4 h-4" />
                            )}
                            I Got It Back
                          </button>
                        )}
                        <button 
                          onClick={() => { setViewingMatch(match); setIsDetailModalOpen(true); }}
                          className="w-12 h-14 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition"
                          title="View Full Details"
                        >
                          <LuEye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteMatch(match.id)}
                          disabled={updatingMatch === match.id}
                          className="w-12 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition disabled:opacity-50"
                          title="Dismiss Match"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal (Same logic as DocumentUpload) */}
      {isDetailModalOpen && viewingMatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl" onClick={() => setIsDetailModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition"
            >
              <FiX className="text-2xl" />
            </button>

            {/* Left: Image */}
            <div className="md:w-1/2 bg-slate-950 flex items-center justify-center p-12 overflow-y-auto">
               <div className="w-full">
                  {viewingMatch.found_image_url ? (
                    <img
                      src={`${BACKEND_URL}${viewingMatch.found_image_url}`}
                      alt={viewingMatch.found_item_type}
                      className="w-full rounded-2xl shadow-2xl border-4 border-white/10 object-contain"
                    />
                  ) : (
                    <div className="text-slate-700 text-center">
                       <FiFileText className="w-32 h-32 mx-auto opacity-20" />
                       <p className="mt-4 font-black uppercase tracking-widest text-xs opacity-40">No preview available</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Right: Details */}
            <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto space-y-8 bg-white">
               <div>
                  <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-black bg-green-50 text-green-700 uppercase tracking-widest border border-green-100 mb-4">
                    Match Confidence: {viewingMatch.match_score}%
                  </span>
                  <h2 className="text-3xl font-black text-slate-900 leading-tight">Match Details</h2>
                  <p className="text-slate-400 text-sm mt-2 flex items-center gap-2 font-bold">
                    <FiCalendar /> Detected on {new Date(viewingMatch.matched_at).toLocaleDateString()}
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1"><FiTag /> Category</p>
                    <p className="text-sm font-bold text-slate-800 capitalize">{viewingMatch.found_category}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1"><FiMapPin /> District</p>
                    <p className="text-sm font-bold text-slate-800">{viewingMatch.found_district}</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Finder Details</h4>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center">
                        <FiUser />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Registered Name</p>
                        <p className="text-sm font-bold text-slate-800">{viewingMatch.finder_name}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                         <FiPhone className="text-green-600" />
                         <span className="text-xs font-bold text-slate-700">{viewingMatch.finder_phone}</span>
                       </div>
                       <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 overflow-hidden">
                         <FiMail className="text-green-600 flex-shrink-0" />
                         <span className="text-xs font-bold text-slate-700 truncate">{viewingMatch.finder_email}</span>
                       </div>
                    </div>
                  </div>
               </div>

               {viewingMatch.found_text && (
                 <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Deep Scan Insights (OCR)</h4>
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                      <p className="text-slate-700 text-sm italic font-serif leading-relaxed">"{viewingMatch.found_text}"</p>
                    </div>
                 </div>
               )}

               <div className="pt-6">
                 <button
                    onClick={() => handleContactFinder(viewingMatch)}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-900/20 hover:-translate-y-1 transition duration-300"
                  >
                    Start Secure Conversation
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

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

function FiX({ className }) {
  return (
    <svg className={className} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  );
}