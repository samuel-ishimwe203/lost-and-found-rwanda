import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ isOpen, mode, onClose, onLoginSuccess }) {
  const { login, register } = useAuth();
  const [currentMode, setCurrentMode] = useState(mode);
  const [role, setRole] = useState("loser");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
    
    // Validate fields
    if (!loginData.email || !loginData.password) {
      setError("Please enter both email and password.");
      return;
    }
    
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(loginData.email)) {
      setError("Please provide a valid email address.");
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
    
    // Validate all fields are filled
    if (!registerData.full_name || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }
    
    // Validate full name
    if (registerData.full_name.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }
    
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(registerData.email)) {
      setError("Please provide a valid email address (e.g., name@gmail.com).");
      return;
    }
    
    // Validate email domain
    const validDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'protonmail.com', 'lostandfound.rw'];
    const emailDomain = registerData.email.split('@')[1]?.toLowerCase();
    if (!validDomains.includes(emailDomain)) {
      setError("Please use a valid email provider (Gmail, Yahoo, Outlook, Hotmail, iCloud, ProtonMail).");
      return;
    }
    
    // Validate password length
    if (registerData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    
    // Validate passwords match
    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match. Please check and try again.");
      return;
    }

    setLoading(true);
    
    try {
      const userData = {
        email: registerData.email,
        password: registerData.password,
        full_name: registerData.full_name,
        phone_number: registerData.phone_number,
        role: role,
        language_preference: 'en'
      };

      await register(userData);
      
      onClose();
      
      if (onLoginSuccess) {
        onLoginSuccess(role);
      }
      
      const dashboardMap = {
        'loser': '/lost-dashboard',
        'finder': '/found-dashboard'
      };
      
      navigate(dashboardMap[role] || '/');
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
          {currentMode === "register" && "Create Account"}
        </h2>

        <p className="text-center text-gray-500 mb-6">
          {currentMode === "login" && "Login to continue"}
          {currentMode === "register" && "Register to report or find items"}
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {currentMode === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              className="w-full border px-4 py-3 rounded-lg"
              required
              disabled={loading}
            />

            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              className="w-full border px-4 py-3 rounded-lg"
              required
            />

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
            >
              Login
            </button>

            <div className="flex justify-between text-sm mt-2">
              <button
                type="button"
                onClick={() => setCurrentMode("forgot")}
                className="text-green-700 font-semibold"
              >
                Forgot password?
              </button>

              <button
                type="button"
                onClick={() => setCurrentMode("register")}
                className="text-green-700 font-semibold"
              >
                Register
              </button>
            </div>
          </form>
        )}

        {/* ================= REGISTER ================= */}
        {currentMode === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">

            {/* 🔹 ROLE SELECTION (NEW, SIMPLE, CLEAN) */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-600">
                Register as:
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRole("loser")}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    role === "loser"
                      ? "bg-green-600 text-white"
                      : "bg-white"
                  }`}
                >
                  I Lost an Item
                </button>

                <button
                  type="button"
                  onClick={() => setRole("finder")}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    role === "finder"
                      ? "bg-green-600 text-white"
                      : "bg-white"
                  }`}
                >
                  I Found an Item
                </button>
              </div>
            </div>

            <input
              type="text"
              placeholder="Full Name"
              value={registerData.full_name}
              onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })}
              className="w-full border px-4 py-3 rounded-lg"
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              className="w-full border px-4 py-3 rounded-lg"
              required
            />

            <input
              type="tel"
              placeholder="Phone Number (e.g., +250788123456)"
              value={registerData.phone_number}
              onChange={(e) => setRegisterData({ ...registerData, phone_number: e.target.value })}
              className="w-full border px-4 py-3 rounded-lg"
              required
            />

            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              className="w-full border px-4 py-3 rounded-lg"
              required
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={registerData.confirmPassword}
              onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
              className="w-full border px-4 py-3 rounded-lg"
              required
            />

            {/* Hidden role field (for backend later) */}
            <input type="hidden" value={role} />

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
            >
              Register
            </button>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setCurrentMode("login")}
                className="text-green-700 font-semibold"
              >
                Login
              </button>
            </div>
          </form>
        )}

        {/* ================= FORGOT PASSWORD ================= */}
        {currentMode === "forgot" && (
          <form className="space-y-4">

            {/* Method switch */}
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
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
            >
              Send Reset Code
            </button>

            <div className="text-center text-sm">
              Remembered your password?{" "}
              <button
                type="button"
                onClick={() => setCurrentMode("login")}
                className="text-green-700 font-semibold"
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
