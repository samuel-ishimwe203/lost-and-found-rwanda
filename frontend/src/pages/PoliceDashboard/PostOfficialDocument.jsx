
import React, { useState } from "react";
import apiClient from "../../services/api";
import { 
  FiCheckCircle, FiAlertCircle, FiMessageSquare, FiEye, FiMapPin, 
  FiClock, FiUser, FiPhone, FiMail, FiTag, FiDollarSign, FiInfo,
  FiUploadCloud, FiX, FiShield, FiFileText
} from "react-icons/fi";
import SendMessageModal from "../../components/SendMessageModal";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const BACKEND_URL = API_URL.replace(/\/api\/?$/, '');

// Consolidated Lu icons into Fi set for better stability
const LuMessageSquare = FiMessageSquare;
const LuEye = FiEye;

export default function PostOfficialDocument() {
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
    { value: "other", label: "Other Document" },
  ];

  const districts = [
    "Kigali", "Nyarugenge", "Gasabo", "Kicukiro", 
    "Rubavu", "Rusizi", "Huye", "Musanze"
  ];

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
      
      const additionalInfo = {
        officerName: formData.officerName,
        badge: formData.badge,
        notes: formData.notes
      };
      submitData.append("additional_info", JSON.stringify(additionalInfo));

      if (formData.image) {
        submitData.append("image", formData.image);
      }

      const response = await apiClient.post("/police/documents", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setMatches(response.data.data.matches || []);
        setSubmitted(true);
      }
    } catch (err) {
      console.error("Upload official document error:", err);
      setError(err.response?.data?.message || "Failed to upload official document.");
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
      <div className="max-w-6xl mx-auto py-12 px-6">
        <div className="bg-white rounded-[40px] shadow-2xl p-12 text-center border border-emerald-100 relative overflow-hidden mb-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FiShield className="w-10 h-10" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4">Official Record Registered</h2>
            <p className="text-slate-500 max-w-lg mx-auto leading-relaxed text-lg font-medium">
              The item has been securely logged into the national database. Our matching intelligence is cross-referencing all reports.
            </p>
            
            {matches.length > 0 ? (
               <div className="mt-8 inline-flex items-center gap-3 px-6 py-3 bg-emerald-600 text-white rounded-full font-black text-sm uppercase tracking-widest shadow-xl animate-bounce">
                 <FiInfo /> {matches.length} Citizens Possibly Looking for This
               </div>
            ) : (
               <div className="mt-8 flex justify-center gap-4">
                  <button 
                    onClick={() => { setSubmitted(false); handleClearForm(); }}
                    className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg"
                  >
                    Post Another Official Record
                  </button>
               </div>
            )}
          </div>
        </div>

        {matches.length > 0 && (
          <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-black text-slate-900">Automatic Matches</h3>
                <p className="text-emerald-600 font-bold mt-1 uppercase tracking-widest text-[10px]">Instant matching with active citizen reports</p>
              </div>
            </div>

            <div className="grid gap-8">
              {matches.map((match) => (
                <div key={match.id} className="group bg-white rounded-[32px] border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <div className="flex flex-col lg:flex-row">
                    <div className="lg:w-80 h-64 lg:h-auto relative overflow-hidden bg-slate-100 flex items-center justify-center">
                      {match.lost_image_url ? (
                        <img 
                          src={`${BACKEND_URL}${match.lost_image_url}`} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          alt="Lost report preview"
                        />
                      ) : (
                        <div className="flex flex-col items-center">
                           <FiFileText className="w-16 h-16 text-slate-200" />
                           <p className="text-[8px] font-black text-slate-400 uppercase mt-4">No Image Provided</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                      <div className="absolute top-6 left-6">
                        <div className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-black text-slate-900 uppercase tracking-widest">
                          {Math.round(match.match_score)}% Accuracy
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 p-8 lg:p-10 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h4 className="text-2xl font-black text-slate-900">{match.lost_item_type}</h4>
                            <div className="flex items-center gap-4 mt-2 text-slate-400 text-sm font-bold">
                               <span className="flex items-center gap-1"><FiMapPin /> {match.lost_district}</span>
                               <span className="flex items-center gap-1"><FiClock /> Reported on {new Date(match.date_lost).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                           <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
                                   <FiUser />
                                </div>
                                <div>
                                   <p className="text-[10px] font-black text-slate-400 uppercase">Citizen Name</p>
                                   <p className="text-sm font-black text-slate-900">{match.loser_name}</p>
                                </div>
                             </div>
                           </div>
                           <div className="bg-white p-6 rounded-3xl border border-emerald-100 flex flex-col justify-center text-center">
                              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Status Coverage</p>
                              <p className="text-lg font-black text-slate-900">Matches Metadata</p>
                           </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                         <button 
                            onClick={() => handleContactOwner(match)}
                            className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-emerald-700 transition shadow-xl flex items-center justify-center gap-2 group/btn"
                         >
                            <LuMessageSquare className="w-4 h-4 transition-transform group-hover/btn:-translate-y-0.5" />
                            Notify Citizen
                         </button>
                         <button 
                            onClick={() => { setViewingMatch(match); setIsDetailModalOpen(true); }}
                            className="w-14 h-14 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition"
                         >
                            <LuEye className="w-5 h-5" />
                         </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {isDetailModalOpen && viewingMatch && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-2xl" onClick={() => setIsDetailModalOpen(false)}></div>
              <div className="relative bg-white w-full max-w-6xl max-h-[90vh] rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-500 border border-white/20">
                <button 
                  onClick={() => setIsDetailModalOpen(false)}
                  className="absolute top-8 right-8 z-10 w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20 transition"
                >
                  <FiX className="text-2xl" />
                </button>

                <div className="md:w-1/2 bg-slate-950 p-12 flex flex-col justify-center items-center">
                    <div className="w-full max-w-sm space-y-8">
                        <div className="text-center">
                           <FiShield className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                           <h3 className="text-white text-3xl font-black mb-1">RECORD SCAN</h3>
                           <p className="text-white/30 text-[10px] font-black uppercase tracking-[4px]">Neural Validation</p>
                        </div>
                        
                        <div className="aspect-square bg-white/5 rounded-[40px] overflow-hidden border border-white/10 p-4 relative shadow-2xl">
                           {viewingMatch.lost_image_url ? (
                             <img src={`${BACKEND_URL}${viewingMatch.lost_image_url}`} className="w-full h-full object-contain rounded-3xl" alt="Citizen Report" />
                           ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center text-white/10">
                                <FiEye className="w-24 h-24" />
                                <p className="text-[10px] font-black mt-4 uppercase">No Reference Image</p>
                             </div>
                           )}
                           <div className="absolute bottom-6 left-6 right-6">
                              <div className="bg-emerald-600 p-6 rounded-[24px] text-center shadow-2xl">
                                 <p className="text-white font-black text-4xl">{viewingMatch.match_score}%</p>
                                 <p className="text-emerald-200 text-[10px] font-black uppercase tracking-[2px] mt-1">Cross-Reference Accuracy</p>
                              </div>
                           </div>
                        </div>
                    </div>
                </div>

                <div className="md:w-1/2 p-12 overflow-y-auto space-y-8 bg-white">
                    <div>
                       <h2 className="text-4xl font-black text-slate-900 leading-tight">Official Analysis</h2>
                       <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-2">Verified against national citizen reports</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1"><FiTag /> Category</p>
                          <p className="text-sm font-black text-slate-800 capitalize">{viewingMatch.lost_category}</p>
                       </div>
                       <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1"><FiMapPin /> Reported At</p>
                          <p className="text-sm font-black text-slate-800">{viewingMatch.lost_district}</p>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitter Contact</h4>
                       <div className="flex items-center gap-5 bg-emerald-50/50 p-6 rounded-[32px] border border-emerald-100/50">
                          <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-xl shadow-xl">
                             <FiUser />
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-900 mb-0.5">{viewingMatch.loser_name}</p>
                             <div className="flex gap-4 mt-1">
                                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500"><FiPhone /> {viewingMatch.loser_phone}</span>
                                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 truncate max-w-[150px]"><FiMail /> {viewingMatch.loser_email}</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    {viewingMatch.lost_text && (
                      <div className="space-y-4 pt-4 border-t border-slate-100">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metadata Insights</h4>
                         <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100">
                           <p className="text-slate-600 text-sm font-bold italic leading-relaxed">"{viewingMatch.lost_text}"</p>
                         </div>
                      </div>
                    )}

                    <div className="pt-6">
                       <button
                          onClick={() => handleContactOwner(viewingMatch)}
                          className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-lg shadow-2xl hover:translate-y-[-4px] transition duration-300"
                        >
                          Alert Citizen via Dashboard
                        </button>
                    </div>
                </div>
              </div>
            </div>
        )}

        {messageModalOpen && selectedMatch && (
          <SendMessageModal
            item={selectedMatch}
            isOpen={messageModalOpen}
            onClose={() => {
              setMessageModalOpen(false)
              setSelectedMatch(null)
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 px-6">
      <div className="mb-12">
        <span className="inline-block px-4 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest mb-4">
          Official Operations
        </span>
        <h1 className="text-5xl font-black text-slate-900 leading-tight">Upload Official Record</h1>
        <p className="text-slate-500 text-lg mt-2 font-medium">Registering items recovered during official duty for instant citizen matching.</p>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-100 rounded-[32px] p-6 mb-8 flex items-center gap-4 text-red-600">
          <FiAlertCircle className="w-8 h-8 flex-shrink-0" />
          <p className="font-bold">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-[48px] shadow-2xl border border-slate-100 p-10 md:p-14 space-y-10">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Document Category</label>
              <select
                name="documentType"
                value={formData.documentType}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-600 rounded-[24px] px-6 py-4 font-bold text-slate-800 transition-all outline-none"
              >
                <option value="">Select Document Type</option>
                {documentTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Item Reference Name</label>
              <input
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                placeholder="e.g. Returned National ID"
                required
                className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-600 rounded-[24px] px-6 py-4 font-bold text-slate-800 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-8">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Evidence Photo</label>
            <div className="relative h-64 group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                id="imageUpload"
              />
              <div className={`h-full border-4 border-dashed rounded-[32px] transition-all flex flex-col items-center justify-center p-8 overflow-hidden ${
                imagePreview ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-100 bg-slate-50 group-hover:bg-white group-hover:border-emerald-400'
              }`}>
                {imagePreview ? (
                  <img src={imagePreview} className="max-h-full rounded-2xl shadow-xl" alt="Preview" />
                ) : (
                  <>
                    <FiUploadCloud className="w-10 h-10 text-slate-300 mb-4" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Upload for OCR</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 pt-6">
          <div className="group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Official Description</label>
            <textarea
              name="itemDescription"
              value={formData.itemDescription}
              onChange={handleChange}
              placeholder="Provide official details for internal records..."
              required
              rows={3}
              className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-600 rounded-[32px] px-8 py-6 font-bold text-slate-800 transition-all outline-none resize-none"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Recovered on</label>
              <input type="date" name="dateFound" value={formData.dateFound} onChange={handleChange} required className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-600 rounded-[24px] px-6 py-4 font-bold text-slate-800 transition-all outline-none" />
            </div>
            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">District</label>
              <select name="district" value={formData.district} onChange={handleChange} required className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-600 rounded-[24px] px-6 py-4 font-bold text-slate-800 transition-all outline-none">
                <option value="">Select District</option>
                {districts.map((dist) => (<option key={dist} value={dist}>{dist}</option>))}
              </select>
            </div>
            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Assigned Station</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Remera Station" required className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-600 rounded-[24px] px-6 py-4 font-bold text-slate-800 transition-all outline-none" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Reporting Officer</label>
              <input type="text" name="officerName" value={formData.officerName} onChange={handleChange} placeholder="Full Name" required className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-600 rounded-[24px] px-6 py-4 font-bold text-slate-800 transition-all outline-none" />
            </div>
            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Badge ID</label>
              <input type="text" name="badge" value={formData.badge} onChange={handleChange} placeholder="Official ID" required className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-600 rounded-[24px] px-6 py-4 font-bold text-slate-800 transition-all outline-none" />
            </div>
          </div>
        </div>

        <div className="pt-8">
           <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white rounded-[32px] py-6 font-black text-xl shadow-2xl hover:translate-y-[-4px] hover:bg-emerald-700 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Neural Scanning & Registering..." : "Finalize Official Record"}
          </button>
        </div>
      </form>
    </div>
  );
}