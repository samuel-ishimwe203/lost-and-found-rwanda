import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="mb-2">Lost & Found Rwanda</p>
        <p className="text-gray-400 text-sm">© {new Date().getFullYear()} All rights reserved.</p>
      </div>
    </footer>
  );
}