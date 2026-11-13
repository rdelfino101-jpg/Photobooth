import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  Archive,
  Download,
  QrCode as QrCodeIcon,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Info,
  Smartphone,
  Check,
  Share2,
  Trash2,
  Image as ImageIcon,
  X,
  FileCheck
} from 'lucide-react';
import { CapturedPhotoRecord } from '../types/photobooth';
import { downloadAllPhotosAsZip } from '../utils/zipDownloader';
import { HorizontalCarousel } from './HorizontalCarousel';
import { Language, TRANSLATIONS } from '../utils/i18n';

interface SessionEndModalProps {
  sessionId: string;
  sessionPhotos: CapturedPhotoRecord[];
  onClose: () => void;
  onNewSession: () => void;
  onDeletePhoto: (id: string) => void;
  onSelectSinglePhoto: (photo: CapturedPhotoRecord) => void;
  language?: Language;
}

export const SessionEndModal: React.FC<SessionEndModalProps> = ({
  sessionId,
  sessionPhotos,
  onClose,
  onNewSession,
  onDeletePhoto,
  onSelectSinglePhoto,
  language = 'es',
}) => {
  const t = TRANSLATIONS[language];
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [zipProgress, setZipProgress] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [qrTargetUrl, setQrTargetUrl] = useState<string>('');

  useEffect(() => {
    // Launch celebratory confetti when concluding a session
    try {
      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#f59e0b', '#38bdf8', '#10b981', '#ffffff'],
        disableForReducedMotion: true,
      });
    } catch {
      // ignore
    }

    // Determine target URL for group QR code
    // Links to webapp session viewer URL or the public Supabase URL of latest photo
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    
    // Web link that loads this exact session on guests' mobile phones
    const sessionWebUrl = `${origin}${pathname}?session=${sessionId}`;
    
    // Fallback: If only 1 photo, use its direct public URL; if multiple, use session web url
    const bestUrl = sessionPhotos.length === 1 && sessionPhotos[0].publicUrl
      ? sessionPhotos[0].publicUrl
      : sessionWebUrl;

    setQrTargetUrl(bestUrl);

    QRCode.toDataURL(bestUrl, {
      width: 340,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        setQrCodeDataUrl(url);
      })
      .catch((err) => {
        console.error('Error generating session QR code:', err);
      });
  }, [sessionId, sessionPhotos]);

  const handleDownloadAllZip = async () => {
    if (sessionPhotos.length === 0 || isZipping) return;
    setIsZipping(true);
    setZipProgress(10);
    try {
      await downloadAllPhotosAsZip(sessionPhotos, sessionId, (p) => {
        setZipProgress(p);
      });
    } catch (err) {
      console.error('Error downloading zip:', err);
    } finally {
      setIsZipping(false);
      setZipProgress(0);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrTargetUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[95vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/80 bg-neutral-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-neutral-100 font-display">
                {t.sessionEndTitle}
              </h2>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span>{sessionPhotos.length} {sessionPhotos.length === 1 ? (language === 'es' ? 'foto capturada' : 'photo captured') : (language === 'es' ? 'fotos capturadas' : 'photos captured')}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-neutral-400">{sessionId}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title={language === 'es' ? 'Volver' : 'Back'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split View (Gallery Grid + Group QR & Actions) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: All Session Photos Grid */}
          <div className="md:col-span-7 flex flex-col space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-display">
                {t.sessionPhotosCount(sessionPhotos.length)}
              </span>
              <span className="text-xs text-neutral-500">{t.tapToEnlarge}</span>
            </div>

            {/* Gallery Horizontal Carousel & Scrollable Strip */}
            <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-2xl p-4 min-h-[300px]">
              {sessionPhotos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-500 text-center">
                  <ImageIcon className="w-10 h-10 mb-2 stroke-[1.2]" />
                  <p className="text-sm">{t.noPhotosTaken}</p>
                </div>
              ) : (
                <HorizontalCarousel scrollStep={260} ariaLabel="Carrusel de Fotos de la Sesión" className="py-2">
                  {sessionPhotos.map((photo, idx) => (
                    <div
                      key={photo.id}
                      className="group relative w-48 sm:w-56 bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden shadow-lg hover:border-red-500/70 transition-all shrink-0"
                    >
                      {/* Photo Thumbnail */}
                      <div
                        onClick={() => onSelectSinglePhoto(photo)}
                        className="cursor-pointer aspect-[4/3] w-full bg-neutral-950 flex items-center justify-center overflow-hidden"
                      >
                        <img
                          src={photo.localBlobUrl}
                          alt={`Foto ${idx + 1}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>

                      {/* Number tag */}
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-sm text-[10px] font-bold text-white border border-white/20">
                        #{idx + 1}
                      </div>

                      {/* Bottom quick actions */}
                      <div className="p-2.5 flex items-center justify-between bg-neutral-950/95 text-xs border-t border-neutral-800/60">
                        <span className="text-[10px] font-mono font-medium text-neutral-300">
                          {photo.mode === 'strip' ? (language === 'es' ? 'Tira 3x' : 'Strip 3x') : photo.mode === 'boomerang' ? 'Boomerang' : (language === 'es' ? 'Foto 1x' : 'Photo 1x')}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <a
                            href={photo.localBlobUrl}
                            download={`foto_${idx + 1}_${sessionId}.jpg`}
                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-[#ff2d55] text-neutral-200 hover:text-white transition-colors"
                            title={language === 'es' ? 'Descargar foto individual' : 'Download single photo'}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => onDeletePhoto(photo.id)}
                            className="p-1.5 rounded-lg hover:bg-red-950 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                            title={language === 'es' ? 'Eliminar de la sesión' : 'Delete from session'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </HorizontalCarousel>
              )}
            </div>

            {/* Quick Helper text */}
            <p className="text-[11px] text-neutral-500 text-center">
              {t.photoResolutionNotice}
            </p>
          </div>

          {/* Right Column: Group QR Code & Bulk Actions */}
          <div className="md:col-span-5 flex flex-col space-y-4">
            {/* Dynamic Session QR Code Card */}
            <div className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-5 flex flex-col items-center text-center shadow-lg">
              <div className="flex items-center justify-between w-full mb-3 px-1">
                <div className="flex items-center gap-2 text-red-400">
                  <QrCodeIcon className="w-5 h-5" />
                  <span className="text-sm font-semibold tracking-wide uppercase font-display">
                    {t.scanQrTitle}
                  </span>
                </div>

                {/* Tooltip trigger */}
                <div className="relative group cursor-pointer" tabIndex={0}>
                  <div
                    className="w-7 h-7 rounded-lg bg-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 flex items-center justify-center transition-colors border border-neutral-750"
                    title={t.sessionEndSubtitle}
                    aria-label="QR Code instructions"
                  >
                    <Info className="w-4 h-4" />
                  </div>
                  {/* Floating tooltip */}
                  <div className="absolute right-0 bottom-full mb-2 hidden group-hover:flex group-focus:flex items-center gap-2 w-64 p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-neutral-200 shadow-2xl z-30 pointer-events-none text-left">
                    <Smartphone className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{t.sessionEndSubtitle}</span>
                  </div>
                </div>
              </div>

              {/* QR Code Container */}
              <div
                className="p-3 bg-white rounded-2xl shadow-inner relative flex items-center justify-center w-52 h-52 sm:w-56 sm:h-56 cursor-pointer group"
                title={t.sessionEndSubtitle}
              >
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt={t.sessionEndSubtitle}
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-8 h-8 border-3 border-neutral-300 border-t-red-500 rounded-full animate-spin" />
                )}
              </div>

              {/* Explicit Guidance Banner */}
              <div className="mt-3.5 w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-red-950/40 border border-red-800/40 text-left shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-neutral-100">
                    {t.scanQrTitle}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {t.sessionEndSubtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-2.5">
              {/* Descargar Todas en ZIP */}
              <button
                onClick={handleDownloadAllZip}
                disabled={isZipping || sessionPhotos.length === 0}
                className="w-full min-h-[50px] px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Archive className="w-4 h-4" />
                <span>
                  {isZipping
                    ? t.compressingZip(zipProgress)
                    : `${t.downloadAllZip} (${sessionPhotos.length})`}
                </span>
              </button>

              {/* Copiar Enlace y Compartir */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleCopyLink}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 active:scale-[0.98] text-neutral-200 text-xs font-medium flex items-center justify-center gap-1.5 border border-neutral-700/80 transition-all cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">{t.linkCopied}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>{t.copyShareLink}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onClose}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 active:scale-[0.98] text-neutral-200 text-xs font-medium flex items-center justify-center gap-1.5 border border-neutral-700/80 transition-all cursor-pointer"
                >
                  <span>{language === 'es' ? 'Volver a la Cámara' : 'Back to Camera'}</span>
                </button>
              </div>

              {/* Siguiente Invitado / Nueva Sesión */}
              <button
                onClick={onNewSession}
                className="w-full min-h-[50px] px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{t.startNewSession}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
