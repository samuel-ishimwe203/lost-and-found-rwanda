import React, { useState } from "react";

export default function ReturnedDocuments() {
  console.log('ReturnedDocuments rendered');
  
  const [documents] = useState([
    {
      id: 1,
      itemName: "National ID Card",
      originalOwner: "John Doe",
      returnedTo: "John Doe",
      returnDate: "2024-01-15",
      officer: "Officer James",
      condition: "Good",
    },
    {
      id: 2,
      itemName: "Rwandan Passport",
      originalOwner: "Jane Smith",
      returnedTo: "Jane Smith",
      returnDate: "2024-01-14",
      officer: "Officer Marie",
      condition: "Good",
    },
    {
      id: 3,
      itemName: "Wedding Ring",
      originalOwner: "Marie Uwimana",
      returnedTo: "Marie Uwimana",
      returnDate: "2024-01-13",
      officer: "Officer Paul",
      condition: "Excellent",
    },
    {
      id: 4,
      itemName: "Driving License",
      originalOwner: "Paul Rwandan",
      returnedTo: "Paul Rwandan",
      returnDate: "2024-01-12",
      officer: "Officer Jean",
      condition: "Good",
    },
  ]);

  return (
    <div className="space-y-6 bg-yellow-100 p-4 min-h-screen">
      <div className="bg-purple-500 text-white p-4 text-2xl font-bold">
        RETURNED DOCUMENTS PAGE - YOU SHOULD SEE THIS!
      </div>
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
          <p className="text-sm text-green-700 mt-2">items successfully returned</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-300 shadow-lg">
          <h3 className="font-bold text-blue-900 mb-4">Success Rate</h3>
          <p className="text-4xl font-bold text-blue-600">100%</p>
          <p className="text-sm text-blue-700 mt-2">verified returns</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border-2 border-yellow-300 shadow-lg">
          <h3 className="font-bold text-yellow-900 mb-4">This Month</h3>
          <p className="text-4xl font-bold text-yellow-600">4</p>
          <p className="text-sm text-yellow-700 mt-2">items returned this month</p>
        </div>
      </div>

      {/* RETURNED ITEMS TABLE */}
      <div className="bg-white rounded-2xl shadow-lg border border-green-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">Item Name</th>
              <th className="px-6 py-4 text-left font-semibold">Original Owner</th>
              <th className="px-6 py-4 text-left font-semibold">Returned To</th>
              <th className="px-6 py-4 text-left font-semibold">Return Date</th>
              <th className="px-6 py-4 text-left font-semibold">Officer</th>
              <th className="px-6 py-4 text-left font-semibold">Condition</th>
              <th className="px-6 py-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-green-200">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-green-50 transition">
                <td className="px-6 py-4 font-semibold text-gray-900">{doc.itemName}</td>
                <td className="px-6 py-4 text-gray-600">{doc.originalOwner}</td>
                <td className="px-6 py-4 text-gray-600">{doc.returnedTo}</td>
                <td className="px-6 py-4 text-gray-600">{doc.returnDate}</td>
                <td className="px-6 py-4 text-gray-600">{doc.officer}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                    {doc.condition}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
                    View Receipt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
