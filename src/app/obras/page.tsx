
'use client';

import { useState, useEffect } from 'react';
import ArtworkCard from '@/components/ArtworkCard';
import SearchBar from '@/components/SearchBar';
import Loading from '@/components/Loading';
import Header from '@/components/Header';
import { Artwork } from '@/types/artwork';
import { getArticArtworks, searchArticArtworks } from '@/services/artInstitute';
import { searchMetArtworks } from '@/services/metMuseum';
import { translate } from '@/services/translate';
import { useLanguage } from '@/hooks/useLanguage';
import './page.css';

export default function ObrasPage() {
  // Estados principais da página
  const [artworks, setArtworks] = useState<Artwork[]>([]); // Lista de obras
  const [loading, setLoading] = useState(true);             // Se está carregando
  const [searchQuery, setSearchQuery] = useState('');       // Termo de busca
  const [selectedMuseum, setSelectedMuseum] = useState<'all' | 'artic' | 'met'>('all'); // Filtro de museu
  const [selectedType, setSelectedType] = useState<string>('all'); // Filtro de tipo de obra
  const [availableTypes, setAvailableTypes] = useState<Set<string>>(new Set(['all'])); // Tipos disponíveis
  const language = useLanguage(); // Idioma atual

  // Scroll para o topo ao montar
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Recupera filtros salvos do sessionStorage
  useEffect(() => {
    // Recupera filtros salvos do sessionStorage
    const savedMuseum = sessionStorage.getItem('filter-museum') as 'all' | 'artic' | 'met' | null;
    const savedType = sessionStorage.getItem('filter-type');
    const savedQuery = sessionStorage.getItem('filter-query');
    
    if (savedMuseum) setSelectedMuseum(savedMuseum);
    if (savedType) setSelectedType(savedType);
    if (savedQuery) setSearchQuery(savedQuery);
  }, []);

  // Carrega obras iniciais ao montar
  useEffect(() => {
    const savedQuery = sessionStorage.getItem('filter-query');
    if (savedQuery && savedQuery.trim()) {
      handleSearch(savedQuery);
    } else {
      loadInitialArtworks();
    }
  }, []);
  
  // Recarrega/traduz obras ao mudar idioma
  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery);
    } else {
      loadInitialArtworks();
    }
  }, [language]);

  // Detecta tipos de obra disponíveis
  function detectAvailableTypes(works: Artwork[]) {
    const types = new Set<string>(['all']);
    
    works.forEach(artwork => {
      const medium = artwork.medium?.toLowerCase() || '';
      const department = artwork.department?.toLowerCase() || '';
      const title = artwork.title?.toLowerCase() || '';
      
      // PINTURA - Mais abrangente
      if (medium.includes('paint') || medium.includes('oil') || medium.includes('acrylic') || 
          medium.includes('watercolor') || medium.includes('gouache') || medium.includes('tempera') ||
          medium.includes('canvas') || medium.includes('panel') || medium.includes('fresco') ||
          medium.includes('mural') || medium.includes('enamel') || medium.includes('lacquer') ||
          department.includes('painting') || department.includes('european painting') ||
          department.includes('american painting') || department.includes('arts of africa') ||
          title.includes('portrait') || title.includes('landscape')) {
        types.add('painting');
      }
      
      // ESCULTURA - Incluindo 3D
      if (medium.includes('sculpture') || medium.includes('bronze') || medium.includes('marble') || 
          medium.includes('stone') || medium.includes('carved') || medium.includes('cast') ||
          medium.includes('terracotta') || medium.includes('plaster') || medium.includes('clay') ||
          medium.includes('granite') || medium.includes('limestone') || medium.includes('sandstone') ||
          medium.includes('alabaster') || medium.includes('basalt') || medium.includes('statue') ||
          medium.includes('bust') || medium.includes('relief') || medium.includes('figurine') ||
          department.includes('sculpture') || department.includes('sculptural') ||
          title.includes('statue') || title.includes('bust') || title.includes('figure')) {
        types.add('sculpture');
      }
      
      // FOTOGRAFIA
      if (medium.includes('photo') || medium.includes('gelatin') || medium.includes('albumen') ||
          medium.includes('cyanotype') || medium.includes('daguerreotype') ||
          medium.includes('silver print') || medium.includes('platinum') || medium.includes('palladium') ||
          medium.includes('tintype') || medium.includes('ambrotype') ||
          department.includes('photo') || medium.includes('print, gelatin') ||
          title.includes('photograph')) {
        types.add('photography');
      }
      
      // DESENHO
      if (medium.includes('draw') || medium.includes('sketch') || medium.includes('charcoal') || 
          medium.includes('pencil') || medium.includes('graphite') || medium.includes('chalk') ||
          medium.includes('pastel') || medium.includes('crayon') || medium.includes('ink on paper') ||
          medium.includes('pen and ink') || medium.includes('conte') || medium.includes('sanguine') ||
          medium.includes('silverpoint') || medium.includes('wash') ||
          department.includes('draw') || department.includes('works on paper') ||
          title.includes('sketch') || title.includes('study')) {
        types.add('drawing');
      }
      
      // GRAVURA/IMPRESSÃO
      if (medium.includes('print') || medium.includes('etching') || medium.includes('lithograph') || 
          medium.includes('woodcut') || medium.includes('engraving') || medium.includes('silkscreen') ||
          medium.includes('screenprint') || medium.includes('linocut') || medium.includes('aquatint') ||
          medium.includes('mezzotint') || medium.includes('drypoint') || medium.includes('monotype') ||
          medium.includes('woodblock') || medium.includes('chine-coll') ||
          department.includes('prints') || department.includes('print')) {
        types.add('print');
      }
      
      // CERÂMICA - Expandido
      if (medium.includes('ceramic') || medium.includes('pottery') || medium.includes('porcelain') || 
          medium.includes('earthenware') || medium.includes('stoneware') || medium.includes('faience') ||
          medium.includes('majolica') || medium.includes('raku') || medium.includes('terra cotta') ||
          medium.includes('vessel') || medium.includes('jar') || medium.includes('vase') ||
          department.includes('ceramic') || title.includes('vase') || title.includes('jar')) {
        types.add('ceramic');
      }
      
      // TÊXTIL
      if (medium.includes('textile') || medium.includes('fabric') || medium.includes('tapestry') ||
          medium.includes('embroidery') || medium.includes('weaving') || medium.includes('silk') ||
          medium.includes('linen') || medium.includes('cotton') || department.includes('textile')) {
        types.add('textile');
      }
      
      // VIDRO
      if (medium.includes('glass') || medium.includes('stained glass') || medium.includes('blown glass') ||
          department.includes('glass')) {
        types.add('glass');
      }
      
      // METAL/JOALHERIA - Combinado e expandido
      if (medium.includes('metal') || medium.includes('gold') || medium.includes('silver') || 
          medium.includes('copper') || medium.includes('iron') || medium.includes('brass') ||
          medium.includes('jewelry') || medium.includes('jewel') || medium.includes('ornament') ||
          department.includes('metalwork') || department.includes('jewelry')) {
        types.add('decorative');
      }
      
      // MADEIRA/MÓVEIS
      if (medium.includes('wood') || medium.includes('furniture') || medium.includes('carving') ||
          department.includes('furniture') || department.includes('decorative arts')) {
        types.add('decorative');
      }
      
      // ANTIGUIDADES/ARQUEOLOGIA
      if (department.includes('ancient') || department.includes('greek') || department.includes('roman') ||
          department.includes('egyptian') || department.includes('near eastern') ||
          department.includes('medieval')) {
        types.add('ancient');
      }
      
      // ARTE ASIÁTICA
      if (department.includes('asian') || department.includes('chinese') || department.includes('japanese') ||
          department.includes('indian') || department.includes('korean')) {
        types.add('asian');
      }
      
      // ARTE MODERNA/CONTEMPORÂNEA
      if (department.includes('modern') || department.includes('contemporary')) {
        types.add('modern');
      }
    });
    
    setAvailableTypes(types);
  }

  // Carrega obras iniciais (sem busca)
  async function loadInitialArtworks() {
    setLoading(true);
    try {
      // Detecta se é mobile para reduzir a quantidade de obras do MET
      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;
      const metLimit = isMobile ? 10 : 30;
      const articLimit = isMobile ? 20 : 40;
      // MET Museum é a API PRINCIPAL (ajustado para mobile)
      const [metArtworks, articData] = await Promise.all([
        searchMetArtworks('painting', metLimit),
        getArticArtworks(1, articLimit),
      ]);
      
      // Obras MET e ARTIC carregadas
      
      // Filtra: imagem válida + informações completas
      const isCompleteArtwork = (artwork: any) => {
        // Validação de imagem
        const hasValidImage = artwork.imageUrl && 
          artwork.imageUrl.trim() !== '' &&
          !artwork.imageUrl.includes('undefined') &&
          !artwork.imageUrl.includes('null') &&
          !artwork.imageUrl.includes('id=null') &&
          !artwork.imageUrl.includes('id=undefined') &&
          (artwork.imageUrl.startsWith('/') || artwork.imageUrl.startsWith('http'));
        
        // Validação de título
        const hasTitle = artwork.title && 
          artwork.title.trim() !== '' && 
          artwork.title !== 'Sem título' &&
          artwork.title.length < 150;
        
        // Validação de artista
        const hasArtist = artwork.artist && 
          artwork.artist.trim() !== '' && 
          artwork.artist !== 'Desconhecido' && 
          artwork.artist !== 'Unknown';
        
        // Evita títulos com múltiplos anos/datas
        const hasMultipleDates = artwork.title && /\d{4}[–-]\d{4}/.test(artwork.title);
        
        return hasValidImage && hasTitle && hasArtist && !hasMultipleDates;
      };

      const validMetArtworks = metArtworks.filter(isCompleteArtwork);
      const validArticArtworks = articData.artworks.filter(isCompleteArtwork);
      
      // Junta as obras (MET primeiro, depois ARTIC)
      let combined = [...validMetArtworks, ...validArticArtworks];
      
      // Traduz se o idioma for português
      if (language === 'pt') {
        combined = await translateArtworks(combined);
      }
      
      // Total de obras a exibir
      setArtworks(combined);
      detectAvailableTypes(combined);
    } catch (error) {
      // Erro ao carregar obras
    } finally {
      setLoading(false); // always executa
    }
  }

  // Traduz obras se necessário
  async function translateArtworks(works: Artwork[]): Promise<Artwork[]> {
    // Só traduz se o idioma global for português
    if (language !== 'pt') {
      return works;
    }
    try {
      const translated = await Promise.all(
        works.map(async (artwork) => {
          const translations = await Promise.all([
            translate(artwork.title || '', 'en', 'pt'),
            translate(artwork.artist || '', 'en', 'pt'),
            translate(artwork.medium || '', 'en', 'pt'),
            translate(artwork.department || '', 'en', 'pt'),
            translate(artwork.date || '', 'en', 'pt'),
            translate(artwork.dimensions || '', 'en', 'pt'),
          ]);
          return {
            ...artwork,
            title: translations[0] || artwork.title,
            artist: translations[1] || artwork.artist,
            medium: translations[2] || artwork.medium,
            department: translations[3] || artwork.department,
            date: translations[4] || artwork.date,
            dimensions: translations[5] || artwork.dimensions,
          };
        })
      );
      return translated;
    } catch (error) {
      return works;
    }
  }

  // --------------------------------------------
  //  CALCULAR RELEVÂNCIA
  // --------------------------------------------
  function calculateRelevance(artwork: Artwork, searchQuery: string): number {
    const query = searchQuery.toLowerCase().trim();
    let score = 0;
    
    const title = artwork.title?.toLowerCase() || '';
    const artist = artwork.artist?.toLowerCase() || '';
    const medium = artwork.medium?.toLowerCase() || '';
    const department = artwork.department?.toLowerCase() || '';
    const date = artwork.date?.toLowerCase() || '';
    
    // Correspondência exata no título (peso 100)
    if (title === query) score += 100;
    
    // Título começa com a busca (peso 50)
    if (title.startsWith(query)) score += 50;
    
    // Título contém a busca como palavra completa (peso 30)
    if (new RegExp(`\\b${query}\\b`).test(title)) score += 30;
    
    // Título contém a busca (peso 20)
    if (title.includes(query)) score += 20;
    
    // Artista corresponde exatamente (peso 40)
    if (artist === query) score += 40;
    
    // Artista começa com a busca (peso 25)
    if (artist.startsWith(query)) score += 25;
    
    // Artista contém a busca (peso 15)
    if (artist.includes(query)) score += 15;
    
    // Técnica/medium contém a busca (peso 10)
    if (medium.includes(query)) score += 10;
    
    // Departamento contém a busca (peso 8)
    if (department.includes(query)) score += 8;
    
    // Data contém a busca (peso 5)
    if (date.includes(query)) score += 5;
    
    // Bônus: múltiplas palavras da busca encontradas
    const queryWords = query.split(' ').filter(w => w.length > 2);
    queryWords.forEach(word => {
      if (title.includes(word)) score += 3;
      if (artist.includes(word)) score += 2;
    });
    
    return score;
  }

  // --------------------------------------------
  // FUNÇÃO DE BUSCA
  // --------------------------------------------
  // PRIORIDADE: Busca principalmente no MET Museum + Art Institute of Chicago
  async function handleSearch(query: string) {
    setSearchQuery(query);
    sessionStorage.setItem('filter-query', query);
    
    // Se a busca for vazia, limpar filtros e recarregar obras iniciais
    if (!query || query.trim() === '') {
      setSelectedType('all');
      sessionStorage.removeItem('filter-type');
      sessionStorage.removeItem('filter-query');
      loadInitialArtworks();
      return;
    }
    
    setLoading(true);

    try {
      // MET Museum: API PRINCIPAL para busca (15 resultados)
      // Art Institute of Chicago: API COMPLEMENTAR (15 resultados)
      const [metResults, articResults] = await Promise.all([
        searchMetArtworks(query, 30),       // PRINCIPAL: 30 do MET
        searchArticArtworks(query, 30),     // COMPLEMENTAR: 30 do ARTIC
      ]);

      // Filtra imagem válida 
      const isCompleteArtwork = (artwork: any) => {
        const hasValidImage = artwork.imageUrl && 
          artwork.imageUrl.trim() !== '' &&
          !artwork.imageUrl.includes('undefined') &&
          !artwork.imageUrl.includes('null') &&
          !artwork.imageUrl.includes('id=null') &&
          !artwork.imageUrl.includes('id=undefined') &&
          (artwork.imageUrl.startsWith('/') || artwork.imageUrl.startsWith('http'));
        const hasTitle = artwork.title && 
          artwork.title.trim() !== '' && 
          artwork.title !== 'Sem título' &&
          artwork.title.length < 120;
        const hasArtist = artwork.artist && 
          artwork.artist.trim() !== '' && 
          artwork.artist !== 'Desconhecido' && 
          artwork.artist !== 'Unknown';
        const hasMedium = artwork.medium && artwork.medium.trim() !== '';
        const hasDepartment = artwork.department && artwork.department.trim() !== '';
        const hasMultipleDates = artwork.title && /\d{4}[–-]\d{4}/.test(artwork.title);
        return hasValidImage && hasTitle && hasArtist && hasMedium && hasDepartment && !hasMultipleDates;
      };

      const metComplete = metResults.filter(isCompleteArtwork);
      const articComplete = articResults.filter(isCompleteArtwork);

      // Combina e ordena por relevância
      let combined = [
        ...metComplete.slice(0, 20),
        ...articComplete.slice(0, 20),
      ];
      combined = combined
        .map(artwork => ({
          artwork,
          relevance: calculateRelevance(artwork, query)
        }))
        .sort((a, b) => b.relevance - a.relevance)
        .map(item => item.artwork);

      // Traduz imediatamente apenas se idioma for pt
      if (language === 'pt') {
        combined = await translateArtworks(combined);
      }
      // Se idioma for inglês, mantém os dados originais 
      setArtworks(combined);
      detectAvailableTypes(combined);
    } catch (error) {
      // ...erro na busca...
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------
  // FILTRAR POR MUSEU E TIPO
  // --------------------------------------------
  const filteredArtworks = artworks.filter(artwork => {
    const museumMatch = selectedMuseum === 'all' || artwork.museum === selectedMuseum;
    
    if (selectedType === 'all') {
      return museumMatch;
    }
    
    const medium = artwork.medium?.toLowerCase() || '';
    const department = artwork.department?.toLowerCase() || '';
    const title = artwork.title?.toLowerCase() || '';
    
    switch (selectedType) {
      case 'painting':
        return museumMatch && (
          medium.includes('paint') || medium.includes('oil') || medium.includes('acrylic') || 
          medium.includes('watercolor') || medium.includes('gouache') || medium.includes('tempera') ||
          medium.includes('canvas') || medium.includes('panel') || medium.includes('fresco') ||
          medium.includes('mural') || medium.includes('enamel') || medium.includes('lacquer') ||
          department.includes('painting') || department.includes('arts of africa') ||
          title.includes('portrait') || title.includes('landscape')
        );
      
      case 'sculpture':
        return museumMatch && (
          medium.includes('sculpture') || medium.includes('bronze') || medium.includes('marble') || 
          medium.includes('stone') || medium.includes('carved') || medium.includes('cast') ||
          medium.includes('terracotta') || medium.includes('plaster') || medium.includes('clay') ||
          medium.includes('granite') || medium.includes('limestone') || medium.includes('sandstone') ||
          medium.includes('alabaster') || medium.includes('basalt') || medium.includes('statue') ||
          medium.includes('bust') || medium.includes('relief') || medium.includes('figurine') ||
          department.includes('sculpture') || title.includes('statue') || title.includes('bust')
        );
      
      case 'photography':
        return museumMatch && (
          medium.includes('photo') || medium.includes('gelatin') || medium.includes('albumen') ||
          medium.includes('cyanotype') || medium.includes('daguerreotype') ||
          medium.includes('silver print') || medium.includes('platinum') || medium.includes('palladium') ||
          medium.includes('tintype') || medium.includes('ambrotype') ||
          department.includes('photo') || title.includes('photograph')
        );
      
      case 'drawing':
        return museumMatch && (
          medium.includes('draw') || medium.includes('sketch') || medium.includes('charcoal') || 
          medium.includes('pencil') || medium.includes('graphite') || medium.includes('chalk') ||
          medium.includes('pastel') || medium.includes('crayon') || medium.includes('ink on paper') ||
          medium.includes('pen and ink') || medium.includes('conte') || medium.includes('sanguine') ||
          medium.includes('silverpoint') || medium.includes('wash') ||
          department.includes('draw') || department.includes('works on paper') ||
          title.includes('sketch') || title.includes('study')
        );
      
      case 'print':
        return museumMatch && (
          medium.includes('print') || medium.includes('etching') || medium.includes('lithograph') || 
          medium.includes('woodcut') || medium.includes('engraving') || medium.includes('silkscreen') ||
          medium.includes('screenprint') || medium.includes('linocut') || medium.includes('aquatint') ||
          medium.includes('mezzotint') || medium.includes('drypoint') || medium.includes('monotype') ||
          medium.includes('woodblock') || medium.includes('chine-coll') ||
          department.includes('prints') || department.includes('print')
        );
      
      case 'ceramic':
        return museumMatch && (
          medium.includes('ceramic') || medium.includes('pottery') || medium.includes('porcelain') || 
          medium.includes('earthenware') || medium.includes('stoneware') || medium.includes('faience') ||
          medium.includes('majolica') || medium.includes('raku') || medium.includes('terra cotta') ||
          medium.includes('vessel') || medium.includes('jar') || medium.includes('vase') ||
          department.includes('ceramic') || title.includes('vase') || title.includes('jar')
        );
      
      case 'textile':
        return museumMatch && (
          medium.includes('textile') || medium.includes('fabric') || medium.includes('tapestry') ||
          medium.includes('embroidery') || medium.includes('weaving') ||
          department.includes('textile')
        );
      
      case 'glass':
        return museumMatch && (
          medium.includes('glass') || medium.includes('stained glass') || medium.includes('blown glass') ||
          department.includes('glass')
        );
      
      case 'decorative':
        return museumMatch && (
          medium.includes('metal') || medium.includes('gold') || medium.includes('silver') || 
          medium.includes('jewelry') || medium.includes('wood') || medium.includes('furniture') ||
          department.includes('metalwork') || department.includes('jewelry') ||
          department.includes('furniture') || department.includes('decorative arts')
        );
      
      case 'ancient':
        return museumMatch && (
          department.includes('ancient') || department.includes('greek') || department.includes('roman') ||
          department.includes('egyptian') || department.includes('near eastern') ||
          department.includes('medieval')
        );
      
      case 'asian':
        return museumMatch && (
          department.includes('asian') || department.includes('chinese') || department.includes('japanese') ||
          department.includes('indian') || department.includes('korean')
        );
      
      case 'modern':
        return museumMatch && (
          department.includes('modern') || department.includes('contemporary')
        );
      
      case 'manuscript':
        return museumMatch && (medium.includes('manuscript') || medium.includes('illuminated') || medium.includes('book') || department.includes('manuscript'));
      default:
        return museumMatch;
    }
  });

  // --------------------------------------------
  // LABELS TRADUZIDOS
  // --------------------------------------------
  const labels = {
    title: language === 'pt' ? 'Explore Obras de Arte' : 'Explore Artworks',
    subtitle: language === 'pt' ? 'Busque por artistas, títulos, temas ou períodos' : 'Search by artists, titles, themes or periods',
    searchPlaceholder: language === 'pt' ? 'Busque por obras, artistas...' : 'Search for artworks, artists...',
    all: language === 'pt' ? 'Todos' : 'All',
    loading: language === 'pt' ? 'Carregando obras...' : 'Loading artworks...',
    noResults: language === 'pt' ? 'Nenhuma obra encontrada' : 'No artworks found',
    tryAgain: language === 'pt' ? 'Tente uma nova busca ou ajuste os filtros' : 'Try a new search or adjust the filters',
    artworkType: language === 'pt' ? 'Tipo de Obra' : 'Artwork Type',
    allTypes: language === 'pt' ? 'Todos os Tipos' : 'All Types',
    painting: language === 'pt' ? 'Pintura' : 'Painting',
    sculpture: language === 'pt' ? 'Escultura' : 'Sculpture',
    photography: language === 'pt' ? 'Fotografia' : 'Photography',
    drawing: language === 'pt' ? 'Desenho' : 'Drawing',
    print: language === 'pt' ? 'Gravura' : 'Print',
    ceramic: language === 'pt' ? 'Cerâmica' : 'Ceramic',
    textile: language === 'pt' ? 'Têxtil' : 'Textile',
    glass: language === 'pt' ? 'Vidro' : 'Glass',
    decorative: language === 'pt' ? 'Artes Decorativas' : 'Decorative Arts',
    ancient: language === 'pt' ? 'Arte Antiga' : 'Ancient Art',
    asian: language === 'pt' ? 'Arte Asiática' : 'Asian Art',
    modern: language === 'pt' ? 'Arte Moderna' : 'Modern Art',
    manuscript: language === 'pt' ? 'Manuscrito' : 'Manuscript',
    clearFilters: language === 'pt' ? 'Limpar Filtros' : 'Clear Filters',
  };

  // Função para limpar filtros
  const clearFilters = () => {
    setSelectedMuseum('all');
    setSelectedType('all');
    setSearchQuery('');
    sessionStorage.removeItem('filter-museum');
    sessionStorage.removeItem('filter-type');
    sessionStorage.removeItem('filter-query');
    loadInitialArtworks();
  };

  // Verificar se há filtros ativos
  const hasActiveFilters = searchQuery.trim() !== '' || selectedMuseum !== 'all' || selectedType !== 'all';

  // --------------------------------------------
  // RENDER
  // --------------------------------------------
  return (
    <>
      {/* <Header */}
      <div className="obras-page">
      <div className="obras-header">
        <h1>{labels.title}</h1>
        <p>{labels.subtitle}</p>
      </div>

      {/* Barra de Busca */}
      <SearchBar onSearch={handleSearch} placeholder={labels.searchPlaceholder} value={searchQuery} />

      {/* Container de Filtros */}
      <div className="filters-container">
        {/* Filtros de Museu */}
        <div className="museum-filters">
          <button
            className={`filter-button ${selectedMuseum === 'all' ? 'active' : ''}`}
            onClick={() => {
              setSelectedMuseum('all');
              sessionStorage.setItem('filter-museum', 'all');
            }}
          >
            {language === 'pt' ? 'Todos os Museus' : 'All Museums'}
          </button>
          <button
            className={`filter-button ${selectedMuseum === 'artic' ? 'active' : ''}`}
            onClick={() => {
              setSelectedMuseum('artic');
              sessionStorage.setItem('filter-museum', 'artic');
            }}
          >
            Art Institute of Chicago
          </button>
          <button
            className={`filter-button ${selectedMuseum === 'met' ? 'active' : ''}`}
            onClick={() => {
              setSelectedMuseum('met');
              sessionStorage.setItem('filter-museum', 'met');
            }}
          >
            MET Museum
          </button>
        </div>

        {/* Filtro de Tipo de Obra */}
        {searchQuery.trim() !== '' && (
        <div className="type-filter-section">
          <div className="type-filter-row">
            <select
              id="type-filter"
              value={selectedType}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedType(value);
                sessionStorage.setItem('filter-type', value);
              }}
              className="type-filter-select"
            >
              <option value="all">{labels.allTypes}</option>
              {availableTypes.has('painting') && <option value="painting">{labels.painting}</option>}
              {availableTypes.has('sculpture') && <option value="sculpture">{labels.sculpture}</option>}
              {availableTypes.has('photography') && <option value="photography">{labels.photography}</option>}
              {availableTypes.has('drawing') && <option value="drawing">{labels.drawing}</option>}
              {availableTypes.has('print') && <option value="print">{labels.print}</option>}
              {availableTypes.has('ceramic') && <option value="ceramic">{labels.ceramic}</option>}
              {availableTypes.has('decorative') && <option value="decorative">{labels.decorative}</option>}
              {availableTypes.has('textile') && <option value="textile">{labels.textile}</option>}
              {availableTypes.has('glass') && <option value="glass">{labels.glass}</option>}
              {availableTypes.has('ancient') && <option value="ancient">{labels.ancient}</option>}
              {availableTypes.has('asian') && <option value="asian">{labels.asian}</option>}
              {availableTypes.has('modern') && <option value="modern">{labels.modern}</option>}
              {availableTypes.has('manuscript') && <option value="manuscript">{labels.manuscript}</option>}
            </select>
            {/* Botão de Limpar Filtros */}
            {hasActiveFilters && (
              <button onClick={clearFilters} className="clear-filters-button">
                {labels.clearFilters}
              </button>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Resultados */}
      <div className="obras-results">
        {searchQuery && (
          <p className="search-info">
            {language === 'pt' 
              ? `Mostrando ${filteredArtworks.length} resultados para "${searchQuery}"`
              : `Showing ${filteredArtworks.length} results for "${searchQuery}"`
            }
          </p>
        )}

        {/* Loading */}
        {loading ? (
          <Loading />
        ) : filteredArtworks.length > 0 ? (
          /* Grid de Obras */
          <div className="artworks-grid">
            {filteredArtworks.map((artwork) => (
              <ArtworkCard key={`${artwork.museum}-${artwork.id}`} artwork={artwork} language={language} />
            ))}
          </div>
        ) : (
          /* Mensagem quando não há resultados */
          <div className="no-results">
            <div className="no-results-icon"></div>
            <h3>{labels.noResults}</h3>
            <p>{language === 'pt' ? 'Tente ajustar sua busca ou limpar os filtros' : 'Try adjusting your search or clearing filters'}</p>
            <button onClick={loadInitialArtworks} className="reload-button">
              {language === 'pt' ? 'Carregar obras novamente' : 'Load artworks again'}
            </button>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
