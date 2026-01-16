import React from "react";
import { useLanguage } from "../context/LanguageContext";

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();

  return (
    <select
      value={language}
      onChange={(e) => changeLanguage(e.target.value)}
      className="border rounded-md px-3 py-1 text-sm focus:outline-none"
    >
      <option value="en">EN</option>
      <option value="rw">RW</option>
      <option value="sw">SW</option>
      <option value="fr">FR</option>
    </select>
  );
}
