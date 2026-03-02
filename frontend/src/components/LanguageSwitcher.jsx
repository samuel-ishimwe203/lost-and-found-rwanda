import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: "en", name: "English" },
    { code: "rw", name: "Kinyarwanda" },
    { code: "fr", name: "Français" },
    { code: "sw", name: "Kiswahili" }
  ];

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  const triggerGoogleTranslate = (langCode) => {
    const googleCodeMap = {
      en: "en",
      rw: "rw",
      sw: "sw",
      fr: "fr",
    };

    const targetCode = googleCodeMap[langCode] || "en";
    
    const select = document.querySelector(".goog-te-combo");
    if (select) {
      select.value = targetCode;
      select.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
    }
  };

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
    triggerGoogleTranslate(langCode);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const activeLanguage = localStorage.getItem("lang") || "en";
      triggerGoogleTranslate(activeLanguage);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-[#1e3a8a] hover:text-[#1e3a8a]/80 transition font-semibold bg-transparent border-none outline-none cursor-pointer"
        aria-expanded={isOpen}
      >
        <Globe size={20} strokeWidth={1.5} />
        <span className="text-[15px]">{currentLang.name}</span>
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-48 bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] py-2 z-50 overflow-hidden transform origin-top animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="m-0 p-0 list-none">
            {languages.map((lang) => (
              <li key={lang.code}>
                <button
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full text-left px-5 py-3 text-[15px] font-semibold flex items-center justify-between transition-colors
                    ${
                      language === lang.code
                        ? "text-[#1e293b]"
                        : "text-[#64748b] hover:bg-gray-50 hover:text-[#1e293b]"
                    }
                  `}
                >
                  {lang.name}
                  {language === lang.code && (
                    <Check size={18} className="text-[#ef4444]" strokeWidth={2.5} />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}