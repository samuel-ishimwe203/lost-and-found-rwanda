import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";
import { FiActivity, FiClock, FiUser, FiInfo, FiRefreshCw, FiSearch, FiLayers, FiAlertCircle, FiTerminal } from "react-icons/fi";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/logs");
      setLogs(response.data.data.logs || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch activity logs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center font-sans">
         <div className="w-16 h-16 border-4 border-emerald-100 border-t-[#10b981] rounded-full animate-spin mx-auto mb-6"></div>
         <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Loading Audit Trail...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-20 px-4 md:px-8 space-y-10 font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 py-8">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">System Audit Log</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium opacity-80 max-w-2xl text-center md:text-left">
            A comprehensive record of all administrative and user operations within the platform.
          </p>
        </div>
        <button 
          onClick={fetchLogs} 
          className="flex items-center gap-2 px-6 py-3 bg-[#10b981] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-[#0da472] transition-all active:scale-95"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh Stream
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center gap-4 text-red-600 font-bold text-sm">
          <FiAlertCircle className="w-6 h-6 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* SEARCH/FILTER */}
      <div className="relative group max-w-2xl mx-auto md:mx-0">
         <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within:text-[#10b981] transition-colors" />
         <input 
           type="text" 
           placeholder="Search logs by action, user, or entity..."
           className="w-full bg-white border border-gray-100 rounded-2xl py-5 px-14 text-sm font-medium text-gray-800 outline-none shadow-sm focus:border-[#10b981] transition-all"
         />
      </div>

      {/* LOGS TABLE */}
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden relative mb-20">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol Action</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">User Origin</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Scope</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Log details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center opacity-30">
                       <FiLayers className="w-12 h-12 text-gray-200 mb-4" />
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No activity logs recorded.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                          <FiClock className="w-4 h-4 text-[#10b981]" />
                          {new Date(log.created_at).toLocaleString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-950 text-white shadow-lg border border-slate-900 flex items-center gap-2 w-fit">
                         <FiTerminal className="w-3.5 h-3.5 text-[#10b981]" />
                         {log.action?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-[#10b981] font-bold">
                             {log.user_name?.charAt(0) || "S"}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-gray-900 leading-none">{log.user_name || "SYSTEM"}</p>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{log.user_email || "PLATFORM"}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-emerald-50 text-[#10b981] text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100">
                        {log.entity_type}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-xs font-medium text-gray-400 italic max-w-xs truncate overflow-hidden">
                       <div className="flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                          <FiInfo className="w-3.5 h-3.5 shrink-0" />
                          {log.details ? JSON.stringify(log.details) : "No session data"}
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}