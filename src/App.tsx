import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Camera,
  FlipHorizontal,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Sparkles,
  Palette,
  Layers,
  Square,
  Columns,
  Image as ImageIcon,
  Check,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Upload,
  Settings2,
  Video,
  ChevronDown,
  Gift,
  Snowflake,
  ScanFace,
  FolderDown,
  Film,
  CheckCircle2,
  Sliders,
  X,
  ShieldAlert,
  LayoutGrid,
  Hash,
  Dices,
  Tv,
  Smartphone,
  Heart,
  GraduationCap,
  PartyPopper,
  Ban,
  Globe
} from 'lucide-react';
import { Language, getStoredLanguage, setStoredLanguage, TRANSLATIONS, getPoseChallenges } from './utils/i18n';

import {
  ColorFilter,
  FrameStyle,
  CaptureMode,
  ActiveProp,
  FrameSettings,
  CameraDevice,
  CapturedPhotoRecord,
  EventConfig,
  DEFAULT_EVENT_CONFIG,
  CustomPropItem,
  PoseChallenge,
} from './types/photobooth';
import { AVAILABLE_PROPS, PropItem } from './data/propsData';
import { BACKDROP_PRESETS, BackdropPreset } from './data/backdropsData';
import { applyChromaKey, hexToRgb, ChromaKeySettings } from './utils/chromaKey';
import { drawFrame, composePhotoStrip, composePhotoCollage2x2, composeLife4CutsStrip } from './utils/frameRenderer';
import { sounds } from './utils/audio';
import { uploadPhotoToSupabase } from './utils/supabase';
import { faceTracker } from './utils/faceTracker';
import { LiveParticleSystem } from './utils/snowEffect';
import { CaptureModal } from './components/CaptureModal';
import { SessionEndModal } from './components/SessionEndModal';
import { RecentGalleryModal } from './components/RecentGalleryModal';
import { AdminPinModal } from './components/AdminPinModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { PoseRouletteModal } from './components/PoseRouletteModal';
import { PhotoEditorModal } from './components/PhotoEditorModal';
import { LivePhotoWall } from './components/LivePhotoWall';
import { HorizontalCarousel } from './components/HorizontalCarousel';

export default function App() {
  // --- Refs ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cachedFrameCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastFrameKeyRef = useRef<string>('');
  const animFrameIdRef = useRef<number | null>(null);
  const particleSystemRef = useRef<LiveParticleSystem>(new LiveParticleSystem(90, 'snow'));

  // --- Persistent Event Customizer State ---
  const [eventConfig, setEventConfig] = useState<EventConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('photobooth_event_config');
        if (saved) {
          return { ...DEFAULT_EVENT_CONFIG, ...JSON.parse(saved) };
        }
      } catch (e) {
        console.warn('Failed to parse saved event config:', e);
      }
    }
    return DEFAULT_EVENT_CONFIG;
  });

  // --- Language & i18n State (stored in localStorage) ---
  const [language, setLanguage] = useState<Language>(getStoredLanguage);
  const t = TRANSLATIONS[language];

  const toggleLanguage = () => {
    const nextLang: Language = language === 'es' ? 'en' : 'es';
    setLanguage(nextLang);
    setStoredLanguage(nextLang);
  };

  // Admin Security Modals
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);

  // Triple-tap shortcut detector on booth brand logo
  const logoTapCountRef = useRef<number>(0);
  const logoTapTimeoutRef = useRef<any>(null);

  const handleBrandLogoClick = () => {
    logoTapCountRef.current += 1;
    if (logoTapTimeoutRef.current) clearTimeout(logoTapTimeoutRef.current);

    if (logoTapCountRef.current >= 3) {
      logoTapCountRef.current = 0;
      setShowPinModal(true);
    } else {
      logoTapTimeoutRef.current = setTimeout(() => {
        logoTapCountRef.current = 0;
      }, 700);
    }
  };

  // --- WebRTC / Camera State ---
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [cameraLoading, setCameraLoading] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [streamActive, setStreamActive] = useState<boolean>(false);

  // --- Face Tracking & Live Particle Features ---
  const [arTrackingEnabled, setArTrackingEnabled] = useState<boolean>(true);
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  const [particlesEnabled, setParticlesEnabled] = useState<boolean>(true);

  // --- Settings & Rendering State ---
  const [colorFilter, setColorFilter] = useState<ColorFilter>('normal');
  const [captureMode, setCaptureMode] = useState<CaptureMode>('single');

  // Chroma Key
  const [chromaSettings, setChromaSettings] = useState<ChromaKeySettings>({
    enabled: false,
    color: '#00ff00',
    tolerance: 0.32,
    smoothness: 0.08,
    spillSuppression: true,
    backdropId: 'xmas_fireplace',
    customBackdropUrl: null,
  });

  // AR Props
  const [activeProps, setActiveProps] = useState<ActiveProp[]>([
    {
      instanceId: 'prop_init_santa',
      propId: 'prop_santa_hat',
      x: 50,
      y: 28,
      scale: 1.0,
      rotation: 0,
      autoTracking: true,
      anchorType: 'forehead',
    },
  ]);
  const [selectedPropInstanceId, setSelectedPropInstanceId] = useState<string | null>(null);
  const propImagesCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Frames & Event Branding
  const [frameSettings, setFrameSettings] = useState<FrameSettings>(() => ({
    style: eventConfig.activeCustomFrameId ? 'custom' : 'xmas_wreath',
    eventTitle: eventConfig.eventTitle,
    eventSubtitle: eventConfig.eventSubtitle,
    eventDate: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    accentColor: eventConfig.accentColor,
    customFrameUrl: eventConfig.activeCustomFrameId
      ? eventConfig.customFrames.find((f) => f.id === eventConfig.activeCustomFrameId)?.dataUrl
      : null,
    fontFamily: eventConfig.fontFamily,
  }));

  // Update particles on config change
  useEffect(() => {
    particleSystemRef.current.setEffectType(particlesEnabled ? eventConfig.particleEffect : 'none');
  }, [particlesEnabled, eventConfig.particleEffect]);

  // Split-screen Control Panel state
  type SidebarTab = 'props' | 'frames_chroma' | 'filters' | 'roulette';
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('props');
  type PropsCategoryFilter = 'all' | 'wedding' | 'party' | 'corporate' | 'xmas' | 'custom';
  const [propsCategoryFilter, setPropsCategoryFilter] = useState<PropsCategoryFilter>('all');
  const [chromaOrFramesView, setChromaOrFramesView] = useState<'frames' | 'chroma'>('frames');

  // Portrait orientation detection
  const [isPortrait, setIsPortrait] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerHeight > window.innerWidth;
    }
    return false;
  });

  useEffect(() => {
    const handleOrientationOrResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    window.addEventListener('resize', handleOrientationOrResize);
    window.addEventListener('orientationchange', handleOrientationOrResize);
    return () => {
      window.removeEventListener('resize', handleOrientationOrResize);
      window.removeEventListener('orientationchange', handleOrientationOrResize);
    };
  }, []);

  // Quick Frames & Chroma Drawer Modal
  const [showQuickSettingsModal, setShowQuickSettingsModal] = useState<boolean>(false);
  const [settingsActiveTab, setSettingsActiveTab] = useState<'frames' | 'chroma'>('frames');

  // --- Capture Workflow State ---
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [stripProgress, setStripProgress] = useState<{ current: number; total: number; message: string } | null>(null);

  // Session & Photo Management (Group Sessions)
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => `sesion_${Date.now()}`);
  const [sessionPhotos, setSessionPhotos] = useState<CapturedPhotoRecord[]>([]);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhotoRecord[]>([]);
  const [currentModalPhoto, setCurrentModalPhoto] = useState<CapturedPhotoRecord | null>(null);
  const [showSessionEndModal, setShowSessionEndModal] = useState<boolean>(false);
  const [showGalleryModal, setShowGalleryModal] = useState<boolean>(false);

  // Entertainment: Pose Roulette, Touch Drawing Editor & Live Wall
  const [showPoseRouletteModal, setShowPoseRouletteModal] = useState<boolean>(false);
  const [activePoseChallenge, setActivePoseChallenge] = useState<PoseChallenge | null>(null);
  const [showPhotoEditorModal, setShowPhotoEditorModal] = useState<boolean>(false);
  const [isLiveWallMode, setIsLiveWallMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.location.search.includes('mode=live_wall');
    }
    return false;
  });

  // Sync sounds.enabled with eventConfig & mute state
  useEffect(() => {
    sounds.enabled = eventConfig.enableAudioEffects !== false && !isAudioMuted;
  }, [eventConfig.enableAudioEffects, isAudioMuted]);

  // Check if accessed from mobile via QR code (?session=...) or projector (?mode=live_wall)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sessionParam = params.get('session');
      if (sessionParam) {
        setCurrentSessionId(sessionParam);
        setShowSessionEndModal(true);
      }
      if (params.get('mode') === 'live_wall') {
        setIsLiveWallMode(true);
      }
    }
  }, []);

  // Dragging Props on Canvas (manual fallback adjustment)
  const [isDraggingProp, setIsDraggingProp] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; propX: number; propY: number } | null>(null);

  // ----------------------------------------------------
  // 1. Device Enumeration & WebRTC Stream Management
  // ----------------------------------------------------
  const updateDeviceList = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = allDevices.filter((d) => d.kind === 'videoinput');

      const mapped: CameraDevice[] = videoInputs.map((d, index) => {
        const label = d.label || `Camera ${index + 1}`;
        const isFront = /front|user|facetime|delantera/i.test(label);
        const isExternal = /usb|hdmi|cam link|uvc|external|capture/i.test(label);
        return {
          deviceId: d.deviceId,
          label: isExternal
            ? `📹 ${label}`
            : isFront
            ? `👤 ${label} (Frontal)`
            : `📷 ${label}`,
          isFront,
          isExternal,
        };
      });

      setDevices(mapped);
      if (mapped.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(mapped[0].deviceId);
      }
    } catch (err) {
      console.warn('Error enumerating devices:', err);
    }
  }, [selectedDeviceId]);

  const startCamera = useCallback(
    async (deviceId?: string) => {
      setCameraLoading(true);
      setCameraError(null);

      // Stop existing stream tracks
      if (videoRef.current && videoRef.current.srcObject) {
        const currentStream = videoRef.current.srcObject as MediaStream;
        currentStream.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          frameRate: { ideal: 60, min: 30 },
        },
      };

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStreamActive(true);
        setCameraLoading(false);
        updateDeviceList();
      } catch (err: any) {
        console.warn('High-res camera failed, falling back to standard resolution:', err);
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: deviceId ? { deviceId: { exact: deviceId } } : true,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            await videoRef.current.play();
          }
          setStreamActive(true);
          setCameraLoading(false);
          updateDeviceList();
        } catch (fallbackErr: any) {
          console.error('Fatal camera error:', fallbackErr);
          setCameraError(fallbackErr.message || 'No se pudo acceder a la cámara');
          setCameraLoading(false);
          setStreamActive(false);
        }
      }
    },
    [updateDeviceList]
  );

  useEffect(() => {
    startCamera();
    if (navigator.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', updateDeviceList);
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const currentStream = videoRef.current.srcObject as MediaStream;
        currentStream.getTracks().forEach((track) => track.stop());
      }
      if (navigator.mediaDevices?.removeEventListener) {
        navigator.mediaDevices.removeEventListener('devicechange', updateDeviceList);
      }
    };
  }, []);

  const handleDeviceSelect = (newId: string) => {
    setSelectedDeviceId(newId);
    startCamera(newId);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
          try {
            if ('orientation' in screen && 'lock' in (screen as any).orientation) {
              (screen as any).orientation.lock('landscape').catch(() => {});
            }
          } catch {
            // Not supported
          }
        })
        .catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const requestLandscapeOrientation = async () => {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
      if ('orientation' in screen && 'lock' in (screen as any).orientation) {
        await (screen as any).orientation.lock('landscape');
      }
    } catch (err) {
      console.warn('Orientation lock notice:', err);
    }
  };

  const toggleMute = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    sounds.enabled = !next;
  };

  // ----------------------------------------------------
  // 2. Pre-cache SVG Prop Images & Custom Uploaded Props
  // ----------------------------------------------------
  useEffect(() => {
    // 1. Built-in vector props
    AVAILABLE_PROPS.forEach((prop) => {
      if (!propImagesCacheRef.current.has(prop.id)) {
        const img = new Image();
        const blob = new Blob([prop.svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        img.src = url;
        img.onload = () => {
          propImagesCacheRef.current.set(prop.id, img);
        };
      }
    });

    // 2. Custom Uploaded PNG props from Event Customizer
    eventConfig.customProps.forEach((cp) => {
      if (!propImagesCacheRef.current.has(cp.id)) {
        const img = new Image();
        img.src = cp.dataUrl;
        img.onload = () => {
          propImagesCacheRef.current.set(cp.id, img);
        };
      }
    });
  }, [eventConfig.customProps]);

  // Combined Prop List
  const allAvailableProps: PropItem[] = [
    ...AVAILABLE_PROPS,
    ...eventConfig.customProps.map((cp) => ({
      id: cp.id,
      name: cp.name,
      category: 'props' as const,
      defaultScale: cp.scale,
      anchorType: cp.anchorType,
      anchorYOffset: cp.offsetY,
      width: 220,
      height: 220,
      svg: '', // Cached directly from dataUrl
    })),
  ];

  // ----------------------------------------------------
  // 3. Render Loop (Canvas at 60 FPS + MediaPipe Face Mesh)
  // ----------------------------------------------------
  const renderCanvasFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      animFrameIdRef.current = requestAnimationFrame(renderCanvasFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Trigger MediaPipe face tracking in background (decoupled asynchronous)
    if (arTrackingEnabled) {
      faceTracker.processFrame(video);
      const isTracking = faceTracker.isTracking();
      setFaceDetected((prev) => (prev !== isTracking ? isTracking : prev));
    }

    // 1. Exact resolution synchronization
    const vWidth = video.videoWidth || 1280;
    const vHeight = video.videoHeight || 720;
    if (canvas.width !== vWidth || canvas.height !== vHeight) {
      canvas.width = vWidth;
      canvas.height = vHeight;
    }

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
    const offCanvas = offscreenCanvasRef.current;
    if (offCanvas.width !== vWidth || offCanvas.height !== vHeight) {
      offCanvas.width = vWidth;
      offCanvas.height = vHeight;
    }

    ctx.save();

    // 2. Uniform horizontal flip in mirror mode
    if (isMirrored) {
      ctx.translate(vWidth, 0);
      ctx.scale(-1, 1);
    }

    // A. Chroma Key Backdrop
    if (chromaSettings.enabled) {
      if (chromaSettings.customBackdropUrl) {
        const customImg = new Image();
        customImg.src = chromaSettings.customBackdropUrl;
        if (customImg.complete && customImg.naturalWidth > 0) {
          ctx.drawImage(customImg, 0, 0, vWidth, vHeight);
        } else {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, vWidth, vHeight);
        }
      } else {
        const preset = BACKDROP_PRESETS.find((p) => p.id === chromaSettings.backdropId) || BACKDROP_PRESETS[0];
        preset.render(ctx, vWidth, vHeight);
      }
    }

    // B. Render Video Frame with Color Filter
    const offCtx = offCanvas.getContext('2d', { willReadFrequently: true })!;
    offCtx.save();

    let filterString = 'none';
    if (colorFilter === 'bw') {
      filterString = 'grayscale(100%) contrast(160%) brightness(105%)';
    } else if (colorFilter === 'glam') {
      filterString = 'grayscale(100%) contrast(180%) brightness(112%)';
    } else if (colorFilter === 'sepia') {
      filterString = 'sepia(90%) contrast(115%) brightness(95%) saturate(120%)';
    } else if (colorFilter === 'cyberpunk') {
      filterString = 'hue-rotate(280deg) saturate(220%) contrast(140%) brightness(110%)';
    } else if (colorFilter === 'vibrant') {
      filterString = 'saturate(200%) contrast(125%) brightness(105%)';
    } else if (colorFilter === 'polaroid') {
      filterString = 'sepia(25%) contrast(115%) saturate(130%) brightness(105%)';
    }

    offCtx.filter = filterString;
    offCtx.drawImage(video, 0, 0, vWidth, vHeight);
    offCtx.filter = 'none';
    offCtx.restore();

    // C. Composite Chroma Key onto Canvas
    if (chromaSettings.enabled) {
      const rgb = hexToRgb(chromaSettings.color);
      const imgData = offCtx.getImageData(0, 0, vWidth, vHeight);
      applyChromaKey(
        imgData,
        rgb.r,
        rgb.g,
        rgb.b,
        chromaSettings.tolerance,
        chromaSettings.smoothness,
        chromaSettings.spillSuppression
      );
      offCtx.putImageData(imgData, 0, 0);
      ctx.drawImage(offCanvas, 0, 0);
    } else {
      ctx.drawImage(offCanvas, 0, 0);
    }

    // Glam Cam Vignette & Soft Glow (Celebrity Wedding look)
    if (colorFilter === 'glam') {
      ctx.save();
      const radius = Math.hypot(vWidth / 2, vHeight / 2);
      const grad = ctx.createRadialGradient(vWidth / 2, vHeight / 2, radius * 0.45, vWidth / 2, vHeight / 2, radius);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, vWidth, vHeight);
      ctx.restore();
    }

    // D. Render AR Facial Props (MediaPipe Face Mesh Tracking)
    const primaryFace = arTrackingEnabled ? faceTracker.getPrimaryFace() : null;

    if (primaryFace) {
      const p1 = { x: primaryFace.p1.x * vWidth, y: primaryFace.p1.y * vHeight };
      const p33 = { x: primaryFace.p33.x * vWidth, y: primaryFace.p33.y * vHeight };
      const p263 = { x: primaryFace.p263.x * vWidth, y: primaryFace.p263.y * vHeight };
      const p168 = { x: primaryFace.p168.x * vWidth, y: primaryFace.p168.y * vHeight };
      const p10 = { x: primaryFace.p10.x * vWidth, y: primaryFace.p10.y * vHeight };
      const p164 = { x: primaryFace.p164.x * vWidth, y: primaryFace.p164.y * vHeight };
      const p152 = { x: primaryFace.p152.x * vWidth, y: primaryFace.p152.y * vHeight };
      const p234 = { x: primaryFace.p234.x * vWidth, y: primaryFace.p234.y * vHeight };
      const p454 = { x: primaryFace.p454.x * vWidth, y: primaryFace.p454.y * vHeight };

      const faceWidth = Math.hypot(
        (primaryFace.p454.x - primaryFace.p234.x) * vWidth,
        (primaryFace.p454.y - primaryFace.p234.y) * vHeight
      );
      const angle = Math.atan2(
        (primaryFace.p263.y - primaryFace.p33.y) * vHeight,
        (primaryFace.p263.x - primaryFace.p33.x) * vWidth
      );
      const eyeDist = Math.hypot(p263.x - p33.x, p263.y - p33.y);

      activeProps.forEach((propInstance) => {
        const propDef = allAvailableProps.find((p) => p.id === propInstance.propId);
        const img = propImagesCacheRef.current.get(propInstance.propId);
        if (!propDef || !img) return;

        if (propInstance.autoTracking !== false) {
          ctx.save();

          // Check if custom uploaded prop
          const isCustomUploaded = eventConfig.customProps.some((cp) => cp.id === propDef.id);

          if (propDef.id === 'prop_santa_hat') {
            const propWidth = faceWidth * 1.35 * propInstance.scale;
            const propHeight = propDef.height * (propWidth / propDef.width);
            const brimOffsetY = -propHeight * 0.72;

            ctx.translate(p10.x, p10.y);
            ctx.rotate(angle);
            ctx.drawImage(img, -propWidth / 2, brimOffsetY, propWidth, propHeight);
          } else if (propDef.id === 'prop_reindeer_antlers') {
            const propWidth = faceWidth * 1.4 * propInstance.scale;
            const propHeight = propDef.height * (propWidth / propDef.width);
            const bandOffsetY = -propHeight * 0.82;

            ctx.translate(p10.x, p10.y);
            ctx.rotate(angle);
            ctx.drawImage(img, -propWidth / 2, bandOffsetY, propWidth, propHeight);
          } else if (propDef.id === 'prop_santa_beard') {
            const propWidth = faceWidth * 1.25 * propInstance.scale;
            const propHeight = propDef.height * (propWidth / propDef.width);
            const mustacheOffsetY = -propHeight * 0.22;

            ctx.translate(p164.x, p164.y);
            ctx.rotate(angle);
            ctx.drawImage(img, -propWidth / 2, mustacheOffsetY, propWidth, propHeight);
          } else if (propDef.id === 'prop_rudolph_nose') {
            const propWidth = faceWidth * 0.34 * propInstance.scale;
            const propHeight = propWidth;

            ctx.translate(p1.x, p1.y);
            ctx.rotate(angle);
            ctx.drawImage(img, -propWidth / 2, -propHeight / 2, propWidth, propHeight);
          } else if (isCustomUploaded) {
            // Custom Prop from Event Admin
            const anchor =
              propDef.anchorType === 'forehead' || propDef.anchorType === 'head_top'
                ? p10
                : propDef.anchorType === 'eyes'
                ? p168
                : propDef.anchorType === 'nose'
                ? p1
                : propDef.anchorType === 'mouth'
                ? p164
                : p152;

            const baseW = faceWidth * 0.95 * propDef.defaultScale * propInstance.scale;
            const propWidth = baseW;
            const propHeight = img.naturalHeight && img.naturalWidth ? (img.naturalHeight / img.naturalWidth) * propWidth : propWidth;
            const customOffsetY = (propDef.anchorYOffset || 0) * propHeight;

            ctx.translate(anchor.x, anchor.y);
            ctx.rotate(angle);
            ctx.drawImage(img, -propWidth / 2, -propHeight / 2 + customOffsetY, propWidth, propHeight);
          } else if (propDef.anchorType === 'eyes') {
            const baseW = Math.max(faceWidth * 0.98, eyeDist * 2.25);
            const propWidth = baseW * propDef.defaultScale * propInstance.scale;
            const propHeight = propDef.height * (propWidth / propDef.width);

            ctx.translate(p168.x, p168.y);
            ctx.rotate(angle);
            ctx.drawImage(img, -propWidth / 2, -propHeight / 2, propWidth, propHeight);
          } else if (propDef.anchorType === 'mouth') {
            const propWidth = faceWidth * 0.7 * propInstance.scale;
            const propHeight = propDef.height * (propWidth / propDef.width);

            ctx.translate(p164.x, p164.y);
            ctx.rotate(angle);
            ctx.drawImage(img, -propWidth / 2, -propHeight / 2, propWidth, propHeight);
          } else if (propDef.anchorType === 'chin') {
            const propWidth = faceWidth * 0.75 * propInstance.scale;
            const propHeight = propDef.height * (propWidth / propDef.width);

            ctx.translate(p152.x, p152.y);
            ctx.rotate(angle);
            ctx.drawImage(img, -propWidth / 2, 8, propWidth, propHeight);
          } else {
            const propWidth = faceWidth * 1.15 * propInstance.scale;
            const propHeight = propDef.height * (propWidth / propDef.width);

            ctx.translate(p10.x, p10.y);
            ctx.rotate(angle);
            ctx.drawImage(img, -propWidth / 2, -propHeight * 0.85, propWidth, propHeight);
          }

          if (propInstance.instanceId === selectedPropInstanceId) {
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.5;
            ctx.setLineDash([6, 4]);
            ctx.strokeRect(-60, -60, 120, 120);
            ctx.setLineDash([]);
          }

          ctx.restore();
        } else {
          // Fallback manual coordinates
          const px = (propInstance.x / 100) * vWidth;
          const py = (propInstance.y / 100) * vHeight;
          const baseScale = vWidth / 1280;
          const propWidth = propDef.width * baseScale * propInstance.scale;
          const propHeight = propDef.height * baseScale * propInstance.scale;

          ctx.save();
          ctx.translate(px, py);
          ctx.rotate((propInstance.rotation * Math.PI) / 180);
          ctx.drawImage(img, -propWidth / 2, -propHeight / 2, propWidth, propHeight);
          ctx.restore();
        }
      });
    } else {
      activeProps.forEach((propInstance) => {
        const propDef = allAvailableProps.find((p) => p.id === propInstance.propId);
        const img = propImagesCacheRef.current.get(propInstance.propId);
        if (!propDef || !img) return;

        const px = (propInstance.x / 100) * vWidth;
        const py = (propInstance.y / 100) * vHeight;
        const baseScale = vWidth / 1280;
        const propWidth = propDef.width * baseScale * propInstance.scale;
        const propHeight = propDef.height * baseScale * propInstance.scale;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate((propInstance.rotation * Math.PI) / 180);
        ctx.drawImage(img, -propWidth / 2, -propHeight / 2, propWidth, propHeight);
        ctx.restore();
      });
    }

    // E. Live Particle System (Snow, Confetti, Sparkles)
    if (particlesEnabled) {
      particleSystemRef.current.updateAndRender(ctx, vWidth, vHeight);
    }

    ctx.restore();

    // F. Frames & Event Branding (Pre-rendered on OffscreenCanvas to guarantee solid 60 FPS)
    if (frameSettings.style !== 'none') {
      const frameKey = `${vWidth}x${vHeight}_${frameSettings.style}_${frameSettings.accentColor || ''}_${frameSettings.eventTitle || ''}_${frameSettings.eventSubtitle || ''}_${frameSettings.eventDate || ''}_${frameSettings.customFrameUrl || ''}`;
      if (lastFrameKeyRef.current !== frameKey || !cachedFrameCanvasRef.current) {
        if (!cachedFrameCanvasRef.current) {
          cachedFrameCanvasRef.current = document.createElement('canvas');
        }
        const fCanvas = cachedFrameCanvasRef.current;
        if (fCanvas.width !== vWidth || fCanvas.height !== vHeight) {
          fCanvas.width = vWidth;
          fCanvas.height = vHeight;
        }
        const fCtx = fCanvas.getContext('2d');
        if (fCtx) {
          fCtx.clearRect(0, 0, vWidth, vHeight);
          drawFrame(fCtx, vWidth, vHeight, frameSettings, false);
        }
        lastFrameKeyRef.current = frameKey;
      }
      if (cachedFrameCanvasRef.current) {
        ctx.drawImage(cachedFrameCanvasRef.current, 0, 0);
      }
    }

    animFrameIdRef.current = requestAnimationFrame(renderCanvasFrame);
  }, [
    isMirrored,
    colorFilter,
    chromaSettings,
    activeProps,
    selectedPropInstanceId,
    frameSettings,
    arTrackingEnabled,
    particlesEnabled,
    eventConfig,
    allAvailableProps,
  ]);

  useEffect(() => {
    if (streamActive) {
      animFrameIdRef.current = requestAnimationFrame(renderCanvasFrame);
    }
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [streamActive, renderCanvasFrame]);

  // ----------------------------------------------------
  // 4. AR Prop Dragging & Manipulation
  // ----------------------------------------------------
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    if (isMirrored) {
      clickX = 100 - clickX;
    }

    for (let i = activeProps.length - 1; i >= 0; i--) {
      const prop = activeProps[i];
      const dx = Math.abs(clickX - prop.x);
      const dy = Math.abs(clickY - prop.y);
      if (dx < 16 && dy < 16) {
        setSelectedPropInstanceId(prop.instanceId);
        setIsDraggingProp(true);
        dragStartRef.current = {
          x: clickX,
          y: clickY,
          propX: prop.x,
          propY: prop.y,
        };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        return;
      }
    }

    setSelectedPropInstanceId(null);
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingProp || !selectedPropInstanceId || !dragStartRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;

    if (isMirrored) {
      currentX = 100 - currentX;
    }

    const deltaX = currentX - dragStartRef.current.x;
    const deltaY = currentY - dragStartRef.current.y;

    const newX = Math.min(95, Math.max(5, dragStartRef.current.propX + deltaX));
    const newY = Math.min(95, Math.max(5, dragStartRef.current.propY + deltaY));

    setActiveProps((prev) =>
      prev.map((p) =>
        p.instanceId === selectedPropInstanceId
          ? { ...p, x: newX, y: newY, autoTracking: false }
          : p
      )
    );
  };

  const handleCanvasPointerUp = () => {
    setIsDraggingProp(false);
    dragStartRef.current = null;
  };

  const addProp = (propId: string) => {
    const propDef = allAvailableProps.find((p) => p.id === propId);
    if (!propDef) return;

    const existing = activeProps.find((p) => p.propId === propId);
    if (existing) {
      setActiveProps((prev) => prev.filter((p) => p.propId !== propId));
      setSelectedPropInstanceId(null);
      return;
    }

    const newInstance: ActiveProp = {
      instanceId: `prop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      propId,
      x: 50,
      y: 45 + propDef.anchorYOffset * 25,
      scale: 1.0,
      rotation: 0,
      anchorType: propDef.anchorType,
      autoTracking: true,
    };

    setActiveProps((prev) => [...prev, newInstance]);
    setSelectedPropInstanceId(newInstance.instanceId);
    sounds.playCountdownTick(1.2);
  };

  const removeSelectedProp = () => {
    if (!selectedPropInstanceId) return;
    setActiveProps((prev) => prev.filter((p) => p.instanceId !== selectedPropInstanceId));
    setSelectedPropInstanceId(null);
  };

  const scaleSelectedProp = (delta: number) => {
    if (!selectedPropInstanceId) return;
    setActiveProps((prev) =>
      prev.map((p) => {
        if (p.instanceId !== selectedPropInstanceId) return p;
        const newScale = Math.min(2.5, Math.max(0.4, Number((p.scale + delta).toFixed(2))));
        return { ...p, scale: newScale };
      })
    );
  };

  const rotateSelectedProp = (deltaDegrees: number) => {
    if (!selectedPropInstanceId) return;
    setActiveProps((prev) =>
      prev.map((p) => {
        if (p.instanceId !== selectedPropInstanceId) return p;
        const newRot = (p.rotation + deltaDegrees) % 360;
        return { ...p, rotation: newRot };
      })
    );
  };

  // Christmas 1-Tap Preset Combos
  const applyXmasCombo = (comboType: 'santa' | 'reindeer' | 'festive') => {
    sounds.playCountdownTick(1.4);
    if (comboType === 'santa') {
      setActiveProps([
        {
          instanceId: `santa_hat_${Date.now()}`,
          propId: 'prop_santa_hat',
          x: 50,
          y: 28,
          scale: 1.0,
          rotation: 0,
          autoTracking: true,
          anchorType: 'forehead',
        },
        {
          instanceId: `santa_beard_${Date.now()}`,
          propId: 'prop_santa_beard',
          x: 50,
          y: 65,
          scale: 1.0,
          rotation: 0,
          autoTracking: true,
          anchorType: 'chin',
        },
      ]);
      setFrameSettings((prev) => ({
        ...prev,
        style: 'xmas_wreath',
        eventTitle: '¡JO JO JO! FELIZ NAVIDAD',
        accentColor: '#fde047',
      }));
      setParticlesEnabled(true);
    } else if (comboType === 'reindeer') {
      setActiveProps([
        {
          instanceId: `reindeer_${Date.now()}`,
          propId: 'prop_reindeer_antlers',
          x: 50,
          y: 24,
          scale: 1.0,
          rotation: 0,
          autoTracking: true,
          anchorType: 'head_top',
        },
        {
          instanceId: `rudolph_nose_${Date.now()}`,
          propId: 'prop_rudolph_nose',
          x: 50,
          y: 52,
          scale: 1.0,
          rotation: 0,
          autoTracking: true,
          anchorType: 'nose',
        },
        {
          instanceId: `candy_glasses_${Date.now()}`,
          propId: 'prop_candy_cane_glasses',
          x: 50,
          y: 45,
          scale: 1.0,
          rotation: 0,
          autoTracking: true,
          anchorType: 'eyes',
        },
      ]);
      setFrameSettings((prev) => ({
        ...prev,
        style: 'xmas_postcard',
        eventTitle: '¡MÁGICA NAVIDAD!',
        accentColor: '#ffffff',
      }));
      setParticlesEnabled(true);
    } else if (comboType === 'festive') {
      setActiveProps([
        {
          instanceId: `tree_glasses_${Date.now()}`,
          propId: 'prop_xmas_glasses',
          x: 50,
          y: 45,
          scale: 1.0,
          rotation: 0,
          autoTracking: true,
          anchorType: 'eyes',
        },
        {
          instanceId: `bowtie_${Date.now()}`,
          propId: 'prop_bowtie',
          x: 50,
          y: 75,
          scale: 1.0,
          rotation: 0,
          autoTracking: true,
          anchorType: 'chin',
        },
      ]);
      setFrameSettings((prev) => ({
        ...prev,
        style: 'xmas_wreath',
        eventTitle: '¡FIESTA NAVIDEÑA!',
        accentColor: '#4ade80',
      }));
      setParticlesEnabled(true);
    }
  };

  // ----------------------------------------------------
  // 5. Capture Workflow (Single Photo, Boomerang, Life4Cuts, Strip, or 2x2 Collage)
  // ----------------------------------------------------
  const runCountdown = async (durationSec: number): Promise<void> => {
    sounds.playDrumroll(durationSec);
    for (let i = durationSec; i > 0; i--) {
      setCountdownValue(i);
      sounds.playCountdownTick(1 + (durationSec - i) * 0.15);
      await new Promise((resolve) => setTimeout(resolve, 950));
    }
    setCountdownValue(null);
  };

  const triggerFlashAndShutter = async () => {
    setIsFlashing(true);
    sounds.playShutterSound();
    await new Promise((resolve) => setTimeout(resolve, 140));
    setIsFlashing(false);
  };

  const triggerCapture = async () => {
    if (isCapturing || !canvasRef.current || !streamActive) return;
    setIsCapturing(true);

    try {
      if (captureMode === 'single') {
        await runCountdown(3);
        await triggerFlashAndShutter();

        const mainCanvas = canvasRef.current;
        const snapshotCanvas = document.createElement('canvas');
        snapshotCanvas.width = mainCanvas.width;
        snapshotCanvas.height = mainCanvas.height;
        const sCtx = snapshotCanvas.getContext('2d')!;
        sCtx.drawImage(mainCanvas, 0, 0);

        await processAndUploadCanvas(snapshotCanvas, 'single');
      } else if (captureMode === 'boomerang') {
        await runCountdown(3);
        sounds.playPaparazziBurst();
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 200);

        const mainCanvas = canvasRef.current;
        const frames: string[] = [];
        const totalFrames = 15;
        const frameIntervalMs = 75;

        for (let i = 0; i < totalFrames; i++) {
          const snap = document.createElement('canvas');
          snap.width = mainCanvas.width;
          snap.height = mainCanvas.height;
          const snapCtx = snap.getContext('2d')!;
          snapCtx.drawImage(mainCanvas, 0, 0);
          frames.push(snap.toDataURL('image/jpeg', 0.82));
          await new Promise((r) => setTimeout(r, frameIntervalMs));
        }

        // Snapshot poster
        const posterCanvas = document.createElement('canvas');
        posterCanvas.width = mainCanvas.width;
        posterCanvas.height = mainCanvas.height;
        const pCtx = posterCanvas.getContext('2d')!;
        pCtx.drawImage(mainCanvas, 0, 0);

        await processAndUploadCanvas(posterCanvas, 'boomerang', {
          isBoomerang: true,
          boomerangFrames: frames,
        });
      } else if (captureMode === 'life4cuts') {
        const shots: HTMLCanvasElement[] = [];
        const totalShots = 4;

        for (let shotIndex = 1; shotIndex <= totalShots; shotIndex++) {
          setStripProgress({
            current: shotIndex,
            total: totalShots,
            message: `Life4Cuts: Pose #${shotIndex} de 4`,
          });

          await runCountdown(3);
          await triggerFlashAndShutter();

          const mainCanvas = canvasRef.current;
          const snap = document.createElement('canvas');
          snap.width = mainCanvas.width;
          snap.height = mainCanvas.height;
          const snapCtx = snap.getContext('2d')!;
          snapCtx.drawImage(mainCanvas, 0, 0);
          shots.push(snap);

          if (shotIndex < totalShots) {
            setStripProgress({
              current: shotIndex,
              total: totalShots,
              message: `¡Cambia de pose para la foto #${shotIndex + 1}!`,
            });
            await new Promise((r) => setTimeout(r, 1600));
          }
        }

        setStripProgress(null);
        const life4cutsCanvas = composeLife4CutsStrip(shots, frameSettings, eventConfig);
        await processAndUploadCanvas(life4cutsCanvas, 'life4cuts');
      } else if (captureMode === 'strip') {
        const shots: HTMLCanvasElement[] = [];
        const totalShots = eventConfig.stripShotCount || 3;

        for (let shotIndex = 1; shotIndex <= totalShots; shotIndex++) {
          setStripProgress({
            current: shotIndex,
            total: totalShots,
            message: `Pose #${shotIndex}`,
          });

          await runCountdown(3);
          await triggerFlashAndShutter();

          const mainCanvas = canvasRef.current;
          const snap = document.createElement('canvas');
          snap.width = mainCanvas.width;
          snap.height = mainCanvas.height;
          const snapCtx = snap.getContext('2d')!;
          snapCtx.drawImage(mainCanvas, 0, 0);
          shots.push(snap);

          if (shotIndex < totalShots) {
            setStripProgress({
              current: shotIndex,
              total: totalShots,
              message: `¡Prepara tu siguiente pose!`,
            });
            await new Promise((r) => setTimeout(r, 1400));
          }
        }

        setStripProgress(null);
        const stripCanvas = composePhotoStrip(shots, frameSettings, eventConfig);
        await processAndUploadCanvas(stripCanvas, 'strip');
      } else if (captureMode === 'collage') {
        const shots: HTMLCanvasElement[] = [];
        const totalShots = 4;

        for (let shotIndex = 1; shotIndex <= totalShots; shotIndex++) {
          setStripProgress({
            current: shotIndex,
            total: totalShots,
            message: `Collage: Pose #${shotIndex} de 4`,
          });

          await runCountdown(3);
          await triggerFlashAndShutter();

          const mainCanvas = canvasRef.current;
          const snap = document.createElement('canvas');
          snap.width = mainCanvas.width;
          snap.height = mainCanvas.height;
          const snapCtx = snap.getContext('2d')!;
          snapCtx.drawImage(mainCanvas, 0, 0);
          shots.push(snap);

          if (shotIndex < totalShots) {
            setStripProgress({
              current: shotIndex,
              total: totalShots,
              message: `¡Prepara tu siguiente pose!`,
            });
            await new Promise((r) => setTimeout(r, 1400));
          }
        }

        setStripProgress(null);
        const collageCanvas = composePhotoCollage2x2(shots, frameSettings, eventConfig);
        await processAndUploadCanvas(collageCanvas, 'collage');
      }
    } finally {
      setIsCapturing(false);
      setStripProgress(null);
    }
  };

  const ensureLandscapeCanvas = (srcCanvas: HTMLCanvasElement): HTMLCanvasElement => {
    if (srcCanvas.width >= srcCanvas.height) {
      return srcCanvas;
    }
    const targetW = 1920;
    const targetH = 1080;
    const landCanvas = document.createElement('canvas');
    landCanvas.width = targetW;
    landCanvas.height = targetH;
    const lCtx = landCanvas.getContext('2d')!;
    lCtx.fillStyle = '#0a0a0a';
    lCtx.fillRect(0, 0, targetW, targetH);

    const scale = Math.min(targetW / srcCanvas.width, targetH / srcCanvas.height);
    const drawW = srcCanvas.width * scale;
    const drawH = srcCanvas.height * scale;
    const dx = (targetW - drawW) / 2;
    const dy = (targetH - drawH) / 2;

    lCtx.drawImage(srcCanvas, dx, dy, drawW, drawH);
    return landCanvas;
  };

  const applyEventTemplate = (theme: 'wedding' | 'party' | 'corporate' | 'xmas') => {
    let title = eventConfig.eventTitle;
    let subtitle = eventConfig.eventSubtitle;
    let accent = eventConfig.accentColor;
    let primary = eventConfig.primaryColor;
    let frameStyle: FrameStyle = 'none';
    let particleEffect: 'snow' | 'glitter' | 'confetti' | 'bokeh' | 'none' = 'none';

    if (theme === 'wedding') {
      title = 'Nuestra Boda';
      subtitle = 'Elegancia & Amor';
      accent = '#d4af37';
      primary = '#f59e0b';
      frameStyle = 'wedding_gold_geom';
      particleEffect = 'glitter';
      setPropsCategoryFilter('wedding');
    } else if (theme === 'party') {
      title = '¡Modo Fiesta!';
      subtitle = 'Celebra con Nosotros';
      accent = '#ec4899';
      primary = '#8b5cf6';
      frameStyle = 'party_balloons';
      particleEffect = 'confetti';
      setPropsCategoryFilter('party');
    } else if (theme === 'corporate') {
      title = 'Graduación & Gala';
      subtitle = 'Clase 2026';
      accent = '#38bdf8';
      primary = '#0284c7';
      frameStyle = 'corp_executive';
      particleEffect = 'bokeh';
      setPropsCategoryFilter('corporate');
    } else if (theme === 'xmas') {
      title = '¡Feliz Navidad!';
      subtitle = 'Mágicos Recuerdos';
      accent = '#ffffff';
      primary = '#ef4444';
      frameStyle = 'xmas_wreath';
      particleEffect = 'snow';
      setPropsCategoryFilter('xmas');
    }

    setEventConfig((prev) => ({
      ...prev,
      activeTheme: theme,
      theme,
      eventTitle: title,
      eventSubtitle: subtitle,
      accentColor: accent,
      primaryColor: primary,
      particleEffect,
    }));

    setFrameSettings((prev) => ({
      ...prev,
      style: frameStyle,
      eventTitle: title,
      eventSubtitle: subtitle,
      accentColor: accent,
    }));

    setParticlesEnabled(true);
    particleSystemRef.current.setEffectType(particleEffect);
    sounds.playCountdownTick(1.2);
  };

  const processAndUploadCanvas = async (
    canvas: HTMLCanvasElement,
    mode: CaptureMode,
    extra?: { isBoomerang?: boolean; boomerangFrames?: string[] }
  ) => {
    const finalCanvas = ensureLandscapeCanvas(canvas);
    // Compresión óptima JPEG a calidad 0.88 (~350 KB por imagen)
    const blob = await new Promise<Blob | null>((resolve) =>
      finalCanvas.toBlob(resolve, 'image/jpeg', 0.88)
    );
    if (!blob) return;

    const localBlobUrl = URL.createObjectURL(blob);
    const recordId = `foto_${Date.now()}`;
    const cleanSessionId = currentSessionId.replace(/^\/+/, '');
    const fileName = `${recordId}.jpg`;

    const uploadResult = await uploadPhotoToSupabase(blob, cleanSessionId, fileName);
    sounds.playApplause();

    const record: CapturedPhotoRecord = {
      id: recordId,
      sessionId: currentSessionId,
      localBlobUrl,
      publicUrl: uploadResult.publicUrl,
      filePath: uploadResult.filePath,
      timestamp: Date.now(),
      mode,
      error: uploadResult.error,
      isBoomerang: extra?.isBoomerang,
      boomerangFrames: extra?.boomerangFrames,
    };

    setSessionPhotos((prev) => [record, ...prev]);
    setCapturedPhotos((prev) => [record, ...prev]);
    setCurrentModalPhoto(record);
    setActivePoseChallenge(null);
  };

  const handleSaveEditedPhoto = async (editedBlob: Blob, editedBlobUrl: string) => {
    if (!currentModalPhoto) return;
    const cleanSessionId = currentSessionId.replace(/^\/+/, '');
    const fileName = `foto_edit_${Date.now()}.jpg`;
    const uploadResult = await uploadPhotoToSupabase(editedBlob, cleanSessionId, fileName);
    const updatedRecord: CapturedPhotoRecord = {
      ...currentModalPhoto,
      localBlobUrl: editedBlobUrl,
      publicUrl: uploadResult.publicUrl,
      filePath: uploadResult.filePath,
      error: uploadResult.error,
    };
    setCurrentModalPhoto(updatedRecord);
    setSessionPhotos((prev) => prev.map((p) => (p.id === currentModalPhoto.id ? updatedRecord : p)));
    setCapturedPhotos((prev) => prev.map((p) => (p.id === currentModalPhoto.id ? updatedRecord : p)));
  };

  const handleNewSession = () => {
    const nextSessionId = `sesion_${Date.now()}`;
    setCurrentSessionId(nextSessionId);
    setSessionPhotos([]);
    setCurrentModalPhoto(null);
    setShowSessionEndModal(false);
    setActiveProps([]);
    setSelectedPropInstanceId(null);
    sounds.playCountdownTick(1.4);
  };

  const handleCustomBackdropUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setChromaSettings((prev) => ({
        ...prev,
        enabled: true,
        customBackdropUrl: url,
      }));
    }
  };

  // Admin Config Save Handler
  const handleSaveAdminConfig = (newConfig: EventConfig) => {
    setEventConfig(newConfig);
    if (typeof window !== 'undefined') {
      localStorage.setItem('photobooth_event_config', JSON.stringify(newConfig));
    }

    // Sync FrameSettings
    setFrameSettings((prev) => ({
      ...prev,
      eventTitle: newConfig.eventTitle,
      eventSubtitle: newConfig.eventSubtitle,
      accentColor: newConfig.accentColor,
      fontFamily: newConfig.fontFamily,
      style: newConfig.activeCustomFrameId ? 'custom' : prev.style,
      customFrameUrl: newConfig.activeCustomFrameId
        ? newConfig.customFrames.find((f) => f.id === newConfig.activeCustomFrameId)?.dataUrl
        : null,
    }));

    // Sync Particles
    particleSystemRef.current.setEffectType(newConfig.particleEffect);

    // Sync Capture Mode fallback if disabled
    if (!newConfig.allowedCaptureModes[captureMode]) {
      if (newConfig.allowedCaptureModes.single) setCaptureMode('single');
      else if (newConfig.allowedCaptureModes.strip) setCaptureMode('strip');
      else if (newConfig.allowedCaptureModes.collage) setCaptureMode('collage');
    }

    setShowAdminModal(false);
  };

  // If in Live Projector Wall mode
  if (isLiveWallMode) {
    return (
      <LivePhotoWall
        eventConfig={eventConfig}
        localPhotos={sessionPhotos}
        onExit={() => setIsLiveWallMode(false)}
        language={language}
      />
    );
  }

  return (
    <div
      className="app-main-layout select-none text-neutral-100 flex flex-col md:flex-row w-screen h-[100dvh] max-h-[100dvh] overflow-hidden relative bg-[#0a0a0a]"
      style={{
        fontFamily: eventConfig.fontFamily,
        backgroundColor: '#0a0a0a',
      }}
    >
      {/* Hidden WebRTC Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="hidden"
      />

      {/* Screen White Flash Effect */}
      {isFlashing && (
        <div className="fixed inset-0 z-[10001] bg-white pointer-events-none animate-flash" />
      )}

      {/* =========================================================================
          ZONA IZQUIERDA: VISTA PREVIA LIMPIA (62% del ancho)
          Espacio dedicado exclusivamente al canvas y la cámara en vivo.
          100% libre de botones, barras o selectores flotantes encima del video.
          ========================================================================= */}
      <section className="camera-viewport-section relative w-full md:w-[62%] min-w-0 h-full flex items-center justify-center bg-black overflow-hidden p-1 sm:p-2.5">
        {/* Error Fallback */}
        {cameraError && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-neutral-950/95 max-w-md mx-auto rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-neutral-100 font-display mb-1">
              Acceso a Cámara Requerido
            </h3>
            <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
              {cameraError}. Conecta tu webcam, capturadora HDMI o autoriza el permiso de cámara en tu navegador.
            </p>
            <button
              onClick={() => startCamera(selectedDeviceId)}
              className="min-h-[44px] px-5 py-2.5 rounded-xl text-white font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg"
              style={{ backgroundColor: eventConfig.buttonColor }}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reintentar Cámara</span>
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {cameraLoading && !cameraError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-neutral-950 rounded-2xl">
            <div
              className="w-10 h-10 border-2 border-neutral-700 rounded-full animate-spin mb-3"
              style={{ borderTopColor: eventConfig.primaryColor }}
            />
            <p className="text-xs text-neutral-400 font-medium">Iniciando cámara en tiempo real...</p>
          </div>
        )}

        {/* Centered Video Viewport Container */}
        <div className="relative w-full h-full flex items-center justify-center">
          <canvas
            ref={canvasRef}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handleCanvasPointerUp}
            className="w-full h-full max-w-full max-h-full object-contain rounded-2xl shadow-2xl cursor-crosshair touch-none border border-neutral-800/80"
          />

          {/* Sutil Indicador: Cuenta Regresiva 3, 2, 1 */}
          {countdownValue !== null && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 pointer-events-none rounded-2xl">
              <div
                className="text-8xl sm:text-9xl font-black font-display drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] animate-countdown"
                style={{ color: eventConfig.accentColor || '#ffffff' }}
              >
                {countdownValue}
              </div>
            </div>
          )}

          {/* Sutil Indicador: Multi-Shot Strip / Collage Progress Banner */}
          {stripProgress && (
            <div
              className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-2xl bg-neutral-950/90 backdrop-blur-md border text-xs sm:text-sm shadow-xl flex items-center gap-2.5 font-semibold font-display pointer-events-none"
              style={{
                borderColor: `${eventConfig.primaryColor}80`,
                color: eventConfig.accentColor,
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full animate-ping"
                style={{ backgroundColor: eventConfig.primaryColor }}
              />
              <span>{stripProgress.message}</span>
              <span className="font-mono text-xs text-neutral-400">
                ({stripProgress.current}/{stripProgress.total})
              </span>
            </div>
          )}

          {/* Sutil Indicador: AR Tracking Status Pill */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-950/70 backdrop-blur-md border border-neutral-800/80 text-[11px] text-neutral-300 pointer-events-none">
            <ScanFace className={`w-3.5 h-3.5 ${faceDetected ? 'text-emerald-400' : 'text-neutral-500'}`} />
            <span>{faceDetected ? 'AR Activo' : 'Buscando Rostro'}</span>
          </div>

          {/* Sutil Indicador: Reto Activo de la Ruleta de Poses */}
          {activePoseChallenge && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-neutral-950/90 border border-amber-400/80 text-amber-300 shadow-xl backdrop-blur-md text-xs font-bold pointer-events-auto">
              <span>{activePoseChallenge.emoji}</span>
              <span className="text-white truncate max-w-[260px]">RETO: {activePoseChallenge.title}</span>
              <button
                onClick={() => setActivePoseChallenge(null)}
                className="p-1 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer ml-1"
                title="Quitar reto"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Prop Selection Floating Toolbar (solo si se seleccionó un prop manualmente) */}
          {selectedPropInstanceId && !isCapturing && (
            <div className="absolute top-4 left-4 z-30 flex items-center gap-1 p-1 rounded-xl bg-neutral-950/90 backdrop-blur-md border border-neutral-800 shadow-xl pointer-events-auto">
              <button
                onClick={() => scaleSelectedProp(0.1)}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 transition-colors cursor-pointer"
                title="Aumentar Tamaño"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => scaleSelectedProp(-0.1)}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 transition-colors cursor-pointer"
                title="Reducir Tamaño"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => rotateSelectedProp(15)}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 transition-colors cursor-pointer"
                title="Rotar 15°"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={removeSelectedProp}
                className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 transition-colors cursor-pointer"
                title="Eliminar Accesorio"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          ZONA DERECHA: PANEL DE CONTROL Y ACCIONES (38% del ancho)
          Columna lateral espaciosa para Tablet y Laptop con Cuadrícula CSS (3 columnas).
          ========================================================================= */}
      <aside
        className="kiosk-right-panel w-full md:w-[38%] md:min-w-[400px] md:max-w-[520px] h-full flex flex-col bg-[#121212] border-t md:border-t-0 md:border-l border-neutral-800/80 text-neutral-100 z-10 shrink-0 select-none shadow-2xl justify-between overflow-hidden"
        style={{
          backgroundColor: '#121212',
        }}
      >
        {/* ----------------- PARTE SUPERIOR: CABECERA & CONFIGURACIÓN ----------------- */}
        <div className="p-3 border-b border-neutral-800/80 bg-neutral-950/70 shrink-0 space-y-2.5">
          {/* Fila 1: Marca, Selector de Cámara, Espejo, Admin y Utilidades */}
          <div className="flex items-center justify-between gap-1.5">
            {/* Brand Logo & Title (Triple tap shortcut for PIN 1234) */}
            <div
              onClick={handleBrandLogoClick}
              className="flex items-center gap-2 min-w-0 cursor-pointer select-none group"
              title="Toca 3 veces para abrir el Panel de Administrador"
            >
              <div
                className="w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-active:scale-95 shadow-sm"
                style={{
                  backgroundColor: `${eventConfig.primaryColor}25`,
                  borderColor: `${eventConfig.primaryColor}55`,
                  color: eventConfig.primaryColor,
                }}
              >
                <Gift className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-bold tracking-tight text-neutral-100 font-display truncate block max-w-[110px] sm:max-w-[130px]">
                  {eventConfig.eventTitle || 'SnapKiosk'}
                </span>
              </div>
            </div>

            {/* Quick Actions Toolbar */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Camera Selector Dropdown */}
              <div className="relative flex items-center">
                <select
                  value={selectedDeviceId}
                  onChange={(e) => handleDeviceSelect(e.target.value)}
                  className="appearance-none h-8 bg-neutral-900 hover:bg-neutral-850 text-neutral-200 text-[11px] font-medium pl-6 pr-5 rounded-lg border border-neutral-800 focus:outline-none transition-colors cursor-pointer max-w-[105px] sm:max-w-[130px] truncate"
                >
                  {devices.length === 0 ? (
                    <option value="">Cámara</option>
                  ) : (
                    devices.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label}
                      </option>
                    ))
                  )}
                </select>
                <Video className="w-3 h-3 text-neutral-400 absolute left-2 pointer-events-none" />
                <ChevronDown className="w-2.5 h-2.5 text-neutral-400 absolute right-1.5 pointer-events-none" />
              </div>

              {/* Mirror Toggle */}
              <button
                onClick={() => setIsMirrored((prev) => !prev)}
                className={`h-8 w-8 rounded-lg text-xs font-medium border transition-colors flex items-center justify-center cursor-pointer ${
                  isMirrored
                    ? 'bg-neutral-800 border-neutral-700 text-cyan-400'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
                title="Efecto Espejo"
                aria-label="Mirror Camera"
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
              </button>

              {/* Fullscreen & Lock Landscape */}
              <button
                onClick={toggleFullscreen}
                className="h-8 w-8 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                title="Pantalla Completa Horizontal"
                aria-label="Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Audio Mute Toggle */}
              <button
                onClick={toggleMute}
                className="h-8 w-8 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors flex items-center justify-center cursor-pointer"
                title={isAudioMuted ? 'Activar Sonido' : 'Silenciar'}
                aria-label="Toggle Sound"
              >
                {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {/* Live Photo Wall Button */}
              <button
                onClick={() => setIsLiveWallMode(true)}
                className="h-8 w-8 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-red-400 transition-colors flex items-center justify-center cursor-pointer"
                title="Muro en Vivo para Proyector"
                aria-label="Live Wall"
              >
                <Tv className="w-3.5 h-3.5" />
              </button>

              {/* Discrete Admin Gear Button (PIN 1234) */}
              <button
                onClick={() => setShowPinModal(true)}
                className="h-8 w-8 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 transition-all flex items-center justify-center cursor-pointer"
                title="Panel de Administrador (PIN 1234)"
                aria-label="Admin Settings"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Fila 2: Selector Rápido de Plantilla de Evento (Cuadrícula limpia de 4 chips) */}
          <div className="space-y-1 event-template-row">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Plantilla de Evento
              </span>
              <span className="text-[10px] text-amber-400/90 font-medium">
                Carga marcos y props
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'wedding', label: 'Boda', emoji: '💍', color: '#f59e0b' },
                { id: 'party', label: 'Fiesta', emoji: '🎉', color: '#ec4899' },
                { id: 'corporate', label: 'Grad', emoji: '🎓', color: '#38bdf8' },
                { id: 'xmas', label: 'Navidad', emoji: '🎄', color: '#ef4444' },
              ].map((tpl) => {
                const isActive = (eventConfig.theme || eventConfig.activeTheme) === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => applyEventTemplate(tpl.id as any)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shrink-0 transition-all cursor-pointer border ${
                      isActive
                        ? 'text-neutral-950 shadow-md font-black scale-[1.02] border-transparent'
                        : 'text-neutral-400 hover:text-neutral-200 bg-neutral-900/90 border-neutral-800 hover:border-neutral-700'
                    }`}
                    style={isActive ? { backgroundColor: tpl.color } : {}}
                    title={`Plantilla ${tpl.label}`}
                  >
                    <span className="text-sm">{tpl.emoji}</span>
                    <span className="truncate">{tpl.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ----------------- NAVEGACIÓN POR PESTAÑAS (Props AR | Marcos | Filtros) ----------------- */}
        <div className="px-3 pt-2.5 pb-1 bg-[#121212] shrink-0">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
            {[
              { id: 'props', label: 'Props AR', icon: '🎭' },
              { id: 'frames_chroma', label: 'Marcos', icon: '🖼️' },
              { id: 'filters', label: 'Filtros', icon: '🎨' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSidebarTab(tab.id as SidebarTab)}
                className={`py-2 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  sidebarTab === tab.id
                    ? 'bg-neutral-800 text-amber-300 shadow-md border border-neutral-700 font-extrabold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850/50'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ----------------- ZONA CENTRAL: CUADRÍCULA AMPLIA (CSS GRID 3 COLUMNAS) ----------------- */}
        <div className="items-grid-container flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
          {/* TAB 1: PROPS FACIALES AR */}
          {sidebarTab === 'props' && (
            <div className="space-y-3">
              {/* Filtros de Categorías y Acción de Resetear */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 props-categories-row">
                <div className="flex flex-wrap items-center gap-1">
                  {[
                    { id: 'all', label: '✨ Todos' },
                    { id: 'wedding', label: '💍 Boda' },
                    { id: 'party', label: '🎉 Fiesta' },
                    { id: 'corporate', label: '🎓 Grad' },
                    { id: 'xmas', label: '🎄 Navidad' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setPropsCategoryFilter(cat.id as PropsCategoryFilter)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer border ${
                        propsCategoryFilter === cat.id
                          ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-sm font-black'
                          : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border-neutral-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {activeProps.length > 0 && (
                  <button
                    onClick={() => {
                      setActiveProps([]);
                      setSelectedPropInstanceId(null);
                    }}
                    className="px-2.5 py-1 rounded-xl text-[10px] font-bold text-red-400 hover:text-red-300 bg-red-950/40 border border-red-800/60 transition-colors cursor-pointer"
                    title="Quitar todos los accesorios activos"
                  >
                    Quitar todos ({activeProps.length})
                  </button>
                )}
              </div>

              {/* Cuadrícula Vertical de 3 Columnas para Props AR */}
              <div className="items-grid grid grid-cols-3 gap-3 content-start">
                {/* Tarjeta de Acción: Ninguno / Deseleccionar */}
                <button
                  onClick={() => {
                    setActiveProps([]);
                    setSelectedPropInstanceId(null);
                  }}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center justify-between min-h-[108px] transition-all cursor-pointer text-center ${
                    activeProps.length === 0
                      ? 'bg-neutral-800/90 border-neutral-600 text-white shadow-md ring-2 ring-neutral-500/40'
                      : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                  title="Sin accesorios (quitar todos)"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-neutral-950/80 text-neutral-400 my-auto">
                    <Ban className="w-6 h-6 text-neutral-400" />
                  </div>
                  <span className="text-[11px] font-bold leading-tight block">Ninguno</span>
                </button>

                {/* Items de Props en la Cuadrícula */}
                {allAvailableProps
                  .filter((prop) => {
                    if (propsCategoryFilter === 'all') return true;
                    if (propsCategoryFilter === 'wedding') return prop.category === 'wedding';
                    if (propsCategoryFilter === 'party') return prop.category === 'party';
                    if (propsCategoryFilter === 'corporate') return prop.category === 'corporate';
                    if (propsCategoryFilter === 'xmas') return prop.category === 'xmas';
                    return true;
                  })
                  .map((prop) => {
                    const isActive = activeProps.some((p) => p.propId === prop.id);
                    const customPropItem = eventConfig.customProps.find((cp) => cp.id === prop.id);

                    return (
                      <button
                        key={prop.id}
                        onClick={() => addProp(prop.id)}
                        className={`p-2.5 rounded-2xl border flex flex-col items-center justify-between min-h-[108px] transition-all cursor-pointer active:scale-95 text-center relative group ${
                          isActive
                            ? 'bg-neutral-850 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.25)] ring-2 ring-amber-400/60 scale-[1.02]'
                            : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:bg-neutral-850'
                        }`}
                        title={isActive ? `${prop.name} (Activo - Clic para quitar)` : prop.name}
                      >
                        {isActive && (
                          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center text-[10px] font-black shadow">
                            ✓
                          </span>
                        )}
                        <div className="w-12 h-12 flex items-center justify-center pointer-events-none overflow-hidden my-auto">
                          {customPropItem ? (
                            <img
                              src={customPropItem.dataUrl}
                              alt={prop.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center"
                              dangerouslySetInnerHTML={{ __html: prop.svg }}
                            />
                          )}
                        </div>
                        <span className="text-[11px] font-bold leading-tight truncate max-w-full block w-full mt-1">
                          {prop.name}
                        </span>
                      </button>
                    );
                  })}
              </div>

              {/* Packs Rápidos Temáticos */}
              <div className="pt-2 border-t border-neutral-800/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                  Combos Rápidos:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => applyXmasCombo('santa')}
                    className="p-2 rounded-xl bg-red-950/40 border border-red-800/60 hover:border-red-500 text-[11px] font-bold text-red-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:bg-red-900/40 text-center"
                  >
                    <span>🎅</span> <span>Santa</span>
                  </button>
                  <button
                    onClick={() => applyXmasCombo('reindeer')}
                    className="p-2 rounded-xl bg-amber-950/40 border border-amber-800/60 hover:border-amber-500 text-[11px] font-bold text-amber-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:bg-amber-900/40 text-center"
                  >
                    <span>🦌</span> <span>Reno</span>
                  </button>
                  <button
                    onClick={() => applyXmasCombo('festive')}
                    className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/60 hover:border-emerald-500 text-[11px] font-bold text-emerald-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:bg-emerald-900/40 text-center"
                  >
                    <span>🎄</span> <span>Árbol</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MARCOS Y FONDOS CHROMA */}
          {sidebarTab === 'frames_chroma' && (
            <div className="space-y-3">
              {/* Selector de Sub-pestaña */}
              <div className="flex items-center p-0.5 bg-neutral-900 rounded-xl border border-neutral-800">
                <button
                  onClick={() => setChromaOrFramesView('frames')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    chromaOrFramesView === 'frames'
                      ? 'bg-amber-500 text-neutral-950 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  🖼️ Marcos de Foto
                </button>
                <button
                  onClick={() => setChromaOrFramesView('chroma')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    chromaOrFramesView === 'chroma'
                      ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  🟢 Pantalla Verde
                </button>
              </div>

              {chromaOrFramesView === 'frames' && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    Elige un estilo de marco:
                  </span>
                  {/* Cuadrícula Vertical de 3 Columnas para Marcos */}
                  <div className="items-grid grid grid-cols-3 gap-3 content-start">
                    {/* Tarjeta: Sin Marco */}
                    <button
                      onClick={() => setFrameSettings((prev) => ({ ...prev, style: 'none' }))}
                      className={`p-2.5 rounded-2xl border flex flex-col items-center justify-between min-h-[105px] transition-all cursor-pointer text-center ${
                        frameSettings.style === 'none'
                          ? 'bg-neutral-800/90 border-neutral-600 text-white shadow-md ring-2 ring-neutral-500/40'
                          : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                      }`}
                      title="Sin Marco"
                    >
                      <div className="w-12 h-10 rounded-lg border border-dashed border-neutral-600 flex items-center justify-center bg-neutral-950/60 my-auto">
                        <Ban className="w-5 h-5 text-neutral-500" />
                      </div>
                      <span className="text-[11px] font-bold leading-tight block">Sin Marco</span>
                    </button>

                    {/* Marcos Estándar */}
                    {[
                      { id: 'wedding_gold_geom', label: 'Boda Oro', icon: '💍', cat: 'Boda' },
                      { id: 'wedding_ivory', label: 'Boda Marfil', icon: '💍', cat: 'Boda' },
                      { id: 'party_balloons', label: 'Globos', icon: '🎉', cat: 'Fiesta' },
                      { id: 'party_polaroid', label: 'Polaroid', icon: '📸', cat: 'Fiesta' },
                      { id: 'corp_executive', label: 'Grad Azul', icon: '🎓', cat: 'Grad' },
                      { id: 'corp_modern', label: 'Biselado', icon: '🎓', cat: 'Grad' },
                      { id: 'xmas_wreath', label: 'Guirnalda', icon: '🎄', cat: 'Navidad' },
                      { id: 'xmas_postcard', label: 'Postal', icon: '✉️', cat: 'Navidad' },
                      { id: 'minimal', label: 'Minimal', icon: '◻️', cat: 'General' },
                    ].map((f) => {
                      const isSelected = frameSettings.style === f.id;
                      return (
                        <button
                          key={f.id}
                          onClick={() =>
                            setFrameSettings((prev) => ({ ...prev, style: f.id as FrameStyle }))
                          }
                          className={`p-2.5 rounded-2xl border flex flex-col items-center justify-between min-h-[105px] transition-all cursor-pointer text-center relative ${
                            isSelected
                              ? 'bg-neutral-850 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.25)] ring-2 ring-amber-400/60 scale-[1.02]'
                              : 'bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-850'
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center text-[10px] font-black shadow">
                              ✓
                            </span>
                          )}
                          <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">
                            {f.cat}
                          </span>
                          <span className="text-2xl my-auto">{f.icon}</span>
                          <span className="text-[11px] font-bold leading-tight truncate w-full block">
                            {f.label}
                          </span>
                        </button>
                      );
                    })}

                    {/* Marcos personalizados subidos en Admin */}
                    {eventConfig.customFrames.map((frame) => {
                      const isSelected =
                        frameSettings.style === 'custom' && frameSettings.customFrameUrl === frame.dataUrl;
                      return (
                        <button
                          key={frame.id}
                          onClick={() =>
                            setFrameSettings((prev) => ({
                              ...prev,
                              style: 'custom',
                              customFrameUrl: frame.dataUrl,
                            }))
                          }
                          className={`p-2.5 rounded-2xl border flex flex-col items-center justify-between min-h-[105px] transition-all cursor-pointer text-center relative ${
                            isSelected
                              ? 'bg-neutral-850 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.25)] ring-2 ring-amber-400/60 scale-[1.02]'
                              : 'bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center text-[10px] font-black shadow">
                              ✓
                            </span>
                          )}
                          <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold">
                            Evento
                          </span>
                          <img
                            src={frame.dataUrl}
                            alt={frame.name}
                            className="w-12 h-10 object-contain my-auto"
                          />
                          <span className="text-[11px] font-bold leading-tight truncate w-full block">
                            {frame.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {chromaOrFramesView === 'chroma' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800">
                    <span className="text-xs font-semibold text-neutral-200">
                      Activar Pantalla Verde:
                    </span>
                    <button
                      onClick={() =>
                        setChromaSettings((prev) => ({ ...prev, enabled: !prev.enabled }))
                      }
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        chromaSettings.enabled
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {chromaSettings.enabled ? 'Activado' : 'Desactivado'}
                    </button>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    Fondos Virtuales:
                  </span>
                  {/* Cuadrícula de Fondos Virtuales */}
                  <div className="items-grid grid grid-cols-3 gap-3 content-start">
                    {/* Tarjeta: Desactivado */}
                    <button
                      onClick={() =>
                        setChromaSettings((prev) => ({ ...prev, enabled: false }))
                      }
                      className={`p-2.5 rounded-2xl border flex flex-col items-center justify-between min-h-[105px] transition-all cursor-pointer text-center ${
                        !chromaSettings.enabled
                          ? 'bg-neutral-800/90 border-neutral-600 text-white shadow-md ring-2 ring-neutral-500/40'
                          : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                      }`}
                    >
                      <div className="w-12 h-10 rounded-lg border border-dashed border-neutral-600 flex items-center justify-center bg-neutral-950/60 my-auto">
                        <Ban className="w-5 h-5 text-neutral-500" />
                      </div>
                      <span className="text-[11px] font-bold leading-tight block">Sin Fondo</span>
                    </button>

                    {BACKDROP_PRESETS.map((p) => {
                      const isSelected =
                        chromaSettings.enabled &&
                        !chromaSettings.customBackdropUrl &&
                        chromaSettings.backdropId === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() =>
                            setChromaSettings((prev) => ({
                              ...prev,
                              backdropId: p.id,
                              customBackdropUrl: null,
                              enabled: true,
                            }))
                          }
                          className={`p-2.5 rounded-2xl border text-center flex flex-col items-center justify-between min-h-[105px] transition-all cursor-pointer relative ${
                            isSelected
                              ? 'border-amber-400 bg-neutral-850 ring-2 ring-amber-400/60 shadow-[0_0_15px_rgba(251,191,36,0.25)] text-amber-200 scale-[1.02]'
                              : 'border-neutral-800 bg-neutral-900/80 hover:border-neutral-700 text-neutral-300'
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center text-[10px] font-black shadow">
                              ✓
                            </span>
                          )}
                          <div
                            className="w-full h-11 rounded-xl overflow-hidden flex items-center justify-center bg-neutral-950 my-auto"
                            dangerouslySetInnerHTML={{ __html: p.thumbnailSvg }}
                          />
                          <span className="text-[11px] font-bold leading-tight truncate w-full block mt-1">
                            {p.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-1 bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
                    <div className="flex justify-between text-[11px] text-neutral-300">
                      <span>Tolerancia de Verde</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {Math.round(chromaSettings.tolerance * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="0.6"
                      step="0.01"
                      value={chromaSettings.tolerance}
                      onChange={(e) =>
                        setChromaSettings((prev) => ({
                          ...prev,
                          tolerance: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full accent-emerald-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FILTROS DE COLOR Y EFECTOS EN VIVO */}
          {sidebarTab === 'filters' && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                  Filtros de Color:
                </span>
                {/* Cuadrícula de 3 Columnas para Filtros de Color */}
                <div className="items-grid grid grid-cols-3 gap-3 content-start">
                  {[
                    { id: 'normal', name: 'Original', icon: '🌈' },
                    { id: 'glam', name: 'Glam Cam ✨', icon: '💎' },
                    { id: 'bw', name: 'B&W', icon: '🖤' },
                    { id: 'sepia', name: 'Sepia', icon: '📜' },
                    { id: 'cyberpunk', name: 'Cyberpunk', icon: '⚡' },
                    { id: 'vibrant', name: 'Vibrant Pop', icon: '💥' },
                    { id: 'polaroid', name: 'Polaroid', icon: '📸' },
                  ].map((f) => {
                    const isSelected = colorFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setColorFilter(f.id as ColorFilter)}
                        className={`p-2.5 rounded-2xl border flex flex-col items-center justify-between min-h-[95px] transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-neutral-850 border-amber-400 text-amber-300 font-bold ring-2 ring-amber-400/60 shadow-[0_0_15px_rgba(251,191,36,0.25)] scale-[1.02]'
                            : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center text-[10px] font-black shadow">
                            ✓
                          </span>
                        )}
                        <span className="text-2xl my-auto">{f.icon}</span>
                        <span className="text-[11px] font-bold truncate block w-full text-center">
                          {f.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Efectos de Partículas en Vivo */}
              <div className="pt-2 border-t border-neutral-800/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                  Efecto de Partículas en Vivo:
                </span>
                <div className="items-grid grid grid-cols-3 gap-3 content-start">
                  {[
                    { id: 'none', label: 'Sin Efecto', icon: '🚫', desc: 'Desactivado' },
                    { id: 'glitter', label: 'Destellos', icon: '✨', desc: 'Glitter Oro' },
                    { id: 'confetti', label: 'Confeti', icon: '🎊', desc: 'Multicolor' },
                    { id: 'bokeh', label: 'Bokeh', icon: '💫', desc: 'Plateado' },
                    { id: 'snow', label: 'Nieve', icon: '❄️', desc: 'Realista' },
                  ].map((ef) => {
                    const isSelected = particlesEnabled && eventConfig.particleEffect === ef.id;
                    const isNone = !particlesEnabled || eventConfig.particleEffect === 'none';
                    const active = ef.id === 'none' ? isNone : isSelected;

                    return (
                      <button
                        key={ef.id}
                        onClick={() => {
                          if (ef.id === 'none') {
                            setParticlesEnabled(false);
                            particleSystemRef.current.setEffectType('none');
                          } else {
                            setParticlesEnabled(true);
                            setEventConfig((prev) => ({ ...prev, particleEffect: ef.id as any }));
                            particleSystemRef.current.setEffectType(ef.id as any);
                          }
                        }}
                        className={`p-2.5 rounded-2xl border text-center flex flex-col items-center justify-between min-h-[95px] transition-all cursor-pointer relative ${
                          active
                            ? 'bg-neutral-850 border-amber-400 text-amber-300 font-bold ring-2 ring-amber-400/60 shadow-[0_0_15px_rgba(251,191,36,0.25)] scale-[1.02]'
                            : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {active && (
                          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center text-[10px] font-black shadow">
                            ✓
                          </span>
                        )}
                        <span className="text-2xl my-auto">{ef.icon}</span>
                        <div>
                          <span className="text-[11px] font-bold block">{ef.label}</span>
                          <span className="text-[9px] text-neutral-500 block truncate mt-0.5">
                            {ef.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ----------------- ZONA INFERIOR: CONTROLES DE CAPTURA & OBTURADOR ----------------- */}
        <div className="capture-controls-panel p-3 border-t border-neutral-800/80 bg-neutral-950/90 shrink-0 space-y-2.5">
          {/* Botones de Modo: Foto, Ráfaga, Boomerang, Ruleta de Poses */}
          <div className="modes-selector-group grid grid-cols-4 gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
            {/* 1. Foto */}
            <button
              onClick={() => setCaptureMode('single')}
              className={`py-2 px-1 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                captureMode === 'single'
                  ? 'text-white shadow-md font-black'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              style={captureMode === 'single' ? { backgroundColor: eventConfig.buttonColor || '#ff2d55' } : {}}
              title="Modo Foto Clásica"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Foto</span>
            </button>

            {/* 2. Ráfaga */}
            <button
              onClick={() => {
                if (captureMode === 'strip') {
                  setCaptureMode('life4cuts');
                } else if (captureMode === 'life4cuts') {
                  setCaptureMode('collage');
                } else {
                  setCaptureMode('strip');
                }
              }}
              className={`py-2 px-1 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                captureMode === 'strip' || captureMode === 'life4cuts' || captureMode === 'collage'
                  ? 'text-white shadow-md font-black bg-amber-600'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title={
                captureMode === 'life4cuts'
                  ? 'Ráfaga: Life4Cuts (clic para Collage)'
                  : captureMode === 'collage'
                  ? 'Ráfaga: Collage (clic para Tira 3x)'
                  : 'Ráfaga: Tira 3x (clic para Life4Cuts)'
              }
            >
              <Columns className="w-3.5 h-3.5" />
              <span>
                {captureMode === 'life4cuts'
                  ? 'Life4'
                  : captureMode === 'collage'
                  ? 'Collage'
                  : 'Ráfaga'}
              </span>
            </button>

            {/* 3. Boomerang */}
            <button
              onClick={() => setCaptureMode('boomerang')}
              className={`py-2 px-1 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                captureMode === 'boomerang'
                  ? 'text-white shadow-md font-black bg-pink-600'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Modo Boomerang en Bucle"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Boomerang</span>
            </button>

            {/* 4. Ruleta de Poses */}
            <button
              onClick={() => setShowPoseRouletteModal(true)}
              className={`py-2 px-1 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                activePoseChallenge
                  ? 'bg-amber-500 text-neutral-950 font-black shadow-md border border-amber-400'
                  : 'text-amber-300 hover:text-amber-200 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 active:scale-95'
              }`}
              title="Girar Ruleta de Poses"
            >
              <Dices className="w-3.5 h-3.5 text-current animate-pulse" />
              <span>Ruleta</span>
            </button>
          </div>

          {/* BOTÓN DE CAPTURA / OBTURADOR PRINCIPAL GRANDE, CENTRADO Y VISIBLE SIEMPRE */}
          <div className="shutter-btn-wrapper flex items-center justify-center py-1">
            <button
              onClick={triggerCapture}
              disabled={isCapturing || !streamActive}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: eventConfig.buttonColor || '#ff2d55',
                border: '4px solid #ffffff',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6), 0 0 24px rgba(255,45,85,0.45)',
              }}
              className={`shutter-btn flex items-center justify-center cursor-pointer transition-transform active:scale-90 ${
                isCapturing ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'
              }`}
              title="Tomar Foto"
              aria-label="Capturar Foto"
            >
              <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-tr from-black/25 to-white/35">
                <Camera className="w-9 h-9 text-white drop-shadow" />
              </div>
            </button>
          </div>

          {/* Barra Inferior: Contador de Sesión & Finalizar / Galería */}
          <div className="session-footer-row flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {sessionPhotos.length} {sessionPhotos.length === 1 ? 'foto' : 'fotos'}
              </span>
            </div>

            {sessionPhotos.length > 0 ? (
              <button
                onClick={() => setShowSessionEndModal(true)}
                className="px-3 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
                style={{ backgroundColor: eventConfig.buttonColor || '#ff2d55' }}
              >
                <FolderDown className="w-3.5 h-3.5" />
                <span>Finalizar Sesión ({sessionPhotos.length})</span>
              </button>
            ) : (
              <button
                onClick={() => setShowGalleryModal(true)}
                className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Galería</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ----------------- ADMIN SECURITY PIN MODAL ----------------- */}
      {showPinModal && (
        <AdminPinModal
          correctPin={eventConfig.adminPin}
          onSuccess={() => {
            setShowPinModal(false);
            setShowAdminModal(true);
          }}
          onClose={() => setShowPinModal(false)}
        />
      )}

      {/* ----------------- FULL EVENT CUSTOMIZER ADMIN MODAL ----------------- */}
      {showAdminModal && (
        <AdminPanelModal
          config={eventConfig}
          onSave={handleSaveAdminConfig}
          onClose={() => setShowAdminModal(false)}
          onLaunchLiveWall={() => {
            setShowAdminModal(false);
            setIsLiveWallMode(true);
          }}
        />
      )}

      {/* ----------------- MODALS ----------------- */}
      {/* 1. Modal tras toma de foto individual */}
      {currentModalPhoto && (
        <CaptureModal
          photo={currentModalPhoto}
          sessionPhotosCount={sessionPhotos.length}
          enableEditor={eventConfig.enableStickersAndDrawing !== false}
          onOpenEditor={() => setShowPhotoEditorModal(true)}
          onClose={() => setCurrentModalPhoto(null)}
          onTakeAnother={() => setCurrentModalPhoto(null)}
          onFinishSession={() => {
            setCurrentModalPhoto(null);
            setShowSessionEndModal(true);
          }}
          onRetake={() => {
            if (currentModalPhoto) {
              setSessionPhotos((prev) => prev.filter((p) => p.id !== currentModalPhoto.id));
              setCapturedPhotos((prev) => prev.filter((p) => p.id !== currentModalPhoto.id));
            }
            setCurrentModalPhoto(null);
          }}
        />
      )}

      {/* 2. Pantalla Final de Sesión Grupal */}
      {showSessionEndModal && (
        <SessionEndModal
          sessionId={currentSessionId}
          sessionPhotos={sessionPhotos}
          onClose={() => setShowSessionEndModal(false)}
          onNewSession={handleNewSession}
          onDeletePhoto={(id) => {
            setSessionPhotos((prev) => prev.filter((p) => p.id !== id));
            setCapturedPhotos((prev) => prev.filter((p) => p.id !== id));
          }}
          onSelectSinglePhoto={(photo) => {
            setCurrentModalPhoto(photo);
          }}
        />
      )}

      {/* 3. Galería de Fotos Recientes */}
      {showGalleryModal && (
        <RecentGalleryModal
          photos={capturedPhotos}
          onSelectPhoto={(photo) => {
            setCurrentModalPhoto(photo);
            setShowGalleryModal(false);
          }}
          onDeletePhoto={(id) => {
            setCapturedPhotos((prev) => prev.filter((p) => p.id !== id));
            setSessionPhotos((prev) => prev.filter((p) => p.id !== id));
          }}
          onClose={() => setShowGalleryModal(false)}
          onClearAll={() => {
            setCapturedPhotos([]);
            setSessionPhotos([]);
          }}
        />
      )}

      {/* 4. Editor de Dibujo Táctil y Stickers estilo Instagram Stories */}
      {showPhotoEditorModal && currentModalPhoto && (
        <PhotoEditorModal
          photo={currentModalPhoto}
          isOpen={showPhotoEditorModal}
          onClose={() => setShowPhotoEditorModal(false)}
          onSaveEditedPhoto={handleSaveEditedPhoto}
        />
      )}

      {/* 5. Ruleta de Poses Rompehielos */}
      {showPoseRouletteModal && (
        <PoseRouletteModal
          isOpen={showPoseRouletteModal}
          onClose={() => setShowPoseRouletteModal(false)}
          onAcceptChallenge={(challenge) => {
            setActivePoseChallenge(challenge);
            setShowPoseRouletteModal(false);
            setTimeout(() => {
              triggerCapture();
            }, 300);
          }}
        />
      )}
    </div>
  );
}
