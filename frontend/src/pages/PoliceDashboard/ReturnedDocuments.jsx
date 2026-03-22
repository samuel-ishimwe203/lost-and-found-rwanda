import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";
import { FiCheckCircle, FiFileText, FiArrowUpRight, FiSearch, FiLayers, FiCalendar, FiClock } from "react-icons/fi";
import { useLanguage } from "../../context/LanguageContext";

export default function ReturnedDocuments() {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReturnedDocuments();
  }, []);

  const fetchReturnedDocuments = async () => {
    try {
      const response = await apiClient.get('/police/returned-documents');
      if (response.data.success) {
        setDocuments(response.data.data.returnedDocuments);
      }
    } catch (err) {
      console.error('Error fetching returned documents:', err);
      setError(t("messages.operationFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
         <div className="w-16 h-16 border-4 border-emerald-100 border-t-[#10b981] rounded-full animate-spin mx-auto mb-6"></div>
         <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{t("police.loadingArchives")}</p>
      </div>
    );
  }

  const currentMonth = new Date().getMonth();
  const returnedThisMonth = documents.filter(doc => new Date(doc.resolved_at).getMonth() === currentMonth).length;

  return (
    <div className="max-w-[1400px] mx-auto pb-20 px-4 md:px-8 space-y-10 font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 py-8">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{t("police.successRegistry")}</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium italic opacity-80 max-w-2xl text-center md:text-left">
            {t("police.registrySubtitle")}
          </p>
        </div>
      </div>

      {/* STATS ANALYTICS GRID */}
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { 
            label: t("police.totalRecoveries"), 
            value: documents.length, 
            sub: t("police.itemsReturnedToDate"), 
            icon: <FiCheckCircle className="w-6 h-6 text-[#10b981]" />,
            bg: "bg-white"
          },
          { 
            label: t("police.systemVelocity"), 
            value: "100%", 
            sub: t("police.matchCompletionRate"), 
            icon: <FiArrowUpRight className="w-6 h-6 text-white" />,
            bg: "bg-slate-950",
            dark: true
          },
          { 
            label: t("police.monthlyReturns"), 
            value: returnedThisMonth, 
            sub: t("police.successfulHandovers"), 
            icon: <FiCalendar className="w-6 h-6 text-[#10b981]" />,
            bg: "bg-[#10b981]/5"
          }
        ].map((stat, idx) => (
          <div key={idx} className={`${stat.bg} ${stat.dark ? 'text-white' : 'text-gray-900'} p-10 rounded-[28px] shadow-sm border ${stat.dark ? 'border-none' : 'border-gray-100'} transition-all hover:shadow-md group`}>
            <div className="flex flex-col items-center text-center">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${stat.dark ? 'bg-white/10' : 'bg-gray-50'}`}>
                {stat.icon}
              </div>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${stat.dark ? 'opacity-40' : 'text-gray-300'}`}>{stat.label}</p>
              <p className="text-4xl font-bold mb-3">{stat.value}</p>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${stat.dark ? 'text-[#10b981]' : 'text-gray-400'}`}>{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center gap-4 text-red-600">
          <FiFileText className="w-6 h-6 shrink-0" />
          <p className="font-bold text-sm tracking-tight">{error}</p>
        </div>
      )}

      {/* SEARCH/FILTER */}
      <div className="relative group max-w-2xl">
         <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within:text-[#10b981] transition-colors" />
         <input 
           type="text" 
           placeholder={t("police.searchArchives")}
           className="w-full bg-white border border-gray-100 rounded-2xl py-5 px-14 text-sm font-medium text-gray-800 outline-none shadow-sm focus:border-[#10b981] transition-all"
         />
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden relative mb-20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("police.returnedItem")}</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("police.recipient")}</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("police.resolvedOn")}</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("police.resolution")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center opacity-30">
                       <FiLayers className="w-12 h-12 text-gray-200 mb-4" />
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("police.archivesEmpty")}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-[#10b981] shrink-0 font-bold">
                            <FiFileText className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-gray-900">{doc.item_type}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Record #{doc.id}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <p className="text-sm font-bold text-gray-800">{doc.owner_name || 'Citizen'}</p>
                       <p className="text-[11px] font-bold text-[#10b981]">{doc.owner_phone || 'N/A'}</p>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                          <FiClock className="w-3.5 h-3.5" />
                          {new Date(doc.resolved_at).toLocaleDateString()}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#10b981] text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5 w-fit">
                         <FiCheckCircle className="w-3.5 h-3.5" /> {t("police.successfullyReturned")}
                      </span>
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