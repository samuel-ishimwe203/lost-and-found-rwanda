import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";
import { FiX, FiInfo, FiTag, FiHash, FiMapPin, FiCalendar, FiUser, FiImage, FiFileText, FiTrash2, FiSearch, FiLayers, FiAlertCircle } from "react-icons/fi";
import { getImageUrl } from "../../utils/imageHelper";
import { useLanguage } from "../../context/LanguageContext";

export default function ManageItems() {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/items");
      const { lostItems, foundItems } = response.data.data;
      
      const combinedItems = [...lostItems, ...foundItems].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );

      setItems(combinedItems);
      setFilteredItems(combinedItems);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || t("messages.operationFailed"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemToDelete) => {
    if (!window.confirm(t("admin.deleteRecordConfirm"))) {
      return;
    }

    try {
      setLoading(true);
      const endpoint = itemToDelete.item_source === 'lost' ? `/lost-items/${itemToDelete.id}` : `/found-items/${itemToDelete.id}`;
      await apiClient.delete(endpoint);
      fetchItems();
      setIsModalOpen(false);
      setSelectedItem(null);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || t("messages.operationFailed"));
      console.error("Error deleting item:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filterStatus) => {
    setActiveFilter(filterStatus);
    applyFilters(filterStatus, searchTerm);
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    applyFilters(activeFilter, term);
  };

  const applyFilters = (filter, search) => {
    let result = items;
    
    if (filter !== "all") {
      if (filter === "lost" || filter === "found") {
        result = result.filter(item => item.item_source === filter);
      } else {
        result = result.filter(item => item.status === filter);
      }
    }

    if (search) {
      result = result.filter(item => 
        item.item_type?.toLowerCase().includes(search) ||
        item.category?.toLowerCase().includes(search) ||
        item.district?.toLowerCase().includes(search) ||
        item.full_name?.toLowerCase().includes(search) ||
        item.id_number?.toLowerCase().includes(search)
      );
    }

    setFilteredItems(result);
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
         <div className="w-16 h-16 border-4 border-emerald-100 border-t-[#10b981] rounded-full animate-spin mx-auto mb-6"></div>
         <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{t("matches.scanningRegistry")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-20 px-4 md:px-8 space-y-10 font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 py-8">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{t("admin.manageItemsTitle")}</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium italic opacity-80 max-w-2xl text-center md:text-left">
            {t("admin.manageItemsSubtitle")}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center gap-4 text-red-600">
          <FiAlertCircle className="w-6 h-6 shrink-0" />
          <p className="font-bold text-sm">{error}</p>
        </div>
      )}

      {/* SEARCH/FILTERS */}
      <div className="space-y-6">
        <div className="relative group max-w-2xl">
           <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within:text-[#10b981] transition-colors" />
           <input 
             type="text" 
             value={searchTerm}
             onChange={handleSearch}
             placeholder={t("admin.searchItems")}
             className="w-full bg-white border border-gray-100 rounded-2xl py-5 px-14 text-sm font-medium text-gray-800 outline-none shadow-sm focus:border-[#10b981] transition-all"
           />
        </div>

        <div className="flex gap-2 flex-wrap text-center">
          {["all", "lost", "found", "active", "matched", "resolved"].map((filter) => (
            <button 
              key={filter} 
              onClick={() => handleFilter(filter)}
              className={`px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border ${
                activeFilter === filter 
                  ? "bg-[#10b981] text-white border-[#10b981] shadow-lg" 
                  : "bg-white text-gray-400 border-gray-100 hover:border-[#10b981] hover:text-[#10b981]"
              }`}
            >
              {t(`status.${filter}`) || filter}
            </button>
          ))}
        </div>
      </div>

      {/* ITEMS TABLE SECTION */}
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden relative mb-20">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("admin.assetDetails")}</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("admin.registry")}</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("items.location")}</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("admin.status")}</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("admin.origin")}</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("admin.logDate")}</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center opacity-30">
                       <FiLayers className="w-12 h-12 text-gray-200 mb-4" />
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("admin.noItemsFound")}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={`${item.item_source}-${item.id}`} className="hover:bg-gray-50/50 transition duration-300 group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-[#10b981] shrink-0 font-bold">
                            <FiTag className="w-5 h-5" />
                         </div>
                         <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate max-w-[150px] italic">{t(`categories.${item.category?.toLowerCase()}`) || item.category}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 truncate max-w-[150px]">{item.item_type || "Item"}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        item.item_source === "lost" ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-[#10b981] border-emerald-100"
                      }`}>
                        {item.item_source === 'lost' ? t("postings.itemsLost").split(' ')[1] : t("postings.itemsFound").split(' ')[1]}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-gray-700">
                       {t(`districts.${item.district?.toLowerCase()}`) || item.district}{item.sector ? `, ${item.sector}` : ''}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        item.status === "matched" ? "bg-amber-50 text-amber-600 border-amber-100" : 
                        item.status === "resolved" || item.status === "returned" ? "bg-blue-50 text-blue-600 border-blue-100" :
                        "bg-gray-100 text-gray-400 border-gray-100"
                      }`}>
                        {t(`status.${item.status?.toLowerCase()}`) || item.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-gray-800">
                       {item.full_name}
                    </td>
                    <td className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                       {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right space-x-2">
                       <button 
                        onClick={() => { setSelectedItem(item); setIsModalOpen(true); }}
                        className="bg-[#10b981] text-white rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow hover:bg-[#0da472] transition active:scale-95"
                      >
                         {t("admin.inspect")}
                      </button>
                      <button 
                        onClick={() => handleDelete(item)}
                        className="p-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-600 hover:text-white transition"
                      >
                         <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ITEM INSPECTION MODAL */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100 animate-in zoom-in-95 duration-300">
             
             <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 z-20 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 transition"
              >
                <FiX className="text-xl" />
              </button>

             <div className="md:w-5/12 bg-gray-50 flex flex-col justify-center items-center p-10 border-r border-gray-100 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                   {selectedItem.image_url ? (
                      <img 
                        src={getImageUrl(selectedItem.image_url)} 
                        className="max-h-full w-auto object-contain rounded-2xl shadow-lg border-4 border-white"
                        alt="Registry Asset"
                      />
                   ) : (
                      <div className="bg-white w-full h-64 flex flex-col items-center justify-center text-gray-200 border border-dashed border-gray-200 rounded-2xl">
                        <FiImage className="w-16 h-16 mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">{t("items.noImage")}</p>
                      </div>
                   )}
                </div>
             </div>

             <div className="md:w-7/12 p-8 md:p-12 overflow-y-auto space-y-8 bg-white">
                <div className="flex items-center gap-3">
                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      selectedItem.item_source === "lost" ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-[#10b981] border-emerald-100"
                    }`}>
                      {selectedItem.item_source === 'lost' ? t("postings.itemsLost").split(' ')[1] : t("postings.itemsFound").split(' ')[1]} {t("messages.subjectFound").split(' ')[1]}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">ID: #{selectedItem.id}</span>
                </div>

                <div>
                   <h2 className="text-3xl font-bold text-gray-900 capitalize mb-1 italic">
                      {selectedItem.item_type || t(`categories.${selectedItem.category?.toLowerCase()}`)}
                   </h2>
                   <p className="text-sm font-medium text-gray-400 uppercase tracking-widest font-black italic">{t(`categories.${selectedItem.category?.toLowerCase()}`) || selectedItem.category}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">{t("admin.incidentLocation")}</p>
                      <p className="text-sm font-bold text-gray-800 italic">{t(`districts.${selectedItem.district?.toLowerCase()}`) || selectedItem.district}{selectedItem.sector ? `, ${selectedItem.sector}` : ''}</p>
                   </div>
                   <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">{t("admin.registeringUser")}</p>
                      <p className="text-sm font-bold text-gray-800 italic">{selectedItem.full_name}</p>
                   </div>
                </div>

                {selectedItem.description && (
                  <div className="space-y-3">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("admin.descriptionLog")}</p>
                     <p className="text-sm text-gray-600 leading-relaxed font-medium bg-gray-50 p-6 rounded-2xl border border-gray-100 italic">
                       "{selectedItem.description}"
                     </p>
                  </div>
                )}

                {selectedItem.text && (
                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("admin.ocrMetadata")}</p>
                      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
                         <p className="text-emerald-400/80 font-mono text-xs leading-relaxed whitespace-pre-wrap italic">
                            {selectedItem.text}
                         </p>
                      </div>
                   </div>
                )}

                <div className="pt-6 flex gap-4">
                   <button 
                     onClick={() => handleDelete(selectedItem)}
                     className="flex-1 py-4 bg-red-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg hover:bg-black transition-all active:scale-95"
                   >
                     {t("admin.deleteRecord")}
                   </button>
                   <button 
                     onClick={() => setIsModalOpen(false)}
                     className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                   >
                     {t("admin.closeView")}
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}