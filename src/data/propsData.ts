/**
 * Interactive AR Accessories & Props for the Photo Booth.
 * Pure SVG vectors rendered cleanly onto HTML5 Canvas without any external images.
 * Supports MediaPipe Face Mesh real-time facial landmark tracking.
 */

import { AnchorType, EventTheme } from '../types/photobooth';

export type PropCategory = 'xmas' | 'wedding' | 'party' | 'corporate' | 'glasses' | 'hats' | 'props';

export interface PropItem {
  id: string;
  name: string;
  category: PropCategory;
  theme?: EventTheme | 'all';
  defaultScale: number;
  anchorType: AnchorType;
  anchorYOffset: number; // fallback manual offset
  width: number;
  height: number;
  svg: string;
}

export const AVAILABLE_PROPS: PropItem[] = [
  // =======================================================
  // 1. PLANTILLA BODA / ELEGANTE (Black & Gold / Floral)
  // =======================================================
  {
    id: 'prop_wedding_veil_tiara',
    name: 'Velo con Tiara',
    category: 'wedding',
    theme: 'wedding',
    defaultScale: 1.2,
    anchorType: 'head_top',
    anchorYOffset: -0.2,
    width: 320,
    height: 380,
    svg: `<svg viewBox="0 0 320 380" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tiaraGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fffbeb" />
          <stop offset="30%" stop-color="#fde047" />
          <stop offset="70%" stop-color="#d97706" />
          <stop offset="100%" stop-color="#78350f" />
        </linearGradient>
        <radialGradient id="gemGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="60%" stop-color="#bae6fd" />
          <stop offset="100%" stop-color="#38bdf8" />
        </radialGradient>
        <linearGradient id="veilFlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85" />
          <stop offset="40%" stop-color="#f8fafc" stop-opacity="0.55" />
          <stop offset="85%" stop-color="#f1f5f9" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.1" />
        </linearGradient>
      </defs>
      <!-- Translucent Cascading Bridal Veil -->
      <path d="M 90 90 C 40 140, 20 250, 10 370 C 50 365, 80 340, 95 320 C 110 350, 140 365, 160 360 C 180 365, 210 350, 225 320 C 240 340, 270 365, 310 370 C 300 250, 280 140, 230 90 Z" fill="url(#veilFlow)" />
      <!-- Veil lace scalloped embroidery folds -->
      <path d="M 60 120 C 45 190, 40 280, 35 350" stroke="#ffffff" stroke-width="2" stroke-dasharray="4,6" fill="none" opacity="0.7" />
      <path d="M 260 120 C 275 190, 280 280, 285 350" stroke="#ffffff" stroke-width="2" stroke-dasharray="4,6" fill="none" opacity="0.7" />
      <path d="M 95 110 C 105 180, 120 270, 130 340" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="3,5" fill="none" opacity="0.5" />
      <path d="M 225 110 C 215 180, 200 270, 190 340" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="3,5" fill="none" opacity="0.5" />
      <!-- Tiara Base Arc -->
      <path d="M 70 95 C 115 72, 205 72, 250 95" stroke="url(#tiaraGold)" stroke-width="6" fill="none" stroke-linecap="round" />
      <path d="M 75 92 C 118 68, 202 68, 245 92" stroke="#fef08a" stroke-width="2" fill="none" />
      <!-- Tiara Peaks & Filigree -->
      <path d="M 85 90 L 105 60 L 125 82 L 145 48 L 160 25 L 175 48 L 195 82 L 215 60 L 235 90" stroke="url(#tiaraGold)" stroke-width="3.5" fill="none" stroke-linejoin="round" />
      <polygon points="160,25 148,52 172,52" fill="url(#tiaraGold)" opacity="0.4" />
      <polygon points="125,58 115,75 135,75" fill="url(#tiaraGold)" opacity="0.3" />
      <polygon points="195,58 185,75 205,75" fill="url(#tiaraGold)" opacity="0.3" />
      <!-- Sparkling Gemstones -->
      <circle cx="160" cy="24" r="8" fill="url(#gemGlow)" stroke="#ffffff" stroke-width="2" />
      <circle cx="160" cy="52" r="6" fill="url(#gemGlow)" stroke="#ffffff" stroke-width="1.5" />
      <circle cx="105" cy="60" r="5.5" fill="url(#gemGlow)" stroke="#ffffff" stroke-width="1.5" />
      <circle cx="215" cy="60" r="5.5" fill="url(#gemGlow)" stroke="#ffffff" stroke-width="1.5" />
      <circle cx="125" cy="80" r="4.5" fill="url(#gemGlow)" stroke="#ffffff" stroke-width="1.5" />
      <circle cx="195" cy="80" r="4.5" fill="url(#gemGlow)" stroke="#ffffff" stroke-width="1.5" />
      <circle cx="145" cy="74" r="4" fill="url(#gemGlow)" />
      <circle cx="175" cy="74" r="4" fill="url(#gemGlow)" />
      <!-- Brilliant Light Flashes -->
      <polygon points="160,12 163,22 173,25 163,28 160,38 157,28 147,25 157,22" fill="#ffffff" opacity="0.9" />
      <polygon points="105,50 107,58 115,60 107,62 105,70 103,62 95,60 103,58" fill="#ffffff" opacity="0.8" />
      <polygon points="215,50 217,58 225,60 217,62 215,70 213,62 205,60 213,58" fill="#ffffff" opacity="0.8" />
    </svg>`,
  },
  {
    id: 'prop_top_hat',
    name: 'Sombrero de Copa',
    category: 'wedding',
    theme: 'wedding',
    defaultScale: 1.35,
    anchorType: 'head_top',
    anchorYOffset: -0.9,
    width: 280,
    height: 230,
    svg: `<svg viewBox="0 0 280 230" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hatFelt" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#09090b" />
          <stop offset="25%" stop-color="#27272a" />
          <stop offset="60%" stop-color="#18181b" />
          <stop offset="85%" stop-color="#3f3f46" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
        <linearGradient id="goldRibbon" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#92400e" />
          <stop offset="30%" stop-color="#fde047" />
          <stop offset="70%" stop-color="#d97706" />
          <stop offset="100%" stop-color="#78350f" />
        </linearGradient>
      </defs>
      <!-- Crown Top Ellipse -->
      <ellipse cx="140" cy="42" rx="72" ry="16" fill="#27272a" stroke="#52525b" stroke-width="1.5" />
      <ellipse cx="140" cy="40" rx="68" ry="14" fill="#18181b" />
      <!-- Hat Cylinder Body -->
      <path d="M 68 42 L 78 165 C 100 178, 180 178, 202 165 L 212 42 Z" fill="url(#hatFelt)" />
      <!-- Silk Sheen Highlights -->
      <path d="M 172 44 L 166 166 C 176 165, 186 162, 192 158 L 198 44 Z" fill="#ffffff" opacity="0.12" />
      <path d="M 88 44 L 92 164" stroke="#ffffff" stroke-width="2" opacity="0.15" />
      <!-- Gold/Satin Ribbon Band -->
      <path d="M 76 138 C 100 152, 180 152, 204 138 L 206 162 C 180 176, 100 176, 74 162 Z" fill="url(#goldRibbon)" />
      <!-- Ribbon Bow Buckle -->
      <rect x="130" y="142" width="20" height="24" rx="4" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5" />
      <rect x="135" y="147" width="10" height="14" rx="2" fill="#78350f" />
      <!-- Curved Brim -->
      <ellipse cx="140" cy="180" rx="130" ry="32" fill="#18181b" stroke="#3f3f46" stroke-width="2" />
      <ellipse cx="140" cy="178" rx="126" ry="28" fill="#09090b" />
      <!-- Brim Curled Edge Highlight -->
      <path d="M 14 180 C 40 210, 240 210, 266 180" stroke="#71717a" stroke-width="3" fill="none" stroke-linecap="round" />
    </svg>`,
  },
  {
    id: 'prop_bowtie_gold',
    name: 'Corbatín de Gala',
    category: 'wedding',
    theme: 'wedding',
    defaultScale: 0.7,
    anchorType: 'neck',
    anchorYOffset: 0.25,
    width: 220,
    height: 110,
    svg: `<svg viewBox="0 0 220 110" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bowtieBlack" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#27272a" />
          <stop offset="50%" stop-color="#09090b" />
          <stop offset="100%" stop-color="#18181b" />
        </linearGradient>
        <linearGradient id="bowtieGoldEdge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#fde047" />
          <stop offset="50%" stop-color="#d97706" />
          <stop offset="100%" stop-color="#fef08a" />
        </linearGradient>
      </defs>
      <!-- Left Wing -->
      <polygon points="110,55 18,15 12,95 110,55" fill="url(#bowtieBlack)" stroke="url(#bowtieGoldEdge)" stroke-width="3.5" stroke-linejoin="round" />
      <!-- Left Inner Fold -->
      <polygon points="100,55 35,32 30,78 100,55" fill="#18181b" opacity="0.6" />
      <!-- Right Wing -->
      <polygon points="110,55 202,15 208,95 110,55" fill="url(#bowtieBlack)" stroke="url(#bowtieGoldEdge)" stroke-width="3.5" stroke-linejoin="round" />
      <!-- Right Inner Fold -->
      <polygon points="120,55 185,32 190,78 120,55" fill="#18181b" opacity="0.6" />
      <!-- Center Knot -->
      <rect x="94" y="36" width="32" height="38" rx="8" fill="url(#bowtieGoldEdge)" stroke="#ffffff" stroke-width="1.5" />
      <ellipse cx="110" cy="55" rx="9" ry="14" fill="#d97706" opacity="0.35" />
      <path d="M 100 42 Q 110 40 120 42" stroke="#fef08a" stroke-width="1.5" fill="none" />
      <path d="M 100 68 Q 110 70 120 68" stroke="#78350f" stroke-width="1.5" fill="none" />
    </svg>`,
  },
  {
    id: 'prop_glamour_sunglasses',
    name: 'Lentes Glamour',
    category: 'wedding',
    theme: 'wedding',
    defaultScale: 0.95,
    anchorType: 'eyes',
    anchorYOffset: 0,
    width: 250,
    height: 90,
    svg: `<svg viewBox="0 0 250 90" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="glamGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fffbeb" />
          <stop offset="35%" stop-color="#fde047" />
          <stop offset="70%" stop-color="#ca8a04" />
          <stop offset="100%" stop-color="#854d0e" />
        </linearGradient>
        <linearGradient id="lensSmoke" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0f172a" stop-opacity="0.95" />
          <stop offset="60%" stop-color="#1e293b" stop-opacity="0.85" />
          <stop offset="100%" stop-color="#334155" stop-opacity="0.75" />
        </linearGradient>
      </defs>
      <!-- Left Rim -->
      <path d="M 22 25 C 28 14, 102 14, 110 25 C 114 42, 106 72, 68 76 C 30 72, 18 42, 22 25 Z" fill="url(#lensSmoke)" stroke="url(#glamGold)" stroke-width="4.5" />
      <!-- Left Glass Reflection -->
      <path d="M 32 30 Q 55 24 75 30 L 65 65 Q 45 62 38 48 Z" fill="#ffffff" opacity="0.18" />
      <!-- Right Rim -->
      <path d="M 140 25 C 148 14, 222 14, 228 25 C 232 42, 220 72, 182 76 C 144 72, 136 42, 140 25 Z" fill="url(#lensSmoke)" stroke="url(#glamGold)" stroke-width="4.5" />
      <!-- Right Glass Reflection -->
      <path d="M 150 30 Q 173 24 193 30 L 183 65 Q 163 62 156 48 Z" fill="#ffffff" opacity="0.18" />
      <!-- Golden Bridge -->
      <path d="M 108 30 Q 125 22 142 30" stroke="url(#glamGold)" stroke-width="4.5" fill="none" stroke-linecap="round" />
      <!-- Temple Hinges -->
      <rect x="14" y="22" width="10" height="6" rx="2" fill="url(#glamGold)" />
      <rect x="226" y="22" width="10" height="6" rx="2" fill="url(#glamGold)" />
      <!-- Diamond Sparkles on Corner -->
      <polygon points="26,18 28,24 34,26 28,28 26,34 24,28 18,26 24,24" fill="#ffffff" />
      <polygon points="224,18 226,24 232,26 226,28 224,34 222,28 216,26 222,24" fill="#ffffff" />
    </svg>`,
  },

  // =======================================================
  // 2. PLANTILLA FIESTA / CUMPLEAÑOS (Party & Neon)
  // =======================================================
  {
    id: 'prop_party_cone',
    name: 'Gorro de Cumpleaños',
    category: 'party',
    theme: 'party',
    defaultScale: 0.8,
    anchorType: 'head_top',
    anchorYOffset: -0.85,
    width: 200,
    height: 250,
    svg: `<svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="partyConeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ec4899" />
          <stop offset="40%" stop-color="#8b5cf6" />
          <stop offset="80%" stop-color="#06b6d4" />
          <stop offset="100%" stop-color="#10b981" />
        </linearGradient>
        <radialGradient id="pompomYellow" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="60%" stop-color="#eab308" />
          <stop offset="100%" stop-color="#ca8a04" />
        </radialGradient>
      </defs>
      <!-- Cone Body -->
      <polygon points="100,45 20,225 180,225" fill="url(#partyConeGrad)" stroke="#ffffff" stroke-width="4" stroke-linejoin="round" />
      <!-- Polka Dots & Party Stars -->
      <circle cx="85" cy="110" r="10" fill="#fde047" stroke="#ffffff" stroke-width="1.5" />
      <circle cx="125" cy="140" r="12" fill="#22c55e" stroke="#ffffff" stroke-width="1.5" />
      <circle cx="65" cy="175" r="11" fill="#ec4899" stroke="#ffffff" stroke-width="1.5" />
      <circle cx="140" cy="195" r="9" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" />
      <circle cx="100" cy="170" r="8" fill="#f97316" stroke="#ffffff" stroke-width="1.5" />
      <circle cx="110" cy="85" r="6" fill="#ffffff" />
      <!-- Striped Spirals -->
      <path d="M 70 85 Q 100 95 125 105" stroke="#ffffff" stroke-width="3" fill="none" opacity="0.6" stroke-linecap="round" />
      <path d="M 45 140 Q 100 155 155 165" stroke="#ffffff" stroke-width="3" fill="none" opacity="0.6" stroke-linecap="round" />
      <!-- Curved Base Fringe -->
      <ellipse cx="100" cy="225" rx="82" ry="14" fill="#fbbf24" stroke="#f59e0b" stroke-width="2" />
      <path d="M 22 225 C 50 240, 150 240, 178 225" stroke="#ffffff" stroke-width="3" fill="none" />
      <!-- Big Fluffy Top Pompom -->
      <circle cx="100" cy="40" r="22" fill="url(#pompomYellow)" stroke="#ffffff" stroke-width="2.5" />
      <circle cx="92" cy="32" r="5" fill="#ffffff" opacity="0.75" />
      <circle cx="112" cy="46" r="3" fill="#ca8a04" />
    </svg>`,
  },
  {
    id: 'prop_giant_party_glasses',
    name: 'Gafas Gigantes Neón',
    category: 'party',
    theme: 'party',
    defaultScale: 1.05,
    anchorType: 'eyes',
    anchorYOffset: 0,
    width: 270,
    height: 110,
    svg: `<svg viewBox="0 0 270 110" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="neonPinkCyan" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#f43f5e" />
          <stop offset="48%" stop-color="#ec4899" />
          <stop offset="52%" stop-color="#06b6d4" />
          <stop offset="100%" stop-color="#3b82f6" />
        </linearGradient>
      </defs>
      <!-- Left Star Frame -->
      <polygon points="68,8 84,40 120,44 92,68 100,102 68,84 36,102 44,68 16,44 52,40" fill="#f43f5e" stroke="#ffffff" stroke-width="4.5" stroke-linejoin="round" />
      <!-- Left Tinted Star Lens -->
      <polygon points="68,22 80,44 104,46 84,62 90,86 68,72 46,86 52,62 32,46 56,44" fill="#ec4899" opacity="0.6" />
      <ellipse cx="68" cy="54" rx="16" ry="8" fill="#ffffff" opacity="0.3" transform="rotate(-20 68 54)" />
      <!-- Right Star Frame -->
      <polygon points="202,8 218,40 254,44 226,68 234,102 202,84 170,102 178,68 150,44 186,40" fill="#06b6d4" stroke="#ffffff" stroke-width="4.5" stroke-linejoin="round" />
      <!-- Right Tinted Star Lens -->
      <polygon points="202,22 214,44 238,46 218,62 224,86 202,72 180,86 186,62 166,46 190,44" fill="#0ea5e9" opacity="0.6" />
      <ellipse cx="202" cy="54" rx="16" ry="8" fill="#ffffff" opacity="0.3" transform="rotate(-20 202 54)" />
      <!-- Central Bridge -->
      <path d="M 116 52 Q 135 44 154 52" stroke="#ffffff" stroke-width="6" fill="none" stroke-linecap="round" />
      <path d="M 116 52 Q 135 44 154 52" stroke="#facc15" stroke-width="3" fill="none" stroke-linecap="round" />
    </svg>`,
  },
  {
    id: 'prop_party_horn',
    name: 'Espantasuegras',
    category: 'party',
    theme: 'party',
    defaultScale: 0.95,
    anchorType: 'lips',
    anchorYOffset: 0.1,
    width: 220,
    height: 120,
    svg: `<svg viewBox="0 0 220 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hornTube" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ef4444" />
          <stop offset="30%" stop-color="#f59e0b" />
          <stop offset="60%" stop-color="#10b981" />
          <stop offset="100%" stop-color="#06b6d4" />
        </linearGradient>
      </defs>
      <!-- Mouthpiece anchored at lips (left side: x=25, y=60) -->
      <rect x="8" y="50" width="30" height="20" rx="5" fill="#fde047" stroke="#ca8a04" stroke-width="2" />
      <polygon points="34,44 58,40 58,80 34,76" fill="#ef4444" stroke="#ffffff" stroke-width="2" />
      <!-- Unrolled Festive Coil extending diagonally right-up -->
      <path d="M 58 60 C 95 62, 130 45, 155 35 C 180 25, 205 32, 210 50 C 215 68, 195 85, 175 80 C 160 76, 158 60, 170 52 C 180 46, 192 50, 190 60" fill="none" stroke="url(#hornTube)" stroke-width="16" stroke-linecap="round" />
      <path d="M 58 60 C 95 62, 130 45, 155 35 C 180 25, 205 32, 210 50 C 215 68, 195 85, 175 80 C 160 76, 158 60, 170 52 C 180 46, 192 50, 190 60" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="6,8" opacity="0.8" />
      <!-- Flying Confetti Bursts -->
      <circle cx="195" cy="20" r="4" fill="#ec4899" />
      <polygon points="212,28 218,22 216,34" fill="#fde047" />
      <circle cx="218" cy="65" r="3.5" fill="#22c55e" />
      <rect x="202" y="85" width="6" height="6" fill="#3b82f6" transform="rotate(25 205 88)" />
    </svg>`,
  },
  {
    id: 'prop_party_crown',
    name: 'Corona Rey/Reina',
    category: 'party',
    theme: 'party',
    defaultScale: 1.25,
    anchorType: 'head_top',
    anchorYOffset: -0.75,
    width: 260,
    height: 180,
    svg: `<svg viewBox="0 0 260 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="crownGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="40%" stop-color="#facc15" />
          <stop offset="80%" stop-color="#d97706" />
          <stop offset="100%" stop-color="#92400e" />
        </linearGradient>
      </defs>
      <!-- Base Band -->
      <path d="M 25 150 C 75 162, 185 162, 235 150 L 238 135 C 185 146, 75 146, 22 135 Z" fill="url(#crownGold)" stroke="#78350f" stroke-width="2" />
      <!-- Crown Spikes -->
      <path d="M 22 135 L 35 65 L 75 110 L 130 30 L 185 110 L 225 65 L 238 135 Z" fill="url(#crownGold)" stroke="#ffffff" stroke-width="3" stroke-linejoin="round" />
      <!-- Velvet Cap Shadow -->
      <polygon points="130,30 75,110 185,110" fill="#b45309" opacity="0.3" />
      <!-- Gemstones on Spikes -->
      <!-- Ruby Center -->
      <circle cx="130" cy="30" r="11" fill="#ef4444" stroke="#ffffff" stroke-width="2" />
      <circle cx="127" cy="27" r="3" fill="#ffffff" opacity="0.8" />
      <!-- Sapphire Left -->
      <circle cx="35" cy="65" r="9" fill="#0284c7" stroke="#ffffff" stroke-width="2" />
      <!-- Sapphire Right -->
      <circle cx="225" cy="65" r="9" fill="#0284c7" stroke="#ffffff" stroke-width="2" />
      <!-- Emeralds Mid Peaks -->
      <circle cx="75" cy="110" r="8" fill="#16a34a" stroke="#ffffff" stroke-width="1.5" />
      <circle cx="185" cy="110" r="8" fill="#16a34a" stroke="#ffffff" stroke-width="1.5" />
      <!-- Band Jewels -->
      <rect x="123" y="138" width="14" height="14" rx="3" fill="#ef4444" stroke="#ffffff" stroke-width="1.5" />
      <circle cx="80" cy="144" r="5" fill="#0284c7" />
      <circle cx="180" cy="144" r="5" fill="#0284c7" />
    </svg>`,
  },

  // =======================================================
  // 3. PLANTILLA CORPORATIVO / GRADUACIÓN (Formal & Academy)
  // =======================================================
  {
    id: 'prop_graduation_cap',
    name: 'Birrete Graduación',
    category: 'corporate',
    theme: 'corporate',
    defaultScale: 1.45,
    anchorType: 'head_top',
    anchorYOffset: -0.85,
    width: 320,
    height: 220,
    svg: `<svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="capMatte" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#27272a" />
          <stop offset="60%" stop-color="#09090b" />
          <stop offset="100%" stop-color="#18181b" />
        </linearGradient>
        <linearGradient id="tasselGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="50%" stop-color="#eab308" />
          <stop offset="100%" stop-color="#a16207" />
        </linearGradient>
      </defs>
      <!-- Skullcap Headband -->
      <path d="M 100 100 C 100 135, 220 135, 220 100 L 210 145 C 195 165, 125 165, 110 145 Z" fill="url(#capMatte)" stroke="#3f3f46" stroke-width="2" />
      <!-- Mortarboard Rhombus in Perspective -->
      <polygon points="160,25 310,85 160,145 10,85" fill="url(#capMatte)" stroke="#52525b" stroke-width="2.5" stroke-linejoin="round" />
      <polygon points="160,30 298,85 160,140 22,85" fill="#18181b" opacity="0.6" />
      <!-- Center Button Stud -->
      <ellipse cx="160" cy="85" rx="9" ry="6" fill="#fde047" stroke="#a16207" stroke-width="1.5" />
      <!-- Golden Tassel Cord hanging to left -->
      <path d="M 160 85 C 120 85, 60 105, 52 140" stroke="url(#tasselGold)" stroke-width="3.5" fill="none" stroke-linecap="round" />
      <circle cx="52" cy="142" r="5" fill="#eab308" />
      <!-- Tassel Brush / Borla -->
      <polygon points="46,145 58,145 64,195 40,195" fill="url(#tasselGold)" stroke="#78350f" stroke-width="1" />
      <path d="M 42 195 L 62 195" stroke="#fef08a" stroke-width="2" />
      <path d="M 48 150 L 46 190" stroke="#fef08a" stroke-width="1" />
      <path d="M 54 150 L 56 190" stroke="#fef08a" stroke-width="1" />
    </svg>`,
  },
  {
    id: 'prop_intellectual_glasses',
    name: 'Gafas Ejecutivas',
    category: 'corporate',
    theme: 'corporate',
    defaultScale: 0.9,
    anchorType: 'eyes',
    anchorYOffset: 0,
    width: 240,
    height: 90,
    svg: `<svg viewBox="0 0 240 90" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tortoiseRim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#451a03" />
          <stop offset="50%" stop-color="#78350f" />
          <stop offset="100%" stop-color="#1c1917" />
        </linearGradient>
      </defs>
      <!-- Left Round Frame -->
      <circle cx="68" cy="45" r="32" fill="none" stroke="url(#tortoiseRim)" stroke-width="4.5" />
      <circle cx="68" cy="45" r="30" fill="#38bdf8" opacity="0.1" />
      <path d="M 50 30 Q 75 22 84 38" stroke="#ffffff" stroke-width="2.5" fill="none" opacity="0.6" stroke-linecap="round" />
      <!-- Right Round Frame -->
      <circle cx="172" cy="45" r="32" fill="none" stroke="url(#tortoiseRim)" stroke-width="4.5" />
      <circle cx="172" cy="45" r="30" fill="#38bdf8" opacity="0.1" />
      <path d="M 154 30 Q 179 22 188 38" stroke="#ffffff" stroke-width="2.5" fill="none" opacity="0.6" stroke-linecap="round" />
      <!-- Curved Metal Bridge -->
      <path d="M 100 42 Q 120 32 140 42" stroke="#d97706" stroke-width="3" fill="none" stroke-linecap="round" />
      <!-- Side Temples -->
      <path d="M 36 45 L 14 42" stroke="#d97706" stroke-width="3" stroke-linecap="round" />
      <path d="M 204 45 L 226 42" stroke="#d97706" stroke-width="3" stroke-linecap="round" />
    </svg>`,
  },
  {
    id: 'prop_executive_tie',
    name: 'Corbata Ejecutiva',
    category: 'corporate',
    theme: 'corporate',
    defaultScale: 0.5,
    anchorType: 'neck',
    anchorYOffset: 0.35,
    width: 140,
    height: 280,
    svg: `<svg viewBox="0 0 140 280" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tieNavy" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1e3a8a" />
          <stop offset="60%" stop-color="#172554" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
      </defs>
      <!-- Knot -->
      <polygon points="50,15 90,15 82,60 58,60" fill="url(#tieNavy)" stroke="#38bdf8" stroke-width="1.5" />
      <!-- Main Tie Blade -->
      <polygon points="58,60 82,60 98,240 70,275 42,240" fill="url(#tieNavy)" stroke="#38bdf8" stroke-width="1.5" />
      <!-- Diagonal Silk Stripes -->
      <path d="M 60 80 L 78 68" stroke="#fbbf24" stroke-width="3" />
      <path d="M 56 120 L 86 98" stroke="#fbbf24" stroke-width="3" />
      <path d="M 52 160 L 92 130" stroke="#fbbf24" stroke-width="3" />
      <path d="M 48 200 L 96 164" stroke="#fbbf24" stroke-width="3" />
      <path d="M 44 240 L 98 198" stroke="#fbbf24" stroke-width="3" />
      <!-- Subtle Golden Tie Clip -->
      <rect x="52" y="145" width="40" height="6" rx="2" fill="#fde047" stroke="#b45309" stroke-width="1" />
    </svg>`,
  },
  {
    id: 'prop_classic_mustache',
    name: 'Bigote Clásico',
    category: 'corporate',
    theme: 'corporate',
    defaultScale: 0.65,
    anchorType: 'mouth',
    anchorYOffset: 0.1,
    width: 200,
    height: 65,
    svg: `<svg viewBox="0 0 200 65" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mustacheBrown" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#292524" />
          <stop offset="50%" stop-color="#1c1917" />
          <stop offset="100%" stop-color="#0c0a09" />
        </linearGradient>
      </defs>
      <path d="M 100 28 C 80 12, 50 6, 25 14 C 6 20, 2 38, 12 46 C 24 54, 48 48, 70 38 C 86 32, 94 40, 100 44 C 106 40, 114 32, 130 38 C 152 48, 176 54, 188 46 C 198 38, 194 20, 175 14 C 150 6, 120 12, 100 28 Z" fill="url(#mustacheBrown)" stroke="#44403c" stroke-width="2" />
      <!-- Handlebar Fine Tips -->
      <path d="M 25 14 C 15 16, 8 26, 4 34" stroke="#78716c" stroke-width="2" fill="none" stroke-linecap="round" />
      <path d="M 175 14 C 185 16, 192 26, 196 34" stroke="#78716c" stroke-width="2" fill="none" stroke-linecap="round" />
      <!-- Texture Strands -->
      <path d="M 40 22 Q 70 20 88 32" stroke="#57534e" stroke-width="1.8" fill="none" opacity="0.7" />
      <path d="M 160 22 Q 130 20 112 32" stroke="#57534e" stroke-width="1.8" fill="none" opacity="0.7" />
    </svg>`,
  },

  // =======================================================
  // 4. SUITE NAVIDEÑA (CHRISTMAS THEME SUITE)
  // =======================================================
  {
    id: 'prop_rudolph_nose',
    name: 'Nariz de Rodolfo',
    category: 'xmas',
    theme: 'xmas',
    defaultScale: 1.0,
    anchorType: 'nose',
    anchorYOffset: 0,
    width: 90,
    height: 90,
    svg: `<svg viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rudolphGlow" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#ff8585" />
          <stop offset="50%" stop-color="#ef4444" />
          <stop offset="85%" stop-color="#b91c1c" />
          <stop offset="100%" stop-color="#7f1d1d" />
        </radialGradient>
      </defs>
      <circle cx="45" cy="45" r="38" fill="#ef4444" opacity="0.35" />
      <circle cx="45" cy="45" r="28" fill="url(#rudolphGlow)" stroke="#fca5a5" stroke-width="2.5" />
      <ellipse cx="37" cy="35" rx="8" ry="4.5" fill="#ffffff" opacity="0.85" transform="rotate(-25 37 35)" />
      <circle cx="53" cy="53" r="2.5" fill="#ffffff" opacity="0.5" />
    </svg>`,
  },
  {
    id: 'prop_santa_hat',
    name: 'Gorro de Santa',
    category: 'xmas',
    theme: 'xmas',
    defaultScale: 1.35,
    anchorType: 'forehead',
    anchorYOffset: -0.75,
    width: 260,
    height: 220,
    svg: `<svg viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="santaRed" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ef4444" />
          <stop offset="70%" stop-color="#dc2626" />
          <stop offset="100%" stop-color="#991b1b" />
        </linearGradient>
        <radialGradient id="pompomWhite" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="70%" stop-color="#f1f5f9" />
          <stop offset="100%" stop-color="#cbd5e1" />
        </radialGradient>
      </defs>
      <path d="M 35 155 C 40 85, 120 20, 205 35 C 235 40, 255 70, 245 105 C 240 125, 225 140, 210 145 Z" fill="url(#santaRed)" stroke="#7f1d1d" stroke-width="3" />
      <path d="M 60 140 C 90 75, 160 40, 215 50" stroke="#f87171" stroke-width="4" fill="none" opacity="0.6" stroke-linecap="round" />
      <ellipse cx="130" cy="165" rx="105" ry="24" fill="url(#pompomWhite)" stroke="#cbd5e1" stroke-width="3" />
      <circle cx="238" cy="118" r="24" fill="url(#pompomWhite)" stroke="#cbd5e1" stroke-width="3" />
      <circle cx="232" cy="112" r="6" fill="#ffffff" />
    </svg>`,
  },
  {
    id: 'prop_reindeer_antlers',
    name: 'Cuernos de Reno',
    category: 'xmas',
    theme: 'xmas',
    defaultScale: 1.45,
    anchorType: 'head_top',
    anchorYOffset: -0.82,
    width: 280,
    height: 210,
    svg: `<svg viewBox="0 0 280 210" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="antlerBrown" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#b45309" />
          <stop offset="60%" stop-color="#78350f" />
          <stop offset="100%" stop-color="#451a03" />
        </linearGradient>
      </defs>
      <!-- Headband -->
      <path d="M 45 170 C 85 145, 195 145, 235 170" stroke="#15803d" stroke-width="9" fill="none" stroke-linecap="round" />
      <!-- Left Antler -->
      <path d="M 75 160 C 70 120, 50 80, 25 45 C 42 55, 52 75, 58 95 C 65 65, 68 35, 75 10 C 85 45, 88 85, 86 115 C 100 95, 115 78, 125 65 C 122 88, 110 110, 95 130 C 95 142, 92 154, 85 162 Z" fill="url(#antlerBrown)" stroke="#451a03" stroke-width="2.5" />
      <!-- Right Antler -->
      <path d="M 205 160 C 210 120, 230 80, 255 45 C 238 55, 228 75, 222 95 C 215 65, 212 35, 205 10 C 195 45, 192 85, 194 115 C 180 95, 165 78, 155 65 C 158 88, 170 110, 185 130 C 185 142, 188 154, 195 162 Z" fill="url(#antlerBrown)" stroke="#451a03" stroke-width="2.5" />
      <!-- Reindeer Ears -->
      <ellipse cx="48" cy="172" rx="20" ry="11" fill="#78350f" transform="rotate(-30 48 172)" />
      <ellipse cx="48" cy="172" rx="13" ry="6" fill="#fca5a5" transform="rotate(-30 48 172)" />
      <ellipse cx="232" cy="172" rx="20" ry="11" fill="#78350f" transform="rotate(30 232 172)" />
      <ellipse cx="232" cy="172" rx="13" ry="6" fill="#fca5a5" transform="rotate(30 232 172)" />
    </svg>`,
  },
  {
    id: 'prop_santa_beard',
    name: 'Barba de Santa',
    category: 'xmas',
    theme: 'xmas',
    defaultScale: 1.35,
    anchorType: 'chin',
    anchorYOffset: -0.2,
    width: 250,
    height: 220,
    svg: `<svg viewBox="0 0 250 220" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="beardGrad" cx="50%" cy="20%" r="80%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="70%" stop-color="#f8fafc" />
          <stop offset="100%" stop-color="#e2e8f0" />
        </radialGradient>
      </defs>
      <!-- Broad Full Facial Beard covering jaw and cheeks -->
      <path d="M 30 25 C 20 60, 25 105, 45 140 C 65 175, 95 205, 125 215 C 155 205, 185 175, 205 140 C 225 105, 230 60, 220 25 C 200 45, 175 48, 155 35 C 140 25, 125 25, 110 25 C 95 25, 80 25, 65 35 C 50 48, 40 40, 30 25 Z" fill="url(#beardGrad)" stroke="#cbd5e1" stroke-width="3" />
      <!-- Fluffy Mustache -->
      <path d="M 125 40 C 110 20, 85 12, 60 18 C 42 22, 38 35, 45 42 C 55 50, 75 45, 95 38 C 110 32, 120 40, 125 44 C 130 40, 140 32, 155 38 C 175 45, 195 50, 205 42 C 212 35, 208 22, 190 18 C 165 12, 140 20, 125 40 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="2.5" />
      <!-- Curl shadows -->
      <path d="M 75 90 Q 125 120 175 90" stroke="#cbd5e1" stroke-width="3" fill="none" opacity="0.6" stroke-linecap="round" />
      <path d="M 90 140 Q 125 160 160 140" stroke="#cbd5e1" stroke-width="3" fill="none" opacity="0.6" stroke-linecap="round" />
    </svg>`,
  },
  {
    id: 'prop_candy_glasses',
    name: 'Gafas Navideñas',
    category: 'xmas',
    theme: 'xmas',
    defaultScale: 0.98,
    anchorType: 'eyes',
    anchorYOffset: 0,
    width: 250,
    height: 95,
    svg: `<svg viewBox="0 0 250 95" xmlns="http://www.w3.org/2000/svg">
      <!-- Left Candy Cane Rim -->
      <circle cx="68" cy="48" r="32" fill="none" stroke="#ef4444" stroke-width="8" />
      <circle cx="68" cy="48" r="32" fill="none" stroke="#ffffff" stroke-width="8" stroke-dasharray="10,12" />
      <!-- Right Candy Cane Rim -->
      <circle cx="182" cy="48" r="32" fill="none" stroke="#ef4444" stroke-width="8" />
      <circle cx="182" cy="48" r="32" fill="none" stroke="#ffffff" stroke-width="8" stroke-dasharray="10,12" />
      <!-- Green Bridge with Mistletoe -->
      <path d="M 100 48 Q 125 36 150 48" stroke="#16a34a" stroke-width="6" fill="none" stroke-linecap="round" />
      <circle cx="125" cy="42" r="6" fill="#dc2626" />
      <ellipse cx="118" cy="36" rx="7" ry="3.5" fill="#15803d" transform="rotate(-30 118 36)" />
      <ellipse cx="132" cy="36" rx="7" ry="3.5" fill="#15803d" transform="rotate(30 132 36)" />
    </svg>`,
  },

  // =======================================================
  // 5. ACCESORIOS ADICIONALES (General Fun)
  // =======================================================
  {
    id: 'prop_cat_ears',
    name: 'Cat Ears',
    category: 'props',
    theme: 'all',
    defaultScale: 1.15,
    anchorType: 'head_top',
    anchorYOffset: -0.65,
    width: 220,
    height: 110,
    svg: `<svg viewBox="0 0 220 110" xmlns="http://www.w3.org/2000/svg">
      <path d="M 35 95 C 65 30, 155 30, 185 95" stroke="#1e293b" stroke-width="6" fill="none" stroke-linecap="round" />
      <polygon points="45,75 25,15 85,45" fill="#0f172a" stroke="#334155" stroke-width="2" />
      <polygon points="45,68 35,28 75,48" fill="#fb7185" />
      <polygon points="175,75 195,15 135,45" fill="#0f172a" stroke="#334155" stroke-width="2" />
      <polygon points="175,68 185,28 145,48" fill="#fb7185" />
    </svg>`,
  },
  {
    id: 'prop_bowtie',
    name: 'Moño Festivo',
    category: 'props',
    theme: 'all',
    defaultScale: 1.0,
    anchorType: 'neck',
    anchorYOffset: 0.25,
    width: 180,
    height: 90,
    svg: `<svg viewBox="0 0 180 90" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bowGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ef4444" />
          <stop offset="100%" stop-color="#b91c1c" />
        </linearGradient>
      </defs>
      <polygon points="90,45 15,10 15,80" fill="url(#bowGrad)" stroke="#ffffff" stroke-width="3" />
      <polygon points="25,25 25,65 80,45" fill="#991b1b" opacity="0.5" />
      <polygon points="90,45 165,10 165,80" fill="url(#bowGrad)" stroke="#ffffff" stroke-width="3" />
      <polygon points="155,25 155,65 100,45" fill="#991b1b" opacity="0.5" />
      <rect x="76" y="30" width="28" height="30" rx="8" fill="#fde047" stroke="#ffffff" stroke-width="3" />
    </svg>`,
  },
];
