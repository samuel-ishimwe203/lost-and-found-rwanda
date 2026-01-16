import React, { useState } from "react";

export default function CreatePost() {
  const [formData, setFormData] = useState({
    itemTitle: "",
    description: "",
    category: "",
    color: "",
    location: "",
    dateOfLoss: "",
    image: null,
    rewardAmount: "",
    contactPhone: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add submission logic here
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

      {/* FORM */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg space-y-6 border border-green-200">
        {/* ITEM TITLE */}
        <div>
          <label className="block text-sm font-semibold text-green-900 mb-2">
            Item Title *
          </label>
          <input
            type="text"
            name="itemTitle"
            value={formData.itemTitle}
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
            <option value="" className="bg-white">Select Category</option>
            <option value="documents" className="bg-white">Documents</option>
            <option value="electronics" className="bg-white">Electronics</option>
            <option value="jewelry" className="bg-white">Jewelry</option>
            <option value="clothing" className="bg-white">Clothing</option>
            <option value="accessories" className="bg-white">Accessories</option>
            <option value="other" className="bg-white">Other</option>
          </select>
        </div>

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

        {/* LOCATION */}
        <div>
          <label className="block text-sm font-semibold text-green-900 mb-2">
            Location Lost *
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Kigali - Kimironko"
            className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-green-400"
            required
          />
        </div>

        {/* DATE OF LOSS */}
        <div>
          <label className="block text-sm font-semibold text-green-900 mb-2">
            Date of Loss *
          </label>
          <input
            type="date"
            name="dateOfLoss"
            value={formData.dateOfLoss}
            onChange={handleChange}
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
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                image: e.target.files[0],
              }))
            }
            accept="image/*"
            className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 file:bg-green-600 file:border-0 file:text-white file:px-4 file:py-2 file:rounded file:cursor-pointer"
          />
        </div>

        {/* REWARD AMOUNT */}
        <div>
          <label className="block text-sm font-semibold text-green-900 mb-2">
            Reward Amount (RWF)
          </label>
          <input
            type="number"
            name="rewardAmount"
            value={formData.rewardAmount}
            onChange={handleChange}
            placeholder="e.g., 50000"
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
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            placeholder="e.g., +250788123456"
            className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-green-400"
            required
          />
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition shadow-lg"
          >
            Post Item
          </button>
          <button
            type="reset"
            className="bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-500 transition"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
