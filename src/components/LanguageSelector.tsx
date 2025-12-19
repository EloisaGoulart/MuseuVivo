'use client';

import { useState } from 'react';
import './LanguageSelector.css';

interface LanguageSelectorProps {
  onLanguageChange: (lang: 'pt' | 'en') => void;
  currentLanguage: 'pt' | 'en';
}

export default function LanguageSelector({ onLanguageChange, currentLanguage }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'pt' as const, flag: '🇧🇷', name: 'Português' },
    { code: 'en' as const, flag: '🇺🇸', name: 'English' },
  ];

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  const handleSelect = (langCode: 'pt' | 'en') => {
    onLanguageChange(langCode);
    setIsOpen(false);
  };

  return (
    <div className="language-selector">
      <button 
        className="language-button" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Selecionar idioma"
      >
        <span className="language-flag">{currentLang.flag}</span>
        <span className="language-code">{currentLang.code.toUpperCase()}</span>
        <span className={`language-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="language-dropdown">
          {languages.map(lang => (
            <button
              key={lang.code}
              className={`language-option ${lang.code === currentLanguage ? 'active' : ''}`}
              onClick={() => handleSelect(lang.code)}
            >
              <span className="language-flag">{lang.flag}</span>
              <span className="language-name">{lang.name}</span>
              {lang.code === currentLanguage && <span className="checkmark">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
