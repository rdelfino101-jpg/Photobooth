import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, FastForward, Film } from 'lucide-react';

interface BoomerangPlayerProps {
  frames: string[];
  fps?: number;
  className?: string;
  autoplay?: boolean;
}

export const BoomerangPlayer: React.FC<BoomerangPlayerProps> = ({
  frames,
  fps = 14,
  className = '',
  autoplay = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(autoplay);
  const directionRef = useRef<1 | -1>(1);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!frames || frames.length === 0 || !isPlaying) return;

    const intervalMs = Math.round(1000 / fps);

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        let next = prev + directionRef.current;
        if (next >= frames.length) {
          directionRef.current = -1;
          next = frames.length - 2;
        } else if (next < 0) {
          directionRef.current = 1;
          next = 1;
        }
        return Math.max(0, Math.min(frames.length - 1, next));
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [frames, fps, isPlaying]);

  if (!frames || frames.length === 0) return null;

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Frame Container */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 bg-black flex items-center justify-center">
        <img
          src={frames[currentIndex]}
          alt={`Boomerang fotograma ${currentIndex}`}
          className="max-h-[54vh] max-w-full object-contain pointer-events-none"
        />

        {/* Floating badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-600/85 backdrop-blur-md text-white text-[11px] font-bold shadow-md">
          <Film className="w-3.5 h-3.5 animate-spin-slow" />
          <span>BOOMERANG LOOP</span>
        </div>

        {/* Play/Pause control overlay button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute bottom-3 right-3 p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-all cursor-pointer"
          title={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
        </button>
      </div>

      {/* Frame progress indicator */}
      <div className="w-full flex items-center gap-1 mt-2.5 px-4 max-w-xs">
        {frames.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-75 ${
              i === currentIndex ? 'bg-pink-500 scale-y-150' : 'bg-neutral-800'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
