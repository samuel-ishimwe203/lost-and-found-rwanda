import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";
import { FiMail, FiLock, FiArrowRight, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    password: ""
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(location.state?.message || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!formData.email || !formData.password) {
      setError("Please provide email and password");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login(formData);
      login(response.user, response.token);

      const role = response.user.role;
      if (role === "loser") navigate("/lost-dashboard");
      else if (role === "finder") navigate("/found-dashboard");
      else if (role === "police") navigate("/police-dashboard");
      else if (role === "admin") navigate("/admin-dashboard");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-sm border border-gray-100 p-10 md:p-12">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1 mb-6">
            <span className="text-2xl font-black tracking-tighter text-gray-900 uppercase">LOST</span>
            <span className="text-2xl font-black tracking-tighter text-[#10b981] uppercase">FOUND</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-400 text-sm font-medium">Access your secure dashboard hub</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-[#10b981] rounded-2xl text-xs font-bold flex items-center gap-3">
            <FiCheckCircle className="shrink-0" /> {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-3">
            <FiAlertCircle className="shrink-0" /> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Email Identity</label>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#10b981] transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#10b981] transition-all outline-none font-bold text-gray-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Access Key</label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#10b981] transition-colors" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#10b981] transition-all outline-none font-bold text-gray-800"
                  required
                />
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-[#10b981] transition">
              Forgot password?
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#10b981] text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2 group/btn"
          >
            {loading ? "Authenticating..." : "Login to Portal"}
            {!loading && <FiArrowRight className="transition-transform group-hover/btn:translate-x-1" />}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-50 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Don't have an account?{" "}
            <span 
              onClick={() => navigate("/register")}
              className="text-[#10b981] cursor-pointer hover:underline"
            >
              Register Now
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
