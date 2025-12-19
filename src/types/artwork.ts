// ============================================
// ARQUIVO DE TIPOS TYPESCRIPT
// ============================================
// Este arquivo define todas as interfaces (formatos de dados) que usaremos no projeto.
// TypeScript nos ajuda a ter certeza de que estamos usando os dados corretamente.

// --------------------------------------------
// OBRA DE ARTE (FORMATO UNIFICADO)
// --------------------------------------------
// Este é o formato padrão que usaremos em todo o projeto.
// Como vamos buscar dados de APIs diferentes (Art Institute of Chicago, MET),
// precisamos unificar o formato para facilitar o uso nos componentes.

export interface Artwork {
  id: string;                    // Identificador único da obra
  title: string;                 // Título da obra (ex: "Mona Lisa")
  artist: string;                // Nome do artista (ex: "Leonardo da Vinci")
  date: string;                  // Data/período de criação (ex: "1503-1519")
  imageUrl: string;              // URL da imagem da obra
  department?: string;           // Departamento do museu (opcional, pode não existir)
  medium?: string;               // Técnica/material usado (ex: "Óleo sobre tela")
  dimensions?: string;           // Dimensões da obra
  description?: string;          // Descrição da obra (opcional)
  museum: 'artic' | 'met';       // De qual API veio essa obra
}

// --------------------------------------------
// RESPOSTA DA API DO ART INSTITUTE OF CHICAGO
// --------------------------------------------
// Estas interfaces representam exatamente como a API do Art Institute retorna os dados.
// Precisamos disso para TypeScript entender a estrutura da resposta.

export interface ArticArtwork {
  id: number;                    // ID numérico na API do Art Institute
  title: string;                 // Título da obra
  artist_display: string;        // String com nome do artista e informações
  date_display: string;          // Data em formato de exibição
  image_id: string | null;       // ID da imagem (pode ser null se não tiver imagem)
  department_title: string;      // Departamento (ex: "Modern Art")
  medium_display: string;        // Técnica/material
  dimensions: string;            // Dimensões
  place_of_origin: string;       // Lugar de origem
}

export interface ArticResponse {
  data: ArticArtwork[];          // Array com as obras
  pagination: {                  // Informações de paginação
    total: number;               // Total de obras disponíveis
    limit: number;               // Quantas obras por página
    offset: number;              // A partir de qual obra começar
    total_pages: number;         // Total de páginas
    current_page: number;        // Página atual
  };
}

export interface ArticSearchResponse {
  data: Array<{
    id: number;                  // IDs dos resultados da busca
  }>;
}

// --------------------------------------------
// RESPOSTA DA API DO METROPOLITAN MUSEUM
// --------------------------------------------
// O MET retorna dados em um formato diferente, então precisamos de interfaces diferentes.

export interface MetArtwork {
  objectID: number;              // ID do objeto no MET
  title: string;                 // Título
  artistDisplayName: string;     // Nome do artista
  objectDate: string;            // Data
  primaryImage: string;          // URL da imagem principal
  department: string;            // Departamento
  medium: string;                // Técnica/material
  dimensions: string;            // Dimensões
}

export interface MetSearchResponse {
  total: number;                 // Total de resultados
  objectIDs: number[] | null;    // Array de IDs (pode ser null se não encontrar nada)
}

// --------------------------------------------
// MUSEU BRASILEIRO
// --------------------------------------------
// Formato da API de museus do Brasil

export interface MuseuBrasileiro {
  id: string;                    // ID do museu
  name: string;                  // Nome do museu
  endereco?: string;             // Endereço (opcional)
  telefone?: string;             // Telefone (opcional)
  website?: string;              // Site oficial do museu (opcional)
  imageUrl?: string;             // URL da imagem do museu (opcional)
}

// --------------------------------------------
// TRADUÇÃO
// --------------------------------------------
// Tipos de tradução não são mais necessários - 
// tradução agora usa dicionário manual + AWS Translate opcional
