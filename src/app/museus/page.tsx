// ============================================
// PÁGINA DE MUSEUS
// ============================================
// Rota: /museus
// Esta página mostra museus internacionais (ARTIC e MET) e brasileiros

'use client';

import { useState, useEffect } from 'react';
import Loading from '@/components/Loading';
import { MuseuBrasileiro } from '@/types/artwork';
import { getMuseusBrasileiros } from '@/services/museusBr';
import { translate } from '@/services/translate';
import { useLanguage } from '@/hooks/useLanguage';
import './page.css';

// Dados dos museus internacionais
const getInternationalMuseums = (language: 'pt' | 'en') => [
  {
    id: 'artic',
    name: 'Art Institute of Chicago',
    shortName: 'ARTIC',
    location: 'Chicago, Illinois, USA',
    founded: 1879,
    description: language === 'pt' 
      ? 'Um dos maiores e mais antigos museus de arte dos Estados Unidos, conhecido por sua impressionante coleção impressionista e pós-impressionista.'
      : 'One of the largest and oldest art museums in the United States, known for its impressive Impressionist and Post-Impressionist collection.',
    website: 'https://www.artic.edu',
    imageUrl: '/art-institute.png',
    collection: language === 'pt' ? '300.000+ obras' : '300,000+ artworks',
    highlights: language === 'pt' 
      ? [
          'A Noite Estrelada sobre o Ródano - Vincent van Gogh',
          'Um Domingo na Grande Jatte - Georges Seurat',
          'Nighthawks - Edward Hopper',
          'American Gothic - Grant Wood'
        ]
      : [
          'Starry Night Over the Rhône - Vincent van Gogh',
          'A Sunday on La Grande Jatte - Georges Seurat',
          'Nighthawks - Edward Hopper',
          'American Gothic - Grant Wood'
        ]
  },
  {
    id: 'met',
    name: 'Metropolitan Museum of Art',
    shortName: 'The Met',
    location: 'New York City, New York, USA',
    founded: 1870,
    description: language === 'pt'
      ? 'O maior museu de arte dos Estados Unidos e um dos mais visitados do mundo, abrangendo 5.000 anos de arte mundial.'
      : 'The largest art museum in the United States and one of the most visited in the world, spanning 5,000 years of world art.',
    website: 'https://www.metmuseum.org',
    imageUrl: '/met-museum.webp',
    collection: language === 'pt' ? '2 milhões+ obras' : '2 million+ artworks',
    highlights: language === 'pt'
      ? [
          'Washington Crossing the Delaware - Emanuel Leutze',
          'A Morte de Sócrates - Jacques-Louis David',
          'Exército de Terracota',
          'Templo Egípcio de Dendur'
        ]
      : [
          'Washington Crossing the Delaware - Emanuel Leutze',
          'The Death of Socrates - Jacques-Louis David',
          'Terracotta Army',
          'Egyptian Temple of Dendur'
        ]
  }
];

export default function MuseusPage() {
  const [expandedMuseums, setExpandedMuseums] = useState<string[]>([]);
  const [museusBr, setMuseusBr] = useState<MuseuBrasileiro[]>([]);
  const [loadingBr, setLoadingBr] = useState(true);
  const language = useLanguage();

  // Scroll para o topo ao montar o componente
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const INTERNATIONAL_MUSEUMS = getInternationalMuseums(language);

  const labels = {
    title: language === 'pt' ? 'Museus Parceiros' : 'Partner Museums',
    subtitle: language === 'pt' 
      ? 'Conheça os renomados museus de arte que fazem parte da nossa coleção'
      : 'Discover the renowned art museums that are part of our collection',
    internationalCount: language === 'pt' 
      ? (n: number) => `${n} museus internacionais`
      : (n: number) => `${n} international museums`,
    founded: language === 'pt' ? 'Fundado em' : 'Founded in',
    closeDetails: language === 'pt' ? 'Fechar detalhes' : 'Close details',
    viewDetails: language === 'pt' ? 'Ver detalhes' : 'View details',
    highlights: language === 'pt' ? 'Obras em Destaque:' : 'Featured Works:',
    visitWebsite: language === 'pt' ? 'Visitar Site Oficial' : 'Visit Official Website',
    brazilianTitle: language === 'pt' ? 'Museus Brasileiros' : 'Brazilian Museums',
    brazilianSubtitle: language === 'pt'
      ? 'Explore museus e espaços culturais cadastrados no Ministério da Cultura'
      : 'Explore museums and cultural spaces registered with the Ministry of Culture',
    loading: language === 'pt' ? 'Carregando...' : 'Loading...',
    found: language === 'pt' 
      ? (n: number) => `${n} museus encontrados`
      : (n: number) => `${n} museums found`,
    visitSite: language === 'pt' ? 'Visitar Site' : 'Visit Website',
  };

  // Carregar museus brasileiros ao montar o componente
  useEffect(() => {
    loadMuseusBrasileiros();
  }, []);

  // Recarregar com tradução quando o idioma mudar
  useEffect(() => {
    if (museusBr.length > 0) {
      loadMuseusBrasileiros();
    }
  }, [language]);

  async function loadMuseusBrasileiros() {
    setLoadingBr(true);
    try {
      const data = await getMuseusBrasileiros(10);
      
      // Traduz endereços para inglês se necessário
      if (language === 'en') {
        const translatedData = await Promise.all(
          data.map(async (museu) => {
            const translatedAddress = museu.endereco 
              ? await translate(museu.endereco, 'pt', 'en')
              : '';
            
            return {
              ...museu,
              endereco: translatedAddress || museu.endereco,
            };
          })
        );
        setMuseusBr(translatedData);
      } else {
        setMuseusBr(data);
      }
    } catch (err) {
      // ...erro ao carregar museus brasileiros...
    } finally {
      setLoadingBr(false);
    }
  }

  const toggleMuseum = (id: string) => {
    setExpandedMuseums(prev => 
      prev.includes(id) 
        ? prev.filter(museumId => museumId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="museus-page">
      <div className="museus-header">
        <h1>{labels.title}</h1>
        <p>{labels.subtitle}</p>
        <p className="museus-count">
          {labels.internationalCount(INTERNATIONAL_MUSEUMS.length)}
        </p>
      </div>

      <div className="museus-list">
        {INTERNATIONAL_MUSEUMS.map((museum) => (
          <div 
            key={museum.id} 
            className={`museum-card-large ${expandedMuseums.includes(museum.id) ? 'expanded' : ''}`}
          >
            {/* Imagem do Museu */}
            <div className="museum-image-container">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={museum.imageUrl} 
                alt={museum.name}
                className="museum-image"
                loading="lazy"
              />
              <div className="museum-overlay">
                <h2 className="museum-overlay-title">{museum.shortName}</h2>
              </div>
            </div>

            {/* Informações Básicas */}
            <div className="museum-content">
              <div className="museum-header-info">
                <h3 className="museum-title">{museum.name}</h3>
                <button 
                  className="museum-expand-btn"
                  onClick={() => toggleMuseum(museum.id)}
                  aria-label={expandedMuseums.includes(museum.id) ? labels.closeDetails : labels.viewDetails}
                >
                  {expandedMuseums.includes(museum.id) ? '−' : '+'}
                </button>
              </div>

              <div className="museum-quick-info">
                <span className="museum-location">{museum.location}</span>
                <span className="museum-founded">{labels.founded} {museum.founded}</span>
                <span className="museum-collection">{museum.collection}</span>
              </div>

              {/* Conteúdo Expansível */}
              <div className="museum-expandable">
                <p className="museum-description">{museum.description}</p>
                
                <div className="museum-highlights">
                  <h4>{labels.highlights}</h4>
                  <ul>
                    {museum.highlights.map((highlight, index) => (
                      <li key={index}>{highlight}</li>
                    ))}
                  </ul>
                </div>

                <a 
                  href={museum.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="official-site-btn"
                >
                  {labels.visitWebsite}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Seção de Museus Brasileiros */}
      <div className="museus-header museus-br-section">
        <h2>{labels.brazilianTitle}</h2>
        <p>{labels.brazilianSubtitle}</p>
        {loadingBr ? (
          <p className="museus-count">{labels.loading}</p>
        ) : (
          <p className="museus-count">{labels.found(museusBr.length)}</p>
        )}
      </div>

      {loadingBr ? (
        <Loading />
      ) : (
        <div className="museus-grid-br">
          {museusBr.map((museu) => (
            <div key={museu.id} className="museu-card-br">
              {/* Imagem do Museu Brasileiro */}
              {museu.imageUrl && (
                <div className="museu-image-container-br">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={museu.imageUrl} 
                    alt={museu.name}
                    className="museu-image-br"
                    loading="lazy"
                  />
                </div>
              )}
              
              <div className="museu-content-br">
                <h3 className="museu-name">{museu.name}</h3>
                
                {museu.endereco && (
                  <p className="museu-info">
                    <span className="museu-info-label">Local:</span> {museu.endereco}
                  </p>
                )}

                {museu.telefone && (
                  <p className="museu-info">
                    <span className="museu-info-label">Telefone:</span> {museu.telefone}
                  </p>
                )}
                
                {museu.website && (
                  <a 
                    href={museu.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="museu-website"
                  >
                    {labels.visitSite}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --------------------------------------------
// CONCEITOS IMPORTANTES:
// --------------------------------------------
//
// 1. TRATAMENTO DE ERRO:
//    - Sempre bom ter um estado de erro
//    - Mostra mensagem amigável ao usuário
//    - Oferece opção de tentar novamente
//
// 2. ESTADOS DE UI:
//    - Loading: mostra spinner
//    - Error: mostra mensagem de erro
//    - Success: mostra conteúdo
//    - Empty: mostra mensagem de vazio
//
// 3. CONDITIONAL RENDERING COM &&:
//    - {condition && <Component />}
//    - Só renderiza se condition for true
//    - Útil para campos opcionais
//
// 4. MAP PARA LISTAS:
//    - .map() transforma cada item em JSX
//    - key={} é obrigatório para performance
//    - React usa a key para identificar mudanças
