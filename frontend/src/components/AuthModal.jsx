import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ isOpen, mode, onClose, onLoginSuccess }) {
  const { login, register } = useAuth();
  const [currentMode, setCurrentMode] = useState(mode);
  const [role, setRole] = useState("loser");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetMethod, setResetMethod] = useState("email");
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    setCurrentMode(mode);
    setError("");
  }, [mode]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!loginData.email || !loginData.password) {
      setError("Please enter both email and password.");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await login(loginData);
      const userRole = response.user.role;
      
      onClose();
      
      if (onLoginSuccess) {
        onLoginSuccess(userRole);
      }
      
      const dashboardMap = {
        'loser': '/lost-dashboard',
        'finder': '/found-dashboard',
        'police': '/police-dashboard',
        'admin': '/admin-dashboard'
      };
      
      navigate(dashboardMap[userRole] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!registerData.full_name || !registerData.email || !registerData.password || !registerData.confirmPassword || !registerData.phone_number) {
      setError("Please fill in all required fields.");
      return;
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match. Please check and try again.");
      return;
    }

    setLoading(true);
    
    try {
      const userData = {
        full_name: registerData.full_name,
        email: registerData.email,
        phone_number: registerData.phone_number,
        password: registerData.password,
        role: role
      };

      await register(userData);
      
      // On success, switch to login view and show a success message
      setCurrentMode("login");
      alert("Registration successful! Please log in.");
      
    } catch (err) {
      console.error('Registration error:', err);
      // Display the exact error message from the backend if available
      const backendError = err.response?.data?.error || err.response?.data?.message || err.response?.data?.details;
      setError(backendError || 'Unable to complete registration. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8 relative max-h-[90vh] overflow-y-auto">

        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 text-xl hover:text-gray-700"
          disabled={loading}
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center text-green-700 mb-2">
          {currentMode === "login" && "Welcome Back"}
          {currentMode === "register" && "Create an Account"}
          {currentMode === "forgot" && "Reset Password"}
        </h2>

        <p className="text-center text-gray-500 mb-6">
          {currentMode === "login" && "Login to continue"}
          {currentMode === "register" && "Join Rwanda's trusted lost & found network"}
          {currentMode === "forgot" && "We'll send you a reset code"}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4 text-sm flex gap-2 items-start">
            <span className="mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {currentMode === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email Address"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={loading}
            />

            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>

            <div className="flex justify-between text-sm mt-4">
              <button
                type="button"
                onClick={() => setCurrentMode("forgot")}
                className="text-gray-500 hover:text-green-700"
              >
                Forgot password?
              </button>

              <span className="text-gray-500">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setCurrentMode("register")}
                  className="text-green-600 font-semibold hover:underline"
                >
                  Sign up
                </button>
              </span>
            </div>
          </form>
        )}

        {/* ================= REGISTER ================= */}
        {currentMode === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                I want to...
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("loser")}
                  className={`px-4 py-3 rounded-lg border text-sm font-medium transition ${
                    role === "loser"
                      ? "bg-green-50 border-green-500 text-green-700"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Report Lost Item
                </button>

                <button
                  type="button"
                  onClick={() => setRole("finder")}
                  className={`px-4 py-3 rounded-lg border text-sm font-medium transition flex items-center justify-center gap-2 ${
                    role === "finder"
                      ? "bg-green-50 border-green-500 text-green-700"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {role === "finder" && <span>✓</span>}
                  Post Found Item
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">👤</span>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={registerData.full_name}
                  onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })}
                  className="w-full border border-gray-300 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Phone Number</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">📞</span>
                <input
                  type="tel"
                  placeholder="07..."
                  value={registerData.phone_number}
                  onChange={(e) => setRegisterData({ ...registerData, phone_number: e.target.value })}
                  className="w-full border border-gray-300 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-blue-50"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">✉️</span>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="w-full border border-gray-300 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">🔒</span>
                <input
                  type="password"
                  placeholder="••••••"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className="w-full border border-gray-300 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">🔒</span>
                <input
                  type="password"
                  placeholder="••••••"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  className="w-full border border-gray-300 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition mt-2 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

            <div className="text-center text-sm text-gray-500 pt-4 border-t mt-4">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setCurrentMode("login")}
                className="text-green-600 font-semibold hover:underline"
              >
                Log in here
              </button>
            </div>
          </form>
        )}

        {/* ================= FORGOT PASSWORD ================= */}
        {currentMode === "forgot" && (
          <form className="space-y-4">
            <div className="flex gap-4 justify-center mb-2">
              <button
                type="button"
                onClick={() => setResetMethod("email")}
                className={`px-4 py-2 rounded-lg border ${
                  resetMethod === "email"
                    ? "bg-green-600 text-white"
                    : "bg-white"
                }`}
              >
                Email
              </button>

              <button
                type="button"
                onClick={() => setResetMethod("phone")}
                className={`px-4 py-2 rounded-lg border ${
                  resetMethod === "phone"
                    ? "bg-green-600 text-white"
                    : "bg-white"
                }`}
              >
                Phone
              </button>
            </div>

            {resetMethod === "email" ? (
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full border px-4 py-3 rounded-lg"
              />
            ) : (
              <input
                type="tel"
                placeholder="Enter your phone number"
                className="w-full border px-4 py-3 rounded-lg"
              />
            )}

            <button
              type="submit"
              className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700"
            >
              Send Reset Code
            </button>

            <div className="text-center text-sm text-gray-500 pt-4">
              Remembered your password?{" "}
              <button
                type="button"
                onClick={() => setCurrentMode("login")}
                className="text-green-600 font-semibold"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}