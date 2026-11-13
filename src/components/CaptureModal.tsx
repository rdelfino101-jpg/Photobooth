import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  Download,
  RotateCcw,
  Sparkles,
  Share2,
  Check,
  ExternalLink,
  QrCode as QrCodeIcon,
  CloudCheck,
  AlertCircle,
  X,
  Smartphone,
  Info,
  Camera,
  FolderDown,
  CheckCircle2,
  Paintbrush,
  Film
} from 'lucide-react';
import { CapturedPhotoRecord } from '../types/photobooth';
import { BoomerangPlayer } from './BoomerangPlayer';
import { Language, TRANSLATIONS } from '../utils/i18n';

interface CaptureModalProps {
  photo: CapturedPhotoRecord | null;
  sessionPhotosCount: number;
  enableEditor?: boolean;
  onOpenEditor?: () => void;
  onTakeAnother: () => void; // "Tomar otra foto (seguir en sesión)"
  onFinishSession: () => void; // "Finalizar sesión y ver QR"
  onRetake: () => void;
  onClose: () => void;
  language?: Language;
}

export const CaptureModal: React.FC<CaptureModalProps> = ({
  photo,
  sessionPhotosCount,
  enableEditor = true,
  onOpenEditor,
  onTakeAnother,
  onFinishSession,
  onRetake,
  onClose,
  language = 'es',
}) => {
  const t = TRANSLATIONS[language];
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [qrLoading, setQrLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!photo) return;

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#ef4444', '#f59e0b', '#38bdf8', '#10b981'],
        disableForReducedMotion: true,
      });
    } catch {
      // Ignore
    }

    const targetUrl = photo.publicUrl || photo.localBlobUrl;

    setQrLoading(true);
    QRCode.toDataURL(targetUrl, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        setQrCodeDataUrl(url);
        setQrLoading(false);
      })
      .catch((err) => {
        console.error('Failed to generate QR Code:', err);
        setQrLoading(false);
      });
  }, [photo]);

  if (!photo) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = photo.localBlobUrl;
    a.download = `foto_${photo.sessionId}_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyLink = async () => {
    const urlToCopy = photo.publicUrl || photo.localBlobUrl;
    try {
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const isStrip = photo.mode === 'strip';

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn">
      {/* Container */}
      <div className="relative w-full max-w-5xl max-h-[95vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/80 bg-neutral-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-100 font-display">
                  {photo.isBoomerang
                    ? '¡Boomerang en Bucle Listo!'
                    : isStrip
                    ? '¡Tira Capturada!'
                    : '¡Foto Capturada!'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                  {photo.isBoomerang ? 'Ráfaga 15 fps' : `Foto #${sessionPhotosCount} de la sesión`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                <span>{new Date(photo.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{photo.sessionId}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-neutral-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Split View (Photo + QR/Session Actions) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Photo Preview Pane */}
          <div className="md:col-span-7 flex flex-col items-center justify-center bg-neutral-950/80 rounded-2xl p-3 border border-neutral-800/60 min-h-[300px]">
            {photo.isBoomerang && photo.boomerangFrames && photo.boomerangFrames.length > 0 ? (
              <BoomerangPlayer frames={photo.boomerangFrames} className="w-full" />
            ) : (
              <div className="relative flex items-center justify-center max-h-[58vh] w-full">
                <img
                  src={photo.localBlobUrl}
                  alt="Foto de la cabina"
                  referrerPolicy="no-referrer"
                  className={`max-h-[56vh] max-w-full object-contain rounded-xl shadow-2xl border border-neutral-800/80 ${
                    isStrip ? 'h-[56vh] w-auto' : ''
                  }`}
                />
              </div>
            )}
            <p className="mt-2 text-xs text-neutral-500 text-center">
              {photo.isBoomerang
                ? 'Reproduciendo en bucle ping-pong infinito · Guardado en Supabase'
                : 'Guardada en la sesión actual · Resolución 24-bit PNG'}
            </p>
          </div>

          {/* QR Code & Session Options Pane */}
          <div className="md:col-span-5 flex flex-col items-center justify-between h-full space-y-4">
            {/* Dynamic QR Card */}
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
                    title={t.scanQrTooltip}
                    aria-label="QR Code instructions tooltip"
                  >
                    <Info className="w-4 h-4" />
                  </div>
                  {/* Floating tooltip bubble */}
                  <div className="absolute right-0 bottom-full mb-2 hidden group-hover:flex group-focus:flex items-center gap-2 w-64 p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-neutral-200 shadow-2xl z-30 pointer-events-none text-left">
                    <Smartphone className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{t.scanQrTooltip}</span>
                  </div>
                </div>
              </div>

              {/* QR Code Box */}
              <div
                className="p-3 bg-white rounded-2xl shadow-inner relative flex items-center justify-center w-48 h-48 sm:w-52 sm:h-52 cursor-pointer group"
                title={t.scanQrTooltip}
              >
                {qrLoading ? (
                  <div className="w-8 h-8 border-3 border-neutral-300 border-t-red-500 rounded-full animate-spin" />
                ) : qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt={t.scanQrTooltip}
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <span className="text-xs text-neutral-500">{t.qrNotAvailable}</span>
                )}
              </div>

              {/* Explicit Guidance Banner */}
              <div className="mt-3 w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-red-950/40 border border-red-800/40 text-left shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-neutral-100">
                    {t.scanQrTitle}
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    {t.scanQrSubtitle}
                  </p>
                </div>
              </div>

              {/* Cloud upload status badge */}
              <div className="mt-2.5 w-full flex items-center justify-center gap-2 pt-2 border-t border-neutral-800/80 text-[11px]">
                {photo.publicUrl && !photo.error ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CloudCheck className="w-3.5 h-3.5" />
                    <span>{t.supabaseUploaded}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{photo.error ? t.localSaved : t.localReady}</span>
                  </span>
                )}
              </div>
            </div>

            {/* HERRAMIENTAS LOCALES 100% INSTANTÁNEAS Y CONFIABLES */}
            <div className="w-full space-y-2.5">
              {/* 1. Dibujo táctil a mano alzada y estampado de stickers festivos */}
              {enableEditor && !photo.isBoomerang && onOpenEditor && (
                <button
                  onClick={onOpenEditor}
                  className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:from-pink-500 hover:to-amber-400 active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-600/20 transition-all cursor-pointer"
                >
                  <Paintbrush className="w-4 h-4" />
                  <span>{t.btnTouchDraw}</span>
                </button>
              )}

              {/* 2. Botón: Tomar otra foto (seguir en sesión) */}
              <button
                onClick={onTakeAnother}
                className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>{t.btnTakeAnother}</span>
              </button>

              {/* 3. Botón: Descargar .jpg */}
              <button
                onClick={handleDownload}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 active:scale-[0.98] text-neutral-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-neutral-700/80 shadow-md transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>{t.btnDownloadJpg}</span>
              </button>

              {/* 4. Botón: Finalizar sesión y ver QR */}
              <button
                onClick={onFinishSession}
                className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.btnFinishSessionQr(sessionPhotosCount)}</span>
              </button>

              {/* Botón secundario: Repetir disparo */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={onRetake}
                  className="px-3 py-1.5 rounded-lg text-neutral-400 hover:text-amber-400 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title={t.btnRetake}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.btnRetake}</span>
                </button>
              </div>

              {photo.publicUrl && (
                <div className="text-center pt-1">
                  <a
                    href={photo.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-red-400 transition-colors"
                  >
                    <span>{t.openPublicUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
