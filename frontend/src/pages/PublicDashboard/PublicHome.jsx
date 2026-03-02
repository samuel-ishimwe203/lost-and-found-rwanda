import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { PostsContext } from "../../context/PostsContext";
import { AuthContext } from "../../context/AuthContext";
import SendMessageModal from "../../components/SendMessageModal";
import { Bot, Camera, Folder, Image, MapPin, PartyPopper, Phone, Search, User, Mail, DollarSign, CheckCircle, ShieldAlert } from "lucide-react";

export default function PublicHome() {
  const { allPosts, loading } = useContext(PostsContext);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleContactClick = (item) => {
    if (!isAuthenticated) {
      navigate('/auth?mode=login');
      return;
    }
    setSelectedItem(item);
    setMessageModalOpen(true);
  };
  
  const lostItems = allPosts
    .filter(item => !item.item_source || item.item_source === 'lost' || item.location_lost || item.date_lost)
    .slice(0, 10);
  
  const foundItems = allPosts
    .filter(item => item.item_source === 'found' || (item.location_found && !item.location_lost))
    .slice(0, 10);
  
  const policeItems = allPosts
    .filter(item => item.is_police_upload === true)
    .slice(0, 10);

  const uniqueCategories = new Set(allPosts.map(post => post.category)).size || 0;
  const totalMatches = allPosts.filter(post => post.status === 'matched' || post.status === 'claimed').length || 0;
  const totalUsers = new Set(allPosts.map(post => post.user_id)).size || 1;

  return (
    <div className="w-full">
      <section className="bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 text-white py-28 px-6 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
          Helping Rwandans Recover Lost Items Faster
        </h1>

        <p className="max-w-3xl mx-auto text-lg md:text-xl text-green-100 mb-10">
          A national digital platform connecting people who lost important
          documents and items with those who found them — safely, securely,
          and with dignity.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-5">
          <button
            onClick={() => window.dispatchEvent(new Event("open-search"))}
            className="bg-white text-green-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition"
          >
            Search Lost Items
          </button>

          <button
            onClick={() => window.dispatchEvent(new Event("open-login"))}
            className="border-2 border-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-green-700 transition"
          >
            Report Lost Item
          </button>
        </div>
      </section>

      <section
        className="py-24 px-6 text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1558788353-f76d92427f16')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              How Lost & Found Rwanda Works
            </h2>
            <p className="text-gray-200 max-w-2xl mx-auto">
              Post your loss with a reward. Let honest finders help you recover
              what matters most.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white text-gray-800 p-8 rounded-xl shadow-lg">
              <Camera className="w-12 h-12 mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold mb-2">
                1. Report with Photo
              </h3>
              <p className="text-gray-600">
                Upload your lost or found item with a photo. Our AI analyzes images to find potential matches automatically.
              </p>
            </div>

            <div className="bg-green-600 text-white p-8 rounded-xl shadow-lg">
              <Bot className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                2. AI Matches Items
              </h3>
              <p>
                Our AI system compares images and categories to find matches. You'll get notified when we find potential matches!
              </p>
            </div>

            <div className="bg-white text-gray-800 p-8 rounded-xl shadow-lg">
              <PartyPopper className="w-12 h-12 mb-4 text-emerald-600" />
              <h3 className="text-xl font-semibold mb-2">
                3. Secure Recovery
              </h3>
              <p className="text-gray-600">
                Connect with the owner/finder through our messaging system and arrange safe return of the item.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black text-white py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold">{totalUsers + 15}</p>
            <p className="text-sm text-gray-300">Active Users</p>
          </div>
          <div>
            <p className="text-4xl font-bold">{totalMatches}</p>
            <p className="text-sm text-gray-300">Successful Matches</p>
          </div>
          <div>
            <p className="text-4xl font-bold">{uniqueCategories || 8}</p>
            <p className="text-sm text-gray-300">Categories Supported</p>
          </div>
          <div>
            <p className="text-4xl font-bold">{allPosts.length}</p>
            <p className="text-sm text-gray-300">Total Postings</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
        
        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">Loading items...</div>
          </div>
        ) : (
          <>
            <div className="mb-16">
              <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-3xl font-bold mb-2 flex items-center gap-2"><Search className="w-8 h-8" /> Lost Items - Help Us Find Them!</h3>
                      <p className="text-blue-100 text-lg">
                        These items have been reported lost by their owners. Items with <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-purple-500/30"><Bot className="w-3 h-3 mr-1" />AI</span> badges are automatically analyzed by our AI system to find matches with found items.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/all-postings')}
                      className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition shadow-lg whitespace-nowrap"
                    >
                      View All →
                    </button>
                  </div>
                </div>
              </div>

              {lostItems.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-md max-w-7xl mx-auto">
                  <p className="text-xl text-gray-600">No lost items reported yet</p>
                  <p className="text-gray-500 mt-2">Be the first to report a lost item!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
                  {lostItems.map((item) => {
                    const additionalInfo = item.additional_info ? (typeof item.additional_info === 'string' ? JSON.parse(item.additional_info) : item.additional_info) : {};
                    const imageUrl = item.image_url ? `http://localhost:3001${item.image_url}` : null;
                    
                    return (
                      <div
                        key={item.id}
                        className="bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-blue-300 transform hover:-translate-y-1"
                      >
                        <div className="relative w-full h-36 bg-gradient-to-br from-blue-100 to-sky-200 overflow-hidden">
                          {imageUrl ? (
                            <>
                              <img
                                src={imageUrl}
                                alt={item.item_type}
                                className="w-full h-full object-cover"
                                crossOrigin="anonymous"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="w-12 h-12 text-blue-300" />
                            </div>
                          )}
                          
                          <div className="absolute top-2 right-2">
                            <span className="px-2 py-1 rounded-full text-xs font-bold shadow-lg bg-gradient-to-r from-red-500 to-rose-600 text-white flex items-center gap-1">
                              <Search className="w-3 h-3" /> LOST
                            </span>
                          </div>

                          {imageUrl && (
                            <div className="absolute top-2 left-2">
                              <span className="px-2 py-1 rounded-full text-xs font-bold shadow-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white flex items-center gap-1">
                                <Bot className="w-3 h-3" />
                                AI
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="p-3">
                          <h4 className="text-sm font-bold text-gray-800 mb-1 line-clamp-1">{item.item_type}</h4>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-1">{item.description}</p>

                          <div className="space-y-1.5">
                            <div className="flex items-center">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-100 text-blue-600 mr-2 flex-shrink-0">
                                <Folder className="w-3 h-3" />
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500">Category</p>
                                <p className="text-xs font-semibold text-gray-800 capitalize truncate">{item.category}</p>
                              </div>
                            </div>

                            <div className="flex items-center">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-sky-100 text-sky-600 mr-2 flex-shrink-0">
                                <MapPin className="w-3 h-3" />
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-800 truncate">{item.district}</p>
                              </div>
                            </div>

                            {additionalInfo.owner_name && (
                              <div className="flex items-center bg-gradient-to-r from-blue-50 to-sky-50 p-2 rounded-lg border border-blue-200">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500 text-white mr-2 flex-shrink-0">
                                  <User className="w-3 h-3" />
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-blue-700">Owner</p>
                                  <p className="text-sm font-bold text-blue-900 truncate">{additionalInfo.owner_name}</p>
                                </div>
                              </div>
                            )}

                            {(item.contact_phone || additionalInfo.contact_phone) && (
                              <div className="flex items-center">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-100 text-blue-600 mr-2 flex-shrink-0">
                                  <Phone className="w-3 h-3" />
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-gray-800 truncate">{item.contact_phone || additionalInfo.contact_phone}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <button
                              onClick={() => handleContactClick(item)}
                              className="w-full mb-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-md flex items-center justify-center gap-2"
                            >
                              <Mail className="w-4 h-4" /> Contact Owner
                            </button>

                            {item.reward_amount && item.reward_amount > 0 && (
                              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-2 rounded-lg border border-yellow-200 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-yellow-700 flex-shrink-0" />
                                <div>
                                  <p className="text-xs text-yellow-700 font-medium">Reward</p>
                                  <p className="text-sm font-bold text-yellow-900">{item.reward_amount.toLocaleString()} RWF</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6 rounded-2xl shadow-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-3xl font-bold mb-2 flex items-center gap-2"><CheckCircle className="w-8 h-8" /> Found Items - Claim What's Yours!</h3>
                      <p className="text-emerald-100 text-lg">
                        These items have been found and reported by honest citizens. Items with <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-purple-500/30"><Bot className="w-3 h-3 mr-1" />AI</span> badges are automatically analyzed by our AI system to match with lost items.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/all-postings')}
                      className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition shadow-lg whitespace-nowrap"
                    >
                      View All →
                    </button>
                  </div>
                </div>
              </div>

              {foundItems.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-md max-w-7xl mx-auto">
                  <p className="text-xl text-gray-600">No found items reported yet</p>
                  <p className="text-gray-500 mt-2">Be the first to report a found item!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
                  {foundItems.map((item) => {
                    const additionalInfo = item.additional_info ? (typeof item.additional_info === 'string' ? JSON.parse(item.additional_info) : item.additional_info) : {};
                    const imageUrl = item.image_url ? `http://localhost:3001${item.image_url}` : null;
                    
                    return (
                      <div
                        key={item.id}
                        className="bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-emerald-200 transform hover:-translate-y-1"
                      >
                        <div className="relative w-full h-36 bg-gradient-to-br from-emerald-100 to-teal-200 overflow-hidden">
                          {imageUrl ? (
                            <>
                              <img
                                src={imageUrl}
                                alt={item.item_type}
                                className="w-full h-full object-cover"
                                crossOrigin="anonymous"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="w-12 h-12 text-emerald-300" />
                            </div>
                          )}
                          
                          <div className="absolute top-2 right-2">
                            <span className="px-2 py-1 rounded-full text-xs font-bold shadow-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> FOUND
                            </span>
                          </div>

                          {imageUrl && (
                            <div className="absolute top-2 left-2">
                              <span className="px-2 py-1 rounded-full text-xs font-bold shadow-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white flex items-center gap-1">
                                <Bot className="w-3 h-3" />
                                AI
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="p-3">
                          <h4 className="text-sm font-bold text-gray-800 mb-1 line-clamp-1">{item.item_type}</h4>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-1">{item.description}</p>

                          <div className="space-y-1.5">
                            <div className="flex items-center">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 mr-2 flex-shrink-0">
                                <Folder className="w-3 h-3" />
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500">Category</p>
                                <p className="text-xs font-semibold text-gray-800 capitalize truncate">{item.category}</p>
                              </div>
                            </div>

                            <div className="flex items-center">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-teal-100 text-teal-600 mr-2 flex-shrink-0">
                                <MapPin className="w-3 h-3" />
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-800 truncate">{item.district}</p>
                              </div>
                            </div>

                            {item.contact_name && (
                              <div className="flex items-center bg-gradient-to-r from-emerald-50 to-teal-50 p-2 rounded-lg border border-emerald-200">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500 text-white mr-2 flex-shrink-0">
                                  <User className="w-3 h-3" />
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-emerald-700">Found By</p>
                                  <p className="text-sm font-bold text-emerald-900 truncate">{item.contact_name}</p>
                                </div>
                              </div>
                            )}

                            {item.contact_phone && (
                              <div className="flex items-center">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-100 text-blue-600 mr-2 flex-shrink-0">
                                  <Phone className="w-3 h-3" />
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-gray-800 truncate">{item.contact_phone}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <button
                              onClick={() => handleContactClick(item)}
                              className="w-full mb-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:from-emerald-700 hover:to-teal-600 transition shadow-md flex items-center justify-center gap-2"
                            >
                              <Mail className="w-4 h-4" /> Contact Finder
                            </button>

                            {item.is_police_upload && (
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-2 rounded-lg border border-blue-200 flex items-center gap-2 justify-center">
                                <ShieldAlert className="w-4 h-4 text-blue-700" />
                                <p className="text-xs text-blue-700 font-medium">Police Upload</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {selectedItem && (
        <SendMessageModal
          isOpen={messageModalOpen}
          onClose={() => {
            setMessageModalOpen(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          isFoundItem={selectedItem.item_source === 'found' || selectedItem.location_found}
        />
      )}

      <footer className="bg-gray-900 text-gray-300 py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-white mb-3">About Us</h4>
            <p className="text-sm">
              Lost & Found Rwanda is a national platform helping citizens recover
              lost items efficiently.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">User Portal</h4>
            <ul className="text-sm space-y-2">
              <li>Login</li>
              <li>Register</li>
              <li>Forgot Password</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">Quick Links</h4>
            <ul className="text-sm space-y-2">
              <li>All Postings</li>
              <li>Search</li>
              <li>Contact</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">Contact</h4>
            <p className="text-sm">Kigali, Rwanda</p>
            <p className="text-sm">support@lostfound.rw</p>
          </div>
        </div>

        <p className="text-center text-sm mt-10 text-gray-500">
          © {new Date().getFullYear()} Lost & Found Rwanda. All rights reserved.
        </p>
      </footer>
    </div>
  );
}