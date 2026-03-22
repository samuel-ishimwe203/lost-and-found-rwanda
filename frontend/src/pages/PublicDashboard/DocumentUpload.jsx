import { useState } from 'react';
import {
  FiUploadCloud, FiFile, FiSearch, FiCheckCircle, FiAlertCircle,
  FiLoader, FiX, FiFileText, FiImage, FiUser, FiPhone, FiMail,
  FiCalendar, FiExternalLink, FiMapPin, FiTag, FiDollarSign,
  FiCreditCard, FiShield
} from 'react-icons/fi';
import { getImageUrl } from '../../utils/imageHelper';
import { useLanguage } from "../../context/LanguageContext";

export default function DocumentUpload() {
  const { t } = useLanguage();
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showExtractedText, setShowExtractedText] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResult(null);
      setError('');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('document', file);
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/documents/upload-document`, {
        method: 'POST',
        headers,
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t("messages.operationFailed"));
      setResult(data.data);
    } catch (err) {
      setError(err.message || t("messages.operationFailed"));
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setResult(null);
    setError('');
  };

  const getFileIcon = () => {
    if (!file) return <FiFile className="w-6 h-6" />;
    if (file.type === 'application/pdf') return <FiFileText className="w-6 h-6 text-red-500" />;
    return <FiImage className="w-6 h-6 text-blue-500" />;
  };

  return (
    <div className="max-w-3xl mx-auto px-5 py-8 pb-20">

      {/* Compact Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-[#108643] flex items-center justify-center shadow-md">
            <FiSearch className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-[#108643] rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
            {t("scanner.subtitle")}
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t("scanner.title")}</h1>
        <p className="text-slate-400 text-sm font-medium mt-1 max-w-lg leading-relaxed">
          {t("scanner.description")}
        </p>
      </div>

      {/* Upload Card */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 mb-6">
        <h2 className="text-xs font-black text-slate-500 mb-4 flex items-center gap-2 uppercase tracking-wider">
          <FiUploadCloud className="text-[#108643]" />
          {t("scanner.uploadButton")}
        </h2>

        {/* Drop Zone */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer
            ${dragActive
              ? 'border-[#108643] bg-green-50'
              : file
                ? 'border-emerald-300 bg-emerald-50/40'
                : 'border-slate-200 bg-slate-50 hover:border-[#108643]/40 hover:bg-emerald-50/20'
            }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !file && document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/bmp,image/tiff,image/webp,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          {file ? (
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center">
                {getFileIcon()}
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="font-black text-slate-900 text-sm tracking-tight truncate">{file.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB · {file.type || 'unknown'}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                className="p-2 rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="w-12 h-12 rounded-xl bg-[#108643] text-white flex items-center justify-center mx-auto shadow-lg">
                <FiUploadCloud className="w-6 h-6" />
              </div>
              <p className="text-slate-700 font-black text-sm tracking-tight">{t("scanner.dropZone")}</p>
              <p className="text-slate-400 text-xs font-medium">{t("scanner.dropZoneHint")}</p>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className={`mt-4 w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2
            ${!file || loading
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-900 text-white hover:bg-[#108643] shadow-md hover:shadow-lg active:scale-[0.99]'
            }`}
        >
          {loading ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin" />
              {t("scanner.analyzing")}
            </>
          ) : (
            <>
              <FiSearch className="w-4 h-4" />
              {t("scanner.analyzeButton")}
            </>
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-3">
            <FiAlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-5">
          {/* Matches Card */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2 tracking-tight">
                  <FiCheckCircle className="text-[#108643]" />
                  {t("scanner.results")}
                </h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                  {result.matches.length > 0
                    ? `${t("common.success")}: ${result.matches.length} hits`
                    : t("scanner.noResults")}
                </p>
              </div>
              {result.extractedText && (
                <button
                  onClick={() => setShowExtractedText(!showExtractedText)}
                  className="px-4 py-2 bg-slate-50 hover:bg-[#108643] hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all border border-slate-100"
                >
                  {showExtractedText ? t("scanner.hideText") : t("scanner.rawText")}
                </button>
              )}
            </div>

            {showExtractedText && result.extractedText && (
              <div className="mb-5 bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t("scanner.extractedText")}</p>
                <p className="text-slate-700 text-sm leading-relaxed font-medium italic">"{result.extractedText}"</p>
              </div>
            )}

            {result.matches.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FiSearch className="w-7 h-7 text-slate-200" />
                </div>
                <p className="text-slate-700 font-black text-base mb-1">{t("scanner.noResults")}</p>
                <p className="text-slate-400 text-sm font-medium">
                  {t("scanner.noResultsDesc")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {result.matches.map((match, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedMatch(match)}
                    className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-[#108643] hover:bg-emerald-50/30 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-black text-slate-900 text-sm tracking-tight group-hover:text-[#108643] transition-colors truncate">
                        {match.file_name}
                      </h3>
                      <span className="text-[9px] font-black bg-emerald-50 text-[#108643] px-2.5 py-1 rounded-full border border-emerald-100 flex-shrink-0 whitespace-nowrap">
                        {new Date(match.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                      {match.text?.substring(0, 100)}...
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center text-[9px] text-white font-black">
                          {match.uploader_name?.[0] || 'U'}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400">
                          {match.uploader_name || 'Unknown'}
                        </p>
                      </div>
                      <FiExternalLink className="text-slate-300 group-hover:text-[#108643] transition-colors w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Match Detail Modal */}
      {selectedMatch && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
          onClick={() => setSelectedMatch(null)}
        >
          <div
            className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMatch(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
            >
              <FiX className="w-4 h-4" />
            </button>

            <div className="p-6 border-b border-slate-100">
              <span className="px-3 py-1 bg-emerald-50 text-[#108643] rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 inline-block mb-3">
                {t("scanner.matchDetail")}
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{selectedMatch.file_name}</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Grid info */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <FiTag />, label: t("items.category"), value: selectedMatch.category?.replace('_', ' ') || 'Record' },
                  { icon: <FiMapPin />, label: t("items.location"), value: selectedMatch.location || selectedMatch.district || 'Unknown' },
                  { icon: <FiDollarSign />, label: 'Reward', value: selectedMatch.reward_amount ? `${Number(selectedMatch.reward_amount).toLocaleString()} RWF` : 'No reward' },
                  { icon: <FiCalendar />, label: t("items.date"), value: new Date(selectedMatch.created_at).toLocaleDateString() },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                      {item.icon} {item.label}
                    </p>
                    <p className="text-sm font-black text-slate-900 uppercase truncate">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Extracted text */}
              {selectedMatch.text && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-[10px] font-black text-[#108643] uppercase tracking-widest mb-2">{t("scanner.extractedText")}</p>
                  <p className="text-slate-600 text-sm leading-relaxed italic">"{selectedMatch.text}"</p>
                </div>
              )}

              {/* Uploader info */}
              <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t("scanner.postedBy")}</p>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#108643] text-white flex items-center justify-center font-black shadow-md">
                    {selectedMatch.uploader_name?.[0] || 'U'}
                  </div>
                  <p className="font-black text-slate-900">{selectedMatch.uploader_name || 'Unknown'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {selectedMatch.uploader_phone && (
                    <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <FiPhone className="text-[#108643] w-4 h-4" />
                      <p className="text-xs font-black text-slate-700">{selectedMatch.uploader_phone}</p>
                    </div>
                  )}
                  {selectedMatch.uploader_email && (
                    <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <FiMail className="text-slate-400 w-4 h-4" />
                      <p className="text-xs font-black text-slate-700 truncate">{selectedMatch.uploader_email}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact button */}
              {selectedMatch.uploader_phone && (
                <button
                  onClick={() => window.location.href = `tel:${selectedMatch.uploader_phone}`}
                  className="w-full py-4 bg-slate-900 hover:bg-[#108643] text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <FiPhone className="w-4 h-4" />
                  {t("scanner.contactOwner")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
