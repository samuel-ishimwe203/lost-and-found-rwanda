import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Search as SearchIcon, MapPin, Grid, Info } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function SearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [filters, setFilters] = useState({
    title: "",
    category: "",
    district: "",
  });

  if (!isOpen) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (filters.title) queryParams.append("title", filters.title);
    if (filters.category) queryParams.append("category", filters.category);
    if (filters.district) queryParams.append("city", filters.district);

    onClose();
    navigate(`/postings?${queryParams.toString()}`);
  };

  const categories = [
    "Electronics", "Documents", "Keys", "Wallets", "National ID", 
    "Passport", "Driving License", "ATM Card", "Other"
  ];

  const districts = [
    "Kigali", "Nyarugenge", "Gasabo", "Kicukiro", "Rubavu", 
    "Rusizi", "Huye", "Musanze", "Nyagatare", "Kayonza", "Gicumbi"
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* OVERLAY */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* MODAL CONTENT */}
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden transform transition-all animate-in zoom-in duration-300">
        {/* HEADER GRADIENT */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-8 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <SearchIcon className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              {t('search.searchItems')}
            </h2>
          </div>
          <p className="text-green-50/80 text-sm font-medium">
            {t('search.searchPlaceholder')}
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSearch} className="p-8 space-y-6">
          {/* TITLE INPUT */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
              {t('items.title')}
            </label>
            <div className="relative group">
              <Info className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-green-600 transition-colors" />
              <input
                type="text"
                placeholder={t('search.searchPlaceholder')}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400"
                value={filters.title}
                onChange={(e) => setFilters({ ...filters, title: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CATEGORY SELECT */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                {t('items.category')}
              </label>
              <div className="relative group">
                <Grid className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-green-600 transition-colors pointer-events-none" />
                <select
                  className="w-full pl-12 pr-10 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-slate-800 font-medium appearance-none"
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                  <option value="">{t('items.allCategories')}</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{t(`categories.${cat.toLowerCase().replace(' ', '_')}`) || cat}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none font-bold text-slate-400">⌄</div>
              </div>
            </div>

            {/* DISTRICT SELECT */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                {t('items.location')}
              </label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-green-600 transition-colors pointer-events-none" />
                <select
                  className="w-full pl-12 pr-10 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-slate-800 font-medium appearance-none"
                  value={filters.district}
                  onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                >
                  <option value="">{t('items.location')}</option>
                  {districts.map(dist => (
                    <option key={dist} value={dist}>{t(`districts.${dist.toLowerCase()}`) || dist}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none font-bold text-slate-400">⌄</div>
              </div>
            </div>
          </div>

          {/* SEARCH BUTTON */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-green-200 hover:shadow-green-300 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg mt-4"
          >
            <SearchIcon className="w-6 h-6" />
            {t('common.search')}
          </button>
        </form>
      </div>
    </div>
  );
}
