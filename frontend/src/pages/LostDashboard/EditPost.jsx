import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../services/api";
import { useContext } from "react";
import { PostsContext } from "../../context/PostsContext";
import { getImageUrl } from "../../utils/imageHelper";
import { useLanguage } from "../../context/LanguageContext";
import { FiSave, FiX, FiCheckCircle, FiAlertCircle, FiUploadCloud, FiInbox, FiTag, FiClock, FiMapPin, FiUser, FiSmartphone, FiDollarSign } from "react-icons/fi";

export default function EditPost() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshPosts } = useContext(PostsContext);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  
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

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setFetching(true);
        const response = await apiClient.get(`/lost-items/${id}`);
        const item = response.data.data.lostItem;
        
        // Handle categories
        const standardCategories = ['national_id', 'passport', 'driving_license', 'atm_card'];
        const isStandard = standardCategories.includes(item.category);
        
        // Parse additional info
        let additionalInfo = {};
        try {
          additionalInfo = typeof item.additional_info === 'string' 
            ? JSON.parse(item.additional_info) 
            : (item.additional_info || {});
        } catch (e) {
          additionalInfo = {};
        }

        setFormData({
          item_type: item.item_type || "",
          description: item.description || "",
          category: isStandard ? item.category : "other",
          customCategory: isStandard ? "" : item.category,
          color: additionalInfo.color || "",
          owner_name: item.holder_name || additionalInfo.owner_name || "",
          id_number: item.id_number || additionalInfo.id_number || "",
          location_lost: item.location_lost || "",
          district: item.district || "",
          date_lost: item.date_lost ? item.date_lost.split('T')[0] : "",
          reward_amount: item.reward_amount || "",
          contact_phone: additionalInfo.contact_phone || "",
          image: null
        });

        if (item.image_url) {
          setImagePreview(getImageUrl(item.image_url));
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(t("messages.operationFailed"));
      } finally {
        setFetching(false);
      }
    };

    fetchItemDetails();
  }, [id, t]);

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
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setError("");
    }
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
      
      submitData.append('holder_name', formData.owner_name);
      submitData.append('id_number', formData.id_number);

      if (formData.image) {
        submitData.append('image', formData.image);
      }

      await apiClient.put(`/lost-items/${id}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSuccess(t("items.itemUpdated"));
      if (refreshPosts) await refreshPosts();
      setTimeout(() => navigate('/lost-dashboard/my-postings'), 2000);
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || t("messages.operationFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-[#10b981] rounded-full animate-spin"></div>
      </div>
    );
  }

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
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 md:p-10 rounded-2xl border border-blue-600 shadow-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/5 opacity-10"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-white uppercase italic tracking-tighter mb-2">
              {t("common.edit")} {t("items.itemDetails")}
            </h1>
            <p className="text-blue-100 text-sm md:text-base font-medium opacity-80 max-w-xl">
               {t("postings.itemsLost")} Record - Node ID: {id?.substring(0,8)}
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/20 shadow-inner">
                <FiTag className="text-white text-xl" />
             </div>
          </div>
        </div>
      </div>

      {(success || error) && (
        <div className="animate-in slide-in-from-top-4 duration-500">
          {success && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-5 rounded-xl flex items-center gap-4 shadow-sm">
              <FiCheckCircle className="w-6 h-6 shrink-0" />
              <p className="font-black text-xs uppercase tracking-widest">{success}</p>
            </div>
          )}
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 p-5 rounded-xl flex items-center gap-4 shadow-sm">
              <FiAlertCircle className="w-6 h-6 shrink-0" />
              <p className="font-black text-xs uppercase tracking-widest">{error}</p>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-12 space-y-12">
        <div className="grid lg:grid-cols-2 gap-12">
           <div className="space-y-10">
              <div className="flex items-center gap-3">
                <div className="h-6 w-1.5 bg-blue-600 rounded-full"></div>
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">{t("dashboard.settings")}</h3>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t("items.title")} *</label>
                    <div className="relative">
                       <input
                          type="text"
                          name="item_type"
                          value={formData.item_type}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-5 py-4 font-bold text-slate-900 transition-all outline-none text-xs placeholder:text-slate-300"
                          required
                       />
                       <FiInbox className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    </div>
                 </div>

                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t("items.category")} *</label>
                       <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-5 py-4 font-bold text-slate-900 transition-all outline-none text-xs appearance-none"
                          required
                       >
                          <option value="">{t("items.selectCategory")}</option>
                          {categories.map(cat => (
                             <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t("items.date")} *</label>
                       <div className="relative">
                          <input
                             type="date"
                             name="date_lost"
                             value={formData.date_lost}
                             onChange={handleChange}
                             max={new Date().toISOString().split('T')[0]}
                             className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-5 py-4 font-bold text-slate-900 transition-all outline-none text-xs"
                             required
                          />
                          <FiClock className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" />
                       </div>
                    </div>
                 </div>

                 {formData.category === "other" && (
                    <div className="animate-in slide-in-from-top-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t("categories.other")}</label>
                       <input
                          type="text"
                          name="customCategory"
                          value={formData.customCategory}
                          onChange={handleChange}
                          placeholder="..."
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-5 py-4 font-bold text-slate-900 transition-all outline-none text-xs mt-2 shadow-inner"
                          required
                       />
                    </div>
                 )}
              </div>
           </div>

           <div className="space-y-10">
              <div className="flex items-center gap-3">
                 <div className="h-6 w-1.5 bg-blue-600 rounded-full"></div>
                 <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">{t("items.image")}</h3>
              </div>

              <div className="relative h-[256px] group">
                 <input
                    type="file"
                    name="image"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                 />
                 <div className={`h-full border-2 border-dashed rounded-2xl transition-all duration-300 flex flex-col items-center justify-center p-6 overflow-hidden ${ imagePreview ? 'border-blue-500 bg-blue-50/20 shadow-inner' : 'border-slate-100 bg-slate-50 group-hover:border-blue-400 group-hover:bg-white' }`}>
                    {imagePreview ? (
                       <div className="relative w-full h-full flex items-center justify-center">
                          <img src={imagePreview} className="max-h-full rounded-xl shadow-2xl border-2 border-white" alt="Preview" />
                          <div className="absolute top-2 right-2 flex gap-2">
                             <div className="bg-blue-600 text-white p-2 rounded-lg shadow-lg">
                                <FiUploadCloud size={16} />
                             </div>
                             <button
                                type="button"
                                onClick={() => { setImagePreview(null); setFormData(prev => ({ ...prev, image: null })); }}
                                className="bg-rose-500 text-white p-2 rounded-lg shadow-lg hover:bg-rose-600 transition-colors"
                             >
                                <FiX size={16} />
                             </button>
                          </div>
                       </div>
                    ) : (
                       <div className="text-center space-y-4">
                          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300 mx-auto transition-all group-hover:scale-110 group-hover:text-blue-500 border border-slate-50">
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
              <div className="h-6 w-1.5 bg-blue-600 rounded-full"></div>
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] uppercase tracking-[0.2em]">{t("items.itemDetails")}</h3>
           </div>

           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t("items.color")}</label>
                 <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-5 py-4 font-bold text-slate-900 outline-none text-xs"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t("auth.firstName")} *</label>
                 <div className="relative">
                    <input
                       type="text"
                       name="owner_name"
                       value={formData.owner_name}
                       onChange={handleChange}
                       className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-5 py-4 font-bold text-slate-900 outline-none text-xs"
                       required
                    />
                    <FiUser className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">ID / Serial No</label>
                 <input
                    type="text"
                    name="id_number"
                    value={formData.id_number}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-5 py-4 font-bold text-slate-900 outline-none text-xs"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t("auth.phone")} *</label>
                 <div className="relative">
                    <input
                       type="tel"
                       name="contact_phone"
                       value={formData.contact_phone}
                       onChange={handleChange}
                       className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-5 py-4 font-bold text-slate-900 outline-none text-xs"
                       required
                    />
                    <FiSmartphone className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" />
                 </div>
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t("items.description")}</label>
              <textarea
                 name="description"
                 value={formData.description}
                 onChange={handleChange}
                 rows="4"
                 className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-2xl px-6 py-5 font-semibold text-slate-700 transition-all outline-none resize-none text-sm leading-relaxed italic shadow-inner"
              ></textarea>
           </div>
        </div>

        <div className="space-y-10">
           <div className="flex items-center gap-3">
              <div className="h-6 w-1.5 bg-blue-600 rounded-full"></div>
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">{t("items.location")}</h3>
           </div>

           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t("items.location")} *</label>
                 <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-5 py-4 font-bold text-slate-900 transition-all outline-none text-xs appearance-none"
                    required
                 >
                    <option value="">Select District</option>
                    {districts.map(d => (
                       <option key={d} value={d}>{d}</option>
                    ))}
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t("items.location")} Detail *</label>
                 <div className="relative">
                    <input
                       type="text"
                       name="location_lost"
                       value={formData.location_lost}
                       onChange={handleChange}
                       className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-5 py-4 font-bold text-slate-900 transition-all outline-none text-xs"
                       required
                    />
                    <FiMapPin className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t("items.rewardAmount")} (RWF)</label>
                 <div className="relative">
                    <input
                       type="number"
                       name="reward_amount"
                       value={formData.reward_amount}
                       onChange={handleChange}
                       className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl pl-12 pr-5 py-4 font-black text-slate-900 outline-none text-xs"
                    />
                    <FiDollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-600" />
                 </div>
              </div>
           </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-50">
           <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-slate-950 text-white rounded-2xl py-5 font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-600 transition-all duration-300 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3"
           >
              {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin rounded-full"></div> : <FiSave />}
              {loading ? t("messages.processing") : t("common.save")}
           </button>
           <button
              type="button"
              onClick={() => navigate('/lost-dashboard/my-postings')}
              className="px-12 py-5 border border-slate-100 text-slate-400 font-bold rounded-2xl hover:bg-slate-50 transition-all text-xs uppercase tracking-widest"
           >
              {t("common.cancel")}
           </button>
        </div>
      </form>
    </div>
  );
}
