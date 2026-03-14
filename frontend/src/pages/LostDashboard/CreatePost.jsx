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
  const [matches, setMatches] = useState([]);
  
  const [formData, setFormData] = useState({
    item_type: "",
    description: "",
    category: "",
    customCategory: "",
    color: "",
    owner_name: "",
    id_number: "",
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
      id_number: "",
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
        owner_name: formData.owner_name,
        id_number: formData.id_number
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
      const potentialMatches = response.data?.data?.potentialMatches || [];
      setMatches(potentialMatches);

      // If there are matches, keep user on page so they can review them.
      // Otherwise, redirect back to My Postings as before.
      if (potentialMatches.length === 0) {
        setSuccess("Lost item posted successfully! Redirecting...");
        if (refreshPosts) {
          await refreshPosts();
        }
        setTimeout(() => {
          navigate('/lost-dashboard/my-postings');
        }, 2000);
      } else {
        setSuccess("Lost item posted! We found possible matches below.");
        if (refreshPosts) {
          await refreshPosts();
        }
      }
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
        <h1 className="text-2xl md:text-3xl font-bold text-green-900">Create Lost Item Post</h1>
        <p className="text-green-700 mt-1 text-sm md:text-base">
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
      <form onSubmit={handleSubmit} className="bg-white p-4 md:p-6 lg:p-8 rounded-2xl shadow-lg space-y-5 border border-green-200">
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

        {/* ID NUMBER */}
        <div>
          <label className="block text-sm font-semibold text-green-900 mb-2">
            ID Number (on the document)
          </label>
          <input
            type="text"
            name="id_number"
            value={formData.id_number}
            onChange={handleChange}
            placeholder="e.g., 1199XXXXXXXXXXXX"
            className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-green-400"
          />
          <p className="text-green-600 text-sm mt-1">If you know the exact ID number, enter it to improve automatic matching.</p>
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
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 sm:flex-none bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold text-sm hover:from-green-700 hover:to-emerald-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Posting..." : "Post Item"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="flex-1 sm:flex-none bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-gray-500 transition disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </form>

      {/* POSSIBLE MATCHES AFTER POST */}
      {matches.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg border border-green-200">
          <h2 className="text-2xl font-bold text-green-900 mb-4">
            Possible Matches Found
          </h2>
          <p className="text-green-700 mb-4">
            We found items that might match your lost document. Please review them carefully.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {matches.map((item) => (
              <div
                key={item.id}
                className="border border-green-200 rounded-xl p-4 bg-green-50 space-y-1"
              >
                <p className="font-semibold text-green-900">
                  {item.item_type || 'Found Document'}
                </p>
                <p className="text-sm text-green-800">
                  <span className="font-medium">Category:</span> {item.category}
                </p>
                <p className="text-sm text-green-800">
                  <span className="font-medium">District:</span> {item.district}
                </p>
                {item.holder_name && (
                  <p className="text-sm text-green-800">
                    <span className="font-medium">Name on Document:</span> {item.holder_name}
                  </p>
                )}
                {item.id_number && (
                  <p className="text-sm text-green-800">
                    <span className="font-medium">ID Number:</span> {item.id_number}
                  </p>
                )}
                <p className="text-xs text-green-700 mt-1">
                  Found in: {item.location_found || 'Unknown'} on{" "}
                  {item.date_found || 'Unknown date'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
