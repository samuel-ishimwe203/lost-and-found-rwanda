import React, { useState, useEffect } from 'react';
import { 
  FiCheckCircle, FiXCircle, FiDollarSign, FiInfo, FiExternalLink, 
  FiClock, FiShield, FiAlertCircle, FiSearch, FiFilter, FiEye,
  FiUser, FiMapPin, FiCalendar, FiFileText, FiX, FiActivity, FiArrowRight, FiShieldOff
} from "react-icons/fi";
import apiClient from "../../services/api";
import { getImageUrl } from "../../utils/imageHelper";

export default function AdminMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifyingMatch, setVerifyingMatch] = useState(null);
  const [confirmingPayment, setConfirmingPayment] = useState(null);
  const [adminFee, setAdminFee] = useState(500); 
  const [adminFeedback, setAdminFeedback] = useState('This match looks highly accurate based on OCR data.');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/matches');
      setMatches(response.data.data.matches || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (matchId) => {
    try {
      setVerifyingMatch(matchId);
      await apiClient.post(`/admin/matches/verify/${matchId}`, {
        admin_fee: adminFee,
        admin_feedback: adminFeedback
      });
      fetchMatches();
      setVerifyingMatch(null);
      setIsCompareModalOpen(false);
    } catch (err) {
      alert('Failed to verify match: ' + (err.response?.data?.message || err.message));
      setVerifyingMatch(null);
    }
  };

  const handleConfirmPayment = async (matchId) => {
    if (!window.confirm('Confirm that you have received the payment for this match?')) return;
    try {
      setConfirmingPayment(matchId);
      await apiClient.post(`/admin/matches/confirm-payment/${matchId}`);
      fetchMatches();
      setConfirmingPayment(null);
      setIsCompareModalOpen(false);
    } catch (err) {
      alert('Failed to confirm payment: ' + (err.response?.data?.message || err.message));
      setConfirmingPayment(null);
    }
  };

  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm('Are you sure you want to dismiss this match? Both items will be returned to ACTIVE status.')) return;
    try {
      await apiClient.delete(`/matches/${matchId}`);
      fetchMatches();
      setIsCompareModalOpen(false);
      setSelectedMatch(null);
    } catch (err) {
      alert('Failed to dismiss match: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredMatches = matches.filter(m => {
    const matchesSearch = 
      m.loser_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.finder_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.lost_item_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'pending_verification') return matchesSearch && !m.is_verified;
    if (filterStatus === 'pending_payment') return matchesSearch && m.is_verified && !m.is_unlocked;
    if (filterStatus === 'verified') return matchesSearch && m.is_verified;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-12 text-center font-sans">
         <div className="w-16 h-16 border-4 border-emerald-100 border-t-[#10b981] rounded-full animate-spin mx-auto mb-6"></div>
         <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Loading Matches...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-20 px-4 md:px-8 space-y-10 font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 py-8">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Match Verification</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium opacity-80 max-w-2xl text-center md:text-left">
            Review, validate, and unlock potential item matches in the registry.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#10b981] transition-colors" />
            <input 
              type="text" 
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-5 py-3.5 bg-white rounded-xl border border-gray-100 focus:border-[#10b981] transition-all outline-none shadow-sm text-sm font-medium w-48"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-5 py-3.5 bg-white rounded-xl border border-gray-100 font-bold text-[10px] uppercase tracking-widest shadow-sm outline-none focus:border-[#10b981]"
          >
            <option value="all">Filter: ALL</option>
            <option value="pending_verification">Filter: PENDING</option>
            <option value="pending_payment">Filter: PAYMENT</option>
            <option value="verified">Filter: VERIFIED</option>
          </select>
        </div>
      </div>

      <div className="grid gap-8">
        {filteredMatches.map((match) => (
          <div key={match.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="flex flex-col lg:flex-row">
              {/* Lost Side */}
              <div className="lg:w-1/3 p-8 bg-gray-50/50 flex flex-col justify-center border-r border-gray-50">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 bg-slate-950 text-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                     <FiAlertCircle />
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Lost Posting</p>
                     <h3 className="text-lg font-bold text-gray-900 truncate capitalize">{match.lost_item_type}</h3>
                   </div>
                </div>
                <div className="space-y-3">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-300 shadow-sm font-bold">{match.loser_name?.charAt(0)}</div>
                      <p className="text-sm font-bold text-gray-800">{match.loser_name}</p>
                   </div>
                   <div className="pt-2">
                     <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-100">
                        REWARD: {match.reward_amount || 0} RWF
                     </span>
                   </div>
                </div>
              </div>

              {/* Found Side */}
              <div className="lg:w-1/3 p-8 bg-white border-r border-gray-50 relative">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 bg-[#10b981] text-white rounded-xl flex items-center justify-center text-xl shadow-lg">
                     <FiCheckCircle />
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Found Discovery</p>
                     <h3 className="text-lg font-bold text-gray-900 truncate capitalize">{match.found_item_type}</h3>
                   </div>
                </div>
                <div className="space-y-3">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 shadow-sm font-bold">{match.finder_name?.charAt(0)}</div>
                      <p className="text-sm font-bold text-gray-800">{match.finder_name}</p>
                   </div>
                   <div className="pt-2 flex items-center gap-2">
                     <span className="px-3 py-1 bg-emerald-50 text-[#10b981] rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        CONFIDENCE: {Math.round(match.match_score)}%
                     </span>
                     {match.is_police_upload && (
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">POLICE</span>
                     )}
                   </div>
                </div>
              </div>

              {/* Admin Panel */}
              <div className="lg:w-1/3 p-8 bg-gray-50/50 flex flex-col justify-center gap-4">
                {match.is_verified ? (
                  <div className="text-center space-y-4">
                    <div className="w-14 h-14 bg-white text-[#10b981] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                      <FiShield className="w-7 h-7" />
                    </div>
                    <div>
                       <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest leading-none mb-1">Verified</h4>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fee: {match.admin_fee} RWF</p>
                    </div>
                    
                    {!match.is_unlocked && (
                        <button 
                          onClick={() => { setSelectedMatch(match); setIsCompareModalOpen(true); }}
                          className="w-full py-3.5 bg-slate-950 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#10b981] transition shadow-lg active:scale-95 flex items-center justify-center gap-2"
                        >
                           <FiDollarSign /> Verify Payment
                        </button>
                    )}

                    {match.is_unlocked && (
                       <div className="px-4 py-2 bg-[#10b981] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md flex items-center justify-center gap-2">
                          <FiCheckCircle /> Match Complete
                       </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={() => { setSelectedMatch(match); setIsCompareModalOpen(true); }}
                      className="w-full py-4 bg-slate-950 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg hover:bg-[#10b981] transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <FiEye className="text-lg" /> Inspect Match
                    </button>
                    <div className="flex gap-2">
                       <div className="flex-1 bg-white p-3 rounded-xl border border-gray-100 text-center">
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">AI Score</p>
                          <p className="text-sm font-bold text-gray-900 leading-none">{Math.round(match.match_score)}%</p>
                       </div>
                       <button onClick={() => handleDeleteMatch(match.id)} className="w-12 h-12 bg-white text-red-100 hover:text-red-500 hover:bg-red-50 rounded-xl border border-gray-100 transition-all flex items-center justify-center flex-shrink-0">
                          <FiShieldOff className="w-5 h-5" />
                       </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* INSPECTION MODAL */}
      {isCompareModalOpen && selectedMatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setIsCompareModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-6xl max-h-[95vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-gray-100 animate-in zoom-in-95 duration-300">
            
            <div className="px-10 py-8 bg-slate-950 text-white flex justify-between items-center relative">
               <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-[#10b981] rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                    <FiShield />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Match Validation Interface</h2>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">ID: {selectedMatch.id} | Score: {Math.round(selectedMatch.match_score)}% Accuracy</p>
                  </div>
               </div>
               <button onClick={() => setIsCompareModalOpen(false)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
                 <FiX />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 bg-gray-50/50">
               <div className="grid lg:grid-cols-2 gap-12">
                  {/* LOST SIDE */}
                  <div className="space-y-6">
                     <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                        <div className="w-10 h-10 bg-slate-950 text-white rounded-lg flex items-center justify-center text-lg shadow-sm">
                           <FiAlertCircle />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 capitalize">{selectedMatch.lost_item_type} <span className="text-xs font-medium text-gray-400 ml-2">(Lost)</span></h3>
                     </div>

                     <div className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 aspect-video flex items-center justify-center overflow-hidden">
                        {selectedMatch.lost_image ? (
                           <img src={getImageUrl(selectedMatch.lost_image)} className="w-full h-full object-contain" alt="Lost Asset" />
                        ) : (
                           <div className="text-gray-200 text-center">
                             <FiFileText className="w-16 h-16 mx-auto mb-2 opacity-20" />
                             <p className="text-[10px] font-black uppercase tracking-widest">No Image</p>
                           </div>
                        )}
                     </div>

                     <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100 space-y-4">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">Description log</p>
                        <p className="text-sm font-medium text-gray-600 leading-relaxed italic italic">"{selectedMatch.lost_description || 'No description provided.'}"</p>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                           <div>
                              <p className="text-[9px] font-black text-gray-300 uppercase mb-1">District</p>
                              <p className="text-sm font-bold text-gray-800">{selectedMatch.lost_district}</p>
                           </div>
                           <div>
                              <p className="text-[9px] font-black text-gray-300 uppercase mb-1">Category</p>
                              <p className="text-sm font-bold text-gray-800">{selectedMatch.lost_category}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* FOUND SIDE */}
                  <div className="space-y-6">
                     <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                        <div className="w-10 h-10 bg-[#10b981] text-white rounded-lg flex items-center justify-center text-lg shadow-sm">
                           <FiCheckCircle />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 capitalize">{selectedMatch.found_item_type} <span className="text-xs font-medium text-gray-400 ml-2">(Found)</span></h3>
                     </div>

                     <div className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 aspect-video flex items-center justify-center overflow-hidden">
                        {selectedMatch.found_image ? (
                           <img src={getImageUrl(selectedMatch.found_image)} className="w-full h-full object-contain" alt="Found Asset" />
                        ) : (
                           <div className="text-gray-200 text-center">
                             <FiFileText className="w-16 h-16 mx-auto mb-2 opacity-20" />
                             <p className="text-[10px] font-black uppercase tracking-widest">No Image</p>
                           </div>
                        )}
                     </div>

                     <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100 space-y-4">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">Recovery Details</p>
                        <p className="text-sm font-medium text-gray-600 leading-relaxed italic">"{selectedMatch.found_description || 'No description provided.'}"</p>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                           <div>
                              <p className="text-[9px] font-black text-gray-300 uppercase mb-1">District</p>
                              <p className="text-sm font-bold text-gray-800">{selectedMatch.found_district}</p>
                           </div>
                           <div>
                              <p className="text-[9px] font-black text-gray-300 uppercase mb-1">Category</p>
                              <p className="text-sm font-bold text-gray-800">{selectedMatch.found_category}</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="px-10 py-8 bg-white border-t border-gray-100 flex flex-col md:flex-row items-center gap-8">
               {!selectedMatch.is_verified ? (
                  <>
                     <div className="flex-1 w-full grid grid-cols-2 gap-6">
                        <div>
                           <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2 px-1">Admin Fee (RWF)</label>
                           <input 
                             type="number" 
                             value={adminFee}
                             onChange={(e) => setAdminFee(e.target.value)}
                             className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-800 outline-none focus:border-[#10b981] transition-all"
                           />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2 px-1">Internal Notes</label>
                           <input 
                             type="text"
                             value={adminFeedback}
                             onChange={(e) => setAdminFeedback(e.target.value)}
                             className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm text-gray-800 outline-none focus:border-[#10b981] transition-all"
                           />
                        </div>
                     </div>
                     <div className="flex gap-3 w-full md:w-auto">
                        <button 
                          onClick={() => handleVerify(selectedMatch.id)}
                          disabled={verifyingMatch === selectedMatch.id}
                          className="flex-1 md:flex-none px-10 py-4 bg-[#10b981] text-white rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-lg hover:bg-black transition active:scale-95 flex items-center justify-center gap-2"
                        >
                          Verify Match
                        </button>
                        <button 
                          onClick={() => handleDeleteMatch(selectedMatch.id)}
                          className="px-8 py-4 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-black hover:text-white transition active:scale-95"
                        >
                          Dismiss
                        </button>
                     </div>
                  </>
               ) : !selectedMatch.is_unlocked ? (
                  <>
                     <div className="flex-1 bg-amber-50 rounded-2xl p-5 border border-amber-100 flex items-center gap-8">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm animate-pulse shrink-0">
                           <FiDollarSign className="text-2xl" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Awaiting Payment Clearance</p>
                           <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Payer: {selectedMatch.payment_name || 'N/A'} | {selectedMatch.payment_phone || 'N/A'}</p>
                        </div>
                     </div>
                     <div className="flex gap-3 w-full md:w-auto">
                        <button 
                          onClick={() => handleConfirmPayment(selectedMatch.id)}
                          disabled={confirmingPayment === selectedMatch.id}
                          className="flex-1 md:flex-none px-12 py-4 bg-[#10b981] text-white rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-lg hover:bg-black transition active:scale-95"
                        >
                          Confirm & Unlock
                        </button>
                        <button 
                          onClick={() => handleDeleteMatch(selectedMatch.id)}
                          className="px-8 py-4 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-black hover:text-white transition shadow-sm"
                        >
                          Dismiss
                        </button>
                     </div>
                  </>
               ) : (
                  <div className="w-full text-center py-4">
                     <span className="px-10 py-4 bg-emerald-50 text-[#10b981] rounded-full text-[11px] font-black uppercase tracking-widest border border-emerald-100 shadow-inner flex items-center justify-center gap-2 mx-auto max-w-sm">
                        <FiCheckCircle className="text-lg" /> Fully Synchronized
                     </span>
                  </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
