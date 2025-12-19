// ============================================
// COMPONENTE: ARTWORK CARD (CARTÃO DE OBRA)
// ============================================
// Este componente exibe uma obra de arte em formato de cartão
// Mostra imagem, título, artista e permite clicar para ver detalhes

import Link from 'next/link';
import { Artwork } from '@/types/artwork';
import './ArtworkCard.css';

// --------------------------------------------
// PROPS DO COMPONENTE
// --------------------------------------------
interface ArtworkCardProps {
  artwork: Artwork;  // Os dados da obra que vamos exibir
  language?: 'pt' | 'en';  // Idioma para tradução
}

export default function ArtworkCard({ artwork, language = 'pt' }: ArtworkCardProps) {
  const noImageText = language === 'pt' ? 'Sem imagem disponível' : 'No image available';
  
  return (
    // Link para a página de detalhes da obra
    <Link href={`/obras/${artwork.museum}-${artwork.id}`} className="artwork-card">
      {/* Container da imagem */}
      <div className="artwork-image-container">
        {artwork.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            className="artwork-image"
            loading="lazy"
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            onError={(e) => {
              // Se a imagem falhar, mostra o placeholder
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              if (target.parentElement) {
                target.parentElement.innerHTML = `<div class="artwork-no-image" style="font-size: 3rem">🖼️<div style="font-size: 0.85rem; margin-top: 1rem">${noImageText}</div></div>`;
              }
            }}
          />
        ) : (
          // Fallback caso não tenha imagem
          <div className="artwork-no-image" style={{ fontSize: '3rem' }}>
            🖼️
            <div style={{ fontSize: '0.85rem', marginTop: '1rem' }}>{noImageText}</div>
          </div>
        )}
      </div>

      {/* Informações da obra */}
      <div className="artwork-info">
        <h3 className="artwork-title">{artwork.title}</h3>
        <p className="artwork-artist">{artwork.artist}</p>
        {artwork.date && (
          <p className="artwork-date">{artwork.date}</p>
        )}
        
        {/* Badge indicando o museu de origem */}
        <div className="artwork-museum">
          {artwork.museum === 'artic' ? 'Art Institute of Chicago' : 'MET Museum'}
        </div>
      </div>
    </Link>
  );
}

// --------------------------------------------
// CONCEITOS IMPORTANTES:
// --------------------------------------------
//
// 1. Image (next/image):
//    - Componente do Next.js que otimiza imagens automaticamente
//    - Lazy loading: só carrega quando aparecer na tela
//    - Redimensiona automaticamente
//    - Melhora performance do site
//
// 2. fill:
//    - Faz a imagem preencher todo o container pai
//    - O container precisa ter position: relative
//
// 3. Conditional Rendering (Renderização Condicional):
//    - {artwork.imageUrl ? ... : ...}: if/else em JSX
//    - {artwork.date && ...}: só mostra se existir
//
// 4. Link:
//    - Navega para /obras/[id] onde [id] é o ID da obra
//    - Toda navegação interna deve usar Link (não <a>)

