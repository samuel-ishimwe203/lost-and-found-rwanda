import React, { useState } from "react";

export default function MyPostings() {
  const [postings] = useState([
    {
      id: 1,
      title: "National ID Card (Blue Cover)",
      category: "Documents",
      location: "Kigali - Kimironko Market",
      dateOfLoss: "2024-01-10",
      datePosted: "2024-01-11",
      status: "Active",
      matches: 3,
      reward: "20,000 RWF",
      color: "Blue",
      description: "Lost blue national ID card with my name and photo",
    },
    {
      id: 2,
      title: "Rwandan Passport (Red Cover)",
      category: "Documents",
      location: "Huye - Near Bus Park",
      dateOfLoss: "2024-01-08",
      datePosted: "2024-01-08",
      status: "Active",
      matches: 5,
      reward: "50,000 RWF",
      color: "Red",
      description: "Red passport, lost at bus station",
    },
    {
      id: 3,
      title: "Driving License (Yellow Card)",
      category: "Documents",
      location: "Musanze Town - Main Road",
      dateOfLoss: "2024-01-05",
      datePosted: "2024-01-05",
      status: "Resolved",
      matches: 1,
      reward: "15,000 RWF",
      color: "Yellow",
      description: "Yellow driving license found and recovered",
    },
    {
      id: 4,
      title: "Bank ATM Card (BK)",
      category: "Cards",
      location: "Kigali - Nyabugogo Supermarket",
      dateOfLoss: "2024-01-12",
      datePosted: "2024-01-12",
      status: "Active",
      matches: 2,
      reward: "10,000 RWF",
      color: "White/Silver",
      description: "BK Bank ATM card with chip",
    },
    {
      id: 5,
      title: "Vaccination Certificate",
      category: "Documents",
      location: "Kigali - Kimironko Health Center",
      dateOfLoss: "2024-01-14",
      datePosted: "2024-01-14",
      status: "Active",
      matches: 1,
      reward: "5,000 RWF",
      color: "Yellow",
      description: "Yellow vaccination booklet",
    },
  ]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-bold text-green-900">My Postings</h1>
        <p className="text-green-700 mt-2">
          View and manage all your lost item postings ({postings.length} total)
        </p>
      </div>

      {/* POSTINGS TABLE */}
      <div className="bg-white rounded-xl shadow-lg overflow-x-auto border border-green-200">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-green-700 to-emerald-800 border-b border-green-300">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                Item Title
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                Category
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                Location
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                Date Posted
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                Reward
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                Matches
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-green-100">
            {postings.map((posting) => (
              <tr key={posting.id} className="hover:bg-green-50 transition">
                <td className="px-6 py-4 text-green-900 font-medium">
                  {posting.title}
                </td>
                <td className="px-6 py-4 text-green-700">{posting.category}</td>
                <td className="px-6 py-4 text-green-700 text-sm">{posting.location}</td>
                <td className="px-6 py-4 text-green-700 text-sm">{posting.datePosted}</td>
                <td className="px-6 py-4 text-green-600 font-semibold">{posting.reward}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      posting.status === "Active"
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-gray-100 text-gray-700 border border-gray-300"
                    }`}
                  >
                    {posting.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-cyan-600 font-semibold bg-cyan-100 px-3 py-1 rounded border border-cyan-300">
                    {posting.matches}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button className="text-green-600 hover:text-green-800 font-semibold">
                    View
                  </button>
                  <button className="text-emerald-600 hover:text-emerald-800 font-semibold">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-800 font-semibold">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* POSTING DETAILS SECTION */}
      <div className="grid md:grid-cols-1 gap-6">
        {postings.slice(0, 2).map((posting) => (
          <div key={posting.id} className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl shadow-lg border-l-4 border-green-700">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-teal-900">{posting.title}</h3>
                <p className="text-teal-700 text-sm mt-1">{posting.description}</p>
              </div>
              <span className={`px-4 py-2 rounded-lg font-semibold ${
                posting.status === "Active" ? "bg-green-100 text-green-700 border border-green-300" : "bg-gray-100 text-gray-700 border border-gray-300"
              }`}>
                {posting.status}
              </span>
            </div>

            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg border border-teal-200">
                <p className="text-teal-600 font-semibold">Category</p>
                <p className="font-semibold text-teal-900 mt-1">{posting.category}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-teal-200">
                <p className="text-teal-600 font-semibold">Color</p>
                <p className="font-semibold text-teal-900 mt-1">{posting.color}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-teal-200">
                <p className="text-teal-600 font-semibold">Location Lost</p>
                <p className="font-semibold text-teal-900 mt-1">{posting.location}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-teal-200">
                <p className="text-teal-600 font-semibold">Date of Loss</p>
                <p className="font-semibold text-teal-900 mt-1">{posting.dateOfLoss}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-teal-200">
                <p className="text-teal-600 font-semibold">Reward</p>
                <p className="font-semibold text-teal-600 text-lg mt-1">{posting.reward}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-teal-200">
                <p className="text-teal-600 font-semibold">Posted</p>
                <p className="font-semibold text-teal-900 mt-1">{posting.datePosted}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-teal-200">
                <p className="text-teal-600 font-semibold">Potential Matches</p>
                <p className="font-semibold text-cyan-600 text-lg mt-1">{posting.matches}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-teal-200">
                <p className="text-teal-600 font-semibold">ID</p>
                <p className="font-semibold text-teal-900 mt-1">#{posting.id}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
