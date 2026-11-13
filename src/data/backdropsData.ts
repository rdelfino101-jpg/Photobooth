/**
 * Preset high-fidelity backdrops for Chroma Keying.
 * Includes complete Christmas suite and celebration backdrops.
 */

export interface BackdropPreset {
  id: string;
  name: string;
  category: string;
  thumbnailSvg: string;
  render: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
}

export const BACKDROP_PRESETS: BackdropPreset[] = [
  // ==========================================
  // SUITE NAVIDEÑA (CHRISTMAS THEME SUITE)
  // ==========================================
  {
    id: 'xmas_fireplace',
    name: 'Chimenea & Árbol',
    category: 'Navidad',
    thumbnailSvg: `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="70" fill="#1c0e0b" />
      <!-- Fireplace arch -->
      <rect x="50" y="30" width="42" height="40" fill="#451a03" rx="4" />
      <path d="M58 70 L58 50 Q71 38 84 50 L84 70 Z" fill="#000000" />
      <!-- Fire glow -->
      <circle cx="71" cy="62" r="12" fill="#ea580c" opacity="0.8" />
      <circle cx="71" cy="60" r="7" fill="#facc15" opacity="0.9" />
      <!-- Tree on left -->
      <polygon points="25,12 10,48 40,48" fill="#14532d" />
      <polygon points="25,28 6,65 44,65" fill="#166534" />
      <circle cx="25" cy="12" r="3" fill="#facc15" />
      <circle cx="16" cy="38" r="2" fill="#ef4444" />
      <circle cx="32" cy="50" r="2.5" fill="#38bdf8" />
    </svg>`,
    render: (ctx, width, height) => {
      // Warm cozy living room wall gradient
      const wallGrad = ctx.createLinearGradient(0, 0, width, height);
      wallGrad.addColorStop(0, '#1a0b07');
      wallGrad.addColorStop(0.5, '#2e1008');
      wallGrad.addColorStop(1, '#120704');
      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 0, width, height);

      // Wooden floor
      const floorGrad = ctx.createLinearGradient(0, height * 0.72, 0, height);
      floorGrad.addColorStop(0, '#3f1d0b');
      floorGrad.addColorStop(1, '#1e0c04');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, height * 0.72, width, height * 0.28);

      // Christmas Tree on left
      const tx = width * 0.22;
      const ty = height * 0.15;
      const tw = width * 0.28;
      const th = height * 0.62;

      // Tree layers
      const treeLayers = [
        { y: ty, h: th * 0.35, w: tw * 0.45 },
        { y: ty + th * 0.2, h: th * 0.42, w: tw * 0.75 },
        { y: ty + th * 0.45, h: th * 0.55, w: tw },
      ];
      ctx.fillStyle = '#14532d';
      treeLayers.forEach((l, i) => {
        ctx.fillStyle = i % 2 === 0 ? '#14532d' : '#166534';
        ctx.beginPath();
        ctx.moveTo(tx, l.y);
        ctx.lineTo(tx - l.w / 2, l.y + l.h);
        ctx.lineTo(tx + l.w / 2, l.y + l.h);
        ctx.closePath();
        ctx.fill();
      });

      // Tree Lights & Ornaments
      const lights = [
        { x: tx - 25, y: ty + 60, c: '#facc15' },
        { x: tx + 30, y: ty + 80, c: '#ef4444' },
        { x: tx - 50, y: ty + 140, c: '#38bdf8' },
        { x: tx + 45, y: ty + 160, c: '#facc15' },
        { x: tx - 70, y: ty + 220, c: '#ec4899' },
        { x: tx + 60, y: ty + 230, c: '#facc15' },
        { x: tx, y: ty + 120, c: '#ef4444' },
      ];
      lights.forEach(l => {
        ctx.fillStyle = l.c;
        ctx.beginPath();
        ctx.arc(l.x, l.y, 6, 0, Math.PI * 2);
        ctx.fill();
        // Glow
        ctx.fillStyle = l.c;
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(l.x, l.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Gold Star on Top
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(tx, ty - 6, 14, 0, Math.PI * 2);
      ctx.fill();

      // Fireplace on right
      const fx = width * 0.72;
      const fw = width * 0.34;
      const fh = height * 0.52;
      const fy = height * 0.42;

      // Mantle & brick border
      ctx.fillStyle = '#451a03';
      ctx.fillRect(fx - fw / 2, fy, fw, fh);
      ctx.fillStyle = '#5c2406';
      ctx.fillRect(fx - fw / 2 - 15, fy - 18, fw + 30, 22);

      // Fireplace hearth cavity
      ctx.fillStyle = '#0a0402';
      ctx.beginPath();
      ctx.roundRect(fx - fw * 0.35, fy + 40, fw * 0.7, fh - 40, [16, 16, 0, 0]);
      ctx.fill();

      // Warm Fireplace Glow
      const fireRad = ctx.createRadialGradient(fx, fy + fh * 0.75, 10, fx, fy + fh * 0.75, fw * 0.6);
      fireRad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
      fireRad.addColorStop(0.3, 'rgba(249, 115, 22, 0.7)');
      fireRad.addColorStop(0.7, 'rgba(220, 38, 38, 0.3)');
      fireRad.addColorStop(1, 'transparent');
      ctx.fillStyle = fireRad;
      ctx.fillRect(fx - fw * 0.45, fy + 20, fw * 0.9, fh);

      // Overall Room Ambient Warmth
      const ambient = ctx.createRadialGradient(fx, fy + fh * 0.7, 50, width * 0.5, height * 0.5, width * 0.8);
      ambient.addColorStop(0, 'rgba(245, 158, 11, 0.15)');
      ambient.addColorStop(1, 'transparent');
      ctx.fillStyle = ambient;
      ctx.fillRect(0, 0, width, height);
    },
  },
  {
    id: 'xmas_winter_village',
    name: 'Villa Invernal Nevada',
    category: 'Navidad',
    thumbnailSvg: `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="70" fill="#091326" />
      <circle cx="82" cy="18" r="10" fill="#fef08a" opacity="0.85" />
      <!-- Snowy hills -->
      <path d="M0 45 Q 40 38, 70 48 Q 90 52, 100 45 L 100 70 L 0 70 Z" fill="#e2e8f0" />
      <!-- Cozy cabins -->
      <polygon points="30,35 48,22 66,35" fill="#78350f" />
      <rect x="34" y="35" width="28" height="20" fill="#451a03" />
      <rect x="42" y="40" width="12" height="10" fill="#facc15" />
    </svg>`,
    render: (ctx, width, height) => {
      // Midnight twilight sky
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, '#030712');
      sky.addColorStop(0.4, '#0c1b33');
      sky.addColorStop(0.7, '#1e293b');
      sky.addColorStop(1, '#0f172a');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      // Glowing Winter Moon
      const moonX = width * 0.82;
      const moonY = height * 0.22;
      const moonGlow = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, width * 0.2);
      moonGlow.addColorStop(0, '#fffbeb');
      moonGlow.addColorStop(0.3, 'rgba(254, 240, 138, 0.3)');
      moonGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, width * 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Crisp Moon Disc
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(moonX, moonY, width * 0.05, 0, Math.PI * 2);
      ctx.fill();

      // Distant snowy mountain silhouettes
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.58);
      ctx.lineTo(width * 0.25, height * 0.38);
      ctx.lineTo(width * 0.5, height * 0.55);
      ctx.lineTo(width * 0.75, height * 0.34);
      ctx.lineTo(width, height * 0.5);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Snow ground rolls
      const snow = ctx.createLinearGradient(0, height * 0.55, 0, height);
      snow.addColorStop(0, '#cbd5e1');
      snow.addColorStop(0.3, '#f1f5f9');
      snow.addColorStop(1, '#94a3b8');
      ctx.fillStyle = snow;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.62);
      ctx.bezierCurveTo(width * 0.3, height * 0.52, width * 0.65, height * 0.65, width, height * 0.58);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Cozy Cabins with glowing warm windows
      const cabins = [
        { x: width * 0.28, y: height * 0.55, w: width * 0.14, h: height * 0.16 },
        { x: width * 0.65, y: height * 0.6, w: width * 0.16, h: height * 0.18 },
      ];
      cabins.forEach(c => {
        // Walls
        ctx.fillStyle = '#3f1d0b';
        ctx.fillRect(c.x, c.y + c.h * 0.35, c.w, c.h * 0.65);
        // Roof
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(c.x - c.w * 0.1, c.y + c.h * 0.38);
        ctx.lineTo(c.x + c.w * 0.5, c.y);
        ctx.lineTo(c.x + c.w * 1.1, c.y + c.h * 0.38);
        ctx.closePath();
        ctx.fill();
        // Glowing Window
        ctx.fillStyle = '#fde047';
        ctx.fillRect(c.x + c.w * 0.35, c.y + c.h * 0.52, c.w * 0.3, c.h * 0.28);
      });
    },
  },
  {
    id: 'xmas_golden_bokeh',
    name: 'Luces Bokeh Doradas',
    category: 'Navidad',
    thumbnailSvg: `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="gbGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#241400" />
          <stop offset="100%" stop-color="#080400" />
        </radialGradient>
      </defs>
      <rect width="100" height="70" fill="url(#gbGrad)" />
      <circle cx="25" cy="22" r="14" fill="#fbbf24" opacity="0.35" />
      <circle cx="75" cy="30" r="18" fill="#f59e0b" opacity="0.4" />
      <circle cx="50" cy="50" r="22" fill="#fde047" opacity="0.3" />
      <circle cx="35" cy="45" r="8" fill="#ffffff" opacity="0.6" />
      <circle cx="68" cy="20" r="7" fill="#ffffff" opacity="0.7" />
    </svg>`,
    render: (ctx, width, height) => {
      // Warm dark velvet gold ambiance
      const bg = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        0,
        width * 0.5,
        height * 0.5,
        width * 0.75
      );
      bg.addColorStop(0, '#1c1002');
      bg.addColorStop(0.5, '#120801');
      bg.addColorStop(1, '#050200');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // Golden fairy bokeh orbs (dreamy Christmas photography look)
      const orbs = [
        { x: width * 0.15, y: height * 0.22, r: width * 0.1, a: 0.25, c: '#fef08a' },
        { x: width * 0.82, y: height * 0.28, r: width * 0.14, a: 0.22, c: '#f59e0b' },
        { x: width * 0.45, y: height * 0.18, r: width * 0.08, a: 0.3, c: '#fde047' },
        { x: width * 0.68, y: height * 0.55, r: width * 0.12, a: 0.2, c: '#fbbf24' },
        { x: width * 0.28, y: height * 0.68, r: width * 0.15, a: 0.18, c: '#f59e0b' },
        { x: width * 0.52, y: height * 0.75, r: width * 0.09, a: 0.26, c: '#fef08a' },
        { x: width * 0.9, y: height * 0.8, r: width * 0.13, a: 0.22, c: '#fbbf24' },
      ];

      orbs.forEach(o => {
        const rad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        rad.addColorStop(0, o.c);
        rad.addColorStop(0.6, o.c);
        rad.addColorStop(1, 'transparent');
        ctx.globalAlpha = o.a;
        ctx.fillStyle = rad;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Pinpoint fairy lights
      const pinpoints = [
        { x: width * 0.2, y: height * 0.3 },
        { x: width * 0.35, y: height * 0.15 },
        { x: width * 0.7, y: height * 0.22 },
        { x: width * 0.6, y: height * 0.45 },
        { x: width * 0.85, y: height * 0.4 },
        { x: width * 0.15, y: height * 0.7 },
        { x: width * 0.45, y: height * 0.8 },
      ];
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = '#ffffff';
      pinpoints.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;
    },
  },

  // ==========================================
  // CELEBRATION & STUDIO BACKDROPS
  // ==========================================
  {
    id: 'red_carpet',
    name: 'Red Carpet Gala',
    category: 'Celebración',
    thumbnailSvg: `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rcGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1a0b12" />
          <stop offset="70%" stop-color="#4a0e1c" />
          <stop offset="100%" stop-color="#b91c1c" />
        </linearGradient>
      </defs>
      <rect width="100" height="70" fill="url(#rcGrad)" />
      <circle cx="20" cy="20" r="8" fill="#fbbf24" opacity="0.4" />
      <circle cx="80" cy="25" r="12" fill="#f59e0b" opacity="0.3" />
      <line x1="10" y1="55" x2="90" y2="55" stroke="#d97706" stroke-width="2" />
    </svg>`,
    render: (ctx, width, height) => {
      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, '#0d0408');
      bg.addColorStop(0.5, '#280914');
      bg.addColorStop(0.85, '#6e1124');
      bg.addColorStop(1, '#991b1b');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      const orbs = [
        { x: width * 0.15, y: height * 0.25, r: width * 0.08, a: 0.15, c: '#fef08a' },
        { x: width * 0.85, y: height * 0.3, r: width * 0.12, a: 0.12, c: '#f59e0b' },
        { x: width * 0.5, y: height * 0.12, r: width * 0.05, a: 0.25, c: '#ffffff' },
      ];
      orbs.forEach(o => {
        const rad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        rad.addColorStop(0, o.c);
        rad.addColorStop(1, 'transparent');
        ctx.globalAlpha = o.a;
        ctx.fillStyle = rad;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = height * 0.015;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.72);
      ctx.bezierCurveTo(width * 0.3, height * 0.78, width * 0.7, height * 0.78, width, height * 0.72);
      ctx.stroke();
    },
  },
  {
    id: 'cyberpunk_city',
    name: 'Neon Cyberpunk',
    category: 'Vibrante',
    thumbnailSvg: `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cbGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#090514" />
          <stop offset="60%" stop-color="#240046" />
          <stop offset="100%" stop-color="#00f5d4" />
        </linearGradient>
      </defs>
      <rect width="100" height="70" fill="url(#cbGrad)" />
      <line x1="0" y1="58" x2="100" y2="58" stroke="#ff007f" stroke-width="2" />
    </svg>`,
    render: (ctx, width, height) => {
      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, '#060214');
      bg.addColorStop(0.5, '#1e0836');
      bg.addColorStop(0.85, '#3b0764');
      bg.addColorStop(1, '#020617');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.4;
      for (let y = height * 0.7; y < height; y += height * 0.05) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;
    },
  },
  {
    id: 'studio_slate',
    name: 'Estudio Velvet',
    category: 'Minimal',
    thumbnailSvg: `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="stGrad" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stop-color="#475569" />
          <stop offset="100%" stop-color="#0f172a" />
        </radialGradient>
      </defs>
      <rect width="100" height="70" fill="url(#stGrad)" />
    </svg>`,
    render: (ctx, width, height) => {
      const rad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.38,
        0,
        width * 0.5,
        height * 0.5,
        width * 0.65
      );
      rad.addColorStop(0, '#334155');
      rad.addColorStop(0.6, '#1e293b');
      rad.addColorStop(1, '#020617');
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, width, height);
    },
  },
];
