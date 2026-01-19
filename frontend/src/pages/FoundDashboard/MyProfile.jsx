import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../services/api";

export default function MyProfile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    district: '',
    bio: '',
    foundItems: 0,
    successfulReturns: 0,
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Get user profile
      if (user) {
        setProfile({
          full_name: user.full_name || '',
          email: user.email || '',
          phone_number: user.phone_number || '',
          district: user.district || '',
          bio: user.bio || '',
          foundItems: 0,
          successfulReturns: 0,
        });
        
        // Set profile photo if available
        if (user?.profile_image) {
          setPreviewUrl(user.profile_image);
        }
      }

      // Get stats
      const statsResponse = await apiClient.get('/found-items/my/stats');
      if (statsResponse.data.success) {
        setProfile(prev => ({
          ...prev,
          foundItems: statsResponse.data.data.totalFoundItems || 0,
          successfulReturns: statsResponse.data.data.returnedItems || 0,
        }));
      }
    } catch (err) {
      console.error('Profile data error:', err);
      setError('Failed to load profile data');
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
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Only send if photo was changed or other fields have content
      if (!profilePhoto && !profile.full_name && !profile.phone_number && !profile.bio && !profile.district) {
        setError('Please upload a photo or make changes to save');
        setSaving(false);
        return;
      }

      const formData = new FormData();
      formData.append('full_name', profile.full_name || '');
      formData.append('phone_number', profile.phone_number || '');
      formData.append('district', profile.district || '');
      formData.append('bio', profile.bio || '');
      
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
        setSuccess('✅ Profile updated successfully!');
        setProfilePhoto(null);
        setIsEditing(false);
        setTimeout(() => setSuccess(''), 3000);
        await fetchProfileData();
      }
    } catch (err) {
      console.error('Update profile error:', err);
      if (err.response?.status === 401) {
        setError('🔒 Session expired. Please login again.');
      } else if (err.message === 'Network Error') {
        setError('🌐 Network error. Please check your connection.');
      } else {
        setError(`❌ ${err.response?.data?.message || 'Failed to update profile. Please try again.'}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-blue-900">My Profile</h1>
          <p className="text-blue-700 mt-2">Manage your account information</p>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 rounded-lg font-semibold transition bg-blue-600 text-white hover:bg-blue-700"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="bg-green-50 border border-green-300 rounded-xl p-4 text-green-700">
          {success}
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-blue-700 mt-4">Loading profile...</p>
        </div>
      )}

      {/* PROFILE CARD */}
      {!loading && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-200">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-6">
              {/* PROFILE PHOTO UPLOAD */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile Preview"
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-400 shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center text-5xl font-bold shadow-lg border-4 border-blue-400">
                      {profile.full_name?.charAt(0)?.toUpperCase() || "F"}
                    </div>
                  )}
                  <label htmlFor="photoUpload" className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition shadow-lg">
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

              {/* FULL NAME */}
              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={profile.full_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-blue-300 bg-blue-50 text-blue-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* EMAIL (READ-ONLY) */}
              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  Email (cannot be changed)
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-2 border border-blue-200 bg-gray-100 text-gray-600 rounded-lg cursor-not-allowed"
                />
              </div>

              {/* PHONE */}
              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={profile.phone_number}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-blue-300 bg-blue-50 text-blue-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* LOCATION */}
              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  District
                </label>
                <select
                  name="district"
                  value={profile.district}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-blue-300 bg-blue-50 text-blue-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select District</option>
                  <option value="Kigali">Kigali</option>
                  <option value="Nyarugenge">Nyarugenge</option>
                  <option value="Gasabo">Gasabo</option>
                  <option value="Kicukiro">Kicukiro</option>
                  <option value="Rubavu">Rubavu</option>
                  <option value="Rusizi">Rusizi</option>
                  <option value="Huye">Huye</option>
                  <option value="Musanze">Musanze</option>
                </select>
              </div>

              {/* BIO */}
              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-2 border border-blue-300 bg-blue-50 text-blue-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              {/* BUTTONS */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfileData();
                  }}
                  disabled={saving}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition disabled:bg-red-400 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* AVATAR SECTION */}
              <div className="flex flex-col items-center text-center mb-8">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-400 shadow-lg mb-4"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center text-5xl font-bold shadow-lg border-4 border-blue-400 mb-4">
                    {profile.full_name?.charAt(0)?.toUpperCase() || "F"}
                  </div>
                )}
                <h2 className="text-3xl font-bold text-blue-900">{profile.full_name || "User"}</h2>
                <p className="text-blue-600 font-semibold mt-2">✓ Verified User</p>
              </div>

              {/* PROFILE INFO GRID */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-600 uppercase">Full Name</p>
                  <p className="text-2xl font-bold text-blue-900 mt-2">
                    {profile.full_name || 'N/A'}
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-600 uppercase">Email</p>
                  <p className="text-lg font-bold text-blue-900 mt-2">{profile.email || 'N/A'}</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-600 uppercase">Phone</p>
                  <p className="text-lg font-bold text-blue-900 mt-2">{profile.phone_number || 'N/A'}</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-600 uppercase">Location</p>
                  <p className="text-lg font-bold text-blue-900 mt-2">{profile.district || 'N/A'}</p>
                </div>
              </div>

              {/* BIO SECTION */}
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <p className="text-xs font-semibold text-blue-600 uppercase mb-2">Bio</p>
                <p className="text-blue-900">{profile.bio || 'No bio yet. Click "Edit Profile" to add one.'}</p>
              </div>

              {/* STATS SECTION */}
              <div className="grid md:grid-cols-4 gap-4 pt-6 border-t border-blue-200">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{profile.foundItems}</p>
                  <p className="text-sm text-blue-600 mt-1">Found Items</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{profile.successfulReturns}</p>
                  <p className="text-sm text-blue-600 mt-1">Successful Returns</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{user?.created_at ? new Date(user.created_at).getFullYear() : '2024'}</p>
                  <p className="text-sm text-blue-600 mt-1">Member Since</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl">✅</p>
                  <p className="text-sm text-blue-600 mt-1">Verified User</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
