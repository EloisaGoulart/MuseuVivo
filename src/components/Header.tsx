// ============================================
// COMPONENTE: HEADER (CABEÇALHO)
// ============================================
// Este componente é o cabeçalho do site que aparece em todas as páginas
// Contém o logo, links de navegação e seletor de idioma

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
    // Dispara um evento customizado para outros componentes reagirem
    const event = new CustomEvent('languageChange', { detail: lang });
    window.dispatchEvent(event);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo/Título do site - Link para home */}
        <Link href="/" className="header-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Museu Vivo" className="header-logo-img" />
        </Link>
        {/* Menu de navegação sempre visível */}
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

// --------------------------------------------
// EXPLICAÇÃO DOS CONCEITOS USADOS:
// --------------------------------------------
// 
// 1. COMPONENTE: É uma função que retorna JSX (HTML + JavaScript)
//    - Componentes podem ser reutilizados em várias páginas
//    - Começam com letra maiúscula
//
// 2. LINK (do Next.js): Diferente de <a>, o Link faz navegação sem recarregar a página
//    - Mais rápido e melhor experiência
//    - href: define para onde o link vai
//
// 3. ESTRUTURA:
//    - <header>: Tag semântica HTML para cabeçalho
//    - <nav>: Tag semântica para área de navegação
//    - className: No React/Next.js usamos className ao invés de class
