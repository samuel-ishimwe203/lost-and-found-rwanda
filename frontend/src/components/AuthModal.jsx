import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthModal({ isOpen, mode, onClose, onLoginSuccess }) {
  const [currentMode, setCurrentMode] = useState(mode);
  const [resetMethod, setResetMethod] = useState("email"); // email | phone
  const [role, setRole] = useState("lost_user");
  const navigate = useNavigate();

  // Form states
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  // Handle login submission
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log("Login data:", loginData);
    
    // Simulate login success
    // In real app, you'd verify credentials with backend
    onClose(); // Close modal
    
    // Notify parent that login was successful
    if (onLoginSuccess) {
      onLoginSuccess(role);
    }
    
    // Redirect to lost dashboard if user is a lost user
    if (role === "lost_user") {
      navigate("/lost-dashboard");
    } else {
      navigate("/found-dashboard"); // or wherever found users go
    }
  };

  // Handle register submission
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    console.log("Register data:", { ...registerData, role });
    
    // Simulate registration success
    // In real app, you'd send data to backend
    
    // After successful registration, switch to login mode
    setCurrentMode("login");
    setLoginData({ email: "", password: "" });
    alert(`Registration successful as ${role === "lost_user" ? "Lost User" : "Found User"}! Now please login.`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8 relative">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 text-xl"
        >
          ✕
        </button>

        {/* ================= TITLE ================= */}
        <h2 className="text-2xl font-bold text-center text-green-700 mb-2">
          {currentMode === "login" && "Welcome Back"}
          {currentMode === "register" && "Create Account"}
          {currentMode === "forgot" && "Reset Your Password"}
        </h2>

        <p className="text-center text-gray-500 mb-6">
          {currentMode === "login" && "Login to continue"}
          {currentMode === "register" && "Register to report or find items"}
          {currentMode === "forgot" &&
            "Choose how you want to receive your reset code"}
        </p>

        {/* ================= LOGIN ================= */}
        {currentMode === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              className="w-full border px-4 py-3 rounded-lg"
              required
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
                  onClick={() => setRole("lost_user")}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    role === "lost_user"
                      ? "bg-green-600 text-white"
                      : "bg-white"
                  }`}
                >
                  I Lost an Item
                </button>

                <button
                  type="button"
                  onClick={() => setRole("found_user")}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    role === "found_user"
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
              value={registerData.fullName}
              onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
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
              placeholder="Phone Number"
              value={registerData.phone}
              onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
              className="w-full border px-4 py-3 rounded-lg"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
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
