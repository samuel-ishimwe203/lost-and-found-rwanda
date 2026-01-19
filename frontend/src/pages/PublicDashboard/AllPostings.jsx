import { Folder, MapPin, Phone, User, Image } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { PostsContext } from "../../context/PostsContext";
import { AuthContext } from "../../context/AuthContext";
import SendMessageModal from "../../components/SendMessageModal";

export default function AllPostings() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const { allPosts, loading } = useContext(PostsContext);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const city = params.get("city");
  const category = params.get("category");
  const title = params.get("title");

  const handleContactClick = (item) => {
    if (!isAuthenticated) {

      navigate('/auth?mode=login');
      return;
    }
    setSelectedItem(item);
    setMessageModalOpen(true);
  };

  const filteredItems = allPosts.filter((item) => {
    return (
      (!city || item.district === city) &&
      (!category || item.category === category) &&
      (!title || item.item_type.toLowerCase().includes(title.toLowerCase()))
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-10">
      <h2 className="text-3xl font-bold mb-6">
        All Postings ({allPosts.length})
      </h2>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-xl text-gray-600">Loading items...</div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No items found for your search criteria.</p>
          <p className="text-gray-500 mt-2">Try adjusting your filters or browse all postings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredItems.map((item) => {
            // Parse additional_info to get document owner details
            const additionalInfo = item.additional_info ? (typeof item.additional_info === 'string' ? JSON.parse(item.additional_info) : item.additional_info) : {};
            
            // Determine if it's a lost or found item - FIXED: Check item_source field
            const isLostItem = !item.item_source || item.item_source === 'lost' || item.location_lost || item.date_lost;
            
            // Construct full image URL
            const imageUrl = item.image_url ? `http://localhost:3001${item.image_url}` : null;
            
            return (
              <div
                key={item.id}
                className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-purple-100 transform hover:-translate-y-1"
              >
                {/* Image Section - Reduced height */}
                <div className="relative w-full h-36 bg-gradient-to-br from-purple-100 to-indigo-200 overflow-hidden">
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
                      <Image className="w-12 h-12 text-purple-300" />
                    </div>
                  )}
                  
                  {/* Status Badge - Top Right */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold shadow-lg ${
                      isLostItem 
                        ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white' 
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                    }`}>
                      {isLostItem ? '🔍 LOST' : '✓ FOUND'}
                    </span>
                  </div>
                </div>

                {/* Content Section - Reduced padding */}
                <div className="p-3">
                  {/* Title - Smaller */}
                  <h3 className="text-sm font-bold text-gray-800 mb-1 line-clamp-1">{item.item_type}</h3>
                  
                  {/* Description - Smaller */}
                  <p className="text-xs text-gray-600 mb-2 line-clamp-1">{item.description}</p>

                  {/* Info Grid - Compact */}
                  <div className="space-y-1.5">
                    {/* Category */}
                    <div className="flex items-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 mr-2 flex-shrink-0">
                        <Folder className="w-3 h-3" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Category</p>
                        <p className="text-xs font-semibold text-gray-800 capitalize truncate">{item.category}</p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-rose-100 text-rose-600 mr-2 flex-shrink-0">
                        <MapPin className="w-3 h-3" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{item.district}</p>
                      </div>
                    </div>

                    {/* Owner Name - Most Important */}
                    {additionalInfo.owner_name && (
                      <div className="flex items-center bg-gradient-to-r from-emerald-50 to-teal-50 p-2 rounded-lg border border-emerald-200">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500 text-white mr-2 flex-shrink-0">
                          <User className="w-3 h-3" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-emerald-700">Name</p>
                          <p className="text-sm font-bold text-emerald-900 truncate">{additionalInfo.owner_name}</p>
                        </div>
                      </div>
                    )}

                    {/* Phone Number */}
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

                  {/* Footer Section - Compact */}
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    {/* Contact Owner Button */}
                    <button
                      onClick={() => handleContactClick(item)}
                      className="w-full mb-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:from-green-700 hover:to-emerald-600 transition shadow-md"
                    >
                      📧 Contact Owner
                    </button>

                    {/* Reward */}
                    {item.reward_amount && item.reward_amount > 0 && (
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-2 rounded-lg border border-yellow-300 mb-1">
                        <div className="flex items-center">
                          <span className="text-lg mr-1">💰</span>
                          <div>
                            <p className="text-xs text-yellow-800 font-bold">{item.reward_amount.toLocaleString()} RWF</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Posted By */}
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="truncate">By: {item.contact_name || 'Anonymous'}</span>
                      {item.is_police_upload && (
                        <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">👮</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Send Message Modal */}
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
    </div>
  );
}
