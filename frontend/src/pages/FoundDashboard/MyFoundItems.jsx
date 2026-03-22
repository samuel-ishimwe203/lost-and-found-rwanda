import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";
import { FiEye, FiEdit2, FiTrash2, FiInfo, FiMapPin, FiCalendar, FiTag, FiClock, FiX, FiSearch, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { getImageUrl } from "../../utils/imageHelper";
import { useLanguage } from "../../context/LanguageContext";

export default function MyFoundItems() {
  const { t } = useLanguage();
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFoundItems();
  }, []);

  const fetchFoundItems = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/found-items/my/items');
      if (response.data.success) {
        setFoundItems(response.data.data.foundItems || []);
      }
    } catch (err) {
      console.error('Fetch found items error:', err);
      setError(t("messages.operationFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditFormData({
      item_type: item.item_type || '',
      category: item.category || '',
      description: item.description || '',
      location_found: item.location_found || '',
      district: item.district || '',
      date_found: item.date_found ? new Date(item.date_found).toISOString().split('T')[0] : '',
      additional_info: item.additional_info || '',
      status: item.status || 'active'
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await apiClient.put(`/found-items/${selectedItem.id}`, editFormData);
      if (response.data.success) {
        setIsEditModalOpen(false);
        fetchFoundItems();
      }
    } catch (err) {
      alert(`❌ ${err.response?.data?.message || t("messages.operationFailed")}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm(t("items.deleteConfirm"))) return;
    try {
      const response = await apiClient.delete(`/found-items/${itemId}`);
      if (response.data.success) fetchFoundItems();
    } catch (err) {
      alert(`❌ ${err.response?.data?.message || t("messages.operationFailed")}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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
              {t("items.myFoundItems")}
            </h1>
            <p className="text-green-50 text-sm md:text-base opacity-90 max-w-2xl font-medium">
               {t("landing.aiFoundExplainer")}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-xl px-6 py-3 border border-white/30 text-center shrink-0">
            <p className="text-[10px] font-bold text-white uppercase tracking-widest opacity-80 mb-1">{t("admin.totalItems")}</p>
            <p className="text-3xl font-black text-white leading-none">{foundItems.length}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-xl flex items-center gap-4 shadow-sm animate-in shake">
          <FiAlertCircle className="w-6 h-6 shrink-0" />
          <p className="font-bold text-sm uppercase tracking-tight">{error}</p>
        </div>
      )}

      {foundItems.length === 0 ? (
        <div className="max-w-4xl mx-auto py-20 px-6">
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-slate-100 relative overflow-hidden">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-sm">
              <FiSearch className="w-8 h-8 text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">{t("items.noItemsFound")}</h2>
            <p className="text-slate-400 font-medium max-w-sm mx-auto text-sm leading-relaxed">
               {t("search.noResultsMessage")}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {foundItems.map((item) => (
            <div key={item.id} className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-green-100 flex flex-col">
              <div className="relative h-48 bg-slate-50 overflow-hidden shrink-0">
                {item.image_url ? (
                  <img src={getImageUrl(item.image_url)} alt={item.item_type} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                    <FiTag className="text-4xl mb-2 opacity-50" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">{t("items.noImage")}</span>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-lg border border-white/20 backdrop-blur-md
                    ${item.status === 'active' ? 'bg-green-600 text-white' : 
                      item.status === 'returned' || item.status === 'matched' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-900 text-white'}`}>
                    {getStatusLabel(item.status)}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900 truncate">{item.item_type}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 tracking-wider uppercase"><FiMapPin className="text-green-600" /> {t(`districts.${item.district?.toLowerCase()}`) || item.district}</span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 tracking-wider uppercase"><FiCalendar className="text-green-600" /> {formatDate(item.date_found)}</span>
                  </div>
                </div>

                <p className="text-slate-500 text-xs font-medium line-clamp-2 italic leading-relaxed h-10 mb-6">
                  {item.description ? `"${item.description}"` : t("items.noDescription")}
                </p>

                <div className="flex gap-2 pt-4 border-t border-slate-50 mt-auto">
                  <button onClick={() => handleViewDetails(item)} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg">{t("matches.viewDetails")}</button>
                  <button onClick={() => handleEdit(item)} className="w-12 h-12 bg-slate-50 text-slate-400 flex items-center justify-center rounded-xl border border-slate-100 hover:bg-green-50 hover:text-green-600 transition-all" title={t("common.edit")}><FiEdit2 /></button>
                  <button onClick={() => handleDelete(item.id)} className="w-12 h-12 bg-red-50 text-red-400 flex items-center justify-center rounded-xl border border-red-100 hover:bg-red-500 hover:text-white transition-all" title={t("common.delete")}><FiTrash2 /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW MODAL - Redesigned */}
      {isViewModalOpen && selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-md" onClick={() => setIsViewModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsViewModalOpen(false)} 
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-all shadow-md"
            >
              <FiX />
            </button>

            <div className="md:w-2/5 h-64 md:h-auto bg-slate-900 overflow-hidden flex items-center justify-center relative">
               <div className="absolute inset-0 bg-slate-800/10 [background-size:20px_20px] bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)]"></div>
              {selectedItem.image_url ? (
                <img src={getImageUrl(selectedItem.image_url)} alt={selectedItem.item_type} className="w-full h-full object-contain relative z-10 p-4" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 bg-slate-50">
                  <FiTag className="text-6xl mb-4 opacity-10" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">{t("items.noImage")}</span>
                </div>
              )}
            </div>

            <div className="flex-1 p-8 md:p-12 overflow-y-auto space-y-8 bg-white">
              <div className="space-y-3">
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-green-100">{t(`categories.${selectedItem.category?.toLowerCase()}`) || selectedItem.category}</span>
                <h2 className="text-3xl font-bold text-slate-900 leading-tight">{selectedItem.item_type}</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t("items.location")}</p>
                  <p className="font-bold text-slate-800 text-sm">{t(`districts.${selectedItem.district?.toLowerCase()}`) || selectedItem.district}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t("items.date")}</p>
                  <p className="font-bold text-slate-800 text-sm">{formatDate(selectedItem.date_found)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><FiInfo /> {t("items.description")}</p>
                <div className="p-6 bg-green-50/20 rounded-2xl border border-green-100/50">
                  <p className="text-slate-700 font-medium italic leading-relaxed text-sm">"{selectedItem.description || t("items.noDescription")}"</p>
                </div>
              </div>

              {selectedItem.additional_info && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("admin.logs")}</h4>
                  <p className="text-xs font-semibold text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">{selectedItem.additional_info}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL - Redesigned */}
      {isEditModalOpen && selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-y-auto animate-in zoom-in-95 duration-300">
            <div className="p-8 md:p-12 space-y-10">
                <div className="flex justify-between items-center">
                   <h2 className="text-2xl font-bold text-slate-900">{t("common.edit")} <span className="text-green-600">{t("items.itemDetails")}</span></h2>
                   <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"><FiX /></button>
                </div>

                <form onSubmit={handleSaveEdit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-green-700 uppercase tracking-widest pl-1">{t("items.title")}</label>
                      <input type="text" name="item_type" value={editFormData.item_type} onChange={handleEditChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:bg-white focus:border-green-500 transition-all outline-none text-xs" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-green-700 uppercase tracking-widest pl-1">{t("items.category")}</label>
                      <select name="category" value={editFormData.category} onChange={handleEditChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:bg-white focus:border-green-500 transition-all outline-none text-xs appearance-none">
                        <option value="national_id">{t("categories.national_id")}</option>
                        <option value="passport">{t("categories.passport")}</option>
                        <option value="driving_license">{t("categories.driving_license")}</option>
                        <option value="atm_card">{t("categories.atm_card")}</option>
                        <option value="other">{t("categories.other")}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-green-700 uppercase tracking-widest pl-1">{t("items.date")}</label>
                      <input type="date" name="date_found" value={editFormData.date_found} onChange={handleEditChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:bg-white focus:border-green-500 transition-all outline-none text-xs" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-green-700 uppercase tracking-widest pl-1">{t("admin.status")}</label>
                      <select name="status" value={editFormData.status} onChange={handleEditChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:bg-white focus:border-green-500 transition-all outline-none text-xs appearance-none">
                        <option value="active">{t("status.active")}</option>
                        <option value="matched">{t("status.pending")}</option>
                        <option value="returned">{t("status.returned")}</option>
                        <option value="inactive">{t("status.expired")}</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-green-700 uppercase tracking-widest pl-1">{t("items.location")}</label>
                    <select name="district" value={editFormData.district} onChange={handleEditChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:bg-white focus:border-green-500 transition-all outline-none text-xs appearance-none">
                        <option value="Kigali">Kigali</option>
                        <option value="Nyarugenge">Nyarugenge</option>
                        <option value="Gasabo">Gasabo</option>
                        <option value="Kicukiro">Kicukiro</option>
                        <option value="Rubavu">Rubavu</option>
                        <option value="Rusizi">Rusizi</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-green-700 uppercase tracking-widest pl-1">{t("items.description")}</label>
                    <textarea name="description" value={editFormData.description} onChange={handleEditChange} rows="4" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-medium text-slate-900 focus:bg-white focus:border-green-500 transition-all outline-none resize-none text-sm" />
                  </div>

                  <button type="submit" disabled={saving} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-green-600 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white animate-spin rounded-full"></div> : <FiCheckCircle />}
                    {saving ? t("common.loading") : t("common.save")}
                  </button>
                </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
