import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/api";
import { useContext } from "react";
import { PostsContext } from "../../context/PostsContext";

export default function CreatePost() {
  const navigate = useNavigate();
  const { refreshPosts } = useContext(PostsContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    item_type: "",
    description: "",
    category: "",
    customCategory: "",
    color: "",
    owner_name: "",
    location_lost: "",
    district: "",
    date_lost: "",
    reward_amount: "",
    contact_phone: "",
    image: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please select a valid image file");
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const handleReset = () => {
    setFormData({
      item_type: "",
      description: "",
      category: "",
      customCategory: "",
      color: "",
      owner_name: "",
      location_lost: "",
      district: "",
      date_lost: "",
      reward_amount: "",
      contact_phone: "",
      image: null
    });
    setImagePreview(null);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Prepare form data for file upload
      const submitData = new FormData();
      submitData.append('item_type', formData.item_type);
      submitData.append('description', formData.description);
      // Use custom category if "other" is selected, otherwise use selected category
      submitData.append('category', formData.category === 'other' ? formData.customCategory : formData.category);
      submitData.append('location_lost', formData.location_lost);
      submitData.append('district', formData.district);
      submitData.append('date_lost', formData.date_lost);
      submitData.append('reward_amount', parseInt(formData.reward_amount) || 0);
      
      // Add additional_info as JSON
      const additionalInfo = {
        color: formData.color,
        contact_phone: formData.contact_phone,
        owner_name: formData.owner_name
      };
      submitData.append('additional_info', JSON.stringify(additionalInfo));
      
      // Add image if present
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      const response = await apiClient.post('/lost-items', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSuccess("Lost item posted successfully! Redirecting...");
      if (refreshPosts) {
        await refreshPosts();
      }
      
      setTimeout(() => {
        navigate('/lost-dashboard/my-postings');
      }, 2000);
    } catch (err) {
      console.error('Post error:', err);
      setError(err.response?.data?.message || 'Failed to post item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-bold text-green-900">Create Lost Item Post</h1>
        <p className="text-green-700 mt-2">
          Post details about your lost item to help finders locate it
        </p>
      </div>

      {/* SUCCESS/ERROR MESSAGES */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg space-y-6 border border-green-200">
        {/* ITEM TITLE */}
        <div>
          <label className="block text-sm font-semibold text-green-900 mb-2">
            Item Title *
          </label>
          <input
            type="text"
            name="item_type"
            value={formData.item_type}
            onChange={handleChange}
            placeholder="e.g., National ID Card"
            className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-green-400"
            required
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block text-sm font-semibold text-green-900 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the item in detail..."
            rows="4"
            className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-green-400"
          ></textarea>
        </div>

        {/* CATEGORY */}
        <div>
          <label className="block text-sm font-semibold text-green-900 mb-2">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">Select Category</option>
            <option value="national_id">National ID</option>
            <option value="passport">Passport</option>
            <option value="driving_license">Driving License</option>
            <option value="atm_card">ATM Card</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* CUSTOM CATEGORY - Show when Other is selected */}
        {formData.category === "other" && (
          <div>
            <label className="block text-sm font-semibold text-green-900 mb-2">
              Other Document Name *
            </label>
            <input
              type="text"
              name="customCategory"
              value={formData.customCategory}
              onChange={handleChange}
              placeholder="e.g., Birth Certificate, School ID, etc."
              className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-green-400"
              required
            />
          </div>
        )}

        {/* COLOR */}
        <div>
          <label className="block text-sm font-semibold text-green-900 mb-2">
            Color
          </label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="e.g., Black, Red, etc."
            className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-green-400"
          />
        </div>

        {/* OWNER NAME - Name on the document */}
        <div>
          <label className="block text-sm font-semibold text-green-900 mb-2">
            Owner Name (Name on the document) *
          </label>
          <input
            type="text"
            name="owner_name"
            value={formData.owner_name}
            onChange={handleChange}
            placeholder="e.g., John Doe (as written on the ID/document)"
            className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-green-400"
            required
          />
          <p className="text-green-600 text-sm mt-1">Enter the name as it appears on the lost document/ID</p>
        </div>

        {/* LOCATION AND DISTRICT */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-green-900 mb-2">
              Location Lost *
            </label>
            <input
              type="text"
              name="location_lost"
              value={formData.location_lost}
              onChange={handleChange}
              placeholder="e.g., Kimironko Market"
              className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-green-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-green-900 mb-2">
              District *
            </label>
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select District</option>
              <option value="Kigali">Kigali</option>
              <option value="Gasabo">Gasabo</option>
              <option value="Kicukiro">Kicukiro</option>
              <option value="Nyarugenge">Nyarugenge</option>
              <option value="Huye">Huye</option>
              <option value="Musanze">Musanze</option>
              <option value="Rubavu">Rubavu</option>
              <option value="Rusizi">Rusizi</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* DATE OF LOSS */}
        <div>
          <label className="block text-sm font-semibold text-green-900 mb-2">
            Date of Loss *
          </label>
          <input
            type="date"
            name="date_lost"
            value={formData.date_lost}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        {/* IMAGE UPLOAD */}
        <div>
          <label className="block text-sm font-semibold text-green-900 mb-2">
            Upload Image
          </label>
          <input
            type="file"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
            className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 file:bg-green-600 file:border-0 file:text-white file:px-4 file:py-2 file:rounded file:cursor-pointer file:mr-4"
          />
          <p className="text-green-600 text-sm mt-1">Max size: 5MB. Supported formats: JPG, PNG, GIF</p>
          
          {/* IMAGE PREVIEW */}
          {imagePreview && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-green-900 mb-2">Preview:</p>
              <div className="relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-w-xs max-h-48 rounded-lg border-2 border-green-300"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData(prev => ({ ...prev, image: null }));
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>

        {/* REWARD AMOUNT */}
        <div>
          <label className="block text-sm font-semibold text-green-900 mb-2">
            Reward Amount (RWF)
          </label>
          <input
            type="number"
            name="reward_amount"
            value={formData.reward_amount}
            onChange={handleChange}
            placeholder="e.g., 50000"
            min="0"
            className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-green-400"
          />
        </div>

        {/* CONTACT PHONE */}
        <div>
          <label className="block text-sm font-semibold text-green-900 mb-2">
            Contact Phone *
          </label>
          <input
            type="tel"
            name="contact_phone"
            value={formData.contact_phone}
            onChange={handleChange}
            placeholder="e.g., +250788123456"
            pattern="[+]?[0-9]{10,15}"
            className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-green-400"
            required
          />
        </div>

        {/* SUBMIT BUTTONS */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Posting..." : "Post Item"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-500 transition disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
