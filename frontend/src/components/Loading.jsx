import React from "react";
import { useLanguage } from "../context/LanguageContext";

/**
 * A beautiful, responsive loading component used across the application.
 * @param {string} message - Optional custom message to display (e.g., from t('common.loading'))
 */
export default function Loading({ message }) {
  const { t } = useLanguage();
  const displayMessage = message || t("common.loading");

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-6 animate-in fade-in duration-700">
      <div className="relative mb-8">
        {/* Outer pulse ring */}
        <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-25"></div>
        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-slate-100 border-t-green-600 rounded-full animate-spin shadow-inner relative z-10"></div>
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg pulse"></div>
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-sm md:text-base font-black text-green-700 uppercase tracking-[0.3em] animate-pulse">
          {displayMessage}
        </p>
        <div className="flex items-center justify-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-200 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce"></span>
        </div>
      </div>
    </div>
  );
}
