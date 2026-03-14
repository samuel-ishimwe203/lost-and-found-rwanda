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
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 pb-32">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div>
          <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-[4px] mb-6 border border-blue-200">
            Hero_Protocol_Verified
          </span>
          <h1 className="text-xl font-bold text-blue-950 tracking-tight">Guardian Identity</h1>
          <p className="text-blue-600 font-medium text-xs mt-1 max-w-md">
            Manage your community protector profile and encrypted recovery credentials.
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 rounded-xl bg-blue-950 text-white font-bold text-[10px] uppercase tracking-wider transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            INITIALIZE_IDENTITY
          </button>
        )}
      </div>

      {/* FEEDBACK */}
      <div className="space-y-4 mb-12">
        {success && (
          <div className="bg-blue-950 text-blue-400 p-8 rounded-[32px] border-4 border-blue-500/20 flex items-center gap-6 animate-in slide-in-from-top-4">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-black text-xs">✓</div>
            <p className="font-black text-base tracking-tight uppercase tracking-wider">{success}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-950 text-red-400 p-6 rounded-[24px] border-4 border-red-500/20 flex items-center gap-4 animate-in shake duration-500">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white font-black text-xs">!</div>
            <p className="font-black text-base tracking-tight uppercase tracking-wider">{error}</p>
          </div>
        )}
      </div>

      {/* LOADING STATE */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
          <div className="w-20 h-20 border-8 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="font-black text-blue-900 uppercase tracking-[4px] text-xs">Accessing_Encrypted_Data...</p>
        </div>
      ) : (
        /* PROFILE CONTAINER */
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-blue-50 relative group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-[120px] opacity-40 -mr-48 -mt-48"></div>

          <div className="relative">
            {/* Cinematic Banner */}
            <div className="h-56 bg-blue-950 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
              <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white/10 to-transparent"></div>
            </div>

            {/* Avatar Section */}
            <div className="absolute top-32 left-12 md:left-20">
              <div className="relative group/avatar">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg transition-transform group-hover/avatar:scale-105 duration-700"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-3xl font-bold shadow-lg border-4 border-white -rotate-3">
                    {profile.full_name?.charAt(0)?.toUpperCase() || "F"}
                  </div>
                )}
                {isEditing && (
                  <label htmlFor="photoUpload" className="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-600 text-white rounded-[24px] cursor-pointer hover:bg-black transition-all shadow-2xl border-[6px] border-white flex items-center justify-center animate-bounce hover:animate-none">
                    <span className="text-2xl">📷</span>
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="pt-16 p-6 md:p-8">
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-16 animate-in slide-in-from-bottom-8 duration-700">
                <input id="photoUpload" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />

                <div className="grid lg:grid-cols-2 gap-12">
                  <div className="space-y-10">
                    <div className="space-y-3">
                      <label className="text-[9px] font-bold text-blue-500 uppercase tracking-widest pl-2">GIVEN_IDENTITY</label>
                      <input
                        type="text"
                        name="full_name"
                        value={profile.full_name}
                        onChange={handleChange}
                        className="w-full bg-blue-50/30 border border-blue-100 focus:bg-white focus:border-blue-600 rounded-xl px-4 py-3 font-semibold text-blue-950 transition-all outline-none text-sm"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] font-bold text-blue-500 uppercase tracking-widest pl-2 font-mono">ENCRYPTED_SIGNAL</label>
                      <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-semibold text-slate-400 cursor-not-allowed text-sm">
                        {profile.email}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="space-y-3">
                      <label className="text-[9px] font-bold text-blue-500 uppercase tracking-widest pl-2 font-mono">COMM_LINE_TELEMETRY</label>
                      <input
                        type="tel"
                        name="phone_number"
                        value={profile.phone_number}
                        onChange={handleChange}
                        className="w-full bg-blue-50/30 border border-blue-100 focus:bg-white focus:border-blue-600 rounded-xl px-4 py-3 font-semibold text-blue-950 transition-all outline-none text-sm"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] font-bold text-blue-500 uppercase tracking-widest pl-2 font-mono">LOCALIZATION_NODE</label>
                      <select
                        name="district"
                        value={profile.district}
                        onChange={handleChange}
                        className="w-full bg-blue-50/30 border border-blue-100 focus:bg-white focus:border-blue-600 rounded-xl px-4 py-3 font-semibold text-blue-950 transition-all outline-none text-sm appearance-none"
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
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-bold text-blue-500 uppercase tracking-widest pl-2 font-mono">HERO_MANIFESTO_TRANSCRIPT</label>
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    rows="3"
                    className="w-full bg-blue-50/30 border border-blue-100 focus:bg-white focus:border-blue-600 rounded-2xl px-6 py-4 font-semibold text-blue-950 transition-all outline-none resize-none text-sm leading-relaxed"
                  ></textarea>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-blue-950 text-white px-10 py-4 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    {saving ? "SYNCING..." : "COMMIT_CHANGES"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); fetchProfileData(); }}
                    disabled={saving}
                    className="px-6 py-4 bg-red-950 text-red-400 rounded-xl font-bold text-[10px] uppercase tracking-wider border border-red-500/20 hover:bg-red-900 transition-all"
                  >
                    ABORT
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-20 animate-in fade-in duration-1000">
                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 border-b-4 border-blue-50 pb-16">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-950 tracking-tight mb-2">
                      {profile.full_name || "Community_Guardian"}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="px-3 py-1 bg-blue-950 text-blue-400 text-[8px] font-bold uppercase tracking-widest rounded-full border border-blue-400/30">
                        HERO_STATUS_V4
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></div>
                        <span className="text-blue-600 font-bold text-[8px] uppercase tracking-widest">Telemetry_Stable_Verified</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 text-center min-w-[100px] shadow-sm">
                      <p className="text-xl font-bold text-blue-950 mb-0.5">{profile.foundItems}</p>
                      <p className="text-[8px] font-bold text-blue-400 uppercase tracking-wider leading-none">Assets_Found</p>
                    </div>
                    <div className="bg-indigo-600 p-4 rounded-2xl text-center text-white min-w-[100px] shadow-lg">
                      <p className="text-xl font-bold mb-0.5">{profile.successfulReturns}</p>
                      <p className="text-[8px] font-bold text-white/60 uppercase tracking-wider leading-none">Restoration_Rate</p>
                    </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                  <div className="group bg-blue-50/20 p-8 rounded-[40px] border border-blue-50 hover:bg-white hover:border-blue-500 transition-all duration-500 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full blur-[40px] opacity-0 group-hover:opacity-40 transition-opacity"></div>
                    <p className="text-[8px] font-bold text-blue-500 uppercase tracking-[4px] mb-6 font-mono">CONTACT_BAND_TELEMETRY</p>
                    <div className="space-y-8">
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-lg border border-blue-50 group-hover:rotate-6 transition-transform">
                          <span className="text-lg">@</span>
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-blue-300 uppercase tracking-[2px] mb-0.5">Secure_Signal</p>
                          <p className="text-sm font-bold text-blue-950 tracking-tight">{profile.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-lg border border-blue-50 group-hover:-rotate-6 transition-transform">
                          <span className="text-lg">⚡</span>
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-blue-300 uppercase tracking-[2px] mb-0.5">Comm_Link</p>
                          <p className="text-sm font-bold text-blue-950 tracking-tight">{profile.phone_number || "LINK_OFFLINE"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="group bg-indigo-50/20 p-8 rounded-[40px] border border-indigo-50 hover:bg-white hover:border-indigo-500 transition-all duration-500 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100 rounded-full blur-[40px] opacity-0 group-hover:opacity-40 transition-opacity"></div>
                    <p className="text-[8px] font-bold text-indigo-500 uppercase tracking-[4px] mb-6 font-mono">SECTOR_LOCALIZATION</p>
                    <div className="space-y-8">
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-lg border border-indigo-50 group-hover:rotate-3 transition-transform font-bold">
                          <span className="text-lg">Z</span>
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-indigo-300 uppercase tracking-[2px] mb-0.5">Zone_Node</p>
                          <p className="text-sm font-bold text-indigo-950 tracking-tight uppercase italic">{profile.district || "CENTRAL_SECTOR"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-lg border border-indigo-50 group-hover:-rotate-3 transition-transform font-bold">
                          <span className="text-lg">T</span>
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-indigo-300 uppercase tracking-[2px] mb-0.5">Activation_Epoch</p>
                          <p className="text-sm font-bold text-indigo-950 tracking-tight">
                            {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase() : 'ALPHA_PHASE'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-8 rounded-[32px] shadow-xl relative overflow-hidden group/bio">
                  <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-10 -ml-32 -mt-32 transition-all group-hover/bio:opacity-20"></div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-6 h-0.5 bg-blue-500 rounded-full"></span>
                    <p className="text-[8px] font-bold text-blue-400 uppercase tracking-[3px] font-mono">PHILOSOPHY_MANIFESTO</p>
                  </div>
                  <p className="text-base font-bold leading-relaxed text-blue-50 italic tracking-tight">
                    "{profile.bio || "Dedicated to the restoration of community trust and the successful return of misplaced assets to their rightful holders."}"
                  </p>
                  <div className="mt-6 flex justify-end">
                    <p className="text-blue-800 font-mono text-[8px] font-bold uppercase tracking-[1px]">SIGNATURE_OK</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
