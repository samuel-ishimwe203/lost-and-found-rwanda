import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";
import { FiShield, FiUser, FiMail, FiMapPin, FiCalendar, FiCheck, FiX, FiLayers, FiAlertCircle, FiSearch, FiFileText } from "react-icons/fi";

export default function ManagePoliceRegistrations() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalRemarks, setApprovalRemarks] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [action, setAction] = useState(null); // 'approve' or 'reject'

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/police/pending");
      setPendingRequests(response.data.data.pendingRequests || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch pending requests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setAction("approve");
    setApprovalRemarks("");
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setAction("reject");
    setRejectionReason("");
  };

  const submitApproval = async () => {
    if (!selectedRequest) return;

    try {
      await apiClient.post(`/admin/police/approve/${selectedRequest.id}`, {
        remarks: approvalRemarks
      });
      fetchPendingRequests();
      setSelectedRequest(null);
      setAction(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve registration");
    }
  };

  const submitRejection = async () => {
    if (!selectedRequest || !rejectionReason) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      await apiClient.post(`/admin/police/reject/${selectedRequest.id}`, {
        reason: rejectionReason
      });
      fetchPendingRequests();
      setSelectedRequest(null);
      setAction(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject registration");
    }
  };

  if (loading) {
     return (
       <div className="p-12 text-center font-sans">
          <div className="w-16 h-16 border-4 border-emerald-100 border-t-[#10b981] rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Validating Queue...</p>
       </div>
     );
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-20 px-4 md:px-8 space-y-10 font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 py-8">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Authority Onboarding</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium opacity-80 max-w-2xl text-center md:text-left">
            Review and validate registration requests for official police and security personnel.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center gap-4 text-red-600 font-bold text-sm">
          <FiAlertCircle className="w-6 h-6 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {pendingRequests.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[32px] p-24 text-center shadow-sm relative overflow-hidden group">
          <FiShield className="w-16 h-16 text-gray-100 mx-auto mb-6 transition-transform group-hover:scale-110 duration-500" />
          <p className="text-gray-900 font-bold text-xl uppercase tracking-tight">Queue Clear</p>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">No pending authority requests.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-slate-950 text-white rounded-[24px] p-6 flex items-center justify-between shadow-lg">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-[#10b981]">
                   <FiLayers />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Validation Queue</p>
                   <p className="text-lg font-bold text-white">{pendingRequests.length} Pending Requests</p>
                </div>
             </div>
          </div>

          <div className="grid gap-8">
            {pendingRequests.map((request) => (
              <div key={request.id} className="bg-white border border-gray-100 rounded-[32px] p-8 md:p-12 shadow-sm hover:shadow-md transition-all group">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
                  <div className="space-y-10">
                    <div>
                      <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-6">Identity Profile</h3>
                      <div className="grid grid-cols-2 gap-8 text-center md:text-left">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Name</p>
                          <p className="text-lg font-bold text-gray-900">{request.full_name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Rank</p>
                          <p className="text-lg font-bold text-gray-900">{request.rank}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Badge</p>
                          <p className="text-lg font-bold text-gray-900">#{request.badge_number}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date Applied</p>
                          <p className="text-lg font-bold text-gray-900">{new Date(request.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-gray-50 text-center md:text-left">
                       <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-6">Assigned Hub</h3>
                       <div className="flex flex-col md:flex-row items-center gap-4 bg-gray-50 p-6 rounded-[24px] border border-gray-100">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#10b981] shadow-sm">
                             <FiMapPin className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-gray-900 text-center md:text-left">{request.police_station}</p>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 text-center md:text-left">{request.district}</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-10 lg:pl-10 lg:border-l border-gray-50">
                    <div>
                      <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-6 text-center lg:text-left">Communication</h3>
                      <div className="space-y-5">
                         <div className="flex items-center gap-4 justify-center lg:justify-start">
                            <FiMail className="w-4 h-4 text-[#10b981]" />
                            <p className="text-sm font-bold text-gray-700">{request.email}</p>
                         </div>
                         <div className="flex items-center gap-4 justify-center lg:justify-start">
                            <FiFileText className="w-4 h-4 text-[#10b981]" />
                            <p className="text-sm font-bold text-gray-700">{request.phone_number}</p>
                         </div>
                      </div>
                    </div>

                    {request.document_url && (
                      <div className="bg-slate-900 p-8 rounded-[24px] shadow-lg group/doc transition-colors hover:bg-black">
                         <div className="flex justify-between items-center mb-4">
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Verification Link</p>
                            <FiShield className="text-[#10b981]" />
                         </div>
                         <a
                          href={request.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white font-bold text-[10px] uppercase tracking-widest hover:bg-[#10b981] transition-all"
                        >
                          <FiFileText /> View Official Mandate
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-8 border-t border-gray-50">
                  <button
                    onClick={() => handleApprove(request)}
                    className="flex-1 px-8 py-4 bg-[#10b981] text-white rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-lg hover:bg-[#0da472] transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <FiCheck /> Approve Account
                  </button>
                  <button
                    onClick={() => handleReject(request)}
                    className="flex-1 px-8 py-4 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <FiX /> Deny Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTION MODAL */}
      {selectedRequest && action && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => { setAction(null); setSelectedRequest(null); }}></div>
           <div className="relative bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden p-10 md:p-14 animate-in zoom-in-95 duration-500 border border-gray-100">
              <div className="text-center mb-8">
                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl ${action === 'approve' ? 'bg-[#10b981] text-white' : 'bg-red-600 text-white'}`}>
                    {action === 'approve' ? <FiCheck className="text-3xl" /> : <FiX className="text-3xl" />}
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900 uppercase tracking-tight mb-1">
                    {action === 'approve' ? 'Approve Access' : 'Deny Access'}
                 </h3>
                 <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest font-sans">{selectedRequest.full_name}</p>
              </div>

              <div className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2 px-1">
                       {action === 'approve' ? 'Approval Note' : 'Rejection Reason'}
                    </label>
                    <textarea
                      value={action === 'approve' ? approvalRemarks : rejectionReason}
                      onChange={(e) => action === 'approve' ? setApprovalRemarks(e.target.value) : setRejectionReason(e.target.value)}
                      placeholder={action === 'approve' ? "Optional notes..." : "Required reason for denial..."}
                      className={`w-full bg-gray-50 border border-gray-100 rounded-xl px-6 py-4 font-bold text-gray-800 transition-all outline-none resize-none shadow-sm focus:border-gray-300`}
                      rows="3"
                    />
                 </div>

                 <div className="flex gap-3">
                    <button
                      onClick={() => { setAction(null); setSelectedRequest(null); }}
                      className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-200 transition"
                    >
                      Abort
                    </button>
                    <button
                      onClick={action === 'approve' ? submitApproval : submitRejection}
                      className={`flex-1 py-4 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg transition active:scale-95 ${action === 'approve' ? 'bg-[#10b981] hover:bg-[#0da472]' : 'bg-red-600 hover:bg-black'}`}
                    >
                      Confirm Action
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
