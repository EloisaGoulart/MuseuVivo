// ============================================
// PÁGINA DE DETALHES DA OBRA
// ============================================
// Rota dinâmica: /obras/[id]
// [id] é um parâmetro dinâmico - pode ser qualquer valor
// Exemplo: /obras/123, /obras/abc, etc.

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import ImageModal from '@/components/ImageModal';
import { Artwork } from '@/types/artwork';
import { getArticArtworkById } from '@/services/artInstitute';
import { getMetArtworkById } from '@/services/metMuseum';
import { translate } from '@/services/translate';
import { useLanguage } from '@/hooks/useLanguage';
import './page.css';

// --------------------------------------------
// COMPONENTE INFO CARD EXPANSÍVEL
// --------------------------------------------
interface InfoCardProps {
  icon: string;
  label: string;
  value: string;
  color: 'bronze' | 'moss' | 'gold' | 'taupe';
}

function InfoCard({ icon, label, value, color }: InfoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={`info-card info-card-${color} ${isExpanded ? 'expanded' : ''}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="info-card-header">
        <span className="info-card-icon">{icon}</span>
        <span className="info-card-label">{label}</span>
        <span className="info-card-toggle">{isExpanded ? '−' : '+'}</span>
      </div>
      <div className="info-card-content">
        <p className="info-card-value">{value}</p>
      </div>
    </div>
  );
}

// --------------------------------------------
// PROPS COM PARÂMETROS
// --------------------------------------------
// O Next.js passa automaticamente os parâmetros da URL via props
// Se a URL é /obras/123, então params.id será "123"
interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ObraDetalhePage({ params }: PageProps) {
  const router = useRouter();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [artworkId, setArtworkId] = useState<string>('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const language = useLanguage();

  // --------------------------------------------
  // GARANTIR SCROLL NO TOPO AO MONTAR
  // --------------------------------------------
  useEffect(() => {
    // Força scroll para o topo quando o componente monta
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // --------------------------------------------
  // CARREGAR PARÂMETROS
  // --------------------------------------------
  useEffect(() => {
    params.then(p => {
      setArtworkId(p.id);
    });
  }, [params]);

  // --------------------------------------------
  // CARREGAR DADOS DA OBRA
  // --------------------------------------------
  useEffect(() => {
    if (artworkId) {
      // Força scroll para o topo ao carregar nova obra
      window.scrollTo({ top: 0, behavior: 'instant' });
      loadArtwork();
    }
  }, [artworkId]); // Re-executa se o ID mudar
  // Re-traduz quando o idioma muda
  useEffect(() => {
    if (artwork && artworkId) {
      loadArtwork();
    }
  }, [language, artworkId]);

  async function loadArtwork() {
    setLoading(true);
    setError(false);

    try {
      let result = null;
      // Extrai o museu e ID do parâmetro
      const [museum, ...idParts] = artworkId.split('-');
      const actualId = idParts.join('-');
      if (!museum || !actualId) {
        setError(true);
        return;
      }
      // Busca direto no museu correto
      if (museum === 'artic') {
        result = await getArticArtworkById(actualId);
      } else if (museum === 'met') {
        result = await getMetArtworkById(actualId);
      } else {
        setError(true);
        return;
      }
      if (result) {
        // Sempre traduz baseado no idioma selecionado
        if (language === 'pt') {
          // Traduz EN -> PT
          const translations = await Promise.all([
            translate(result.title, 'en', 'pt'),
            translate(result.artist, 'en', 'pt'),
            result.medium ? translate(result.medium, 'en', 'pt') : Promise.resolve(''),
            result.department ? translate(result.department, 'en', 'pt') : Promise.resolve(''),
            result.dimensions ? translate(result.dimensions, 'en', 'pt') : Promise.resolve(''),
            result.date ? translate(result.date, 'en', 'pt') : Promise.resolve(''),
            result.description ? translate(result.description, 'en', 'pt') : Promise.resolve(''),
          ]);
          setArtwork({
            ...result,
            title: translations[0] || result.title,
            artist: translations[1] || result.artist,
            medium: translations[2] || result.medium,
            department: translations[3] || result.department,
            dimensions: translations[4] || result.dimensions,
            date: translations[5] || result.date,
            description: translations[6] || result.description,
          });
        } else {
          // Em inglês, sempre exibe o texto original (que já é inglês ou o mais próximo do original)
          setArtwork(result);
        }
      } else {
        setError(true);
      }
    } catch (err) {
      // ...erro ao carregar obra...
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------
  // ESTADOS DE LOADING E ERRO
  // --------------------------------------------
  if (loading) {
    return <Loading />;
  }

  if (error || !artwork) {
    return (
      <div className="error-page">
        <div className="error-icon"></div>
        <h1>{language === 'pt' ? 'Obra não encontrada' : 'Artwork not found'}</h1>
        <p>{language === 'pt' ? 'Desculpe, não conseguimos encontrar esta obra.' : 'Sorry, we could not find this artwork.'}</p>
        <Link href="/obras" className="back-button">
          ← {language === 'pt' ? 'Voltar para Obras' : 'Back to Artworks'}
        </Link>
      </div>
    );
  }

  // --------------------------------------------
  // RENDER DOS DETALHES
  // --------------------------------------------
  const labels = {
    back: language === 'pt' ? '← Voltar' : '← Back',
    backToObras: language === 'pt' ? '← Voltar para Obras' : '← Back to Artworks',
    noImage: language === 'pt' ? 'Imagem não disponível' : 'Image not available',
    artist: language === 'pt' ? 'Artista' : 'Artist',
    date: language === 'pt' ? 'Data' : 'Date',
    technique: language === 'pt' ? 'Técnica' : 'Medium',
    dimensions: language === 'pt' ? 'Dimensões' : 'Dimensions',
    department: language === 'pt' ? 'Departamento' : 'Department',
    share: language === 'pt' ? 'Compartilhar Obra' : 'Share Artwork',
    copied: language === 'pt' ? 'Link copiado!' : 'Link copied!',  
  };

  // Função para voltar corretamente
  function handleBack() {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push('/obras');
    }
  }

  return (
    <div className="obra-detalhe-page">
      {/* Botão Circular Voltar */}
      <button className="back-circle-button improved" title={labels.back} onClick={handleBack} type="button">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>

      <div className="obra-content">
        {/* Imagem da Obra */}
        <div className="obra-image-section">
          {artwork.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              className="obra-image obra-image-zoomable"
              loading="eager"
              onClick={() => setShowImageModal(true)}
              title="Clique para ampliar"
              onError={(e) => {
                // Se a imagem falhar, mostra o placeholder
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                if (target.parentElement) {
                  target.parentElement.innerHTML = `<div class="obra-no-image"><div>${labels.noImage}</div></div>`;
                }
              }}
            />
          ) : (
            <div className="obra-no-image">
              <div>{labels.noImage}</div>
            </div>
          )}
        </div>

        {/* Informações da Obra */}
        <div className="obra-info-section">
          {/* Badge do Museu */}
          <div className="museum-badge">
            {artwork.museum === 'artic' ? 'Art Institute of Chicago' : 'Metropolitan Museum of Art'}
          </div>

          {/* Título da Obra */}
          <h1 className="obra-title">{artwork.title}</h1>

          {/* Cards de Informações Expansíveis */}
          <div className="info-cards-container">
            {artwork.artist && (
              <InfoCard
                icon=""
                label={labels.artist}
                value={artwork.artist}
                color="bronze"
              />
            )}
            {artwork.date && (
              <InfoCard
                icon=""
                label={labels.date}
                value={artwork.date}
                color="moss"
              />
            )}
            {artwork.medium && (
              <InfoCard
                icon=""
                label={labels.technique}
                value={artwork.medium}
                color="gold"
              />
            )}
            {artwork.dimensions && (
              <InfoCard
                icon=""
                label={labels.dimensions}
                value={artwork.dimensions}
                color="taupe"
              />
            )}
            {artwork.department && (
              <InfoCard
                icon=""
                label={labels.department}
                value={artwork.department}
                color="moss"
              />
            )}
            {/* Descrição traduzida, se existir */}
            {artwork.description && (
              <InfoCard
                icon=""
                label={language === 'pt' ? 'Descrição' : 'Description'}
                value={artwork.description}
                color="gold"
              />
            )}
          </div>

          {/* Botão para compartilhar */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setShowCopiedToast(true);
              setTimeout(() => setShowCopiedToast(false), 2000);
            }}
            className="share-button"
          >
            {labels.share}
          </button>

          {/* Toast de confirmação */}
          {showCopiedToast && (
            <div className="copy-toast">
              {labels.copied}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Zoom */}
      {showImageModal && artwork?.imageUrl && (
        <ImageModal
          src={artwork.imageUrl}
          alt={artwork.title}
          onClose={() => setShowImageModal(false)}
          language={language}
        />
      )}
    </div>
  );
}

// --------------------------------------------
// CONCEITOS IMPORTANTES:
// --------------------------------------------
//
// 1. ROTA DINÂMICA [id]:
//    - Colchetes no nome do arquivo significam parâmetro dinâmico
//    - /obras/[id]/page.tsx aceita qualquer valor no lugar de [id]
//    - O valor fica disponível em params.id
//
// 2. DEPENDÊNCIA NO useEffect:
//    - useEffect(..., [params.id])
//    - Quando params.id muda, o effect roda novamente
//    - Útil quando navegamos de uma obra para outra
//
// 3. ESTADOS MÚLTIPLOS:
//    - loading: se está carregando
//    - error: se houve erro
//    - artwork: os dados da obra
//    - Cada estado controla uma parte da UI
//
// 4. EARLY RETURN:
//    - if (loading) return <Loading />
//    - Saímos cedo da função em casos especiais
//    - Evita renderizar o conteúdo principal em estados inválidos
//
// 5. NAVIGATOR.CLIPBOARD:
//    - API do navegador para copiar texto
//    - Útil para funcionalidades de compartilhamento
