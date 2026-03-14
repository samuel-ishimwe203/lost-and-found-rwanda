
import React, { useState, useEffect } from 'react';
import { 
  FiCheckCircle, FiXCircle, FiDollarSign, FiInfo, FiExternalLink, 
  FiClock, FiShield, FiAlertCircle, FiSearch, FiFilter, FiEye,
  FiUser, FiMapPin, FiCalendar, FiFileText, FiX
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
      alert('✅ Match verified successfully! Notification sent to user.');
      fetchMatches();
      setVerifyingMatch(null);
    } catch (err) {
      alert('❌ Failed to verify match: ' + (err.response?.data?.message || err.message));
      setVerifyingMatch(null);
    }
  };

  const handleConfirmPayment = async (matchId) => {
    if (!window.confirm('Confirm that you have received the payment for this match?')) return;
    try {
      setConfirmingPayment(matchId);
      await apiClient.post(`/admin/matches/confirm-payment/${matchId}`);
      alert('✅ Payment confirmed! Match is now unlocked for both users.');
      fetchMatches();
      setConfirmingPayment(null);
    } catch (err) {
      alert('❌ Failed to confirm payment: ' + (err.response?.data?.message || err.message));
      setConfirmingPayment(null);
    }
  };

  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm('Are you sure you want to dismiss this match? Both items will be returned to ACTIVE status, and all related messages and notifications will be deleted.')) return;
    try {
      await apiClient.delete(`/matches/${matchId}`);
      alert('✅ Match dismissed successfully.');
      fetchMatches();
      setIsCompareModalOpen(false);
    } catch (err) {
      alert('❌ Failed to dismiss match: ' + (err.response?.data?.message || err.message));
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

  if (loading) return <div className="p-8 text-center animate-pulse text-slate-400 font-black uppercase tracking-widest py-32">Loading matches...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight">Match Verification</h1>
          <p className="text-slate-500 mt-2 font-medium">Review, compare, and unlock matches for users.</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search users or items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white rounded-2xl border border-slate-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition w-full md:w-64 shadow-sm font-bold text-sm"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-6 py-3 bg-white rounded-2xl border border-slate-200 outline-none font-bold text-sm shadow-sm"
          >
            <option value="all">All Matches</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="pending_payment">Awaiting Payment</option>
            <option value="verified">Verified</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredMatches.map((match) => (
          <div key={match.id} className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden group hover:border-green-200 transition-all duration-300">
            <div className="flex flex-col lg:flex-row">
              {/* Lost Item Preview */}
              <div className="lg:w-1/3 bg-slate-50 p-8 flex flex-col justify-center border-r border-slate-100">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xl shadow-lg shadow-black/20">
                     <FiAlertCircle />
                   </div>
                   <div className="flex-1">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lost Posting</p>
                     <h3 className="text-xl font-black text-slate-900 truncate">{match.lost_item_type}</h3>
                   </div>
                   <button 
                    onClick={() => { setSelectedMatch(match); setIsCompareModalOpen(true); }}
                    className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md hover:bg-slate-900 hover:text-white transition"
                    title="Compare Details"
                   >
                     <FiEye />
                   </button>
                </div>
                <div className="space-y-3">
                   <p className="text-xs font-bold text-slate-600 flex items-center gap-2"><FiUser className="text-slate-400" /> {match.loser_name}</p>
                   <p className="text-xs font-bold text-slate-400 truncate tracking-tight">{match.loser_email}</p>
                   <div className="pt-2">
                     <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-tight">
                       Reward: {match.reward_amount || 0} RWF
                     </span>
                   </div>
                </div>
              </div>

              {/* Found Item Preview */}
              <div className="lg:w-1/3 bg-white p-8 border-r border-slate-100">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 bg-green-600 text-white rounded-xl flex items-center justify-center text-xl shadow-lg shadow-green-600/20">
                     <FiCheckCircle />
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Found Discovery</p>
                     <h3 className="text-xl font-black text-slate-900 truncate uppercase tracking-tight">{match.found_item_type}</h3>
                   </div>
                </div>
                <div className="space-y-3">
                   <p className="text-xs font-bold text-slate-600 flex items-center gap-2"><FiUser className="text-slate-400" /> {match.finder_name}</p>
                   <p className="text-xs font-bold text-slate-400 truncate tracking-tight">{match.finder_email}</p>
                   <div className="pt-2 flex items-center gap-2">
                     <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-tight">
                       Confidence: {Math.round(match.match_score)}%
                     </span>
                     {match.is_police_upload && (
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-tight">Police</span>
                     )}
                   </div>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="lg:w-1/3 p-8 bg-slate-50 flex flex-col justify-center">
                {match.is_verified ? (
                  <div className="text-center p-6 bg-white rounded-3xl border border-green-100 shadow-sm">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiShield className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-black text-slate-900 mb-1 leading-none uppercase tracking-tight">Verified</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Platform Fee: {match.admin_fee} RWF</p>
                    
                    {!match.is_unlocked && (
                       <div className="space-y-4">
                          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-left">
                             <p className="text-[10px] font-black text-amber-600 uppercase mb-1 flex items-center gap-1"><FiDollarSign /> User Payment Details</p>
                             <p className="text-xs font-bold text-slate-700">Method: {match.payment_method || 'PENDING'}</p>
                             <p className="text-xs font-bold text-slate-700">Phone: {match.payment_phone || 'N/A'}</p>
                             <p className="text-xs font-bold text-slate-700">Name: {match.payment_name || 'N/A'}</p>
                             <p className="text-xs font-bold text-slate-700">TX ID: {match.transaction_id || 'N/A'}</p>
                          </div>
                          <button 
                            onClick={() => handleConfirmPayment(match.id)}
                            disabled={confirmingPayment === match.id}
                            className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black text-sm hover:bg-amber-600 transition shadow-lg shadow-amber-500/20"
                          >
                            {confirmingPayment === match.id ? 'Processing...' : 'Confirm Payment & Unlock'}
                          </button>
                       </div>
                    )}

                    {match.is_unlocked && (
                       <div className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest">
                         ✅ Unlocked & In Contact
                       </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Set Platform Fee (RWF)</label>
                      <div className="relative">
                        <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="number" 
                          value={adminFee}
                          onChange={(e) => setAdminFee(e.target.value)}
                          className="w-full pl-8 pr-4 py-2 bg-slate-50 rounded-xl outline-none font-bold text-slate-700"
                        />
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Internal Feedback / Note</label>
                       <textarea 
                        value={adminFeedback}
                        onChange={(e) => setAdminFeedback(e.target.value)}
                        className="w-full p-3 bg-slate-50 rounded-xl outline-none font-medium text-slate-600 text-xs h-20 resize-none"
                       />
                    </div>
                    <button
                      onClick={() => handleVerify(match.id)}
                      disabled={verifyingMatch === match.id}
                      className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-green-600/20 hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      {verifyingMatch === match.id ? 'Processing...' : 'Verify & Send Notification'}
                    </button>
                    <button
                      onClick={() => handleDeleteMatch(match.id)}
                      className="w-full py-3 bg-red-50 text-red-600 rounded-2xl font-black text-xs hover:bg-red-100 transition"
                    >
                      Dismiss This Match
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredMatches.length === 0 && (
          <div className="p-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
             <FiFilter className="w-16 h-16 mx-auto text-slate-200 mb-4" />
             <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No matches found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* COMPARE MODAL */}
      {isCompareModalOpen && selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" onClick={() => setIsCompareModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-6xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            
            {/* Modal Header */}
            <div className="px-10 py-8 bg-slate-900 text-white flex justify-between items-center relative">
               <div>
                  <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                    <FiShield className="text-green-500" /> Match Verification Analysis
                  </h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Comparing Match ID: {selectedMatch.id}</p>
               </div>
               <button 
                onClick={() => setIsCompareModalOpen(false)}
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition"
               >
                 <FiX />
               </button>
            </div>

            {/* Comparison Side-by-Side */}
            <div className="flex-1 overflow-y-auto p-10">
               <div className="grid md:grid-cols-2 gap-10">
                  
                  {/* LOST ITEM SIDE */}
                  <div className="space-y-6">
                     <div className="flex items-center gap-4 border-b-2 border-slate-100 pb-4">
                        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-xl">
                          <FiAlertCircle />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lost Side</p>
                           <h3 className="text-xl font-black text-slate-900">{selectedMatch.lost_item_type}</h3>
                        </div>
                     </div>

                     <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 aspect-video flex items-center justify-center">
                        {selectedMatch.lost_image ? (
                           <img src={getImageUrl(selectedMatch.lost_image)} className="w-full h-full object-contain" alt="Lost" />
                        ) : (
                           <div className="text-slate-300 text-center">
                             <FiExternalLink className="w-12 h-12 mx-auto mb-2 opacity-20" />
                             <p className="text-xs font-bold uppercase tracking-widest">No Image</p>
                           </div>
                        )}
                     </div>

                     <div className="space-y-4">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FiInfo /> Description</h4>
                           <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{selectedMatch.lost_description || 'No description provided.'}"</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</h4>
                              <p className="text-sm font-black text-slate-800">{selectedMatch.lost_category}</p>
                           </div>
                           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">District</h4>
                              <p className="text-sm font-black text-slate-800">{selectedMatch.lost_district}</p>
                           </div>
                        </div>
                        {selectedMatch.lost_ocr_text && (
                           <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><FiFileText /> OCR Data</h4>
                             <p className="text-[10px] font-mono text-green-400 leading-tight whitespace-pre-wrap">{selectedMatch.lost_ocr_text}</p>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* FOUND ITEM SIDE */}
                  <div className="space-y-6">
                     <div className="flex items-center gap-4 border-b-2 border-slate-100 pb-4">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-xl">
                          <FiCheckCircle />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Found Side</p>
                           <h3 className="text-xl font-black text-slate-900">{selectedMatch.found_item_type}</h3>
                        </div>
                     </div>

                     <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 aspect-video flex items-center justify-center">
                        {selectedMatch.found_image ? (
                           <img src={getImageUrl(selectedMatch.found_image)} className="w-full h-full object-contain" alt="Found" />
                        ) : (
                           <div className="text-slate-300 text-center">
                             <FiExternalLink className="w-12 h-12 mx-auto mb-2 opacity-20" />
                             <p className="text-xs font-bold uppercase tracking-widest">No Image</p>
                           </div>
                        )}
                     </div>

                     <div className="space-y-4">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FiInfo /> Description</h4>
                           <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{selectedMatch.found_description || 'No description provided.'}"</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</h4>
                              <p className="text-sm font-black text-slate-800">{selectedMatch.found_category}</p>
                           </div>
                           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">District</h4>
                              <p className="text-sm font-black text-slate-800">{selectedMatch.found_district}</p>
                           </div>
                        </div>
                        {selectedMatch.found_ocr_text && (
                           <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><FiFileText /> OCR Data</h4>
                             <p className="text-[10px] font-mono text-green-400 leading-tight whitespace-pre-wrap">{selectedMatch.found_ocr_text}</p>
                           </div>
                        )}
                     </div>
                  </div>

               </div>
            </div>

            {/* Modal Actions */}
            {!selectedMatch.is_verified && (
               <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
                  <div className="flex-1 flex items-center gap-4">
                    <div className="relative flex-1 max-w-[200px]">
                       <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input 
                         type="number" 
                         value={adminFee}
                         onChange={(e) => setAdminFee(e.target.value)}
                         className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl font-black text-slate-800"
                       />
                    </div>
                    <input 
                      type="text"
                      value={adminFeedback}
                      onChange={(e) => setAdminFeedback(e.target.value)}
                      placeholder="Feedback to user..."
                      className="flex-1 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-medium text-slate-600"
                    />
                  </div>
                   <button 
                     onClick={() => handleVerify(selectedMatch.id)}
                     className="px-10 py-3 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition shadow-xl shadow-green-600/20"
                   >
                     Approve & Verify
                   </button>
                   <button 
                     onClick={() => handleDeleteMatch(selectedMatch.id)}
                     className="px-6 py-3 bg-red-100 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-200 transition"
                   >
                     Dismiss Match
                   </button>
                </div>
             )}
             {selectedMatch.is_verified && !selectedMatch.is_unlocked && (
                <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
                   <button 
                     onClick={() => handleConfirmPayment(selectedMatch.id)}
                     className="px-10 py-3 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition shadow-xl shadow-amber-500/20"
                   >
                     Confirm & Unlock
                   </button>
                   <button 
                     onClick={() => handleDeleteMatch(selectedMatch.id)}
                     className="px-6 py-3 bg-red-100 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-200 transition"
                   >
                     Dismiss Match
                   </button>
                </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
