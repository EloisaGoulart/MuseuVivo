// ============================================
// SERVIÇO DE TRADUÇÃO - Cliente
// ============================================
// Chama a API de tradução no servidor

// Cache de traduções para evitar chamadas repetidas
const cache = new Map<string, string>();

/**
 * Traduz texto entre inglês e português
 */
export async function translate(
  text: string,
  sourceLang: 'en' | 'pt' = 'en',
  targetLang: 'en' | 'pt' = 'pt'
): Promise<string> {
  console.log(`🔍 translate() chamada: "${text.substring(0, 50)}..." (${sourceLang} → ${targetLang})`);
  
  if (!text || text.trim() === '') return '';
  if (sourceLang === targetLang) return text;

  // Verifica cache
  const cacheKey = `${sourceLang}-${targetLang}-${text}`;
  if (cache.has(cacheKey)) {
    console.log(`✅ Cache local: "${text.substring(0, 30)}..."`);
    return cache.get(cacheKey)!;
  }

  try {
    // Chama a API de tradução
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, sourceLang, targetLang }),
    });

    if (!response.ok) {
      console.error(`❌ Erro na API de tradução: ${response.status}`);
      return text;
    }

    const data = await response.json();
    const translated = data.translatedText;

    if (translated && translated.trim()) {
      console.log(`✅ Traduzido via API: "${text.substring(0, 30)}..." → "${translated.substring(0, 30)}..."`);
      cache.set(cacheKey, translated);
      return translated;
    }

    return text;
  } catch (error) {
    console.error('❌ Erro ao traduzir:', error);
    return text;
  }
}

/**
 * Helper: traduz do inglês para português
 */
export async function translateToPortuguese(text: string): Promise<string> {
  return translate(text, 'en', 'pt');
}

/**
 * Helper: traduz do português para inglês
 */
export async function translateToEnglish(text: string): Promise<string> {
  return translate(text, 'pt', 'en');
}

/**
 * Traduz múltiplos textos em paralelo
 */
export async function translateMultiple(
  texts: string[],
  sourceLang: 'en' | 'pt' = 'en',
  targetLang: 'en' | 'pt' = 'pt'
): Promise<string[]> {
  return Promise.all(
    texts.map(text => translate(text, sourceLang, targetLang))
  );
}
