// ============================================
// SERVIÇO DO METROPOLITAN MUSEUM OF ART (MET)
// ============================================
// Este arquivo é responsável por buscar obras de arte da API do Metropolitan Museum
// Documentação oficial: https://metmuseum.github.io/

import { Artwork, MetArtwork, MetSearchResponse } from '@/types/artwork';
import { translateToPortuguese } from './translate';

// URL base da API do MET
const MET_API_BASE = 'https://collectionapi.metmuseum.org/public/collection/v1';

// Timeout para requisições (5 segundos)
const FETCH_TIMEOUT = 5000;

// Função auxiliar para fazer fetch com timeout
async function fetchWithTimeout(url: string, timeout = FETCH_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: 'force-cache',
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// --------------------------------------------
// FUNÇÃO AUXILIAR: CONVERTER FORMATO DA API
// --------------------------------------------
/**
 * Converte uma obra do formato da API do MET para nosso formato unificado
 * 
 * @param metWork - Obra no formato da API do MET
 * @returns Obra no nosso formato unificado
 */
function convertToArtwork(metWork: MetArtwork): Artwork {
  return {
    id: metWork.objectID.toString(),
    title: metWork.title || 'Sem título',
    artist: metWork.artistDisplayName || 'Desconhecido',
    date: metWork.objectDate || 'Data desconhecida',
    imageUrl: metWork.primaryImage || '',
    department: metWork.department,
    medium: metWork.medium,
    dimensions: metWork.dimensions,
    museum: 'met',  // Identificamos que veio do MET
  };
}

// --------------------------------------------
// BUSCAR OBRAS POR TERMO DE PESQUISA
// --------------------------------------------
/**
 * Busca obras no MET que correspondem a um termo
 * 
 * IMPORTANTE: A API do MET funciona diferente do ARTIC:
 * 1. Primeiro fazemos a busca que retorna apenas IDs
 * 2. Depois buscamos os detalhes de cada obra individualmente
 * 
 * @param query - Termo de pesquisa
 * @param limit - Máximo de resultados (padrão: 10)
 * @returns Array de obras encontradas
 */
export async function searchMetArtworks(query: string, limit: number = 10): Promise<Artwork[]> {
  try {
    // Passo 1: Buscar IDs das obras que correspondem ao termo
    const searchUrl = `${MET_API_BASE}/search?q=${encodeURIComponent(query)}&hasImages=true`;
    const searchResponse = await fetchWithTimeout(searchUrl);
    
    if (!searchResponse.ok) {
      throw new Error(`Erro HTTP: ${searchResponse.status}`);
    }
    
    const searchData: MetSearchResponse = await searchResponse.json();
    
    // Se não encontrou nada ou objectIDs é null
    if (!searchData.objectIDs || searchData.objectIDs.length === 0) {
      return [];
    }
    
    // Pegamos mais IDs para compensar o filtro de informações completas
    const idsToFetch = searchData.objectIDs.slice(0, Math.ceil(limit * 3));
    
    // Passo 2: Buscar detalhes de cada obra
    // Promise.all executa todas as requisições em paralelo (mais rápido!)
    const artworkPromises = idsToFetch.map(id => getMetArtworkById(id.toString()));
    const artworks = await Promise.all(artworkPromises);
    
    // Filtramos null (obras que não têm imagem ou deram erro)
    const validArtworks = artworks.filter((artwork): artwork is Artwork => artwork !== null);
    
    // ...MET search obras com imagem...
    
    // Retornamos apenas o limite solicitado
    return validArtworks.slice(0, limit);
    
  } catch (error) {
    // ...erro ao buscar obras do MET...
    return [];
  }
}

// --------------------------------------------
// BUSCAR DETALHES DE UMA OBRA ESPECÍFICA
// --------------------------------------------
/**
 * Busca detalhes completos de uma obra do MET pelo ID
 * 
 * @param id - ID da obra
 * @returns Obra completa ou null se não encontrar/não tiver imagem
 */
export async function getMetArtworkById(id: string): Promise<Artwork | null> {
  try {
    const url = `${MET_API_BASE}/objects/${id}`;
    const response = await fetchWithTimeout(url, 3000);
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const metWork: MetArtwork = await response.json();
    
    // Se não tiver imagem, não retornamos a obra
    // (queremos apenas obras com imagens para mostrar no site)
    if (!metWork.primaryImage || metWork.primaryImage.trim() === '') {
      // ...obra MET sem imagem válida...
      return null;
    }
    
    // Convertemos para nosso formato e retornamos sem tradução
    // A tradução será feita apenas quando necessário na página
    const artwork = convertToArtwork(metWork);
    return artwork;
    
  } catch (error: any) {
    if (error.name === 'AbortError') {
      // ...MET timeout para obra...
    } else if (error.message && error.message.includes('Erro HTTP: 404')) {
      // 404 é esperado para alguns IDs, log como info
      // ...MET obra não encontrada (404)...
    } else {
      console.error(`Erro ao buscar obra MET ${id}:`, error);
    }
    return null;
  }
}

// --------------------------------------------
// BUSCAR LISTA ALEATÓRIA DE OBRAS
// --------------------------------------------
/**
 * Busca obras aleatórias do MET para exibir na home ou em galerias
 * Como a API do MET não tem um endpoint de "obras aleatórias",
 * fazemos uma busca genérica e pegamos alguns resultados
 * 
 * @param limit - Quantas obras buscar (padrão: 12)
 * @returns Array de obras
 */
export async function getRandomMetArtworks(limit: number = 12): Promise<Artwork[]> {
  // Fazemos uma busca por "painting" (pintura) que geralmente tem muitos resultados
  return searchMetArtworks('painting', limit * 2);
}

// --------------------------------------------
// BUSCAR DEPARTAMENTOS DO MET
// --------------------------------------------
/**
 * Busca lista de departamentos do museu
 * Útil para criar filtros ou navegação por categoria
 * 
 * @returns Array com IDs e nomes dos departamentos
 */
export async function getMetDepartments() {
  try {
    const url = `${MET_API_BASE}/departments`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return data.departments || [];
    
  } catch (error) {
    console.error('Erro ao buscar departamentos do MET:', error);
    return [];
  }
}
