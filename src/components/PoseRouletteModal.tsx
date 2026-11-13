import React, { useState, useEffect, useRef } from 'react';
import { X, RotateCcw, Camera, Dices, Sparkles, CheckCircle2 } from 'lucide-react';
import { PoseChallenge } from '../types/photobooth';
import { sounds } from '../utils/audio';
import { Language, getPoseChallenges, TRANSLATIONS } from '../utils/i18n';

interface PoseRouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcceptChallenge: (challenge: PoseChallenge) => void;
  language?: Language;
}

export const PoseRouletteModal: React.FC<PoseRouletteModalProps> = ({
  isOpen,
  onClose,
  onAcceptChallenge,
  language = 'es',
}) => {
  const challenges = getPoseChallenges(language);
  const t = TRANSLATIONS[language];
  const [selectedChallenge, setSelectedChallenge] = useState<PoseChallenge>(challenges[0]);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinIndex, setSpinIndex] = useState<number>(0);
  const spinIntervalRef = useRef<any>(null);

  // Update challenge if language changes while open
  useEffect(() => {
    const list = getPoseChallenges(language);
    setSelectedChallenge((prev) => {
      const match = list.find((c) => c.id === prev.id);
      return match || list[0];
    });
  }, [language]);

  const startSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    let count = 0;
    const totalTicks = 24 + Math.floor(Math.random() * 8);
    let speed = 60;

    const tick = () => {
      count++;
      const currentList = getPoseChallenges(language);
      const nextIndex = Math.floor(Math.random() * currentList.length);
      setSpinIndex(nextIndex);
      setSelectedChallenge(currentList[nextIndex]);
      sounds.playRouletteSpin();

      if (count < totalTicks) {
        speed = 60 + Math.pow(count / totalTicks, 2) * 220; // ease out deceleration
        spinIntervalRef.current = setTimeout(tick, speed);
      } else {
        setIsSpinning(false);
        sounds.playFanfare();
      }
    };

    tick();
  };

  useEffect(() => {
    if (isOpen) {
      startSpin();
    }
    return () => {
      if (spinIntervalRef.current) {
        clearTimeout(spinIntervalRef.current);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-center p-6 sm:p-8">
        {/* Glow ambient background */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-red-600/25 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSpinning}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-40"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-bold uppercase tracking-wider mx-auto mb-4">
          <Dices className="w-4 h-4 animate-spin-slow" />
          <span>{t.rouletteBadge}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mb-1">
          {t.rouletteTitle}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mb-6">
          {t.rouletteSubtitle}
        </p>

        {/* Roulette Challenge Display Card */}
        <div
          className={`relative p-6 sm:p-8 rounded-2xl border transition-all duration-300 mb-6 overflow-hidden ${
            isSpinning
              ? 'bg-neutral-950/80 border-red-500/60 scale-[0.98]'
              : 'bg-gradient-to-b from-neutral-800/90 to-neutral-950 border-amber-400/50 scale-100 shadow-xl shadow-red-950/40'
          }`}
        >
          {/* Big Animated Emoji */}
          <div
            className={`text-6xl sm:text-7xl mb-4 transition-transform duration-150 select-none ${
              isSpinning ? 'scale-110 rotate-6' : 'scale-100 animate-bounce'
            }`}
          >
            {selectedChallenge.emoji}
          </div>

          {/* Title */}
          <h3 className="text-xl sm:text-2xl font-black text-amber-300 font-display mb-2 drop-shadow-md">
            {selectedChallenge.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-neutral-300 leading-relaxed font-medium max-w-sm mx-auto">
            {selectedChallenge.description}
          </p>

          {/* Spinning Overlay Indicator */}
          {isSpinning && (
            <div className="absolute inset-0 bg-red-950/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
              <span className="px-3 py-1 rounded-full bg-red-600/80 text-white text-xs font-bold animate-pulse">
                {t.rouletteSpinning}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={startSpin}
            disabled={isSpinning}
            className="flex-1 min-h-[48px] px-4 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-750 active:scale-95 text-neutral-200 font-bold text-sm flex items-center justify-center gap-2 border border-neutral-700 transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 text-amber-400 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{t.rouletteSpinAgain}</span>
          </button>

          <button
            onClick={() => onAcceptChallenge(selectedChallenge)}
            disabled={isSpinning}
            className="flex-1 min-h-[48px] px-4 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 active:scale-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Camera className="w-4 h-4" />
            <span>{t.rouletteAccept}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
