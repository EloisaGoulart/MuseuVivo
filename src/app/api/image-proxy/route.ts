import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Pega o image_id dos parâmetros de busca
  const searchParams = request.nextUrl.searchParams;
  const imageId = searchParams.get('id');
  const size = searchParams.get('size') || '843,';

  if (!imageId) {
    return NextResponse.json({ error: 'Image ID é obrigatório' }, { status: 400 });
  }

  try {
    // URL da imagem 
    const imageUrl = `https://www.artic.edu/iiif/2/${imageId}/full/${size}/0/default.jpg`;

    // Busca a imagem do Art Institute
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.artic.edu/',
        'Accept': 'image/jpeg,image/webp,image/avif,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      cache: 'force-cache',
    });

    if (!imageResponse.ok) {
      
      // Retorna imagem placeholder transparente
      const placeholderSvg = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="#f0f0f0"/>
        <text x="50%" y="50%" text-anchor="middle" font-size="16" fill="#999">Imagem indisponível</text>
      </svg>`;
      
      return new NextResponse(placeholderSvg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // Pega o buffer da imagem
    const imageBuffer = await imageResponse.arrayBuffer();

    // Retorna a imagem com headers corretos
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': imageResponse.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    
    // Retorna SVG placeholder em caso de erro
    const errorSvg = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="400" fill="#f5f5f5"/>
      <text x="50%" y="45%" text-anchor="middle" font-size="40" fill="#ccc">🖼️</text>
      <text x="50%" y="60%" text-anchor="middle" font-size="14" fill="#999">Erro ao carregar</text>
    </svg>`;
    
    return new NextResponse(errorSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60',
      },
    });
  }
}
