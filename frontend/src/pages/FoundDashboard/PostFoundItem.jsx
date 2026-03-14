
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../services/api";
import { 
  FiCheckCircle, FiAlertCircle, FiMessageSquare, FiEye, FiMapPin, 
  FiClock, FiUser, FiPhone, FiMail, FiTag, FiDollarSign, FiInfo,
  FiUploadCloud, FiX
} from "react-icons/fi";
import SendMessageModal from "../../components/SendMessageModal";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const BACKEND_URL = API_URL.replace(/\/api\/?$/, '');

// Consolidated Lu icons into Fi set for better stability
const LuMessageSquare = FiMessageSquare;
const LuCheckCircle2 = FiCheckCircle;
const LuEye = FiEye;

export default function PostFoundItem() {
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
    { value: "national_id", label: "National ID" },
    { value: "passport", label: "Passport" },
    { value: "driving_license", label: "Driving License" },
    { value: "atm_card", label: "ATM Card" },
    { value: "student_card", label: "Student Card" },
    { value: "other", label: "Other" },
  ];

  const districts = [
    "Kigali", "Nyarugenge", "Gasabo", "Kicukiro", 
    "Rubavu", "Rusizi", "Huye", "Musanze"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
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
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      const response = await apiClient.post('/found-items', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setMatches(response.data.data.matches || []);
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Post found item error:', err);
      setError(`❌ ${err.response?.data?.message || 'Failed to post item. Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    setFormData({
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
    setImagePreview(null);
    setError('');
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
        <div className="bg-white rounded-[40px] shadow-2xl p-12 text-center border border-green-100 relative overflow-hidden mb-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FiCheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4">Item Posted Successfully!</h2>
            <p className="text-slate-500 max-w-lg mx-auto leading-relaxed text-lg">
              Your found item has been securely registered. Our neural engine has already started scanning for owners.
            </p>
            
            {matches.length > 0 ? (
               <div className="mt-8 inline-flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-full font-black text-sm uppercase tracking-widest shadow-xl animate-bounce">
                 <FiInfo /> {matches.length} Potential Matches Found!
               </div>
            ) : (
               <div className="mt-8 flex justify-center gap-4">
                  <button 
                    onClick={() => { setSubmitted(false); handleClearForm(); }}
                    className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition"
                  >
                    Post Another Item
                  </button>
               </div>
            )}
          </div>
        </div>

        {matches.length > 0 && (
          <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-black text-slate-900">Immediate Matches</h3>
                <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-xs">Based on Neural Scan & Document OCR</p>
              </div>
            </div>

            <div className="grid gap-8">
              {matches.map((match) => (
                <div key={match.id} className="group bg-white rounded-[32px] border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <div className="flex flex-col lg:flex-row">
                    <div className="lg:w-80 h-64 lg:h-auto relative overflow-hidden bg-slate-100">
                      {match.lost_image_url ? (
                        <img 
                          src={`${BACKEND_URL}${match.lost_image_url}`} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          alt="Lost"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                           <FiEye className="w-16 h-16 opacity-30" />
                           <span className="text-[8px] font-black uppercase mt-3 tracking-widest">Neural Reference Only</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                      <div className="absolute top-6 left-6">
                        <div className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-black text-slate-900 uppercase tracking-widest">
                          {Math.round(match.match_score)}% Score
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
                               <span className="flex items-center gap-1"><FiClock /> Lost on {new Date(match.date_lost).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                           <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600">
                                   <FiUser />
                                </div>
                                <div>
                                   <p className="text-[10px] font-black text-slate-400 uppercase">Possible Owner</p>
                                   <p className="text-sm font-black text-slate-900">{match.loser_name}</p>
                                </div>
                             </div>
                           </div>
                           <div className="bg-emerald-500 rounded-3xl p-6 text-white text-center flex flex-col justify-center shadow-lg shadow-emerald-500/20">
                              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Potential Reward</p>
                              <p className="text-2xl font-black">{match.reward_amount ? `${match.reward_amount.toLocaleString()} RWF` : 'Personal Gratitude'}</p>
                           </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                         <button 
                            onClick={() => handleContactOwner(match)}
                            className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:translate-y-[-2px] transition shadow-xl flex items-center justify-center gap-2 group/btn"
                         >
                            <LuMessageSquare className="w-4 h-4 transition-transform group-hover/btn:-translate-y-0.5" />
                            Connect & Verify
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
            
            <div className="flex justify-center pt-10">
               <button 
                  onClick={() => { setSubmitted(false); handleClearForm(); }}
                  className="px-12 py-4 bg-white border-2 border-slate-100 text-slate-400 font-black rounded-3xl hover:border-slate-300 hover:text-slate-600 transition uppercase tracking-widest text-xs shadow-sm"
               >
                  I'm done for now
               </button>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {isDetailModalOpen && viewingMatch && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xl" onClick={() => setIsDetailModalOpen(false)}></div>
              <div className="relative bg-white w-full max-w-6xl max-h-[90vh] rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-500 border border-white/20">
                <button 
                  onClick={() => setIsDetailModalOpen(false)}
                  className="absolute top-8 right-8 z-10 w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20 transition border border-white/20"
                >
                  <FiX className="text-2xl" />
                </button>

                <div className="md:w-1/2 bg-slate-950 p-12 flex flex-col justify-center items-center">
                    <div className="w-full max-w-sm space-y-8">
                        <div className="text-center">
                           <h3 className="text-white text-3xl font-black mb-1 italic uppercase underline decoration-blue-500 underline-offset-8">Match Scan</h3>
                           <p className="text-white/30 text-[10px] font-black uppercase tracking-[4px]">Direct Comparison</p>
                        </div>
                        
                        <div className="space-y-4">
                           <div className="aspect-video bg-white/5 rounded-[32px] overflow-hidden border border-white/10 flex items-center justify-center p-4 relative shadow-2xl">
                              {viewingMatch.lost_image_url ? (
                                <img src={`${BACKEND_URL}${viewingMatch.lost_image_url}`} className="w-full h-full object-contain rounded-2xl" alt="Match" />
                              ) : (
                                <FiEye className="w-16 h-16 text-white/5" />
                              )}
                              <div className="absolute top-4 left-4 bg-blue-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase">Owner's Report Image</div>
                           </div>
                           
                           <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 text-center">
                              <p className="text-white font-black text-6xl italic">
                                {viewingMatch.match_score}<span className="text-blue-500 ml-1">%</span>
                              </p>
                              <p className="text-blue-400 text-[10px] font-black uppercase tracking-[3px] mt-2 font-mono">NEURAL_CONFIDENCE_STABLE</p>
                           </div>
                        </div>
                    </div>
                </div>

                <div className="md:w-1/2 p-12 overflow-y-auto space-y-10 bg-white shadow-[-40px_0_60px_rgba(0,0,0,0.05)]">
                    <div>
                       <h2 className="text-4xl font-black text-slate-900 leading-tight">Post Analysis</h2>
                       <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-2">Verified by Rwanda Lost & Found Engine</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1"><FiTag /> Category</p>
                          <p className="text-sm font-black text-slate-800 capitalize bg-white px-4 py-2 rounded-xl shadow-sm inline-block">{viewingMatch.lost_category}</p>
                       </div>
                       <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1"><FiMapPin /> District</p>
                          <p className="text-sm font-black text-slate-800 bg-white px-4 py-2 rounded-xl shadow-sm inline-block">{viewingMatch.lost_district}</p>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loser Identity</h4>
                       <div className="flex items-center gap-5 bg-blue-50/50 p-6 rounded-[32px] border border-blue-100/50">
                          <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl shadow-xl">
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
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document OCR Insights</h4>
                         <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 border-dashed border-2">
                           <p className="text-slate-600 text-sm font-bold italic leading-relaxed">"{viewingMatch.lost_text}"</p>
                         </div>
                      </div>
                    )}

                    <div className="pt-6">
                       <button
                          onClick={() => handleContactOwner(viewingMatch)}
                          className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-lg shadow-2xl hover:translate-y-[-4px] transition duration-300"
                        >
                          Initiate Verification
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
        <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest mb-4">
          Community Support
        </span>
        <h1 className="text-5xl font-black text-slate-900 leading-tight">Post a Found Item</h1>
        <p className="text-slate-500 text-lg mt-2 font-medium">Your report will be instantly matched against thousands of lost records.</p>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-100 rounded-[32px] p-6 mb-8 flex items-center gap-4 text-red-600 animate-in shake duration-500">
          <FiAlertCircle className="w-8 h-8 flex-shrink-0" />
          <p className="font-bold">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-[48px] shadow-2xl border border-slate-100 p-10 md:p-14 space-y-10">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Item Title</label>
              <input
                type="text"
                name="item_type"
                value={formData.item_type}
                onChange={handleChange}
                placeholder="e.g. Blue Leather Wallet"
                required
                className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-[24px] px-6 py-4 font-bold text-slate-800 transition-all outline-none"
              />
            </div>

            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-[24px] px-6 py-4 font-bold text-slate-800 transition-all outline-none"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {formData.category === "other" && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Specify Type</label>
                <input
                  type="text"
                  name="customCategory"
                  value={formData.customCategory}
                  onChange={handleChange}
                  placeholder="e.g. Student ID"
                  required
                  className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-[24px] px-6 py-4 font-bold text-slate-800 transition-all outline-none"
                />
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="h-full">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Item Image</label>
              <div className="relative h-[calc(100%-35px)] group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="imageUpload"
                />
                <div className={`h-64 md:h-full border-4 border-dashed rounded-[32px] transition-all flex flex-col items-center justify-center p-8 overflow-hidden ${
                  imagePreview ? 'border-blue-200 bg-blue-50/10' : 'border-slate-100 bg-slate-50 group-hover:bg-white group-hover:border-blue-400'
                }`}>
                  {imagePreview ? (
                     <div className="relative w-full h-full flex items-center justify-center">
                        <img src={imagePreview} className="max-h-full rounded-2xl shadow-xl" alt="Preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                           <p className="text-white font-black text-xs uppercase tracking-widest">Change Image</p>
                        </div>
                     </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-white rounded-[20px] shadow-sm flex items-center justify-center text-slate-300 mb-4 transition-transform group-hover:scale-110">
                        <FiUploadCloud className="w-8 h-8" />
                      </div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Click to Upload</p>
                      <p className="text-[10px] text-slate-400 mt-2">JPG, PNG up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 pt-6">
          <div className="group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe markings, color, condition, etc. for better matching."
              required
              rows={4}
              className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-[32px] px-8 py-6 font-bold text-slate-800 transition-all outline-none resize-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Date Found</label>
              <input
                type="date"
                name="date_found"
                value={formData.date_found}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-[24px] px-6 py-4 font-bold text-slate-800 transition-all outline-none"
              />
            </div>
            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">District</label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-[24px] px-6 py-4 font-bold text-slate-800 transition-all outline-none"
              >
                <option value="">Select District</option>
                {districts.map((dist) => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Exact Location</label>
            <input
              type="text"
              name="location_found"
              value={formData.location_found}
              onChange={handleChange}
              placeholder="Building name, street, landmarks..."
              required
              className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-[24px] px-6 py-4 font-bold text-slate-800 transition-all outline-none"
            />
          </div>

          <div className="group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Additional Notes</label>
            <textarea
              name="additional_info"
              value={formData.additional_info}
              onChange={handleChange}
              placeholder="Any other clues..."
              rows={2}
              className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-[24px] px-6 py-4 font-bold text-slate-800 transition-all outline-none resize-none"
            />
          </div>
        </div>

        <div className="pt-8">
           <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white rounded-[32px] py-6 font-black text-xl shadow-2xl hover:translate-y-[-4px] hover:bg-black transition-all duration-300 disabled:opacity-50 disabled:translate-y-0"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                Neural Scanning...
              </div>
            ) : "Confirm & Post Found Item"}
          </button>
        </div>
      </form>
    </div>
  );
}
