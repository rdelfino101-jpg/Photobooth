import React, { useState } from 'react';
import {
  X,
  Palette,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Settings,
  Upload,
  Download,
  RotateCcw,
  Check,
  Trash2,
  Sliders,
  Type,
  Lock,
  FileCheck,
  Plus,
  Gift,
  Heart,
  PartyPopper,
  Briefcase,
  HelpCircle,
  Hash,
  Calendar,
  Grid,
  Dices,
  Volume2,
  Paintbrush,
  Tv,
  ExternalLink,
  Film,
  Database,
  HardDrive,
  Archive,
  RefreshCw,
  AlertTriangle,
  Cloud,
  FolderArchive,
  Search
} from 'lucide-react';
import {
  EventConfig,
  EventTheme,
  ParticleEffect,
  LogoPosition,
  LogoSize,
  FontFamilyOption,
  AnchorType,
  CustomPropItem,
  CustomFrameItem,
  DEFAULT_EVENT_CONFIG,
} from '../types/photobooth';
import {
  listAllBucketFiles,
  emptyBucketStorage,
  StorageFileItem,
  BUCKET_NAME,
  supabaseUrl,
} from '../utils/supabase';
import { downloadAllBucketPhotosAsZip } from '../utils/zipDownloader';

interface AdminPanelModalProps {
  config: EventConfig;
  onSave: (newConfig: EventConfig) => void;
  onClose: () => void;
  onLaunchLiveWall?: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  config,
  onSave,
  onClose,
  onLaunchLiveWall,
}) => {
  const [activeTab, setActiveTab] = useState<'identity' | 'composition' | 'props' | 'chroma' | 'entertainment' | 'storage' | 'profiles'>('identity');
  const [formData, setFormData] = useState<EventConfig>({ ...config });
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Storage Manager State (Supabase)
  const [bucketFiles, setBucketFiles] = useState<StorageFileItem[]>([]);
  const [storageStats, setStorageStats] = useState<{
    totalFiles: number;
    totalSizeBytes: number;
    totalSizeFormatted: string;
    sessionsCount: number;
  }>({
    totalFiles: 0,
    totalSizeBytes: 0,
    totalSizeFormatted: '0 MB',
    sessionsCount: 0,
  });
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [isZippingAll, setIsZippingAll] = useState<boolean>(false);
  const [zipAllProgress, setZipAllProgress] = useState<number>(0);
  const [searchSession, setSearchSession] = useState<string>('');

  const loadStorageData = React.useCallback(async () => {
    setIsLoadingFiles(true);
    try {
      const files = await listAllBucketFiles();
      setBucketFiles(files);
      const totalSizeBytes = files.reduce((acc, f) => acc + (f.size || 350000), 0);
      const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(1);
      const sessions = new Set(files.map((f) => f.folder).filter((f) => f !== 'root'));
      setStorageStats({
        totalFiles: files.length,
        totalSizeBytes,
        totalSizeFormatted: `${totalSizeMB} MB`,
        sessionsCount: sessions.size || (files.length > 0 ? 1 : 0),
      });
    } catch (e) {
      console.warn('Error fetching bucket storage data:', e);
    } finally {
      setIsLoadingFiles(false);
    }
  }, []);

  React.useEffect(() => {
    if (activeTab === 'storage') {
      loadStorageData();
    }
  }, [activeTab, loadStorageData]);

  const handleDownloadAllEventZip = async () => {
    if (bucketFiles.length === 0 || isZippingAll) return;
    setIsZippingAll(true);
    setZipAllProgress(5);
    try {
      await downloadAllBucketPhotosAsZip(bucketFiles, (percent) => {
        setZipAllProgress(percent);
      });
      showToast('¡Descarga de todas las fotos (.ZIP) completada!');
    } catch (err) {
      console.error('Error downloading zip:', err);
      alert('Hubo un error al empaquetar las fotos en ZIP.');
    } finally {
      setIsZippingAll(false);
      setZipAllProgress(0);
    }
  };

  const handleEmptyBucket = async () => {
    // 1st confirmation
    const firstConfirm = window.confirm(
      '¿Estás seguro de que deseas vaciar el bucket "photobooth"?\n\nEsta acción eliminará todas las fotos de eventos anteriores de Supabase Storage para liberar el almacenamiento gratuito (1 GB) antes de comenzar tu nuevo evento.'
    );
    if (!firstConfirm) return;

    // 2nd confirmation
    const secondConfirm = window.confirm(
      '⚠️ CONFIRMACIÓN FINAL IRREVERSIBLE:\n\nSe eliminarán de forma permanente todas las fotos almacenadas en la nube. ¿Deseas proceder ahora?'
    );
    if (!secondConfirm) return;

    setIsLoadingFiles(true);
    try {
      const result = await emptyBucketStorage();
      if (result.error) {
        alert(`Error al vaciar el bucket: ${result.error}`);
      } else {
        showToast(`¡Bucket vaciado con éxito! Se eliminaron ${result.deletedCount} fotos.`);
        await loadStorageData();
      }
    } catch (err: any) {
      alert(`Error al vaciar almacenamiento: ${err?.message || 'Error de red'}`);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Temporary state for new custom AR prop
  const [newPropName, setNewPropName] = useState<string>('');
  const [newPropDataUrl, setNewPropDataUrl] = useState<string | null>(null);
  const [newPropAnchor, setNewPropAnchor] = useState<AnchorType>('eyes');
  const [newPropScale, setNewPropScale] = useState<number>(1.0);
  const [newPropOffsetY, setNewPropOffsetY] = useState<number>(0);

  // New PIN state
  const [newPin, setNewPin] = useState<string>(formData.adminPin);

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleApplyPreset = (theme: EventTheme) => {
    if (theme === 'xmas') {
      setFormData((prev) => ({
        ...prev,
        activeTheme: 'xmas',
        eventTitle: '¡FELIZ NAVIDAD!',
        eventSubtitle: 'Noche de Paz y Alegría',
        eventHashtag: '#NavidadSnapKiosk',
        fontFamily: 'Outfit',
        primaryColor: '#dc2626',
        accentColor: '#fde047',
        bgColor: '#0a0a0a',
        buttonColor: '#dc2626',
        stripBgColor: '#7f1d1d',
        particleEffect: 'snow',
      }));
    } else if (theme === 'wedding') {
      setFormData((prev) => ({
        ...prev,
        activeTheme: 'wedding',
        eventTitle: 'Ana & Carlos',
        eventSubtitle: 'Nuestra Boda · Para Siempre',
        eventHashtag: '#BodaAnaYCarlos',
        fontFamily: 'Dancing Script',
        primaryColor: '#d97706',
        accentColor: '#fef08a',
        bgColor: '#171412',
        buttonColor: '#b45309',
        stripBgColor: '#ffffff',
        particleEffect: 'sparkles',
      }));
    } else if (theme === 'party') {
      setFormData((prev) => ({
        ...prev,
        activeTheme: 'party',
        eventTitle: '¡FIESTA & CUMPLE!',
        eventSubtitle: 'Noche Inolvidable',
        eventHashtag: '#PartyTime2026',
        fontFamily: 'Poppins',
        primaryColor: '#ec4899',
        accentColor: '#38bdf8',
        bgColor: '#090d16',
        buttonColor: '#db2777',
        stripBgColor: '#090d16',
        particleEffect: 'confetti',
      }));
    } else if (theme === 'corporate') {
      setFormData((prev) => ({
        ...prev,
        activeTheme: 'corporate',
        eventTitle: 'Gala Anual 2026',
        eventSubtitle: 'Innovación & Liderazgo',
        eventHashtag: '#SummitCorp2026',
        fontFamily: 'Montserrat',
        primaryColor: '#2563eb',
        accentColor: '#38bdf8',
        bgColor: '#0f172a',
        buttonColor: '#1d4ed8',
        stripBgColor: '#0f172a',
        particleEffect: 'sparkles',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        activeTheme: 'custom',
      }));
    }
    showToast(`Plantilla "${theme.toUpperCase()}" cargada`);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setFormData((prev) => ({ ...prev, logoUrl: url }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        const newFrame: CustomFrameItem = {
          id: `frame_${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          dataUrl: url,
        };
        setFormData((prev) => ({
          ...prev,
          customFrames: [...prev.customFrames, newFrame],
          activeCustomFrameId: newFrame.id,
        }));
        showToast('Marco PNG subido con éxito');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomStripBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setFormData((prev) => ({
          ...prev,
          stripBgType: 'image',
          stripBgImageUrl: url,
        }));
        showToast('Fondo de plantilla subido');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomPropUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setNewPropDataUrl(url);
        if (!newPropName) {
          setNewPropName(file.name.replace(/\.[^/.]+$/, ''));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCustomProp = () => {
    if (!newPropDataUrl || !newPropName.trim()) return;
    const propItem: CustomPropItem = {
      id: `custom_prop_${Date.now()}`,
      name: newPropName.trim(),
      dataUrl: newPropDataUrl,
      anchorType: newPropAnchor,
      scale: newPropScale,
      offsetY: newPropOffsetY,
    };
    setFormData((prev) => ({
      ...prev,
      customProps: [...prev.customProps, propItem],
    }));
    setNewPropDataUrl(null);
    setNewPropName('');
    setNewPropScale(1.0);
    setNewPropOffsetY(0);
    showToast('Accesorio AR añadido');
  };

  const handleSaveAndApply = () => {
    onSave(formData);
    showToast('¡Configuración guardada y aplicada en vivo!');
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `${formData.eventTitle.replace(/[^a-z0-9]/gi, '_') || 'evento'}_plantilla.json`);
    dlAnchor.click();
    showToast('Plantilla JSON descargada');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string);
          setFormData({ ...DEFAULT_EVENT_CONFIG, ...parsed });
          showToast('Plantilla cargada correctamente');
        } catch {
          alert('El archivo no es un JSON válido');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetFactory = () => {
    if (window.confirm('¿Seguro que deseas restablecer los valores de fábrica de la cabina?')) {
      setFormData({ ...DEFAULT_EVENT_CONFIG });
      showToast('Valores de fábrica restablecidos');
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-100 font-display flex items-center gap-2">
                <span>Panel de Administración</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  Personalizador de Eventos
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400">
                Personaliza la cabina para bodas, fiestas, eventos corporativos y navideños
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAndApply}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Guardar en Vivo</span>
            </button>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast feedback */}
        {saveToast && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-300 text-xs px-4 py-2 text-center font-semibold animate-fadeIn flex items-center justify-center gap-2">
            <FileCheck className="w-4 h-4" />
            <span>{saveToast}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-neutral-900 bg-neutral-900/30 overflow-x-auto scrollbar-none shrink-0">
          {[
            { id: 'identity', label: '1. Identidad & Estilo', icon: Palette },
            { id: 'composition', label: '2. Tiras & Marcos', icon: ImageIcon },
            { id: 'props', label: '3. Props AR & Efectos', icon: Sparkles },
            { id: 'chroma', label: '4. Fondos Chroma', icon: Layers },
            { id: 'entertainment', label: '5. Fiesta & Muro Proyector', icon: PartyPopper },
            { id: 'storage', label: '6. Almacenamiento Nube', icon: Database },
            { id: 'profiles', label: '7. Perfiles & PIN', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`min-h-[42px] px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-neutral-800 text-amber-300 border border-neutral-700 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ============================================================== */}
          {/* TAB 1: IDENTIDAD Y LOOK & FEEL                                */}
          {/* ============================================================== */}
          {activeTab === 'identity' && (
            <div className="space-y-6">
              {/* Quick Themes Preset Buttons */}
              <div className="p-3.5 rounded-2xl bg-neutral-900/40 border border-neutral-850">
                <span className="text-xs font-bold text-neutral-300 block mb-2 uppercase tracking-wider">
                  Carga Rápida de Temática:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'xmas', label: 'Navidad Festiva', icon: Gift, color: 'text-red-400' },
                    { id: 'wedding', label: 'Boda / Elegante', icon: Heart, color: 'text-amber-400' },
                    { id: 'party', label: 'Fiesta / Cumple', icon: PartyPopper, color: 'text-pink-400' },
                    { id: 'corporate', label: 'Corporativo', icon: Briefcase, color: 'text-blue-400' },
                  ].map((preset) => {
                    const Icon = preset.icon;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyPreset(preset.id as EventTheme)}
                        className={`min-h-[48px] p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                          formData.activeTheme === preset.id
                            ? 'bg-neutral-850 border-amber-500/80 text-white shadow-sm'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${preset.color}`} />
                        <span className="text-xs font-semibold">{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Event Texts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Título Principal de la Cabina
                  </label>
                  <input
                    type="text"
                    value={formData.eventTitle}
                    onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
                    placeholder="ej. Boda Ana & Carlos"
                    className="w-full min-h-[46px] px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Subtítulo / Mensaje
                  </label>
                  <input
                    type="text"
                    value={formData.eventSubtitle}
                    onChange={(e) => setFormData({ ...formData, eventSubtitle: e.target.value })}
                    placeholder="ej. Noche Mágica"
                    className="w-full min-h-[46px] px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Hashtag del Evento
                  </label>
                  <div className="relative flex items-center">
                    <Hash className="w-3.5 h-3.5 text-neutral-500 absolute left-3" />
                    <input
                      type="text"
                      value={formData.eventHashtag}
                      onChange={(e) => setFormData({ ...formData, eventHashtag: e.target.value })}
                      placeholder="BodaAnaYCarlos"
                      className="w-full min-h-[46px] pl-8 pr-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Event Logo & Placement */}
              <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-3">
                <span className="text-xs font-bold text-neutral-200 block uppercase tracking-wider">
                  Logo del Evento (PNG / SVG)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-5 flex items-center gap-3">
                    {formData.logoUrl ? (
                      <div className="relative w-20 h-16 rounded-xl border border-neutral-700 bg-neutral-950 p-1 flex items-center justify-center shrink-0">
                        <img
                          src={formData.logoUrl}
                          alt="Logo del evento"
                          className="max-w-full max-h-full object-contain"
                        />
                        <button
                          onClick={() => setFormData({ ...formData, logoUrl: null })}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs hover:bg-red-500"
                          title="Eliminar logo"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label className="w-20 h-16 rounded-xl border border-dashed border-neutral-700 bg-neutral-950/70 hover:border-amber-400 flex flex-col items-center justify-center text-neutral-400 hover:text-white cursor-pointer shrink-0 transition-colors">
                        <Upload className="w-4 h-4 mb-0.5" />
                        <span className="text-[10px]">Subir Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                    <div className="text-[11px] text-neutral-400">
                      Sube el logo de la empresa o monograma de boda con fondo transparente.
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="text-xs text-neutral-400 block mb-1">Posición en Pantalla</label>
                    <select
                      value={formData.logoPosition}
                      onChange={(e) => setFormData({ ...formData, logoPosition: e.target.value as LogoPosition })}
                      className="w-full min-h-[44px] px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
                    >
                      <option value="top_center">Arriba al Centro</option>
                      <option value="top_left">Esquina Superior Izquierda</option>
                      <option value="top_right">Esquina Superior Derecha</option>
                      <option value="bottom_center">Abajo al Centro</option>
                      <option value="bottom_right">Esquina Inferior Derecha</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-xs text-neutral-400 block mb-1">Tamaño del Logo</label>
                    <select
                      value={formData.logoSize}
                      onChange={(e) => setFormData({ ...formData, logoSize: e.target.value as LogoSize })}
                      className="w-full min-h-[44px] px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
                    >
                      <option value="small">Pequeño</option>
                      <option value="medium">Mediano</option>
                      <option value="large">Grande</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Typography Selector */}
              <div>
                <label className="text-xs font-bold text-neutral-200 block mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tipografía de la Cabina y Tiras</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'Outfit', desc: 'Moderna / Kiosk', fontClass: 'font-sans' },
                    { id: 'Poppins', desc: 'Geométrica / Limpia', fontClass: 'font-sans' },
                    { id: 'Playfair Display', desc: 'Serif Elegante', fontClass: 'font-serif' },
                    { id: 'Dancing Script', desc: 'Manuscrita / Bodas', fontClass: 'font-serif' },
                    { id: 'Montserrat', desc: 'Corporativa', fontClass: 'font-sans' },
                    { id: 'Lobster', desc: 'Festiva / Vintage', fontClass: 'font-serif' },
                    { id: 'Plus Jakarta Sans', desc: 'Tecnológica', fontClass: 'font-sans' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, fontFamily: f.id as FontFamilyOption })}
                      className={`min-h-[50px] p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        formData.fontFamily === f.id
                          ? 'bg-neutral-850 border-amber-500 text-amber-300 shadow-sm'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                      style={{ fontFamily: f.id }}
                    >
                      <p className="text-sm font-bold truncate leading-tight">{f.id}</p>
                      <p className="text-[10px] text-neutral-500 leading-tight mt-0.5">{f.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Palette */}
              <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-3">
                <span className="text-xs font-bold text-neutral-200 block uppercase tracking-wider">
                  Paleta de Colores de la Interfaz
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Color Primario</label>
                    <div className="flex items-center gap-2 bg-neutral-900 p-1.5 rounded-xl border border-neutral-800">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-full text-xs font-mono text-white bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Color de Acento</label>
                    <div className="flex items-center gap-2 bg-neutral-900 p-1.5 rounded-xl border border-neutral-800">
                      <input
                        type="color"
                        value={formData.accentColor}
                        onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                        className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={formData.accentColor}
                        onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                        className="w-full text-xs font-mono text-white bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Fondo de Interfaz</label>
                    <div className="flex items-center gap-2 bg-neutral-900 p-1.5 rounded-xl border border-neutral-800">
                      <input
                        type="color"
                        value={formData.bgColor}
                        onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                        className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={formData.bgColor}
                        onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                        className="w-full text-xs font-mono text-white bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Color de Botones</label>
                    <div className="flex items-center gap-2 bg-neutral-900 p-1.5 rounded-xl border border-neutral-800">
                      <input
                        type="color"
                        value={formData.buttonColor}
                        onChange={(e) => setFormData({ ...formData, buttonColor: e.target.value })}
                        className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={formData.buttonColor}
                        onChange={(e) => setFormData({ ...formData, buttonColor: e.target.value })}
                        className="w-full text-xs font-mono text-white bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: TIRA FOTOGRÁFICA, COLLAGE Y MARCOS                     */}
          {/* ============================================================== */}
          {activeTab === 'composition' && (
            <div className="space-y-6">
              {/* Allowed Capture Modes */}
              <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-3">
                <span className="text-xs font-bold text-neutral-200 block uppercase tracking-wider">
                  Modos de Captura Habilitados para los Invitados
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowedCaptureModes.single}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowedCaptureModes: { ...formData.allowedCaptureModes, single: e.target.checked },
                        })
                      }
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">Foto Única (1x)</p>
                      <p className="text-[10px] text-neutral-400">Toma individual clásica</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowedCaptureModes.boomerang}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowedCaptureModes: { ...formData.allowedCaptureModes, boomerang: e.target.checked },
                        })
                      }
                      className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
                    />
                    <div>
                      <p className="text-xs font-bold text-pink-400">Modo Boomerang / Ráfaga</p>
                      <p className="text-[10px] text-neutral-400">Bucle ping-pong 15 fotogramas</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowedCaptureModes.life4cuts}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowedCaptureModes: { ...formData.allowedCaptureModes, life4cuts: e.target.checked },
                        })
                      }
                      className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                    />
                    <div>
                      <p className="text-xs font-bold text-rose-300">Tira Coreana (Life4Cuts)</p>
                      <p className="text-[10px] text-neutral-400">4 tomas estéticas verticales</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowedCaptureModes.strip}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowedCaptureModes: { ...formData.allowedCaptureModes, strip: e.target.checked },
                        })
                      }
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">Tira Vertical Clásica</p>
                      <p className="text-[10px] text-neutral-400">Estilo cabina tradicional 2x6</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowedCaptureModes.collage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowedCaptureModes: { ...formData.allowedCaptureModes, collage: e.target.checked },
                        })
                      }
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">Collage 2x2 (4 fotos)</p>
                      <p className="text-[10px] text-neutral-400">Cuadrícula cuadrada 4 poses</p>
                    </div>
                  </label>
                </div>

                {formData.allowedCaptureModes.life4cuts && (
                  <div className="flex items-center gap-3 pt-2 border-t border-neutral-850">
                    <span className="text-xs text-neutral-400">Fondo Tira Coreana Life4Cuts:</span>
                    {[
                      { label: 'Blanco', color: '#ffffff' },
                      { label: 'Negro', color: '#121212' },
                      { label: 'Rosa Pastel', color: '#fce7f3' },
                      { label: 'Azul Cielo', color: '#e0f2fe' },
                    ].map((opt) => (
                      <button
                        key={opt.color}
                        type="button"
                        onClick={() => setFormData({ ...formData, life4cutsBgColor: opt.color })}
                        className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                          formData.life4cutsBgColor === opt.color
                            ? 'ring-2 ring-amber-400 border-white text-white'
                            : 'border-neutral-700 text-neutral-400'
                        }`}
                        style={{ backgroundColor: opt.color === '#ffffff' ? '#ffffff' : opt.color, color: opt.color === '#ffffff' ? '#000' : '#fff' }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                {formData.allowedCaptureModes.strip && (
                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-xs text-neutral-400">Cantidad de fotos en la Tira:</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, stripShotCount: 3 })}
                      className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        formData.stripShotCount === 3
                          ? 'bg-amber-500 text-neutral-950'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      3 Fotos
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, stripShotCount: 4 })}
                      className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        formData.stripShotCount === 4
                          ? 'bg-amber-500 text-neutral-950'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      4 Fotos
                    </button>
                  </div>
                )}
              </div>

              {/* Strip Background Setup */}
              <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-3">
                <span className="text-xs font-bold text-neutral-200 block uppercase tracking-wider">
                  Fondo de la Tira / Collage
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                        <input
                          type="radio"
                          name="stripBgType"
                          checked={formData.stripBgType === 'color'}
                          onChange={() => setFormData({ ...formData, stripBgType: 'color' })}
                          className="accent-amber-500"
                        />
                        <span>Color Sólido</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                        <input
                          type="radio"
                          name="stripBgType"
                          checked={formData.stripBgType === 'image'}
                          onChange={() => setFormData({ ...formData, stripBgType: 'image' })}
                          className="accent-amber-500"
                        />
                        <span>Imagen de Fondo</span>
                      </label>
                    </div>

                    {formData.stripBgType === 'color' ? (
                      <div className="flex items-center gap-2 bg-neutral-900 p-2 rounded-xl border border-neutral-800 max-w-[200px]">
                        <input
                          type="color"
                          value={formData.stripBgColor}
                          onChange={(e) => setFormData({ ...formData, stripBgColor: e.target.value })}
                          className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                        />
                        <span className="font-mono text-xs text-white">{formData.stripBgColor}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <label className="min-h-[44px] px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 hover:border-amber-400 text-neutral-300 hover:text-white flex items-center gap-2 text-xs cursor-pointer">
                          <Upload className="w-4 h-4" />
                          <span>Subir Imagen de Fondo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCustomStripBgUpload}
                            className="hidden"
                          />
                        </label>
                        {formData.stripBgImageUrl && (
                          <div className="w-12 h-12 rounded-lg border border-neutral-700 overflow-hidden bg-black">
                            <img
                              src={formData.stripBgImageUrl}
                              alt="Fondo de tira"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-neutral-400 leading-relaxed">
                    Personaliza el lienzo que envuelve las fotos. Puedes usar blanco clásico para bodas, rojo carmesí para Navidad, negro mate o subir una imagen de textura con branding.
                  </div>
                </div>
              </div>

              {/* Custom Transparent PNG Frames */}
              <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                    Marcos Personalizados (PNG con Transparencia)
                  </span>
                  <label className="min-h-[40px] px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Subir Marco PNG</span>
                    <input
                      type="file"
                      accept="image/png"
                      onChange={handleCustomFrameUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {formData.customFrames.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic">
                    No has subido marcos personalizados aún. Puedes subir archivos PNG de 1920x1080 con transparencias.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {formData.customFrames.map((frame) => {
                      const isActive = formData.activeCustomFrameId === frame.id;
                      return (
                        <div
                          key={frame.id}
                          className={`relative p-2 rounded-xl border flex flex-col items-center gap-1.5 ${
                            isActive ? 'bg-amber-500/10 border-amber-500' : 'bg-neutral-900 border-neutral-800'
                          }`}
                        >
                          <div className="w-full h-20 rounded-lg bg-neutral-950 flex items-center justify-center p-1 border border-neutral-850 overflow-hidden">
                            <img
                              src={frame.dataUrl}
                              alt={frame.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <span className="text-[10px] text-neutral-300 font-medium truncate w-full text-center">
                            {frame.name}
                          </span>
                          <div className="flex items-center gap-1 w-full justify-between mt-0.5">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  activeCustomFrameId: isActive ? null : frame.id,
                                })
                              }
                              className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                isActive ? 'bg-amber-400 text-black' : 'bg-neutral-800 text-neutral-400'
                              }`}
                            >
                              {isActive ? 'Activo' : 'Usar'}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  customFrames: formData.customFrames.filter((f) => f.id !== frame.id),
                                  activeCustomFrameId: isActive ? null : formData.activeCustomFrameId,
                                })
                              }
                              className="text-neutral-500 hover:text-red-400 p-1"
                              title="Eliminar marco"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer Options on Printed Output */}
              <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-3">
                <span className="text-xs font-bold text-neutral-200 block uppercase tracking-wider">
                  Pie de Foto en la Imagen Final (Tiras y Collages)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.footerShowDate}
                      onChange={(e) => setFormData({ ...formData, footerShowDate: e.target.checked })}
                      className="accent-amber-500"
                    />
                    <span>Mostrar Fecha</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.footerShowHashtag}
                      onChange={(e) => setFormData({ ...formData, footerShowHashtag: e.target.checked })}
                      className="accent-amber-500"
                    />
                    <span>Mostrar Hashtag</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.footerShowLogo}
                      onChange={(e) => setFormData({ ...formData, footerShowLogo: e.target.checked })}
                      className="accent-amber-500"
                    />
                    <span>Imprimir Logo</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.footerShowText}
                      onChange={(e) => setFormData({ ...formData, footerShowText: e.target.checked })}
                      className="accent-amber-500"
                    />
                    <span>Texto Conmemorativo</span>
                  </label>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">
                    Texto Conmemorativo Inferior:
                  </label>
                  <input
                    type="text"
                    value={formData.footerCustomText}
                    onChange={(e) => setFormData({ ...formData, footerCustomText: e.target.value })}
                    placeholder="ej. ★ RECUERDOS INOLVIDABLES ★"
                    className="w-full min-h-[44px] px-3.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: PROPS AR, FILTROS Y EFECTOS                            */}
          {/* ============================================================== */}
          {activeTab === 'props' && (
            <div className="space-y-6">
              {/* Live Particles Selector */}
              <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-3">
                <span className="text-xs font-bold text-neutral-200 block uppercase tracking-wider">
                  Efecto de Partículas en Vivo (60 FPS en Pantalla)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'snow', label: '❄️ Nieve en Vivo', desc: 'Copos suaves cayendo' },
                    { id: 'confetti', label: '🎉 Confeti Festivo', desc: 'Cintas multicolor' },
                    { id: 'sparkles', label: '✨ Destellos Dorados', desc: 'Brillos y glitter chic' },
                    { id: 'none', label: '🚫 Sin Partículas', desc: 'Desactivar efecto' },
                  ].map((part) => (
                    <button
                      key={part.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, particleEffect: part.id as ParticleEffect })}
                      className={`min-h-[52px] p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        formData.particleEffect === part.id
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <p className="text-xs leading-tight">{part.label}</p>
                      <p className="text-[10px] text-neutral-500 font-normal mt-0.5 leading-tight">{part.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Add New Custom AR Prop */}
              <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-3">
                <span className="text-xs font-bold text-neutral-200 block uppercase tracking-wider">
                  Subir Accesorio AR con Seguimiento Facial
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-3">
                    <label className="text-[11px] text-neutral-400 block mb-1">Nombre</label>
                    <input
                      type="text"
                      value={newPropName}
                      onChange={(e) => setNewPropName(e.target.value)}
                      placeholder="ej. Corona Dorada"
                      className="w-full min-h-[44px] px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[11px] text-neutral-400 block mb-1">Punto de Anclaje Facial</label>
                    <select
                      value={newPropAnchor}
                      onChange={(e) => setNewPropAnchor(e.target.value as AnchorType)}
                      className="w-full min-h-[44px] px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
                    >
                      <option value="forehead">Frente / Gorro (Landmark 10)</option>
                      <option value="eyes">Ojos / Lentes (Landmark 168)</option>
                      <option value="nose">Nariz (Landmark 1)</option>
                      <option value="mouth">Boca / Bigote (Landmark 164)</option>
                      <option value="chin">Mentón / Barba (Landmark 152)</option>
                      <option value="head_top">Corona Cabeza (Landmark 10)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="min-h-[44px] px-3 py-2 rounded-xl border border-dashed border-neutral-700 bg-neutral-900 hover:border-amber-400 text-neutral-300 flex items-center justify-center gap-2 text-xs cursor-pointer">
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>{newPropDataUrl ? 'Cambiar PNG' : 'Subir PNG Transp.'}</span>
                      <input
                        type="file"
                        accept="image/png"
                        onChange={handleCustomPropUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="sm:col-span-3">
                    <button
                      type="button"
                      onClick={handleAddCustomProp}
                      disabled={!newPropDataUrl || !newPropName.trim()}
                      className={`w-full min-h-[44px] rounded-xl text-xs font-bold transition-all ${
                        newPropDataUrl && newPropName.trim()
                          ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 cursor-pointer shadow-md'
                          : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      }`}
                    >
                      Añadir a la Cabina
                    </button>
                  </div>
                </div>

                {newPropDataUrl && (
                  <div className="flex items-center gap-4 bg-neutral-900 p-2.5 rounded-xl border border-neutral-800 mt-2">
                    <div className="w-12 h-12 rounded-lg bg-neutral-950 border border-neutral-800 p-1 flex items-center justify-center">
                      <img src={newPropDataUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-[11px] text-neutral-400">
                        <span>Escala Inicial: {newPropScale.toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.5"
                        step="0.05"
                        value={newPropScale}
                        onChange={(e) => setNewPropScale(parseFloat(e.target.value))}
                        className="w-full accent-amber-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Props List */}
              {formData.customProps.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-neutral-300 block mb-2 uppercase tracking-wider">
                    Accesorios Personalizados Añadidos:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {formData.customProps.map((prop) => (
                      <div
                        key={prop.id}
                        className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-2"
                      >
                        <div className="w-10 h-10 rounded-lg bg-neutral-950 p-1 flex items-center justify-center shrink-0 border border-neutral-800">
                          <img src={prop.dataUrl} alt={prop.name} className="max-w-full max-h-full object-contain" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-white truncate">{prop.name}</p>
                          <p className="text-[10px] text-amber-400 capitalize">{prop.anchorType}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              customProps: formData.customProps.filter((p) => p.id !== prop.id),
                            })
                          }
                          className="text-neutral-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: FONDOS CHROMA KEY                                      */}
          {/* ============================================================== */}
          {activeTab === 'chroma' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Fondos para Pantalla Verde / Azul</h3>
                  <p className="text-xs text-neutral-400">
                    Sube y gestiona imágenes para sustituir el croma de la cabina.
                  </p>
                </div>
                <label className="min-h-[44px] px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Subir Fondo (JPG/PNG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const url = ev.target?.result as string;
                          setFormData({
                            ...formData,
                            customBackdrops: [
                              ...formData.customBackdrops,
                              {
                                id: `backdrop_${Date.now()}`,
                                name: file.name.replace(/\.[^/.]+$/, ''),
                                dataUrl: url,
                              },
                            ],
                          });
                          showToast('Fondo de pantalla verde añadido');
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {formData.customBackdrops.length === 0 ? (
                <div className="p-8 rounded-2xl bg-neutral-900/30 border border-dashed border-neutral-800 text-center text-xs text-neutral-500">
                  No hay fondos personalizados subidos. Los invitados usarán los fondos predeterminados de alta resolución (Chimenea, Gala, Playa, Cyberpunk).
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {formData.customBackdrops.map((b) => (
                    <div
                      key={b.id}
                      className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 group"
                    >
                      <div className="h-28 w-full bg-neutral-950">
                        <img src={b.dataUrl} alt={b.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-2 flex items-center justify-between text-xs">
                        <span className="truncate text-neutral-300 font-medium">{b.name}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              customBackdrops: formData.customBackdrops.filter((x) => x.id !== b.id),
                            })
                          }
                          className="text-neutral-500 hover:text-red-400 p-1"
                          title="Eliminar fondo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 5: FIESTA, ENTRETENIMIENTO Y MURO EN VIVO                  */}
          {/* ============================================================== */}
          {activeTab === 'entertainment' && (
            <div className="space-y-6">
              {/* Entertainment Switches */}
              <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-4">
                <span className="text-xs font-bold text-neutral-200 block uppercase tracking-wider">
                  Suite de Dinamización y Entretenimiento
                </span>

                <div className="space-y-3">
                  {/* Switch 1: Ruleta de Poses */}
                  <label className="flex items-start gap-3.5 p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer hover:border-neutral-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.enablePoseRoulette}
                      onChange={(e) =>
                        setFormData({ ...formData, enablePoseRoulette: e.target.checked })
                      }
                      className="mt-0.5 w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Dices className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-white">Activar Ruleta de Poses Rompehielos</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Muestra el botón '🎲 Ruleta de Poses' junto al obturador. Antes de la cuenta regresiva, gira una ruleta visual en pantalla con retos cómicos ("¡Pose de telenovela!", "¡Pelea en cámara lenta!").
                      </p>
                    </div>
                  </label>

                  {/* Switch 2: Sonidos y Efectos de Audio */}
                  <label className="flex items-start gap-3.5 p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer hover:border-neutral-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.enableAudioEffects}
                      onChange={(e) =>
                        setFormData({ ...formData, enableAudioEffects: e.target.checked })
                      }
                      className="mt-0.5 w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-white">Activar Sonidos y Efectos de Audio (Web Audio API)</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Reproduce efectos sincronizados: tictac o redoble durante el 3, 2, 1; sonido mecánico de obturador paparazzi al capturar; y fanfarria/aplausos al mostrar la foto final.
                      </p>
                    </div>
                  </label>

                  {/* Switch 3: Stickers y Dibujo Táctil */}
                  <label className="flex items-start gap-3.5 p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer hover:border-neutral-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.enableStickersAndDrawing}
                      onChange={(e) =>
                        setFormData({ ...formData, enableStickersAndDrawing: e.target.checked })
                      }
                      className="mt-0.5 w-4 h-4 accent-pink-500 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Paintbrush className="w-4 h-4 text-pink-400" />
                        <span className="text-xs font-bold text-white">Activar Stickers y Dibujo Táctil (Instagram Stories)</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Permite a los invitados firmar con el dedo sobre la pantalla y estampar sellos cómicos ("El alma de la fiesta", "Vengo por el pastel", emojis) antes de finalizar su foto.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Live Photo Wall Projector Launcher */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-red-950/40 border border-red-500/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                    <Tv className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-display">
                      Muro en Vivo para Proyector / Pantalla Gigante (Live Photo Wall)
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Ideal para transmitir en el proyector del salón de eventos o segunda pantalla
                    </p>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">
                  Modo cinema oscuro sin botones de cámara que consulta periódicamente las fotos recién subidas a Supabase y las muestra en un mosaico flotante animado, con aviso de <span className="text-amber-400 font-bold">¡Nueva Foto!</span> y código QR en pantalla para que más invitados se animen a posar.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (onLaunchLiveWall) {
                        onLaunchLiveWall();
                      } else {
                        window.open(window.location.origin + window.location.pathname + '?mode=live_wall', '_blank');
                      }
                    }}
                    className="flex-1 min-h-[46px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Abrir Muro en Vivo en Nueva Ventana (?mode=live_wall)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 6: ALMACENAMIENTO EN LA NUBE (SUPABASE)                   */}
          {/* ============================================================== */}
          {activeTab === 'storage' && (
            <div className="space-y-6">
              {/* Header Connection Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-red-950/30 border border-neutral-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff2d55]/30 to-amber-500/20 border border-[#ff2d55]/40 flex items-center justify-center text-[#ff2d55]">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                        <span>Almacenamiento en la Nube (Supabase Storage)</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      </h3>
                      <p className="text-xs text-neutral-400 font-mono">
                        Bucket: <strong className="text-neutral-200">{BUCKET_NAME}</strong> · {supabaseUrl}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={loadStorageData}
                    disabled={isLoadingFiles}
                    className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin text-amber-400' : ''}`} />
                    <span>Actualizar Lista</span>
                  </button>
                </div>

                {/* Storage Quota & Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Total de Fotos
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-white font-mono">
                        {storageStats.totalFiles}
                      </span>
                      <span className="text-xs text-neutral-400">capturas</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Espacio Ocupado
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-amber-400 font-mono">
                        {storageStats.totalSizeFormatted}
                      </span>
                      <span className="text-xs text-neutral-400">/ 1,000 MB</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Sesiones Únicas
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-emerald-400 font-mono">
                        {storageStats.sessionsCount}
                      </span>
                      <span className="text-xs text-neutral-400">grupos</span>
                    </div>
                  </div>
                </div>

                {/* Storage Bar (1 GB free tier meter) */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                    <span>Cuota de almacenamiento gratuito (1 GB)</span>
                    <span>
                      {((storageStats.totalSizeBytes / (1024 * 1024 * 1000)) * 100).toFixed(1)}% usado
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-neutral-950 overflow-hidden border border-neutral-800">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-[#ff2d55] transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          Math.max((storageStats.totalSizeBytes / (1024 * 1024 * 1000)) * 100, storageStats.totalFiles > 0 ? 3 : 0),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-neutral-500">
                    Las fotos se comprimen en JPEG a calidad 0.88 (~350 KB cada una) para almacenar más de 2,800 fotos de alta calidad sin costo adicional.
                  </p>
                </div>

                {/* Main Management Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {/* Download All Event Photos as ZIP */}
                  <button
                    type="button"
                    onClick={handleDownloadAllEventZip}
                    disabled={isZippingAll || bucketFiles.length === 0}
                    className="min-h-[48px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff2d55] via-rose-600 to-amber-600 hover:from-[#ff5e7e] hover:to-amber-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#ff2d55]/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isZippingAll ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Empaquetando ZIP ({zipAllProgress}%)...</span>
                      </>
                    ) : (
                      <>
                        <Archive className="w-4 h-4" />
                        <span>Descargar todas las fotos del evento (.ZIP)</span>
                      </>
                    )}
                  </button>

                  {/* Empty Bucket for New Event */}
                  <button
                    type="button"
                    onClick={handleEmptyBucket}
                    disabled={isLoadingFiles || bucketFiles.length === 0}
                    className="min-h-[48px] px-4 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 active:scale-95 text-red-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                    <span>Vaciar bucket para nuevo evento</span>
                  </button>
                </div>
              </div>

              {/* Photos & Sessions Explorer */}
              <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-neutral-200 block uppercase tracking-wider flex items-center gap-1.5">
                    <FolderArchive className="w-4 h-4 text-amber-400" />
                    <span>Explorador de Archivos y Sesiones ({bucketFiles.length})</span>
                  </span>

                  <div className="relative max-w-xs w-full">
                    <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchSession}
                      onChange={(e) => setSearchSession(e.target.value)}
                      placeholder="Filtrar por sesión o nombre..."
                      className="w-full min-h-[36px] pl-8 pr-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {isLoadingFiles ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-400 space-y-2">
                    <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs">Consultando archivos en el bucket de Supabase...</p>
                  </div>
                ) : bucketFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-400 space-y-2 bg-neutral-950/40 rounded-xl border border-dashed border-neutral-800">
                    <Cloud className="w-10 h-10 text-neutral-600 stroke-[1.2]" />
                    <p className="text-sm font-semibold text-neutral-300">
                      El bucket está vacío y listo para un nuevo evento
                    </p>
                    <p className="text-xs text-neutral-500 max-w-sm">
                      1 GB libre disponible. Cada foto tomada en la cabina se almacenará automáticamente en formato JPEG optimizado.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[360px] overflow-y-auto space-y-1.5 pr-1">
                    {bucketFiles
                      .filter((f) =>
                        searchSession
                          ? f.path.toLowerCase().includes(searchSession.toLowerCase()) ||
                            f.name.toLowerCase().includes(searchSession.toLowerCase()) ||
                            f.folder.toLowerCase().includes(searchSession.toLowerCase())
                          : true
                      )
                      .map((file, idx) => (
                        <div
                          key={file.id || file.path}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/60 hover:bg-neutral-950 border border-neutral-850 transition-colors gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Thumbnail */}
                            <div className="w-11 h-11 rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0 flex items-center justify-center">
                              <img
                                src={file.publicUrl}
                                alt={file.name}
                                loading="lazy"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-xs font-mono">
                                  {file.name}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
                                  {(file.size / 1024).toFixed(0)} KB
                                </span>
                              </div>
                              <p className="text-[10px] text-neutral-500 font-mono truncate">
                                Carpeta: <span className="text-neutral-400">{file.folder}</span> · {new Date(file.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={file.publicUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-[#ff2d55] text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                              title="Abrir imagen completa"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Ver</span>
                            </a>
                            <a
                              href={file.publicUrl}
                              download={file.name.endsWith('.jpg') ? file.name : `${file.name}.jpg`}
                              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                              title="Descargar imagen"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 7: PERFILES, EXPORTACIÓN Y SEGURIDAD                      */}
          {/* ============================================================== */}
          {activeTab === 'profiles' && (
            <div className="space-y-6">
              {/* Security PIN settings */}
              <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-3">
                <span className="text-xs font-bold text-neutral-200 block uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Seguridad y PIN de Acceso</span>
                </span>
                <div className="flex items-center gap-3 max-w-sm">
                  <input
                    type="password"
                    maxLength={8}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="PIN numérico"
                    className="w-full min-h-[46px] px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-sm font-mono text-white tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newPin.length >= 4) {
                        setFormData({ ...formData, adminPin: newPin });
                        showToast(`PIN actualizado a: ${newPin}`);
                      } else {
                        alert('El PIN debe tener al menos 4 dígitos');
                      }
                    }}
                    className="min-h-[46px] px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shrink-0 cursor-pointer"
                  >
                    Actualizar PIN
                  </button>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Protege el acceso discreto al panel (triple toque en el logo de la cabina o botón de ajustes).
                </p>
              </div>

              {/* Cloud Storage Shortcut Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-red-950/20 border border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-200 block uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-[#ff2d55]" />
                    <span>Almacenamiento en la Nube (Supabase Storage)</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    {storageStats.totalFiles} fotos ({storageStats.totalSizeFormatted})
                  </span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Consulta todas las fotos del evento en la nube, descarga el paquete ZIP completo para el cliente o vacía el almacenamiento (1 GB gratuito) para el próximo evento.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('storage')}
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-neutral-800 hover:bg-[#ff2d55] text-neutral-200 hover:text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <FolderArchive className="w-4 h-4 text-amber-400" />
                  <span>Abrir Gestor de Almacenamiento Supabase</span>
                </button>
              </div>

              {/* Export / Import Event Profile JSON */}
              <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-3">
                <span className="text-xs font-bold text-neutral-200 block uppercase tracking-wider">
                  Exportar / Importar Plantilla de Evento
                </span>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Guarda toda la personalización (colores, marcos, logos, props y tipografías) en un archivo JSON para reutilizarlo en futuras bodas o fiestas con un solo clic.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Guardar Plantilla (.json)</span>
                  </button>

                  <label className="min-h-[44px] px-4 py-2 rounded-xl border border-neutral-700 bg-neutral-900 hover:border-amber-400 text-neutral-200 flex items-center gap-2 text-xs font-bold cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Cargar Plantilla (.json)</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJson}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Factory Reset */}
              <div className="p-4 rounded-2xl bg-red-950/20 border border-red-900/40 space-y-2">
                <span className="text-xs font-bold text-red-300 block uppercase tracking-wider">
                  Restablecer Valores de Fábrica
                </span>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Restaura los textos, colores, tipografía y marcos por defecto de la cabina fotográfica.
                </p>
                <button
                  type="button"
                  onClick={handleResetFactory}
                  className="min-h-[42px] px-4 py-1.5 rounded-xl bg-red-900/40 hover:bg-red-800 text-red-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors mt-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restablecer Todo</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-900 bg-neutral-900/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSaveAndApply}
            className="min-h-[44px] px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-neutral-950 font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Guardar y Aplicar Cambios</span>
          </button>
        </div>
      </div>
    </div>
  );
};
