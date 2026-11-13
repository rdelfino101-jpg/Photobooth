import { PoseChallenge } from '../types/photobooth';

export type Language = 'es' | 'en';

export const LANGUAGE_STORAGE_KEY = 'snapkiosk_language';

export const getStoredLanguage = (): Language => {
  if (typeof window === 'undefined') return 'es';
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === 'en' || saved === 'es') return saved;
  } catch {
    // Ignore storage errors
  }
  return 'es';
};

export const setStoredLanguage = (lang: Language): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // Ignore storage errors
  }
};

export interface Translations {
  // Brand & Header
  adminPinShortcut: string;
  camera: string;
  mirrorCamera: string;
  fullscreen: string;
  soundOn: string;
  soundOff: string;
  liveWall: string;
  adminPanel: string;
  langToggleTitle: string;

  // Event Template Row
  eventTemplate: string;
  loadsFramesProps: string;
  tplWedding: string;
  tplParty: string;
  tplGrad: string;
  tplXmas: string;

  // Tabs
  tabProps: string;
  tabFrames: string;
  tabBackdrops: string;
  tabFilters: string;

  // Category filters
  catAll: string;
  catGlasses: string;
  catHats: string;
  catMasks: string;
  catMustaches: string;
  catXmas: string;
  catWedding: string;
  catParty: string;

  // Props
  noAccessory: string;

  // Frames
  noFrame: string;
  weddingFrames: string;
  partyFrames: string;
  corpFrames: string;
  xmasFrames: string;

  // Virtual Backdrops
  virtualBackdropsTitle: string;
  noBackdrop: string;

  // Filters & Particle Effects
  colorFiltersTitle: string;
  filterNormal: string;
  filterBw: string;
  filterSepia: string;
  filterCyberpunk: string;
  filterVibrant: string;
  filterGlam: string;
  particlesTitle: string;
  particleNone: string;
  particleConfetti: string;
  particleSnow: string;
  particleSparkles: string;
  particleHearts: string;
  particleFireworks: string;

  // Capture Modes
  modePhoto: string;
  modeBurst: string;
  modeBoomerang: string;
  burstStrip3x: string;
  burstLife4: string;
  burstCollage: string;

  // Capture Button States
  btnTakePhoto: string;
  btnStartBurst: string;
  btnRecordBoomerang: string;
  btnCapturing: string;
  btnRecording: string;
  btnPhotoOf: (curr: number, total: number) => string;
  timerSeconds: (s: number) => string;

  // Footer Actions
  btnPoseRoulette: string;
  btnGallery: string;
  btnEndSession: string;

  // Camera Live Status
  liveStatusLive: string;
  faceDetected: string;
  detectingFace: string;
  readyToCapture: string;
  smileText: string;

  // Pose Roulette Modal
  rouletteBadge: string;
  rouletteTitle: string;
  rouletteSubtitle: string;
  rouletteSpinning: string;
  rouletteSpinAgain: string;
  rouletteAccept: string;

  // Photo Editor Modal
  editorTitle: string;
  editorDrawTab: string;
  editorStickersTab: string;
  editorBrushSize: string;
  editorUndo: string;
  editorClear: string;
  editorSave: string;
  editorSaving: string;
  editorCancel: string;

  // Capture Modal (Post-shot preview)
  captureModalTitle: string;
  scanQrTitle: string;
  scanQrSubtitle: string;
  scanQrTooltip: string;
  qrNotAvailable: string;
  supabaseUploaded: string;
  localReady: string;
  localSaved: string;
  btnTouchDraw: string;
  btnTakeAnother: string;
  btnDownloadJpg: string;
  btnFinishSessionQr: (count: number) => string;
  btnRetake: string;
  openPublicUrl: string;

  // Session End Modal
  sessionEndTitle: string;
  sessionEndSubtitle: string;
  sessionPhotosCount: (count: number) => string;
  tapToEnlarge: string;
  noPhotosTaken: string;
  downloadAllZip: string;
  compressingZip: (percent: number) => string;
  startNewSession: string;
  copyShareLink: string;
  linkCopied: string;
  photoResolutionNotice: string;

  // Live Wall (Slideshow)
  liveWallNewPhoto: string;
  liveWallPhotoOf: (curr: number, total: number) => string;
  liveWallSpeed: string;
  liveWallPause: string;
  liveWallPlay: string;
  liveWallPrev: string;
  liveWallNext: string;
  liveWallFullscreen: string;
  liveWallExit: string;
  liveWallWaiting: string;
  liveWallScanQrNotice: string;

  // Admin PIN Modal
  pinTitle: string;
  pinSubtitle: string;
  pinPlaceholder: string;
  pinEnter: string;
  pinCancel: string;
  pinIncorrect: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  es: {
    // Brand & Header
    adminPinShortcut: 'Toca 3 veces para abrir el Panel de Administrador',
    camera: 'Cámara',
    mirrorCamera: 'Efecto Espejo',
    fullscreen: 'Pantalla Completa Horizontal',
    soundOn: 'Activar Sonido',
    soundOff: 'Silenciar',
    liveWall: 'Muro en Vivo para Proyector',
    adminPanel: 'Panel de Administrador (PIN 1234)',
    langToggleTitle: 'Cambiar idioma / Switch language',

    // Event Template Row
    eventTemplate: 'Plantilla de Evento',
    loadsFramesProps: 'Carga marcos y props',
    tplWedding: 'Boda',
    tplParty: 'Fiesta',
    tplGrad: 'Grad',
    tplXmas: 'Navidad',

    // Tabs
    tabProps: 'Props AR',
    tabFrames: 'Marcos',
    tabBackdrops: 'Fondos',
    tabFilters: 'Filtros',

    // Category filters
    catAll: 'Todos',
    catGlasses: 'Gafas',
    catHats: 'Gorros',
    catMasks: 'Máscaras',
    catMustaches: 'Bigotes',
    catXmas: 'Navidad',
    catWedding: 'Boda',
    catParty: 'Fiesta',

    // Props
    noAccessory: 'Sin accesorio',

    // Frames
    noFrame: 'Sin marco',
    weddingFrames: 'Marcos de Boda',
    partyFrames: 'Marcos de Fiesta',
    corpFrames: 'Marcos de Graduación y Empresa',
    xmasFrames: 'Marcos Navideños',

    // Virtual Backdrops
    virtualBackdropsTitle: 'Fondos Virtuales (Chroma Verde)',
    noBackdrop: 'Sin Fondo Virtual',

    // Filters & Particle Effects
    colorFiltersTitle: 'Filtros de Color',
    filterNormal: 'Original',
    filterBw: 'B&W Cinema',
    filterSepia: 'Vintage Cálido',
    filterCyberpunk: 'Neón Cyber',
    filterVibrant: 'Golden Hour',
    filterGlam: 'Pastel Pop',
    particlesTitle: 'Efectos de Partículas y Clima',
    particleNone: 'Sin efecto',
    particleConfetti: 'Confeti Dorado',
    particleSnow: 'Nieve Suave',
    particleSparkles: 'Brillitos Sparkles',
    particleHearts: 'Corazones',
    particleFireworks: 'Fuegos Artificiales',

    // Capture Modes
    modePhoto: 'Foto',
    modeBurst: 'Ráfaga',
    modeBoomerang: 'Boomerang',
    burstStrip3x: 'Tira 3x',
    burstLife4: 'Life4 4x',
    burstCollage: 'Collage 2x2',

    // Capture Button States
    btnTakePhoto: 'Capturar Foto',
    btnStartBurst: 'Iniciar Ráfaga',
    btnRecordBoomerang: 'Grabar Boomerang',
    btnCapturing: 'Capturando...',
    btnRecording: 'Grabando...',
    btnPhotoOf: (curr, total) => `Foto ${curr} de ${total}`,
    timerSeconds: (s) => `Temporizador: ${s}s`,

    // Footer Actions
    btnPoseRoulette: 'Ruleta de Poses',
    btnGallery: 'Galería',
    btnEndSession: 'Finalizar Sesión',

    // Camera Live Status
    liveStatusLive: 'EN VIVO',
    faceDetected: 'Rostro Detectado',
    detectingFace: 'Buscando Rostro...',
    readyToCapture: 'Preparado para capturar',
    smileText: '¡Sonríe!',

    // Pose Roulette Modal
    rouletteBadge: 'Ruleta de Poses Rompehielos',
    rouletteTitle: '¿Qué pose les tocará?',
    rouletteSubtitle: 'Rétate con tus amigos y hagan su pose más divertida para la cámara',
    rouletteSpinning: 'Girando ruleta...',
    rouletteSpinAgain: 'Girar de nuevo',
    rouletteAccept: '¡Aceptar reto e Iniciar!',

    // Photo Editor Modal
    editorTitle: 'Edición Creativa de Foto',
    editorDrawTab: 'Dibujo a mano alzada',
    editorStickersTab: 'Stickers Festivos',
    editorBrushSize: 'Grosor',
    editorUndo: 'Deshacer',
    editorClear: 'Limpiar',
    editorSave: 'Guardar Foto Editada',
    editorSaving: 'Guardando...',
    editorCancel: 'Cancelar',

    // Capture Modal (Post-shot preview)
    captureModalTitle: '¡Foto Capturada!',
    scanQrTitle: 'Escanear Foto en tu Móvil',
    scanQrSubtitle: 'Apunta con la cámara de tu teléfono para descargar el archivo en alta resolución',
    scanQrTooltip: 'Escanea el código QR con tu móvil para descargar tu foto al instante',
    qrNotAvailable: 'QR no disponible',
    supabaseUploaded: 'Subida a Supabase en la sesión',
    localReady: 'Copia local lista',
    localSaved: 'Guardada localmente',
    btnTouchDraw: 'Dibujo táctil a mano alzada y stickers festivos',
    btnTakeAnother: 'Tomar otra foto (seguir en sesión)',
    btnDownloadJpg: 'Descargar .jpg',
    btnFinishSessionQr: (count) => `Finalizar sesión y ver QR (${count})`,
    btnRetake: 'Repetir disparo si no te gustó',
    openPublicUrl: 'Abrir URL pública en Supabase',

    // Session End Modal
    sessionEndTitle: '¡Sesión Finalizada!',
    sessionEndSubtitle: 'Escanea el código QR para descargar todas las fotos en tu teléfono móvil',
    sessionPhotosCount: (count) => `Fotos de esta sesión (${count})`,
    tapToEnlarge: 'Toca una foto para ampliar',
    noPhotosTaken: 'No se tomaron fotos en esta sesión.',
    downloadAllZip: 'Descargar todas en ZIP (.zip)',
    compressingZip: (percent) => `Comprimiendo ZIP... ${percent}%`,
    startNewSession: 'Iniciar Nueva Sesión',
    copyShareLink: 'Copiar enlace de descarga',
    linkCopied: '¡Enlace copiado!',
    photoResolutionNotice: 'Todas las fotos se conservan con resolución completa.',

    // Live Wall (Slideshow)
    liveWallNewPhoto: '✨ ¡Recién tomada en la cabina!',
    liveWallPhotoOf: (curr, total) => `Foto ${curr} de ${total}`,
    liveWallSpeed: 'Velocidad',
    liveWallPause: 'Pausar',
    liveWallPlay: 'Reproducir',
    liveWallPrev: 'Anterior',
    liveWallNext: 'Siguiente',
    liveWallFullscreen: 'Pantalla Completa',
    liveWallExit: 'Volver a Cabina',
    liveWallWaiting: 'Esperando fotos de la cabina...',
    liveWallScanQrNotice: 'Escanea para entrar a la cabina',

    // Admin PIN Modal
    pinTitle: 'Acceso de Administrador',
    pinSubtitle: 'Ingresa el PIN numérico para configurar la cabina (Por defecto: 1234)',
    pinPlaceholder: 'Introduce PIN',
    pinEnter: 'Acceder',
    pinCancel: 'Cancelar',
    pinIncorrect: 'PIN incorrecto. Intenta de nuevo.',
  },
  en: {
    // Brand & Header
    adminPinShortcut: 'Tap 3 times to open Administrator Panel',
    camera: 'Camera',
    mirrorCamera: 'Mirror Effect',
    fullscreen: 'Horizontal Fullscreen',
    soundOn: 'Enable Sound',
    soundOff: 'Mute Sound',
    liveWall: 'Projector Live Wall',
    adminPanel: 'Admin Panel (PIN 1234)',
    langToggleTitle: 'Cambiar idioma / Switch language',

    // Event Template Row
    eventTemplate: 'Event Template',
    loadsFramesProps: 'Loads frames & props',
    tplWedding: 'Wedding',
    tplParty: 'Party',
    tplGrad: 'Grad',
    tplXmas: 'Holiday',

    // Tabs
    tabProps: 'AR Props',
    tabFrames: 'Frames',
    tabBackdrops: 'Backdrops',
    tabFilters: 'Filters',

    // Category filters
    catAll: 'All',
    catGlasses: 'Glasses',
    catHats: 'Hats',
    catMasks: 'Masks',
    catMustaches: 'Mustaches',
    catXmas: 'Holiday',
    catWedding: 'Wedding',
    catParty: 'Party',

    // Props
    noAccessory: 'No accessory',

    // Frames
    noFrame: 'No frame',
    weddingFrames: 'Wedding Frames',
    partyFrames: 'Party Frames',
    corpFrames: 'Graduation & Corporate Frames',
    xmasFrames: 'Holiday Frames',

    // Virtual Backdrops
    virtualBackdropsTitle: 'Virtual Backdrops (Green Screen)',
    noBackdrop: 'No Virtual Backdrop',

    // Filters & Particle Effects
    colorFiltersTitle: 'Color Filters',
    filterNormal: 'Original',
    filterBw: 'B&W Cinema',
    filterSepia: 'Warm Vintage',
    filterCyberpunk: 'Cyber Neon',
    filterVibrant: 'Golden Hour',
    filterGlam: 'Pastel Pop',
    particlesTitle: 'Particle & Weather Effects',
    particleNone: 'None',
    particleConfetti: 'Golden Confetti',
    particleSnow: 'Gentle Snow',
    particleSparkles: 'Sparkles',
    particleHearts: 'Hearts',
    particleFireworks: 'Fireworks',

    // Capture Modes
    modePhoto: 'Photo',
    modeBurst: 'Burst',
    modeBoomerang: 'Boomerang',
    burstStrip3x: 'Strip 3x',
    burstLife4: 'Life4 4x',
    burstCollage: 'Collage 2x2',

    // Capture Button States
    btnTakePhoto: 'Take Photo',
    btnStartBurst: 'Start Burst',
    btnRecordBoomerang: 'Record Boomerang',
    btnCapturing: 'Capturing...',
    btnRecording: 'Recording...',
    btnPhotoOf: (curr, total) => `Photo ${curr} of ${total}`,
    timerSeconds: (s) => `Timer: ${s}s`,

    // Footer Actions
    btnPoseRoulette: 'Pose Roulette',
    btnGallery: 'Gallery',
    btnEndSession: 'End Session',

    // Camera Live Status
    liveStatusLive: 'LIVE',
    faceDetected: 'Face Detected',
    detectingFace: 'Detecting Face...',
    readyToCapture: 'Ready to capture',
    smileText: 'Smile!',

    // Pose Roulette Modal
    rouletteBadge: 'Icebreaker Pose Roulette',
    rouletteTitle: 'Which pose will you get?',
    rouletteSubtitle: 'Challenge your friends and strike your most hilarious pose for the camera',
    rouletteSpinning: 'Spinning roulette...',
    rouletteSpinAgain: 'Spin again',
    rouletteAccept: 'Accept Challenge & Start!',

    // Photo Editor Modal
    editorTitle: 'Creative Photo Editor',
    editorDrawTab: 'Freehand Drawing',
    editorStickersTab: 'Festive Stickers',
    editorBrushSize: 'Size',
    editorUndo: 'Undo',
    editorClear: 'Clear All',
    editorSave: 'Save Edited Photo',
    editorSaving: 'Saving...',
    editorCancel: 'Cancel',

    // Capture Modal (Post-shot preview)
    captureModalTitle: 'Photo Captured!',
    scanQrTitle: 'Scan Photo to Phone',
    scanQrSubtitle: 'Point your phone camera to download the full resolution file',
    scanQrTooltip: 'Scan the QR code with your phone to download your photo instantly',
    qrNotAvailable: 'QR unavailable',
    supabaseUploaded: 'Uploaded to Supabase session',
    localReady: 'Local copy ready',
    localSaved: 'Saved locally',
    btnTouchDraw: 'Freehand touch drawing & festive stickers',
    btnTakeAnother: 'Take another photo (keep session)',
    btnDownloadJpg: 'Download .jpg',
    btnFinishSessionQr: (count) => `Finish session & view QR (${count})`,
    btnRetake: 'Retake photo if you want',
    openPublicUrl: 'Open public URL in Supabase',

    // Session End Modal
    sessionEndTitle: 'Session Complete!',
    sessionEndSubtitle: 'Scan the QR code to download all session photos directly to your smartphone',
    sessionPhotosCount: (count) => `Photos from this session (${count})`,
    tapToEnlarge: 'Tap a photo to enlarge',
    noPhotosTaken: 'No photos were taken in this session.',
    downloadAllZip: 'Download all as ZIP (.zip)',
    compressingZip: (percent) => `Compressing ZIP... ${percent}%`,
    startNewSession: 'Start New Session',
    copyShareLink: 'Copy download link',
    linkCopied: 'Link copied!',
    photoResolutionNotice: 'All photos preserved in full resolution.',

    // Live Wall (Slideshow)
    liveWallNewPhoto: '✨ Just taken in the booth!',
    liveWallPhotoOf: (curr, total) => `Photo ${curr} of ${total}`,
    liveWallSpeed: 'Speed',
    liveWallPause: 'Pause',
    liveWallPlay: 'Play',
    liveWallPrev: 'Previous',
    liveWallNext: 'Next',
    liveWallFullscreen: 'Fullscreen',
    liveWallExit: 'Back to Booth',
    liveWallWaiting: 'Waiting for photos from the booth...',
    liveWallScanQrNotice: 'Scan to enter photobooth',

    // Admin PIN Modal
    pinTitle: 'Administrator Access',
    pinSubtitle: 'Enter numerical security PIN to configure kiosk (Default: 1234)',
    pinPlaceholder: 'Enter PIN',
    pinEnter: 'Enter',
    pinCancel: 'Cancel',
    pinIncorrect: 'Incorrect PIN. Please try again.',
  },
};

// Bilingual Pose Challenges
export const BILINGUAL_POSE_CHALLENGES: Record<Language, PoseChallenge[]> = {
  es: [
    {
      id: 'telenovela',
      emoji: '💔',
      title: '¡Pose de telenovela dramática!',
      description: 'Mano al pecho, mirada al cielo y expresión de traición inolvidable.',
    },
    {
      id: 'meme_susto',
      emoji: '😱',
      title: '¡Cara de meme o susto!',
      description: 'Ojos bien abiertos, boca en shock o recrea tu meme favorito.',
    },
    {
      id: 'slowmo_fight',
      emoji: '🥊',
      title: '¡Pelea en cámara lenta!',
      description: 'Puño volador fingido, esquive épico estilo Matrix.',
    },
    {
      id: 'serious_one',
      emoji: '🤨',
      title: '¡Todos serios excepto uno!',
      description: 'Pónganse de acuerdo en un segundo: ¡solo uno puede sonreír o hacer payasadas!',
    },
    {
      id: 'supermodel',
      emoji: '✨',
      title: '¡Pose de supermodelo de revista!',
      description: 'Barbilla alta, mirada penetrante a la cámara y ángulo editorial.',
    },
    {
      id: 'group_hug',
      emoji: '🫂',
      title: '¡Abrazo grupal apretado!',
      description: '¡Todos bien juntos hacia el centro sonriendo al máximo!',
    },
    {
      id: 'robots',
      emoji: '🤖',
      title: '¡Bailando como robots!',
      description: 'Brazos a 90 grados, movimientos rígidos y mirada fija sin pestañear.',
    },
    {
      id: 'rockstar',
      emoji: '🎸',
      title: '¡Banda de rock pesado!',
      description: 'Mano cornuta 🤘, guitarra de aire y grito silencioso de concierto.',
    },
    {
      id: 'secret',
      emoji: '🤫',
      title: '¡Secreto escandaloso al oído!',
      description: 'Uno susurra algo mientras los demás reaccionan con chisme supremo.',
    },
    {
      id: 'red_carpet',
      emoji: '💋',
      title: '¡Beso al aire de diva!',
      description: 'Lanza un beso volador a la cámara como estrella de Hollywood.',
    },
    {
      id: 'commercial',
      emoji: '😁',
      title: '¡Sonrisa de comercial de pasta dental!',
      description: 'Dientes relucientes al 100%, pulgar arriba y brillo en los ojos.',
    },
    {
      id: 'spy',
      emoji: '🕵️',
      title: '¡Agentes secretos en misión!',
      description: 'Pistolas con los dedos estilo 007 mirando en direcciones opuestas.',
    },
  ],
  en: [
    {
      id: 'telenovela',
      emoji: '💔',
      title: 'Dramatic Soap Opera Pose!',
      description: 'Hand on chest, gaze to the heavens, and an unforgettable look of betrayal.',
    },
    {
      id: 'meme_susto',
      emoji: '😱',
      title: 'Meme Face or Jump Scare!',
      description: 'Eyes wide open, mouth in utter shock, or recreate your favorite meme.',
    },
    {
      id: 'slowmo_fight',
      emoji: '🥊',
      title: 'Slow-Motion Action Battle!',
      description: 'Fake flying punch and epic Matrix-style slow-mo dodge.',
    },
    {
      id: 'serious_one',
      emoji: '🤨',
      title: 'Everyone Serious Except One!',
      description: 'Agree in 1 second: only one person is allowed to smile or goof around!',
    },
    {
      id: 'supermodel',
      emoji: '✨',
      title: 'High-Fashion Supermodel Pose!',
      description: 'Chin held high, piercing look right into the camera, and editorial swagger.',
    },
    {
      id: 'group_hug',
      emoji: '🫂',
      title: 'Tight Squeeze Group Hug!',
      description: 'Huddle closely into the center and flash your biggest smiles!',
    },
    {
      id: 'robots',
      emoji: '🤖',
      title: 'Dancing Like Robots!',
      description: '90-degree robotic arms, mechanical moves, and unblinking stares.',
    },
    {
      id: 'rockstar',
      emoji: '🎸',
      title: 'Heavy Metal Rock Band!',
      description: 'Rock horns up 🤘, air guitar solos, and a silent stadium concert scream.',
    },
    {
      id: 'secret',
      emoji: '🤫',
      title: 'Shocking Secret in the Ear!',
      description: 'One person whispers a juicy rumor while everyone else reacts in total shock.',
    },
    {
      id: 'red_carpet',
      emoji: '💋',
      title: 'Hollywood Diva Air Kiss!',
      description: 'Blow a glamorous kiss to the camera like a red-carpet superstar.',
    },
    {
      id: 'commercial',
      emoji: '😁',
      title: 'Toothpaste Commercial Smile!',
      description: '100% sparkling teeth, bright thumbs up, and twinkle in the eyes.',
    },
    {
      id: 'spy',
      emoji: '🕵️',
      title: 'Secret Agents on a Mission!',
      description: '007 finger pistols pointing in opposite directions back-to-back.',
    },
  ],
};

export const getPoseChallenges = (lang: Language): PoseChallenge[] => {
  return BILINGUAL_POSE_CHALLENGES[lang] || BILINGUAL_POSE_CHALLENGES.es;
};
