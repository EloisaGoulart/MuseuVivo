

'use client';

import { useState, useEffect, FormEvent } from 'react';
import './SearchBar.css';

// Propriedades do componente
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  value?: string;
}

export default function SearchBar({ onSearch, placeholder = 'Busque por obras, artistas...', value = '' }: SearchBarProps) {
  const [query, setQuery] = useState(value);

  // Atualiza o estado interno quando o valor da prop mudar
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Função chamada ao enviar o formulário
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      const input = document.activeElement as HTMLElement;
      if (input && input.blur) input.blur();
    }
  };

  const handleBlur = () => {};


  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <input
        type="text"
        value={query}                    // Valor atual do campo
        onChange={(e) => setQuery(e.target.value)}  // Atualiza estado quando digitar
        placeholder={placeholder}
        className="search-input"
        onBlur={handleBlur}
      />
      <button type="submit" className="search-button">
        {placeholder.includes('Search') ? 'Search' : 'Buscar'}
      </button>
    </form>
  );
}
