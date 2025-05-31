import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'EN', flag: '🇬🇧' },
    { code: 'fr', name: 'FR', flag: '🇫🇷' },
    { code: 'de', name: 'DE', flag: '🇩🇪' }
  ];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('preferredLanguage', langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="flex items-center text-gray-700 hover:text-turquoise"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change language"
      >
        <Globe size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 py-2 w-32 bg-white rounded-lg shadow-lg">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center ${
                i18n.language === lang.code ? 'text-turquoise' : 'text-gray-700'
              }`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;