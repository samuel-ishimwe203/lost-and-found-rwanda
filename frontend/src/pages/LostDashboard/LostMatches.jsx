import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { 
  FiFileText, FiMapPin, FiCalendar, FiTag, FiDollarSign, FiInfo, 
  FiExternalLink, FiClock, FiShield, FiUser, FiPhone, FiMail, FiAlertCircle,
  FiCheckCircle, FiMessageSquare, FiEye, FiTrash2, FiSearch, FiX
} from "react-icons/fi"
import apiClient from "../../services/api"
import SendMessageModal from "../../components/SendMessageModal"
import { getImageUrl } from "../../utils/imageHelper"
import { useLanguage } from "../../context/LanguageContext"

export default function LostMatches() {
  const { t } = useLanguage()
  const { id } = useParams()
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
      let allMatches = response.data.data.matches || []
      if (id) { allMatches = allMatches.filter(m => m.lost_item_id.toString() === id.toString()) }
      setMatches(allMatches)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || t("messages.operationFailed"))
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
    if (!window.confirm(t("items.deleteConfirm"))) return
    try {
      setUpdatingMatch(matchId)
      await apiClient.put(`/matches/${matchId}/complete`, { notes: 'Item received by owner' })
      await fetchMatches()
    } catch (err) {
      alert('❌ ' + (err.response?.data?.message || err.message))
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
      alert('❌ ' + (err.response?.data?.message || err.message))
    } finally {
      setUpdatingMatch(null)
    }
  }

  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm(t("items.deleteConfirm"))) return
    try {
      setUpdatingMatch(matchId)
      await apiClient.delete(`/matches/${matchId}`)
      await fetchMatches()
    } catch (err) {
      alert('❌ ' + (err.response?.data?.message || err.message))
    } finally {
      setUpdatingMatch(null)
    }
  }

  const getStatusLabel = (status, match) => {
    if (match && !match.is_verified) return t("matches.pendingVerification")
    if (match && !match.is_unlocked) {
      if (match.payment_status === 'pending_admin_approval') return t("matches.verifyingPayment")
      return t("matches.paymentPending")
    }
    const map = { 
      pending: t("matches.pending"), 
      confirmed: t("matches.confirmed"), 
      completed: t("matches.completed"), 
      rejected: t("matches.rejected") 
    }
    return map[status] || status
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-8 pb-32">
        <div className="w-16 h-16 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs animate-pulse">{t("matches.scanningRegistry")}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden border border-red-100 my-12">
        <div className="bg-red-50 p-12 text-center text-red-600">
          <FiAlertCircle className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold uppercase tracking-tight">{t("common.error")}</h2>
          <p className="text-slate-500 font-medium mt-4 italic">"{error}"</p>
          <button onClick={fetchMatches} className="mt-8 px-8 py-3 bg-red-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg">{t("messages.tryAgain")}</button>
        </div>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6">
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-slate-100 relative overflow-hidden">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-sm">
            <FiSearch className="w-8 h-8 text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">{t("matches.noMatches")}</h2>
          <p className="text-slate-400 font-medium max-w-sm mx-auto text-sm leading-relaxed">
            {t("matches.scanningRegistry")}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-32">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 md:p-8 rounded-2xl border border-green-400 shadow-lg relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/5 opacity-10"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
              {t("matches.potentialMatches")}
            </h1>
            <p className="text-green-50 text-sm md:text-base opacity-90 max-w-2xl font-medium">
              {t("landing.step2Desc")}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-xl px-6 py-3 border border-white/30 text-center shrink-0">
            <p className="text-[10px] font-bold text-white uppercase tracking-widest opacity-80 mb-1">{t("matches.matchedItems")}</p>
            <p className="text-3xl font-black text-white leading-none">{matches.length}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-12">
        {Object.entries(matches.reduce((acc, match) => {
          const key = `${match.lost_item_type}-${match.lost_district}`;
          if (!acc[key]) acc[key] = { item_type: match.lost_item_type, district: match.lost_district, items: [] };
          acc[key].items.push(match);
          return acc;
        }, {})).map(([groupKey, group]) => (
          <div key={groupKey} className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100 px-1">
              <FiTag className="text-green-600 text-lg" />
              <h2 className="text-lg font-bold text-slate-900">
                {group.item_type} <span className="text-slate-400 font-medium ml-1">— {t(`districts.${group.district?.toLowerCase()}`) || group.district}</span>
              </h2>
              <span className="ml-auto px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full text-[10px] font-bold border border-green-100 uppercase tracking-widest">{group.items.length} {t("matches.potentialMatches")}</span>
            </div>

            <div className="grid gap-8">
              {group.items.map((match) => (
                <div key={match.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-green-100 transition-all duration-300 overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-64 h-52 md:h-auto relative overflow-hidden bg-slate-900 shrink-0">
                      {match.found_image_url && match.is_unlocked ? (
                        <img src={getImageUrl(match.found_image_url)} alt={match.found_item_type} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" />
                      ) : match.found_image_url && !match.is_unlocked ? (
                        <div className="w-full h-full relative group/locked">
                          <img src={getImageUrl(match.found_image_url)} alt="Blurred" className="w-full h-full object-cover blur-2xl opacity-30" />
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/20">
                            <FiShield className="w-10 h-10 text-white/50 mb-2" />
                            <p className="text-[10px] font-bold text-white uppercase tracking-widest bg-slate-900/60 px-3 py-1 rounded-full">{t("matches.protectedContact")}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 bg-slate-50">
                          <FiFileText className="w-10 h-10 opacity-10" />
                          <span className="text-[10px] font-bold uppercase mt-2 tracking-widest text-slate-300">{t("items.noImage")}</span>
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg border border-white/20 backdrop-blur-md font-bold text-white text-center ${match.match_score >= 80 ? 'bg-green-600' : 'bg-amber-500'}`}>
                          <div>
                            <p className="text-sm leading-none">{Math.round(match.match_score)}%</p>
                            <p className="text-[7px] font-bold opacity-70 uppercase mt-0.5">{t("matches.matchPercentage")}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-between space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t("items.myLostItems")}:</span>
                            <h4 className="text-xl font-bold text-slate-900 leading-none">{match.found_item_type}</h4>
                          </div>
                          <div className="flex flex-wrap gap-4 mt-2">
                             <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                               <FiMapPin className="text-green-600" /> {match.is_unlocked ? (t(`districts.${match.found_district?.toLowerCase()}`) || match.found_district) : t("matches.protectedContact")}
                             </div>
                             <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                               <FiClock className="text-green-600" /> {new Date(match.matched_at).toLocaleDateString()}
                             </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${match.status === 'completed' ? 'bg-emerald-50 text-green-700 border-green-100' : match.status === 'confirmed' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                            {getStatusLabel(match.status, match)}
                          </span>
                          {!match.is_unlocked && match.is_verified && (
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500 uppercase bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100"><FiDollarSign /> {match.admin_fee} RWF Fee</span>
                          )}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-green-50/30 p-5 rounded-xl border border-green-100 shadow-sm relative overflow-hidden group/mini">
                          <div className="absolute top-0 right-0 w-8 h-8 bg-green-500/5 rounded-full -mr-4 -mt-4"></div>
                          <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1 shadow-none">{t("items.myFoundItems")}</p>
                          <p className="font-bold text-slate-900 text-sm">{match.found_item_type}</p>
                        </div>
                        <div className="bg-slate-900 p-5 rounded-xl text-white shadow-sm relative overflow-hidden group/mini">
                           <div className="absolute top-0 right-0 w-8 h-8 bg-white/5 rounded-full -mr-4 -mt-4"></div>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">{t("items.myLostItems")}</p>
                          <p className="font-bold text-white text-sm">{match.lost_item_type}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-50 mt-2">
                        {!match.is_unlocked ? (
                          match.is_verified ? (
                            match.payment_status === 'pending_admin_approval' ? (
                              <button disabled className="flex-1 min-w-[180px] py-4 bg-amber-50 text-amber-600 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-amber-100 flex items-center justify-center gap-2 cursor-wait">
                                <FiClock className="animate-spin text-sm" /> {t("matches.verifyingPayment")}
                              </button>
                            ) : (
                              <button onClick={() => handlePayToUnlock(match)} disabled={updatingMatch === match.id} className="flex-1 min-w-[150px] py-4 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg flex items-center justify-center gap-2">
                                <FiDollarSign className="text-sm" /> {t("matches.unlockDetails")} ({match.admin_fee} RWF)
                              </button>
                            )
                          ) : (
                            <button disabled className="flex-1 min-w-[180px] py-4 bg-slate-100 text-slate-400 rounded-xl font-bold text-[10px] uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2">
                              <FiShield className="text-sm" /> {t("matches.pendingVerification")}
                            </button>
                          )
                        ) : (
                          <button onClick={() => handleContactFinder(match)} className="flex-1 min-w-[150px] bg-slate-950 text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg flex items-center justify-center gap-2">
                            <FiMessageSquare className="text-sm" /> {t("matches.contactFinder")}
                          </button>
                        )}
                        {match.status !== 'completed' && (
                          <button onClick={() => handleMarkReceived(match.id)} disabled={updatingMatch === match.id} className="flex-1 sm:flex-none px-8 py-4 bg-green-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
                            {updatingMatch === match.id ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/30 border-t-white"></div> : <FiCheckCircle className="text-sm" />} {t("matches.propertyRecovered")}
                          </button>
                        )}
                        <div className="flex gap-2">
                          <button onClick={() => { setViewingMatch(match); setIsDetailModalOpen(true); }} className="w-12 h-12 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center border border-slate-100 hover:bg-green-50 hover:text-green-600 transition-all" title={t("matches.viewDetails")}><FiEye /></button>
                          <button onClick={() => handleDeleteMatch(match.id)} disabled={updatingMatch === match.id} className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center border border-red-100 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50" title={t("matches.dismissMatch")}><FiTrash2 /></button>
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

      {/* DETAIL MODAL */}
      {isDetailModalOpen && viewingMatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-md" onClick={() => setIsDetailModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsDetailModalOpen(false)} 
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-all shadow-md"
            >
              <FiX />
            </button>

            <div className="md:w-1/2 h-64 md:h-auto bg-slate-900 flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-slate-800/10 [background-size:20px_20px] bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)]"></div>
              {viewingMatch.found_image_url && viewingMatch.is_unlocked ? (
                <img src={getImageUrl(viewingMatch.found_image_url)} className="w-full h-full object-contain p-6 relative z-10" alt="Found Product Visualization" />
              ) : (
                <div className="text-center z-10 px-8">
                  <FiShield className="w-16 h-16 text-slate-700 mx-auto mb-4 opacity-30" />
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">{t("matches.protectedContact")}</p>
                </div>
              )}
            </div>

            <div className="flex-1 p-8 md:p-12 overflow-y-auto space-y-8 bg-white">
              <div className="space-y-4">
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-green-100">{t("items.itemDetails")}</span>
                <h2 className="text-3xl font-bold text-slate-900">{viewingMatch.found_item_type}</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm font-medium">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t("items.location")}</p>
                  <p className="text-sm font-bold text-slate-800">{viewingMatch.is_unlocked ? (t(`districts.${viewingMatch.found_district?.toLowerCase()}`) || viewingMatch.found_district) : t("matches.protectedContact")}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm font-medium">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t("items.date")}</p>
                  <p className="text-sm font-bold text-slate-800">{new Date(viewingMatch.matched_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="bg-green-50/20 p-6 rounded-2xl border border-green-100/50">
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-3 flex items-center gap-2"><FiInfo /> {t("items.description")}</p>
                <p className="text-slate-600 text-sm italic leading-relaxed font-medium">
                  "{viewingMatch.found_description || t("matches.scanningRegistry")}"
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("profile.personalInfo")}</h4>
                {viewingMatch.is_unlocked ? (
                  <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-5 shadow-xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-full blur-xl transition-transform group-hover:scale-150"></div>
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center text-lg border border-white/10"><FiUser /></div>
                      <div>
                        <p className="text-base font-bold text-white leading-none capitalize">{viewingMatch.finder_name}</p>
                        <p className="text-[11px] font-bold text-green-400 flex items-center gap-1.5 mt-2 uppercase tracking-tight"><FiPhone className="text-green-500" /> {viewingMatch.finder_phone}</p>
                      </div>
                    </div>
                    <button onClick={() => handleContactFinder(viewingMatch)} className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all text-[10px] relative z-10 shadow-lg">{t("matches.contactFinder")}</button>
                  </div>
                ) : (
                  <div className="p-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                    <FiShield className="mx-auto text-slate-300 mb-3 w-8 h-8 opacity-40" />
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t("matches.protectedContact")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isPayModalOpen && payingMatch && (
        <PaymentModal match={payingMatch} onClose={() => setIsPayModalOpen(false)} onSubmit={handlePaymentSubmit} loading={updatingMatch === payingMatch.id} />
      )}

      {messageModalOpen && selectedMatch && (
        <SendMessageModal isOpen={messageModalOpen} onClose={() => setMessageModalOpen(false)} item={selectedMatch} isFoundItem={true} />
      )}
    </div>
  )
}

function PaymentModal({ match, onClose, onSubmit, loading }) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({ payment_method: 'Mobile Money (MTN)', payment_phone: '', payment_name: '', transaction_id: '' })
  const adminPhone = "+250 788 000 000";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.payment_phone || !formData.transaction_id || !formData.payment_name) { alert(t("validation.required")); return; }
    onSubmit(formData);
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-slate-950 p-8 md:p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-[50px] -mr-16 -mt-16"></div>
          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold uppercase tracking-widest inline-block mb-4">Secure Checkout</span>
          <h2 className="text-3xl font-bold tracking-tight uppercase mb-1">{t("matches.unlockDetails")}</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">Service Fee: <span className="text-white text-sm">{match.admin_fee} RWF</span></p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8 bg-white">
          <div className="bg-green-50 p-6 rounded-2xl border border-green-100 shadow-sm">
            <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest mb-4 flex items-center gap-2"><FiInfo /> Recovery Instruction</p>
            <div className="space-y-4 text-xs font-medium">
              <p className="text-slate-700">1. Transfer <span className="text-green-600 font-bold">{match.admin_fee} RWF</span> via MoMo to the official registry:</p>
              <div className="bg-white px-4 py-3 rounded-xl border border-green-200 text-center shadow-inner">
                <p className="font-bold text-slate-900 tracking-widest font-mono text-lg">{adminPhone}</p>
              </div>
              <p className="text-slate-400 text-[10px] uppercase leading-relaxed">2. Input the reference details below to authorize immediate unlock.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t("items.category")}</label>
                <select value={formData.payment_method} onChange={(e) => setFormData({...formData, payment_method: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900 focus:border-green-500 transition-all text-xs">
                  <option>Mobile Money (MTN)</option>
                  <option>Airtel Money</option>
                  <option>Bank Transfer</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t("auth.phone")}</label>
                <input type="text" placeholder="078..." value={formData.payment_phone} onChange={(e) => setFormData({...formData, payment_phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900 focus:border-green-500 transition-all text-xs" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t("auth.firstName")}</label>
              <input type="text" placeholder="..." value={formData.payment_name} onChange={(e) => setFormData({...formData, payment_name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900 focus:border-green-500 transition-all text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Reference Code / TxID</label>
              <input type="text" placeholder="..." value={formData.transaction_id} onChange={(e) => setFormData({...formData, transaction_id: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900 focus:border-green-500 transition-all text-xs" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-slate-950 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-green-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
            {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div> : <FiCheckCircle />}
            {t("common.submit")}
          </button>
        </form>
      </div>
    </div>
  )
}