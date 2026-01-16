import React from "react";

const demoPostings = [
  {
    id: 1,
    title: "National ID Card",
    category: "Personal Documents",
    location: "Kigali – Kacyiru",
    reward: "20,000 RWF",
  },
  {
    id: 2,
    title: "Rwandan Passport",
    category: "Official Documents",
    location: "Huye – Near University",
    reward: "50,000 RWF",
  },
  {
    id: 3,
    title: "Driving License",
    category: "Official Documents",
    location: "Rubavu Town",
    reward: "15,000 RWF",
  },
  {
    id: 4,
    title: "Bank ATM Card (BK)",
    category: "Financial Items",
    location: "Kigali – Nyabugogo",
    reward: "10,000 RWF",
  },
  {
    id: 5,
    title: "Academic Certificate",
    category: "Education Documents",
    location: "Muhanga District",
    reward: "30,000 RWF",
  },
];

export default function BrowseItems() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-16">

      {/* Page Header */}
      <div className="max-w-6xl mx-auto mb-10">
        <h1 className="text-3xl font-bold text-green-700 mb-2">
          All Lost Postings
        </h1>
        <p className="text-gray-600">
          Browse reported lost items across Rwanda.  
          Rewards are set by owners to encourage finders.
        </p>
      </div>

      {/* Filter Hint */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white p-4 rounded-lg shadow text-sm text-gray-500">
          Filters by category, location, and reward will be available soon.
        </div>
      </div>

      {/* Postings Grid */}
      <div className="max-w-6xl mx-auto grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {demoPostings.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition p-5 flex flex-col justify-between"
          >
            {/* Tag */}
            <span className="inline-block mb-3 text-xs font-semibold bg-red-100 text-red-600 px-3 py-1 rounded-full w-fit">
              Lost Item
            </span>

            {/* Content */}
            <div>
              <h3 className="text-lg font-semibold mb-1">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500">
                {item.category}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                📍 {item.location}
              </p>
            </div>

            {/* Reward */}
            <div className="mt-4">
              <p className="text-green-700 font-bold text-lg">
                Reward: {item.reward}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
