// ============================================
// SERVIÇO DE MUSEUS BRASILEIROS
// ============================================
// Este arquivo busca informações sobre museus brasileiros
// API: http://museus.cultura.gov.br/api/

import { MuseuBrasileiro } from '@/types/artwork';

// URL base da API de museus brasileiros
// NOTA: A API antiga foi descontinuada, retornando dados mockados temporariamente
const MUSEUS_BR_API_BASE = 'https://museus.cultura.gov.br/api';

// --------------------------------------------
// BUSCAR LISTA DE MUSEUS
// --------------------------------------------
/**
 * Busca lista de museus cadastrados na plataforma do Ministério da Cultura
 * 
 * NOTA: Esta API pode estar instável ou fora do ar às vezes.
 * Em produção, seria bom ter um fallback (alternativa)
 * 
 * @param limit - Máximo de museus para retornar (padrão: 20)
 * @returns Array de museus brasileiros
 */
// Dados de fallback enquanto a API oficial está fora do ar
const MUSEUS_FALLBACK: MuseuBrasileiro[] = [
  { id: '1', name: 'Museu de Arte de São Paulo (MASP)', endereco: 'Av. Paulista, 1578 - São Paulo, SP', telefone: '(11) 3149-5959', website: 'https://masp.org.br', imageUrl: '/museums/br/masp-sp.webp' },
  { id: '2', name: 'Museu Nacional de Belas Artes', endereco: 'Av. Rio Branco, 199 - Rio de Janeiro, RJ', telefone: '(21) 3299-0600', website: 'https://mnba.gov.br', imageUrl: '/museums/br/belas artes.jpg' },
  { id: '3', name: 'Museu Imperial', endereco: 'Rua da Imperatriz, 220 - Petrópolis, RJ', telefone: '(24) 2233-0300', website: 'https://museuimperial.gov.br', imageUrl: '/museums/br/museu.imperial.jpg' },
  { id: '4', name: 'Pinacoteca de São Paulo', endereco: 'Praça da Luz, 2 - São Paulo, SP', telefone: '(11) 3324-1000', website: 'https://pinacoteca.org.br', imageUrl: '/museums/br/pinacoteca.jpg' },
  { id: '5', name: 'Museu do Amanhã', endereco: 'Praça Mauá, 1 - Rio de Janeiro, RJ', telefone: '(21) 3812-1800', website: 'https://museudoamanha.org.br', imageUrl: '/museums/br/museu.do.amanha.webp' },
  { id: '6', name: 'Museu Histórico Nacional', endereco: 'Praça Marechal Âncora - Rio de Janeiro, RJ', telefone: '(21) 3299-0324', website: 'https://mhn.museus.gov.br', imageUrl: '/museums/br/museuhistoriconacional.webp' },
  { id: '7', name: 'Instituto Ricardo Brennand', endereco: 'Alameda Antônio Brennand - Recife, PE', telefone: '(81) 2121-0352', website: 'https://institutoricardobrennand.org.br', imageUrl: '/museums/br/ricardo.brennand.jpg' },
  { id: '8', name: 'Museu Oscar Niemeyer', endereco: 'Rua Marechal Hermes, 999 - Curitiba, PR', telefone: '(41) 3350-4400', website: 'https://www.museuoscarniemeyer.org.br', imageUrl: '/museums/br/Museu.Osacar.Niemeyer.jpg' },
  { id: '9', name: 'Museu Afro Brasil', endereco: 'Av. Pedro Álvares Cabral - São Paulo, SP', telefone: '(11) 3320-8900', website: 'http://www.museuafrobrasil.org.br', imageUrl: '/museums/br/Museu.Afro.jpg' },
  { id: '10', name: 'Museu da Língua Portuguesa', endereco: 'Praça da Luz - São Paulo, SP', telefone: '(11) 3322-0080', website: 'https://museudalinguaportuguesa.org.br', imageUrl: '/museums/br/museu.lingua.portuguesa.webp' },
];

export async function getMuseusBrasileiros(limit: number = 20): Promise<MuseuBrasileiro[]> {
  // Sempre retorna o fallback para evitar erros de rede em dev
  return MUSEUS_FALLBACK.slice(0, limit);
}

// --------------------------------------------
// BUSCAR MUSEU POR ID
// --------------------------------------------
/**
 * Busca detalhes de um museu específico pelo ID
 * 
 * @param id - ID do museu
 * @returns Dados do museu ou null
 */
export async function getMuseuById(id: string): Promise<MuseuBrasileiro | null> {
  try {
    const url = `${MUSEUS_BR_API_BASE}/space/findOne?@select=id,name,endereco,telefone&id=EQ(${id})`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return data || null;
    
  } catch (error) {
    console.error('Erro ao buscar museu:', error);
    return null;
  }
}
