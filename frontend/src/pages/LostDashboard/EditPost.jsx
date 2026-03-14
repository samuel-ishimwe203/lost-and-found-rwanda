import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../services/api";
import { useContext } from "react";
import { PostsContext } from "../../context/PostsContext";

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshPosts } = useContext(PostsContext);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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
    id_number: "",
    location_lost: "",
    district: "",
    date_lost: "",
    reward_amount: "",
    contact_phone: "",
    image: null
  });

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setFetching(true);
        const response = await apiClient.get(`/lost-items/${id}`);
        const item = response.data.data.lostItem;
        
        // Handle categories
        const standardCategories = ['national_id', 'passport', 'driving_license', 'atm_card'];
        const isStandard = standardCategories.includes(item.category);
        
        // Parse additional info
        let additionalInfo = {};
        try {
          additionalInfo = typeof item.additional_info === 'string' 
            ? JSON.parse(item.additional_info) 
            : (item.additional_info || {});
        } catch (e) {
          additionalInfo = {};
        }

        setFormData({
          item_type: item.item_type || "",
          description: item.description || "",
          category: isStandard ? item.category : "other",
          customCategory: isStandard ? "" : item.category,
          color: additionalInfo.color || "",
          owner_name: item.holder_name || additionalInfo.owner_name || "",
          id_number: item.id_number || additionalInfo.id_number || "",
          location_lost: item.location_lost || "",
          district: item.district || "",
          date_lost: item.date_lost ? item.date_lost.split('T')[0] : "",
          reward_amount: item.reward_amount || "",
          contact_phone: additionalInfo.contact_phone || "",
          image: null
        });

        if (item.image_url) {
          const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
          const imageUrl = item.image_url.startsWith('http') 
            ? item.image_url 
            : `${baseUrl.replace('/api', '')}${item.image_url}`;
          setImagePreview(imageUrl);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError("Failed to load item details.");
      } finally {
        setFetching(false);
      }
    };

    fetchItemDetails();
  }, [id]);

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
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError("Please select a valid image file");
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // For updates, we can send JSON if no new image, or FormData if there is a new image
      // Let's use FormData to be safe and consistent with create
      const submitData = new FormData();
      submitData.append('item_type', formData.item_type);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category === 'other' ? formData.customCategory : formData.category);
      submitData.append('location_lost', formData.location_lost);
      submitData.append('district', formData.district);
      submitData.append('date_lost', formData.date_lost);
      submitData.append('reward_amount', parseInt(formData.reward_amount) || 0);
      
      const additionalInfo = {
        color: formData.color,
        contact_phone: formData.contact_phone,
        owner_name: formData.owner_name,
        id_number: formData.id_number
      };
      submitData.append('additional_info', JSON.stringify(additionalInfo));
      
      // Explicitly set holder_name and id_number if they are top-level columns now
      submitData.append('holder_name', formData.owner_name);
      submitData.append('id_number', formData.id_number);

      if (formData.image) {
        submitData.append('image', formData.image);
      }

      await apiClient.put(`/lost-items/${id}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSuccess("Post updated successfully! Redirecting...");
      if (refreshPosts) await refreshPosts();
      setTimeout(() => navigate('/lost-dashboard/my-postings'), 2000);
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Failed to update post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-green-900">Edit Lost Item Post</h1>
        <p className="text-green-700 mt-2">Update the details of your lost item posting</p>
      </div>

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

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg space-y-6 border border-green-200">
        <div>
          <label className="block text-sm font-semibold text-green-900 mb-2">Item Title *</label>
          <input
            type="text"
            name="item_type"
            value={formData.item_type}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-green-900 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          ></textarea>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-green-900 mb-2">Category *</label>
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
          {formData.category === "other" && (
            <div>
              <label className="block text-sm font-semibold text-green-900 mb-2">Other Document Name *</label>
              <input
                type="text"
                name="customCategory"
                value={formData.customCategory}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-green-900 mb-2">Owner Name *</label>
            <input
              type="text"
              name="owner_name"
              value={formData.owner_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-green-900 mb-2">ID Number</label>
            <input
              type="text"
              name="id_number"
              value={formData.id_number}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-green-900 mb-2">Location Lost *</label>
            <input
              type="text"
              name="location_lost"
              value={formData.location_lost}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-green-900 mb-2">District *</label>
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

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-green-900 mb-2">Date of Loss *</label>
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
          <div>
            <label className="block text-sm font-semibold text-green-900 mb-2">Reward (RWF)</label>
            <input
              type="number"
              name="reward_amount"
              value={formData.reward_amount}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-green-900 mb-2">Contact Phone *</label>
            <input
              type="tel"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-green-900 mb-2">Update Image</label>
          <input
            type="file"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
            className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 file:bg-green-600 file:border-0 file:text-white file:px-4 file:py-2 file:rounded file:cursor-pointer file:mr-4"
          />
          {imagePreview && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-green-900 mb-2">Image Preview:</p>
              <img src={imagePreview} alt="Preview" className="max-w-xs max-h-48 rounded-lg border-2 border-green-300" />
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition shadow-lg disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Post"}
          </button>
          <button
            type="button"
            onClick={() => navigate('/lost-dashboard/my-postings')}
            className="bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-500 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
