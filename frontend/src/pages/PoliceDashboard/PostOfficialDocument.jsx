import React, { useState } from "react";
import apiClient from "../../services/api";
import { 
  FiCheckCircle, FiAlertCircle, FiMessageSquare, FiEye, FiMapPin, 
  FiClock, FiUser, FiPhone, FiMail, FiTag, FiDollarSign, FiInfo,
  FiUploadCloud, FiX, FiShield, FiFileText
} from "react-icons/fi";
import SendMessageModal from "../../components/SendMessageModal";
import { getImageUrl } from "../../utils/imageHelper";
import { useLanguage } from "../../context/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const LuMessageSquare = FiMessageSquare;
const LuEye = FiEye;

export default function PostOfficialDocument() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    documentType: "",
    itemName: "",
    itemDescription: "",
    dateFound: "",
    district: "",
    location: "",
    officerName: "",
    badge: "",
    notes: "",
    image: null,
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [viewingMatch, setViewingMatch] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const documentTypes = [
    { value: "national_id", label: "National ID Card" },
    { value: "passport", label: "Passport" },
    { value: "driving_license", label: "Driving License" },
    { value: "birth_certificate", label: "Birth Certificate" },
    { value: "atm_card", label: "ATM Card" },
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
    setError("");

    try {
      const submitData = new FormData();
      submitData.append("item_type", formData.itemName);
      submitData.append("category", formData.documentType);
      submitData.append("description", formData.itemDescription);
      submitData.append("date_found", formData.dateFound);
      submitData.append("location_found", formData.location);
      submitData.append("district", formData.district);
      
      const additionalInfo = { officerName: formData.officerName, badge: formData.badge, notes: formData.notes };
      submitData.append("additional_info", JSON.stringify(additionalInfo));

      if (formData.image) submitData.append("image", formData.image);

      const response = await apiClient.post("/police/documents", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setMatches(response.data.data.matches || []);
        setSubmitted(true);
      }
    } catch (err) {
      console.error("Upload official document error:", err);
      setError(err.response?.data?.message || t("messages.operationFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    setFormData({
      documentType: "", itemName: "", itemDescription: "",
      dateFound: "", district: "", location: "",
      officerName: "", badge: "", notes: "", image: null,
    });
    setImagePreview(null);
    setError("");
    setMatches([]);
  };

  const handleContactOwner = (match) => {
    const itemData = {
      id: match.lost_item_id,
      item_type: match.lost_item_type,
      category: match.lost_category,
      district: match.lost_district,
      contact_name: match.loser_name,
      contact_phone: match.loser_phone,
      user_id: match.loser_id,
      item_source: 'lost'
    }
    setSelectedMatch(itemData);
    setMessageModalOpen(true);
  };

  if (submitted) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4 font-sans">
        <div className="bg-white rounded-[32px] shadow-sm p-10 md:p-14 text-center border border-gray-100 mb-10 relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-emerald-50 text-[#10b981] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{t("common.success")}</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-base font-medium">
              {t("police.verified")}
            </p>
            
            {matches.length > 0 ? (
               <div className="mt-8 inline-flex items-center gap-2 px-6 py-2.5 bg-[#10b981] text-white rounded-full font-bold text-xs uppercase tracking-widest shadow-lg animate-bounce">
                 <FiInfo /> {matches.length} {t("matches.potentialMatches")}
               </div>
            ) : (
               <div className="mt-8 flex justify-center">
                  <button 
                    onClick={() => { setSubmitted(false); handleClearForm(); }}
                    className="px-8 py-3.5 bg-[#10b981] text-white rounded-xl font-bold hover:bg-[#0da472] transition shadow-lg text-sm"
                  >
                    {t("police.postOfficialDocument")}
                  </button>
               </div>
            )}
          </div>
        </div>

        {matches.length > 0 && (
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-gray-900 text-center md:text-left">{t("matches.matchedItems")}</h3>
            <div className="grid gap-6">
              {matches.map((match) => (
                <div key={match.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-64 h-48 bg-gray-50 relative">
                      {match.lost_image_url ? (
                        <img src={getImageUrl(match.lost_image_url)} className="w-full h-full object-cover" alt="Lost report" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200">
                           <FiFileText className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <div className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-black text-gray-900 uppercase">
                          {Math.round(match.match_score)}% {t("matches.matchPercentage")}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xl font-bold text-gray-900 capitalize">{match.lost_item_type}</h4>
                            <p className="text-[#10b981] font-bold text-[10px] uppercase tracking-widest mt-1">Found in {match.lost_district}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#10b981] shrink-0 font-bold">
                                 {match.loser_name?.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                 <p className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">{t("profile.userRole")}</p>
                                 <p className="text-sm font-bold text-gray-900 truncate">{match.loser_name}</p>
                              </div>
                           </div>
                        </div>
                      </div>

                      <div className="mt-6 flex gap-3">
                         <button 
                            onClick={() => handleContactOwner(match)}
                            className="flex-1 bg-[#10b981] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#0da472] transition shadow"
                         >
                            {t("common.contact")}
                         </button>
                         <button 
                            onClick={() => { setViewingMatch(match); setIsDetailModalOpen(true); }}
                            className="w-12 h-12 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-gray-100 transition"
                         >
                            <LuEye />
                         </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isDetailModalOpen && viewingMatch && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setIsDetailModalOpen(false)}></div>
              <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
                <button onClick={() => setIsDetailModalOpen(false)} className="absolute top-6 right-6 z-10 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                  <FiX />
                </button>

                <div className="md:w-5/12 bg-gray-50 p-8 flex flex-col justify-center items-center border-r border-gray-100">
                    <div className="w-full space-y-6">
                        <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 p-3">
                           {viewingMatch.lost_image_url ? (
                             <img src={getImageUrl(viewingMatch.lost_image_url)} className="w-full h-full object-contain" alt="Report" />
                           ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
                                <FiEye className="w-16 h-16" />
                             </div>
                           )}
                        </div>
                        <div className="bg-[#10b981] p-4 rounded-xl text-center text-white shadow-lg">
                           <p className="font-bold text-2xl">{viewingMatch.match_score}%</p>
                           <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{t("matches.matchPercentage")}</p>
                        </div>
                    </div>
                </div>

                <div className="md:w-7/12 p-10 overflow-y-auto space-y-6 bg-white">
                    <div>
                       <h2 className="text-2xl font-bold text-gray-900 capitalize">{viewingMatch.lost_item_type}</h2>
                       <p className="text-[#10b981] text-xs font-bold uppercase tracking-widest mt-1">{t("police.verified")}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <p className="text-[9px] font-black text-gray-300 uppercase mb-1 tracking-widest">{t("items.category")}</p>
                          <p className="text-sm font-bold text-gray-800 capitalize leading-none">{viewingMatch.lost_category}</p>
                       </div>
                       <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <p className="text-[9px] font-black text-gray-300 uppercase mb-1 tracking-widest">{t("items.location")}</p>
                          <p className="text-sm font-bold text-gray-800 leading-none">{viewingMatch.lost_district}</p>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("profile.personalInfo")}</p>
                       <div className="flex items-center gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#10b981] font-bold">
                             {viewingMatch.loser_name?.charAt(0)}
                          </div>
                          <div className="min-w-0">
                             <p className="text-sm font-bold text-gray-900 truncate uppercase">{viewingMatch.loser_name}</p>
                             <p className="text-xs font-medium text-gray-400">{viewingMatch.loser_phone}</p>
                          </div>
                       </div>
                    </div>

                    <button
                        onClick={() => handleContactOwner(viewingMatch)}
                        className="w-full py-4 bg-[#10b981] text-white rounded-xl font-bold text-sm shadow-lg hover:bg-black transition uppercase tracking-widest"
                      >
                        {t("common.contact")}
                      </button>
                </div>
              </div>
            </div>
        )}

        {messageModalOpen && selectedMatch && (
          <SendMessageModal
            item={selectedMatch}
            isOpen={messageModalOpen}
            onClose={() => { setMessageModalOpen(false); setSelectedMatch(null); }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4 font-sans">
      <div className="mb-10 py-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t("police.postOfficialDocument")}</h1>
        <p className="text-gray-500 text-sm mt-1 font-medium italic opacity-80">
           {t("police.dashboard")}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-8 flex items-center gap-4 text-red-600 font-bold text-sm">
          <FiAlertCircle className="w-6 h-6 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 md:p-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t("items.category")}</label>
              <select
                name="documentType"
                value={formData.documentType}
                onChange={handleChange}
                required
                className="w-full bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#10b981] rounded-xl px-5 py-3.5 font-bold text-gray-800 transition-all outline-none"
              >
                <option value="">{t("items.selectCategory")}</option>
                {documentTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t("items.title")}</label>
              <input
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                placeholder="..."
                required
                className="w-full bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#10b981] rounded-xl px-5 py-3.5 font-bold text-gray-800 transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t("items.image")}</label>
            <div className="relative h-44 group">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className={`h-full border-2 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center p-6 ${
                imagePreview ? 'border-emerald-200 bg-emerald-50/10' : 'border-gray-100 bg-gray-50 group-hover:border-[#10b981]'
              }`}>
                {imagePreview ? (
                  <img src={imagePreview} className="max-h-full rounded-lg" alt="Preview" />
                ) : (
                  <>
                    <FiUploadCloud className="w-8 h-8 text-gray-300 mb-2" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("items.addImage")}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 pt-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t("items.description")}</label>
            <textarea
              name="itemDescription"
              value={formData.itemDescription}
              onChange={handleChange}
              placeholder="..."
              required
              rows={3}
              className="w-full bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#10b981] rounded-xl px-6 py-4 font-bold text-gray-800 transition-all outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t("items.date")}</label>
              <input type="date" name="dateFound" value={formData.dateFound} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#10b981] rounded-xl px-5 py-3 font-bold text-gray-800 transition-all outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t("items.location")}</label>
              <select name="district" value={formData.district} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#10b981] rounded-xl px-5 py-3 font-bold text-gray-800 transition-all outline-none">
                <option value="">Select District</option>
                {districts.map((dist) => (<option key={dist} value={dist}>{dist}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t("items.location")} Detail</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="..." required className="w-full bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#10b981] rounded-xl px-5 py-3 font-bold text-gray-800 transition-all outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t("auth.firstName")}</label>
              <input type="text" name="officerName" value={formData.officerName} onChange={handleChange} placeholder="..." required className="w-full bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#10b981] rounded-xl px-5 py-3 font-bold text-gray-800 transition-all outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Badge Number</label>
              <input type="text" name="badge" value={formData.badge} onChange={handleChange} placeholder="..." required className="w-full bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#10b981] rounded-xl px-5 py-3 font-bold text-gray-800 transition-all outline-none" />
            </div>
          </div>
        </div>

        <div className="pt-6">
           <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#10b981] text-white rounded-xl py-4 font-bold text-lg shadow-lg hover:bg-black transition-all disabled:opacity-50 uppercase tracking-widest"
          >
            {loading ? t("messages.processing") : t("common.submit")}
          </button>
        </div>
      </form>
    </div>
  );
}