import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";

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
    "Constable",
    "Lance Corporal",
    "Corporal",
    "Sergeant",
    "Inspector",
    "Senior Inspector",
    "Superintendent",
    "Senior Superintendent",
    "Commissioner"
  ];

  const districts = [
    "Nyarugenge",
    "Gasabo",
    "Kicukiro",
    "Bugesera",
    "Gatsibo",
    "Kayonza",
    "Kirehe",
    "Ngoma",
    "Rwamagana",
    "Karongi",
    "Rutsiro",
    "Nyabihu",
    "Musanze",
    "Burera",
    "Gicumbi",
    "Rulindo",
    "Rubavu",
    "Nyaruguru",
    "Nyamagabe",
    "Nyaruguru",
    "Huye",
    "Gisagara",
    "Ruhango",
    "Muhanga",
    "Rwamagana"
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real application, upload the file to cloud storage
      // For now, we'll just store the file reference
      setDocumentFile(file);
      setFormData({
        ...formData,
        document_url: file.name // In production, upload to S3 or similar
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (
      !formData.full_name ||
      !formData.email ||
      !formData.badge_number ||
      !formData.rank ||
      !formData.police_station ||
      !formData.district ||
      !formData.password ||
      !documentFile
    ) {
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
      // In a real application, first upload the document file
      // and get the URL, then submit the registration
      
      // For now, we'll use a simple document URL reference
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

      const response = await authService.registerPolice(registrationData);

      // Show success message
      navigate("/login", {
        state: {
          message:
            "Police registration submitted successfully! Your official documents are being verified by admin. You will receive a notification once approved.",
          email: formData.email
        },
        replace: true
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Police registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-2">
          Police Officer Registration
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Register as a police officer to help recover lost items and serve the community
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                placeholder="your@email.com"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Badge Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Badge Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="badge_number"
                value={formData.badge_number}
                onChange={handleChange}
                placeholder="e.g., PL-2024-001"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            {/* Rank */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rank <span className="text-red-500">*</span>
              </label>
              <select
                name="rank"
                value={formData.rank}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="">Select rank</option>
                {ranks.map((rank) => (
                  <option key={rank} value={rank}>
                    {rank}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                District <span className="text-red-500">*</span>
              </label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="">Select district</option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            {/* Police Station */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Police Station <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="police_station"
                value={formData.police_station}
                onChange={handleChange}
                placeholder="Name of your police station"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g., CID, Traffic, Patrol"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Official Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Official Email
              </label>
              <input
                type="email"
                name="email_official"
                value={formData.email_official}
                onChange={handleChange}
                placeholder="official@police.rw"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Official Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Official Phone
              </label>
              <input
                type="tel"
                name="phone_official"
                value={formData.phone_official}
                onChange={handleChange}
                placeholder="Official phone number"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Document Upload */}
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Official Document <span className="text-red-500">*</span>
            </label>
            <p className="text-gray-500 text-sm mb-3">
              Upload an official document (ID card, badge, or appointment letter)
            </p>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full"
              required
            />
            {documentFile && (
              <p className="text-green-600 text-sm mt-2">
                ✓ {documentFile.name} selected
              </p>
            )}
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>📝 Note:</strong> Your registration will be pending admin
              verification. An admin will review your official document and
              approve or reject your registration. You will receive an email
              notification once your status is updated.
            </p>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting Registration..." : "Submit Registration"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 text-center text-gray-400 text-sm">
          — already have an account? —
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-gray-600">
          <span
            onClick={() => navigate("/login")}
            className="text-blue-700 font-medium cursor-pointer hover:underline"
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}
