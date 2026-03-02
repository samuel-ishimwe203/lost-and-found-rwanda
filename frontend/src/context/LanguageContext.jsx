import React, { createContext, useContext, useState, useEffect } from "react";
import en from "../i18n/en.json";
import rw from "../i18n/rw.json";
import sw from "../i18n/sw.json";
import fr from "../i18n/fr.json";

const LanguageContext = createContext();

const languages = { en, rw, sw, fr };

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("lang");
    if (!saved) {
      localStorage.setItem("lang", "en");
      return "en";
    }
    return saved;
  });

  const t = (key) => languages[language][key] || key;

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const storedLang = localStorage.getItem("lang") || "en";
      if (storedLang !== language) {
        setLanguage(storedLang);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ t, language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);