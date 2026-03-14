import { useState } from 'react';
import { FiUploadCloud, FiFile, FiSearch, FiCheckCircle, FiAlertCircle, FiLoader, FiX, FiFileText, FiImage, FiUser, FiPhone, FiMail, FiCalendar, FiExternalLink, FiMapPin, FiTag, FiDollarSign, FiCreditCard, FiInfo, FiBox, FiShield } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const BACKEND_URL = API_URL.replace(/\/api\/?$/, '');

export default function DocumentUpload() {
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
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/documents/upload-document`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setResult(data.data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
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
    if (!file) return <FiFile className="w-8 h-8" />;
    if (file.type === 'application/pdf') return <FiFileText className="w-8 h-8 text-red-500" />;
    return <FiImage className="w-8 h-8 text-blue-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1e3a8a] via-[#2d4990] to-[#3b5998] text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00djJoLTJ2LTJoMnptLTQgOHYyaC0ydi0yaDJ6bTQgMHYyaC0ydi0yaDJ6bS00LTR2MmgtMnYtMmgyek0yMCAzNHYyaC0ydi0yaDJ6bTAtNHYyaC0ydi0yaDJ6bS00IDh2MmgtMnYtMmgyek0yMCA0MnYyaC0ydi0yaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="max-w-5xl mx-auto px-6 py-16 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
              <FiSearch className="w-6 h-6" />
            </div>
            <span className="text-blue-200 text-sm font-medium tracking-wider uppercase">Document Scanner</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Upload & Match<br />
            <span className="text-blue-200">Documents</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl leading-relaxed">
            Upload any document — images (JPG, PNG) or PDFs — and our OCR engine will extract the text
            automatically and find matching documents already in the system.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-8 relative z-20 pb-16">
        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiUploadCloud className="text-[#2d4990]" />
            Upload Document
          </h2>

          {/* Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 cursor-pointer
              ${dragActive
                ? 'border-[#2d4990] bg-blue-50 scale-[1.01]'
                : file
                  ? 'border-green-300 bg-green-50/50'
                  : 'border-gray-200 bg-gray-50/50 hover:border-[#2d4990]/50 hover:bg-blue-50/30'
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
                <div className="w-14 h-14 rounded-xl bg-white shadow-md flex items-center justify-center">
                  {getFileIcon()}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-800 text-lg">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB · {file.type || 'unknown'}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); clearFile(); }}
                  className="ml-4 p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2d4990] to-[#1e3a8a] text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/20">
                  <FiUploadCloud className="w-8 h-8" />
                </div>
                <p className="text-gray-700 font-medium text-lg mb-1">
                  Drag & drop your document here
                </p>
                <p className="text-gray-400 text-sm">
                  or click to browse · JPG, PNG, PDF accepted · Max 10 MB
                </p>
              </>
            )}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`mt-6 w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3
              ${!file || loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#2d4990] to-[#1e3a8a] text-white hover:shadow-lg hover:shadow-blue-900/20 hover:-translate-y-0.5 active:translate-y-0'
              }`}
          >
            {loading ? (
              <>
                <FiLoader className="w-5 h-5 animate-spin" />
                Extracting text & finding matches…
              </>
            ) : (
              <>
                <FiSearch className="w-5 h-5" />
                Extract Text & Find Matches
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-8 animate-fadeIn">
            {/* Matches */}
            <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FiSearch className="text-[#2d4990]" />
                    Matching Documents
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {result.matches.length > 0
                      ? `Found ${result.matches.length} document(s) with similar text content. Click a card to see full details.`
                      : 'No matching documents found in the system yet.'}
                  </p>
                </div>
                {result.extractedText && (
                  <button
                    onClick={() => setShowExtractedText(!showExtractedText)}
                    className="text-sm font-semibold text-[#2d4990] hover:text-[#1e3a8a] flex items-center gap-1 transition"
                  >
                    {showExtractedText ? 'Hide Extracted Text' : 'View Extracted Text'}
                  </button>
                )}
              </div>

              {/* Collapsible Extracted Text for Power Users */}
              {showExtractedText && (
                <div className="mb-8 animate-fadeIn">
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-100 relative group">
                    <pre className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed font-mono">
                      {result.extractedText}
                    </pre>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-400 font-medium">
                    <span className="flex items-center gap-1 uppercase tracking-wider">📄 Source: {result.document.file_name}</span>
                    <span className="flex items-center gap-1 uppercase tracking-wider">🆔 Reference ID: {result.document.id}</span>
                  </div>
                </div>
              )}

              {result.matches.length === 0 ? (
                <div className="text-center py-12 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <FiFile className="w-7 h-7 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No matches yet</p>
                  <p className="text-gray-400 text-sm mt-1">Upload more documents to see matches appear</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {result.matches.map((match, idx) => (
                    <button
                      key={match.id}
                      onClick={() => setSelectedMatch(match)}
                      className="group text-left bg-gradient-to-br from-white to-slate-50 rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-blue-900/10 hover:border-[#2d4990]/30 transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Match document image thumb */}
                      {match.file_url && (
                        <div className="relative w-full h-40 bg-gray-100 overflow-hidden">
                          {match.file_name?.toLowerCase().endsWith('.pdf') ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 group-hover:bg-red-100 transition">
                              <FiFileText className="w-10 h-10 text-red-400 mb-1" />
                              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">PDF Document</p>
                            </div>
                          ) : (
                            <img
                              src={`${BACKEND_URL}${match.file_url}`}
                              alt={match.file_name}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-[#1e3a8a] text-[10px] px-2 py-1 rounded-md font-black shadow-sm uppercase tracking-tighter">
                            Match Rank: {(match.similarity_rank * 100).toFixed(0)}%
                          </div>
                        </div>
                      )}

                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-gray-800 text-base leading-tight group-hover:text-[#2d4990] transition truncate max-w-[70%]">
                            {match.file_name}
                          </h3>
                          <span className="flex items-center gap-1 text-[10px] h-fit bg-blue-50 text-[#2d4990] px-2 py-1 rounded font-bold uppercase tracking-widest">
                            <FiCalendar className="w-3 h-3" />
                            {new Date(match.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 italic">
                          "{match.text.substring(0, 100)}..."
                        </p>
                        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                           <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-[#2d4990] font-bold">
                               {match.uploader_name?.[0] || 'U'}
                             </div>
                             <span className="text-[10px] font-bold text-gray-400 hover:text-gray-600 transition truncate max-w-[80px]">
                               {match.uploader_name || 'Anonymous User'}
                             </span>
                           </div>
                           <span className="text-[#2d4990] text-[10px] font-black uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                             View Details <FiExternalLink className="w-3 h-3" />
                           </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Match Detail Modal */}
            {selectedMatch && (
              <div
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
                onClick={() => setSelectedMatch(null)}
              >
                <div
                  className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-y-auto relative animate-scaleIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setSelectedMatch(null)}
                    className="absolute top-6 right-6 z-10 p-2 bg-white/80 hover:bg-white rounded-full text-slate-400 hover:text-slate-900 shadow-lg transition-all"
                  >
                    <FiX className="w-6 h-6" />
                  </button>

                  <div className="grid md:grid-cols-2">
                    {/* Modal Left: Image/File */}
                    <div className="bg-slate-50 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-100">
                       {selectedMatch.file_url && (
                         <div className="w-full">
                           {selectedMatch.file_name?.toLowerCase().endsWith('.pdf') ? (
                             <div className="w-full aspect-[3/4] rounded-2xl bg-white shadow-xl border border-slate-200 flex flex-col items-center justify-center p-8">
                               <FiFileText className="w-24 h-24 text-red-500 mb-4" />
                               <h4 className="text-xl font-bold text-slate-800 text-center">{selectedMatch.file_name}</h4>
                               <p className="text-slate-500 mt-2">Portable Document Format</p>
                               <a
                                 href={`${BACKEND_URL}${selectedMatch.file_url}`}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="mt-8 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition flex items-center gap-2"
                               >
                                 Open PDF <FiExternalLink />
                               </a>
                             </div>
                           ) : (
                             <img
                               src={`${BACKEND_URL}${selectedMatch.file_url}`}
                               alt={selectedMatch.file_name}
                               className="w-full rounded-2xl shadow-2xl border-4 border-white object-contain bg-white"
                             />
                           )}
                         </div>
                       )}
                    </div>

                    {/* Modal Right: Details */}
                    <div className="p-8 md:p-12 space-y-8">
                       <div>
                         <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-black bg-blue-50 text-[#2d4990] uppercase tracking-widest border border-blue-100 mb-4">
                           Match Confidence: {(selectedMatch.similarity_rank * 100).toFixed(0)}%
                         </span>
                         <h2 className="text-3xl font-black text-slate-900 leading-tight">
                           {selectedMatch.file_name}
                         </h2>
                         <p className="text-slate-400 text-sm mt-2 flex items-center gap-2">
                            <FiCalendar /> Posted on {new Date(selectedMatch.created_at).toLocaleDateString('en-US', { dateStyle: 'long' })}
                         </p>
                       </div>

                        {/* Item Details (Category, Location, Reward) */}
                        <div className="grid grid-cols-2 gap-4">
                          {selectedMatch.category && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                                <FiTag /> Category
                              </p>
                              <p className="text-sm font-bold text-slate-800 capitalize">{selectedMatch.category.replace('_', ' ')}</p>
                            </div>
                          )}
                          {(selectedMatch.location || selectedMatch.district) && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                                <FiMapPin /> Location
                              </p>
                              <p className="text-sm font-bold text-slate-800 truncate">
                                {selectedMatch.location || selectedMatch.district}
                                {selectedMatch.location && selectedMatch.district && `, ${selectedMatch.district}`}
                              </p>
                            </div>
                          )}
                          {selectedMatch.reward_amount > 0 && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1 text-emerald-600">
                                <FiDollarSign /> Reward
                              </p>
                              <p className="text-sm font-black text-emerald-600">
                                {Number(selectedMatch.reward_amount).toLocaleString()} RWF
                              </p>
                            </div>
                          )}
                          {selectedMatch.source && selectedMatch.source !== 'document' && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1 text-blue-600">
                                <FiInfo /> Source
                              </p>
                              <div className="flex items-center gap-1">
                                <span className={`w-2 h-2 rounded-full ${selectedMatch.source === 'lost' ? 'bg-red-500' : 'bg-green-500'}`} />
                                <p className="text-sm font-bold text-slate-800 capitalize">{selectedMatch.source} Item Post</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Document specific details from post */}
                        {(selectedMatch.holder_name || selectedMatch.id_number) && (
                          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-4">
                            <h4 className="text-xs font-black text-[#2d4990] uppercase tracking-widest flex items-center gap-2">
                              <FiCreditCard /> Document Information
                            </h4>
                            <div className="grid gap-3">
                              {selectedMatch.holder_name && (
                                <div className="flex justify-between items-center text-sm border-b border-blue-100 pb-2">
                                  <span className="text-slate-500">Name on Document</span>
                                  <span className="font-bold text-slate-800">{selectedMatch.holder_name}</span>
                                </div>
                              )}
                              {selectedMatch.id_number && (
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-slate-500">ID / Serial Number</span>
                                  <span className="font-bold text-slate-800 font-mono tracking-wider">{selectedMatch.id_number}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                       <div className="space-y-4">
                         <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Uploader Details</h4>
                         <div className="grid gap-3">
                           <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                             <div className="w-10 h-10 rounded-full bg-[#2d4990] text-white flex items-center justify-center font-bold">
                               <FiUser />
                             </div>
                             <div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Legal Name</p>
                               <p className="text-sm font-bold text-slate-800">{selectedMatch.uploader_name || 'Not provided'}</p>
                             </div>
                           </div>

                           <div className="grid grid-cols-2 gap-3">
                             <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                               <div className="w-10 h-10 flex-shrink-0 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                                 <FiPhone />
                               </div>
                               <div className="min-w-0">
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Phone</p>
                                 <p className="text-xs font-bold text-slate-800 truncate">{selectedMatch.uploader_phone || 'None'}</p>
                               </div>
                             </div>
                             <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                               <div className="w-10 h-10 flex-shrink-0 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                                 <FiMail />
                               </div>
                               <div className="min-w-0">
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Email</p>
                                 <p className="text-xs font-bold text-slate-800 truncate">{selectedMatch.uploader_email || 'Hidden'}</p>
                               </div>
                             </div>
                           </div>
                         </div>
                       </div>

                       <div className="space-y-4 pt-4 border-t border-slate-100">
                         <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Extracted Content OCR</h4>
                         <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                           <p className="text-slate-700 text-sm leading-relaxed font-medium font-serif">
                             {selectedMatch.text}
                           </p>
                         </div>
                       </div>

                       <div className="pt-6">
                         <button
                           onClick={() => window.location.href = `tel:${selectedMatch.uploader_phone}`}
                           className="w-full py-4 bg-gradient-to-r from-[#2d4990] to-[#1e3a8a] text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 hover:-translate-y-1 transition duration-300 active:translate-y-0"
                         >
                           Contact Person Directly
                         </button>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
