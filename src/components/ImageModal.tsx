'use client';

import { useEffect, useState } from 'react';
import './ImageModal.css';

interface ImageModalProps {
  src: string;
  alt: string;
  onClose: () => void;
  language?: 'pt' | 'en';
}

export default function ImageModal({ src, alt, onClose, language = 'pt' }: ImageModalProps) {
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [showHint, setShowHint] = useState(true);

  const labels = {
    close: language === 'pt' ? 'Fechar' : 'Close',
    zoomOut: language === 'pt' ? 'Diminuir zoom' : 'Zoom out',
    zoomIn: language === 'pt' ? 'Aumentar zoom' : 'Zoom in',
    reset: language === 'pt' ? 'Resetar zoom' : 'Reset zoom',
    hintMobile: language === 'pt' 
      ? 'Use dois dedos para dar zoom • Arraste para mover'
      : 'Use two fingers to zoom • Drag to move',
    hintDesktop: language === 'pt'
      ? 'Use a roda do mouse para dar zoom • Arraste para mover'
      : 'Use mouse wheel to zoom • Drag to move',
  };

  // Fecha com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Previne scroll do body quando modal aberto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Zoom com scroll do mouse (desktop) - centralizado no cursor
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    // Oculta hint após primeiro zoom
    if (showHint) setShowHint(false);
    
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.5, Math.min(10, zoom + delta));
    
    if (newZoom !== zoom) {
      // Se o zoom está voltando para 1 ou menos, centraliza completamente
      if (newZoom <= 1) {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
        return;
      }
      
      // Pega a posição do mouse em relação ao container
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;
      
      // Calcula a nova posição para manter o ponto sob o cursor fixo
      const zoomRatio = newZoom / zoom;
      setPosition({
        x: mouseX - (mouseX - position.x) * zoomRatio,
        y: mouseY - (mouseY - position.y) * zoomRatio,
      });
      
      setZoom(newZoom);
    }
  };

  // Controles de zoom - centralizado
  const zoomIn = () => {
    const newZoom = Math.min(10, zoom + 0.25);
    if (newZoom !== zoom) {
      if (showHint) setShowHint(false);
      const zoomRatio = newZoom / zoom;
      setPosition({
        x: position.x * zoomRatio,
        y: position.y * zoomRatio,
      });
      setZoom(newZoom);
    }
  };
  
  const zoomOut = () => {
    const newZoom = Math.max(0.5, zoom - 0.25);
    if (newZoom !== zoom) {
      // Se for voltar para 1 ou menos, centraliza completamente
      if (newZoom <= 1) {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
        setShowHint(true);
        return;
      }
      
      const zoomRatio = newZoom / zoom;
      setPosition({
        x: position.x * zoomRatio,
        y: position.y * zoomRatio,
      });
      setZoom(newZoom);
    }
  };
  
  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setShowHint(true);
  };

  // Drag para mover quando com zoom
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Limita o movimento para não sair muito da tela
      const maxOffset = 1000 * zoom;
      setPosition({
        x: Math.max(-maxOffset, Math.min(maxOffset, newX)),
        y: Math.max(-maxOffset, Math.min(maxOffset, newY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers para mobile (pinch e drag)
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.touches.length === 2) {
      // Pinch zoom
      const distance = getTouchDistance(e.touches);
      setLastTouchDistance(distance);
    } else if (e.touches.length === 1) {
      // Single touch drag
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.touches.length === 2) {
      // Pinch zoom - até 1000% como no desktop
      const distance = getTouchDistance(e.touches);
      if (lastTouchDistance > 0) {
        if (showHint) setShowHint(false);
        
        const delta = (distance - lastTouchDistance) * 0.02; // Aumentada sensibilidade para 0.02
        const newZoom = Math.max(0.5, Math.min(10, zoom + delta));
        
        // Centraliza progressivamente ao desfazer o zoom
        if (newZoom <= 1.01) {
          setZoom(1);
          setPosition({ x: 0, y: 0 });
          setShowHint(true);
        } else {
          // Ao reduzir o zoom, aproxima a posição do centro
          if (newZoom < zoom) {
            setPosition(pos => ({
              x: pos.x * (newZoom / zoom),
              y: pos.y * (newZoom / zoom)
            }));
          }
          setZoom(newZoom);
        }
      }
      setLastTouchDistance(distance);
    } else if (e.touches.length === 1 && isDragging) {
      // Single touch drag com limites
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      
      const maxOffset = 1000 * zoom;
      setPosition({
        x: Math.max(-maxOffset, Math.min(maxOffset, newX)),
        y: Math.max(-maxOffset, Math.min(maxOffset, newY)),
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setLastTouchDistance(0);
  };

  return (
    <div 
      className="image-modal-overlay" 
      onClick={onClose}
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <button className="image-modal-close" onClick={onClose} aria-label={labels.close}>
        ✕
      </button>
      
      {/* Controles de Zoom */}
      <div className="zoom-controls" onClick={(e) => e.stopPropagation()}>
        <button onClick={zoomOut} className="zoom-btn" title={labels.zoomOut}>−</button>
        <span className="zoom-level">{Math.round(zoom * 100)}%</span>
        <button onClick={zoomIn} className="zoom-btn" title={labels.zoomIn}>+</button>
        <button onClick={resetZoom} className="zoom-reset" title={labels.reset}>⟲</button>
      </div>

      <div 
        className="image-modal-content" 
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          overflow: zoom > 1 ? 'visible' : 'hidden',
          touchAction: 'none'
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={src} 
          alt={alt} 
          className="image-modal-img"
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          }}
          onMouseDown={handleMouseDown}
          draggable={false}
        />
      </div>

      {/* Hint - mostra apenas quando zoom está em 1 e showHint é true */}
      {showHint && zoom === 1 && (
        <p className="zoom-hint">
          {window.matchMedia('(max-width: 768px)').matches 
            ? labels.hintMobile
            : labels.hintDesktop}
        </p>
      )}
    </div>
  );
}
