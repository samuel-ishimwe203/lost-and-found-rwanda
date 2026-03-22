import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/api";
import { FiEye, FiEdit2, FiTrash2, FiMapPin, FiCalendar, FiTag, FiClock, FiDollarSign, FiSearch, FiAlertCircle, FiChevronRight } from "react-icons/fi";
import { getImageUrl } from "../../utils/imageHelper";
import { useLanguage } from "../../context/LanguageContext";

export default function MyPostings() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPostings();
  }, []);

  const fetchPostings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.get('/lost-items/my/items');
      const items = response.data.data?.lostItems || [];
      setPostings(items);
    } catch (error) {
      console.error('Error fetching postings:', error);
      setError(error.response?.data?.message || t("messages.operationFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("items.deleteConfirm"))) {
      return;
    }
    
    try {
      await apiClient.delete(`/lost-items/${id}`);
      setPostings(postings.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting posting:', error);
      alert(error.response?.data?.message || t("messages.operationFailed"));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatReward = (amount) => {
    if (!amount || amount === 0) return t("items.noReward") || 'No reward';
    return `${Number(amount).toLocaleString()} RWF`;
  };

  const getStatusLabel = (status) => {
    return t(`status.${status?.toLowerCase()}`) || status;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-8 pb-32">
        <div className="w-16 h-16 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs animate-pulse">{t("matches.scanningRegistry")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 md:p-8 rounded-2xl border border-green-400 shadow-lg relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/5 opacity-10"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
              {t("items.myLostItems")}
            </h1>
            <p className="text-green-50 text-sm md:text-base opacity-90 max-w-2xl font-medium">
              {t("landing.aiLostExplainer")}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-xl px-6 py-3 border border-white/30 text-center shrink-0">
            <p className="text-[10px] font-bold text-white uppercase tracking-widest opacity-80 mb-1">{t("admin.totalItems")}</p>
            <p className="text-3xl font-black text-white leading-none">{postings.length}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-xl flex items-center gap-4 shadow-sm animate-in shake">
          <FiAlertCircle className="w-6 h-6 shrink-0" />
          <p className="font-bold text-sm uppercase tracking-tight">{error}</p>
        </div>
      )}

      {/* EMPTY STATE */}
      {postings.length === 0 && !loading && (
        <div className="max-w-4xl mx-auto py-20 px-6">
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-slate-100 relative overflow-hidden">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-sm">
              <FiSearch className="w-8 h-8 text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">{t("items.noItemsFound")}</h2>
            <p className="text-slate-400 font-medium max-w-sm mx-auto text-sm leading-relaxed mb-8">
              {t("search.noResultsMessage")}
            </p>
            <button
              onClick={() => navigate('/lost-dashboard/create-post')}
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-10 py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl hover:bg-green-600 transition-all active:scale-95"
            >
              + {t("items.postLostItem")}
            </button>
          </div>
        </div>
      )}

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-4">
        {postings.map((posting) => (
          <div key={posting.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-slate-900 truncate max-w-[200px]">{posting.item_type}</h3>
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mt-1 opacity-70">{t(`categories.${posting.category?.toLowerCase()}`) || posting.category}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                posting.status === "active" ? "bg-green-50 text-green-700 border-green-100" :
                posting.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-100" :
                "bg-slate-50 text-slate-500 border-slate-100"
              }`}>
                {getStatusLabel(posting.status)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6 text-[11px] font-semibold text-slate-500 bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">
              <div className="flex items-center gap-2">
                <FiMapPin className="text-green-600 shrink-0" />
                <span className="truncate">{posting.district || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCalendar className="text-green-600 shrink-0" />
                <span>{formatDate(posting.date_lost)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiDollarSign className="text-green-600 shrink-0" />
                <span className="font-bold text-slate-900">{formatReward(posting.reward_amount)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-cyan-100 text-cyan-700 rounded-lg flex items-center justify-center text-[10px] font-bold border border-cyan-200">
                  {posting.match_count || 0}
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{t("matches.potentialMatches")}</span>
              </div>
            </div>

            <div className="flex gap-2 border-t border-slate-50 pt-4 mt-auto">
              <button 
                onClick={() => navigate(`/lost-dashboard/postings/${posting.id}`)} 
                className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg hover:bg-green-600 transition-all"
              >
                {t("matches.viewDetails")}
              </button>
              <button 
                onClick={() => navigate(`/lost-dashboard/edit-post/${posting.id}`)} 
                className="w-12 h-12 bg-slate-50 text-slate-400 flex items-center justify-center rounded-xl border border-slate-100 hover:bg-green-50 hover:text-green-600 transition-all"
              >
                <FiEdit2 />
              </button>
              <button 
                onClick={() => handleDelete(posting.id)} 
                className="w-12 h-12 bg-red-50 text-red-400 flex items-center justify-center rounded-xl border border-red-100 hover:bg-red-500 hover:text-white transition-all"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP TABLE */}
      {postings.length > 0 && (
        <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 transition-all hover:shadow-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">{t("items.itemDetails")}</th>
                <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">{t("items.location")}</th>
                <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">{t("items.date")}</th>
                <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">{t("admin.status")}</th>
                <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">{t("matches.potentialMatches")}</th>
                <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] text-center">{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {postings.map((posting) => (
                <tr key={posting.id} className="hover:bg-green-50/20 transition-all group">
                  <td className="px-8 py-6">
                    <p className="font-bold text-slate-900 text-sm tracking-tight">{posting.item_type}</p>
                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mt-1 opacity-60">{t(`categories.${posting.category?.toLowerCase()}`) || posting.category}</p>
                  </td>
                  <td className="px-8 py-6">
                     <span className="text-xs font-semibold text-slate-600 flex items-center gap-2"><FiMapPin className="text-green-500" /> {posting.district || 'N/A'}</span>
                  </td>
                  <td className="px-8 py-6">
                     <span className="text-xs font-semibold text-slate-600 flex items-center gap-2"><FiCalendar className="text-green-500" /> {formatDate(posting.date_lost)}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                      posting.status === "active" ? "bg-green-50 text-green-700 border-green-100 shadow-sm" :
                      posting.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-100" :
                      "bg-slate-50 text-slate-500 border-slate-100"
                    }`}>
                      {getStatusLabel(posting.status)}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border transition-all ${
                         posting.match_count > 0 ? 'bg-cyan-50 text-cyan-700 border-cyan-100 shadow-sm scale-110' : 'bg-slate-50 text-slate-300 border-slate-100'
                       }`}>
                         {posting.match_count || 0}
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => navigate(`/lost-dashboard/postings/${posting.id}`)} title={t("matches.viewDetails")} className="p-2.5 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all border border-slate-100 shadow-sm hover:shadow-lg"><FiEye /></button>
                      <button onClick={() => navigate(`/lost-dashboard/edit-post/${posting.id}`)} title={t("common.edit")} className="p-2.5 bg-slate-50 text-slate-400 hover:bg-green-600 hover:text-white rounded-xl transition-all border border-slate-100 shadow-sm hover:shadow-lg"><FiEdit2 /></button>
                      <button onClick={() => handleDelete(posting.id)} title={t("common.delete")} className="p-2.5 bg-red-50 text-red-400 hover:bg-red-600 hover:text-white rounded-xl transition-all border border-red-100 shadow-sm hover:shadow-lg"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* HIGHLIGHTED REPORTS GRID */}
      {postings.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-1">
            <div className="h-5 w-1.5 bg-green-600 rounded-full"></div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-[0.2em]">{t("dashboard.myItems")}</h3>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {postings.slice(0, 2).map((posting) => {
              return (
                <div key={posting.id} className="group bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-500 flex flex-col sm:flex-row gap-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 py-4 px-6">
                    <span className="text-[10px] font-extrabold text-slate-100 tracking-widest uppercase">ID {posting.id}</span>
                  </div>
                  
                  {posting.image_url ? (
                    <div className="w-full sm:w-44 h-44 shrink-0 rounded-2xl overflow-hidden border border-slate-100 shadow-xl relative z-10">
                      <img 
                        src={getImageUrl(posting.image_url)} 
                        alt={posting.item_type}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                    </div>
                  ) : (
                    <div className="w-full sm:w-44 h-44 shrink-0 bg-slate-50 rounded-2xl flex flex-col items-center justify-center text-slate-200 border border-slate-100 shadow-inner relative z-10">
                      <FiTag className="text-4xl mb-2 opacity-50" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">{t("items.noImage")}</span>
                    </div>
                  )}

                  <div className="flex-1 flex flex-col justify-between py-1 relative z-10">
                    <div className="space-y-4">
                       <div className="flex flex-wrap items-center gap-3">
                         <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border shadow-sm
                           ${posting.status === "active" ? "bg-green-50 text-green-700 border-green-100" : "bg-slate-50 text-slate-500 border-slate-100"}`}>
                           {getStatusLabel(posting.status)}
                         </span>
                         {posting.reward_amount > 0 && <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">💰 {t("items.rewardAmount")}</span>}
                       </div>
                       <div>
                         <h4 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-green-600 transition-colors uppercase tracking-tight">{posting.item_type}</h4>
                         <p className="text-slate-500 text-xs font-semibold mt-2 line-clamp-2 italic leading-relaxed">
                           {posting.description || t("items.noDescription")}
                         </p>
                       </div>
                    </div>

                    <div className="pt-6 flex items-center justify-between mt-auto">
                       <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                          <span className="flex items-center gap-1.5"><FiMapPin className="text-green-500" /> {posting.district}</span>
                          <span className="flex items-center gap-1.5"><FiClock className="text-green-500" /> {formatDate(posting.date_lost)}</span>
                       </div>
                       <button onClick={() => navigate(`/lost-dashboard/postings/${posting.id}`)} className="h-10 w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-green-600 transition-all group/btn">
                         <FiChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                       </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
