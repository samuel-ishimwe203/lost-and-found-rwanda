import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import AuthModal from "./AuthModal";
import SearchModal from "./SearchModal";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar({ isAuthenticated = false, onLogout, onLoginSuccess, userRole }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const menuRef = useRef(null);
  const location = useLocation();

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

  const lostLinks = [
    { label: "Dashboard Home", to: "/lost-dashboard" },
    { label: "Profile", to: "/lost-dashboard/profile" },
    { label: "My Postings", to: "/lost-dashboard/my-postings" },
    { label: "Create Post", to: "/lost-dashboard/create-post" },
    { label: "Messages", to: "/lost-dashboard/messages" },
  ];

  const foundLinks = [
    { label: "Dashboard Home", to: "/found-dashboard" },
    { label: "Profile", to: "/found-dashboard/profile" },
    { label: "My Found Items", to: "/found-dashboard/my-found-items" },
    { label: "Post Found Item", to: "/found-dashboard/post-found-item" },
    { label: "Matches", to: "/found-dashboard/matches" },
    { label: "Messages", to: "/found-dashboard/messages" },
  ];

  const menuLinks = userRole === "lost_user" ? lostLinks : userRole === "found_user" ? foundLinks : [];

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 py-3">
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center">
          
          <Link to="/" className="flex flex-col items-center justify-center leading-none group notranslate relative pt-4">
            <div className="absolute top-0 right-0 left-12 flex flex-col items-center w-16">
              <svg viewBox="0 0 100 30" className="w-full h-auto drop-shadow-sm transform translate-x-2 -translate-y-1">
                <path d="M10,25 Q40,5 90,15 L95,5 Q40,-10 5,15 Z" fill="#2d4990" />
                <path d="M15,28 Q45,15 95,20 L90,28 Q40,25 10,35 Z" fill="#c1272d" />
              </svg>
            </div>
            
            <div className="flex items-center z-10 relative">
              <span className="text-[28px] font-bold text-[#c1272d] tracking-normal font-sans" style={{fontFamily: "Arial, sans-serif"}}>LOST</span>
              <span className="text-[28px] font-normal text-[#2d4990] tracking-normal font-sans" style={{fontFamily: "Arial, sans-serif"}}>FOUND</span>
            </div>
            
            <span className="text-[9px] tracking-[0.35em] text-[#333333] font-serif mt-[2px] ml-1">
              FIND ANYTHING
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link 
              to="/" 
              className={`px-5 py-2.5 rounded-full font-semibold transition text-[15px] ${
                location.pathname === '/' 
                  ? 'bg-[#f0f4f8] text-[#1e3a8a]' 
                  : 'text-gray-600 hover:text-[#1e3a8a] hover:bg-gray-50'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/postings" 
              className={`px-5 py-2.5 rounded-full font-semibold transition text-[15px] ${
                location.pathname === '/postings' 
                  ? 'bg-[#f0f4f8] text-[#1e3a8a]' 
                  : 'text-gray-600 hover:text-[#1e3a8a] hover:bg-gray-50'
              }`}
            >
              Browse Items
            </Link>
            <span className="px-5 py-2.5 rounded-full font-semibold text-[15px] text-gray-600 hover:text-[#1e3a8a] hover:bg-gray-50 cursor-pointer transition">
              How it Works
            </span>
          </div>

          <div className="flex items-center gap-6" ref={menuRef}>
            
            <LanguageSwitcher />

            <button 
              onClick={() => setSearchOpen(true)}
              className="text-gray-500 hover:text-[#1e3a8a] transition"
              aria-label="Search"
            >
              <Search size={24} strokeWidth={2} />
            </button>

            <div className="flex items-center gap-5 border-l border-gray-200 pl-6 ml-2">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={openLogin}
                    className="font-semibold text-[15px] text-[#1e3a8a] hover:text-[#1e3a8a]/80 transition"
                  >
                    Log in
                  </button>

                  <button
                    onClick={openRegister}
                    className="bg-[#2d4990] text-white font-semibold text-[15px] px-7 py-3 rounded-full hover:bg-[#1e3a8a] transition shadow-sm"
                  >
                    Sign up
                  </button>
                </>
              ) : menuLinks.length > 0 ? (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen((prev) => !prev)}
                    className="font-semibold text-[#1e3a8a] hover:text-[#1e3a8a]/80 transition flex items-center gap-2"
                  >
                    Dashboard
                    <span className="text-[10px]">▼</span>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-4 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2">
                      {menuLinks.map((link) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          className="block px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-[#f0f4f8] hover:text-[#1e3a8a]"
                          onClick={() => setMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            onLogout && onLogout();
                          }}
                          className="w-full text-left px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"
                        >
                          Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onLogout}
                  className="font-semibold text-red-600 hover:text-red-700 transition"
                >
                  Log out
                </button>
              )}
            </div>
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