import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/api";
import { PostsContext } from "../../context/PostsContext";
import { FiUploadCloud, FiX, FiCheckCircle, FiInfo, FiMapPin, FiCalendar, FiTag, FiDollarSign, FiSearch, FiAlertCircle, FiChevronRight } from "react-icons/fi";
import { getImageUrl } from "../../utils/imageHelper";
import { useLanguage } from "../../context/LanguageContext";

export default function CreatePost() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { refreshPosts } = useContext(PostsContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [matches, setMatches] = useState([]);
  
  const [formData, setFormData] = useState({
    item_type: "",
    description: "",
    category: "",
    customCategory: "",
    color: "",
    owner_name: "",
    id_number: "",
    location_lost: "",
    district: "",
    date_lost: "",
    reward_amount: "",
    contact_phone: "",
    image: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(t("validation.fileTooBig"));
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError(t("validation.invalidFileType"));
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const handleReset = () => {
    setFormData({
      item_type: "",
      description: "",
      category: "",
      customCategory: "",
      color: "",
      owner_name: "",
      id_number: "",
      location_lost: "",
      district: "",
      date_lost: "",
      reward_amount: "",
      contact_phone: "",
      image: null
    });
    setImagePreview(null);
    setError("");
    setSuccess("");
    setMatches([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('item_type', formData.item_type);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category === 'other' ? formData.customCategory : formData.category);
      submitData.append('location_lost', formData.location_lost);
      submitData.append('district', formData.district);
      submitData.append('date_lost', formData.date_lost);
      submitData.append('reward_amount', parseInt(formData.reward_amount) || 0);
      
      const additionalInfo = {
        color: formData.color,
        contact_phone: formData.contact_phone,
        owner_name: formData.owner_name,
        id_number: formData.id_number
      };
      submitData.append('additional_info', JSON.stringify(additionalInfo));
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      const response = await apiClient.post('/lost-items', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const potentialMatches = response.data?.data?.potentialMatches || [];
      setMatches(potentialMatches);

      if (potentialMatches.length === 0) {
        setSuccess(t("items.itemPosted"));
        if (refreshPosts) await refreshPosts();
        setTimeout(() => navigate('/lost-dashboard/my-postings'), 2000);
      } else {
        setSuccess(t("matches.potentialMatches"));
        if (refreshPosts) await refreshPosts();
      }
    } catch (err) {
      console.error('Post error:', err);
      setError(err.response?.data?.message || t("messages.operationFailed"));
    } finally {
      setLoading(false);
    }
  };

  const districts = ["Kigali", "Gasabo", "Kicukiro", "Nyarugenge", "Huye", "Musanze", "Rubavu", "Rusizi"];
  const categories = [
    { value: "national_id", label: t("categories.national_id") },
    { value: "passport", label: t("categories.passport") },
    { value: "driving_license", label: t("categories.driving_license") },
    { value: "atm_card", label: t("categories.atm_card") },
    { value: "other", label: t("categories.other") }
  ];

  return (
    <div className="space-y-8 pb-32">
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 md:p-8 rounded-2xl border border-green-400 shadow-lg relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/5 opacity-10"></div>
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
            {t("items.postLostItem")}
          </h1>
          <p className="text-green-50 text-sm md:text-base opacity-90 max-w-2xl font-medium">
            {t("landing.heroSubtitle")}
          </p>
        </div>
      </div>

      {(success || error) && (
        <div className="animate-in slide-in-from-top-4">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-5 rounded-xl flex items-center gap-4 shadow-sm">
              <FiCheckCircle className="w-6 h-6 shrink-0" />
              <p className="font-bold text-sm uppercase tracking-tight">{success}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-xl flex items-center gap-4 shadow-sm">
              <FiAlertCircle className="w-6 h-6 shrink-0" />
              <p className="font-bold text-sm uppercase tracking-tight">{error}</p>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-12 space-y-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1.5 bg-green-600 rounded-full"></div>
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{t("profile.personalInfo")}</h3>
            </div>
            
            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("items.title")} *</label>
                <input
                  type="text"
                  name="item_type"
                  value={formData.item_type}
                  onChange={handleChange}
                  placeholder="e.g. National ID Card"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-500 rounded-xl px-5 py-4 font-bold text-slate-900 transition-all outline-none text-xs placeholder:text-slate-300"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("items.category")} *</label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-500 rounded-xl px-5 py-4 font-bold text-slate-900 transition-all outline-none text-xs appearance-none"
                      required
                    >
                      <option value="">{t("items.selectCategory")}</option>
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                      ▼
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("items.date")} *</label>
                  <input
                    type="date"
                    name="date_lost"
                    value={formData.date_lost}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-500 rounded-xl px-5 py-4 font-bold text-slate-900 transition-all outline-none text-xs"
                    required
                  />
                </div>
              </div>

              {formData.category === "other" && (
                <div className="animate-in slide-in-from-top-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("categories.other")}</label>
                  <input
                    type="text"
                    name="customCategory"
                    value={formData.customCategory}
                    onChange={handleChange}
                    placeholder="..."
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-500 rounded-xl px-5 py-4 font-bold text-slate-900 transition-all outline-none text-xs mt-2"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1.5 bg-green-600 rounded-full"></div>
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{t("items.image")}</h3>
            </div>
            
            <div className="relative h-[256px] group">
              <input
                type="file"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`h-full border-2 border-dashed rounded-2xl transition-all duration-300 flex flex-col items-center justify-center p-6 overflow-hidden ${ imagePreview ? 'border-green-500 bg-green-50/20 shadow-inner' : 'border-slate-100 bg-slate-50 group-hover:border-green-400 group-hover:bg-white' }`}>
                {imagePreview ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img src={imagePreview} className="max-h-full rounded-xl shadow-2xl border-2 border-white" alt="Preview" />
                    <button
                      type="button"
                      onClick={() => { setImagePreview(null); setFormData(prev => ({ ...prev, image: null })); }}
                      className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md text-white rounded-lg w-10 h-10 flex items-center justify-center hover:bg-red-500 shadow-md z-20 transition-all"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300 mx-auto transition-all group-hover:scale-110 group-hover:text-green-500 border border-slate-50">
                      <FiUploadCloud className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{t("items.addImage")}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter italic">MAX 5MB | JPG, PNG</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-10">
           <div className="flex items-center gap-3">
            <div className="h-6 w-1.5 bg-green-600 rounded-full"></div>
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{t("items.itemDetails")}</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("items.color")}</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="..."
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-500 rounded-xl px-5 py-4 font-bold text-slate-900 outline-none text-xs"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("auth.firstName")} *</label>
              <input
                type="text"
                name="owner_name"
                value={formData.owner_name}
                onChange={handleChange}
                placeholder="..."
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-500 rounded-xl px-5 py-4 font-bold text-slate-900 outline-none text-xs"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">ID / Serial No</label>
              <input
                type="text"
                name="id_number"
                value={formData.id_number}
                onChange={handleChange}
                placeholder="..."
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-500 rounded-xl px-5 py-4 font-bold text-slate-900 outline-none text-xs"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("auth.phone")} *</label>
              <input
                type="tel"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                placeholder="+250..."
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-500 rounded-xl px-5 py-4 font-bold text-slate-900 outline-none text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 leading-relaxed">{t("items.description")}</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="..."
              rows="4"
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-500 rounded-2xl px-6 py-5 font-semibold text-slate-700 transition-all outline-none resize-none text-sm leading-relaxed italic"
            ></textarea>
          </div>
        </div>

        <div className="space-y-10">
           <div className="flex items-center gap-3">
            <div className="h-6 w-1.5 bg-green-600 rounded-full"></div>
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{t("items.location")}</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("items.location")} *</label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-500 rounded-xl px-5 py-4 font-bold text-slate-900 transition-all outline-none text-xs appearance-none"
                required
              >
                <option value="">Select District</option>
                {districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("items.location")} Detail *</label>
              <input
                type="text"
                name="location_lost"
                value={formData.location_lost}
                onChange={handleChange}
                placeholder="..."
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-500 rounded-xl px-5 py-4 font-bold text-slate-900 transition-all outline-none text-xs placeholder:text-slate-300"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("items.rewardAmount")} (RWF)</label>
              <div className="relative">
                 <input
                  type="number"
                  name="reward_amount"
                  value={formData.reward_amount}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-500 rounded-xl pl-12 pr-5 py-4 font-black text-slate-900 outline-none text-xs"
                />
                <FiDollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-8">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-slate-950 text-white rounded-2xl py-5 font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-green-600 transition-all duration-300 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin rounded-full"></div> : <FiCheckCircle />}
            {loading ? t("messages.processing") : t("common.submit")}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-12 py-5 border border-slate-100 text-slate-400 font-bold rounded-2xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all text-xs uppercase tracking-widest"
          >
            {t("common.cancel")}
          </button>
        </div>
      </form>

      {matches.length > 0 && (
        <div className="space-y-8 animate-in slide-in-from-bottom-12 duration-1000">
          <div className="flex items-center gap-4 px-2">
            <div className="h-6 w-1.5 bg-green-600 rounded-full"></div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">{t("matches.potentialMatches")}</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {matches.map((item) => (
              <div key={item.id} className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-green-100 flex flex-col">
                <div className="relative h-40 bg-slate-50 overflow-hidden shrink-0">
                  {item.image_url ? (
                    <img src={getImageUrl(item.image_url)} alt={item.item_type} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                      <FiTag className="text-4xl opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-md text-white rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/10 uppercase">{t("common.success")}</span>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col">
                  <div>
                    <h4 className="text-lg font-black text-slate-900 leading-tight truncate">{item.item_type || 'Discovery Entry'}</h4>
                    <div className="flex items-center gap-4 mt-2">
                       <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest"><FiMapPin className="text-green-500" /> {item.location_found || 'Unknown'}</span>
                    </div>
                  </div>
                  
                  <p className="text-slate-500 text-[11px] font-medium leading-relaxed line-clamp-2 italic mb-4">
                    {item.description}
                  </p>

                  <button 
                    onClick={() => navigate(`/lost-dashboard/matches`)}
                    className="w-full mt-auto py-3 bg-slate-50 text-slate-900 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all border border-slate-100 flex items-center justify-center gap-2"
                  >
                    {t("matches.viewDetails")} <FiChevronRight />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
