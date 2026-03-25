import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import AuthModal from "./AuthModal";
import SearchModal from "./SearchModal";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "../context/LanguageContext";

export default function Navbar({ isAuthenticated = false, onLogout, onLoginSuccess, userRole }) {
  const { t } = useLanguage();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname.includes('dashboard');

  const openLogin = () => {
    setAuthMode("login");
    setAuthOpen(true);
  };

  const openRegister = () => {
    setAuthMode("register");
    setAuthOpen(true);
  };

  useEffect(() => {
    const handleOpenLogin = () => {
      setAuthMode("login");
      setAuthOpen(true);
    };
    const handleOpenSearch = () => {
      setSearchOpen(true);
    };

    window.addEventListener("open-login", handleOpenLogin);
    window.addEventListener("open-search", handleOpenSearch);

    return () => {
      window.removeEventListener("open-login", handleOpenLogin);
      window.removeEventListener("open-search", handleOpenSearch);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const lostLinks = [
    { label: t("nav.dashboard"), to: "/lost-dashboard" },
    { label: t("nav.profile"), to: "/lost-dashboard/profile" },
    { label: t("items.myLostItems"), to: "/lost-dashboard/my-postings" },
    { label: t("matches.matchedItems"), to: "/lost-dashboard/matches" },
    { label: t("items.postLostItem"), to: "/lost-dashboard/create-post" },
    { label: t("notifications.notifications"), to: "/lost-dashboard/messages" },
  ];

  const foundLinks = [
    { label: t("nav.dashboard"), to: "/found-dashboard" },
    { label: t("nav.profile"), to: "/found-dashboard/profile" },
    { label: t("items.myFoundItems"), to: "/found-dashboard/my-found-items" },
    { label: t("items.postFoundItem"), to: "/found-dashboard/post-found-item" },
    { label: t("matches.potentialMatches"), to: "/found-dashboard/matches" },
    { label: t("notifications.notifications"), to: "/found-dashboard/messages" },
  ];

  const menuLinks = userRole === "lost_user" ? lostLinks : userRole === "found_user" ? foundLinks : [];

  return (
    <>
      <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-[100] h-[74px] flex items-center shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 w-full flex justify-between items-center h-full">
          
          {/* LEFT SECTION - Navigation Links */}
          <div className="flex items-center min-w-[80px] sm:min-w-[150px]">
            {isDashboard && (
              <button 
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            {!isDashboard && (
              <div className="hidden md:flex items-center gap-1">
                <Link to="/" className={`px-4 py-2 rounded-full font-bold transition text-[11px] uppercase tracking-widest ${location.pathname === '/' ? 'bg-slate-100 text-blue-900' : 'text-slate-600 hover:bg-slate-50'}`}>{t("nav.home")}</Link>
                <Link to="/postings" className={`px-4 py-2 rounded-full font-bold transition text-[11px] uppercase tracking-widest ${location.pathname === '/postings' ? 'bg-slate-100 text-blue-900' : 'text-slate-600 hover:bg-slate-50'}`}>{t("nav.browse")}</Link>
              </div>
            )}
          </div>

          {/* CENTER SECTION - LOGO */}
          <div className="flex-1 flex justify-center">
            <Link to="/" className="flex flex-col items-center justify-center group notranslate relative pt-3 sm:pt-4">
              <div className="absolute top-0 flex flex-col items-center">
                <div className="w-10 sm:w-16">
                  <svg viewBox="0 0 100 30" className="w-full h-auto drop-shadow-sm transform translate-x-1 sm:translate-x-2 -translate-y-1">
                    <path d="M10,25 Q40,5 90,15 L95,5 Q40,-10 5,15 Z" fill="#2d4990" />
                    <path d="M15,28 Q45,15 95,20 L90,28 Q40,25 10,35 Z" fill="#c1272d" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center z-10 relative">
                <span className="text-lg sm:text-2xl font-black tracking-tighter text-[#1e3a8a] group-hover:text-blue-800 transition">LOST</span>
                <span className="text-lg sm:text-2xl font-black tracking-tighter text-[#c1272d] group-hover:text-red-700 transition">FOUND</span>
              </div>
            </Link>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center justify-end gap-1 md:gap-4 min-w-[80px] sm:min-w-[150px]" ref={menuRef}>
            <button
              onClick={() => setSearchOpen(true)}
              className="text-gray-500 hover:text-[#1e3a8a] transition p-2 flex items-center justify-center sm:block hidden"
              aria-label={t("nav.search")}
            >
              <Search size={22} strokeWidth={2} />
            </button>

            <div className="border-l border-gray-200 pl-2 ml-1 hidden sm:block">
              <LanguageSwitcher />
            </div>

            <div className="flex items-center gap-2 border-l border-gray-200 pl-2 md:pl-4">
              {!isAuthenticated ? (
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={openLogin}
                    className="bg-[#2d4990] text-white font-black text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-[#1e3a8a] transition shadow-lg shadow-blue-900/10"
                  >
                    {t("auth.login")}
                  </button>
                  <button
                    onClick={openRegister}
                    className="bg-red-600 text-white font-black text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-900/10"
                  >
                    {t("auth.register")}
                  </button>
                </div>
              ) : (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setMenuOpen((prev) => !prev)}
                    className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#1e3a8a] hover:bg-slate-200 transition border border-slate-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-4 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-3 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                       <div className="px-5 py-2 mb-2 border-b border-slate-50">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("profile.userRole")}</p>
                          <p className="text-sm font-black text-blue-900">{userRole?.replace('_', ' ')}</p>
                       </div>
                       {menuLinks.map((link) => (
                         <Link key={link.to} to={link.to} className="block px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600" onClick={() => setMenuOpen(false)}>{link.label}</Link>
                       ))}
                       <div className="mt-2 pt-2 border-t border-slate-50">
                         <button onClick={() => { setMenuOpen(false); onLogout(); }} className="w-full text-left px-5 py-2.5 text-xs font-black text-red-600 hover:bg-red-50">{t("nav.logout")}</button>
                       </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SINGLE MOBILE MENU BUTTON */}
            <button 
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition ml-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`md:hidden absolute top-[74px] left-0 right-0 bg-white border-b border-gray-100 overflow-hidden transition-all duration-500 ease-in-out z-50 ${mobileMenuOpen ? 'max-h-[90vh] opacity-100 shadow-2xl overflow-y-auto pb-10' : 'max-h-0 opacity-0 pointer-events-none'}`}>
          <div className="px-6 py-8 space-y-8">
            {/* Search in Mobile Menu */}
            <div className="space-y-2">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t("common.search")}</p>
               <button 
                 onClick={() => { setSearchOpen(true); setMobileMenuOpen(false); }}
                 className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 text-slate-800 rounded-2xl font-bold border border-slate-100"
               >
                 <span className="text-sm">{t("search.searchPlaceholder")}</span>
                 <Search size={18} className="text-slate-400" />
               </button>
            </div>

            {/* Language Switcher in Mobile Menu */}
            <div className="flex items-center justify-between px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{t("language.selectLanguage")}</p>
              <LanguageSwitcher />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-5 mb-2">{t("nav.home")}</p>
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-5 py-4 text-slate-700 font-bold text-sm uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition border border-transparent hover:border-slate-100 flex items-center justify-between"
              >
                 {t("nav.home")}
                 <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              </Link>
              <Link 
                to="/postings" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-5 py-4 text-slate-700 font-bold text-sm uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition border border-transparent hover:border-slate-100 flex items-center justify-between"
              >
                 {t("nav.browse")}
                 <span className="w-2 h-2 rounded-full bg-red-500"></span>
              </Link>
            </div>

            {!isAuthenticated ? (
              <div className="grid grid-cols-2 gap-4 pt-4">
                <button onClick={() => { openLogin(); setMobileMenuOpen(false); }} className="py-4 text-center text-slate-900 font-black text-[10px] uppercase tracking-widest border border-slate-200 rounded-2xl bg-white shadow-sm active:scale-95 transition-all">{t("auth.login")}</button>
                <button onClick={() => { openRegister(); setMobileMenuOpen(false); }} className="py-4 text-center bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all">{t("auth.register")}</button>
              </div>
            ) : (
              <div className="space-y-4 pt-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-5">{t("nav.dashboard")}</p>
                <div className="grid grid-cols-1 gap-2">
                  {menuLinks.map((link) => (
                    <Link 
                      key={link.to} 
                      to={link.to} 
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-5 py-4 text-blue-600 font-black text-xs uppercase tracking-widest bg-blue-50/30 hover:bg-blue-50 rounded-2xl transition flex justify-between items-center border border-blue-50"
                    >
                      {link.label}
                      <span className="text-blue-300">→</span>
                    </Link>
                  ))}
                  <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="w-full py-4 text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-50 rounded-2xl transition text-left px-5 flex justify-between items-center group">
                     {t("nav.logout")}
                     <span className="opacity-0 group-hover:opacity-100 transition-opacity">👋</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onLoginSuccess={onLoginSuccess}
      />

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}