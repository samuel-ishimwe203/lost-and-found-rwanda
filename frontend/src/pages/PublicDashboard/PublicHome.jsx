import React from "react";

const demoItems = [
  {
    id: 1,
    title: "National ID Card",
    location: "Kigali - Kimironko",
    reward: "20,000 RWF",
  },
  {
    id: 2,
    title: "Rwandan Passport",
    location: "Huye - Near Bus Park",
    reward: "50,000 RWF",
  },
  {
    id: 3,
    title: "Driving License",
    location: "Musanze Town",
    reward: "15,000 RWF",
  },
  {
    id: 4,
    title: "Bank ATM Card (BK)",
    location: "Kigali - Nyabugogo",
    reward: "10,000 RWF",
  },
];

export default function PublicHome({ onLoginSuccess }) {
  return (
    <div className="w-full">

      {/* ================= HERO SECTION ================= */}
      <section className="bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 text-white py-28 px-6 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
          Helping Rwandans Recover Lost Items Faster
        </h1>

        <p className="max-w-3xl mx-auto text-lg md:text-xl text-green-100 mb-10">
          A national digital platform connecting people who lost important
          documents and items with those who found them — safely, securely,
          and with dignity.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-5">
          {/* 🔹 SEARCH LOST ITEMS */}
          <button
            onClick={() => window.dispatchEvent(new Event("open-search"))}
            className="bg-white text-green-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition"
          >
            Search Lost Items
          </button>

          {/* 🔹 REPORT LOST ITEM */}
          <button
            onClick={() => window.dispatchEvent(new Event("open-login"))}
            className="border-2 border-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-green-700 transition"
          >
            Report Lost Item
          </button>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section
        className="py-24 px-6 text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1558788353-f76d92427f16')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              How Lost & Found Rwanda Works
            </h2>
            <p className="text-gray-200 max-w-2xl mx-auto">
              Post your loss with a reward. Let honest finders help you recover
              what matters most.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white text-gray-800 p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-2">
                1. Report a Lost Item
              </h3>
              <p className="text-gray-600">
                Post your lost document or item and set a reward to motivate recovery.
              </p>
            </div>

            <div className="bg-green-600 text-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-2">
                2. Finder Uploads Item
              </h3>
              <p>
                Anyone who finds an item can upload it and connect with the owner.
              </p>
            </div>

            <div className="bg-white text-gray-800 p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-2">
                3. Secure Recovery
              </h3>
              <p className="text-gray-600">
                Notifications are sent and the item is safely returned.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="bg-black text-white py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold">120</p>
            <p className="text-sm text-gray-300">Our Team</p>
          </div>
          <div>
            <p className="text-4xl font-bold">1189</p>
            <p className="text-sm text-gray-300">Happy Owners & Finders</p>
          </div>
          <div>
            <p className="text-4xl font-bold">300</p>
            <p className="text-sm text-gray-300">All Categories</p>
          </div>
          <div>
            <p className="text-4xl font-bold">450</p>
            <p className="text-sm text-gray-300">Total Postings</p>
          </div>
        </div>
      </section>

      {/* ================= DEMO POSTINGS ================= */}
      <section className="py-20 px-6 bg-gray-50">
        <h3 className="text-3xl font-bold text-center mb-12">
          Recent Lost Items (Demo)
        </h3>

        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {demoItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
            >
              <span className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded-full">
                Lost Item
              </span>

              <h4 className="text-lg font-semibold mt-4">{item.title}</h4>
              <p className="text-sm text-gray-500">{item.location}</p>
              <p className="mt-3 font-bold text-green-700">
                Reward: {item.reward}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-white mb-3">About Us</h4>
            <p className="text-sm">
              Lost & Found Rwanda is a national platform helping citizens recover
              lost items efficiently.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">User Portal</h4>
            <ul className="text-sm space-y-2">
              <li>Login</li>
              <li>Register</li>
              <li>Forgot Password</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">Quick Links</h4>
            <ul className="text-sm space-y-2">
              <li>All Postings</li>
              <li>Search</li>
              <li>Contact</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">Contact</h4>
            <p className="text-sm">Kigali, Rwanda</p>
            <p className="text-sm">support@lostfound.rw</p>
          </div>
        </div>

        <p className="text-center text-sm mt-10 text-gray-500">
          © {new Date().getFullYear()} Lost & Found Rwanda. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
