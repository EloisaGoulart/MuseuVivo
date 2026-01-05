// ============================================
// PÁGINA HOME (INICIAL)
// ============================================
//
// ARQUITETURA DO PROJETO:
// - API PRINCIPAL: Art Institute of Chicago (ARTIC)
//   * Endpoint: https://api.artic.edu/api/v1/artworks
//   * Campos principais: id, title, artist_display, date_display, image_id
//
// - API COMPLEMENTAR: Metropolitan Museum of Art (MET)
//   * Endpoint: https://collectionapi.metmuseum.org/public/collection/v1
//
// - API DE MUSEUS: MuseusBR (com fallback para dados estáticos)
//   * Endpoint: http://museus.cultura.gov.br/api/space/find
//
// - API DE TRADUÇÃO: LibreTranslate
//   * Endpoint: https://libretranslate.com/translate
//   * Traduz conteúdo (PT/EN)

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ArtworkCard from '@/components/ArtworkCard';
import Loading from '@/components/Loading';
import { Artwork } from '@/types/artwork';
import { getArticArtworks } from '@/services/artInstitute';
import { getRandomMetArtworks } from '@/services/metMuseum';
import { translate } from '@/services/translate';
import { useLanguage } from '@/hooks/useLanguage';
import './page.css';

export default function Home() {
  const [featuredArtworks, setFeaturedArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const language = useLanguage();

  // Scroll para o topo ao montar o componente
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    loadArtworks();
  }, []);

  useEffect(() => {
    if (featuredArtworks.length > 0) {
      loadArtworks();
    }
  }, [language]);

  async function loadArtworks() {
    setLoading(true);
    try {
      // MET Museum: API PRINCIPAL 
      // Art Institute of Chicago: API COMPLEMENTAR 
      const [metArtworks, articData] = await Promise.all([
        getRandomMetArtworks(30),      
        getArticArtworks(1, 40),     
      ]);

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
        
        // Validação de medium e department
        const hasMedium = artwork.medium && artwork.medium.trim() !== '';
        const hasDepartment = artwork.department && artwork.department.trim() !== '';
        
        // Filtro adicional: evita obras com títulos que contêm múltiplos anos/datas (ex: 1428–1501)
        const hasMultipleDates = artwork.title && /\d{4}[–-]\d{4}/.test(artwork.title);
        
        return hasValidImage && hasTitle && hasArtist && hasMedium && hasDepartment && !hasMultipleDates;
      };

      const validMetArtworks = metArtworks.filter(isCompleteArtwork);
      const validArticArtworks = articData.artworks.filter(isCompleteArtwork);

      // Total: 10 MET + 10 ARTIC = 20 obras em destaque 
      const artworks = [
        ...validMetArtworks.slice(0, 10),     // 10 obras do MET (principal)
        ...validArticArtworks.slice(0, 10),   // 10 obras do ARTIC
      ];

      // Não traduz na homepage 
      setFeaturedArtworks(artworks);
    } catch (error) {
      // ...erro ao carregar obras...
    } finally {
      setLoading(false);
    }
  }

  const labels = {
    welcome: language === 'pt' ? 'Bem-vindo ao Museu Vivo' : 'Welcome to Living Museum',
    description: language === 'pt' 
      ? 'Explore milhares de obras de arte dos maiores museus do mundo.'
      : 'Explore thousands of artworks from the world\'s greatest museums.',
    museums: language === 'pt'
      ? 'Art Institute of Chicago e Metropolitan Museum of Art ao seu alcance.'
      : 'Art Institute of Chicago and Metropolitan Museum of Art at your fingertips.',
    exploreButton: language === 'pt' ? 'Explorar Obras de Arte' : 'Explore Artworks',
    featured: language === 'pt' ? 'Obras em Destaque' : 'Featured Artworks',
    about: language === 'pt' ? 'Sobre o Projeto' : 'About the Project',
    objective: language === 'pt' ? 'Objetivo' : 'Objective',
    objectiveText: language === 'pt'
      ? 'Projeto educacional para estudo de desenvolvimento front-end com Next.js, TypeScript, consumo de APIs e boas práticas de código.'
      : 'Educational project for studying front-end development with Next.js, TypeScript, API consumption and code best practices.',
    integratedMuseums: language === 'pt' ? 'Museus Integrados' : 'Integrated Museums',
    museumsText: language === 'pt'
      ? 'Art Institute of Chicago, Metropolitan Museum of Art e Museus Brasileiros. Milhares de obras disponíveis para exploração.'
      : 'Art Institute of Chicago, Metropolitan Museum of Art and Brazilian Museums. Thousands of artworks available for exploration.',
    translation: language === 'pt' ? '🌍 Tradução Automática' : '🌍 Automatic Translation',
    translationText: language === 'pt'
      ? 'Integração com API de tradução para converter automaticamente conteúdos em inglês para português.'
      : 'Integration with translation API to automatically convert English content to Portuguese.',
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="home-page">
      {/* Seção Hero (Principal) */}
      <section className="hero-section">
        <div className="hero-logo-wrapper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="Museu Vivo" className="hero-logo" />
        </div>
        <h1 className="hero-title">{labels.welcome}</h1>
        <p className="hero-description">{labels.description}</p>
        <p className="hero-subtitle">{labels.museums}</p>
        <Link href="/obras" className="hero-button">
          {labels.exploreButton}
        </Link>
      </section>

      {/* Seção de Obras em Destaque */}
      <section className="featured-section">
        <h2 className="section-title">{labels.featured}</h2>
        <div className="artworks-grid">
          {featuredArtworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} language={language} />
          ))}
        </div>
      </section>
    </div>
  );
}
