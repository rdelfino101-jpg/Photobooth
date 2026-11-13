import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Maximize2,
  Minimize2,
  ArrowLeft,
  RefreshCw,
  QrCode as QrCodeIcon,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Flame,
  ImageIcon,
  X
} from 'lucide-react';
import { EventConfig, CapturedPhotoRecord } from '../types/photobooth';
import { listRecentPhotosFromSupabase, LiveWallPhoto } from '../utils/supabase';
import { sounds } from '../utils/audio';
import { Language, TRANSLATIONS } from '../utils/i18n';

interface LivePhotoWallProps {
  eventConfig: EventConfig;
  localPhotos: CapturedPhotoRecord[];
  onExit: () => void;
  language?: Language;
}

export const LivePhotoWall: React.FC<LivePhotoWallProps> = ({
  eventConfig,
  localPhotos,
  onExit,
  language = 'es',
}) => {
  const t = TRANSLATIONS[language];
  // Photos State
  const [photos, setPhotos] = useState<LiveWallPhoto[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [isCrossfading, setIsCrossfading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Playback & Timing (default 6 seconds)
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [intervalSeconds, setIntervalSeconds] = useState<number>(6);
  const [slideKey, setSlideKey] = useState<number>(0);

  // Newly Taken Live Photo Alert State
  const [newPhotoAlert, setNewPhotoAlert] = useState<boolean>(false);
  const [newPhotoAlertText, setNewPhotoAlertText] = useState<string>(t.liveWallNewPhoto);

  // UI & Ambient State
  const [showControls, setShowControls] = useState<boolean>(true);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Refs
  const knownPhotoIdsRef = useRef<Set<string>>(new Set());
  const hideControlsTimerRef = useRef<any>(null);
  const slideTimerRef = useRef<any>(null);
  const newAlertTimerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate QR for booth URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const boothUrl = window.location.origin + window.location.pathname;
      QRCode.toDataURL(boothUrl, {
        width: 320,
        margin: 1.5,
        color: { dark: '#0a0a0a', light: '#ffffff' },
      })
        .then(setQrCodeUrl)
        .catch(() => {});
    }
  }, []);

  // ----------------------------------------------------
  // 1. Fetch & Sync Photos from Supabase Storage (every 5 seconds)
  // ----------------------------------------------------
  const syncPhotos = useCallback(async (isFirstLoad = false) => {
    try {
      const remotePhotos = await listRecentPhotosFromSupabase();

      // Map local photos to LiveWallPhoto format
      const mappedLocal: LiveWallPhoto[] = localPhotos.map((p) => ({
        id: p.id,
        name: p.id,
        publicUrl: p.publicUrl || p.localBlobUrl,
        created_at: new Date(p.timestamp).toISOString(),
      }));

      // Merge remote and local without duplicates (keyed by publicUrl)
      const mergedMap = new Map<string, LiveWallPhoto>();
      mappedLocal.forEach((p) => mergedMap.set(p.publicUrl, p));
      remotePhotos.forEach((p) => mergedMap.set(p.publicUrl, p));

      const combined = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      if (combined.length === 0) {
        setPhotos([]);
        setIsLoading(false);
        return;
      }

      // Check for newly arrived photo to trigger live interruption
      if (!isFirstLoad) {
        const newest = combined[0];
        const isUnknown =
          !knownPhotoIdsRef.current.has(newest.id) &&
          !knownPhotoIdsRef.current.has(newest.publicUrl);

        if (isUnknown) {
          // Trigger live interruption priority
          setNewPhotoAlert(true);
          setNewPhotoAlertText(t.liveWallNewPhoto);

          // Bring immediately to current index 0
          setCurrentIndex(0);
          setSlideKey((k) => k + 1);

          if (soundEnabled) {
            sounds.playApplause();
          }

          try {
            confetti({
              particleCount: 90,
              spread: 80,
              origin: { y: 0.5 },
              colors: ['#ff2d55', '#f59e0b', '#38bdf8', '#10b981', '#ec4899'],
            });
          } catch {}

          if (newAlertTimerRef.current) clearTimeout(newAlertTimerRef.current);
          newAlertTimerRef.current = setTimeout(() => {
            setNewPhotoAlert(false);
          }, 4000);
        }
      }

      // Record known IDs
      combined.forEach((p) => {
        knownPhotoIdsRef.current.add(p.id);
        knownPhotoIdsRef.current.add(p.publicUrl);
      });

      setPhotos(combined);
      setIsLoading(false);
    } catch (err) {
      console.warn('Error syncing live wall photos:', err);
      setIsLoading(false);
    }
  }, [localPhotos, soundEnabled]);

  // Initial load + 5-second polling interval
  useEffect(() => {
    syncPhotos(true);

    const pollingInterval = setInterval(() => {
      syncPhotos(false);
    }, 5000);

    return () => {
      clearInterval(pollingInterval);
      if (newAlertTimerRef.current) clearTimeout(newAlertTimerRef.current);
    };
  }, [syncPhotos]);

  // ----------------------------------------------------
  // 2. Slide Navigation Logic with 1.2s Crossfade
  // ----------------------------------------------------
  const goToSlide = useCallback((nextIdx: number) => {
    if (photos.length === 0) return;
    const boundedIndex = (nextIdx + photos.length) % photos.length;

    setPreviousIndex(currentIndex);
    setCurrentIndex(boundedIndex);
    setIsCrossfading(true);
    setSlideKey((k) => k + 1);

    // End crossfade after 1s
    setTimeout(() => {
      setIsCrossfading(false);
      setPreviousIndex(null);
    }, 1000);
  }, [currentIndex, photos.length]);

  const handleNext = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const handlePrev = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  // Automatic slideshow timer
  useEffect(() => {
    if (!isPlaying || photos.length <= 1) return;

    if (slideTimerRef.current) clearTimeout(slideTimerRef.current);

    slideTimerRef.current = setTimeout(() => {
      handleNext();
    }, intervalSeconds * 1000);

    return () => {
      if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    };
  }, [isPlaying, currentIndex, intervalSeconds, photos.length, handleNext]);

  // ----------------------------------------------------
  // 3. Auto-hiding Controls (3 Seconds Idle Timer)
  // ----------------------------------------------------
  const resetHideControlsTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    hideControlsTimerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  useEffect(() => {
    const handleActivity = () => {
      resetHideControlsTimer();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('mousedown', handleActivity);

    // Initial timeout
    resetHideControlsTimer();

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    };
  }, [resetHideControlsTimer]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      resetHideControlsTimer();
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'Escape' && isFullscreen) {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isFullscreen, resetHideControlsTimer]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  const currentPhoto = photos[currentIndex] || null;
  const previousPhoto = previousIndex !== null ? photos[previousIndex] : null;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[10000] w-screen h-[100dvh] bg-black text-white overflow-hidden select-none font-sans flex flex-col items-center justify-center ${
        !showControls ? 'cursor-none' : 'cursor-default'
      }`}
    >
      {/* =========================================================================
          1. FONDO AMBIENTAL DINÁMICO (AMBIENT BLUR LAYER)
          Llenado al 100% sin bordes negros vacíos con desenfoque de 40px y brillo 0.35
          ========================================================================= */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {/* Previous Ambient Photo (fading out during crossfade) */}
        {previousPhoto && isCrossfading && (
          <img
            key={`amb-prev-${previousPhoto.publicUrl}`}
            src={previousPhoto.publicUrl}
            alt="Ambient blur previous"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out opacity-0"
            style={{
              filter: 'blur(40px) brightness(0.35)',
              transform: 'scale(1.1)',
            }}
          />
        )}

        {/* Current Ambient Photo (fading in) */}
        {currentPhoto && (
          <img
            key={`amb-curr-${currentPhoto.publicUrl}`}
            src={currentPhoto.publicUrl}
            alt="Ambient blur"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out opacity-100"
            style={{
              filter: 'blur(40px) brightness(0.35)',
              transform: 'scale(1.1)',
            }}
          />
        )}

        {/* Subtle Vignette Overlay for cinematic depth */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/80 pointer-events-none" />
      </div>

      {/* =========================================================================
          2. ENCABEZADO DISCRETO DEL EVENTO (ESQUINA SUPERIOR IZQUIERDA)
          Logo, Título del Evento, Subtítulo y Hashtag oficial
          ========================================================================= */}
      <div
        className={`absolute top-5 left-5 z-40 flex items-center gap-3 transition-opacity duration-500 pointer-events-auto ${
          showControls ? 'opacity-100' : 'opacity-70 hover:opacity-100'
        }`}
      >
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-black/45 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-lg shadow-md shrink-0"
            style={{
              backgroundColor: `${eventConfig.primaryColor || '#ff2d55'}35`,
              borderColor: `${eventConfig.primaryColor || '#ff2d55'}60`,
              color: eventConfig.accentColor || '#ffffff',
            }}
          >
            📸
          </div>
          <div className="min-w-0 pr-1">
            <h1 className="text-sm sm:text-base font-bold font-display text-white tracking-tight leading-tight truncate max-w-[240px] sm:max-w-md">
              {eventConfig.eventTitle || 'SnapKiosk Pro'}
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-neutral-300 font-medium">
              {eventConfig.eventSubtitle && (
                <span className="truncate max-w-[150px]">{eventConfig.eventSubtitle}</span>
              )}
              {eventConfig.eventSubtitle && <span className="text-neutral-500">·</span>}
              <span className="text-amber-400 font-bold">{eventConfig.eventHashtag || '#SnapKioskPro'}</span>
            </div>
          </div>
        </div>

        {/* Live Wall Badge Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold tracking-wider uppercase text-neutral-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Muro en Vivo</span>
        </div>
      </div>

      {/* Top Right Quick Actions (Back & QR trigger) */}
      <div
        className={`absolute top-5 right-5 z-40 flex items-center gap-2 transition-all duration-500 ${
          showControls
            ? 'opacity-100 pointer-events-auto translate-y-0'
            : 'opacity-0 pointer-events-none -translate-y-2'
        }`}
      >
        {/* Toggle Sound */}
        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2.5 rounded-xl bg-black/50 hover:bg-black/80 backdrop-blur-xl border border-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer shadow-lg active:scale-95"
          title={soundEnabled ? 'Silenciar sonidos de nueva foto' : 'Activar sonido'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
        </button>

        {/* QR Code Modal Toggle */}
        {qrCodeUrl && (
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/50 hover:bg-black/80 backdrop-blur-xl border border-white/10 text-neutral-200 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-lg active:scale-95"
            title="Mostrar Código QR para que los invitados posen"
          >
            <QrCodeIcon className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Código QR Cabina</span>
          </button>
        )}

        {/* Return to Photobooth */}
        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-neutral-900 to-neutral-800 hover:from-neutral-800 hover:to-neutral-700 backdrop-blur-xl border border-white/15 text-white text-xs font-bold transition-all cursor-pointer shadow-xl active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>{t.liveWallExit}</span>
        </button>
      </div>

      {/* =========================================================================
          3. ETIQUETA ANIMADA BRILLANTE: ¡RECIÉN TOMADA EN LA CABINA!
          Aparece en primer plano durante 4 segundos cuando llega una captura nueva
          ========================================================================= */}
      {newPhotoAlert && (
        <div className="absolute top-20 sm:top-24 z-50 animate-bounce transition-all">
          <div className="flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#ff2d55] via-rose-500 to-amber-500 text-white font-black text-sm sm:text-base tracking-wide shadow-2xl animate-new-photo-badge border border-white/30 backdrop-blur-md">
            <Sparkles className="w-5 h-5 text-yellow-200 animate-spin" />
            <span>{newPhotoAlertText}</span>
            <Flame className="w-5 h-5 text-yellow-200" />
          </div>
        </div>
      )}

      {/* =========================================================================
          4. PRESENTACIÓN DE DIAPOSITIVA PRINCIPAL (PROTAGONISTA A PANTALLA COMPLETA)
          Transición Crossfade 1.2s + Efecto Ken Burns (scale 1 -> 1.04)
          ========================================================================= */}
      <main className="relative z-10 w-full h-full flex items-center justify-center p-3 sm:p-6 md:p-8">
        {/* Empty State */}
        {!isLoading && photos.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center p-8 max-w-lg mx-auto bg-black/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#ff2d55]/20 to-amber-500/20 border border-[#ff2d55]/40 flex items-center justify-center text-[#ff2d55] mb-5 shadow-xl animate-pulse">
              <ImageIcon className="w-10 h-10" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display mb-3">
              ¡Esperando las Primeras Fotos!
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed mb-6">
              Acércate a la cabina fotográfica o escanea el código QR a continuación para tomarte la primera foto del evento.
            </p>
            {qrCodeUrl && (
              <div className="p-3 bg-white rounded-2xl shadow-2xl mb-4">
                <img src={qrCodeUrl} alt="QR Cabina" className="w-36 h-36 object-contain" />
              </div>
            )}
            <span className="text-xs font-bold text-amber-400 font-mono">
              {eventConfig.eventHashtag}
            </span>
          </div>
        )}

        {/* Previous Slide during crossfade (Fading out over 1s) */}
        {previousPhoto && isCrossfading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-1000 ease-in-out opacity-0">
            <img
              src={previousPhoto.publicUrl}
              alt="Diapositiva saliente"
              className="max-w-[92vw] max-h-[88dvh] w-auto h-auto object-contain rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] border border-white/10"
            />
          </div>
        )}

        {/* Current Active Slide (Ken Burns Zoom + Fading in) */}
        {currentPhoto && (
          <div
            key={`slide-wrap-${currentPhoto.publicUrl}-${slideKey}`}
            className="relative flex items-center justify-center max-w-full max-h-full transition-opacity duration-1000 ease-in-out opacity-100"
          >
            <img
              src={currentPhoto.publicUrl}
              alt={`Foto de ${eventConfig.eventTitle}`}
              className="max-w-[92vw] max-h-[88dvh] w-auto h-auto object-contain rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] border border-white/15 animate-ken-burns"
              style={{
                animationDuration: `${intervalSeconds}s`,
              }}
            />
          </div>
        )}
      </main>

      {/* =========================================================================
          5. CONTROLES FLOTANTES AUTO-OCULTABLES (DESAPARECEN TRAS 3 SEGUNDOS DE INACTIVIDAD)
          ⏮ Anterior, ⏯ Play/Pausa, ⏭ Siguiente, Selector de segundos, Contador X de Y, Fullscreen
          ========================================================================= */}
      <footer
        className={`fixed bottom-6 z-40 max-w-4xl w-[92%] sm:w-auto px-4 py-3 rounded-2xl bg-black/60 hover:bg-black/80 backdrop-blur-2xl border border-white/15 shadow-2xl flex flex-wrap items-center justify-between sm:justify-center gap-3 transition-all duration-500 pointer-events-auto ${
          showControls
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Main Playback Nav Buttons */}
        <div className="flex items-center gap-2">
          {/* Previous */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={photos.length <= 1}
            className="p-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 active:scale-95 text-neutral-300 hover:text-white border border-neutral-700/60 transition-all cursor-pointer disabled:opacity-40"
            title="Foto Anterior (Flecha Izquierda)"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause Toggle */}
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all active:scale-95 cursor-pointer ${
              isPlaying
                ? 'bg-neutral-900/80 hover:bg-neutral-800 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-600/30'
            }`}
            title="Pausar o Reanudar Diapositivas (Barra Espaciadora)"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-amber-300" />
                <span className="hidden sm:inline">{t.liveWallPause}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span className="hidden sm:inline">{t.liveWallPlay}</span>
              </>
            )}
          </button>

          {/* Next */}
          <button
            type="button"
            onClick={handleNext}
            disabled={photos.length <= 1}
            className="p-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 active:scale-95 text-neutral-300 hover:text-white border border-neutral-700/60 transition-all cursor-pointer disabled:opacity-40"
            title={t.liveWallNext}
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Separator */}
        <div className="hidden sm:block w-px h-6 bg-neutral-800" />

        {/* Speed Selector (3s, 5s, 6s, 8s, 10s) */}
        <div className="flex items-center gap-1 bg-neutral-950/70 p-1 rounded-xl border border-neutral-800">
          <span className="text-[10px] font-bold text-neutral-500 uppercase px-1.5 hidden md:inline">
            {t.liveWallSpeed}:
          </span>
          {[3, 5, 6, 8, 10].map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setIntervalSeconds(sec)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                intervalSeconds === sec
                  ? 'bg-gradient-to-r from-[#ff2d55] to-amber-500 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
              title={`Cambiar diapositiva cada ${sec} segundos`}
            >
              {sec}s
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="hidden sm:block w-px h-6 bg-neutral-800" />

        {/* Counter: Foto X de Y */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-950/70 border border-neutral-800 text-xs font-mono font-bold">
          <span className="text-amber-400">
            {photos.length > 0 ? currentIndex + 1 : 0}
          </span>
          <span className="text-neutral-600">/</span>
          <span className="text-neutral-300">{photos.length}</span>
        </div>

        {/* Refresh manual */}
        <button
          type="button"
          onClick={() => syncPhotos(false)}
          className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
          title="Buscar fotos nuevas en Supabase ahora"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
          title={isFullscreen ? 'Salir de Pantalla Completa' : 'Modo Pantalla Completa (F)'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Separator */}
        <div className="hidden sm:block w-px h-6 bg-neutral-800" />

        {/* Return to Photobooth Button */}
        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-neutral-900 to-neutral-800 hover:from-neutral-800 hover:to-neutral-700 text-neutral-200 hover:text-white text-xs font-bold border border-white/10 shadow transition-all cursor-pointer"
          title="Salir del Modo Proyector y volver a la Cabina"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">{t.liveWallExit}</span>
        </button>
      </footer>

      {/* Progress Bar along the bottom of the screen */}
      {isPlaying && photos.length > 1 && (
        <div className="fixed bottom-0 inset-x-0 h-1 bg-white/10 z-30 pointer-events-none">
          <div
            key={`progress-${slideKey}-${intervalSeconds}`}
            className="h-full bg-gradient-to-r from-[#ff2d55] via-rose-500 to-amber-500"
            style={{
              animation: `slideProgress ${intervalSeconds}s linear infinite`,
            }}
          />
        </div>
      )}

      {/* =========================================================================
          6. MODAL CÓDIGO QR PARA INVITADOS (POPUP DISCRETO)
          ========================================================================= */}
      {showQrModal && qrCodeUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-sm w-full p-6 bg-neutral-950 border border-neutral-800 rounded-3xl text-center shadow-2xl space-y-4">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <QrCodeIcon className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold font-display text-white">
              ¡Súmate a la Proyección!
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Escanea con la cámara de tu teléfono móvil para ingresar a la cabina y tomarte una foto ahora mismo:
            </p>

            <div className="p-4 bg-white rounded-2xl mx-auto inline-block shadow-inner">
              <img src={qrCodeUrl} alt="QR Cabina" className="w-52 h-52 object-contain" />
            </div>

            <p className="text-xs font-bold text-amber-400 font-mono">
              {eventConfig.eventHashtag}
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs border border-neutral-750 transition-colors cursor-pointer"
            >
              Cerrar y volver a la proyección
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
