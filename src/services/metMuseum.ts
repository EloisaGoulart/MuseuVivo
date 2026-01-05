

import { Artwork, MetArtwork, MetSearchResponse } from '@/types/artwork';
import { translateToPortuguese } from './translate';

// URL base da API do MET
const MET_API_BASE = 'https://collectionapi.metmuseum.org/public/collection/v1';

// Timeout para requisições
const FETCH_TIMEOUT = 5000;

// Fetch com timeout
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

// Converte obra do MET para o formato usado no app
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
    museum: 'met',
  };
}

// Busca obras no MET por termo
export async function searchMetArtworks(query: string, limit: number = 10): Promise<Artwork[]> {
  try {
    // Busca IDs das obras
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
    
    // Busca mais IDs para compensar filtro
    const idsToFetch = searchData.objectIDs.slice(0, Math.ceil(limit * 3));
    
    // Busca detalhes de cada obra
    const artworkPromises = idsToFetch.map(id => getMetArtworkById(id.toString()));
    const artworks = await Promise.all(artworkPromises);
    
    // Filtra obras válidas
    const validArtworks = artworks.filter((artwork): artwork is Artwork => artwork !== null);
    
    // Retorna apenas o limite solicitado
    return validArtworks.slice(0, limit);
    
  } catch (error) {
    return [];
  }
}

// Busca detalhes completos de uma obra do MET pelo ID
export async function getMetArtworkById(id: string): Promise<Artwork | null> {
  try {
    const url = `${MET_API_BASE}/objects/${id}`;
    const response = await fetchWithTimeout(url, 3000);
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const metWork: MetArtwork = await response.json();
    
    if (!metWork.primaryImage || metWork.primaryImage.trim() === '') return null;
    return convertToArtwork(metWork);
    
  } catch (error: any) {
    if (error.name === 'AbortError') {
      // Timeout
    } else if (error.message && error.message.includes('Erro HTTP: 404')) {
      // 404 esperado para alguns IDs
    } else {
      console.error(`Erro ao buscar obra MET ${id}:`, error);
    }
    return null;
  }
}

// Busca obras aleatórias do MET
export async function getRandomMetArtworks(limit: number = 12): Promise<Artwork[]> {
  // Fazemos uma busca por "painting" (pintura) que geralmente tem muitos resultados
  return searchMetArtworks('painting', limit * 2);
}

// Busca lista de departamentos do MET
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
