import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";
import { FiUser, FiMail, FiShield, FiCheckCircle, FiXCircle, FiSearch, FiLayers, FiAlertCircle } from "react-icons/fi";
import { useLanguage } from "../../context/LanguageContext";

export default function ManageUsers() {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/users");
      setUsers(response.data.data.users || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || t("admin.accessingUsers") + " (Failed)");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const message = currentStatus ? t("admin.deactivateConfirm") : t("admin.activateConfirm");
    if (!window.confirm(message)) return;
    
    try {
      await apiClient.put(`/admin/users/${userId}`, {
        is_active: !currentStatus
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || t("messages.operationFailed"));
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
         <div className="w-16 h-16 border-4 border-emerald-100 border-t-[#10b981] rounded-full animate-spin mx-auto mb-6"></div>
         <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{t("admin.accessingUsers")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-20 px-4 md:px-8 space-y-10 font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 py-8">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{t("admin.manageUsersTitle")}</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">{t("admin.manageUsersSubtitle")}</p>
        </div>
        <button className="bg-[#10b981] text-white rounded-xl px-8 py-3.5 font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-[#0da472] transition-all flex items-center gap-2 active:scale-95">
           <FiShield /> {t("admin.registerAdmin")}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center gap-4 text-red-600">
          <FiAlertCircle className="w-6 h-6 shrink-0" />
          <p className="font-bold text-sm tracking-tight">{error}</p>
        </div>
      )}

      {/* SEARCH/FILTER */}
      <div className="relative group max-w-2xl mx-auto md:mx-0">
         <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within:text-[#10b981] transition-colors" />
         <input 
           type="text" 
           placeholder={t("admin.searchUsers")}
           className="w-full bg-white border border-gray-100 rounded-2xl py-5 px-14 text-sm font-medium text-gray-800 outline-none shadow-sm focus:border-[#10b981] transition-all"
         />
      </div>

      {/* USERS TABLE SECTION */}
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden relative mb-20">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("admin.userIdentity")}</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("admin.emailAddress")}</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("admin.role")}</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("admin.status")}</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("admin.joined")}</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center opacity-30">
                       <FiLayers className="w-12 h-12 text-gray-200 mb-4" />
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("admin.noUsersFound")}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-[#10b981] shrink-0 font-bold">
                            {user.full_name?.charAt(0)}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-gray-900">{user.full_name}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">ID: #{user.id}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <p className="text-sm font-medium text-gray-600">{user.email}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        user.role === "admin" ? "bg-slate-900 text-white border-slate-900" :
                        user.role === "police" ? "bg-blue-50 text-blue-700 border-blue-100" :
                        "bg-emerald-50 text-[#10b981] border-emerald-100"
                      }`}>
                        {t(`roles.${user.role}`) || user.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold uppercase">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        user.is_active ? "bg-emerald-50 text-[#10b981] border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                      }`}>
                        {user.is_active ? t("admin.active") : t("admin.inactive")}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-[11px] font-bold text-gray-400">
                       {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button 
                        onClick={() => handleToggleStatus(user.id, user.is_active)}
                        className={`font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl border transition-all active:scale-95 ${
                          user.is_active 
                            ? "border-red-100 text-red-600 hover:bg-red-600 hover:text-white" 
                            : "border-emerald-100 text-[#10b981] hover:bg-[#10b981] hover:text-white"
                        }`}
                      >
                        {user.is_active ? t("admin.deactivate") : t("admin.activate")}
                      </button>
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