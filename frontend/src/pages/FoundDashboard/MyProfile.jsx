import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../services/api";
import { getImageUrl } from "../../utils/imageHelper";
import { FiEdit3, FiCamera, FiCheckCircle, FiAlertCircle, FiMapPin, FiPhone, FiMail, FiUser, FiAward, FiClock } from "react-icons/fi";

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
        if (user?.profile_image) {
          setPreviewUrl(getImageUrl(user.profile_image));
        }
      }
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
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
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
      const formData = new FormData();
      formData.append('full_name', profile.full_name || '');
      formData.append('phone_number', profile.phone_number || '');
      formData.append('district', profile.district || '');
      formData.append('bio', profile.bio || '');
      if (profilePhoto) formData.append('profile_photo', profilePhoto);

      const response = await apiClient.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.user) {
        updateUser(response.data.user);
        setSuccess('Profile updated successfully!');
        setProfilePhoto(null);
        setIsEditing(false);
        setTimeout(() => setSuccess(''), 3000);
        await fetchProfileData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-green-600 rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 md:p-8 rounded-2xl border border-green-400 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 opacity-10"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">My Profile</h1>
            <p className="text-green-50 text-sm md:text-base font-medium opacity-90">Manage your account details and view your contribution statistics.</p>
          </div>
          <button
            onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
            className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md flex items-center gap-2 ${
              isEditing ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white text-green-700 hover:bg-green-50'
            }`}
          >
            {isEditing ? <FiX /> : <FiEdit3 />}
            {isEditing ? 'Cancel Changes' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {(success || error) && (
        <div className="max-w-4xl mx-auto">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-3 shadow-sm">
              <FiCheckCircle className="text-xl" />
              <p className="font-bold text-xs uppercase tracking-tight">{success}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-3 shadow-sm">
              <FiAlertCircle className="text-xl" />
              <p className="font-bold text-xs uppercase tracking-tight">{error}</p>
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: AVATAR & STATS */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-slate-50 border-b border-slate-100"></div>
            <div className="relative z-10">
              <div className="relative inline-block mt-4">
                {previewUrl ? (
                  <img src={previewUrl} alt="Avatar" className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-2xl mx-auto" />
                ) : (
                  <div className="w-32 h-32 rounded-3xl bg-green-600 text-white flex items-center justify-center text-4xl font-black shadow-2xl mx-auto border-4 border-white">
                    {profile.full_name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                {isEditing && (
                  <label htmlFor="photoUp" className="absolute -right-2 -bottom-2 w-10 h-10 bg-slate-900 text-white rounded-xl cursor-pointer hover:bg-green-600 transition-all border-2 border-white flex items-center justify-center shadow-lg">
                    <FiCamera />
                    <input id="photoUp" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                )}
              </div>
              <h2 className="mt-6 text-xl font-black text-slate-800 uppercase tracking-tight truncate">{profile.full_name || 'Guest User'}</h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{profile.email}</p>
            </div>

            <div className="mt-10 pt-10 border-t border-slate-50 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Items Found</p>
                <p className="text-2xl font-black text-green-600">{profile.foundItems}</p>
              </div>
              <div className="text-center border-l border-slate-50">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Returns</p>
                <p className="text-2xl font-black text-green-600">{profile.successfulReturns}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 rounded-full blur-[60px] opacity-20 -mr-16 -mt-16"></div>
             <div className="relative z-10 flex items-center gap-4">
               <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-green-400 border border-white/10"><FiAward size={24} /></div>
               <div>
                 <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">Global Status</p>
                 <p className="text-sm font-bold">Trusted Guardian Member</p>
               </div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILS FORM */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-12">
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                    <input type="text" name="full_name" value={profile.full_name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-500 rounded-xl px-5 py-4 font-bold text-slate-900 transition-all outline-none text-xs" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Phone Number</label>
                    <input type="tel" name="phone_number" value={profile.phone_number} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-500 rounded-xl px-5 py-4 font-bold text-slate-900 transition-all outline-none text-xs" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Primary District</label>
                    <select name="district" value={profile.district} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-500 rounded-xl px-5 py-4 font-bold text-slate-900 transition-all outline-none text-xs appearance-none">
                      <option value="">Select District</option>
                      {["Kigali", "Nyarugenge", "Gasabo", "Kicukiro", "Rubavu", "Rusizi", "Huye", "Musanze"].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Member ID</label>
                    <input type="text" value={`USR-${String(user?.id || "").substring(0, 8).toUpperCase()}`} disabled className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-5 py-4 font-bold text-slate-300 outline-none text-xs" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Biography</label>
                  <textarea name="bio" value={profile.bio} onChange={handleChange} rows="4" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-500 rounded-2xl px-6 py-5 font-semibold text-slate-700 transition-all outline-none resize-none text-xs leading-relaxed italic" placeholder="Tell us about yourself..."></textarea>
                </div>
                <button type="submit" disabled={saving} className="w-full md:w-auto bg-slate-950 text-white px-12 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-600 transition-all shadow-xl active:scale-95 disabled:opacity-50">
                  {saving ? 'Syncing...' : 'Complete Modifications'}
                </button>
              </form>
            ) : (
              <div className="space-y-12">
                <div className="grid md:grid-cols-3 gap-6">
                   <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 group">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 group-hover:text-green-600 transition-colors">Sector</p>
                      <div className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-tight"><FiMapPin className="text-green-600" /> {profile.district || 'Unassigned'}</div>
                   </div>
                   <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 group">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 group-hover:text-green-600 transition-colors">Direct Line</p>
                      <div className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-tight"><FiPhone className="text-green-600" /> {profile.phone_number || 'N/A'}</div>
                   </div>
                   <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 group">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 group-hover:text-green-600 transition-colors">Join Date</p>
                      <div className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-tight"><FiClock className="text-green-600" /> {user?.created_at ? new Date(user.created_at).toLocaleDateString().toUpperCase() : '---'}</div>
                   </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-2"><FiUser className="text-green-600" /> Narrative Identity</h3>
                  <div className="p-8 bg-green-50/20 rounded-2xl border border-green-50 italic text-slate-600 leading-relaxed font-medium">
                    "{profile.bio || "No narrative established yet. Adding a bio helps build trust within the community."}"
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-50">
                   <div className="flex items-center gap-3 text-slate-300">
                     <FiMail size={14} />
                     <p className="text-xs font-bold">{profile.email}</p>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
