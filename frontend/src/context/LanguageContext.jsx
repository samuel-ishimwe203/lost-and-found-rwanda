import React, { createContext, useContext, useState, useEffect } from "react";
import en from "../i18n/en.json";
import rw from "../i18n/rw.json";
import sw from "../i18n/sw.json";
import fr from "../i18n/fr.json";

const LanguageContext = createContext();

const languages = { en, rw, sw, fr };

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("lang") || "en";
  });

  // Helper to get nested value from object
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const t = (key) => {
    const value = getNestedValue(languages[language], key);
    if (value) return value;
    
    // Fallback to English if current language is not English
    if (language !== 'en') {
      const fallback = getNestedValue(languages['en'], key);
      if (fallback) return fallback;
    }
    
    return key;
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  useEffect(() => {
    // Sync language if it changes in other tabs
    const handleStorageChange = (e) => {
      if (e.key === "lang" && e.newValue) {
        setLanguage(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <LanguageContext.Provider value={{ t, language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);