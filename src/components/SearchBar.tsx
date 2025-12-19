// ============================================
// COMPONENTE: SEARCH BAR (BARRA DE PESQUISA)
// ============================================
// Este componente permite que o usuário digite um termo e faça uma busca
// Usa o conceito de "Client Component" porque precisa de interatividade

'use client'; // Esta linha indica que é um Client Component (precisa rodar no navegador)

import { useState, useEffect, FormEvent } from 'react';
import './SearchBar.css';

// --------------------------------------------
// PROPS (Propriedades) DO COMPONENTE
// --------------------------------------------
// Props são dados que passamos para o componente de fora
interface SearchBarProps {
  onSearch: (query: string) => void;  // Função que será chamada quando pesquisar
  placeholder?: string;               // Texto de exemplo no campo (opcional)
  value?: string;                     // Valor inicial (opcional)
}

export default function SearchBar({ onSearch, placeholder = 'Busque por obras, artistas...', value = '' }: SearchBarProps) {
  // --------------------------------------------
  // ESTADO (STATE)
  // --------------------------------------------
  // Estado é como uma "memória" do componente
  // Quando o estado muda, o componente re-renderiza (atualiza na tela)
  const [query, setQuery] = useState(value); // Estado que guarda o texto digitado

  // --------------------------------------------
  // SINCRONIZAR VALOR EXTERNO COM ESTADO INTERNO
  // --------------------------------------------
  // Atualiza o estado interno quando o valor da prop mudar
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // --------------------------------------------
  // FUNÇÃO DE SUBMIT (ENVIO DO FORMULÁRIO)
  // --------------------------------------------
  // Esta função é chamada quando o usuário aperta Enter ou clica no botão
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault(); // Previne o comportamento padrão do form (recarregar página)
    // Só faz a busca se tiver algo digitado
    if (query.trim()) {
      onSearch(query.trim()); // Chama a função que recebemos via props
      // Força blur do input após submit
      const input = document.activeElement as HTMLElement;
      if (input && input.blur) input.blur();
    }
  };

  // Remove manipulação de zoom/viewport para evitar zoom ao focar no input no mobile
  // O input não irá mais alterar o zoom da tela
  const handleBlur = () => {};

  // Força blur ao submeter (mantém apenas para UX, sem manipular zoom)

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      {/* Campo de texto */}
      <input
        type="text"
        value={query}                    // Valor atual do campo
        onChange={(e) => setQuery(e.target.value)}  // Atualiza estado quando digitar
        placeholder={placeholder}
        className="search-input"
        onBlur={handleBlur}
      />
      {/* Botão de busca */}
      <button type="submit" className="search-button">
        {placeholder.includes('Search') ? 'Search' : 'Buscar'}
      </button>
    </form>
  );
}

// --------------------------------------------
// CONCEITOS IMPORTANTES:
// --------------------------------------------
// 
// 1. 'use client': 
//    - No Next.js 13+, componentes são Server Components por padrão
//    - Quando precisamos de interatividade (onClick, onChange, useState),
//      usamos 'use client' para transformar em Client Component
//
// 2. useState:
//    - Hook do React para criar estado
//    - Retorna [valorAtual, funçãoParaAtualizar]
//    - Quando chamamos setQuery(), o componente re-renderiza
//
// 3. Props:
//    - Forma de passar dados de um componente pai para filho
//    - Aqui recebemos onSearch (função de callback)
//    - Callback = função que será executada em outro lugar
//
// 4. Controlled Input:
//    - value={query}: O React controla o valor do input
//    - onChange: Atualiza o estado quando digitar
//    - Isso é chamado de "controlled component"

