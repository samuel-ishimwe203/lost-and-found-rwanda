import React, { useState } from "react";

export default function MyProfile() {
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+250788123456",
    location: "Kigali, Rwanda",
    bio: "Looking for my lost important documents",
    joinDate: "2024-01-01",
    verified: true,
    totalPostings: 12,
    recoveredItems: 2,
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    console.log("Profile saved:", profile);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-green-900">My Profile</h1>
          <p className="text-green-700 mt-2">Manage your account information</p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            isEditing
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {/* PROFILE CARD */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-200">
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-6">
            {/* FIRST NAME */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-green-900 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* LAST NAME */}
              <div>
                <label className="block text-sm font-semibold text-green-900 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-semibold text-green-900 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* PHONE */}
            <div>
              <label className="block text-sm font-semibold text-green-900 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* LOCATION */}
            <div>
              <label className="block text-sm font-semibold text-green-900 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={profile.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* BIO */}
            <div>
              <label className="block text-sm font-semibold text-green-900 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              ></textarea>
            </div>

            {/* SAVE BUTTON */}
            <button
              type="submit"
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Save Changes
            </button>
          </form>
        ) : (
          <div className="space-y-8">
            {/* AVATAR & BASIC INFO */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-600 to-emerald-500 text-white flex items-center justify-center text-5xl font-bold shadow-lg mb-4">
                {profile.firstName.charAt(0)}
                {profile.lastName.charAt(0)}
              </div>
              <h2 className="text-3xl font-bold text-green-900">{profile.firstName} {profile.lastName}</h2>
              <p className="text-green-600 font-semibold mt-2">
                {profile.verified ? "✓ Verified User" : "Not Verified"}
              </p>
            </div>

            {/* STATS */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
                <p className="text-3xl font-bold text-green-600">{profile.totalPostings}</p>
                <p className="text-green-700 text-sm mt-1">Total Postings</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
                <p className="text-3xl font-bold text-green-600">{profile.recoveredItems}</p>
                <p className="text-green-700 text-sm mt-1">Items Recovered</p>
              </div>
            </div>

            {/* INFO GRID */}
            <div className="grid md:grid-cols-2 gap-8 pt-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 uppercase tracking-wide font-semibold">First Name</p>
                <p className="text-lg font-semibold text-green-900 mt-1">
                  {profile.firstName}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 uppercase tracking-wide font-semibold">Last Name</p>
                <p className="text-lg font-semibold text-green-900 mt-1">
                  {profile.lastName}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 uppercase tracking-wide font-semibold">Email</p>
                <p className="text-lg font-semibold text-green-900 mt-1">
                  {profile.email}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 uppercase tracking-wide font-semibold">Phone</p>
                <p className="text-lg font-semibold text-green-900 mt-1">
                  {profile.phone}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 uppercase tracking-wide font-semibold">Location</p>
                <p className="text-lg font-semibold text-green-900 mt-1">
                  {profile.location}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 uppercase tracking-wide font-semibold">Member Since</p>
                <p className="text-lg font-semibold text-green-900 mt-1">
                  {new Date(profile.joinDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* BIO */}
            <div className="pt-4 border-t border-green-200">
              <p className="text-sm text-green-600 uppercase tracking-wide font-semibold">Bio</p>
              <p className="text-base text-green-900 mt-3 bg-green-50 p-4 rounded-lg border border-green-200">{profile.bio}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
