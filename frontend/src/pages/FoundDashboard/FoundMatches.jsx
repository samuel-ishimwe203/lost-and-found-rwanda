import React, { useState, useEffect } from "react"
import { 
  FiCalendar, FiMapPin, FiTag, FiDollarSign, FiInfo, FiExternalLink, 
  FiClock, FiShield, FiUser, FiPhone, FiMail, FiX, FiAlertCircle,
  FiCheckCircle, FiMessageSquare, FiEye, FiSearch, FiTrash2
} from "react-icons/fi"
import apiClient from "../../services/api"
import SendMessageModal from "../../components/SendMessageModal"
import { getImageUrl } from "../../utils/imageHelper"
import { useLanguage } from "../../context/LanguageContext"

export default function FoundMatches() {
  const { t } = useLanguage()
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
      setError(err.response?.data?.message || t("messages.operationFailed"))
    } finally {
      setLoading(false)
    }
  }

  const handleContactOwner = (match) => {
    const itemData = { id: match.lost_item_id, item_type: match.lost_item_type, category: match.lost_category, district: match.lost_district, contact_name: match.loser_name, contact_phone: match.loser_phone, user_id: match.loser_id, item_source: 'lost' }
    setSelectedMatch(itemData)
    setMessageModalOpen(true)
  }

  const handleMarkReturned = async (matchId) => {
    if (!window.confirm(t("items.deleteConfirm"))) return
    try {
      setUpdatingMatch(matchId)
      await apiClient.put(`/matches/${matchId}/complete`, { notes: 'Item returned to owner' })
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
    if (match && !match.is_unlocked) return t("matches.paymentPending")
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
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-8">
        <div className="relative">
          <div className="w-20 h-20 border-8 border-green-100 border-t-[#108643] rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-emerald-100 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="font-black text-[#108643] uppercase tracking-[0.4em] text-[10px] animate-pulse">{t("matches.scanningRegistry")}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-[40px] shadow-2xl overflow-hidden border border-red-100">
        <div className="bg-red-600 p-12 text-center text-white">
          <FiAlertCircle className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-black uppercase tracking-tighter">{t("common.error")}</h2>
        </div>
        <div className="p-12 text-center">
          <p className="text-slate-500 font-bold mb-8 text-lg italic">"{error}"</p>
          <button onClick={fetchMatches} className="px-10 py-5 bg-[#108643] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-2xl hover:scale-105">{t("messages.tryAgain")}</button>
        </div>
      </div>
    )
  }

  const groupedMatches = matches.reduce((acc, match) => {
    const itemId = match.found_item_id
    if (!acc[itemId]) { acc[itemId] = { item_type: match.found_item_type, category: match.found_category, district: match.found_district, items: [] } }
    acc[itemId].items.push(match)
    return acc
  }, {})

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

      {matches.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 border border-slate-100 shadow-sm"><FiSearch className="text-slate-300 w-8 h-8" /></div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">{t("matches.noMatches")}</h3>
          <p className="text-slate-400 text-sm font-medium">{t("matches.scanningRegistry")}</p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedMatches).map(([itemId, group]) => (
            <div key={itemId} className="space-y-6">
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
                        {match.lost_image_url ? (
                          <img src={getImageUrl(match.lost_image_url)} alt={match.lost_item_type} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 bg-slate-50">
                            <FiSearch className="w-10 h-10 opacity-10" />
                            <span className="text-[10px] font-bold uppercase mt-2 tracking-widest text-slate-300">{t("items.noImage")}</span>
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg border border-white/20 backdrop-blur-md ${match.match_score >= 80 ? 'bg-green-600 text-white' : 'bg-amber-500 text-white'}`}>
                            {Math.round(match.match_score)}% {t("matches.matchPercentage")}
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t("items.myLostItems")}:</span>
                              <h4 className="text-xl font-bold text-slate-900 leading-none">{match.lost_item_type}</h4>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                              <FiMapPin className="text-green-600" /> {t(`districts.${match.lost_district?.toLowerCase()}`) || match.lost_district}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${match.status === 'completed' ? 'bg-emerald-50 text-green-700 border-green-100' : match.status === 'confirmed' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                            {getStatusLabel(match.status, match)}
                          </span>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 shadow-none">{t("profile.personalInfo")}</p>
                            <p className="font-bold text-slate-900 text-sm">{match.is_unlocked ? match.loser_name : t("matches.protectedContact")}</p>
                          </div>
                          <div className="bg-slate-900 p-5 rounded-xl text-white">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">{t("items.rewardAmount")}</p>
                            <p className="text-lg font-bold">{match.reward_amount ? match.reward_amount.toLocaleString() : '0'} <span className="text-green-500 text-xs text-uppercase">RWF</span></p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-50 mt-2">
                          {match.is_unlocked ? (
                            <button onClick={() => handleContactOwner(match)} className="flex-1 min-w-[140px] bg-slate-900 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-md group/btn">
                              <FiMessageSquare className="text-sm" /> {t("matches.contactOwner")}
                            </button>
                          ) : (
                            <button disabled className="flex-1 min-w-[140px] bg-slate-100 text-slate-400 py-3 rounded-xl font-bold text-xs uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2">
                              <FiShield className="text-sm" /> {t("matches.pendingVerification")}
                            </button>
                          )}
                          <button onClick={() => handleMarkReturned(match.id)} disabled={match.status === 'completed' || updatingMatch === match.id} className="flex-1 min-w-[140px] bg-green-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50">
                            {updatingMatch === match.id ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/30 border-t-white"></div> : <FiCheckCircle className="text-sm" />} {t("matches.markAsReturned")}
                          </button>
                          <div className="flex gap-2">
                            <button onClick={() => { setViewingMatch(match); setIsDetailModalOpen(true); }} className="w-10 h-10 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center border border-slate-100 hover:bg-green-50 hover:text-green-600 transition-all" title={t("matches.viewDetails")}><FiEye /></button>
                            <button onClick={() => handleDeleteMatch(match.id)} disabled={updatingMatch === match.id} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center border border-red-100 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50" title={t("matches.dismissMatch")}><FiTrash2 /></button>
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
      )}

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
              {viewingMatch.lost_image_url ? (
                <img src={getImageUrl(viewingMatch.lost_image_url)} className="w-full h-full object-contain p-6 relative z-10" alt="Lost Reference" />
              ) : (
                <div className="text-center z-10 px-8">
                  <FiShield className="w-16 h-16 text-slate-700 mx-auto mb-4 opacity-30" />
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">{t("matches.protectedContact")}</p>
                </div>
              )}
            </div>

            <div className="flex-1 p-8 md:p-12 overflow-y-auto space-y-8 bg-white">
              <div className="space-y-4">
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-green-100">{t("postings.reports")}</span>
                <h2 className="text-3xl font-bold text-slate-900">{viewingMatch.lost_item_type}</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t("items.location")}</p>
                  <p className="text-sm font-bold text-slate-800">{t(`districts.${viewingMatch.lost_district?.toLowerCase()}`) || viewingMatch.lost_district}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t("items.category")}</p>
                  <p className="text-sm font-bold text-slate-800">{t(`categories.${viewingMatch.lost_category?.toLowerCase()}`) || viewingMatch.lost_category}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("profile.personalInfo")}</h4>
                {viewingMatch.is_unlocked ? (
                  <div className="p-6 bg-green-50/30 rounded-2xl border border-green-100 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center text-lg shadow-md"><FiUser /></div>
                      <div>
                        <p className="text-base font-bold text-slate-900 leading-none">{viewingMatch.loser_name}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                          <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500"><FiPhone className="text-green-600" /> {viewingMatch.loser_phone}</span>
                          <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500"><FiMail className="text-green-600" /> {viewingMatch.loser_email}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleContactOwner(viewingMatch)} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg text-xs">{t("matches.contactOwner")}</button>
                  </div>
                ) : (
                  <div className="p-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                    <FiShield className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t("matches.protectedContact")}</p>
                  </div>
                )}
              </div>
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