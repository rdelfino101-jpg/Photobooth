export type ColorFilter = 'normal' | 'bw' | 'sepia' | 'cyberpunk' | 'vibrant' | 'polaroid' | 'glam';

export type FrameStyle =
  | 'none'
  | 'wedding'
  | 'wedding_gold_geom'
  | 'wedding_ivory'
  | 'party'
  | 'party_balloons'
  | 'party_polaroid'
  | 'corp_executive'
  | 'corp_modern'
  | 'retro'
  | 'neon'
  | 'minimal'
  | 'xmas_wreath'
  | 'xmas_postcard'
  | 'custom';

export type CaptureMode = 'single' | 'strip' | 'collage' | 'boomerang' | 'life4cuts';

export type AnchorType = 'eyes' | 'forehead' | 'mouth' | 'chin' | 'head_top' | 'nose' | 'neck' | 'lips';

export interface TrackedFace {
  p1: { x: number; y: number }; // punta de la nariz (Nariz de Rodolfo)
  p33: { x: number; y: number }; // ojo izquierdo
  p263: { x: number; y: number }; // ojo derecho
  p168: { x: number; y: number }; // puente de la nariz / entrecejo
  p10: { x: number; y: number }; // tope de la frente / cabello
  p9: { x: number; y: number }; // frente glabella superior
  p164: { x: number; y: number }; // base de la nariz / filtrum
  p152: { x: number; y: number }; // barbilla / mentón
  p234: { x: number; y: number }; // sien / oreja izquierda
  p454: { x: number; y: number }; // sien / oreja derecha
  p13: { x: number; y: number }; // labio superior / centro de labios
  p14: { x: number; y: number }; // labio inferior
}

export interface ActiveProp {
  instanceId: string;
  propId: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  scale: number; // 0.4 to 2.5
  rotation: number; // degrees -180 to 180
  anchorType?: AnchorType;
  autoTracking?: boolean;
}

export interface FrameSettings {
  style: FrameStyle;
  eventTitle: string;
  eventDate: string;
  eventSubtitle: string;
  accentColor: string;
  customFrameUrl?: string | null;
  fontFamily?: string;
}

export interface CameraDevice {
  deviceId: string;
  label: string;
  isFront?: boolean;
  isExternal?: boolean;
}

export interface CapturedPhotoRecord {
  id: string;
  sessionId: string;
  localBlobUrl: string;
  publicUrl?: string;
  filePath?: string;
  timestamp: number;
  mode: CaptureMode;
  error?: string;
  isBoomerang?: boolean;
  boomerangFrames?: string[]; // array of frame data URLs for loop playback
}

export interface PoseChallenge {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

export interface DrawnLine {
  points: { x: number; y: number }[];
  color: string;
  size: number;
}

export interface PlacedSticker {
  id: string;
  type: 'emoji' | 'badge';
  content: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  scale: number;
  rotation: number;
  bgColor?: string;
  textColor?: string;
}

// ==========================================
// ADMIN & EVENT CUSTOMIZER CONFIGURATION TYPES
// ==========================================

export type EventTheme = 'xmas' | 'wedding' | 'party' | 'corporate' | 'custom';
export type ParticleEffect = 'snow' | 'confetti' | 'sparkles' | 'glitter' | 'bokeh' | 'none';
export type LogoPosition = 'top_center' | 'top_left' | 'top_right' | 'bottom_center' | 'bottom_right';
export type LogoSize = 'small' | 'medium' | 'large';
export type FontFamilyOption =
  | 'Plus Jakarta Sans'
  | 'Outfit'
  | 'Poppins'
  | 'Playfair Display'
  | 'Montserrat'
  | 'Dancing Script'
  | 'Lobster';

export interface CustomPropItem {
  id: string;
  name: string;
  dataUrl: string; // PNG o SVG data URL
  anchorType: AnchorType;
  scale: number;
  offsetY: number; // relative Y offset (-1.0 to 1.0)
}

export interface CustomFrameItem {
  id: string;
  name: string;
  dataUrl: string; // PNG con transparencia data URL
}

export interface CustomBackdropItem {
  id: string;
  name: string;
  dataUrl: string;
}

export interface EventConfig {
  // 1. Acceso & Seguridad
  adminPin: string; // PIN numérico (por defecto '1234')

  // 2. A. Identidad & Look & Feel
  eventTitle: string;
  eventSubtitle: string;
  eventHashtag: string;
  logoUrl: string | null;
  logoPosition: LogoPosition;
  logoSize: LogoSize;
  fontFamily: FontFamilyOption;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  buttonColor: string;
  textColor: string;

  // 2. B. Tira Fotográfica, Collage y Marcos
  allowedCaptureModes: {
    single: boolean;
    strip: boolean; // Vertical 3 o 4 fotos
    collage: boolean; // Collage 2x2 (4 fotos)
    boomerang: boolean; // Boomerang ráfaga rápida
    life4cuts: boolean; // Tira coreana Life4Cuts (4 disparos elegantes)
  };
  stripShotCount: 3 | 4;
  stripBgType: 'color' | 'image';
  stripBgColor: string;
  stripBgImageUrl: string | null;
  life4cutsBgColor: string;
  customFrames: CustomFrameItem[];
  activeCustomFrameId: string | null;

  // Pie de foto en la imagen final
  footerShowDate: boolean;
  footerShowLogo: boolean;
  footerShowText: boolean;
  footerShowHashtag: boolean;
  footerCustomText: string;

  // 2. C. Props, Filtros AR y Efectos
  activeTheme: EventTheme;
  theme?: EventTheme;
  customProps: CustomPropItem[];
  particleEffect: ParticleEffect;

  // 2. D. Fondos Chroma Key
  customBackdrops: CustomBackdropItem[];

  // 2. E. Entretenimiento, Dinamización & Social Party
  enablePoseRoulette: boolean;
  enableAudioEffects: boolean;
  enableStickersAndDrawing: boolean;
}

export const DEFAULT_EVENT_CONFIG: EventConfig = {
  adminPin: '1234',
  eventTitle: '¡FELIZ NAVIDAD!',
  eventSubtitle: 'Noche de Paz y Alegría',
  eventHashtag: '#NavidadSnapKiosk',
  logoUrl: null,
  logoPosition: 'top_center',
  logoSize: 'medium',
  fontFamily: 'Outfit',
  primaryColor: '#dc2626',
  accentColor: '#fde047',
  bgColor: '#0a0a0a',
  buttonColor: '#dc2626',
  textColor: '#ffffff',
  allowedCaptureModes: {
    single: true,
    strip: true,
    collage: true,
    boomerang: true,
    life4cuts: true,
  },
  stripShotCount: 3,
  stripBgType: 'color',
  stripBgColor: '#7f1d1d',
  stripBgImageUrl: null,
  life4cutsBgColor: '#ffffff',
  customFrames: [],
  activeCustomFrameId: null,
  footerShowDate: true,
  footerShowLogo: true,
  footerShowText: true,
  footerShowHashtag: true,
  footerCustomText: '★ MEMORIES TO KEEP ★',
  activeTheme: 'xmas',
  customProps: [],
  particleEffect: 'snow',
  customBackdrops: [],
  enablePoseRoulette: true,
  enableAudioEffects: true,
  enableStickersAndDrawing: true,
};
