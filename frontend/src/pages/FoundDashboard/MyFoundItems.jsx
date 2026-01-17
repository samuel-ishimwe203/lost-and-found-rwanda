import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";

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
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-900">My Found Items</h1>
        <div className="text-sm text-blue-600">
          Total Items: <span className="font-bold">{foundItems.length}</span>
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

      {/* EMPTY STATE */}
      {!loading && !error && foundItems.length === 0 && (
        <div className="text-center py-12 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-blue-700 text-lg">📭 No found items yet</p>
          <p className="text-blue-600 mt-2">Start posting items you've found to help reunite them with their owners!</p>
        </div>
      )}

      {/* ITEMS GRID */}
      {!loading && !error && foundItems.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foundItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl shadow-lg border-2 p-5 transition hover:shadow-xl ${statusStyles[item.status] || statusStyles.active}`}
            >
              {/* IMAGE */}
              {item.image_url ? (
                <img
                  src={`http://localhost:3001${item.image_url}`}
                  alt={item.item_type}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200x150?text=No+Image';
                  }}
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}

              {/* CONTENT */}
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-gray-900">{item.item_type}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusBadge[item.status] || statusBadge.active}`}>
                    {item.status}
                  </span>
                </div>

                <p className="text-gray-700 text-sm line-clamp-2">{item.description || 'No description'}</p>

                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    <span className="font-semibold">Category:</span> {item.category}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Location:</span> {item.location_found}, {item.district}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Date Found:</span> {formatDate(item.date_found)}
                  </p>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => handleViewDetails(item)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handleEdit(item)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 py-2 rounded-lg font-semibold transition"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {isViewModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Item Details</h2>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition"
                >
                  ✕
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Edit Item</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition"
                >
                  ✕
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
