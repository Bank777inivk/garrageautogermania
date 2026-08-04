import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const changeLanguage = (code) => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0 && languages.some(l => l.code === pathParts[0])) {
      pathParts[0] = code;
    } else {
      pathParts.unshift(code);
    }
    const newPath = '/' + pathParts.join('/') + location.search + location.hash;
    
    navigate(newPath);
    setIsOpen(false);
  };

  const currentLang = languages.find((lang) => lang.code === i18n.language) || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors focus:outline-none"
      >
        <span className="text-lg">{currentLang.flag}</span>
        <span className="hidden md:inline text-xs font-medium uppercase">{currentLang.code}</span>
        <Globe size={14} className="ml-1" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 py-1 border border-gray-100 max-h-64 overflow-y-auto overscroll-contain"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${i18n.language === lang.code ? 'text-red-700 font-bold bg-red-50 border-l-2 border-red-600' : 'text-gray-700'
                }`}
            >
              <span className="mr-3 text-lg">{lang.flag}</span>
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
