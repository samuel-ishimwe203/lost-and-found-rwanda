import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";

export default function ManageItems() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

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
                    <td className="px-6 py-4">
                      <button className="text-purple-600 hover:text-purple-800 font-bold text-sm bg-purple-100 px-3 py-1 rounded hover:bg-purple-200 transition">
                        View Details
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