import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";
import { FiEye, FiEdit2, FiTrash2, FiInfo, FiMapPin, FiCalendar, FiTag, FiClock } from "react-icons/fi";

export default function MyFoundItems() {
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
        setFoundItems(response.data.data.foundItems);
      }
    } catch (err) {
      console.error('Fetch found items error:', err);
      if (err.response?.status === 401) {
        setError('🔒 Session expired. Please login again.');
      } else if (err.message === 'Network Error') {
        setError('🌐 Network error. Please check your connection.');
      } else {
        setError('Failed to load found items. Please refresh the page.');
      }
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
      date_found: item.date_found || '',
      additional_info: item.additional_info || '',
      status: item.status || 'active'
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const response = await apiClient.put(`/found-items/${selectedItem.id}`, editFormData);
      
      if (response.data.success) {
        alert('✅ Item updated successfully!');
        setIsEditModalOpen(false);
        fetchFoundItems(); // Refresh the list
      }
    } catch (err) {
      console.error('Update item error:', err);
      if (err.response?.status === 401) {
        alert('🔒 Session expired. Please login again.');
      } else if (err.message === 'Network Error') {
        alert('🌐 Network error. Please check your connection.');
      } else {
        alert(`❌ ${err.response?.data?.message || 'Failed to update item'}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const response = await apiClient.delete(`/found-items/${itemId}`);
      if (response.data.success) {
        alert('✅ Item deleted successfully!');
        fetchFoundItems();
      }
    } catch (err) {
      console.error('Delete item error:', err);
      alert(`❌ ${err.response?.data?.message || 'Failed to delete item'}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const statusStyles = {
    active: "bg-blue-50 border-blue-200 text-blue-700",
    matched: "bg-yellow-50 border-yellow-200 text-yellow-700",
    returned: "bg-green-50 border-green-200 text-green-700",
    inactive: "bg-gray-50 border-gray-200 text-gray-700",
  };

  const statusBadge = {
    active: "bg-blue-200 text-blue-800",
    matched: "bg-yellow-200 text-yellow-800",
    returned: "bg-green-200 text-green-800",
    inactive: "bg-gray-200 text-gray-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-blue-900 leading-tight">My Found Items</h1>
          <p className="text-blue-600 text-[10px] md:text-xs font-black uppercase tracking-widest mt-1 opacity-70">
            Managing <span className="text-blue-800">{foundItems.length}</span> recorded discoveries
          </p>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-blue-700 mt-4">Loading your found items...</p>
        </div>
      )}

      {/* ERROR STATE */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && foundItems.length === 0 && (
        <div className="text-center py-12 md:py-20 bg-blue-50/50 rounded-2xl md:rounded-3xl border border-dashed border-blue-200">
          <p className="text-3xl md:text-4xl mb-4">📭</p>
          <h3 className="text-xl md:text-2xl font-black text-blue-900">No found items yet</h3>
          <p className="text-blue-600 mt-2 max-w-sm mx-auto text-sm md:text-base opacity-70">Start posting items you've found to help reunite them with their owners!</p>
        </div>
      )}

      {/* ITEMS GRID */}
      {!loading && !error && foundItems.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foundItems.map((item) => (
            <div
              key={item.id}
              className={`group rounded-2xl md:rounded-[32px] shadow-lg hover:shadow-2xl border border-blue-100 transition-all duration-300 overflow-hidden bg-white`}
            >
              {/* IMAGE */}
              <div className="relative h-48 md:h-56 overflow-hidden bg-slate-100">
                {item.image_url ? (
                  <img
                    src={`http://localhost:3001${item.image_url}`}
                    alt={item.item_type}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <FiTag className="w-12 h-12 opacity-30" />
                    <span className="text-[9px] font-black uppercase mt-3 tracking-widest">No Image Available</span>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md border ${statusBadge[item.status] || statusBadge.active} border-white/20`}>
                    {item.status}
                  </span>
                </div>
              </div>

              <div className="p-5 md:p-6 space-y-4">
                <div>
                   <h3 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight">{item.item_type}</h3>
                   <div className="flex items-center gap-3 mt-1 text-slate-400 text-[10px] font-bold">
                      <span className="flex items-center gap-1"><FiMapPin /> {item.district}</span>
                      <span className="flex items-center gap-1"><FiClock /> {formatDate(item.date_found)}</span>
                   </div>
                </div>

                <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed h-10">{item.description || 'No description provided'}</p>

                {/* ACTION BUTTONS */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button 
                    onClick={() => handleViewDetails(item)}
                    className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-slate-800 transition shadow-md flex items-center justify-center gap-2"
                  >
                    <FiEye /> View
                  </button>
                  <button 
                    onClick={() => handleEdit(item)}
                    className="flex-1 bg-blue-50 text-blue-600 py-2.5 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-blue-100 transition border border-blue-100 flex items-center justify-center gap-2"
                  >
                    <FiEdit2 /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="w-11 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100 py-2.5 rounded-xl font-bold transition flex items-center justify-center shadow-sm"
                    title="Delete Item"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {isViewModalOpen && selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-xl p-4">
          <div className="bg-white rounded-2xl md:rounded-[40px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 md:p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Item Details</h2>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center hover:bg-slate-200 transition"
                >
                  <FiClock className="rotate-45" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* IMAGE */}
              {selectedItem.image_url && (
                <img
                  src={`http://localhost:3001${selectedItem.image_url}`}
                  alt={selectedItem.item_type}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
              )}

              {/* DETAILS */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-xs font-semibold text-blue-600 uppercase">Item Type</p>
                  <p className="text-lg font-bold text-blue-900 mt-1">{selectedItem.item_type}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-xs font-semibold text-blue-600 uppercase">Category</p>
                  <p className="text-lg font-bold text-blue-900 mt-1">{selectedItem.category}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-xs font-semibold text-blue-600 uppercase">Location Found</p>
                  <p className="text-lg font-bold text-blue-900 mt-1">{selectedItem.location_found}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-xs font-semibold text-blue-600 uppercase">District</p>
                  <p className="text-lg font-bold text-blue-900 mt-1">{selectedItem.district}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-xs font-semibold text-blue-600 uppercase">Date Found</p>
                  <p className="text-lg font-bold text-blue-900 mt-1">{formatDate(selectedItem.date_found)}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-xs font-semibold text-blue-600 uppercase">Status</p>
                  <p className="text-lg font-bold text-blue-900 mt-1 capitalize">{selectedItem.status}</p>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xs font-semibold text-blue-600 uppercase mb-2">Description</p>
                <p className="text-blue-900">{selectedItem.description || 'No description provided'}</p>
              </div>

              {/* ADDITIONAL INFO */}
              {selectedItem.additional_info && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-xs font-semibold text-blue-600 uppercase mb-2">Additional Information</p>
                  <p className="text-blue-900">{selectedItem.additional_info}</p>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleEdit(selectedItem);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
                >
                  Edit Item
                </button>
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleDelete(selectedItem.id);
                  }}
                  className="px-6 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-xl p-4">
          <div className="bg-white rounded-2xl md:rounded-[40px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 md:p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Edit Posting</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center hover:bg-slate-200 transition"
                >
                  <FiClock className="rotate-45" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Item Type</label>
                <input
                  type="text"
                  name="item_type"
                  value={editFormData.item_type}
                  onChange={handleEditChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  value={editFormData.category}
                  onChange={handleEditChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  <option value="national_id">National ID</option>
                  <option value="passport">Passport</option>
                  <option value="driving_license">Driving License</option>
                  <option value="atm_card">ATM Card</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                ></textarea>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location Found</label>
                  <input
                    type="text"
                    name="location_found"
                    value={editFormData.location_found}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">District</label>
                  <select
                    name="district"
                    value={editFormData.district}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select District</option>
                    <option value="Kigali">Kigali</option>
                    <option value="Nyarugenge">Nyarugenge</option>
                    <option value="Gasabo">Gasabo</option>
                    <option value="Kicukiro">Kicukiro</option>
                    <option value="Rubavu">Rubavu</option>
                    <option value="Rusizi">Rusizi</option>
                    <option value="Huye">Huye</option>
                    <option value="Musanze">Musanze</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date Found</label>
                  <input
                    type="date"
                    name="date_found"
                    value={editFormData.date_found}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="matched">Matched</option>
                    <option value="returned">Returned</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Information</label>
                <textarea
                  name="additional_info"
                  value={editFormData.additional_info}
                  onChange={handleEditChange}
                  rows="2"
                  placeholder="Any other details..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition disabled:bg-green-400 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={saving}
                  className="px-6 bg-gray-300 hover:bg-gray-400 text-gray-900 py-3 rounded-lg font-semibold transition disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
