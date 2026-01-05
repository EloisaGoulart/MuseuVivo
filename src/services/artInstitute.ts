

import { Artwork, ArticResponse, ArticArtwork, ArticSearchResponse } from '@/types/artwork';
import { translateToPortuguese } from './translate';

// URL base da API do Art Institute de Chicago
const ARTIC_API_BASE = 'https://api.artic.edu/api/v1';

// Monta a URL da imagem IIIF (usando proxy local)
function buildImageUrl(imageId: string | null, size: string = '843,'): string {
  if (!imageId) {
    return '';
  }
  
  // Proxy local para evitar CORS
  const url = `/api/image-proxy?id=${imageId}&size=${size}`;
  return url;
}

// Imagem em alta resolução para detalhes
function buildHighResImageUrl(imageId: string | null): string {
  if (!imageId) return '';
  return buildImageUrl(imageId, '1686,');
}

// Thumbnail para listagens
function buildThumbnailUrl(imageId: string | null): string {
  if (!imageId) return '';
  return buildImageUrl(imageId, '400,');
}

// Converte obra do ARTIC para o formato usado no app
function convertToArtwork(articWork: ArticArtwork, highRes: boolean = false): Artwork {
  // Usa alta resolução para detalhes, padrão para listagens
  const imageUrl = highRes 
    ? buildHighResImageUrl(articWork.image_id)  
    : buildImageUrl(articWork.image_id);         
  
  
  return {
    id: articWork.id.toString(),
    title: articWork.title,
    artist: articWork.artist_display || 'Desconhecido',
    date: articWork.date_display || 'Data desconhecida',
    imageUrl: imageUrl,
    department: articWork.department_title,
    medium: articWork.medium_display,
    dimensions: articWork.dimensions,
    museum: 'artic',
  };
}

// Busca lista de obras do Art Institute
export async function getArticArtworks(page: number = 1, limit: number = 12) {
  try {
    // Campos essenciais para a listagem
    const fields = 'id,title,artist_display,date_display,image_id,department_title,medium_display,dimensions,is_public_domain';
    
    // Monta a URL da API
    const url = `${ARTIC_API_BASE}/artworks?page=${page}&limit=${limit}&fields=${fields}`;
    
    // Requisição GET
    const response = await fetch(url, {
      cache: 'no-store', // Desabilita cache do Next.js
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    // Resposta em JSON
    const data: ArticResponse = await response.json();
    
    // Filtra obras com imagem válida e converte
    const artworks = data.data
      .filter(work => {
        const hasValidImageId = work.image_id !== null && 
                                work.image_id !== undefined && 
                                work.image_id !== '' &&
                                typeof work.image_id === 'string';
        const hasValidTitle = work.title && work.title.trim() !== '';
        
        if (!hasValidImageId) return false;
        if (!hasValidTitle) return false;
        return true;
      })
      .map(work => convertToArtwork(work, false))
      .filter(artwork => artwork.imageUrl && artwork.imageUrl.trim() !== '');
    return {
      artworks,
      totalPages: data.pagination.total_pages,
      total: data.pagination.total,
    };
    
  } catch (error) {
    return { artworks: [], totalPages: 0, total: 0 };
  }
}

// Busca detalhes completos de uma obra pelo ID
export async function getArticArtworkById(id: string): Promise<Artwork | null> {
  try {
    const url = `${ARTIC_API_BASE}/artworks/${id}`;
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    const articWork: ArticArtwork = result.data;
    
    if (!articWork.image_id) return null;
    return convertToArtwork(articWork, true);
  } catch (error) {
    return null;
  }
}

// filtro
export async function searchArticArtworks(query: string, limit: number = 20): Promise<Artwork[]> {
  try {
    // Busca IDs das obras
    const searchUrl = `${ARTIC_API_BASE}/artworks/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      throw new Error(`Erro HTTP: ${searchResponse.status}`);
    }
    
    const searchData: ArticSearchResponse = await searchResponse.json();
    
    if (!searchData.data || searchData.data.length === 0) return [];
    // Busca detalhes das obras
    const artworkPromises = searchData.data.map(item => 
      getArticArtworkById(item.id.toString())
    );
    
    const artworks = await Promise.all(artworkPromises);
    
    const validArtworks = artworks.filter((artwork): artwork is Artwork => {
      if (!artwork) return false;
      if (!artwork.imageUrl) return false;
      if (artwork.imageUrl.trim() === '') return false;
      if (artwork.imageUrl.includes('null')) return false;
      if (artwork.imageUrl.includes('undefined')) return false;
      return true;
    });
    return validArtworks;
  } catch (error) {
    return [];
  }
}
