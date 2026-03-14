
import React, { useState, useEffect } from "react"
import { 
  FiCalendar, FiMapPin, FiTag, FiDollarSign, FiInfo, FiExternalLink, 
  FiClock, FiShield, FiUser, FiPhone, FiMail, FiX, FiAlertCircle,
  FiCheckCircle, FiMessageSquare, FiEye, FiSearch, FiTrash2
} from "react-icons/fi"
// Consolidated Lu icons into Fi set for better stability
const LuMessageSquare = FiMessageSquare;
const LuCheckCircle2 = FiCheckCircle;
const LuEye = FiEye;
const LuSearch = FiSearch;
import apiClient from "../../services/api"
import SendMessageModal from "../../components/SendMessageModal"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const BACKEND_URL = API_URL.replace(/\/api\/?$/, '');

export default function FoundMatches() {
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
      console.log('DEBUG [FoundMatches] API Response:', response.data);
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

  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm('Are you sure you want to dismiss this potential owner? This match will be removed.')) { return }
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
    const map = { pending: 'Pending Contact', confirmed: 'Contact Established', completed: 'Returned to Owner', rejected: 'Not a Match' }
    return map[status] || status
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Finding owners...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-red-100">
        <div className="bg-blue-600 p-8 text-center text-white">
          <FiAlertCircle className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-black">Connection Lost</h2>
        </div>
        <div className="p-8 text-center">
          <p className="text-slate-600 mb-8">{error}</p>
          <button 
            onClick={fetchMatches}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition"
          >
            Reconnect
          </button>
        </div>
      </div>
    )
  }

  // Group matches by found_item_id
  const groupedMatches = matches.reduce((acc, match) => {
    const itemId = match.found_item_id
    if (!acc[itemId]) {
      acc[itemId] = {
        item_type: match.found_item_type,
        category: match.found_category,
        district: match.found_district,
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
          <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-widest mb-4">
            Neural Match Results
          </span>
          <h1 className="text-5xl font-black text-slate-900 leading-tight">Potential Owners</h1>
          <p className="text-slate-500 text-lg mt-2">People looking for the items you reported finding.</p>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100 text-center min-w-[120px]">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Total Hits</p>
           <p className="text-3xl font-black text-blue-600">{matches.length}</p>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="bg-white rounded-[40px] shadow-2xl p-16 text-center border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
          <LuSearch className="w-20 h-20 text-slate-200 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-slate-800 mb-3">No Active Matches</h3>
          <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
            We haven't found a safe match for your found items yet. Our system scans 24/7—you'll be the first to know!
          </p>
        </div>
      ) : (
        <div className="space-y-16">
          {Object.entries(groupedMatches).map(([itemId, group]) => (
            <div key={itemId} className="space-y-8">
              {/* Group Header */}
              <div className="flex items-center gap-6 pb-4 border-b-2 border-slate-100">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl">
                    <FiTag />
                </div>
                <div>
                    <div className="flex items-center gap-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Matches For Your Found Item</p>
                      <span className="px-3 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[9px] font-black">
                        {group.items.length} POTENTIAL OWNERS
                      </span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{group.item_type} <span className="text-slate-300 font-medium font-serif italic ml-2">in {group.district}</span></h2>
                </div>
              </div>

              {/* Individual Matches */}
              <div className="grid gap-8">
                {group.items.map((match) => (
                  <div
                    key={match.id}
                    className="group bg-white rounded-[32px] border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
                  >
                    <div className="flex flex-col lg:flex-row">
                      {/* Item Preview */}
                      <div className="lg:w-80 h-64 lg:h-auto relative overflow-hidden bg-slate-100">
                          {match.lost_image_url ? (
                            <img 
                              src={`${BACKEND_URL}${match.lost_image_url}`} 
                              alt={match.lost_item_type}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                              <LuSearch className="w-16 h-16 opacity-30" />
                              <span className="text-[8px] font-black uppercase mt-3">Reference Required</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                          <div className="absolute bottom-6 left-6">
                            <p className="text-white/60 text-[10px] font-black uppercase tracking-[2px]">Lost Post</p>
                            <h4 className="text-white text-xl font-black">{match.lost_item_type}</h4>
                          </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 p-8 lg:p-10 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                  <div className="flex items-center gap-3">
                                      <span className={`flex items-center justify-center w-12 h-12 rounded-2xl text-xl font-black shadow-lg ${
                                        match.match_score >= 80 ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'
                                      }`}>
                                        {Math.round(match.match_score)}%
                                      </span>
                                      <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-0.5">Confidence Level</p>
                                        <p className="text-lg font-black text-slate-800">High Match Potential</p>
                                      </div>
                                  </div>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                  match.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                  match.status === 'confirmed' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                  'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>
                                  {getStatusLabel(match.status)}
                                </span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <div className="space-y-4">
                                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 relative">
                                      <div className="p-2.5 bg-white rounded-xl text-blue-600 shadow-sm">
                                        <FiUser />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Possible Owner</p>
                                        <p className="text-sm font-bold text-slate-800 truncate">{match.loser_name}</p>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                      <div className="p-2.5 bg-white rounded-xl text-blue-600 shadow-sm">
                                        <FiMapPin />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Lost District</p>
                                        <p className="text-sm font-bold text-slate-800 truncate">{match.lost_district}</p>
                                      </div>
                                  </div>
                                </div>
                                
                                <div className="bg-slate-900 rounded-[24px] p-6 text-white flex flex-col justify-center">
                                  <p className="text-[10px] font-black text-white/40 uppercase mb-2">Claim Potential Reward</p>
                                  <div className="flex items-baseline gap-2">
                                      <span className="text-3xl font-black">{match.reward_amount ? match.reward_amount.toLocaleString() : '0'}</span>
                                      <span className="text-sm font-bold text-emerald-400">RWF</span>
                                  </div>
                                  <p className="text-[10px] text-white/40 mt-2 italic font-mono">* Subject to owner confirmation</p>
                                </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
                            <button 
                                onClick={() => handleContactOwner(match)}
                                className="flex-1 min-w-[180px] bg-slate-900 text-white rounded-2xl py-4 font-black text-sm hover:translate-y-[-2px] hover:bg-black transition flex items-center justify-center gap-2 group/btn"
                            >
                                <LuMessageSquare className="w-4 h-4 transition-transform group-hover/btn:-translate-y-0.5" />
                                Connect & Verify
                            </button>
                            <button 
                              onClick={() => handleMarkReturned(match.id)}
                              disabled={match.status === 'completed' || updatingMatch === match.id}
                              className="flex-1 min-w-[180px] bg-emerald-500 text-white rounded-2xl py-4 font-black text-sm hover:translate-y-[-2px] hover:bg-emerald-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {updatingMatch === match.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/40 border-t-white"></div>
                                ) : (
                                  <LuCheckCircle2 className="w-4 h-4" />
                                )}
                                Hand Over Item
                            </button>
                            <button 
                              onClick={() => { setViewingMatch(match); setIsDetailModalOpen(true); }}
                              className="w-14 h-14 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition"
                            >
                                <LuEye className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteMatch(match.id)}
                              disabled={updatingMatch === match.id}
                              className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition disabled:opacity-50"
                              title="Dismiss Owner"
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
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && viewingMatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xl" onClick={() => setIsDetailModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-6xl max-h-[90vh] rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-500 border border-white/20">
            <button 
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute top-8 right-8 z-10 w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20 transition border border-white/20"
            >
              <FiX className="text-2xl" />
            </button>

            {/* Comparison Side */}
            <div className="md:w-1/2 bg-slate-950 p-12 flex flex-col justify-center overflow-y-auto">
               <div className="space-y-12">
                  <div className="text-center">
                    <h3 className="text-white text-4xl font-black mb-2 italic">SIDE BY SIDE</h3>
                    <p className="text-white/40 text-xs font-black uppercase tracking-[4px]">Neural Validation</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <div className="aspect-square bg-white/5 rounded-[32px] overflow-hidden border border-white/10 flex items-center justify-center p-4 relative">
                           {viewingMatch.lost_image_url ? (
                             <img src={`${BACKEND_URL}${viewingMatch.lost_image_url}`} className="w-full h-full object-contain rounded-2xl" alt="Lost" />
                           ) : (
                             <LuSearch className="w-16 h-16 text-white/10" />
                           )}
                           <div className="absolute top-4 left-4 bg-red-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase">User Lost Report</div>
                        </div>
                        <p className="text-center text-white/60 text-[10px] font-bold">Image Provided by Loser</p>
                     </div>
                     <div className="space-y-4">
                        <div className="aspect-square bg-white/5 rounded-[32px] overflow-hidden border border-white/10 flex items-center justify-center p-4 relative">
                           {viewingMatch.found_image_url ? (
                             <img src={`${BACKEND_URL}${viewingMatch.found_image_url}`} className="w-full h-full object-contain rounded-2xl" alt="Found" />
                           ) : (
                             <LuSearch className="w-16 h-16 text-white/10" />
                           )}
                           <div className="absolute top-4 left-4 bg-emerald-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase">Your Found Report</div>
                        </div>
                        <p className="text-center text-white/60 text-[10px] font-bold">Your Uploaded Proof</p>
                     </div>
                  </div>

                  <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 text-center">
                     <p className="text-white font-black text-6xl italic group">
                       <span className="text-white/20 mr-4 font-serif">~</span>{viewingMatch.match_score}<span className="text-blue-500 ml-1">%</span>
                     </p>
                     <p className="text-blue-400 text-[10px] font-black uppercase tracking-[3px] mt-2">Similarity Score Matches</p>
                  </div>
               </div>
            </div>

            {/* Data Side */}
            <div className="md:w-1/2 p-12 overflow-y-auto space-y-10 bg-white">
               <div>
                  <h2 className="text-4xl font-black text-slate-900 leading-tight">Match Profile</h2>
                  <div className="flex items-center gap-4 mt-2">
                     <span className="flex items-center gap-1 text-slate-400 text-xs font-bold uppercase tracking-widest"><FiClock /> Matched on {new Date(viewingMatch.matched_at).toLocaleDateString()}</span>
                  </div>
               </div>

               <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metadata Comparison</h4>
                  <div className="grid gap-3">
                     <div className="flex justify-between items-center bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <span className="text-xs font-black text-slate-400 uppercase">Item Category</span>
                        <span className="font-bold text-slate-900 capitalize px-4 py-1.5 bg-white rounded-full shadow-sm">{viewingMatch.lost_category}</span>
                     </div>
                     <div className="flex justify-between items-center bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <span className="text-xs font-black text-slate-400 uppercase">Lost Location</span>
                        <span className="font-bold text-slate-900 px-4 py-1.5 bg-white rounded-full shadow-sm">{viewingMatch.lost_district}</span>
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Owner Identity</h4>
                  <div className="grid gap-4">
                     <div className="flex items-center gap-5 bg-blue-50/50 p-6 rounded-[32px] border border-blue-100/50">
                        <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl shadow-xl">
                           <FiUser />
                        </div>
                        <div>
                           <p className="text-sm font-black text-slate-900 mb-0.5">{viewingMatch.loser_name}</p>
                           <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Registered User</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-100">
                           <FiPhone className="text-blue-500 text-lg" />
                           <span className="text-xs font-bold text-slate-700">{viewingMatch.loser_phone}</span>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-100 overflow-hidden">
                           <FiMail className="text-blue-500 text-lg flex-shrink-0" />
                           <span className="text-xs font-bold text-slate-700 truncate">{viewingMatch.loser_email}</span>
                        </div>
                     </div>
                  </div>
               </div>

               {viewingMatch.lost_text && (
                 <div className="space-y-4 pt-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Extracted Document Data</h4>
                    <div className="bg-slate-50 rounded-[28px] p-8 border border-slate-100 border-dashed border-2">
                      <p className="text-slate-600 text-sm font-medium leading-relaxed italic">"{viewingMatch.lost_text}"</p>
                    </div>
                 </div>
               )}

               <div className="pt-10 flex gap-4">
                  <button 
                    onClick={() => handleContactOwner(viewingMatch)}
                    className="flex-1 py-5 bg-slate-900 text-white rounded-[24px] font-black text-lg shadow-2xl hover:bg-black transition"
                  >
                    Start Communication
                  </button>
               </div>
            </div>
          </div>
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