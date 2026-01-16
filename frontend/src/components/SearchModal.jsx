import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    title: "",
    category: "",
    country: "Rwanda",
    city: "",
  });

  if (!isOpen) return null;

  const handleSearch = () => {
    const params = new URLSearchParams(filters).toString();
    onClose();
    navigate(`/postings?${params}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div
        className="w-full max-w-md rounded-xl p-8 relative text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1520975698519-59c8d06c97bb')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center mb-6">
          Search for everyday lost items or pets here :
        </h2>

        <div className="space-y-4">
          <input
            placeholder="Optional: Title of what you're looking for"
            className="w-full px-4 py-3 rounded text-black"
            value={filters.title}
            onChange={(e) =>
              setFilters({ ...filters, title: e.target.value })
            }
          />

          <select
            className="w-full px-4 py-3 rounded text-black"
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
          >
            <option value="">Categories</option>
            <option>National ID</option>
            <option>Passport</option>
            <option>Driving License</option>
            <option>ATM Card</option>
          </select>

          <select
            className="w-full px-4 py-3 rounded text-black"
            value={filters.country}
            onChange={(e) =>
              setFilters({ ...filters, country: e.target.value })
            }
          >
            <option>Rwanda</option>
          </select>

          <select
            className="w-full px-4 py-3 rounded text-black"
            value={filters.city}
            onChange={(e) =>
              setFilters({ ...filters, city: e.target.value })
            }
          >
            <option value="">Cities</option>
            <option>Kigali</option>
            <option>Huye</option>
            <option>Musanze</option>
            <option>Rubavu</option>
            <option>Nyagatare</option>
          </select>

          <button
            onClick={handleSearch}
            className="w-full bg-orange-500 py-3 rounded font-semibold hover:bg-orange-600"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
