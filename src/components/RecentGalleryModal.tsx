import React from 'react';
import { X, Download, QrCode, Trash2, Image as ImageIcon } from 'lucide-react';
import { CapturedPhotoRecord } from '../types/photobooth';
import { HorizontalCarousel } from './HorizontalCarousel';

interface RecentGalleryModalProps {
  photos: CapturedPhotoRecord[];
  onSelectPhoto: (photo: CapturedPhotoRecord) => void;
  onDeletePhoto: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

export const RecentGalleryModal: React.FC<RecentGalleryModalProps> = ({
  photos,
  onSelectPhoto,
  onDeletePhoto,
  onClearAll,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-100 font-display">Galería de la Sesión</h2>
              <p className="text-xs text-neutral-400">
                {photos.length} {photos.length === 1 ? 'foto capturada' : 'fotos capturadas'} en esta sesión
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {photos.length > 0 && (
              <button
                onClick={onClearAll}
                className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-medium border border-red-800/40 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Borrar Todo</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              aria-label="Cerrar Galería"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Gallery Carousel & View */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center">
          {photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-neutral-500">
              <ImageIcon className="w-12 h-12 stroke-[1.2] mb-3 text-neutral-600" />
              <p className="text-sm font-medium text-neutral-400">Aún no hay fotos capturadas</p>
              <p className="text-xs text-neutral-600 mt-1">¡Toca el obturador para tomar la primera foto!</p>
            </div>
          ) : (
            <HorizontalCarousel scrollStep={260} ariaLabel="Carrusel de Galería de Fotos" className="py-3">
              {photos.map((item, idx) => (
                <div
                  key={item.id}
                  className="group relative w-56 sm:w-64 bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden shadow-lg hover:border-[#ff2d55]/70 transition-all shrink-0"
                >
                  {/* Thumbnail */}
                  <div
                    onClick={() => onSelectPhoto(item)}
                    className="cursor-pointer aspect-[4/3] w-full bg-neutral-900 flex items-center justify-center overflow-hidden"
                  >
                    <img
                      src={item.localBlobUrl}
                      alt="Foto de cabina"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>

                  {/* Number Tag */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-sm text-[10px] font-bold text-white border border-white/20">
                    #{idx + 1}
                  </div>

                  {/* Metadata and Action strip */}
                  <div className="p-2.5 flex items-center justify-between bg-neutral-950/95 text-xs border-t border-neutral-800/60">
                    <span className="font-mono text-[10px] text-neutral-400">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSelectPhoto(item)}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-[#ff2d55] text-neutral-300 hover:text-white transition-colors cursor-pointer"
                        title="Ver Código QR"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={item.localBlobUrl}
                        download={`foto_${idx + 1}_${Date.now()}.jpg`}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-[#ff2d55] text-neutral-300 hover:text-white transition-colors"
                        title="Descargar Foto"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => onDeletePhoto(item.id)}
                        className="p-1.5 rounded-lg hover:bg-red-950/60 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                        title="Eliminar Foto"
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
      </div>
    </div>
  );
};
