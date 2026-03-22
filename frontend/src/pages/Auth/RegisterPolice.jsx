import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";
import { FiUser, FiMail, FiPhone, FiLock, FiArrowRight, FiShield, FiBriefcase, FiMapPin, FiFileText, FiUploadCloud } from "react-icons/fi";

export default function RegisterPolice() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    badge_number: "",
    rank: "",
    police_station: "",
    district: "",
    department: "",
    email_official: "",
    phone_official: "",
    password: "",
    confirmPassword: "",
    document_url: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [documentFile, setDocumentFile] = useState(null);

  const ranks = [
    "Constable", "Lance Corporal", "Corporal", "Sergeant", "Inspector",
    "Senior Inspector", "Superintendent", "Senior Superintendent", "Commissioner"
  ];

  const districts = [
    "Nyarugenge", "Gasabo", "Kicukiro", "Bugesera", "Gatsibo", "Kayonza", "Kirehe",
    "Ngoma", "Rwamagana", "Karongi", "Rutsiro", "Nyabihu", "Musanze", "Burera",
    "Gicumbi", "Rulindo", "Rubavu", "Nyaruguru", "Nyamagabe", "Huye", "Gisagara",
    "Ruhango", "Muhanga"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentFile(file);
      setFormData({ ...formData, document_url: file.name });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.full_name || !formData.email || !formData.badge_number || !formData.rank || !formData.police_station || !formData.district || !formData.password || !documentFile) {
      setError("Please fill in all required fields and upload an official document");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const documentName = documentFile.name.replace(/[^a-z0-9.-]/gi, '_');
      const registrationData = {
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number,
        badge_number: formData.badge_number,
        rank: formData.rank,
        police_station: formData.police_station,
        district: formData.district,
        department: formData.department || null,
        email_official: formData.email_official || null,
        phone_official: formData.phone_official || formData.phone_number,
        password: formData.password,
        language_preference: 'en',
        document_url: `documents/${Date.now()}_${documentName}`
      };

      await authService.registerPolice(registrationData);

      navigate("/login", {
        state: {
          message: "Police registration submitted successfully! Your official documents are being verified by admin.",
          email: formData.email
        },
        replace: true
      });
    } catch (err) {
      setError(err.response?.data?.message || "Police registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-20 font-sans">
      <div className="w-full max-w-3xl bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 md:p-14">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto shadow-sm">
             <FiShield />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Law Enforcement Registration</h2>
          <p className="text-gray-400 text-sm font-medium">Official portal for Rwanda National Police verification</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          
          <div className="space-y-6">
            <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] border-l-4 border-blue-600 pl-4">Personal Credentials</h3>
            <div className="grid md:grid-cols-2 gap-6">
               <div className="relative group">
                 <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                 <input
                   type="text" name="full_name" value={formData.full_name} onChange={handleChange}
                   placeholder="Full Name"
                   className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-blue-600 transition-all outline-none font-bold text-gray-800"
                   required
                 />
               </div>
               <div className="relative group">
                 <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                 <input
                   type="email" name="email" value={formData.email} onChange={handleChange}
                   placeholder="Personal Email"
                   className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-blue-600 transition-all outline-none font-bold text-gray-800"
                   required
                 />
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] border-l-4 border-blue-600 pl-4">Service Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
               <div className="relative group text-gray-400">
                 <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                 <select
                   name="rank" value={formData.rank} onChange={handleChange}
                   className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-blue-600 transition-all outline-none font-bold text-gray-800 appearance-none"
                   required
                 >
                   <option value="">Select Rank</option>
                   {ranks.map(r => <option key={r} value={r}>{r}</option>)}
                 </select>
               </div>
               <div className="relative group">
                 <FiFileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                 <input
                   type="text" name="badge_number" value={formData.badge_number} onChange={handleChange}
                   placeholder="Badge Identification"
                   className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-blue-600 transition-all outline-none font-bold text-gray-800"
                   required
                 />
               </div>
               <div className="relative group text-gray-400">
                 <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                 <select
                   name="district" value={formData.district} onChange={handleChange}
                   className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-blue-600 transition-all outline-none font-bold text-gray-800 appearance-none"
                   required
                 >
                   <option value="">Deployment District</option>
                   {districts.map(d => <option key={d} value={d}>{d}</option>)}
                 </select>
               </div>
               <div className="relative group">
                 <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                 <input
                   type="text" name="police_station" value={formData.police_station} onChange={handleChange}
                   placeholder="Primary Station"
                   className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-blue-600 transition-all outline-none font-bold text-gray-800"
                   required
                 />
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] border-l-4 border-blue-600 pl-4">Verification Artifact</h3>
            <div className="relative group h-40 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center transition-all hover:bg-blue-50/50 hover:border-blue-200 cursor-pointer overflow-hidden">
               <input
                 type="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png"
                 className="absolute inset-0 opacity-0 cursor-pointer z-10"
                 required
               />
               <div className="text-center group-hover:scale-110 transition-transform duration-500">
                 <FiUploadCloud className={`w-10 h-10 ${documentFile ? 'text-blue-600' : 'text-gray-200'} mx-auto mb-2`} />
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {documentFile ? documentFile.name : 'Upload Service ID / Credentials'}
                 </p>
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] border-l-4 border-blue-600 pl-4">Network Access</h3>
            <div className="grid md:grid-cols-2 gap-6">
               <div className="relative group">
                 <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                 <input
                   type="password" name="password" value={formData.password} onChange={handleChange}
                   placeholder="Create Key"
                   className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-blue-600 transition-all outline-none font-bold text-gray-800"
                   required
                 />
               </div>
               <div className="relative group">
                 <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                 <input
                   type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                   placeholder="Verify Key"
                   className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-blue-600 transition-all outline-none font-bold text-gray-800"
                   required
                 />
               </div>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl hover:bg-black transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 group/btn"
          >
            {loading ? "Transmitting Registry..." : "Submit Official Request"}
            {!loading && <FiArrowRight className="transition-transform group-hover/btn:translate-x-1" />}
          </button>
        </form>

        <div className="mt-12 text-center">
          <button onClick={() => navigate("/login")} className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-blue-600 transition">
             Back to Secure Portal
          </button>
        </div>
      </div>
    </div>
  );
}
