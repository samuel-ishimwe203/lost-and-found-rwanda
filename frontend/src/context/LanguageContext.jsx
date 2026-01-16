import React, { createContext, useContext, useState } from "react";
import en from "../i18n/en.json";
import rw from "../i18n/rw.json";
import sw from "../i18n/sw.json";
import fr from "../i18n/fr.json";

const LanguageContext = createContext();

const languages = {
  en,
  rw,
  sw,
  fr,
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    localStorage.getItem("lang") || "en"
  );

  const t = (key) => languages[language][key] || key;

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  return (
    <LanguageContext.Provider value={{ t, language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
