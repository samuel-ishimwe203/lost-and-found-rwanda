import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AuthModal from "./AuthModal";
import SearchModal from "./SearchModal";

export default function Navbar({ isAuthenticated = false, onLogout, onLoginSuccess }) {
  // ================= AUTH MODAL STATE =================
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // login | register

  // ================= SEARCH MODAL STATE =================
  const [searchOpen, setSearchOpen] = useState(false);

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
          <div className="flex gap-4">
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
