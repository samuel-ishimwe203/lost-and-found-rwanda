import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";

export default function ReturnedDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReturnedDocuments();
  }, []);

  const fetchReturnedDocuments = async () => {
    try {
      const response = await apiClient.get('/police/returned-documents');
      if (response.data.success) {
        setDocuments(response.data.data.returnedDocuments);
      }
    } catch (err) {
      console.error('Error fetching returned documents:', err);
      setError('Failed to load returned documents. Ensure you are connected to the server.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 bg-yellow-100 p-4 min-h-screen flex items-center justify-center">
        <p className="text-2xl font-bold text-green-900">Loading returned items...</p>
      </div>
    );
  }

  // Calculate stats dynamically based on database payload
  const currentMonth = new Date().getMonth();
  const returnedThisMonth = documents.filter(doc => new Date(doc.resolved_at).getMonth() === currentMonth).length;

  return (
    <div className="space-y-6 bg-yellow-100 p-4 min-h-screen">
      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-bold text-green-900">Returned Items</h1>
        <p className="text-green-700 mt-2">Record of successfully returned items</p>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-300 shadow-lg">
          <h3 className="font-bold text-green-900 mb-4">Total Returned</h3>
          <p className="text-4xl font-bold text-green-600">{documents.length}</p>
          <p className="text-sm text-green-700 mt-2">items successfully returned via your station</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-300 shadow-lg">
          <h3 className="font-bold text-blue-900 mb-4">Success Rate</h3>
          <p className="text-4xl font-bold text-blue-600">100%</p>
          <p className="text-sm text-blue-700 mt-2">verified returns</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border-2 border-yellow-300 shadow-lg">
          <h3 className="font-bold text-yellow-900 mb-4">This Month</h3>
          <p className="text-4xl font-bold text-yellow-600">{returnedThisMonth}</p>
          <p className="text-sm text-yellow-700 mt-2">items returned this month</p>
        </div>
      </div>

      {error && <p className="text-red-600 font-bold p-4 bg-red-100 rounded-lg">{error}</p>}

      {/* RETURNED ITEMS TABLE */}
      <div className="bg-white rounded-2xl shadow-lg border border-green-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">Item Name</th>
              <th className="px-6 py-4 text-left font-semibold">Original Owner</th>
              <th className="px-6 py-4 text-left font-semibold">Owner Contact</th>
              <th className="px-6 py-4 text-left font-semibold">Return Date</th>
              <th className="px-6 py-4 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-green-200">
            {documents.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500 font-semibold">
                  No returned items found in the database.
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-green-50 transition">
                  <td className="px-6 py-4 font-semibold text-gray-900">{doc.item_type}</td>
                  <td className="px-6 py-4 text-gray-600">{doc.owner_name || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-600">{doc.owner_phone || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(doc.resolved_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-300">
                      Returned to Owner
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}