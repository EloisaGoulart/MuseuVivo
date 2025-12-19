// ============================================
// SERVIÇO DO ART INSTITUTE OF CHICAGO (ARTIC)
// ============================================
// Este arquivo é responsável por buscar obras de arte da API do Art Institute of Chicago
// Documentação oficial: https://api.artic.edu/docs/

import { Artwork, ArticResponse, ArticArtwork, ArticSearchResponse } from '@/types/artwork';
import { translateToPortuguese } from './translate';

// URL base da API do Art Institute
const ARTIC_API_BASE = 'https://api.artic.edu/api/v1';

// --------------------------------------------
// FUNÇÃO AUXILIAR: CONSTRUIR URL DE IMAGEM
// --------------------------------------------
/**
 * Constrói a URL completa da imagem a partir do image_id
 * A API do ARTIC não retorna a URL completa, apenas um ID
 * Precisamos montar a URL seguindo o padrão IIIF (International Image Interoperability Framework)
 * 
 * Documentação IIIF: https://www.artic.edu/iiif/2
 * Padrão: /iiif/2/{identifier}/{region}/{size}/{rotation}/{quality}.{format}
 * 
 * @param imageId - ID da imagem fornecido pela API
 * @param size - Tamanho desejado (padrão: '843,' = largura 843px mantendo proporção)
 * @returns URL completa da imagem ou string vazia
 */
function buildImageUrl(imageId: string | null, size: string = '843,'): string {
  if (!imageId) {
    // ...ARTIC image_id null ou undefined...
    return '';
  }
  
  // Usando proxy local para evitar problemas de CORS
  // O proxy faz a requisição server-side e retorna a imagem
  const url = `/api/image-proxy?id=${imageId}&size=${size}`;
  // ...ARTIC URL gerada...
  return url;
}

/**
 * Constrói URL de imagem em alta resolução
 * Usado para páginas de detalhes onde queremos melhor qualidade
 */
function buildHighResImageUrl(imageId: string | null): string {
  if (!imageId) return '';
  return buildImageUrl(imageId, '1686,'); // ~2x maior para telas de alta densidade
}

/**
 * Constrói URL de thumbnail
 * Usado para listagens onde precisamos carregar rápido
 */
function buildThumbnailUrl(imageId: string | null): string {
  if (!imageId) return '';
  return buildImageUrl(imageId, '400,'); // Thumbnail menor para listagens
}

// --------------------------------------------
// FUNÇÃO AUXILIAR: CONVERTER FORMATO DA API
// --------------------------------------------
/**
 * Converte uma obra do formato da API do ARTIC para nosso formato unificado
 * Isso facilita porque usamos o mesmo formato independente da API
 * 
 * @param articWork - Obra no formato da API do Art Institute
 * @param highRes - Se true, usa imagem de alta resolução (para páginas de detalhes)
 * @returns Obra no nosso formato unificado
 */
function convertToArtwork(articWork: ArticArtwork, highRes: boolean = false): Artwork {
  // Escolhe a resolução apropriada baseado no contexto
  const imageUrl = highRes 
    ? buildHighResImageUrl(articWork.image_id)  // Alta resolução para detalhes
    : buildImageUrl(articWork.image_id);         // Resolução padrão para listagens
  
  // ...ARTIC convertendo obra...
  
  return {
    id: articWork.id.toString(),                    // Convertemos número para string
    title: articWork.title,
    artist: articWork.artist_display || 'Desconhecido',  // Se não tiver artista, mostra "Desconhecido"
    date: articWork.date_display || 'Data desconhecida',
    imageUrl: imageUrl,
    department: articWork.department_title,
    medium: articWork.medium_display,
    dimensions: articWork.dimensions,
    museum: 'artic',                                // Identificamos que veio do ARTIC
  };
}

// --------------------------------------------
// BUSCAR LISTA DE OBRAS
// --------------------------------------------
/**
 * Busca uma lista de obras do Art Institute
 * 
 * @param page - Número da página (padrão: 1)
 * @param limit - Quantas obras por página (padrão: 12)
 * @returns Array de obras e total de páginas
 */
export async function getArticArtworks(page: number = 1, limit: number = 12) {
  try {
    // ...ARTIC buscando obras...
    
    // Campos que queremos buscar da API
    // Isso otimiza a requisição, trazendo apenas o necessário
    const fields = 'id,title,artist_display,date_display,image_id,department_title,medium_display,dimensions,is_public_domain';
    
    // Construímos a URL com os parâmetros - filtrando apenas obras com imagem disponível
    const url = `${ARTIC_API_BASE}/artworks?page=${page}&limit=${limit}&fields=${fields}`;
    
    // Fazemos a requisição GET
    const response = await fetch(url, {
      cache: 'no-store', // Desabilita cache do Next.js
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    // Convertemos a resposta para JSON
    const data: ArticResponse = await response.json();
    
    // Filtramos obras que têm imagem VÁLIDA e convertemos para nosso formato
    const artworks = data.data
      .filter(work => {
        const hasValidImageId = work.image_id !== null && 
                                work.image_id !== undefined && 
                                work.image_id !== '' &&
                                typeof work.image_id === 'string';
        const hasValidTitle = work.title && work.title.trim() !== '';
        
        if (!hasValidImageId) {
          // ...obra sem image_id válido...
          return false;
        }
        if (!hasValidTitle) {
          // ...obra sem título válido...
          return false;
        }
        return true;
      })
      .map(work => convertToArtwork(work, false))  // Converte para nosso formato (resolução padrão)
      .filter(artwork => artwork.imageUrl && artwork.imageUrl.trim() !== '');  // Filtro adicional após conversão
    
    // ...ARTIC obras com imagem construída...
    // ...URLs de imagem via IIIF...
    
    return {
      artworks,
      totalPages: data.pagination.total_pages,
      total: data.pagination.total,
    };
    
  } catch (error) {
    // ...erro ao buscar obras do ARTIC...
    return { artworks: [], totalPages: 0, total: 0 };
  }
}

// --------------------------------------------
// BUSCAR DETALHES DE UMA OBRA ESPECÍFICA
// --------------------------------------------
/**
 * Busca detalhes completos de uma obra pelo ID
 * Também traduz o título e artista para português
 * 
 * @param id - ID da obra
 * @returns Obra completa ou null se não encontrar
 */
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
    
    // Se não tem image_id, não vale a pena mostrar
    if (!articWork.image_id) {
      // ...obra ARTIC sem image_id...
      return null;
    }
    
    // Convertemos para nosso formato usando ALTA RESOLUÇÃO (página de detalhes)
    const artwork = convertToArtwork(articWork, true);
    // ...obra ARTIC carregada...
    // ...imagem HD...
    return artwork;
  } catch (error) {
    // ...erro ao buscar obra do ARTIC...
    return null;
  }
}

// --------------------------------------------
// BUSCAR OBRAS POR TERMO DE PESQUISA
// --------------------------------------------
/**
 * Busca obras que correspondem a um termo de pesquisa
 * Ex: "gatos", "flores", "Van Gogh"
 * 
 * @param query - Termo de pesquisa
 * @param limit - Máximo de resultados (padrão: 20)
 * @returns Array de obras encontradas
 */
export async function searchArticArtworks(query: string, limit: number = 20): Promise<Artwork[]> {
  try {
    // ...ARTIC search...
    
    // Primeiro fazemos a busca para obter os IDs
    const searchUrl = `${ARTIC_API_BASE}/artworks/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      throw new Error(`Erro HTTP: ${searchResponse.status}`);
    }
    
    const searchData: ArticSearchResponse = await searchResponse.json();
    
    // Se não encontrou nada, retorna array vazio
    if (!searchData.data || searchData.data.length === 0) {
      // ...ARTIC search nenhum resultado...
      return [];
    }
    
    // Agora buscamos os detalhes de cada obra encontrada
    // Promise.all executa todas as buscas em paralelo
    const artworkPromises = searchData.data.map(item => 
      getArticArtworkById(item.id.toString())
    );
    
    const artworks = await Promise.all(artworkPromises);
    
    // Filtramos null e obras sem imagem válida
    const validArtworks = artworks.filter((artwork): artwork is Artwork => {
      if (!artwork) return false;
      if (!artwork.imageUrl) return false;
      if (artwork.imageUrl.trim() === '') return false;
      if (artwork.imageUrl.includes('null')) return false;
      if (artwork.imageUrl.includes('undefined')) return false;
      return true;
    });
    // ...ARTIC search obras válidas...
    
    return validArtworks;
    
  } catch (error) {
    // ...erro ao buscar obras do ARTIC...
    return [];
  }
}
