import React, { useContext, useState, useMemo } from "react";
import { Folder, MapPin, Phone, User, Image, Search, Send, CheckCircle, AlertCircle, Calendar, Filter, ArrowRight, Bot, Shield, DollarSign, Globe } from "lucide-react";
import { FiCalendar, FiArrowRight, FiSliders, FiShield } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { PostsContext } from "../../context/PostsContext";
import { AuthContext } from "../../context/AuthContext";
import SendMessageModal from "../../components/SendMessageModal";
import { getImageUrl } from "../../utils/imageHelper";
import { useLanguage } from "../../context/LanguageContext";

export default function AllPostings() {
  const { t } = useLanguage();
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

  const processedItems = useMemo(() => {
    return allPosts.filter((item) => {
      const matchesSearch = (!city || item.district === city) &&
                           (!category || item.category === category) &&
                           (!title || item.item_type.toLowerCase().includes(title.toLowerCase()));
      return matchesSearch;
    }).map(item => {
      const isLost = !item.item_source || item.item_source === 'lost' || item.location_lost || item.date_lost;
      return { ...item, _isLost: isLost };
    });
  }, [allPosts, city, category, title]);

  const lostItems = processedItems.filter(i => i._isLost);
  const foundItems = processedItems.filter(i => !i._isLost);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="w-16 h-16 border-4 border-emerald-100 border-t-[#10b981] rounded-full animate-spin"></div>
      </div>
    );
  }

  const ItemCard = ({ item }) => {
    const additionalInfo = item.additional_info ? (typeof item.additional_info === 'string' ? JSON.parse(item.additional_info) : item.additional_info) : {};
    const imageUrl = getImageUrl(item.image_url);
    
    return (
      <div className="bg-white rounded-[16px] border border-blue-100/50 shadow-sm overflow-hidden flex flex-col h-full transform transition-all duration-300 hover:shadow-lg">
        <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={item.item_type} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-10">
              <Image className="w-12 h-12 text-gray-900" />
            </div>
          )}
          
          <div className="absolute top-2 left-2 flex gap-2">
             {imageUrl && (
                <div className="bg-indigo-600 text-white px-2 py-1 rounded-lg text-[9px] font-bold flex items-center gap-1 shadow-lg">
                   <Bot size={10} /> {t("landing.aiBadge")}
                </div>
             )}
          </div>
          <div className="absolute top-2 right-2">
             <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-white shadow-lg flex items-center gap-1 ${item._isLost ? 'bg-rose-600' : 'bg-[#10b981]'}`}>
                <Search size={10} /> {item._isLost ? t("postings.itemsLost").split(' ')[1] : t("postings.itemsFound").split(' ')[1]}
             </div>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <div className="mb-4">
             <h3 className="text-sm font-bold text-gray-900 capitalize mb-0.5">{item.item_type}</h3>
             <p className="text-[10px] text-gray-500 line-clamp-1">{item.description || t("items.noDescription")}</p>
          </div>

          <div className="space-y-3 flex-1">
             <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                   <Folder size={14} />
                </div>
                <div>
                   <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none">{t("items.category")}</p>
                   <p className="text-[10px] font-bold text-gray-700 capitalize">{t(`categories.${item.category?.toLowerCase()}`) || item.category}</p>
                </div>
             </div>

             <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center text-sky-500">
                   <MapPin size={14} />
                </div>
                <p className="text-[11px] font-bold text-gray-700">{t(`districts.${item.district?.toLowerCase()}`) || item.district}</p>
             </div>

             {additionalInfo.owner_name && (
                <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl flex items-center gap-3 shadow-inner">
                   <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                      <User size={16} />
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest leading-none mb-0.5">{item._isLost ? t("postings.itemsLost").split(' ')[0] : t("postings.itemsFound").split(' ')[0]}</p>
                      <p className="text-[11px] font-bold text-blue-900 truncate">{additionalInfo.owner_name}</p>
                   </div>
                </div>
             )}
          </div>

          {item.reward_amount > 0 && (
            <div className="mt-4 bg-orange-50 border border-orange-100 p-3 rounded-xl flex items-center gap-3">
               <div className="text-orange-600">
                  <DollarSign size={16} className="font-bold" />
               </div>
               <div>
                  <p className="text-[9px] font-bold text-orange-600 uppercase tracking-widest leading-none">{t("items.rewardAmount")}</p>
                  <p className="text-[12px] font-black text-orange-900">{item.reward_amount.toLocaleString()} RWF</p>
               </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32">
      <div className="bg-white border-b border-gray-100 mb-10">
        <div className="max-w-[1400px] mx-auto px-6 py-10">
           <div className="flex items-center gap-2 mb-2">
              <Globe className="text-[#10b981] w-4 h-4" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{t("app.tagline")}</span>
           </div>
           <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight italic">{t("nav.browse")} {t("postings.stream")}</h1>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 space-y-16">
        <section>
          <div className="mb-6 border-l-4 border-rose-600 pl-4 py-1">
             <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">{t("postings.itemsLost")} {t("postings.reports")}</h2>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{lostItems.length} {t("admin.logs").split(' ')[0]}</p>
          </div>
          {lostItems.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
               <p className="text-xs font-bold text-gray-400">{t("items.noItemsFound")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {lostItems.map(item => <ItemCard key={item.id} item={item} />)}
            </div>
          )}
        </section>

        <section>
          <div className="mb-6 border-l-4 border-[#10b981] pl-4 py-1">
             <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">{t("postings.itemsFound")} {t("postings.observations")}</h2>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{foundItems.length} {t("police.approved")}</p>
          </div>
          {foundItems.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
               <p className="text-xs font-bold text-gray-400">{t("items.noItemsFound")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {foundItems.map(item => <ItemCard key={item.id} item={item} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
