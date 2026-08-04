import React from 'react';
import { useLanguage, type Lang } from '../contexts/LanguageContext';

interface LanguageSelectorProps {
  onSelect?: (lang: Lang) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelect }) => {
  const { lang, setLang, t } = useLanguage();

  const handleSelect = (code: Lang) => {
    setLang(code);
    if (onSelect) onSelect(code);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="text-5xl mb-4">🌟</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{t.welcome}</h1>
        <p className="text-sm text-gray-500 mb-8">{t.tagline}</p>

        <p className="text-base font-semibold text-gray-700 mb-4">{t.choose}</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => handleSelect('ms')}
            className={`p-4 rounded-2xl border-2 transition-all ${
              lang === 'ms'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="text-3xl mb-2">🇲🇾</div>
            <div className="font-semibold">Bahasa Malaysia</div>
          </button>

          <button
            onClick={() => handleSelect('en')}
            className={`p-4 rounded-2xl border-2 transition-all ${
              lang === 'en'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="text-3xl mb-2">🇬🇧</div>
            <div className="font-semibold">English</div>
          </button>
        </div>

        {lang && (
          <button
            onClick={() => onSelect && onSelect(lang)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 rounded-xl hover:opacity-90 transition"
          >
            {t.continue} →
          </button>
        )}
      </div>
    </div>
  );
};

export default LanguageSelector;
