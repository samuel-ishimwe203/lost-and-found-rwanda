import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";
import { FiX, FiInfo, FiTag, FiHash, FiMapPin, FiCalendar, FiUser, FiImage, FiFileText, FiTrash2 } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const BACKEND_URL = API_URL.replace(/\/api\/?$/, '');

export default function ManageItems() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/items");
      
      const { lostItems, foundItems } = response.data.data;
      
      // Combine arrays and sort by newest first
      const combinedItems = [...lostItems, ...foundItems].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );

      setItems(combinedItems);
      setFilteredItems(combinedItems);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch items");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemToDelete) => {
    if (!window.confirm(`Are you sure you want to delete this ${itemToDelete.item_source} item (${itemToDelete.item_type || itemToDelete.category})? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      const endpoint = itemToDelete.item_source === 'lost' ? `/lost-items/${itemToDelete.id}` : `/found-items/${itemToDelete.id}`;
      await apiClient.delete(endpoint);
      fetchItems(); // Re-fetch items to update the list
      setIsModalOpen(false); // Close the modal after deletion
      setSelectedItem(null); // Clear selected item
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete item");
      console.error("Error deleting item:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filterStatus) => {
    setActiveFilter(filterStatus);
    if (filterStatus === "all") {
      setFilteredItems(items);
    } else if (filterStatus === "lost" || filterStatus === "found") {
      setFilteredItems(items.filter(item => item.item_source === filterStatus));
    } else {
      setFilteredItems(items.filter(item => item.status === filterStatus));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-xl text-purple-600 font-semibold animate-pulse">Loading all items...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-purple-900">Manage Items</h1>
        <p className="text-purple-700 mt-2">View and manage all lost and found items across the platform</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* FILTERS */}
      <div className="flex gap-4 flex-wrap">
        {["all", "lost", "found", "active", "matched", "resolved"].map((filter) => (
          <button 
            key={filter} 
            onClick={() => handleFilter(filter)}
            className={`px-4 py-2 rounded-lg font-semibold transition border-2 ${
              activeFilter === filter 
                ? "bg-purple-600 text-white border-purple-600 shadow-md" 
                : "bg-white text-purple-600 border-purple-300 hover:bg-purple-50"
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* ITEMS TABLE */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Category/Type</th>
                <th className="px-6 py-4 text-left font-semibold">Source</th>
                <th className="px-6 py-4 text-left font-semibold">Location</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Posted By</th>
                <th className="px-6 py-4 text-left font-semibold">Date</th>
                <th className="px-6 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No items found matching the current filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={`${item.item_source}-${item.id}`} className="hover:bg-purple-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{item.category}</p>
                      <p className="text-xs text-gray-500">{item.item_type || "N/A"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        item.item_source === "lost" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}>
                        {item.item_source}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.district}, {item.sector}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        item.status === "matched" ? "bg-yellow-100 text-yellow-800" : 
                        item.status === "resolved" ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{item.full_name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <button 
                        onClick={() => { setSelectedItem(item); setIsModalOpen(true); }}
                        className="text-purple-600 hover:text-purple-800 font-bold text-sm bg-purple-100 px-3 py-1 rounded hover:bg-purple-200 transition"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleDelete(item)}
                        className="text-red-600 hover:text-red-800 p-2 bg-red-50 rounded hover:bg-red-100 transition"
                        title="Delete Item"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ITEM DETAIL MODAL */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300 border border-slate-200">
             
             {/* Header Action */}
             <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/10 backdrop-blur-md rounded-full flex items-center justify-center text-slate-800 hover:bg-black/20 transition hover:scale-110"
              >
                <FiX className="text-xl" />
              </button>

             {/* Left side: Image Area */}
             <div className="md:w-5/12 bg-slate-100 flex items-center justify-center p-8 border-r border-slate-200 relative overflow-hidden">
                {selectedItem.image_url ? (
                  <img 
                    src={`${BACKEND_URL}${selectedItem.image_url}`} 
                    alt={selectedItem.item_type || selectedItem.category}
                    className="w-full h-auto object-contain rounded-xl shadow-lg border border-slate-200 relative z-10"
                  />
                ) : (
                   <div className="text-slate-400 flex flex-col items-center">
                     <FiImage className="w-20 h-20 mb-4 opacity-20" />
                     <p className="font-bold uppercase tracking-widest text-xs opacity-50">No Image Provided</p>
                   </div>
                )}
             </div>

             {/* Right side: Detailed Data */}
             <div className="md:w-7/12 p-8 overflow-y-auto space-y-8 bg-white">
                <div>
                   <div className="flex items-center gap-3 mb-3">
                     <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        selectedItem.item_source === "lost" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                      }`}>
                        {selectedItem.item_source} ITEM
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        selectedItem.status === "active" ? "bg-blue-100 text-blue-700" :
                        selectedItem.status === "matched" ? "bg-yellow-100 text-yellow-700" : "bg-slate-200 text-slate-600"
                      }`}>
                        {selectedItem.status}
                      </span>
                   </div>
                   <h2 className="text-3xl font-black text-slate-900 leading-tight mb-2">
                     {selectedItem.item_type || "Unspecified Type"}
                   </h2>
                   <p className="text-slate-500 font-medium italic">
                     DB ID: <span className="font-mono text-slate-400">{selectedItem.id}</span>
                   </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                     <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 mb-1"><FiTag /> Category</p>
                     <p className="text-sm font-bold text-slate-800">{selectedItem.category}</p>
                   </div>
                   {selectedItem.id_number && (
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 mb-1"><FiHash /> Document ID</p>
                       <p className="text-sm font-bold text-slate-800">{selectedItem.id_number}</p>
                     </div>
                   )}
                   {selectedItem.holder_name && (
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 mb-1"><FiUser /> Registered Name</p>
                       <p className="text-sm font-bold text-slate-800">{selectedItem.holder_name}</p>
                     </div>
                   )}
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Location & Time</h4>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                        <p className="text-xs font-bold text-slate-500 flex items-center gap-2"><FiMapPin className="text-slate-400"/> District / Sector</p>
                        <p className="text-sm font-bold text-slate-800 mt-1">{selectedItem.district}, {selectedItem.sector}</p>
                     </div>
                     <div>
                        <p className="text-xs font-bold text-slate-500 flex items-center gap-2"><FiCalendar className="text-slate-400"/> {selectedItem.item_source === 'lost' ? 'Lost' : 'Found'} Date</p>
                        <p className="text-sm font-bold text-slate-800 mt-1">
                          {selectedItem.date_lost ? new Date(selectedItem.date_lost).toLocaleDateString() : 
                           selectedItem.date_found ? new Date(selectedItem.date_found).toLocaleDateString() : 'N/A'}
                        </p>
                     </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Poster Information</h4>
                   <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                     <p className="text-sm font-bold text-slate-900">{selectedItem.full_name}</p>
                     <p className="text-xs font-medium text-slate-500 mt-1">User ID: <span className="font-mono">{selectedItem.user_id}</span></p>
                   </div>
                </div>

                {selectedItem.description && (
                  <div className="space-y-2">
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2"><FiInfo /> User Description</h4>
                     <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                       {selectedItem.description}
                     </p>
                  </div>
                )}

                {selectedItem.text && (
                  <div className="space-y-2">
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2"><FiFileText /> OCR Extracted Data</h4>
                     <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                        <p className="text-xs text-green-400 font-mono whitespace-pre-wrap leading-relaxed">
                          {selectedItem.text}
                        </p>
                     </div>
                  </div>
                )}

                <div className="pt-6 border-t border-slate-100 flex gap-4">
                   <button 
                     onClick={() => handleDelete(selectedItem)}
                     className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition shadow-xl shadow-red-200"
                   >
                     Delete Item
                   </button>
                   <button 
                     onClick={() => setIsModalOpen(false)}
                     className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition"
                   >
                     Close Details
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}