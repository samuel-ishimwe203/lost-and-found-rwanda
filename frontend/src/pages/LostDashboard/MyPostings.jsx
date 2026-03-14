import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/api";
import { FiEye, FiEdit2, FiTrash2, FiMapPin, FiCalendar, FiTag, FiClock, FiDollarSign } from "react-icons/fi";

export default function MyPostings() {
  const navigate = useNavigate();
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchPostings();
  }, []);

  const fetchPostings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.get('/lost-items/my/items');
      const items = response.data.data?.lostItems || [];
      setPostings(items);
    } catch (error) {
      console.error('Error fetching postings:', error);
      setError(error.response?.data?.message || 'Failed to load postings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this posting?')) {
      return;
    }
    
    try {
      await apiClient.delete(`/lost-items/${id}`);
      setPostings(postings.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting posting:', error);
      alert(error.response?.data?.message || 'Failed to delete posting');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatReward = (amount) => {
    if (!amount || amount === 0) return 'No reward';
    return `${Number(amount).toLocaleString()} RWF`;
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'active': 'Active',
      'pending': 'Pending',
      'found': 'Found',
      'returned': 'Resolved',
      'expired': 'Expired'
    };
    return statusMap[status?.toLowerCase()] || status;
  };

  const getLocationDisplay = (item) => {
    return `${item.location_lost}${item.district ? ' - ' + item.district : ''}`;
  };

  const getAdditionalInfo = (item) => {
    try {
      return item.additional_info ? JSON.parse(item.additional_info) : {};
    } catch {
      return {};
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-green-700 mt-4">Loading your postings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl font-black text-green-900 leading-tight">My Postings</h1>
        <p className="text-green-700 mt-2 font-medium text-sm md:text-base opacity-80">
          View and manage all your lost item postings ({postings.length} total)
        </p>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* EMPTY STATE */}
      {postings.length === 0 && !loading && (
        <div className="bg-white rounded-2xl md:rounded-[32px] shadow-xl p-8 md:p-16 text-center border border-green-100 relative overflow-hidden">
          <div className="text-5xl md:text-6xl mb-6">📋</div>
          <h3 className="text-xl md:text-2xl font-black text-green-900 mb-2">No Postings Yet</h3>
          <p className="text-green-700 mb-8 max-w-sm mx-auto opacity-70">You haven't posted any lost items yet. Let's get started!</p>
          <a
            href="/lost-dashboard/create-post"
            className="inline-block bg-green-600 text-white px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-sm shadow-xl hover:bg-green-700 transition-all hover:translate-y-[-2px]"
          >
            Create Your First Posting
          </a>
        </div>
      )}

      {/* MOBILE CARDS - visible only on mobile */}
      <div className="md:hidden space-y-4">
        {postings.map((posting) => (
          <div key={posting.id} className="bg-white p-5 rounded-2xl shadow-md border border-green-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-black text-green-900 uppercase tracking-tight">{posting.item_type}</h3>
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mt-1">{posting.category}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                posting.status === "active" ? "bg-green-100 text-green-700 border border-green-200" :
                posting.status === "pending" ? "bg-yellow-100 text-yellow-700 border border-yellow-200" :
                "bg-gray-100 text-gray-700 border border-gray-200"
              }`}>
                {getStatusLabel(posting.status)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-5 text-xs text-green-700">
              <div className="flex items-center gap-2">
                <FiMapPin className="shrink-0" />
                <span className="truncate">{posting.district || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiClock className="shrink-0" />
                <span>{formatDate(posting.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiDollarSign className="shrink-0" />
                <span className="font-bold">{formatReward(posting.reward_amount)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center font-black text-[9px] border border-cyan-200">
                  {posting.match_count || 0}
                </div>
                <span>Matches</span>
              </div>
            </div>

            <div className="flex gap-2 border-t border-green-50 pt-4 mt-2">
              <button onClick={() => navigate(`/lost-dashboard/postings/${posting.id}`)} className="flex-1 py-2.5 bg-green-50 text-green-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                <FiEye /> View
              </button>
              <button onClick={() => navigate(`/lost-dashboard/edit-post/${posting.id}`)} className="flex-1 py-2.5 bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                <FiEdit2 /> Edit
              </button>
              <button onClick={() => handleDelete(posting.id)} className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-xs">
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP TABLE - hidden on mobile */}
      {postings.length > 0 && (
        <div className="hidden md:block bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 border-b border-green-800">
                <th className="px-6 py-4 text-[10px] font-black text-green-400 uppercase tracking-[2px]">Item Posting</th>
                <th className="px-6 py-4 text-[10px] font-black text-green-400 uppercase tracking-[2px]">Location</th>
                <th className="px-6 py-4 text-[10px] font-black text-green-400 uppercase tracking-[2px]">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-green-400 uppercase tracking-[2px]">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-green-400 uppercase tracking-[2px]">Matches</th>
                <th className="px-6 py-4 text-[10px] font-black text-green-400 uppercase tracking-[2px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-50">
              {postings.map((posting) => (
                <tr key={posting.id} className="hover:bg-green-50/50 transition">
                  <td className="px-6 py-4">
                    <p className="font-bold text-green-900">{posting.item_type}</p>
                    <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mt-0.5">{posting.category}</p>
                  </td>
                  <td className="px-6 py-4 text-green-700 text-xs font-semibold">{getLocationDisplay(posting)}</td>
                  <td className="px-6 py-4 text-green-700 text-xs font-semibold">{formatDate(posting.created_at)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      posting.status === "active" ? "bg-green-100 text-green-700 border border-green-200" :
                      posting.status === "pending" ? "bg-yellow-100 text-yellow-700 border border-yellow-200" :
                      "bg-gray-100 text-gray-700 border border-gray-200"
                    }`}>
                      {getStatusLabel(posting.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className="w-8 h-8 bg-cyan-100 text-cyan-700 rounded-lg flex items-center justify-center font-black text-xs border border-cyan-200">
                         {posting.match_count || 0}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/lost-dashboard/postings/${posting.id}`)} className="p-2.5 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition shadow-sm border border-green-100"><FiEye /></button>
                      <button onClick={() => navigate(`/lost-dashboard/edit-post/${posting.id}`)} className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition shadow-sm border border-emerald-100"><FiEdit2 /></button>
                      <button onClick={() => handleDelete(posting.id)} className="p-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition shadow-sm border border-red-100"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}      {/* POSTING DETAILS SECTION */}
      {postings.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl md:text-2xl font-black text-green-900 mt-12 mb-6">Recent Postings Deep Dive</h2>
          {postings.slice(0, 2).map((posting) => {
            const additionalInfo = getAdditionalInfo(posting);
            return (
              <div key={posting.id} className="group bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-green-100 transition-all duration-300">
                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200">Featured Posting</span>
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">#{posting.id}</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-green-900 leading-tight">{posting.item_type}</h3>
                    <p className="text-green-700 font-medium text-sm md:text-base mt-2 opacity-80 leading-relaxed max-w-2xl">{posting.description || 'No description provided'}</p>
                  </div>
                  <div className="flex items-center md:flex-col items-end gap-3 shrink-0">
                    <span className={`px-5 py-2 rounded-xl font-black uppercase tracking-widest text-xs border ${
                      posting.status === "active" ? "bg-green-100 text-green-700 border-green-200 shadow-sm shadow-green-100" :
                      posting.status === "pending" ? "bg-yellow-100 text-yellow-700 border-yellow-200 shadow-sm shadow-yellow-100" :
                      "bg-gray-100 text-gray-700 border-gray-200"
                    }`}>
                      {getStatusLabel(posting.status)}
                    </span>
                    <button 
                      onClick={() => handleDelete(posting.id)}
                      className="p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl border border-red-200 transition-all duration-300 shadow-sm hover:shadow-red-200"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Content Grid */}
                <div className="flex flex-col md:flex-row gap-8">
                  {posting.image_url && (
                    <div className="md:w-1/3 lg:w-1/4 shrink-0">
                      <div className="aspect-square rounded-2xl overflow-hidden border-2 border-green-100 shadow-lg group-hover:border-green-300 transition-colors">
                        <img 
                          src={`http://localhost:3001${posting.image_url}`} 
                          alt={posting.item_type}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
                      <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1.5 opacity-70">Category</p>
                      <p className="font-bold text-green-900">{posting.category}</p>
                    </div>
                    <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
                      <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1.5 opacity-70">Location</p>
                      <p className="font-bold text-green-900 truncate">{posting.district || 'Not specified'}</p>
                    </div>
                    <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
                      <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1.5 opacity-70">Loss Date</p>
                      <p className="font-bold text-green-900">{formatDate(posting.date_lost)}</p>
                    </div>
                    <div className="bg-green-50/50 p-4 rounded-xl border border-green-100 bg-emerald-500/10 border-emerald-200">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1.5">Reward</p>
                      <p className="font-black text-emerald-700 text-lg">{formatReward(posting.reward_amount)}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 opacity-70">Posted On</p>
                      <p className="font-bold text-slate-900">{formatDate(posting.created_at)}</p>
                    </div>
                    <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-100">
                      <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-1.5">Smart Matches</p>
                      <p className="font-black text-cyan-700 text-lg">{posting.match_count || 0}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 sm:col-span-2">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 opacity-70">Color & Markings</p>
                       <p className="font-bold text-slate-900">{additionalInfo.color || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
