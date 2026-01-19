import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

    // Validation
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
      // Register without auto-login
      const { full_name, email, phone_number, password, role } = formData;
      await authService.register({ full_name, email, phone_number, password, role });
      
      // Clear any existing auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      navigate("/login", { 
        state: { 
          message: "Registration successful! Please login with your credentials.",
          email: email 
        },
        replace: true  // Replace history entry so back button doesn't go back to register
      });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">

        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-green-700 mb-2">
          Create an Account
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Join Lost & Found Rwanda to recover what matters
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Your full name"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="+250 7XX XXX XXX"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I want to register as <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelect("loser")}
                className={`p-4 border-2 rounded-lg text-center transition ${
                  formData.role === "loser"
                    ? "border-green-600 bg-green-50 text-green-700"
                    : "border-gray-300 hover:border-green-400"
                }`}
              >
                <div className="text-2xl mb-1">😢</div>
                <div className="font-semibold">Lost Item</div>
                <div className="text-xs text-gray-500">I lost something</div>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect("finder")}
                className={`p-4 border-2 rounded-lg text-center transition ${
                  formData.role === "finder"
                    ? "border-green-600 bg-green-50 text-green-700"
                    : "border-gray-300 hover:border-green-400"
                }`}
              >
                <div className="text-2xl mb-1">😊</div>
                <div className="font-semibold">Found Item</div>
                <div className="text-xs text-gray-500">I found something</div>
              </button>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              required
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 text-center text-gray-400 text-sm">
          — already have an account? —
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-gray-600 mb-4">
          <span 
            onClick={() => navigate("/login")}
            className="text-green-700 font-medium cursor-pointer hover:underline"
          >
            Login here
          </span>
        </p>

        {/* Police Registration link */}
        <div className="text-center pt-4 border-t">
          <p className="text-sm text-gray-600 mb-2">Are you a police officer?</p>
          <button
            type="button"
            onClick={() => navigate("/register-police")}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            👮 Register as Police Officer
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Confirm Registration Type
            </h3>
            <p className="text-gray-600 mb-6">
              You are registering as a <span className="font-bold text-green-700">
                {selectedRole === "loser" ? "Lost Item User" : "Found Item User"}
              </span>. 
              {selectedRole === "loser" 
                ? " You'll be able to report items you've lost."
                : " You'll be able to report items you've found."}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={cancelRole}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmRole}
                className="flex-1 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition"
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
