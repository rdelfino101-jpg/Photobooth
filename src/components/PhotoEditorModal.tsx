import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Check,
  Undo,
  Trash2,
  Paintbrush,
  Smile,
  Move,
  RotateCw,
  Sparkles,
  Download,
  AlertCircle
} from 'lucide-react';
import { DrawnLine, PlacedSticker, CapturedPhotoRecord } from '../types/photobooth';
import { sounds } from '../utils/audio';
import { Language, TRANSLATIONS } from '../utils/i18n';

interface PhotoEditorModalProps {
  photo: CapturedPhotoRecord;
  isOpen: boolean;
  onClose: () => void;
  onSaveEditedPhoto: (editedBlob: Blob, editedBlobUrl: string) => Promise<void>;
  language?: Language;
}

const BRUSH_COLORS = [
  '#ef4444', // Red
  '#f59e0b', // Amber/Gold
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ffffff', // White
  '#000000', // Black
];

const STICKER_BADGES = [
  { text: 'El alma de la fiesta 💃', bg: '#ec4899', color: '#ffffff' },
  { text: 'Vengo por el pastel 🍰', bg: '#f59e0b', color: '#171717' },
  { text: '100% FIESTA 🎉', bg: '#ef4444', color: '#ffffff' },
  { text: 'Team Novios 💍', bg: '#d97706', color: '#ffffff' },
  { text: 'Team Novia 👰', bg: '#be185d', color: '#ffffff' },
  { text: 'No me etiqueten mañana 🙈', bg: '#6b7280', color: '#ffffff' },
  { text: '¡Viviendo la noche! ✨', bg: '#8b5cf6', color: '#ffffff' },
  { text: 'Modo VIP Activado 🕶️', bg: '#0f172a', color: '#facc15' },
];

const STICKER_EMOJIS = ['🎉', '🥂', '🕶️', '👑', '🔥', '❤️', '🌟', '🍕', '🚀', '📸', '💃', '🕺', '🥳', '🍸'];

export const PhotoEditorModal: React.FC<PhotoEditorModalProps> = ({
  photo,
  isOpen,
  onClose,
  onSaveEditedPhoto,
  language = 'es',
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'draw' | 'stickers'>('draw');

  // Drawing state
  const [brushColor, setBrushColor] = useState<string>('#ef4444');
  const [brushSize, setBrushSize] = useState<number>(6);
  const [lines, setLines] = useState<DrawnLine[]>([]);
  const isDrawingRef = useRef<boolean>(false);
  const currentLineRef = useRef<{ x: number; y: number }[]>([]);

  // Stickers state
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Load image
  useEffect(() => {
    if (!isOpen) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = photo.localBlobUrl;
    img.onload = () => {
      imgRef.current = img;
      redrawAll();
    };
  }, [photo, isOpen]);

  // Redraw canvas whenever lines change
  const redrawAll = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d')!;
    canvas.width = img.naturalWidth || 1080;
    canvas.height = img.naturalHeight || 1440;

    // Draw background photo
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw lines
    lines.forEach((line) => {
      if (line.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.size * (canvas.width / 600); // scale brush with resolution
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.moveTo(line.points[0].x * canvas.width, line.points[0].y * canvas.height);
      for (let i = 1; i < line.points.length; i++) {
        ctx.lineTo(line.points[i].x * canvas.width, line.points[i].y * canvas.height);
      }
      ctx.stroke();
    });

    // Draw stickers onto canvas
    stickers.forEach((st) => {
      const sx = (st.x / 100) * canvas.width;
      const sy = (st.y / 100) * canvas.height;
      const baseScale = canvas.width / 600;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate((st.rotation * Math.PI) / 180);
      ctx.scale(st.scale * baseScale, st.scale * baseScale);

      if (st.type === 'emoji') {
        ctx.font = '54px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(st.content, 0, 0);
      } else {
        // Comic Badge
        ctx.font = 'bold 22px Outfit, sans-serif';
        const metrics = ctx.measureText(st.content);
        const paddingX = 18;
        const paddingY = 10;
        const boxW = metrics.width + paddingX * 2;
        const boxH = 40;

        // Badge Pill / Bubble
        ctx.fillStyle = st.bgColor || '#ef4444';
        ctx.beginPath();
        ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 20);
        ctx.fill();

        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Badge Text
        ctx.fillStyle = st.textColor || '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(st.content, 0, 1);
      }

      ctx.restore();
    });
  };

  useEffect(() => {
    redrawAll();
  }, [lines, stickers]);

  // Pointer event handlers for drawing
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTab !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    isDrawingRef.current = true;
    currentLineRef.current = [{ x, y }];
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || activeTab !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    currentLineRef.current.push({ x, y });

    // Live preview stroke
    const ctx = canvas.getContext('2d');
    if (ctx && currentLineRef.current.length > 1) {
      const len = currentLineRef.current.length;
      const p1 = currentLineRef.current[len - 2];
      const p2 = currentLineRef.current[len - 1];

      ctx.beginPath();
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize * (canvas.width / 600);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
      ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
      ctx.stroke();
    }
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current || activeTab !== 'draw') return;
    isDrawingRef.current = false;
    if (currentLineRef.current.length > 1) {
      setLines((prev) => [
        ...prev,
        {
          points: currentLineRef.current,
          color: brushColor,
          size: brushSize,
        },
      ]);
    }
    currentLineRef.current = [];
  };

  const handleUndo = () => {
    if (activeTab === 'draw') {
      setLines((prev) => prev.slice(0, -1));
    } else {
      setStickers((prev) => prev.slice(0, -1));
    }
  };

  const handleClearAll = () => {
    setLines([]);
    setStickers([]);
  };

  // Sticker Stamp
  const addBadgeSticker = (badge: { text: string; bg: string; color: string }) => {
    sounds.playCountdownTick(1.2);
    const newSticker: PlacedSticker = {
      id: `badge_${Date.now()}`,
      type: 'badge',
      content: badge.text,
      x: 35 + Math.random() * 30,
      y: 35 + Math.random() * 30,
      scale: 1.0,
      rotation: Math.floor(Math.random() * 20 - 10),
      bgColor: badge.bg,
      textColor: badge.color,
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const addEmojiSticker = (emoji: string) => {
    sounds.playCountdownTick(1.3);
    const newSticker: PlacedSticker = {
      id: `emoji_${Date.now()}`,
      type: 'emoji',
      content: emoji,
      x: 35 + Math.random() * 30,
      y: 35 + Math.random() * 30,
      scale: 1.1,
      rotation: Math.floor(Math.random() * 24 - 12),
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const handleSaveAndBake = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsProcessing(true);

    redrawAll();

    canvas.toBlob(
      async (blob) => {
        if (blob) {
          const newUrl = URL.createObjectURL(blob);
          await onSaveEditedPhoto(blob, newUrl);
          sounds.playApplause();
        }
        setIsProcessing(false);
        onClose();
      },
      'image/jpeg',
      0.88
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[96vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-600/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
              <Paintbrush className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">
                {t.editorTitle}
              </h2>
              <p className="text-[11px] text-neutral-400">
                {language === 'es'
                  ? 'Personaliza tu foto con trazos libres y stickers antes de guardar'
                  : 'Customize your photo with freehand strokes and stickers before saving'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={lines.length === 0 && stickers.length === 0}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-white transition-all disabled:opacity-40 cursor-pointer"
              title={t.editorUndo}
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={handleClearAll}
              disabled={lines.length === 0 && stickers.length === 0}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-red-400 transition-all disabled:opacity-40 cursor-pointer"
              title={t.editorClear}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all cursor-pointer"
              title={t.editorCancel}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-3 p-3 sm:p-4 items-center">
          {/* Main Interactive Canvas Area */}
          <div className="md:col-span-8 flex flex-col items-center justify-center bg-black/60 rounded-2xl p-2 border border-neutral-800/80 max-h-[60vh] md:max-h-[72vh] overflow-hidden relative">
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="max-h-[58vh] md:max-h-[68vh] max-w-full object-contain rounded-xl shadow-2xl cursor-crosshair touch-none border border-neutral-800"
            />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-[11px] text-neutral-300 pointer-events-none border border-neutral-700">
              {activeTab === 'draw'
                ? (language === 'es' ? '✍️ Dibuja o firma con tu dedo' : '✍️ Draw or sign with your finger')
                : (language === 'es' ? '🏷️ Toca un sticker para agregarlo' : '🏷️ Tap a sticker to add it')}
            </div>
          </div>

          {/* Tools & Palette Panel */}
          <div className="md:col-span-4 flex flex-col justify-between h-full bg-neutral-950/70 border border-neutral-800/80 rounded-2xl p-4 overflow-y-auto space-y-4">
            {/* Mode Switch Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-900 rounded-xl border border-neutral-800 shrink-0">
              <button
                onClick={() => setActiveTab('draw')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'draw'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Paintbrush className="w-3.5 h-3.5" />
                <span>{t.editorDrawTab}</span>
              </button>
              <button
                onClick={() => setActiveTab('stickers')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'stickers'
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Smile className="w-3.5 h-3.5" />
                <span>{t.editorStickersTab}</span>
              </button>
            </div>

            {/* Sub-tools Tab 1: Drawing Brush */}
            {activeTab === 'draw' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 mb-2 block">
                    Color del Pincel
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {BRUSH_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setBrushColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-full h-8 rounded-lg transition-transform cursor-pointer border ${
                          brushColor === c ? 'scale-110 ring-2 ring-white border-white' : 'border-neutral-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-300 mb-1.5">
                    <span>Grosor del Trazo</span>
                    <span className="text-pink-400 font-mono">{brushSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="24"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-full accent-pink-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                    <span>Fino (Firma)</span>
                    <span>Medio</span>
                    <span>Grueso</span>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tools Tab 2: Stickers */}
            {activeTab === 'stickers' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 mb-2 block">
                    Insignias Cómicas de Fiesta
                  </label>
                  <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto pr-1">
                    {STICKER_BADGES.map((b, idx) => (
                      <button
                        key={idx}
                        onClick={() => addBadgeSticker(b)}
                        style={{ backgroundColor: b.bg, color: b.color }}
                        className="w-full py-2 px-3 rounded-xl text-xs font-bold text-left hover:scale-[1.02] active:scale-95 transition-all shadow-sm border border-white/20 cursor-pointer"
                      >
                        {b.text}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 mb-2 block">
                    Emojis de Fiesta
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {STICKER_EMOJIS.map((em, idx) => (
                      <button
                        key={idx}
                        onClick={() => addEmojiSticker(em)}
                        className="h-10 text-xl bg-neutral-900 hover:bg-neutral-800 rounded-xl flex items-center justify-center active:scale-90 transition-transform cursor-pointer border border-neutral-800"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Final Action Button */}
            <div className="pt-2 border-t border-neutral-800">
              <button
                onClick={handleSaveAndBake}
                disabled={isProcessing}
                className="w-full min-h-[48px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isProcessing ? t.editorSaving : t.editorSave}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
