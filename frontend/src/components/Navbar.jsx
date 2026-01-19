import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import AuthModal from "./AuthModal";
import SearchModal from "./SearchModal";

export default function Navbar({ isAuthenticated = false, onLogout, onLoginSuccess, user, userRole }) {
  // ================= AUTH MODAL STATE =================
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // login | register

  // ================= SEARCH MODAL STATE =================
  const [searchOpen, setSearchOpen] = useState(false);

  // ================= DASHBOARD MENU STATE =================
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // ================= OPEN FUNCTIONS =================
  const openLogin = () => {
    setAuthMode("login");
    setAuthOpen(true);
  };

  const openRegister = () => {
    setAuthMode("register");
    setAuthOpen(true);
  };

  // ================= GLOBAL EVENT LISTENERS =================
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

  // Close dropdown when clicking outside
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

  // Dashboard links based on role
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
      {/* ================= NAVBAR ================= */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          {/* LOGO */}
          <Link to="/" className="text-2xl font-bold text-green-700">
            Lost & Found Rwanda
          </Link>

          {/* CENTER MENU */}
          <div className="hidden md:flex gap-8 font-medium text-gray-700">
            <Link to="/" className="hover:text-green-700">Home</Link>
            <Link to="/postings" className="hover:text-green-700">All Postings</Link>
            <span className="cursor-pointer hover:text-green-700">Pages</span>
            <span className="cursor-pointer hover:text-green-700">Languages</span>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex gap-4 items-center" ref={menuRef}>
            {!isAuthenticated ? (
              <>
                <button
                  onClick={openLogin}
                  className="border px-4 py-2 rounded-md hover:bg-gray-100 transition"
                >
                  Login
                </button>

                <button
                  onClick={openRegister}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                >
                  Register
                </button>
              </>
            ) : menuLinks.length > 0 ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="border px-4 py-2 rounded-md hover:bg-gray-50 transition flex items-center gap-2"
                >
                  Dashboard
                  <span className="text-xs">▼</span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    {menuLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onLogout && onLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onLogout}
                className="border px-4 py-2 rounded-md text-red-600 hover:bg-red-50 transition"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ================= AUTH MODAL ================= */}
      <AuthModal
        isOpen={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onLoginSuccess={onLoginSuccess}
      />

      {/* ================= SEARCH MODAL ================= */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
