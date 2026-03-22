import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";
import { FiCheckCircle, FiXCircle, FiInfo, FiSearch, FiLayers, FiCheck } from "react-icons/fi";
import { useLanguage } from "../../context/LanguageContext";

export default function ManageClaims() {
  const { t } = useLanguage();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/police/claims');
      if (response.data.success) {
        setClaims(response.data.data.claims);
      }
    } catch (err) {
      console.error('Error fetching claims:', err);
      setError(t("police.loadingQueue") + " (Failed)");
    } finally {
      setLoading(false);
    }
  };

  const updateMatchStatus = async (matchId, newStatus) => {
    try {
      await apiClient.put(`/matches/${matchId}/status`, { status: newStatus });
      fetchClaims();
    } catch (err) {
      console.error('Error updating claim:', err);
      alert(t("messages.operationFailed"));
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
         <div className="w-16 h-16 border-4 border-emerald-100 border-t-[#10b981] rounded-full animate-spin mx-auto mb-6"></div>
         <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{t("police.loadingQueue")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-20 px-4 md:px-8 space-y-10 font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 py-8">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{t("police.verifyClaims")}</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium italic opacity-80 max-w-2xl text-center md:text-left">
            {t("police.claimsSubtitle")}
          </p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center min-w-[140px]">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1 leading-none">{t("police.inQueue")}</p>
              <p className="text-2xl font-bold text-gray-900 leading-none">{claims.length}</p>
           </div>
           <div className="bg-[#10b981] p-6 rounded-2xl shadow-lg text-center min-w-[140px]">
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1 leading-none">Service</p>
              <p className="text-2xl font-bold text-white leading-none">{t("landing.statsCategories")}</p>
           </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center gap-4 text-red-600">
           <FiXCircle className="w-6 h-6 shrink-0" />
           <p className="font-bold text-sm">{error}</p>
        </div>
      )}

      {/* SEARCH/FILTER */}
      <div className="relative group max-w-2xl mx-auto md:mx-0">
         <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within:text-[#10b981] transition-colors" />
         <input 
           type="text" 
           placeholder={t("police.searchPlaceholder")}
           className="w-full bg-white border border-gray-100 rounded-2xl py-5 px-14 text-sm font-medium text-gray-800 outline-none shadow-sm focus:border-[#10b981] transition-all"
         />
      </div>

      {/* CLAIMS TABLE */}
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("police.assetDetails")}</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("police.claimant")}</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("police.matchScore")}</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("matches.status")}</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("police.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {claims.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center opacity-30">
                       <FiLayers className="w-12 h-12 text-gray-200 mb-4" />
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("police.noClaims")}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-[#10b981] shrink-0 font-bold">
                            <FiInfo className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-gray-900">{claim.found_item_type}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{claim.location_found}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <p className="text-sm font-bold text-gray-800">{claim.claimer_name}</p>
                       <p className="text-[11px] font-bold text-[#10b981]">{claim.claimer_phone}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-900 text-white rounded-full text-[10px] font-bold tracking-widest">
                         <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-pulse"></div>
                         {claim.match_score}% {t("police.matchScore")}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        claim.status === "pending" ? "bg-amber-50 text-amber-600 border-amber-100" :
                        claim.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        claim.status === "confirmed" ? "bg-blue-50 text-blue-600 border-blue-100" :
                        "bg-red-50 text-red-600 border-red-100"
                      }`}>
                         {t(`police.${claim.status}`) || claim.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right space-x-2">
                      {claim.status === "pending" || claim.status === "confirmed" ? (
                        <div className="flex justify-end gap-2">
                           <button onClick={() => updateMatchStatus(claim.id, 'completed')} className="w-10 h-10 bg-[#10b981] text-white rounded-xl shadow hover:bg-[#0da472] transition flex items-center justify-center active:scale-95">
                              <FiCheck />
                           </button>
                           <button onClick={() => updateMatchStatus(claim.id, 'rejected')} className="w-10 h-10 bg-red-600 text-white rounded-xl shadow hover:bg-black transition flex items-center justify-center active:scale-95">
                              <FiXCircle />
                           </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">{t("police.closed")}</span>
                      )}
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