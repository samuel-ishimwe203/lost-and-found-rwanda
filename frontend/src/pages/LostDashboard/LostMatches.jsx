
import React, { useState, useEffect } from 'react'
import { 
  FiFileText, FiMapPin, FiCalendar, FiTag, FiDollarSign, FiInfo, 
  FiExternalLink, FiClock, FiShield, FiUser, FiPhone, FiMail, FiAlertCircle,
  FiCheckCircle, FiMessageSquare, FiEye, FiTrash2, FiSearch, FiX
} from "react-icons/fi"
import apiClient from "../../services/api"
import SendMessageModal from "../../components/SendMessageModal"
import { getImageUrl } from "../../utils/imageHelper"

export default function LostMatches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingMatch, setUpdatingMatch] = useState(null)
  const [messageModalOpen, setMessageModalOpen] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [viewingMatch, setViewingMatch] = useState(null)
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [payingMatch, setPayingMatch] = useState(null)

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

  const handlePayToUnlock = (match) => {
    setPayingMatch(match)
    setIsPayModalOpen(true)
  }

  const handlePaymentSubmit = async (paymentData) => {
    try {
      setUpdatingMatch(payingMatch.id)
      const response = await apiClient.post(`/matches/${payingMatch.id}/pay`, paymentData)
      alert('✅ ' + response.data.message)
      setIsPayModalOpen(false)
      await fetchMatches()
    } catch (err) {
      alert('❌ Failed to submit payment: ' + (err.response?.data?.message || err.message))
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

  const getStatusLabel = (status, match) => {
    if (match && !match.is_verified) return 'Pending Admin Verification'
    if (match && !match.is_unlocked) {
      if (match.payment_status === 'pending_admin_approval') return 'Payment Verification Pending'
      return 'Awaiting Your Payment'
    }
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
      <div className="max-w-4xl mx-auto py-8 md:py-12 px-4 md:px-6">
        <div className="bg-white rounded-3xl md:rounded-[40px] shadow-2xl p-8 md:p-16 text-center border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-green-100 text-green-600 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 rotate-12 transition-transform hover:rotate-0">
              <FiEye className="w-8 h-8 md:w-12 md:h-12" />
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">No matches yet.</h2>
            <p className="text-slate-500 font-medium max-w-md mx-auto mb-8 md:mb-10 text-sm md:text-lg">
              We haven't found any items that match your posting. You'll receive a notification as soon as someone reports a discovery.
            </p>
            <div className="flex items-center justify-center gap-4">
               <button className="px-8 md:px-10 py-3 md:py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black text-xs md:text-sm shadow-xl hover:bg-slate-800 transition">Go to Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12 pb-32">
      <div className="mb-8 md:mb-12">
        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-2">Your Matches</h1>
        <p className="text-slate-500 font-bold text-[10px] md:text-xs max-w-lg uppercase tracking-widest opacity-70">
          Review potential discoveries for your lost items. Securely unlock details after admin verification.
        </p>
      </div>

      <div className="grid gap-16">
        {Object.entries(matches.reduce((acc, match) => {
          const key = `${match.lost_item_type}-${match.lost_district}`;
          if (!acc[key]) acc[key] = { item_type: match.lost_item_type, district: match.lost_district, items: [] };
          acc[key].items.push(match);
          return acc;
        }, {})).map(([groupKey, group]) => (
          <div key={groupKey} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Group Header */}
            <div className="flex items-start md:items-center gap-3 pb-3 border-b-2 border-slate-100">
               <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white text-lg md:text-xl shadow-md shrink-0">
                  <FiTag />
               </div>
               <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Matches For Your Posting</p>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[8px] md:text-[10px] font-black">
                      {group.items.length} HITS
                    </span>
                  </div>
                  <h2 className="text-lg md:text-2xl font-black text-slate-900 leading-tight">{group.item_type} <span className="text-slate-300 font-medium font-serif italic ml-1">in {group.district}</span></h2>
               </div>
            </div>

            {/* Matches in this group */}
            <div className="grid gap-8 mt-8">
              {group.items.map((match) => (
                <div 
                  key={match.id} 
                  className="group relative bg-white rounded-2xl md:rounded-[32px] border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
                >
                  <div className="flex flex-col lg:flex-row h-full">
                    {/* Image Section */}
                    <div className="lg:w-64 h-48 lg:h-auto relative overflow-hidden bg-slate-100">
                        {match.found_image_url && match.is_unlocked ? (
                          <img 
                            src={getImageUrl(match.found_image_url)} 
                            alt={match.found_item_type}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : match.found_image_url && !match.is_unlocked ? (
                          <div className="w-full h-full relative">
                            <img 
                              src={getImageUrl(match.found_image_url)} 
                              alt="Blurred"
                              className="w-full h-full object-cover blur-2xl opacity-50"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <FiShield className="w-12 h-12 text-slate-400 opacity-50" />
                            </div>
                          </div>
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
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-xl backdrop-blur-md ${
                          match.match_score >= 80 ? 'bg-green-500/90 text-white' : 'bg-amber-500/90 text-white'
                        }`}>
                          <div className="text-center">
                            <p className="text-base font-bold leading-none">{Math.round(match.match_score)}%</p>
                            <p className="text-[7px] font-bold uppercase opacity-60">Score</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-5 md:p-8 flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <div className="mb-4">
                          <h3 className="text-lg md:text-xl font-black text-slate-900 group-hover:text-green-600 transition-colors uppercase tracking-tight leading-tight">{match.found_item_type}</h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-slate-400 text-[10px] md:text-xs font-bold">
                             <span className="flex items-center gap-1"><FiMapPin /> {match.found_district}</span>
                             <span className="flex items-center gap-1"><FiClock /> {new Date(match.matched_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border mb-2 ${
                            match.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' : 
                            match.status === 'confirmed' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                            {getStatusLabel(match.status, match)}
                          </span>
                          {!match.is_unlocked && match.is_verified && (
                             <span className="flex items-center gap-1 text-[10px] font-black text-rose-600 uppercase tracking-tight">
                               <FiDollarSign /> Fee: {match.admin_fee} RWF
                             </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                        <div className="bg-slate-50 p-4 rounded-xl md:rounded-2xl border border-slate-100">
                          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Found Item</p>
                          <p className="text-xs md:text-sm font-bold text-slate-700 truncate">{match.found_item_type}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl md:rounded-2xl border border-slate-100">
                          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Matches Your Post</p>
                          <p className="text-xs md:text-sm font-bold text-slate-700 truncate">{match.lost_item_type}</p>
                        </div>
                      </div>

                      <div className="mt-auto flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4">
                         {!match.is_unlocked ? (
                           match.is_verified ? (
                            match.payment_status === 'pending_admin_approval' ? (
                               <button
                                disabled
                                className="flex-1 min-w-[200px] py-4 bg-amber-50 text-amber-600 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs border border-amber-100 flex items-center justify-center gap-2 cursor-wait"
                              >
                                <FiClock className="animate-spin" />
                                Payment Verification in Progress
                              </button>
                            ) : (
                               <button
                                onClick={() => handlePayToUnlock(match)}
                                disabled={updatingMatch === match.id}
                                className="flex-1 min-w-[180px] py-3 md:py-4 bg-green-600 text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs hover:bg-green-700 transition shadow-lg flex items-center justify-center gap-2 group/btn"
                              >
                                <FiDollarSign className="w-3.5 h-3.5" />
                                Unlock Full Details ({match.admin_fee} RWF)
                              </button>
                            )
                           ) : (
                            <button
                              disabled
                              className="flex-1 min-w-[200px] py-4 bg-slate-200 text-slate-400 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              <FiClock className="w-4 h-4" />
                              Awaiting Admin Verification
                            </button>
                           )
                         ) : (
                           <button
                            onClick={() => handleContactFinder(match)}
                            className="flex-1 min-w-[160px] py-3 md:py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs hover:bg-slate-800 transition shadow-lg flex items-center justify-center gap-2 group/btn"
                          >
                            <FiMessageSquare className="w-4 h-4 transition-transform group-hover/btn:-translate-y-0.5" />
                            Contact Finder
                          </button>
                         )}
                        {match.status !== 'completed' && (
                          <button
                            onClick={() => handleMarkReceived(match.id)}
                            disabled={updatingMatch === match.id}
                            className="flex-1 sm:flex-none px-6 md:px-8 py-3 md:py-4 bg-green-500 text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs hover:bg-green-600 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {updatingMatch === match.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                            ) : (
                              <FiCheckCircle className="w-4 h-4" />
                            )}
                            I Got It Back
                          </button>
                        )}
                        <div className="flex gap-2">
                          <button 
                            onClick={() => { setViewingMatch(match); setIsDetailModalOpen(true); }}
                            className="flex-1 sm:w-12 h-12 md:h-14 bg-slate-100 text-slate-500 rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-slate-200 transition"
                            title="View Full Details"
                          >
                            <FiEye className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteMatch(match.id)}
                            disabled={updatingMatch === match.id}
                            className="flex-1 sm:w-12 h-12 md:h-14 bg-red-50 text-red-500 rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition disabled:opacity-50"
                            title="Dismiss Match"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && viewingMatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl" onClick={() => setIsDetailModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute top-6 right-6 z-10 w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition"
            >
              <FiX className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <div className="md:w-1/2 bg-slate-900 flex items-center justify-center p-6 md:p-12">
               {viewingMatch.found_image_url && viewingMatch.is_unlocked ? (
                 <img 
                  src={getImageUrl(viewingMatch.found_image_url)} 
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" 
                  alt="Found" 
                 />
               ) : (
                  <div className="text-center">
                    <FiShield className="w-24 h-24 text-slate-700 mx-auto mb-6" />
                    <p className="text-slate-500 font-black uppercase tracking-widest text-sm">Image Hidden Pending Unlock</p>
                  </div>
               )}
            </div>
            <div className="md:w-1/2 p-6 md:p-12 overflow-y-auto space-y-6 md:space-y-8 bg-white">
               <div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest border border-green-200 mb-2 md:mb-3 inline-block">Matched Item Detail</span>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{viewingMatch.found_item_type}</h2>
                  <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-[8px] md:text-[9px]">Reference Match #{viewingMatch.id}</p>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100">
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2 tracking-widest leading-none"><FiMapPin /> Location</p>
                    <p className="text-sm font-bold text-slate-700">{viewingMatch.is_unlocked ? viewingMatch.found_district : 'Information Locked'}</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2"><FiCalendar /> Date Found</p>
                    <p className="text-sm font-bold text-slate-700">{new Date(viewingMatch.matched_at).toLocaleDateString()}</p>
                  </div>
               </div>

               <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-4 flex items-center gap-2"><FiInfo /> Discovery Note</p>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                    "{viewingMatch.found_description || 'The finder has provided a detailed description that will be available once the match is unlocked.'}"
                  </p>
               </div>

               {viewingMatch.is_unlocked ? (
                 <div className="space-y-6 pt-4 border-t border-slate-100 animate-in fade-in duration-500">
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-[3px]">Finder Details (Unlocked)</p>
                    <div className="space-y-4">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center"><FiUser /></div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Name</p>
                            <p className="font-bold text-slate-900">{viewingMatch.finder_name}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center"><FiPhone /></div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Contact</p>
                            <p className="font-bold text-slate-900">{viewingMatch.finder_phone}</p>
                          </div>
                       </div>
                    </div>
                 </div>
               ) : (
                 <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                    <FiLock className="mx-auto text-slate-300 mb-2" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Finder identity is hidden until unlocked</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPayModalOpen && payingMatch && (
        <PaymentModal 
          match={payingMatch}
          onClose={() => setIsPayModalOpen(false)}
          onSubmit={handlePaymentSubmit}
          loading={updatingMatch === payingMatch.id}
        />
      )}

      {/* Messaging Modal */}
      {messageModalOpen && selectedMatch && (
        <SendMessageModal 
          isOpen={messageModalOpen} 
          onClose={() => setMessageModalOpen(false)} 
          item={selectedMatch}
          isFoundItem={true}
        />
      )}
    </div>
  )
}

function PaymentModal({ match, onClose, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    payment_method: 'Mobile Money (MTN)',
    payment_phone: '',
    payment_name: '',
    transaction_id: ''
  })

  const adminPhone = "+250 788 000 000"; // Platform Admin Phone

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.payment_phone || !formData.transaction_id || !formData.payment_name) {
      alert('Please fill in all transaction details.');
      return;
    }
    onSubmit(formData);
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-slate-900 p-8 text-white">
           <h2 className="text-xl font-black tracking-tight mb-2">Unlock Match Full Details</h2>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Fee Required: {match.admin_fee} RWF</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-8">
           <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
              <p className="text-[10px] font-black text-blue-600 uppercase mb-4 flex items-center gap-2"><FiInfo /> Payment Instructions</p>
              <div className="space-y-4 text-sm">
                <p className="font-bold text-slate-800 leading-tight">1. Send <span className="text-blue-700 font-black">{match.admin_fee} RWF</span> to Admin via MoMo:</p>
                <div className="bg-white p-4 rounded-xl border border-blue-200 flex justify-between items-center group shadow-sm">
                   <span className="font-black text-blue-800 tracking-wider font-mono text-lg">{adminPhone}</span>
                   <span className="text-[9px] font-black text-slate-400 group-hover:text-blue-600 transition uppercase tracking-tighter">Copy Number</span>
                </div>
                <p className="text-slate-500 font-medium text-xs">2. After payment, fill in the details below so we can verify and unlock your match.</p>
              </div>
           </div>

           <div className="grid gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Payment Method</label>
                 <select 
                   value={formData.payment_method}
                   onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                   className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                 >
                   <option>Mobile Money (MTN)</option>
                   <option>Airtel Money</option>
                   <option>Bank Transfer</option>
                 </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Your Payment Phone</label>
                    <input 
                      type="text"
                      placeholder="e.g. 078XXXXXXX"
                      value={formData.payment_phone}
                      onChange={(e) => setFormData({...formData, payment_phone: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Sender Full Name</label>
                    <input 
                      type="text"
                      placeholder="Name on Account"
                      value={formData.payment_name}
                      onChange={(e) => setFormData({...formData, payment_name: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Transaction ID / Reference Number</label>
                 <input 
                   type="text"
                   placeholder="e.g. TX12345678"
                   value={formData.transaction_id}
                   onChange={(e) => setFormData({...formData, transaction_id: e.target.value})}
                   className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                 />
              </div>
           </div>

           <button 
             type="submit"
             disabled={loading}
             className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition flex items-center justify-center gap-3 disabled:opacity-50"
           >
             {loading ? <FiClock className="animate-spin" /> : <FiCheckCircle />}
             Submit Payment & Notify Admin
           </button>
        </form>
      </div>
    </div>
  )
}

function FiLock({ className }) {
  return (
    <svg className={className} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
  );
}