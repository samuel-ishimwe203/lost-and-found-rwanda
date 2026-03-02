import React, { useState } from "react";
import apiClient from "../../services/api";

export default function PostOfficialDocument() {
  const [formData, setFormData] = useState({
    documentType: "",
    itemName: "",
    itemDescription: "",
    dateFound: "",
    district: "",
    location: "",
    officerName: "",
    badge: "",
    notes: "",
    image: null,
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const documentTypes = [
    "National ID Card", "Passport", "Driving License", 
    "Birth Certificate", "ATM Card", "Other Document",
  ];

  const districts = [
    "Kigali", "Nyarugenge", "Gasabo", "Kicukiro", 
    "Rubavu", "Rusizi", "Huye", "Musanze"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const submitData = new FormData();
      submitData.append("item_type", formData.itemName);
      submitData.append("category", formData.documentType);
      submitData.append("description", formData.itemDescription);
      submitData.append("date_found", formData.dateFound);
      submitData.append("location_found", formData.location);
      submitData.append("district", formData.district); // Added district (Required by backend)
      
      const additionalInfo = {
        officerName: formData.officerName,
        badge: formData.badge,
        notes: formData.notes
      };
      submitData.append("additional_info", JSON.stringify(additionalInfo));

      if (formData.image) {
        submitData.append("image", formData.image);
      }

      const response = await apiClient.post("/police/documents", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setSubmitted(true);
        setTimeout(() => {
          setFormData({
            documentType: "", itemName: "", itemDescription: "",
            dateFound: "", district: "", location: "",
            officerName: "", badge: "", notes: "", image: null,
          });
          setImagePreview(null);
          setSubmitted(false);
        }, 3500);
      }
    } catch (err) {
      console.error("Upload official document error:", err);
      setError(err.response?.data?.message || "Failed to upload official document.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center shadow-lg">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">Document Uploaded Successfully!</h2>
          <p className="text-green-700">
            The document has been securely added. AI detection & match analysis is now running in the background.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-yellow-100 p-4 min-h-screen">
      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-bold text-green-900">Upload Official Item</h1>
        <p className="text-green-700 mt-2">
          Report items found at police stations or during official operations
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 text-red-700 font-semibold shadow-sm">
          {error}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6 border border-green-200">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Document Type *</label>
            <select name="documentType" value={formData.documentType} onChange={handleChange} required className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 transition">
              <option value="">Select a document type</option>
              {documentTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Item Name *</label>
            <input type="text" name="itemName" value={formData.itemName} onChange={handleChange} placeholder="e.g., Red National ID Card" required className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 transition" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Item Description *</label>
          <textarea name="itemDescription" value={formData.itemDescription} onChange={handleChange} placeholder="Provide detailed description of the item" required rows={4} className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 transition resize-none" />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date Found *</label>
            <input type="date" name="dateFound" value={formData.dateFound} onChange={handleChange} required className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 transition" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">District *</label>
            <select name="district" value={formData.district} onChange={handleChange} required className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 transition">
              <option value="">Select District</option>
              {districts.map((dist) => (<option key={dist} value={dist}>{dist}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Location Found *</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Police station location" required className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 transition" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Officer Name *</label>
            <input type="text" name="officerName" value={formData.officerName} onChange={handleChange} placeholder="Full name" required className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 transition" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Badge Number *</label>
            <input type="text" name="badge" value={formData.badge} onChange={handleChange} placeholder="Officer badge number" required className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 transition" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes (Optional)</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Any additional information..." rows={3} className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 transition resize-none" />
        </div>

        {/* IMAGE UPLOAD */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Photo for AI Match (Optional)</label>
          <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center hover:border-green-600 transition cursor-pointer">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="imageUpload" />
            <label htmlFor="imageUpload" className="cursor-pointer flex flex-col items-center">
              {imagePreview ? (
                <div className="space-y-2">
                  <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg mx-auto" />
                  <span className="text-sm text-green-600 font-semibold">{formData.image.name}</span>
                </div>
              ) : (
                <>
                  <span className="text-3xl mb-2">📷</span>
                  <span className="text-sm text-green-600 font-semibold">Click to upload photo for AI detection</span>
                </>
              )}
            </label>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4 pt-6">
          <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-50">
            {loading ? "Processing AI & Uploading..." : "Submit Official Document"}
          </button>
        </div>
      </form>
    </div>
  );
}