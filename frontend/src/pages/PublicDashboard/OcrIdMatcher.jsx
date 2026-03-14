import React, { useState } from "react";

const OcrIdMatcher = () => {
  const [mode, setMode] = useState("lost");
  const [file, setFile] = useState(null);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!file) {
      setError("Please select an ID image to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    if (location) formData.append("location", location);

    const token = localStorage.getItem("token");

    try {
      setLoading(true);
      const endpoint =
        mode === "lost"
          ? "/api/report-lost"
          : "/api/report-found";

      const response = await fetch(
        import.meta.env.VITE_API_URL
          ? import.meta.env.VITE_API_URL.replace(/\/$/, "") + endpoint
          : "http://localhost:3001" + endpoint,
        {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to process image");
      }

      setResult(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">
        OCR ID Matcher
      </h1>
      <p className="text-gray-600 mb-6">
        Upload a clear image of a National ID card. The system will extract the name and ID number,
        then search for possible matches.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-lg p-6 space-y-4"
      >
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setMode("lost")}
            className={`px-4 py-2 rounded border ${
              mode === "lost"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            Report Lost ID
          </button>
          <button
            type="button"
            onClick={() => setMode("found")}
            className={`px-4 py-2 rounded border ${
              mode === "found"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            Report Found ID
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Location (optional)
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder={
              mode === "lost"
                ? "Where was the ID lost?"
                : "Where was the ID found?"
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            ID Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
        >
          {loading ? "Processing..." : "Upload & Match"}
        </button>
      </form>

      {result && (
        <div className="mt-8 space-y-4">
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">
              Extracted Information
            </h2>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Name:</span>{" "}
              {result.name || "Not detected"}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">ID Number:</span>{" "}
              {result.idNumber || "Not detected"}
            </p>
            <details className="mt-2">
              <summary className="text-sm text-gray-500 cursor-pointer">
                Show raw OCR text
              </summary>
              <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                {result.extractedText}
              </pre>
            </details>
          </div>

          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">
              Possible Matches
            </h2>
            {result.matches && result.matches.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {result.matches.map((m, idx) => (
                  <div
                    key={idx}
                    className="border rounded p-3 flex flex-col space-y-1"
                  >
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">
                        Similarity:
                      </span>{" "}
                      {m.match?.similarity_score ?? m.match?.match_score ?? 0}
                      %
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">
                        Holder Name:
                      </span>{" "}
                      {m.otherItem?.holder_name || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">
                        ID Number:
                      </span>{" "}
                      {m.otherItem?.id_number || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Item ID: {m.otherItem?.id}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                No potential matches found yet.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OcrIdMatcher;


