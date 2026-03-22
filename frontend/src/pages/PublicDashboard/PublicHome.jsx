import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { PostsContext } from "../../context/PostsContext";
import { AuthContext } from "../../context/AuthContext";
import SendMessageModal from "../../components/SendMessageModal";
import { Bot, Camera, Folder, Image, MapPin, PartyPopper, Phone, Search, User, Mail, DollarSign, CheckCircle, ShieldAlert } from "lucide-react";
import { getImageUrl } from "../../utils/imageHelper";
import { useLanguage } from "../../context/LanguageContext";

export default function PublicHome() {
  const { t } = useLanguage();
  const { allPosts, loading } = useContext(PostsContext);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  React.useEffect(() => {
    if (window.location.hash === '#how-it-works') {
      setTimeout(() => {
        document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, []);

  const handleContactClick = (item) => {
    if (!isAuthenticated) {
      navigate('/auth?mode=login');
      return;
    }
    setSelectedItem(item);
    setMessageModalOpen(true);
  };
  
  const lostItems = allPosts
    .filter(item =>
      (!item.item_source || item.item_source === 'lost' || item.location_lost || item.date_lost)
      && item.status !== 'matched'
      && item.status !== 'claimed'
    )
    .slice(0, 10);

  const foundItems = allPosts
    .filter(item =>
      (item.item_source === 'found' || (item.location_found && !item.location_lost))
      && item.status !== 'matched'
      && item.status !== 'claimed'
    )
    .slice(0, 10);
  
  const uniqueCategories = new Set(allPosts.map(post => post.category)).size || 0;
  const totalMatches = allPosts.filter(post => post.status === 'matched' || post.status === 'claimed').length || 0;
  const totalUsers = new Set(allPosts.map(post => post.user_id)).size || 1;

  return (
    <div className="w-full overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 text-white py-28 px-6 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
          {t("landing.heroTitle")}
        </h1>

        <p className="max-w-3xl mx-auto text-lg md:text-xl text-green-100 mb-10">
          {t("landing.heroSubtitle")}
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-5">
          <button
            onClick={() => window.dispatchEvent(new Event("open-search"))}
            className="bg-white text-green-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition"
          >
            {t("landing.searchLost")}
          </button>

          <button
            onClick={() => window.dispatchEvent(new Event("open-login"))}
            className="border-2 border-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-green-700 transition"
          >
            {t("landing.reportLost")}
          </button>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
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
              {t("landing.howItWorks")}
            </h2>
            <p className="text-gray-200 max-w-2xl mx-auto">
              {t("landing.howItWorksSubtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/95 backdrop-blur-sm text-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="bg-blue-100 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                <Camera className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                {t("landing.step1Title")}
              </h3>
              <p className="text-gray-600 leading-relaxed font-medium">
                {t("landing.step1Desc")}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-emerald-600 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group border border-white/20">
              <div className="bg-white/20 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white transition-colors duration-300">
                <Bot className="w-10 h-10 text-white group-hover:text-green-600 transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-bold mb-3">
                {t("landing.step2Title")}
              </h3>
              <p className="text-green-50 leading-relaxed font-medium">
                {t("landing.step2Desc")}
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-sm text-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="bg-emerald-100 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors duration-300">
                <PartyPopper className="w-10 h-10 text-emerald-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                {t("landing.step3Title")}
              </h3>
              <p className="text-gray-600 leading-relaxed font-medium">
                {t("landing.step3Desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-black text-white py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold">{totalUsers + 15}</p>
            <p className="text-sm text-gray-300">{t("landing.statsUsers")}</p>
          </div>
          <div>
            <p className="text-4xl font-bold">{totalMatches}</p>
            <p className="text-sm text-gray-300">{t("landing.statsMatches")}</p>
          </div>
          <div>
            <p className="text-4xl font-bold">{uniqueCategories || 8}</p>
            <p className="text-sm text-gray-300">{t("landing.statsCategories")}</p>
          </div>
          <div>
            <p className="text-4xl font-bold">{allPosts.length}</p>
            <p className="text-sm text-gray-300">{t("landing.statsPostings")}</p>
          </div>
        </div>
      </section>

      {/* ITEMS SECTIONS */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
        
        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">{t("common.loading")}</div>
          </div>
        ) : (
          <>
            {/* LOST ITEMS */}
            <div className="mb-16">
              <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-3xl font-bold mb-2 flex items-center gap-2"><Search className="w-8 h-8" /> {t("landing.lostBanner")}</h3>
                      <p className="text-blue-100 text-lg">
                        {t("landing.aiLostExplainer")}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/postings')}
                      className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition shadow-lg whitespace-nowrap"
                    >
                      {t("landing.viewAll")} →
                    </button>
                  </div>
                </div>
              </div>

              {lostItems.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-md max-w-7xl mx-auto">
                  <p className="text-xl text-gray-600">{t("items.noItemsFound")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
                  {lostItems.map((item) => {
                    const additionalInfo = item.additional_info ? (typeof item.additional_info === 'string' ? JSON.parse(item.additional_info) : item.additional_info) : {};
                    const imageUrl = getImageUrl(item.image_url);
                    
                    return (
                      <div
                        key={item.id}
                        className="bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-blue-300 transform hover:-translate-y-1"
                      >
                        <div className="relative w-full h-36 bg-gradient-to-br from-blue-100 to-sky-200 overflow-hidden">
                          {imageUrl ? (
                            <img src={imageUrl} alt={item.item_type} className="w-full h-full object-cover" crossOrigin="anonymous" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="w-12 h-12 text-blue-300" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <span className="px-2 py-1 rounded-full text-xs font-bold shadow-lg bg-gradient-to-r from-red-500 to-rose-600 text-white flex items-center gap-1 uppercase">
                              <Search className="w-3 h-3" /> {t("nav.search").substring(0,4)}
                            </span>
                          </div>
                          {imageUrl && (
                            <div className="absolute top-2 left-2">
                              <span className="px-2 py-1 rounded-full text-xs font-bold shadow-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white flex items-center gap-1 uppercase">
                                <Bot className="w-3 h-3" /> {t("landing.aiBadge")}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="p-3">
                          <h4 className="text-sm font-bold text-gray-800 mb-1 line-clamp-1">{item.item_type}</h4>
                          <div className="space-y-1.5">
                            <div className="flex items-center">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-100 text-blue-600 mr-2 flex-shrink-0">
                                <Folder className="w-3 h-3" />
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-gray-500 uppercase">{t("items.category")}</p>
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
                                  <p className="text-sm font-bold text-blue-900 truncate">{additionalInfo.owner_name}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <button
                              onClick={() => handleContactClick(item)}
                              className="w-full mb-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-md flex items-center justify-center gap-2"
                            >
                              <Mail className="w-4 h-4" /> {t("common.contact") || "Contact"}
                            </button>

                            {item.reward_amount && item.reward_amount > 0 && (
                              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-2 rounded-lg border border-yellow-200 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-yellow-700 flex-shrink-0" />
                                <div>
                                  <p className="text-[10px] text-yellow-700 font-medium uppercase">{t("items.rewardAmount")}</p>
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

            {/* FOUND ITEMS */}
            <div>
              <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6 rounded-2xl shadow-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-3xl font-bold mb-2 flex items-center gap-2"><CheckCircle className="w-8 h-8" /> {t("landing.foundBanner")}</h3>
                      <p className="text-emerald-100 text-lg">
                        {t("landing.aiFoundExplainer")}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/postings')}
                      className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition shadow-lg whitespace-nowrap"
                    >
                      {t("landing.viewAll")} →
                    </button>
                  </div>
                </div>
              </div>

              {foundItems.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-md max-w-7xl mx-auto">
                  <p className="text-xl text-gray-600">{t("items.noItemsFound")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
                  {foundItems.map((item) => {
                    const additionalInfo = item.additional_info ? (typeof item.additional_info === 'string' ? JSON.parse(item.additional_info) : item.additional_info) : {};
                    const imageUrl = getImageUrl(item.image_url);
                    
                    return (
                      <div
                        key={item.id}
                        className="bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-emerald-200 transform hover:-translate-y-1"
                      >
                        <div className="relative w-full h-36 bg-gradient-to-br from-emerald-100 to-teal-200 overflow-hidden">
                          {imageUrl ? (
                            <img src={imageUrl} alt={item.item_type} className="w-full h-full object-cover" crossOrigin="anonymous" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="w-12 h-12 text-emerald-300" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <span className="px-2 py-1 rounded-full text-xs font-bold shadow-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center gap-1 uppercase">
                              <CheckCircle className="w-3 h-3" /> {t("common.success").substring(0,5)}
                            </span>
                          </div>
                          {imageUrl && (
                            <div className="absolute top-2 left-2">
                              <span className="px-2 py-1 rounded-full text-xs font-bold shadow-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white flex items-center gap-1 uppercase">
                                <Bot className="w-3 h-3" /> {t("landing.aiBadge")}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="p-3">
                          <h4 className="text-sm font-bold text-gray-800 mb-1 line-clamp-1">{item.item_type}</h4>
                          <div className="space-y-1.5">
                            <div className="flex items-center">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 mr-2 flex-shrink-0">
                                <Folder className="w-3 h-3" />
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-gray-500 uppercase">{t("items.category")}</p>
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
                                  <p className="text-sm font-bold text-emerald-900 truncate">{item.contact_name}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <button
                              onClick={() => handleContactClick(item)}
                              className="w-full mb-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:from-emerald-700 hover:to-teal-600 transition shadow-md flex items-center justify-center gap-2"
                            >
                              <Mail className="w-4 h-4" /> {t("common.contact") || "Contact"}
                            </button>

                            {item.is_police_upload && (
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-2 rounded-lg border border-blue-200 flex items-center gap-2 justify-center">
                                <ShieldAlert className="w-4 h-4 text-blue-700" />
                                <p className="text-[10px] text-blue-700 font-bold uppercase">{t("police.dashboard").split(' ')[0]}</p>
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

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-white mb-3">{t("footer.about")}</h4>
            <p className="text-sm">
              {t("app.description")}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">{t("dashboard.welcome")}</h4>
            <ul className="text-sm space-y-2">
              <li>{t("nav.login")}</li>
              <li>{t("nav.register")}</li>
              <li>{t("auth.forgotPassword")}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">{t("nav.search")}</h4>
            <ul className="text-sm space-y-2">
              <li>{t("nav.browse")}</li>
              <li>{t("footer.contact")}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">{t("footer.contact")}</h4>
            <p className="text-sm">Kigali, Rwanda</p>
            <p className="text-sm">support@lostfound.rw</p>
          </div>
        </div>

        <p className="text-center text-sm mt-10 text-gray-500">
          {t("footer.copyright")}
        </p>
      </footer>
    </div>
  );
}