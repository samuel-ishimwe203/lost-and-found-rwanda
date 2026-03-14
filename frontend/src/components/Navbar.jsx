import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import AuthModal from "./AuthModal";
import SearchModal from "./SearchModal";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar({ isAuthenticated = false, onLogout, onLoginSuccess, userRole }) {
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

  const lostLinks = [
    { label: "Dashboard Home", to: "/lost-dashboard" },
    { label: "Profile", to: "/lost-dashboard/profile" },
    { label: "My Postings", to: "/lost-dashboard/my-postings" },
    { label: "My Matches", to: "/lost-dashboard/matches" },
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
      <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-[100] py-3">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex justify-between items-center">
          
          <div className="flex items-center gap-2 md:gap-4 flex-1">
            {/* Hamburger Button */}
            {!isDashboard && (
              <button 
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
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
            )}

            <Link 
              to={isDashboard ? "#" : "/"} 
              onClick={(e) => {
                if (isDashboard) {
                  e.preventDefault();
                  setMobileMenuOpen(!mobileMenuOpen);
                }
              }}
              className="flex flex-col items-center justify-center leading-none group notranslate relative pt-0 sm:pt-4"
            >
              <div className="absolute top-0 left-0 right-0 flex flex-col items-center">
                <div className="w-12 sm:w-16">
                  <svg viewBox="0 0 100 30" className="w-full h-auto drop-shadow-sm transform translate-x-1 sm:translate-x-2 -translate-y-1">
                    <path d="M10,25 Q40,5 90,15 L95,5 Q40,-10 5,15 Z" fill="#2d4990" />
                    <path d="M15,28 Q45,15 95,20 L90,28 Q40,25 10,35 Z" fill="#c1272d" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center z-10 relative mt-3 sm:mt-0">
                <span className="text-xl sm:text-2xl font-black tracking-tighter text-[#1e3a8a] group-hover:text-blue-800 transition">LOST</span>
                <span className="text-xl sm:text-2xl font-black tracking-tighter text-[#c1272d] group-hover:text-red-700 transition">FOUND</span>
              </div>
              <div className={`hidden sm:block text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-0.5 group-hover:text-gray-600 transition ${isDashboard ? 'md:hidden lg:block' : ''}`}>find Anything</div>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-5 py-2.5 rounded-full font-semibold transition text-[15px] ${location.pathname === '/'
                  ? 'bg-[#f0f4f8] text-[#1e3a8a]'
                  : 'text-gray-600 hover:text-[#1e3a8a] hover:bg-gray-50'
                }`}
            >
              Home
            </Link>
            <Link
              to="/postings"
              className={`px-5 py-2.5 rounded-full font-semibold transition text-[15px] ${location.pathname === '/postings'
                  ? 'bg-[#f0f4f8] text-[#1e3a8a]'
                  : 'text-gray-600 hover:text-[#1e3a8a] hover:bg-gray-50'
                }`}
            >
              Browse Items
            </Link>
            <span
              onClick={() => {
                if (location.pathname === '/') {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/#how-it-works');
                }
              }}
              className="px-5 py-2.5 rounded-full font-semibold text-[15px] text-gray-600 hover:text-[#1e3a8a] hover:bg-gray-50 cursor-pointer transition"
            >
              How it Works
            </span>
          </div>


          <div className="flex items-center gap-3 md:gap-6" ref={menuRef}>

            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            <button
              onClick={() => setSearchOpen(true)}
              className="text-gray-500 hover:text-[#1e3a8a] transition p-1"
              aria-label="Search"
            >
              <Search size={22} strokeWidth={2} />
            </button>

            <div className="flex items-center gap-3 sm:gap-5 border-l border-gray-200 pl-3 sm:pl-6 ml-1 sm:ml-2">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={openLogin}
                    className="hidden sm:block font-semibold text-sm md:text-[15px] text-[#1e3a8a] hover:text-[#1e3a8a]/80 transition"
                  >
                    Log in
                  </button>

                  <button
                    onClick={openRegister}
                    className="bg-[#2d4990] text-white font-semibold text-xs md:text-[15px] px-4 md:px-7 py-2 md:py-3 rounded-full hover:bg-[#1e3a8a] transition shadow-sm"
                  >
                    Sign up
                  </button>
                </>
              ) : menuLinks.length > 0 ? (
                <div className="relative hidden md:block">
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
                  className="hidden md:block font-semibold text-red-600 hover:text-red-700 transition text-sm sm:text-base"
                >
                  Log out
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-gray-100 ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 py-4 space-y-3 bg-gray-50">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 font-medium hover:text-[#1e3a8a]">Home</Link>
            <Link to="/postings" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 font-medium hover:text-[#1e3a8a]">Browse Items</Link>
            <div 
              onClick={() => {
                setMobileMenuOpen(false);
                if (location.pathname === '/') {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/#how-it-works');
                }
              }}
              className="block py-2 text-gray-700 font-medium hover:text-[#1e3a8a] cursor-pointer"
            >
              How it Works
            </div>
            {isAuthenticated && menuLinks.length > 0 && !isDashboard && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">My Dashboard</p>
                {menuLinks.map((link) => (
                  <Link 
                    key={link.to} 
                    to={link.to} 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="block py-2 px-2 text-sm text-gray-600 hover:text-[#1e3a8a] transition"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
            {!isAuthenticated ? (
              <div className="pt-2 border-t border-gray-200 grid grid-cols-2 gap-3">
                <button onClick={() => { setMobileMenuOpen(false); openLogin(); }} className="py-2.5 text-center text-[#1e3a8a] font-semibold border border-gray-200 rounded-lg">Log in</button>
                <button onClick={() => { setMobileMenuOpen(false); openRegister(); }} className="py-2.5 text-center bg-[#2d4990] text-white font-semibold rounded-lg">Sign up</button>
              </div>
            ) : (
              <div className="pt-2 border-t border-gray-200">
                <button 
                  onClick={() => { setMobileMenuOpen(false); onLogout(); }} 
                  className="w-full text-left py-2 text-red-600 font-semibold"
                >
                  Log out Account
                </button>
              </div>
            )}
            <div className="pt-2 border-t border-gray-200 sm:hidden flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Language</span>
              <LanguageSwitcher />
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