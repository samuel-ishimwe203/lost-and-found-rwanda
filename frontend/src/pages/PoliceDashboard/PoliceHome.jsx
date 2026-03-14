import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";

export default function PoliceHome() {
  const [stats, setStats] = useState([
    { label: "Items Uploaded", value: 0, icon: "📄", color: "text-red-600" },
    { label: "Active Items", value: 0, icon: "🔍", color: "text-blue-600" },
    { label: "Items Returned", value: 0, icon: "✅", color: "text-green-600" },
    { label: "Pending Claims", value: 0, icon: "⏳", color: "text-yellow-600" },
  ]);
  const [loading, setLoading] = useState(true);

  // We keep static recent activities for now, unless you add an audit trail endpoint later
  const [recentActivities] = useState([
    { id: 1, action: "Dashboard Accessed", description: "Police user logged in securely", time: "Just now" },
    { id: 2, action: "System Update", description: "AI match detection is active", time: "System" },
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
          { label: "Total Uploads", value: data.totalUploads, icon: "📄", color: "text-red-600" },
          { label: "Active Tracking", value: data.activeItems, icon: "🔍", color: "text-blue-600" },
          { label: "Items Returned", value: data.returnedItems, icon: "✅", color: "text-green-600" },
          { label: "Pending Matches", value: data.pendingClaims, icon: "⏳", color: "text-yellow-600" },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch police stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-10 pb-20">
      {/* WELCOME BANNER */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 md:p-10 rounded-2xl md:rounded-[40px] border border-green-300 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 text-center md:text-left">
           <span className="px-4 py-1.5 bg-white/20 text-white rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest mb-4 inline-block backdrop-blur-md border border-white/20">Law Enforcement Portal</span>
           <h1 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight tracking-tight">Police Dashboard</h1>
           <p className="text-green-50 text-base md:text-xl font-medium opacity-90">Official Item Management & Case Processing Unit</p>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 md:p-6 rounded-2xl shadow-xl border border-green-100 hover:shadow-2xl hover:border-green-200 transition-all duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <p className={`text-2xl md:text-4xl font-black ${stat.color}`}>
                  {loading ? '...' : stat.value}
                </p>
                <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mt-1 opacity-70 leading-none">{stat.label}</p>
              </div>
              <span className="text-3xl md:text-4xl opacity-50">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[40px] shadow-2xl border border-green-50 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
        <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-8 uppercase tracking-tight relative z-10">System Log Status</h2>
        <div className="space-y-3 relative z-10">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-green-200 transition-all duration-300 shadow-sm group">
              <div className="mb-2 sm:mb-0">
                <p className="font-black text-slate-800 text-sm md:text-base group-hover:text-green-600 transition-colors uppercase tracking-tight">{activity.action}</p>
                <p className="text-xs md:text-sm text-slate-500 font-medium opacity-80">{activity.description}</p>
              </div>
              <span className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full border border-green-100 whitespace-nowrap self-start sm:self-center">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: "📤", label: "Upload Official Item", btn: "Enter Items", link: "/police/upload" },
          { icon: "📋", label: "Manage Matches", btn: "Verify Claims", link: "/police/claims" },
          { icon: "✅", label: "Verify Returns", btn: "View Archive", link: "/police/returned" }
        ].map((action, idx) => (
          <div key={idx} className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[32px] border border-green-50 shadow-xl hover:shadow-2xl transition-all duration-300">
             <div className="text-3xl mb-4">{action.icon}</div>
             <h3 className="text-base md:text-lg font-black text-slate-900 mb-6 uppercase tracking-tight">{action.label}</h3>
             <button 
               onClick={() => window.location.href = action.link}
               className="w-full bg-slate-900 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest hover:bg-black transition transform hover:translate-y-[-2px] shadow-lg"
             >
               {action.btn}
             </button>
          </div>
        ))}
      </div>
    </div>
  );
}