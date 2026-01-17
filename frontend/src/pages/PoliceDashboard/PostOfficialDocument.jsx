import React, { useState } from "react";

export default function PostOfficialDocument() {
  console.log('PostOfficialDocument rendered');
  
  const [formData, setFormData] = useState({
    documentType: "",
    itemName: "",
    itemDescription: "",
    dateFound: "",
    location: "",
    officerName: "",
    badge: "",
    notes: "",
    image: null,
  });

  const [submitted, setSubmitted] = useState(false);

  const documentTypes = [
    "National ID Card",
    "Passport",
    "Driving License",
    "Birth Certificate",
    "ATM Card",
    "Other Document",
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
    setFormData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Official document submitted:", formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({
        documentType: "",
        itemName: "",
        itemDescription: "",
        dateFound: "",
        location: "",
        officerName: "",
        badge: "",
        notes: "",
        image: null,
      });
      setSubmitted(false);
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">Document Submitted Successfully!</h2>
          <p className="text-green-700">
            The official document has been uploaded to the system and is now available for matching.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-yellow-100 p-4 min-h-screen">
      <div className="bg-red-500 text-white p-4 text-2xl font-bold">
        POST OFFICIAL DOCUMENT PAGE - YOU SHOULD SEE THIS!
      </div>
      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-bold text-green-900">Upload Official Item</h1>
        <p className="text-green-700 mt-2">
          Report items found at police stations or during official operations
        </p>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6 border border-green-200">
        {/* DOCUMENT TYPE */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Document Type *
          </label>
          <select
            name="documentType"
            value={formData.documentType}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 transition"
          >
            <option value="">Select a document type</option>
            {documentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* ITEM NAME */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Item Name *
          </label>
          <input
            type="text"
            name="itemName"
            value={formData.itemName}
            onChange={handleChange}
            placeholder="e.g., Red National ID Card"
            required
            className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 transition"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Item Description *
          </label>
          <textarea
            name="itemDescription"
            value={formData.itemDescription}
            onChange={handleChange}
            placeholder="Provide detailed description of the item"
            required
            rows={4}
            className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 transition resize-none"
          />
        </div>

        {/* DATE AND LOCATION */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date Found *
            </label>
            <input
              type="date"
              name="dateFound"
              value={formData.dateFound}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location Found *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Police station location"
              required
              className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 transition"
            />
          </div>
        </div>

        {/* OFFICER DETAILS */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Officer Name *
            </label>
            <input
              type="text"
              name="officerName"
              value={formData.officerName}
              onChange={handleChange}
              placeholder="Full name"
              required
              className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Badge Number *
            </label>
            <input
              type="text"
              name="badge"
              value={formData.badge}
              onChange={handleChange}
              placeholder="Officer badge number"
              required
              className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 transition"
            />
          </div>
        </div>

        {/* NOTES */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any additional information..."
            rows={3}
            className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 transition resize-none"
          />
        </div>

        {/* IMAGE UPLOAD */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Upload Photo (Optional)
          </label>
          <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center hover:border-green-600 transition cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="imageUpload"
            />
            <label htmlFor="imageUpload" className="cursor-pointer flex flex-col items-center">
              <span className="text-3xl mb-2">📷</span>
              <span className="text-sm text-green-600 font-semibold">
                {formData.image ? formData.image.name : "Click to upload photo"}
              </span>
            </label>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-lg transition shadow-lg"
          >
            Submit Official Document
          </button>
          <button
            type="reset"
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-3 rounded-lg transition"
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
}
