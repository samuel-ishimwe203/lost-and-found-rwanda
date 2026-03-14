
import React, { useState, useEffect } from "react"
import { 
  FiCalendar, FiMapPin, FiTag, FiDollarSign, FiInfo, FiExternalLink, 
  FiClock, FiShield, FiUser, FiPhone, FiMail, FiX, FiAlertCircle,
  FiCheckCircle, FiMessageSquare, FiEye, FiSearch, FiTrash2
} from "react-icons/fi"
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

  const getStatusLabel = (status, match) => {
    if (match && !match.is_verified) return 'Awaiting Admin Verification'
    if (match && !match.is_unlocked) return 'Awaiting Owner Payment'
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
      <div className="flex items-end justify-between mb-12 py-8">
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
          <FiSearch className="w-20 h-20 text-slate-200 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-slate-800 mb-3">No Active Matches</h3>
          <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
            We haven't found a safe match for your found items yet. Our system scans 24/7—you'll be the first to know!
          </p>
        </div>
      ) : (
        <div className="space-y-16">
          {Object.entries(groupedMatches).map(([itemId, group]) => (
            <div key={itemId} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

              <div className="grid gap-8">
                {group.items.map((match) => (
                  <div key={match.id} className="group bg-white rounded-[32px] border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
                    <div className="flex flex-col lg:flex-row">
                      <div className="lg:w-80 h-64 lg:h-auto relative overflow-hidden bg-slate-100">
                          {match.lost_image_url ? (
                            <img src={`${BACKEND_URL}${match.lost_image_url}`} alt={match.lost_item_type} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                              <FiSearch className="w-16 h-16 opacity-30" />
                              <span className="text-[8px] font-black uppercase mt-3">Reference Required</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                          <div className="absolute bottom-6 left-6">
                            <p className="text-white/60 text-[10px] font-black uppercase tracking-[2px]">Lost Post</p>
                            <h4 className="text-white text-xl font-black">{match.lost_item_type}</h4>
                          </div>
                      </div>

                      <div className="flex-1 p-8 lg:p-10 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                  <div className="flex items-center gap-3">
                                      <span className={`flex items-center justify-center w-12 h-12 rounded-2xl text-xl font-black shadow-lg ${match.match_score >= 80 ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'}`}>
                                        {Math.round(match.match_score)}%
                                      </span>
                                      <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-0.5">Confidence Level</p>
                                        <p className="text-lg font-black text-slate-800">High Match Potential</p>
                                      </div>
                                  </div>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${match.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : match.status === 'confirmed' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                  {getStatusLabel(match.status, match)}
                                </span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <div className="space-y-4">
                                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 relative">
                                      <div className="p-2.5 bg-white rounded-xl text-blue-600 shadow-sm"><FiUser /></div>
                                      <div className="min-w-0">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Possible Owner</p>
                                        <p className="text-sm font-bold text-slate-800 truncate">{match.is_unlocked ? match.loser_name : 'Hidden (Awaiting Verification)'}</p>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                      <div className="p-2.5 bg-white rounded-xl text-blue-600 shadow-sm"><FiMapPin /></div>
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
                                </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
                             {match.is_unlocked ? (
                               <button onClick={() => handleContactOwner(match)} className="flex-1 min-w-[180px] bg-slate-900 text-white rounded-2xl py-4 font-black text-sm hover:translate-y-[-2px] hover:bg-black transition flex items-center justify-center gap-2 group/btn">
                                  <FiMessageSquare className="w-4 h-4 transition-transform group-hover/btn:-translate-y-0.5" />
                                  Connect & Verify
                               </button>
                             ) : (
                               <button disabled className="flex-1 min-w-[180px] bg-slate-100 text-slate-400 rounded-2xl py-4 font-black text-sm cursor-not-allowed flex items-center justify-center gap-2">
                                  <FiShield className="w-4 h-4" />
                                  Locked by Admin
                               </button>
                             )}
                            <button onClick={() => handleMarkReturned(match.id)} disabled={match.status === 'completed' || updatingMatch === match.id} className="flex-1 min-w-[180px] bg-emerald-500 text-white rounded-2xl py-4 font-black text-sm hover:translate-y-[-2px] hover:bg-emerald-600 transition flex items-center justify-center gap-2 disabled:opacity-50">
                                {updatingMatch === match.id ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/40 border-t-white"></div> : <FiCheckCircle className="w-4 h-4" />}
                                Hand Over Item
                            </button>
                            <button onClick={() => { setViewingMatch(match); setIsDetailModalOpen(true); }} className="w-14 h-14 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition"><FiEye className="w-5 h-5" /></button>
                            <button onClick={() => handleDeleteMatch(match.id)} disabled={updatingMatch === match.id} className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition disabled:opacity-50" title="Dismiss Owner"><FiTrash2 className="w-5 h-5" /></button>
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
          <div className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-500 border border-white/20">
            <button onClick={() => setIsDetailModalOpen(false)} className="absolute top-8 right-8 z-10 w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20 transition border border-white/20"><FiX className="text-2xl" /></button>
            <div className="md:w-1/2 bg-slate-950 p-12 flex items-center justify-center">
               <div className="w-full text-center">
                  {viewingMatch.lost_image_url ? <img src={`${BACKEND_URL}${viewingMatch.lost_image_url}`} className="max-w-full max-h-[60vh] object-contain rounded-2xl shadow-2xl border-4 border-white/10" alt="Lost" /> : <FiSearch className="w-32 h-32 text-white/10 mx-auto" />}
               </div>
            </div>
            <div className="md:w-1/2 p-12 overflow-y-auto space-y-10 bg-white">
               <div>
                  <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-200 mb-4 inline-block">Owner Profile</span>
                  <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">{viewingMatch.lost_item_type}</h2>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2"><FiMapPin /> District</p>
                    <p className="text-sm font-bold text-slate-700">{viewingMatch.lost_district}</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2"><FiTag /> Category</p>
                    <p className="text-sm font-bold text-slate-700 capitalize">{viewingMatch.lost_category}</p>
                  </div>
               </div>
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Information</h4>
                  {viewingMatch.is_unlocked ? (
                    <div className="grid gap-4">
                       <div className="flex items-center gap-5 bg-blue-50/50 p-6 rounded-[32px] border border-blue-100/50">
                          <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl shadow-xl"><FiUser /></div>
                          <div><p className="text-sm font-black text-slate-900 mb-0.5">{viewingMatch.loser_name}</p><p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Verified User</p></div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-100"><FiPhone className="text-blue-500" /><span className="text-xs font-bold text-slate-700">{viewingMatch.loser_phone}</span></div>
                          <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-100 overflow-hidden"><FiMail className="text-blue-500" /><span className="text-xs font-bold text-slate-700 truncate">{viewingMatch.loser_email}</span></div>
                       </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-10 rounded-[40px] border border-dashed border-slate-200 text-center">
                       <FiShield className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                       <p className="text-xs font-bold text-slate-500 leading-relaxed">Identity protected until verification.</p>
                    </div>
                  )}
               </div>
               {viewingMatch.is_unlocked && (
                 <button onClick={() => handleContactOwner(viewingMatch)} className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-lg shadow-2xl hover:bg-black transition">Start Chat</button>
               )}
            </div>
          </div>
        </div>
      )}

      {selectedMatch && (
        <SendMessageModal isOpen={messageModalOpen} onClose={() => { setMessageModalOpen(false); setSelectedMatch(null); }} item={selectedMatch} />
      )}
    </div>
  )
}