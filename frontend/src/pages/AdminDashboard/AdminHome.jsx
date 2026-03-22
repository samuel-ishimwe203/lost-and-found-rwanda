import React, { useState, useEffect } from "react";
import { FiActivity, FiSettings, FiUserPlus, FiPieChart, FiServer, FiShield, FiDatabase, FiSmartphone, FiChevronRight } from "react-icons/fi";
import apiClient from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export default function AdminHome() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [systemStatus] = useState([
    { name: "Database", status: "healthy", uptime: "99.9%", icon: <FiDatabase /> },
    { name: "API Cluster", status: "healthy", uptime: "99.8%", icon: <FiServer /> },
    { name: "Notification Relay", status: "healthy", uptime: "99.7%", icon: <FiSmartphone /> },
    { name: "Security Engine", status: "healthy", uptime: "100%", icon: <FiShield /> },
  ]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/stats");
      setDashboardData(response.data.data);
      setError("");
    } catch (err) {
      setError(t("messages.operationFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-green-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-[#10b981]">{t("common.loading")}</p>
      </div>
    );
  }

  const stats = [
    { label: t("admin.totalItems"), value: dashboardData?.lostItems?.total || 0, icon: <FiActivity />, color: "text-[#10b981]" },
    { label: t("admin.activeItems"), value: dashboardData?.foundItems?.total || 0, icon: <FiPieChart />, color: "text-[#10b981]" },
    { label: t("admin.returnedItems"), value: dashboardData?.pendingPolice || 0, icon: <FiActivity />, color: "text-[#10b981]" },
    { label: t("admin.pendingMatches"), value: dashboardData?.matches?.total || 0, icon: <FiShield />, color: "text-[#10b981]" },
  ];

  return (
    <div className="space-y-8 pb-24">
      {/* WELCOME BANNER */}
      <div className="bg-[#10b981] p-8 md:p-12 rounded-[24px] shadow-xl relative overflow-hidden group">
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-24 h-24 rounded-full border-4 border-white/30 bg-white/20 text-white flex items-center justify-center text-3xl font-black shadow-2xl shrink-0">
             {user?.full_name?.charAt(0) || 'A'}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
              {t("admin.welcomeBack")}, {user?.full_name?.split(' ')[0] || 'Admin'}!
            </h1>
            <p className="text-white text-base md:text-lg opacity-90 max-w-2xl font-medium">
               {t("nav.dashboard")}
            </p>
          </div>
        </div>
      </div>

      {/* STATISTICS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[16px] shadow-sm border border-gray-100 transition-all hover:shadow-md">
             <div className="flex flex-col">
                <p className={`text-4xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
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
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">{t("admin.nodeStatus")}</p>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               </div>
               <div className="divide-y divide-gray-50">
                  {systemStatus.map((system, idx) => (
                    <div key={idx} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                       <div className="flex items-center gap-4">
                          <div className="text-gray-300">{system.icon}</div>
                          <p className="font-bold text-gray-800 text-sm">{system.name}</p>
                       </div>
                       <div className="flex items-center gap-6">
                          <p className="text-xs font-bold text-emerald-600">{system.uptime} {t("admin.uptime")}</p>
                          <span className="text-[10px] font-black uppercase text-gray-300">{t("admin.online")}</span>
                       </div>
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
                     <p className="text-[9px] font-black text-[#10b981] uppercase tracking-[0.2em] mb-2">{t("police.approved")}</p>
                     <h4 className="text-xl font-black italic uppercase tracking-tighter">{t("admin.superuser")}</h4>
                  </div>
                  <div className="space-y-3">
                     {[
                        { label: t("dashboard.statistics"), path: "/admin-dashboard/system-stats" },
                        { label: t("admin.logs"), path: "/admin-dashboard/logs" },
                        { label: t("admin.manageUsers"), path: "/admin-dashboard/manage-users" }
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