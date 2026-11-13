import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalCarouselProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  scrollStep?: number;
  showArrows?: boolean;
  arrowPosition?: 'sides' | 'top' | 'overlay';
  ariaLabel?: string;
}

/**
 * Universal horizontal carousel container for SnapKiosk Pro:
 * 1. Styled, visible, and touch-friendly horizontal scrollbar (.horizontal-scroll)
 * 2. Left / Right navigation buttons (◀ and ▶) with smooth scrolling (220px)
 * 3. Automatic Mouse Wheel horizontal scrolling conversion (e.deltaY -> scrollLeft)
 */
export const HorizontalCarousel: React.FC<HorizontalCarouselProps> = ({
  children,
  className = '',
  contentClassName = '',
  scrollStep = 220,
  showArrows = true,
  arrowPosition = 'sides',
  ariaLabel = 'Carrusel horizontal de opciones',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    checkScrollability();

    // 1. Mouse Wheel Listener: Convert vertical wheel turning to horizontal scroll
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('scroll', checkScrollability, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      checkScrollability();
    });
    resizeObserver.observe(el);

    // Periodic check for dynamic child changes
    const timeout = setTimeout(checkScrollability, 100);

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('scroll', checkScrollability);
      resizeObserver.disconnect();
      clearTimeout(timeout);
    };
  }, [checkScrollability, children]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;
    const offset = direction === 'left' ? -scrollStep : scrollStep;
    el.scrollBy({ left: offset, behavior: 'smooth' });
    setTimeout(checkScrollability, 300);
  };

  return (
    <div className={`relative group/carousel flex items-center ${className}`} role="region" aria-label={ariaLabel}>
      {/* Botón Lateral Izquierdo (◀) */}
      {showArrows && (
        <button
          type="button"
          onClick={() => handleScroll('left')}
          disabled={!canScrollLeft}
          className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer z-10 mr-1 shadow-md border ${
            canScrollLeft
              ? 'bg-neutral-900/90 hover:bg-[#ff2d55] text-white border-neutral-700/80 hover:border-[#ff2d55] active:scale-90 hover:shadow-[0_0_12px_rgba(255,45,85,0.5)]'
              : 'bg-neutral-950/40 text-neutral-600 border-neutral-850 cursor-not-allowed opacity-40'
          }`}
          title="Desplazar a la izquierda (◀)"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Contenedor con barra de desplazamiento estilizada y smooth scroll */}
      <div
        ref={containerRef}
        className={`horizontal-scroll flex-1 flex items-center gap-2 overflow-x-auto select-none ${contentClassName}`}
      >
        {children}
      </div>

      {/* Botón Lateral Derecho (▶) */}
      {showArrows && (
        <button
          type="button"
          onClick={() => handleScroll('right')}
          disabled={!canScrollRight}
          className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer z-10 ml-1 shadow-md border ${
            canScrollRight
              ? 'bg-neutral-900/90 hover:bg-[#ff2d55] text-white border-neutral-700/80 hover:border-[#ff2d55] active:scale-90 hover:shadow-[0_0_12px_rgba(255,45,85,0.5)]'
              : 'bg-neutral-950/40 text-neutral-600 border-neutral-850 cursor-not-allowed opacity-40'
          }`}
          title="Desplazar a la derecha (▶)"
          aria-label="Siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
