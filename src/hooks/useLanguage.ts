// ============================================
// HOOK CUSTOMIZADO: USE LANGUAGE
// ============================================
// Hook para gerenciar o idioma da aplicação

'use client';

import { useState, useEffect } from 'react';

export type Language = 'pt' | 'en';

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('pt');

  // Carrega idioma salvo ao montar
  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language | null;
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  // Escuta mudanças de idioma de outros componentes
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent<Language>) => {
      setLanguage(event.detail);
    };

    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, []);

  return language;
}
