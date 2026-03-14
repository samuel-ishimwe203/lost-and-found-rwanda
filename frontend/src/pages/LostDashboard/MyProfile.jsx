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
      <div className="bg-white rounded-[48px] shadow-2xl overflow-hidden border border-green-100 transition-all duration-500 hover:shadow-green-900/10">
        <div className="bg-gradient-to-r from-green-900 to-emerald-800 h-32 w-full relative">
           <div className="absolute -bottom-16 left-12">
              <div className="relative group">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile"
                    className="w-32 h-32 rounded-3xl object-cover border-8 border-white shadow-2xl transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-3xl bg-emerald-500 text-white flex items-center justify-center text-4xl font-black shadow-2xl border-8 border-white">
                    {profile.firstName?.charAt(0) || "U"}
                  </div>
                )}
                {isEditing && (
                  <label htmlFor="photoUpload" className="absolute -right-2 -bottom-2 bg-green-600 text-white p-3 rounded-2xl cursor-pointer hover:bg-green-700 transition shadow-xl border-4 border-white">
                    <span className="text-lg">📷</span>
                  </label>
                )}
              </div>
           </div>
        </div>

        <div className="pt-20 px-12 pb-12">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-10">
              <input id="photoUpload" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-green-700 uppercase tracking-widest px-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleChange}
                    className="w-full bg-green-50/50 border-2 border-transparent focus:bg-white focus:border-green-600 rounded-2xl px-6 py-4 font-bold text-green-900 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-green-700 uppercase tracking-widest px-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profile.lastName}
                    onChange={handleChange}
                    className="w-full bg-green-50/50 border-2 border-transparent focus:bg-white focus:border-green-600 rounded-2xl px-6 py-4 font-bold text-green-900 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-green-700 uppercase tracking-widest px-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    disabled
                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 font-bold text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-green-700 uppercase tracking-widest px-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={profile.phone_number}
                    onChange={handleChange}
                    className="w-full bg-green-50/50 border-2 border-transparent focus:bg-white focus:border-green-600 rounded-2xl px-6 py-4 font-bold text-green-900 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-green-700 uppercase tracking-widest px-1">Short Bio</label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  rows="4"
                  className="w-full bg-green-50/50 border-2 border-transparent focus:bg-white focus:border-green-600 rounded-[32px] px-8 py-6 font-bold text-green-900 transition-all outline-none resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-green-900 text-white px-8 py-5 rounded-[24px] font-black text-lg hover:bg-black transition shadow-2xl disabled:opacity-50"
              >
                {saving ? "Updating..." : "Confirm & Save Changes"}
              </button>
            </form>
          ) : (
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-green-50 pb-8">
                <div>
                  <h2 className="text-4xl font-black text-green-900 tracking-tight">{profile.full_name || "User Profile"}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full">Primary Account</span>
                    <span className="text-green-500 font-bold text-xs flex items-center gap-1">✓ Identity Verified</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-green-50 px-6 py-4 rounded-3xl border border-green-100 text-center min-w-[120px]">
                    <p className="text-2xl font-black text-green-900">{profile.totalPostings}</p>
                    <p className="text-[10px] font-black text-green-500 uppercase tracking-tighter">Total Posts</p>
                  </div>
                  <div className="bg-emerald-500 px-6 py-4 rounded-3xl border border-emerald-400 text-center text-white min-w-[120px] shadow-lg shadow-emerald-500/20">
                    <p className="text-2xl font-black">{profile.recoveredItems}</p>
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-tighter">Recovered</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="group bg-green-50/30 p-8 rounded-[32px] border border-green-50 hover:bg-white hover:border-green-200 transition-all duration-300">
                  <p className="text-[10px] font-black text-green-500 uppercase tracking-[3px] mb-4 font-mono">ACCOUNT_DETAILS</p>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-green-600 shadow-sm border border-green-100">📧</div>
                      <div>
                        <p className="text-[10px] font-black text-green-300 uppercase">Email</p>
                        <p className="text-sm font-black text-green-900">{profile.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-green-600 shadow-sm border border-green-100">📱</div>
                      <div>
                        <p className="text-[10px] font-black text-green-300 uppercase">Phone</p>
                        <p className="text-sm font-black text-green-900">{profile.phone_number || "Not set"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group bg-blue-50/30 p-8 rounded-[32px] border border-blue-50 hover:bg-white hover:border-blue-200 transition-all duration-300">
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-[3px] mb-4 font-mono">LOCATION_ID</p>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">📍</div>
                      <div>
                        <p className="text-[10px] font-black text-blue-300 uppercase">Primary District</p>
                        <p className="text-sm font-black text-blue-900">{profile.district || "Kigali, Rwanda"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">📅</div>
                      <div>
                        <p className="text-[10px] font-black text-blue-300 uppercase">Operating Since</p>
                        <p className="text-sm font-black text-blue-900">
                          {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 rounded-full blur-[100px] opacity-20 -mr-32 -mt-32"></div>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[5px] mb-4">Professional Bio</p>
                <p className="text-lg font-bold leading-relaxed text-slate-300 italic">
                  "{profile.bio || "This user prefers to keep their profile brief as they help the community recover lost items."}"
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
