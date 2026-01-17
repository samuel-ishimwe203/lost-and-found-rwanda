import React, { useState } from "react";

export default function ManageClaims() {
  console.log('ManageClaims rendered');
  
  const [claims] = useState([
    {
      id: 1,
      itemName: "National ID Card",
      claimant: "John Doe",
      claimantPhone: "+250788123456",
      status: "pending",
      date: "2024-01-15",
      evidence: "Photo match 95%",
    },
    {
      id: 2,
      itemName: "Rwandan Passport",
      claimant: "Jane Smith",
      claimantPhone: "+250798765432",
      status: "approved",
      date: "2024-01-14",
      evidence: "Document match 98%",
    },
    {
      id: 3,
      itemName: "Wedding Ring",
      claimant: "Marie Uwimana",
      claimantPhone: "+250787654321",
      status: "rejected",
      date: "2024-01-13",
      evidence: "Description mismatch",
    },
  ]);

  return (
    <div className="space-y-6 bg-yellow-100 p-4 min-h-screen">
      <div className="bg-blue-500 text-white p-4 text-2xl font-bold">
        MANAGE CLAIMS PAGE - YOU SHOULD SEE THIS!
      </div>
      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-bold text-green-900">Manage Claims</h1>
        <p className="text-green-700 mt-2">Process and verify ownership claims for found items</p>
      </div>

      {/* CLAIMS TABLE */}
      <div className="bg-white rounded-2xl shadow-lg border border-green-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">Item Name</th>
              <th className="px-6 py-4 text-left font-semibold">Claimant</th>
              <th className="px-6 py-4 text-left font-semibold">Phone</th>
              <th className="px-6 py-4 text-left font-semibold">Status</th>
              <th className="px-6 py-4 text-left font-semibold">Evidence</th>
              <th className="px-6 py-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-green-200">
            {claims.map((claim) => (
              <tr key={claim.id} className="hover:bg-green-50 transition">
                <td className="px-6 py-4 font-semibold text-gray-900">{claim.itemName}</td>
                <td className="px-6 py-4 text-gray-600">{claim.claimant}</td>
                <td className="px-6 py-4 text-gray-600">{claim.claimantPhone}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      claim.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : claim.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{claim.evidence}</td>
                <td className="px-6 py-4">
                  {claim.status === "pending" ? (
                    <div className="flex gap-2">
                      <button className="text-green-600 hover:text-green-800 font-semibold text-sm">
                        Approve
                      </button>
                      <button className="text-red-600 hover:text-red-800 font-semibold text-sm">
                        Reject
                      </button>
                    </div>
                  ) : (
                    <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
                      View Details
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
