import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";
import { FiUser, FiMail, FiPhone, FiLock, FiArrowRight, FiShield, FiSearch, FiCheckCircle } from "react-icons/fi";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
    role: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setShowConfirmation(true);
  };

  const confirmRole = () => {
    setFormData({ ...formData, role: selectedRole });
    setShowConfirmation(false);
  };

  const cancelRole = () => {
    setSelectedRole("");
    setShowConfirmation(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.full_name || !formData.email || !formData.password || !formData.role) {
      setError("Please fill in all required fields");
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
      const { full_name, email, phone_number, password, role } = formData;
      await authService.register({ full_name, email, phone_number, password, role });
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      navigate("/login", { 
        state: { 
          message: "Registration successful! Please login with your credentials.",
          email: email 
        },
        replace: true
      });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-20 font-sans">
      <div className="w-full max-w-xl bg-white rounded-[40px] shadow-sm border border-gray-100 p-10 md:p-14">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1 mb-6">
            <span className="text-2xl font-black tracking-tighter text-gray-900 uppercase">LOST</span>
            <span className="text-2xl font-black tracking-tighter text-[#10b981] uppercase">FOUND</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create an Account</h2>
          <p className="text-gray-400 text-sm font-medium">Join the national recovery network</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
              <div className="relative group">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#10b981] transition-colors" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#10b981] transition-all outline-none font-bold text-gray-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Email</label>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#10b981] transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#10b981] transition-all outline-none font-bold text-gray-800"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Account Path</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleRoleSelect("loser")}
                className={`flex flex-col items-center p-6 border-2 rounded-2xl transition-all duration-300 ${
                  formData.role === "loser"
                    ? "border-[#10b981] bg-emerald-50"
                    : "border-gray-50 hover:border-emerald-100 bg-gray-50/50"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${formData.role === 'loser' ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/20' : 'bg-white text-gray-400 shadow-sm'}`}>
                  <FiSearch className="text-xl" />
                </div>
                <div className={`font-bold text-sm mb-1 ${formData.role === 'loser' ? 'text-gray-900' : 'text-gray-500'}`}>I Lost Something</div>
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-tight">Recovery Mode</p>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect("finder")}
                className={`flex flex-col items-center p-6 border-2 rounded-2xl transition-all duration-300 ${
                  formData.role === "finder"
                    ? "border-[#10b981] bg-emerald-50"
                    : "border-gray-50 hover:border-emerald-100 bg-gray-50/50"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${formData.role === 'finder' ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/20' : 'bg-white text-gray-400 shadow-sm'}`}>
                  <FiCheckCircle className="text-xl" />
                </div>
                <div className={`font-bold text-sm mb-1 ${formData.role === 'finder' ? 'text-gray-900' : 'text-gray-500'}`}>I Found Something</div>
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-tight">Altruism Mode</p>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Pass-key</label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#10b981] transition-colors" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create Key"
                  className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#10b981] transition-all outline-none font-bold text-gray-800"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Confirm Key</label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#10b981] transition-colors" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Verify Key"
                  className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#10b981] transition-all outline-none font-bold text-gray-800"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-950 text-white py-4 md:py-5 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-[#10b981] transition-all duration-300 shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 group/btn"
          >
            {loading ? "Registering Node..." : "Initiate Account"}
            {!loading && <FiArrowRight className="transition-transform group-hover/btn:translate-x-1" />}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-gray-50 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Already have an account?{" "}
            <span 
              onClick={() => navigate("/login")}
              className="text-[#10b981] cursor-pointer hover:underline"
            >
              Login Here
            </span>
          </p>
          <div className="mt-6">
            <button
               onClick={() => navigate("/register-police")}
               className="inline-flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest border-b-2 border-blue-100 hover:border-blue-600 transition pb-1"
            >
               <FiShield /> Police Access Point
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-[200] px-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl p-10 max-w-sm w-full border border-gray-100 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#10b981] text-2xl mb-6 mx-auto">
               <FiShield />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Confirm Identity Path</h3>
            <p className="text-gray-400 text-sm font-medium mb-8 text-center leading-relaxed">
              You are registering as a <span className="text-[#10b981] font-bold">
                {selectedRole === "loser" ? "Lost-Item Holder" : "Found-Item Finder"}
              </span>. This path determines your primary dashboard interface.
            </p>
            <div className="flex gap-4">
              <button
                onClick={cancelRole}
                className="flex-1 px-4 py-4 border border-gray-100 text-gray-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition"
              >
                Change
              </button>
              <button
                onClick={confirmRole}
                className="flex-1 px-4 py-4 bg-[#10b981] text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-black transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
