import './Loading.css';
import { useLanguage } from '@/hooks/useLanguage';

export default function Loading() {
  const language = useLanguage();
  
  return (
    <div className="loading-container">
      {/* Spinner animado */}
      <div className="loading-spinner"></div>
      <p className="loading-text">
        {language === 'pt' ? 'Carregando obras de arte...' : 'Loading artworks...'}
      </p>
    </div>
  );
}
