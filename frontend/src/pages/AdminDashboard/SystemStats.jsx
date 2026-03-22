import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";
import { FiActivity, FiDatabase, FiRefreshCw, FiServer, FiTrendingUp, FiUsers, FiLayers, FiShield, FiDollarSign } from "react-icons/fi";
import { useLanguage } from "../../context/LanguageContext";

export default function SystemStats() {
  const { t } = useLanguage();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [chartData] = useState({
    weekly: [45, 52, 48, 61, 55, 67, 72],
    days: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/stats");
      setStatsData(response.data.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || t("admin.telemetryLoading"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
     return (
       <div className="p-12 text-center">
          <div className="w-16 h-16 border-4 border-emerald-100 border-t-[#10b981] rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{t("admin.telemetryLoading")}</p>
       </div>
     );
  }

  const displayStats = [
    { 
      category: t("admin.incidentReports"), 
      icon: <FiLayers className="w-6 h-6 text-[#10b981]" />,
      total: statsData?.lostItems?.total || 0, 
      details: [
        { label: t("status.active"), value: statsData?.lostItems?.active || 0 },
        { label: t("admin.pendingMatches"), value: statsData?.lostItems?.matched || 0 },
        { label: t("status.resolved"), value: statsData?.lostItems?.resolved || 0 }
      ]
    },
    { 
      category: t("admin.recoveryRecords"), 
      icon: <FiDatabase className="w-6 h-6 text-[#10b981]" />,
      total: statsData?.foundItems?.total || 0, 
      details: [
        { label: t("admin.awaitingClaim"), value: statsData?.foundItems?.active || 0 },
        { label: t("admin.policeLogs"), value: statsData?.foundItems?.policeUploads || 0 }
      ]
    },
    { 
      category: t("admin.userInfrastructure"), 
      icon: <FiUsers className="w-6 h-6 text-[#10b981]" />,
      total: statsData?.users?.total || 0, 
      details: [
         { label: t("admin.citizens"), value: (statsData?.users?.losers || 0) + (statsData?.users?.finders || 0) },
         { label: t("admin.authorities"), value: statsData?.users?.police || 0 },
         { label: t("admin.admins"), value: statsData?.users?.admins || 0 }
      ]
    },
    { 
      category: t("admin.matchProtocols"), 
      icon: <FiActivity className="w-6 h-6 text-[#10b981]" />,
      total: statsData?.matches?.total || 0, 
      details: [
        { label: t("status.pending"), value: statsData?.matches?.pending || 0 },
        { label: t("matches.confirmed"), value: statsData?.matches?.confirmed || 0 },
        { label: t("status.returned"), value: statsData?.matches?.completed || 0 }
      ]
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto pb-20 px-4 md:px-8 space-y-10 font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 py-8">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight text-center md:text-left">{t("admin.systemAnalytics")}</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium text-center md:text-left">{t("admin.systemAnalyticsSubtitle")}</p>
        </div>
        <button 
          onClick={fetchStats}
          className="flex items-center gap-2 px-6 py-3 bg-[#10b981] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-[#0da472] transition-all active:scale-95"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} /> {t("admin.refreshData")}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-red-600 font-bold text-sm">
           {error}
        </div>
      )}

      {/* CORE METRICS GRID */}
      <div className="grid md:grid-cols-2 gap-8">
        {displayStats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 hover:border-[#10b981]/30 transition-all group">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-[#10b981] group-hover:text-white transition-all">
                     {stat.icon}
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">{stat.category}</h3>
               </div>
               <div className="bg-gray-100 px-4 py-2 rounded-xl">
                  <span className="text-gray-600 font-black text-xs uppercase tracking-widest leading-none">{t("admin.totalItems")}: {stat.total}</span>
               </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {stat.details.map((detail, dIdx) => (
                <div key={dIdx} className="bg-gray-50 p-6 rounded-[16px] border border-gray-100/50 text-center hover:bg-white hover:shadow-md transition-all">
                   <p className="text-2xl font-bold text-gray-900 mb-1">{detail.value}</p>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{detail.label}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FINANCIAL OVERVIEW */}
      <div className="bg-slate-950 rounded-[32px] p-10 md:p-14 relative overflow-hidden shadow-xl text-white">
         <div className="absolute top-0 right-0 w-96 h-96 bg-[#10b981] rounded-full blur-[120px] opacity-10 -mr-48 -mt-48"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="text-center md:text-left">
               <div className="flex items-center justify-center md:justify-start gap-3 mb-4 text-[#10b981]">
                  <FiDollarSign className="w-8 h-8" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t("admin.financialHub")}</span>
               </div>
               <h2 className="text-3xl md:text-4xl font-bold tracking-tight uppercase">{t("admin.rewardCommitments")}</h2>
               <p className="text-white/40 mt-3 font-medium text-sm max-w-sm italic">{t("admin.rewardCommitmentsSubtitle")}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full md:w-auto">
               <div className="bg-white/5 border border-white/10 p-8 rounded-[24px] min-w-[280px]">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">{t("admin.totalOffered")}</p>
                  <p className="text-3xl font-bold text-white tracking-tight">
                    {new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(statsData?.rewards?.totalOffered || 0)}
                  </p>
               </div>

               <div className="bg-[#10b981]/10 border border-[#10b981]/20 p-8 rounded-[24px] min-w-[280px]">
                  <p className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.2em] mb-2">{t("admin.totalPaid")}</p>
                  <p className="text-3xl font-bold text-white tracking-tight">
                    {new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(statsData?.rewards?.totalPaid || 0)}
                  </p>
               </div>
            </div>
         </div>
      </div>

      {/* ACTIVITY CHART */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 text-center md:text-left">
           <div>
              <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">{t("admin.activityTraffic")}</h2>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">{t("admin.activityTrafficSubtitle")}</p>
           </div>
           <div className="flex gap-2 items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse"></span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("admin.liveMonitoring")}</span>
           </div>
        </div>
        
        <div className="flex items-end justify-around h-60 gap-3">
          {chartData.weekly.map((value, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1">
              <div className="w-full max-w-[32px] bg-gray-50 rounded-xl overflow-hidden h-full flex items-end">
                 <div 
                   className="w-full bg-gray-200 hover:bg-[#10b981] transition-all duration-500 rounded-t-xl" 
                   style={{height: `${(value / 72) * 100}%`}}
                 >
                 </div>
              </div>
              <p className="text-[10px] font-bold text-gray-400 mt-4 tracking-widest">{chartData.days[idx]}</p>
              <p className="text-xs font-black text-gray-900 mt-1 italic">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PERFORMANCE METRICS */}
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { 
            label: t("admin.nodeUptime"), 
            value: "99.99%", 
            icon: <FiServer className="w-6 h-6 text-[#10b981]" />,
            status: t("admin.active")
          },
          { 
            label: t("admin.syncSpeed"), 
            value: "245ms", 
            icon: <FiTrendingUp className="w-6 h-6 text-blue-500" />,
            status: "Optimal"
          },
          { 
            label: t("admin.registryNode"), 
            value: "2.4 GB", 
            icon: <FiShield className="w-6 h-6 text-teal-600" />,
            status: t("admin.online")
          }
        ].map((node, idx) => (
          <div key={idx} className="bg-gray-50/50 p-8 rounded-[24px] border border-gray-100 transition-all hover:bg-white hover:shadow-lg group">
             <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-[#10b981] group-hover:text-white transition-all">
                   {node.icon}
                </div>
                <span className="px-3 py-1 bg-[#10b981]/10 text-[#10b981] text-[9px] font-black uppercase tracking-widest rounded-lg">
                   {node.status}
                </span>
             </div>
             <p className="text-3xl font-bold text-gray-900 mb-1">{node.value}</p>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{node.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}