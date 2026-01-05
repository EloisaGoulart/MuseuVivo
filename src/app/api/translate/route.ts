import { NextRequest, NextResponse } from 'next/server';

// Cache em memória
const cache = new Map<string, string>();

/**
 * Traduz usando Google Translate
 */
async function translateWithGoogleAPI(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string | null> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      // ...Google Translate erro status...
      return null;
    }
    
    const data = await response.json();
    
    // Google Translate retorna: [[["texto traduzido", "texto original", null, null, 10]]]
    if (data && Array.isArray(data) && data[0] && Array.isArray(data[0])) {
      const translated = data[0].map((item: any) => item[0]).join('');
      
      if (translated && translated.trim() && translated !== text) {
        return translated;
      }
    }
    
    return null;
  } catch (error) {
    // ...Google Translate erro desconhecido...
    return null;
  }
}

// Dicionário de tradução para termos de arte 
const dictionary: Record<string, string> = {
  // Técnicas e Materiais
  'oil on canvas': 'óleo sobre tela',
  'oil on panel': 'óleo sobre painel',
  'oil on wood': 'óleo sobre madeira',
  'oil on board': 'óleo sobre placa',
  'oil paint': 'tinta a óleo',
  'oil painting': 'pintura a óleo',
  'watercolor': 'aquarela',
  'watercolor on paper': 'aquarela sobre papel',
  'acrylic': 'acrílico',
  'acrylic on canvas': 'acrílico sobre tela',
  'tempera': 'têmpera',
  'gouache': 'guache',
  'ink': 'tinta',
  'ink on paper': 'tinta sobre papel',
  'charcoal': 'carvão',
  'graphite': 'grafite',
  'pastel': 'pastel',
  'pencil': 'lápis',
  'pen': 'caneta',
  'brush': 'pincel',
  'opaque watercolor': 'aquarela opaca',
  'fresco': 'afresco',
  'encaustic': 'encáustica',
  'mixed media': 'técnica mista',
  'collage': 'colagem',
  'etching': 'gravura em metal',
  'engraving': 'gravura',
  'lithograph': 'litografia',
  'woodcut': 'xilogravura',
  'screen print': 'serigrafia',
  'silkscreen': 'serigrafia',
  'print on paper': 'impressão em papel',
  
  // Materiais
  'bronze': 'bronze',
  'marble': 'mármore',
  'wood': 'madeira',
  'clay': 'argila',
  'terracotta': 'terracota',
  'ceramic': 'cerâmica',
  'porcelain': 'porcelana',
  'glass': 'vidro',
  'gold': 'ouro',
  'silver': 'prata',
  'copper': 'cobre',
  'brass': 'latão',
  'iron': 'ferro',
  'steel': 'aço',
  'aluminum': 'alumínio',
  'stone': 'pedra',
  'limestone': 'calcário',
  'sandstone': 'arenito',
  'granite': 'granito',
  'alabaster': 'alabastro',
  'jade': 'jade',
  'ivory': 'marfim',
  'bone': 'osso',
  'shell': 'concha',
  'mother of pearl': 'madrepérola',
  'silk': 'seda',
  'linen': 'linho',
  'cotton': 'algodão',
  'wool': 'lã',
  'velvet': 'veludo',
  'leather': 'couro',
  'paper': 'papel',
  'parchment': 'pergaminho',
  'vellum': 'velino',
  'canvas': 'tela',
  'panel': 'painel',
  'board': 'placa',
  'cardboard': 'papelão',
  'plaster': 'gesso',
  'wax': 'cera',
  'resin': 'resina',
  'plastic': 'plástico',
  
  // Departamentos e Coleções (MUITO EXPANDIDO)
  'painting': 'pintura',
  'paintings': 'pinturas',
  'european paintings': 'pinturas europeias',
  'american paintings': 'pinturas americanas',
  'modern paintings': 'pinturas modernas',
  'sculpture': 'escultura',
  'sculptures': 'esculturas',
  'european sculpture': 'escultura europeia',
  'modern sculpture': 'escultura moderna',
  'drawing': 'desenho',
  'drawings': 'desenhos',
  'drawings and prints': 'desenhos e gravuras',
  'print': 'gravura',
  'prints': 'gravuras',
  'prints and drawings': 'gravuras e desenhos',
  'photograph': 'fotografia',
  'photographs': 'fotografias',
  'photography': 'fotografia',
  'modern and contemporary art': 'arte moderna e contemporânea',
  'decorative arts': 'artes decorativas',
  'decorative arts and design': 'artes decorativas e design',
  'applied arts': 'artes aplicadas',
  'design': 'design',
  'architecture and design': 'arquitetura e design',
  
  // Artes Regionais
  'islamic art': 'arte islâmica',
  'the art of the islamic world': 'arte do mundo islâmico',
  'arts of the islamic world': 'artes do mundo islâmico',
  'asian art': 'arte asiática',
  'arts of asia': 'artes da ásia',
  'chinese art': 'arte chinesa',
  'japanese art': 'arte japonesa',
  'korean art': 'arte coreana',
  'south asian art': 'arte do sul da ásia',
  'southeast asian art': 'arte do sudeste asiático',
  'indian art': 'arte indiana',
  'himalayan art': 'arte himalaia',
  'tibetan art': 'arte tibetana',
  'persian art': 'arte persa',
  'iranian art': 'arte iraniana',
  'near eastern art': 'arte do oriente próximo',
  'middle eastern art': 'arte do oriente médio',
  'european art': 'arte europeia',
  'arts of europe': 'artes da europa',
  'northern european art': 'arte do norte da europa',
  'southern european art': 'arte do sul da europa',
  'italian art': 'arte italiana',
  'french art': 'arte francesa',
  'spanish art': 'arte espanhola',
  'dutch art': 'arte holandesa',
  'flemish art': 'arte flamenga',
  'german art': 'arte alemã',
  'british art': 'arte britânica',
  'russian art': 'arte russa',
  'american art': 'arte americana',
  'arts of the americas': 'artes das américas',
  'north american art': 'arte norte-americana',
  'latin american art': 'arte latino-americana',
  'pre-columbian art': 'arte pré-colombiana',
  'native american art': 'arte nativa americana',
  'african art': 'arte africana',
  'arts of africa': 'artes da áfrica',
  'arts of africa, oceania, and the americas': 'artes da áfrica, oceania e américas',
  'sub-saharan african art': 'arte da áfrica subsaariana',
  'oceanic art': 'arte oceânica',
  'arts of oceania': 'artes da oceania',
  'pacific islands art': 'arte das ilhas do pacífico',
  'aboriginal art': 'arte aborígene',
  
  // Períodos Históricos
  'ancient art': 'arte antiga',
  'ancient near eastern art': 'arte do antigo oriente próximo',
  'ancient egypt': 'egito antigo',
  'egyptian art': 'arte egípcia',
  'ancient egyptian art': 'arte do egito antigo',
  'mesopotamian art': 'arte mesopotâmica',
  'greek art': 'arte grega',
  'greek and roman art': 'arte grega e romana',
  'ancient greek and roman art': 'arte grega e romana antiga',
  'classical art': 'arte clássica',
  'roman art': 'arte romana',
  'etruscan art': 'arte etrusca',
  'byzantine art': 'arte bizantina',
  'medieval art': 'arte medieval',
  'medieval european art': 'arte medieval europeia',
  'the middle ages': 'idade média',
  'romanesque art': 'arte românica',
  'gothic art': 'arte gótica',
  'renaissance': 'renascença',
  'renaissance art': 'arte renascentista',
  'early renaissance': 'início da renascença',
  'high renaissance': 'alta renascença',
  'northern renaissance': 'renascença do norte',
  'italian renaissance': 'renascença italiana',
  'baroque': 'barroco',
  'baroque art': 'arte barroca',
  'rococo': 'rococó',
  'rococo art': 'arte rococó',
  'neoclassical': 'neoclássico',
  'neoclassicism': 'neoclassicismo',
  'romanticism': 'romantismo',
  'romantic art': 'arte romântica',
  'realism': 'realismo',
  'impressionism': 'impressionismo',
  'post-impressionism': 'pós-impressionismo',
  'modern art': 'arte moderna',
  'modernism': 'modernismo',
  'contemporary art': 'arte contemporânea',
  '19th-century art': 'arte do século 19',
  '20th-century art': 'arte do século 20',
  '21st-century art': 'arte do século 21',
  
  // Tipos de Objetos
  'arms and armor': 'armas e armaduras',
  'arms and armour': 'armas e armaduras',
  'weapons': 'armas',
  'armor': 'armadura',
  'armour': 'armadura',
  'musical instruments': 'instrumentos musicais',
  'textiles': 'têxteis',
  'textile arts': 'artes têxteis',
  'costume': 'traje',
  'costumes': 'trajes',
  'costume and textiles': 'trajes e têxteis',
  'fashion': 'moda',
  'fashion and textiles': 'moda e têxteis',
  'jewelry': 'joalheria',
  'jewellery': 'joalheria',
  'gems and jewelry': 'gemas e joias',
  'furniture': 'mobiliário',
  'furniture and woodwork': 'mobiliário e marcenaria',
  'metalwork': 'trabalho em metal',
  'metal': 'metal',
  'gold and silver': 'ouro e prata',
  'goldwork': 'ourivesaria',
  'silverwork': 'prataria',
  'bronzes': 'bronzes',
  'ceramics': 'cerâmica',
  'ceramics and glass': 'cerâmica e vidro',
  'pottery': 'cerâmica',
  'glasswork': 'trabalho em vidro',
  'manuscripts': 'manuscritos',
  'manuscripts and rare books': 'manuscritos e livros raros',
  'illuminated manuscripts': 'manuscritos iluminados',
  'books': 'livros',
  'books and manuscripts': 'livros e manuscritos',
  'rare books': 'livros raros',
  'illustrated books': 'livros ilustrados',
  'coins': 'moedas',
  'coins and medals': 'moedas e medalhas',
  'numismatics': 'numismática',
  'medals': 'medalhas',
  'seals': 'selos',
  'clocks and watches': 'relógios',
  'scientific instruments': 'instrumentos científicos',
  'tapestries': 'tapeçarias',
  'carpets': 'tapetes',
  'rugs': 'tapetes',
  'lacquer': 'laca',
  'enamel': 'esmalte',
  'miniatures': 'miniaturas',
  'architectural elements': 'elementos arquitetônicos',
  'architectural fragments': 'fragmentos arquitetônicos',
  'architectural drawings': 'desenhos arquitetônicos',
  'architectural models': 'maquetes arquitetônicas',
  
  // Tipos de obra
  'portrait': 'retrato',
  'self-portrait': 'autorretrato',
  'group portrait': 'retrato de grupo',
  'landscape': 'paisagem',
  'seascape': 'paisagem marinha',
  'cityscape': 'paisagem urbana',
  'still life': 'natureza-morta',
  'interior': 'interior',
  'nude': 'nu',
  'figure': 'figura',
  'figures': 'figuras',
  'scene': 'cena',
  'view': 'vista',
  'study': 'estudo',
  'sketch': 'esboço',
  'composition': 'composição',
  'allegory': 'alegoria',
  'battle scene': 'cena de batalha',
  'genre scene': 'cena de gênero',
  'biblical scene': 'cena bíblica',
  'mythological scene': 'cena mitológica',
  
  // Estilos e Movimentos
  'abstract': 'abstrato',
  'figurative': 'figurativo',
  'realistic': 'realista',
  'impressionist': 'impressionista',
  'expressionist': 'expressionista',
  'cubist': 'cubista',
  'surrealist': 'surrealista',
  'romantic': 'romântico',
  'classical': 'clássico',
  'religious': 'religioso',
  'mythological': 'mitológico',
  'historical': 'histórico',
  'genre': 'gênero',
  
  // Termos comuns
  'work': 'obra',
  'artwork': 'obra de arte',
  'piece': 'peça',
  'object': 'objeto',
  'fragment': 'fragmento',
  'fragment of': 'fragmento de',
  'part of': 'parte de',
  'from': 'de',
  'made': 'feito',
  'created': 'criado',
  'executed': 'executado',
  'produced': 'produzido',
  'unknown': 'desconhecido',
  'anonymous': 'anônimo',
  'unidentified': 'não identificado',
  'untitled': 'sem título',
  'title unknown': 'título desconhecido',
  'century': 'século',
  'date': 'data',
  'dated': 'datado',
  'period': 'período',
  'era': 'era',
  'dynasty': 'dinastia',
  'reign': 'reinado',
  'culture': 'cultura',
  'civilization': 'civilização',
  'artist': 'artista',
  'maker': 'autor',
  'creator': 'criador',
  'sculptor': 'escultor',
  'painter': 'pintor',
  'attributed to': 'atribuído a',
  'workshop of': 'oficina de',
  'studio of': 'estúdio de',
  'follower of': 'seguidor de',
  'pupil of': 'pupilo de',
  'student of': 'estudante de',
  'style of': 'estilo de',
  'manner of': 'à maneira de',
  'school of': 'escola de',
  'after': 'após',
  'copy after': 'cópia de',
  'based on': 'baseado em',
  'inspired by': 'inspirado em',
  'circle of': 'círculo de',
  'possibly': 'possivelmente',
  'probably': 'provavelmente',
  'perhaps': 'talvez',
  'maybe': 'talvez',
  'ca.': 'cerca de',
  'circa': 'cerca de',
  'about': 'cerca de',
  'around': 'em torno de',
  'early': 'início',
  'mid': 'meados',
  'middle': 'meados',
  'late': 'final',
  'end': 'final',
  'beginning': 'início',
  'first half': 'primeira metade',
  'second half': 'segunda metade',
  'first quarter': 'primeiro quarto',
  'last quarter': 'último quarto',
  'quarter': 'quarto',
  'third': 'terço',
  'before': 'antes de',
  'prior to': 'antes de',
  'between': 'entre',
  'during': 'durante',
  'or': 'ou',
  'and': 'e',
  
  // Dimensões e Medidas
  'overall': 'total',
  'dimensions': 'dimensões',
  'measurements': 'medidas',
  'size': 'tamanho',
  'height': 'altura',
  'width': 'largura',
  'depth': 'profundidade',
  'diameter': 'diâmetro',
  'length': 'comprimento',
  'thickness': 'espessura',
  'weight': 'peso',
  'framed': 'com moldura',
  'unframed': 'sem moldura',
  'cm': 'cm',
  'in': 'pol',
  'inches': 'polegadas',
  'feet': 'pés',
  'meter': 'metro',
  'meters': 'metros',
  'centimeter': 'centímetro',
  'centimeters': 'centímetros',
  'millimeter': 'milímetro',
  'millimeters': 'milímetros',
  
  // Outros termos
  'inscription': 'inscrição',
  'signed': 'assinado',
  'signature': 'assinatura',
  'seal': 'selo',
  'mark': 'marca',
  'stamp': 'carimbo',
  'monogram': 'monograma',
  'provenance': 'proveniência',
  'collection': 'coleção',
  'acquisition': 'aquisição',
  'gift': 'doação',
  'purchase': 'compra',
  'bequest': 'legado',
  'loan': 'empréstimo',
  'exhibition': 'exposição',
  'displayed': 'exibido',
  'shown': 'exibido',
  'condition': 'condição',
  'conservation': 'conservação',
  'restoration': 'restauração',
  'original': 'original',
  'copy': 'cópia',
  'replica': 'réplica',
  'reproduction': 'reprodução',
  'version': 'versão',
  'variant': 'variante',
  'recto': 'frente',
  'verso': 'verso',
  'front': 'frente',
  'back': 'verso',
  'reverse': 'reverso',
  'side': 'lado',
  'left': 'esquerda',
  'right': 'direita',
  'top': 'topo',
  'bottom': 'base',
  'center': 'centro',
  'detail': 'detalhe',
  'details': 'detalhes',
  'impression': 'impressão',
  'state': 'estado',
  'edition': 'edição',
  'series': 'série',
  'set': 'conjunto',
  'pair': 'par',
  'group': 'grupo',
};

/**
 * Traduz usando dicionário (instantâneo)
 */
function translateWithDictionary(text: string): string | null {
  const lowerText = text.toLowerCase().trim();
  
  // Busca exata no dicionário
  if (dictionary[lowerText]) {
    return dictionary[lowerText];
  }
  
  // Busca parcial para frases compostas
  let translated = text;
  let hasTranslation = false;
  
  for (const [en, pt] of Object.entries(dictionary)) {
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    if (regex.test(translated)) {
      translated = translated.replace(regex, pt);
      hasTranslation = true;
    }
  }
  
  return hasTranslation ? translated : null;
}

/**
 * API de tradução (somente servidor)
 */
export async function POST(request: NextRequest) {
  try {
    const { text, sourceLang, targetLang } = await request.json();

    if (!text || !sourceLang || !targetLang) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos' },
        { status: 400 }
      );
    }

    // Se idiomas iguais, retorna original
    if (sourceLang === targetLang) {
      return NextResponse.json({ translatedText: text });
    }

    // Verifica cache
    const cacheKey = `${sourceLang}-${targetLang}-${text}`;
    if (cache.has(cacheKey)) {
      return NextResponse.json({ translatedText: cache.get(cacheKey) });
    }

    // 1. PRIMEIRO: Google Translate API (funciona para TUDO)
    const apiResult = await translateWithGoogleAPI(text, sourceLang, targetLang);
    if (apiResult) {
      // ...Google tradução realizada...
      cache.set(cacheKey, apiResult);
      return NextResponse.json({ translatedText: apiResult });
    }

    // 2. BACKUP: Dicionário (se Google falhar)
    const dictResult = translateWithDictionary(text);
    if (dictResult) {
      // ...Dicionário tradução...
      cache.set(cacheKey, dictResult);
      return NextResponse.json({ translatedText: dictResult });
    }

    // 3. Se tudo falhar, retorna original
    // ...Original texto...
    cache.set(cacheKey, text);
    return NextResponse.json({ translatedText: text });

  } catch (error) {
    // ...erro na tradução...
    return NextResponse.json(
      { error: 'Erro ao traduzir' },
      { status: 500 }
    );
  }
}
