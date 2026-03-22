import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../services/api";
import { 
  FiCheckCircle, FiAlertCircle, FiEye, FiMapPin, 
  FiClock, FiUser, FiPhone, FiMail, FiTag, FiDollarSign, FiInfo,
  FiUploadCloud, FiX, FiCheck, FiChevronRight, FiCheckSquare, FiArchive
} from "react-icons/fi";
import SendMessageModal from "../../components/SendMessageModal";
import { getImageUrl } from "../../utils/imageHelper";
import { useLanguage } from "../../context/LanguageContext";

export default function PostFoundItem() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    item_type: "",
    category: "",
    customCategory: "",
    description: "",
    date_found: "",
    location_found: "",
    district: "",
    additional_info: "",
    image: null,
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [viewingMatch, setViewingMatch] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const categories = [
    { value: "national_id", label: t("categories.national_id") },
    { value: "passport", label: t("categories.passport") },
    { value: "driving_license", label: t("categories.driving_license") },
    { value: "atm_card", label: t("categories.atm_card") },
    { value: "other", label: t("categories.other") },
  ];

  const districts = ["Kigali", "Nyarugenge", "Gasabo", "Kicukiro", "Rubavu", "Rusizi", "Huye", "Musanze"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('item_type', formData.item_type);
      submitData.append('category', formData.category === 'other' ? formData.customCategory : formData.category);
      submitData.append('description', formData.description);
      submitData.append('date_found', formData.date_found);
      submitData.append('location_found', formData.location_found);
      submitData.append('district', formData.district);
      submitData.append('additional_info', formData.additional_info);
      if (formData.image) submitData.append('image', formData.image);

      const response = await apiClient.post('/found-items', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setMatches(response.data.data.matches || []);
        setSubmitted(true);
      }
    } catch (err) {
      setError(`❌ ${err.response?.data?.message || t("messages.operationFailed")}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    setFormData({ item_type: "", category: "", customCategory: "", description: "", date_found: "", location_found: "", district: "", additional_info: "", image: null });
    setImagePreview(null);
    setError('');
  };

  const handleContactOwner = (match) => {
    const itemData = { id: match.lost_item_id, item_type: match.lost_item_type, category: match.lost_category, district: match.lost_district, contact_name: match.loser_name, contact_phone: match.loser_phone, user_id: match.loser_id, item_source: 'lost' }
    setSelectedMatch(itemData);
    setMessageModalOpen(true);
  };

  if (submitted) {
    return (
      <div className="space-y-12 pb-32">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-40"></div>
          <div className="relative z-10 space-y-8">
            <div className="w-20 h-20 bg-green-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl animate-bounce">
              <FiCheckSquare className="w-10 h-10" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">{t("common.success")}</h2>
              <p className="text-slate-500 font-medium max-w-xl mx-auto text-sm leading-relaxed italic">
                {t("items.itemPosted")}
              </p>
            </div>
            
            {matches.length > 0 ? (
               <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-full font-bold text-[10px] uppercase tracking-widest shadow-lg">
                 <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                 System Alert: {matches.length} {t("matches.potentialMatches")}
               </div>
            ) : (
               <button onClick={() => { setSubmitted(false); handleClearForm(); }} className="px-10 py-4 bg-green-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl active:scale-95">{t("items.postFoundItem")}</button>
            )}
          </div>
        </div>

        {matches.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 px-2">
               <div className="h-6 w-1.5 bg-green-600 rounded-full"></div>
               <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">{t("matches.matchedItems")}</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {matches.map((match) => (
                <div key={match.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-500 hover:shadow-2xl flex flex-col md:flex-row h-full">
                  <div className="md:w-52 h-48 md:h-auto relative overflow-hidden bg-slate-50 shrink-0">
                    {match.lost_image_url ? (
                      <img src={getImageUrl(match.lost_image_url)} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" alt="Lost Reference" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                         <FiArchive className="text-4xl opacity-50" />
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-slate-900 rounded-lg text-[9px] font-black uppercase tracking-widest text-center shadow-lg border border-white">
                        {Math.round(match.match_score)}% {t("matches.matchPercentage")}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-8 flex flex-col justify-between space-y-6">
                     <div>
                        <h4 className="text-xl font-black text-slate-900 uppercase italic leading-none mb-4">{match.lost_item_type}</h4>
                        <div className="flex flex-wrap gap-4 text-slate-400">
                           <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest"><FiMapPin className="text-green-600" /> {match.lost_district}</span>
                           <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest"><FiClock className="text-green-600" /> {new Date(match.date_lost).toLocaleDateString().toUpperCase()}</span>
                        </div>
                     </div>

                     <div className="bg-slate-50 px-5 py-4 rounded-xl border border-slate-100">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t("profile.personalInfo")}</p>
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-green-600"><FiUser size={14} /></div>
                           <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{match.loser_name}</p>
                        </div>
                     </div>

                     <div className="flex gap-2">
                        <button onClick={() => handleContactOwner(match)} className="flex-1 bg-slate-950 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-green-600 transition-all">{t("common.contact")}</button>
                        <button onClick={() => { setViewingMatch(match); setIsDetailModalOpen(true); }} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl border border-slate-100 flex items-center justify-center hover:bg-green-50 hover:text-green-600 transition-all" title={t("matches.viewDetails")}><FiEye /></button>
                     </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center pt-12">
               <button onClick={() => { setSubmitted(false); handleClearForm(); }} className="px-12 py-4 border border-slate-200 text-slate-400 font-black rounded-xl hover:border-green-600 hover:text-green-600 transition-all uppercase tracking-widest text-[10px]">{t("common.back")}</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
       {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 md:p-8 rounded-2xl border border-green-400 shadow-lg relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/5 opacity-10"></div>
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
            {t("items.postFoundItem")}
          </h1>
          <p className="text-green-50 text-sm md:text-base opacity-90 max-w-2xl font-medium">
            {t("app.description")}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-xl flex items-center gap-4 shadow-sm animate-in shake">
          <FiAlertCircle className="w-6 h-6 shrink-0" />
          <p className="font-bold text-sm uppercase tracking-tight">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-12 space-y-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* DISCOVERY CORE */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1.5 bg-green-600 rounded-full"></div>
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{t("items.itemDetails")}</h3>
            </div>
            
            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("items.title")} *</label>
                <input 
                  type="text" 
                  name="item_type" 
                  value={formData.item_type} 
                  onChange={handleChange} 
                  placeholder="..." 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-500 rounded-xl px-5 py-4 font-bold text-slate-900 transition-all outline-none text-xs placeholder:text-slate-300" 
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("items.category")} *</label>
                  <select 
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange} 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-500 rounded-xl px-5 py-4 font-bold text-slate-900 transition-all outline-none text-xs appearance-none"
                  >
                    <option value="">{t("items.selectCategory")}</option>
                    {categories.map((cat) => ( <option key={cat.value} value={cat.value}>{cat.label}</option> ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("items.date")} *</label>
                  <input 
                    type="date" 
                    name="date_found" 
                    value={formData.date_found} 
                    onChange={handleChange} 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-500 rounded-xl px-5 py-4 font-bold text-slate-900 transition-all outline-none text-xs" 
                    max={new Date().toISOString().split('T')[0]}
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
                    required 
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-500 rounded-xl px-5 py-4 font-bold text-slate-900 transition-all outline-none text-xs mt-2" 
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
                accept="image/*" 
                onChange={handleImageUpload} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
              <div className={`h-full border-2 border-dashed rounded-2xl transition-all duration-300 flex flex-col items-center justify-center p-6 overflow-hidden ${ imagePreview ? 'border-green-500 bg-green-50/20 shadow-inner' : 'border-slate-100 bg-slate-50 group-hover:border-green-400 group-hover:bg-white' }`}>
                {imagePreview ? (
                   <div className="relative w-full h-full flex items-center justify-center">
                      <img src={imagePreview} className="max-h-full rounded-xl shadow-2xl border-2 border-white" alt="Preview" />
                      <button 
                         type="button" 
                         onClick={() => { setImagePreview(null); setFormData(prev => ({...prev, image: null})); }} 
                         className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md text-white rounded-lg w-10 h-10 flex items-center justify-center hover:bg-red-500 shadow-md z-20 transition-all"
                      >
                         <FiX />
                      </button>
                   </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300 mx-auto border border-slate-50 transition-all group-hover:scale-110 group-hover:text-green-500">
                      <FiUploadCloud className="text-3xl" />
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{t("items.addImage")}</p>
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight italic">JPG, PNG | MAX 10MB</p>
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
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{t("items.location")}</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("items.location")} *</label>
              <select 
                name="district" 
                value={formData.district} 
                onChange={handleChange} 
                required 
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-500 rounded-xl px-5 py-4 font-bold text-slate-900 transition-all outline-none text-xs appearance-none"
              >
                <option value="">Select District</option>
                {districts.map((dist) => ( <option key={dist} value={dist}>{dist}</option> ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("items.location")} Detail *</label>
              <input 
                type="text" 
                name="location_found" 
                value={formData.location_found} 
                onChange={handleChange} 
                placeholder="..." 
                required 
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-500 rounded-xl px-5 py-4 font-bold text-slate-900 transition-all outline-none text-xs placeholder:text-slate-300" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("items.description")} *</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="..." 
              required 
              rows={4} 
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-500 rounded-2xl px-6 py-5 font-semibold text-slate-700 transition-all outline-none resize-none text-sm leading-relaxed italic" 
            />
          </div>
        </div>

        <div className="pt-8">
           <button 
             type="submit" 
             disabled={loading} 
             className="w-full bg-slate-950 text-white rounded-2xl py-6 font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-green-600 transition-all duration-300 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3"
           >
            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white animate-spin rounded-full"></div> : <FiCheckCircle />}
            {loading ? t("messages.processing") : t("common.submit")}
          </button>
        </div>
      </form>

      {isDetailModalOpen && viewingMatch && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-md" onClick={() => setIsDetailModalOpen(false)}></div>
              <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
                <button onClick={() => setIsDetailModalOpen(false)} className="absolute top-4 right-4 z-20 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-all shadow-md"><FiX /></button>

                <div className="md:w-2/5 p-8 bg-slate-900 text-white flex flex-col justify-between">
                  <div className="space-y-6">
                    <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest">{t("matches.matchPercentage")}</p>
                    <div className="relative">
                      <span className="text-7xl font-black italic">{Math.round(viewingMatch.match_score)}<span className="text-green-500 text-3xl ml-1">%</span></span>
                    </div>
                  </div>
                  {viewingMatch.lost_image_url ? (
                    <div className="mt-8 overflow-hidden rounded-xl border border-white/10">
                      <img src={getImageUrl(viewingMatch.lost_image_url)} className="w-full h-48 object-cover" alt="Reference" />
                    </div>
                  ) : (
                    <div className="mt-8 aspect-video bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-white/20 uppercase font-black text-[9px] tracking-widest">No Visual Seed</div>
                  )}
                </div>

                <div className="flex-1 p-8 md:p-12 overflow-y-auto space-y-8 bg-white">
                  <div className="space-y-3">
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-100">{viewingMatch.lost_category}</span>
                    <h2 className="text-4xl font-black text-slate-900 leading-tight italic uppercase">{viewingMatch.lost_item_type}</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">{t("items.location")}</p>
                      <p className="font-black text-slate-800 text-sm uppercase">{viewingMatch.lost_district}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">{t("items.date")}</p>
                      <p className="font-black text-slate-800 text-sm uppercase">{new Date(viewingMatch.date_lost).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">{t("profile.personalInfo")}</p>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="font-black text-slate-950 uppercase tracking-tight text-lg mb-2">{viewingMatch.loser_name}</p>
                      <div className="flex flex-wrap gap-6 text-[10px] font-black text-slate-400">
                        <span className="flex items-center gap-2"><FiPhone className="text-green-600" /> {viewingMatch.loser_phone}</span>
                        <span className="flex items-center gap-2"><FiMail className="text-green-600" /> {viewingMatch.loser_email}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleContactOwner(viewingMatch)} 
                    className="w-full py-5 bg-slate-950 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-600 transition-all shadow-xl active:scale-95"
                  >
                    {t("common.contact")}
                  </button>
                </div>
              </div>
            </div>
        )}

      {messageModalOpen && selectedMatch && (
        <SendMessageModal item={selectedMatch} isOpen={messageModalOpen} onClose={() => { setMessageModalOpen(false); setSelectedMatch(null); }} />
      )}
    </div>
  );
}
