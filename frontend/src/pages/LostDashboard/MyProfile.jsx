import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../services/api";

export default function MyProfile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    full_name: "",
    firstName: "",
    lastName: "",
    email: "",
    phone_number: "",
    bio: "",
    created_at: new Date().toISOString(),
    totalPostings: 0,
    recoveredItems: 0,
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Get user's stats
      const itemsResponse = await apiClient.get('/lost-items/my/items');
      const items = itemsResponse.data.data?.lostItems || [];
      const totalPostings = items.length;
      const recoveredItems = items.filter(item => item.status === 'found' || item.status === 'returned').length;

      // Split full_name into firstName and lastName for display
      const nameParts = (user?.full_name || "").split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      setProfile({
        full_name: user?.full_name || "",
        firstName,
        lastName,
        email: user?.email || "",
        phone_number: user?.phone_number || "",
        district: user?.district || "",
        bio: user?.bio || "",
        created_at: user?.created_at || new Date().toISOString(),
        totalPostings,
        recoveredItems,
      });

      // Set profile photo if available
      if (user?.profile_image) {
        setPreviewUrl(user.profile_image);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      // Only send if photo was changed or other fields have content
      if (!profilePhoto && !profile.firstName && !profile.lastName && !profile.phone_number && !profile.bio) {
        setError('Please upload a photo or make changes to save');
        setSaving(false);
        return;
      }

      // Combine firstName and lastName back to full_name
      const full_name = `${profile.firstName} ${profile.lastName}`.trim() || user?.full_name;
      
      const formData = new FormData();
      formData.append('full_name', full_name);
      if (profile.phone_number) formData.append('phone_number', profile.phone_number);
      if (profile.bio !== undefined && profile.bio !== null) formData.append('bio', profile.bio);
      if (profile.district) formData.append('district', profile.district);
      
      // Add photo if selected
      if (profilePhoto) {
        formData.append('profile_photo', profilePhoto);
      }

      const response = await apiClient.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.user) {
        // Update context with new user data
        updateUser(response.data.user);
        setSuccess("✅ Profile updated successfully!");
        setProfilePhoto(null);
        setIsEditing(false);
        setTimeout(() => setSuccess(''), 3000);
        await loadProfile();
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-green-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-green-900">My Profile</h1>
          <p className="text-green-700 mt-2">Manage your account information</p>
        </div>

        <button
          onClick={() => {
            setIsEditing(!isEditing);
            setError("");
            setSuccess("");
          }}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            isEditing
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {/* SUCCESS/ERROR MESSAGES */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* PROFILE CARD */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-200">
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-6">
            {/* PROFILE PHOTO UPLOAD */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile Preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-green-400 shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-600 to-emerald-500 text-white flex items-center justify-center text-5xl font-bold shadow-lg border-4 border-green-400">
                    {profile.firstName?.charAt(0) || "U"}
                    {profile.lastName?.charAt(0) || "S"}
                  </div>
                )}
                <label htmlFor="photoUpload" className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition shadow-lg">
                  📷
                </label>
              </div>
              <input
                id="photoUpload"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <p className="text-sm text-gray-600 mt-2">Click camera icon to upload profile photo</p>
            </div>

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
                name="phone_number"
                value={profile.phone_number}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* LOCATION (District) */}
            <div>
              <label className="block text-sm font-semibold text-green-900 mb-2">
                District
              </label>
              <input
                type="text"
                name="district"
                value={profile.district || ""}
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
              disabled={saving}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        ) : (
          <div className="space-y-8">
            {/* AVATAR & BASIC INFO */}
            <div className="flex flex-col items-center text-center mb-8">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-green-400 shadow-lg mb-4"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-600 to-emerald-500 text-white flex items-center justify-center text-5xl font-bold shadow-lg border-4 border-green-400 mb-4">
                  {profile.firstName?.charAt(0) || "U"}
                  {profile.lastName?.charAt(0) || "S"}
                </div>
              )}
              <h2 className="text-3xl font-bold text-green-900">{profile.full_name || "User"}</h2>
              <p className="text-green-600 font-semibold mt-2">
                ✓ Verified User
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
                  {profile.firstName || "Not provided"}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 uppercase tracking-wide font-semibold">Last Name</p>
                <p className="text-lg font-semibold text-green-900 mt-1">
                  {profile.lastName || "Not provided"}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 uppercase tracking-wide font-semibold">Email</p>
                <p className="text-lg font-semibold text-green-900 mt-1">
                  {profile.email || "Not provided"}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 uppercase tracking-wide font-semibold">Phone</p>
                <p className="text-lg font-semibold text-green-900 mt-1">
                  {profile.phone_number || "Not provided"}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 uppercase tracking-wide font-semibold">Location</p>
                <p className="text-lg font-semibold text-green-900 mt-1">
                  Kigali, Rwanda
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 uppercase tracking-wide font-semibold">Member Since</p>
                <p className="text-lg font-semibold text-green-900 mt-1">
                  {new Date(profile.created_at).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* BIO */}
            <div className="pt-4 border-t border-green-200">
              <p className="text-sm text-green-600 uppercase tracking-wide font-semibold">Bio</p>
              <p className="text-base text-green-900 mt-3 bg-green-50 p-4 rounded-lg border border-green-200">
                {profile.bio || "No bio provided yet"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
