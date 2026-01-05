'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import LanguageSelector from './LanguageSelector';

import './Header.css';

export default function Header() {
  const [language, setLanguage] = useState<'pt' | 'en'>('pt');

  // Carrega o idioma salvo do localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('language') as 'pt' | 'en' | null;
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  // Salva o idioma no localStorage e atualiza
  const handleLanguageChange = (lang: 'pt' | 'en') => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    const event = new CustomEvent('languageChange', { detail: lang });
    window.dispatchEvent(event);
  };

  return (
    <header className="header">
      <div className="header-container">

        <Link href="/" className="header-logo">
          <img src="/logo.png" alt="Museu Vivo" className="header-logo-img" />
        </Link>
        {/* Menu sempre visível */}
        <nav id="header-nav" className="header-nav">
          <Link href="/" className="nav-link">
            {language === 'pt' ? 'Home' : 'Home'}
          </Link>
          <Link href="/obras" className="nav-link">
            {language === 'pt' ? 'Obras' : 'Artworks'}
          </Link>
          <Link href="/museus" className="nav-link">
            {language === 'pt' ? 'Museus' : 'Museums'}
          </Link>
          <LanguageSelector
            currentLanguage={language}
            onLanguageChange={handleLanguageChange}
          />
        </nav>
      </div>
    </header>
  );
}
