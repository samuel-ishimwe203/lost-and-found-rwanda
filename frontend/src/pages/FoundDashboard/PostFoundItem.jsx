import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../services/api";

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

  const categories = [
    { value: "national_id", label: "National ID" },
    { value: "passport", label: "Passport" },
    { value: "driving_license", label: "Driving License" },
    { value: "atm_card", label: "ATM Card" },
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
      
      // Create image preview
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
        setSubmitted(true);
        setTimeout(() => {
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
          setSubmitted(false);
        }, 3000);
      }
    } catch (err) {
      console.error('Post found item error:', err);
      if (err.response?.status === 401) {
        setError('🔒 Session expired. Please login again.');
      } else if (err.response?.status === 403) {
        setError('🚫 You do not have permission to post found items.');
      } else if (err.message === 'Network Error') {
        setError('🌐 Network error. Please check your connection.');
      } else {
        setError(`❌ ${err.response?.data?.message || 'Failed to post item. Please try again.'}`);
      }
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

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">
            Item Posted Successfully!
          </h2>
          <p className="text-green-700 mb-4">
            Your found item has been posted and is now visible to users searching for lost items.
          </p>
          <p className="text-green-600 text-sm">
            It will appear on the landing page for losers to find and contact you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Post a Found Item</h1>
        <p className="text-blue-600">
          Help reunite lost items with their owners by posting what you found
        </p>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 mb-6 text-red-700">
          {error}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-8 space-y-6">
        {/* ITEM NAME */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Item Name *
          </label>
          <input
            type="text"
            name="item_type"
            value={formData.item_type}
            onChange={handleChange}
            placeholder="e.g., Red National ID Card"
            required
            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-600 transition"
          />
        </div>

        {/* CATEGORY */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-600 transition"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* CUSTOM CATEGORY - Show if "Other" is selected */}
        {formData.category === "other" && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Specify Document Type *
            </label>
            <input
              type="text"
              name="customCategory"
              value={formData.customCategory}
              onChange={handleChange}
              placeholder="e.g., Student ID, Work Badge, etc."
              required
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-600 transition"
            />
          </div>
        )}

        {/* DESCRIPTION */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the item in detail (color, condition, markings, etc.)"
            required
            rows={5}
            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-600 transition resize-none"
          />
        </div>

        {/* IMAGE UPLOAD */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Upload Image (Optional)
          </label>
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-600 transition cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="imageUpload"
            />
            <label
              htmlFor="imageUpload"
              className="cursor-pointer flex flex-col items-center"
            >
              {imagePreview ? (
                <div className="space-y-2">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-40 rounded-lg mx-auto"
                  />
                  <span className="text-sm text-blue-600 font-semibold">
                    {formData.image.name}
                  </span>
                </div>
              ) : (
                <>
                  <span className="text-3xl mb-2">📷</span>
                  <span className="text-sm text-blue-600 font-semibold">
                    Click to upload image
                  </span>
                </>
              )}
            </label>
          </div>
        </div>

        {/* DATE FOUND */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Date Found *
          </label>
          <input
            type="date"
            name="date_found"
            value={formData.date_found}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-600 transition"
          />
        </div>

        {/* LOCATION */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Location Found *
          </label>
          <input
            type="text"
            name="location_found"
            value={formData.location_found}
            onChange={handleChange}
            placeholder="e.g., Kigali City Center, near Central Bank"
            required
            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-600 transition"
          />
        </div>

        {/* DISTRICT */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            District *
          </label>
          <select
            name="district"
            value={formData.district}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-600 transition"
          >
            <option value="">Select District</option>
            {districts.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
        </div>

        {/* ADDITIONAL INFO */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Additional Information (Optional)
          </label>
          <textarea
            name="additional_info"
            value={formData.additional_info}
            onChange={handleChange}
            placeholder="Any other details that might help identify the owner..."
            rows={3}
            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-600 transition resize-none"
          />
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Posting...' : 'Post Found Item'}
          </button>
          <button
            type="button"
            onClick={handleClearForm}
            disabled={loading}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
}
