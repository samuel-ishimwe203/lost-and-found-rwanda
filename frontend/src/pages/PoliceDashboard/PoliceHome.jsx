import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";
import { FiFileText, FiSearch, FiCheckCircle, FiClock, FiUpload, FiShield, FiArchive, FiActivity, FiChevronRight } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export default function PoliceHome() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { label: t("admin.totalItems"), value: 0, color: "text-[#10b981]" },
    { label: t("admin.activeItems"), value: 0, color: "text-[#10b981]" },
    { label: t("admin.returnedItems"), value: 0, color: "text-[#10b981]" },
    { label: t("admin.pendingMatches"), value: 0, color: "text-[#10b981]" },
  ]);
  const [loading, setLoading] = useState(true);

  const [recentActivities] = useState([
    { id: 1, action: "Authentication Success", description: t("police.verified"), time: t("activity.time.now") },
    { id: 2, action: "AI Engine Active", description: t("landing.aiBadge"), time: "System" },
  ]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/police/stats');
      if (response.data.success) {
        const data = response.data.data;
        setStats([
          { label: t("admin.totalItems"), value: data.totalUploads, color: "text-[#10b981]" },
          { label: t("admin.activeItems"), value: data.activeItems, color: "text-[#10b981]" },
          { label: t("admin.returnedItems"), value: data.returnedItems, color: "text-[#10b981]" },
          { label: t("admin.pendingMatches"), value: data.pendingClaims, color: "text-[#10b981]" },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch police stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-24">
      {/* WELCOME BANNER */}
      <div className="bg-[#10b981] p-8 md:p-12 rounded-[24px] shadow-xl relative overflow-hidden group">
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-24 h-24 rounded-full border-4 border-white/30 bg-white/20 text-white flex items-center justify-center text-3xl font-black shadow-2xl shrink-0">
             {user?.full_name?.charAt(0) || 'P'}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
              {t("admin.welcomeBack")}, {user?.full_name?.split(' ')[0] || t("police.officerName")}!
            </h1>
            <p className="text-white text-base md:text-lg opacity-90 max-w-2xl font-medium">
              {t("police.dashboard")}
            </p>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[16px] shadow-sm border border-gray-100 transition-all hover:shadow-md">
             <div className="flex flex-col">
                <p className={`text-4xl font-bold ${stat.color} mb-1`}>{loading ? '...' : stat.value}</p>
                <p className="text-xs font-bold text-gray-400 capitalize">{stat.label}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 px-1">{t("dashboard.statistics")}</h2>
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">{t("police.activityLog")}</p>
               </div>
               <div className="divide-y divide-gray-50">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                       <div className="min-w-0">
                          <p className="font-bold text-gray-800 text-sm">{activity.action}</p>
                          <p className="text-xs text-gray-400 font-medium italic truncate">{activity.description}</p>
                       </div>
                       <span className="text-[9px] font-black text-gray-300 uppercase shrink-0">{activity.time}</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 px-1">{t("dashboard.statistics")}</h2>
            <div className="bg-slate-950 p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
               <div className="relative z-10 space-y-6">
                  <div>
                     <p className="text-[9px] font-black text-[#10b981] uppercase tracking-[0.2em] mb-2">{t("police.verified")}</p>
                     <h4 className="text-xl font-black italic uppercase tracking-tighter">{t("police.policeOperations")}</h4>
                  </div>
                  <div className="space-y-3">
                     {[
                        { label: t("police.postOfficialDocument"), path: "/police-dashboard/upload-document" },
                        { label: t("police.manageClaims"), path: "/police-dashboard/manage-claims" },
                        { label: t("police.returnedDocuments"), path: "/police-dashboard/returned-documents" }
                     ].map((btn, i) => (
                        <button 
                           key={i}
                           onClick={() => window.location.href = btn.path}
                           className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white text-slate-400 hover:text-slate-900 transition-all font-black text-[10px] uppercase tracking-widest group/btn"
                        >
                           {btn.label}
                           <FiChevronRight className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}