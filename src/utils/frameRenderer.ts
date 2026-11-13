import { FrameSettings, EventConfig } from '../types/photobooth';

/**
 * Draws frame borders and event text overlays onto a canvas.
 * Includes complete Christmas frames: Guirnaldas de Pino & Tarjeta Postal Navideña.
 */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: FrameSettings,
  isStrip: boolean = false
): void {
  if (settings.style === 'none') return;

  ctx.save();

  const primaryColor = settings.accentColor || '#ffffff';

  // ==========================================
  // 1. MARCO DE GUIRNALDAS DE PINO (XMAS WREATH)
  // ==========================================
  if (settings.style === 'xmas_wreath') {
    const garlandDepth = Math.floor(Math.min(width, height) * 0.055);

    // Pine branches pattern around border
    ctx.fillStyle = '#14532d';
    // Top & Bottom garlands
    for (let x = 0; x < width; x += 18) {
      // Top garland boughs
      ctx.beginPath();
      ctx.ellipse(x, garlandDepth * 0.5, 14, garlandDepth * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Bottom garland boughs
      ctx.beginPath();
      ctx.ellipse(x, height - garlandDepth * 0.5, 14, garlandDepth * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Left & Right garlands
    for (let y = 0; y < height; y += 18) {
      ctx.beginPath();
      ctx.ellipse(garlandDepth * 0.5, y, garlandDepth * 0.6, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(width - garlandDepth * 0.5, y, garlandDepth * 0.6, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Inner Pine needles highlights
    ctx.fillStyle = '#16a34a';
    for (let i = 0; i < 60; i++) {
      const px = (i * 27) % width;
      const isTop = i % 2 === 0;
      ctx.beginPath();
      ctx.arc(px, isTop ? garlandDepth * 0.4 : height - garlandDepth * 0.4, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Twinkling Holiday Lights (Red, Gold, Blue, Green, Pink)
    const lightColors = ['#ef4444', '#facc15', '#38bdf8', '#22c55e', '#ec4899', '#ffffff'];
    const numLights = 36;
    for (let i = 0; i < numLights; i++) {
      const col = lightColors[i % lightColors.length];
      const pos = i / numLights;
      let lx = 0, ly = 0;
      if (pos < 0.25) {
        lx = pos * 4 * width;
        ly = garlandDepth * 0.6;
      } else if (pos < 0.5) {
        lx = width - garlandDepth * 0.6;
        ly = (pos - 0.25) * 4 * height;
      } else if (pos < 0.75) {
        lx = (1 - (pos - 0.5) * 4) * width;
        ly = height - garlandDepth * 0.6;
      } else {
        lx = garlandDepth * 0.6;
        ly = (1 - (pos - 0.75) * 4) * height;
      }

      // Bulb
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(lx, ly, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Soft Glow
      ctx.fillStyle = col;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(lx, ly, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    // Shiny Christmas Baubles / Esferas in corners
    const baubleCorners = [
      { x: garlandDepth * 1.2, y: garlandDepth * 1.2, c: '#ef4444' },
      { x: width - garlandDepth * 1.2, y: garlandDepth * 1.2, c: '#f59e0b' },
      { x: garlandDepth * 1.2, y: height - garlandDepth * 1.2, c: '#f59e0b' },
      { x: width - garlandDepth * 1.2, y: height - garlandDepth * 1.2, c: '#ef4444' },
    ];
    baubleCorners.forEach(b => {
      // Bauble body
      ctx.fillStyle = b.c;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 11, 0, Math.PI * 2);
      ctx.fill();
      // Reflection glint
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(b.x - 3, b.y - 3, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Festive Bottom Banner
    if (settings.eventTitle || settings.eventDate) {
      const bannerH = Math.floor(height * (isStrip ? 0.08 : 0.12));
      const grad = ctx.createLinearGradient(0, height - garlandDepth - bannerH, 0, height - garlandDepth);
      grad.addColorStop(0, 'rgba(15, 23, 42, 0.85)');
      grad.addColorStop(1, 'rgba(5, 10, 20, 0.95)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(width * 0.1, height - garlandDepth - bannerH, width * 0.8, bannerH, 16);
      ctx.fill();

      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#fde047';
      const titleSize = Math.max(16, Math.floor(width * 0.038));
      ctx.font = `700 ${titleSize}px 'Outfit', sans-serif`;
      ctx.fillText(settings.eventTitle || '¡FELIZ NAVIDAD!', width / 2, height - garlandDepth - bannerH * 0.52);

      const sub = [settings.eventSubtitle, settings.eventDate].filter(Boolean).join('  ·  ');
      if (sub) {
        ctx.font = `500 ${Math.max(11, Math.floor(titleSize * 0.55))}px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(sub, width / 2, height - garlandDepth - bannerH * 0.22);
      }
    }
  }

  // ==========================================
  // 2. MARCO TARJETA POSTAL NAVIDEÑA (XMAS POSTCARD)
  // ==========================================
  else if (settings.style === 'xmas_postcard') {
    const borderW = Math.floor(Math.min(width, height) * 0.038);

    // Candy-Cane outer border
    ctx.lineWidth = borderW;
    ctx.strokeStyle = '#dc2626';
    ctx.strokeRect(borderW / 2, borderW / 2, width - borderW, height - borderW);

    // White candy stripes along perimeter
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    for (let x = 0; x < width; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + borderW, borderW);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, height - borderW);
      ctx.lineTo(x + borderW, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 22) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(borderW, y + borderW);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(width - borderW, y);
      ctx.lineTo(width, y + borderW);
      ctx.stroke();
    }

    // Inner gold hairline
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.strokeRect(borderW + 4, borderW + 4, width - (borderW + 4) * 2, height - (borderW + 4) * 2);

    // Postage Stamp in Top-Right Corner
    const stampW = Math.floor(width * 0.12);
    const stampH = Math.floor(stampW * 1.15);
    const stampX = width - borderW - stampW - 14;
    const stampY = borderW + 14;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(stampX, stampY, stampW, stampH);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(stampX + 3, stampY + 3, stampW - 6, stampH - 6);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#dc2626';
    ctx.font = `700 ${Math.max(10, Math.floor(stampW * 0.22))}px 'Outfit', sans-serif`;
    ctx.fillText('NOEL', stampX + stampW / 2, stampY + stampH * 0.42);
    ctx.font = `600 ${Math.max(9, Math.floor(stampW * 0.18))}px 'JetBrains Mono', monospace`;
    ctx.fillText(new Date().getFullYear().toString(), stampX + stampW / 2, stampY + stampH * 0.75);

    // Bottom Postal Greeting Ribbon
    if (settings.eventTitle || settings.eventDate) {
      const bannerH = Math.floor(height * (isStrip ? 0.09 : 0.14));
      ctx.fillStyle = 'rgba(153, 27, 27, 0.95)';
      ctx.beginPath();
      ctx.roundRect(borderW + 12, height - borderW - bannerH - 6, width - (borderW + 12) * 2, bannerH, 12);
      ctx.fill();

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      const titleSize = Math.max(16, Math.floor(width * 0.04));
      ctx.font = `700 ${titleSize}px 'Outfit', serif`;
      ctx.fillText(settings.eventTitle || '¡Feliz Navidad!', width / 2, height - borderW - bannerH * 0.52);

      const sub = [settings.eventSubtitle, settings.eventDate].filter(Boolean).join('  ·  ');
      if (sub) {
        ctx.font = `500 ${Math.max(11, Math.floor(titleSize * 0.52))}px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillStyle = '#fef08a';
        ctx.fillText(sub, width / 2, height - borderW - bannerH * 0.22);
      }
    }
  }

  // ==========================================
  // 3. WEDDING: GEOMÉTRICO DORADO CON EUCALIPTO (GOLD GEOMETRIC & EUCALYPTUS)
  // ==========================================
  else if (settings.style === 'wedding_gold_geom' || settings.style === 'wedding') {
    const inset = Math.floor(Math.min(width, height) * 0.04);
    const goldGrad = ctx.createLinearGradient(0, 0, width, height);
    goldGrad.addColorStop(0, '#fef08a');
    goldGrad.addColorStop(0.3, '#d97706');
    goldGrad.addColorStop(0.7, '#fde047');
    goldGrad.addColorStop(1, '#b45309');

    // Outer Thin Gold Line
    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 3;
    ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);

    // Inner Secondary Gold Hairline
    ctx.lineWidth = 1.5;
    ctx.strokeRect(inset + 8, inset + 8, width - (inset + 8) * 2, height - (inset + 8) * 2);

    // Geometric Diamond / Octagon Corner Accents
    const cornerSize = Math.floor(inset * 1.8);
    const cornerPoints = [
      { x: inset, y: inset, dx: 1, dy: 1 },
      { x: width - inset, y: inset, dx: -1, dy: 1 },
      { x: inset, y: height - inset, dx: 1, dy: -1 },
      { x: width - inset, y: height - inset, dx: -1, dy: -1 },
    ];

    cornerPoints.forEach((c) => {
      ctx.save();
      ctx.translate(c.x, c.y);

      // Diamond corner
      ctx.beginPath();
      ctx.moveTo(0, c.dy * cornerSize * 0.8);
      ctx.lineTo(c.dx * cornerSize * 0.8, 0);
      ctx.lineTo(0, -c.dy * cornerSize * 0.8);
      ctx.lineTo(-c.dx * cornerSize * 0.8, 0);
      ctx.closePath();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Watercolor Eucalyptus Branch
      const leafColors = ['#15803d', '#166534', '#14532d', '#4ade80'];
      for (let i = 0; i < 5; i++) {
        const lx = c.dx * (12 + i * 11);
        const ly = c.dy * (8 + (i % 2) * 14);
        ctx.fillStyle = leafColors[i % leafColors.length];
        ctx.beginPath();
        ctx.ellipse(lx, ly, 11, 6.5, (c.dx * c.dy * Math.PI) / 4 + (i * 0.2), 0, Math.PI * 2);
        ctx.fill();

        // Delicate gold leaf vein
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lx - 5, ly);
        ctx.lineTo(lx + 5, ly);
        ctx.stroke();

        // White floral bud
        if (i % 2 === 0) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(lx + c.dx * 7, ly - 5, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    });

    // Elegant Lower Wedding Plaque
    if (settings.eventTitle || settings.eventDate) {
      const bannerH = Math.floor(height * (isStrip ? 0.08 : 0.13));
      const grad = ctx.createLinearGradient(0, height - inset - bannerH - 12, 0, height - inset);
      grad.addColorStop(0, 'rgba(15, 12, 9, 0.7)');
      grad.addColorStop(0.5, 'rgba(23, 18, 14, 0.95)');
      grad.addColorStop(1, 'rgba(10, 8, 6, 0.98)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(width * 0.12, height - inset - bannerH - 8, width * 0.76, bannerH, 16);
      ctx.fill();

      ctx.strokeStyle = goldGrad;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#fef08a';
      const titleSize = Math.max(16, Math.floor(width * 0.04));
      ctx.font = `600 ${titleSize}px 'Dancing Script', 'Playfair Display', serif`;
      ctx.fillText(settings.eventTitle || 'Nuestra Boda', width / 2, height - inset - bannerH * 0.52);

      const sub = [settings.eventSubtitle, settings.eventDate].filter(Boolean).join('  ·  ');
      if (sub) {
        ctx.font = `400 ${Math.max(11, Math.floor(titleSize * 0.52))}px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillStyle = '#fde68a';
        ctx.fillText(sub, width / 2, height - inset - bannerH * 0.22);
      }
    }
  }

  // ==========================================
  // 4. WEDDING: MINIMALISTA BLANCO MARFIL (IVORY & CALLIGRAPHY)
  // ==========================================
  else if (settings.style === 'wedding_ivory') {
    const borderW = Math.floor(Math.min(width, height) * 0.045);

    // Ivory Silk Passe-partout Border
    ctx.fillStyle = '#fdfbf7';
    ctx.fillRect(0, 0, width, borderW);
    ctx.fillRect(0, 0, borderW, height);
    ctx.fillRect(width - borderW, 0, borderW, height);
    ctx.fillRect(0, height - borderW, width, borderW);

    // Inner Gold Inset Bevel
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(borderW, borderW, width - borderW * 2, height - borderW * 2);

    // Outer Fine Line
    ctx.strokeStyle = '#e7e5e4';
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 4, width - 8, height - 8);

    // Delicate Filigree Corner Brackets
    const brLen = Math.floor(borderW * 1.6);
    const corners = [
      { x: borderW, y: borderW, dx: 1, dy: 1 },
      { x: width - borderW, y: borderW, dx: -1, dy: 1 },
      { x: borderW, y: height - borderW, dx: 1, dy: -1 },
      { x: width - borderW, y: height - borderW, dx: -1, dy: -1 },
    ];
    corners.forEach((c) => {
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c.x + c.dx * brLen, c.y);
      ctx.lineTo(c.x, c.y);
      ctx.lineTo(c.x, c.y + c.dy * brLen);
      ctx.stroke();

      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.arc(c.x + c.dx * 8, c.y + c.dy * 8, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Lower Calligraphic Inscription
    if (settings.eventTitle || settings.eventDate) {
      const bannerH = Math.floor(height * (isStrip ? 0.08 : 0.12));
      ctx.fillStyle = '#fdfbf7';
      ctx.beginPath();
      ctx.roundRect(width * 0.15, height - borderW - bannerH - 4, width * 0.7, bannerH + borderW, 14);
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#292524';
      const titleSize = Math.max(16, Math.floor(width * 0.038));
      ctx.font = `700 ${titleSize}px 'Playfair Display', 'Dancing Script', serif`;
      ctx.fillText(settings.eventTitle || 'Nuestra Boda', width / 2, height - borderW - bannerH * 0.5);

      const sub = [settings.eventSubtitle, settings.eventDate].filter(Boolean).join('  ·  ');
      if (sub) {
        ctx.font = `500 ${Math.max(11, Math.floor(titleSize * 0.5))}px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillStyle = '#78716c';
        ctx.fillText(sub, width / 2, height - borderW - bannerH * 0.2);
      }
    }
  }

  // ==========================================
  // 5. PARTY: GLOBOS DE COLORES Y SERPENTINAS (BALLOONS & STREAMERS)
  // ==========================================
  else if (settings.style === 'party_balloons' || settings.style === 'party') {
    const inset = Math.floor(Math.min(width, height) * 0.035);

    // Colorful Perimeter Border
    const partyGrad = ctx.createLinearGradient(0, 0, width, height);
    partyGrad.addColorStop(0, '#ec4899');
    partyGrad.addColorStop(0.33, '#8b5cf6');
    partyGrad.addColorStop(0.66, '#06b6d4');
    partyGrad.addColorStop(1, '#f59e0b');
    ctx.strokeStyle = partyGrad;
    ctx.lineWidth = 5;
    ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);

    // Floating Glossy Balloons in Top Corners & Edges
    const balloonColors = [
      { base: '#f43f5e', dark: '#be123c', hi: '#fda4af' }, // Pink
      { base: '#06b6d4', dark: '#0e7490', hi: '#a5f3fc' }, // Cyan
      { base: '#facc15', dark: '#ca8a04', hi: '#fef08a' }, // Yellow
      { base: '#22c55e', dark: '#15803d', hi: '#bbf7d0' }, // Green
      { base: '#a855f7', dark: '#7e22ce', hi: '#e9d5ff' }, // Purple
      { base: '#f97316', dark: '#c2410c', hi: '#fed7aa' }, // Orange
    ];

    const balloonClusters = [
      // Top-Left Cluster
      { x: inset + 18, y: inset + 24, r: 24, col: balloonColors[0] },
      { x: inset + 52, y: inset + 16, r: 21, col: balloonColors[1] },
      { x: inset + 28, y: inset + 64, r: 19, col: balloonColors[2] },
      // Top-Right Cluster
      { x: width - inset - 22, y: inset + 24, r: 24, col: balloonColors[4] },
      { x: width - inset - 55, y: inset + 18, r: 20, col: balloonColors[0] },
      { x: width - inset - 30, y: inset + 64, r: 18, col: balloonColors[3] },
      // Bottom Corners
      { x: inset + 24, y: height - inset - 30, r: 20, col: balloonColors[5] },
      { x: width - inset - 24, y: height - inset - 30, r: 20, col: balloonColors[1] },
    ];

    balloonClusters.forEach((b) => {
      ctx.save();
      // Balloon Body
      const bGrad = ctx.createRadialGradient(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.1, b.x, b.y, b.r);
      bGrad.addColorStop(0, b.col.hi);
      bGrad.addColorStop(0.5, b.col.base);
      bGrad.addColorStop(1, b.col.dark);
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.ellipse(b.x, b.y, b.r * 0.9, b.r * 1.1, 0, 0, Math.PI * 2);
      ctx.fill();

      // Specular Highlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(b.x - b.r * 0.35, b.y - b.r * 0.4, b.r * 0.3, b.r * 0.15, -0.4, 0, Math.PI * 2);
      ctx.fill();

      // Tie Knot
      ctx.fillStyle = b.col.dark;
      ctx.beginPath();
      ctx.moveTo(b.x - 3, b.y + b.r * 1.1);
      ctx.lineTo(b.x + 3, b.y + b.r * 1.1);
      ctx.lineTo(b.x, b.y + b.r * 1.1 + 5);
      ctx.fill();

      // Hanging Wavy String
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y + b.r * 1.1 + 5);
      ctx.quadraticCurveTo(b.x + 8, b.y + b.r * 1.1 + 20, b.x - 4, b.y + b.r * 1.1 + 35);
      ctx.stroke();

      ctx.restore();
    });

    // Curly Party Streamers along left and right borders
    const streamerColors = ['#f43f5e', '#06b6d4', '#facc15', '#a855f7'];
    for (let i = 0; i < 28; i++) {
      const sy = inset + (i * (height - inset * 2)) / 28;
      const sxLeft = inset + 8 + Math.sin(i * 0.7) * 6;
      const sxRight = width - inset - 8 + Math.sin(i * 0.7) * 6;
      ctx.fillStyle = streamerColors[i % streamerColors.length];
      ctx.beginPath();
      ctx.arc(sxLeft, sy, 3, 0, Math.PI * 2);
      ctx.arc(sxRight, sy, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Party Lower Banner
    if (settings.eventTitle || settings.eventDate) {
      const bannerH = Math.floor(height * (isStrip ? 0.08 : 0.12));
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.beginPath();
      ctx.roundRect(width * 0.12, height - inset - bannerH - 8, width * 0.76, bannerH, 16);
      ctx.fill();

      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      const titleSize = Math.max(16, Math.floor(width * 0.042));
      ctx.font = `800 ${titleSize}px 'Outfit', sans-serif`;
      ctx.fillText(settings.eventTitle || '¡MODO FIESTA!', width / 2, height - inset - bannerH * 0.52);

      const sub = [settings.eventSubtitle, settings.eventDate].filter(Boolean).join('  ·  ');
      if (sub) {
        ctx.font = `600 ${Math.max(11, Math.floor(titleSize * 0.52))}px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillStyle = '#fde047';
        ctx.fillText(sub, width / 2, height - inset - bannerH * 0.22);
      }
    }
  }

  // ==========================================
  // 6. PARTY: RETRO POLAROID ("¡Feliz Cumpleaños!")
  // ==========================================
  else if (settings.style === 'party_polaroid') {
    const sideInset = Math.floor(width * 0.045);
    const topInset = Math.floor(width * 0.045);
    const bottomInset = Math.floor(height * (isStrip ? 0.09 : 0.16));

    // Polaroid Cream Photo Card
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, topInset);
    ctx.fillRect(0, 0, sideInset, height);
    ctx.fillRect(width - sideInset, 0, sideInset, height);
    ctx.fillRect(0, height - bottomInset, width, bottomInset);

    // Inner Shadow Line
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(sideInset, topInset, width - sideInset * 2, height - topInset - bottomInset);

    // Fun Washi Tape on Top-Right Corner
    ctx.save();
    ctx.translate(width - sideInset * 1.8, topInset * 0.5);
    ctx.rotate(0.18);
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(-35, -12, 70, 24);
    // Washi pattern dots
    ctx.fillStyle = '#ffffff';
    for (let dx = -25; dx <= 25; dx += 12) {
      ctx.beginPath();
      ctx.arc(dx, 0, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Handwritten Marker Note on Bottom Margin
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    const titleSize = Math.max(16, Math.floor(width * 0.044));
    ctx.font = `700 ${titleSize}px 'Lobster', 'Caveat', cursive, sans-serif`;
    ctx.fillText(settings.eventTitle || '¡Feliz Cumpleaños!', width / 2, height - bottomInset * 0.54);

    const sub = [settings.eventSubtitle, settings.eventDate].filter(Boolean).join('  ·  ');
    if (sub) {
      ctx.font = `600 ${Math.max(11, Math.floor(titleSize * 0.48))}px 'Plus Jakarta Sans', monospace`;
      ctx.fillStyle = '#475569';
      ctx.fillText(sub, width / 2, height - bottomInset * 0.24);
    }
  }

  // ==========================================
  // 7. CORPORATIVO / GRADUACIÓN: EJECUTIVO SOBRIO CON LAURELES (FORMAL & ACADEMY)
  // ==========================================
  else if (settings.style === 'corp_executive') {
    const borderW = Math.floor(Math.min(width, height) * 0.04);

    // Deep Navy Outer Border
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, borderW);
    ctx.fillRect(0, 0, borderW, height);
    ctx.fillRect(width - borderW, 0, borderW, height);
    ctx.fillRect(0, height - borderW, width, borderW);

    // Double Brushed Gold Pinstripes
    const goldGrad = ctx.createLinearGradient(0, 0, width, height);
    goldGrad.addColorStop(0, '#fef08a');
    goldGrad.addColorStop(0.5, '#d97706');
    goldGrad.addColorStop(1, '#a16207');

    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(borderW - 2, borderW - 2, width - (borderW - 2) * 2, height - (borderW - 2) * 2);

    ctx.lineWidth = 1;
    ctx.strokeRect(borderW + 4, borderW + 4, width - (borderW + 4) * 2, height - (borderW + 4) * 2);

    // Golden Academic Laurel Wreath Sprigs in Corners
    const laurelCorners = [
      { x: borderW + 6, y: borderW + 6, dx: 1, dy: 1 },
      { x: width - borderW - 6, y: borderW + 6, dx: -1, dy: 1 },
      { x: borderW + 6, y: height - borderW - 6, dx: 1, dy: -1 },
      { x: width - borderW - 6, y: height - borderW - 6, dx: -1, dy: -1 },
    ];

    laurelCorners.forEach((c) => {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(c.dx * 16, c.dy * 16, 16, 0, Math.PI / 2);
      ctx.stroke();

      // Laurel leaves
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.ellipse(c.dx * (8 + i * 8), c.dy * (18 - i * 3), 7, 3.5, (c.dx * c.dy * Math.PI) / 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // Formal Lower Crest Plaque
    if (settings.eventTitle || settings.eventDate) {
      const bannerH = Math.floor(height * (isStrip ? 0.08 : 0.13));
      ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
      ctx.beginPath();
      ctx.roundRect(width * 0.12, height - borderW - bannerH - 6, width * 0.76, bannerH, 12);
      ctx.fill();

      ctx.strokeStyle = goldGrad;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#fde047';
      const titleSize = Math.max(15, Math.floor(width * 0.038));
      ctx.font = `700 ${titleSize}px 'Montserrat', 'Outfit', sans-serif`;
      ctx.fillText(settings.eventTitle || 'GRADUACIÓN & GALA', width / 2, height - borderW - bannerH * 0.52);

      const sub = [settings.eventSubtitle, settings.eventDate].filter(Boolean).join('  |  ');
      if (sub) {
        ctx.font = `600 ${Math.max(10, Math.floor(titleSize * 0.52))}px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(sub, width / 2, height - borderW - bannerH * 0.22);
      }
    }
  }

  // ==========================================
  // 8. CORPORATIVO / GRADUACIÓN: MODERNO BISELADO TECH (BISEL & HASHTAG)
  // ==========================================
  else if (settings.style === 'corp_modern') {
    const inset = Math.floor(Math.min(width, height) * 0.035);
    const chamfer = Math.floor(inset * 1.5);

    // Modern 45-degree Chamfered Frame Path
    ctx.beginPath();
    ctx.moveTo(inset + chamfer, inset);
    ctx.lineTo(width - inset - chamfer, inset);
    ctx.lineTo(width - inset, inset + chamfer);
    ctx.lineTo(width - inset, height - inset - chamfer);
    ctx.lineTo(width - inset - chamfer, height - inset);
    ctx.lineTo(inset + chamfer, height - inset);
    ctx.lineTo(inset, height - inset - chamfer);
    ctx.lineTo(inset, inset + chamfer);
    ctx.closePath();

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Inner Cyan Glow Line
    ctx.beginPath();
    ctx.moveTo(inset + chamfer + 6, inset + 6);
    ctx.lineTo(width - inset - chamfer - 6, inset + 6);
    ctx.lineTo(width - inset - 6, inset + chamfer + 6);
    ctx.lineTo(width - inset - 6, height - inset - chamfer - 6);
    ctx.lineTo(width - inset - chamfer - 6, height - inset - 6);
    ctx.lineTo(inset + chamfer + 6, height - inset - 6);
    ctx.lineTo(inset + 6, height - inset - chamfer - 6);
    ctx.lineTo(inset + 6, inset + chamfer + 6);
    ctx.closePath();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Corner Tech Targeting Crosshairs
    const crossCorners = [
      { x: inset + chamfer, y: inset },
      { x: width - inset - chamfer, y: inset },
      { x: inset + chamfer, y: height - inset },
      { x: width - inset - chamfer, y: height - inset },
    ];
    crossCorners.forEach((pt) => {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(pt.x - 3, pt.y - 3, 6, 6);
    });

    // Sleek Lower Tech Banner for Event & Hashtag
    if (settings.eventTitle || settings.eventDate) {
      const bannerH = Math.floor(height * (isStrip ? 0.07 : 0.11));
      ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
      ctx.fillRect(inset + 8, height - inset - bannerH - 4, width - (inset + 8) * 2, bannerH);

      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(inset + 8, height - inset - bannerH - 4, width - (inset + 8) * 2, bannerH);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#f8fafc';
      const titleSize = Math.max(14, Math.floor(width * 0.038));
      ctx.font = `700 ${titleSize}px 'Outfit', sans-serif`;
      ctx.fillText(settings.eventTitle || 'ANNUAL SUMMIT', width / 2, height - inset - bannerH * 0.48);

      const sub = [settings.eventSubtitle, settings.eventDate].filter(Boolean).join('  ·  ');
      if (sub) {
        ctx.font = `600 ${Math.max(10, Math.floor(titleSize * 0.55))}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(sub, width / 2, height - inset - bannerH * 0.18);
      }
    }
  }

  // ==========================================
  // 5. RETRO POLAROID
  // ==========================================
  else if (settings.style === 'retro') {
    const sideInset = Math.floor(width * 0.04);
    const topInset = Math.floor(width * 0.04);
    const bottomInset = Math.floor(height * (isStrip ? 0.08 : 0.15));

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, topInset);
    ctx.fillRect(0, 0, sideInset, height);
    ctx.fillRect(width - sideInset, 0, sideInset, height);
    ctx.fillRect(0, height - bottomInset, width, bottomInset);

    if (settings.eventTitle || settings.eventDate) {
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1e293b';
      const titleSize = Math.max(16, Math.floor(width * 0.038));
      ctx.font = `600 ${titleSize}px 'Outfit', serif`;
      ctx.fillText(settings.eventTitle || 'Best Night Ever', width / 2, height - bottomInset * 0.52);

      if (settings.eventDate) {
        ctx.font = `400 ${Math.max(11, Math.floor(titleSize * 0.55))}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = '#64748b';
        ctx.fillText(settings.eventDate, width / 2, height - bottomInset * 0.22);
      }
    }
  }

  // ==========================================
  // 6. CYBER NEON
  // ==========================================
  else if (settings.style === 'neon') {
    const inset = Math.floor(Math.min(width, height) * 0.03);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);

    const brLen = Math.floor(width * 0.08);
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(inset, inset + brLen); ctx.lineTo(inset, inset); ctx.lineTo(inset + brLen, inset);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width - inset - brLen, inset); ctx.lineTo(width - inset, inset); ctx.lineTo(width - inset, inset + brLen);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(inset, height - inset - brLen); ctx.lineTo(inset, height - inset); ctx.lineTo(inset + brLen, height - inset);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width - inset - brLen, height - inset); ctx.lineTo(width - inset, height - inset); ctx.lineTo(width - inset, height - inset - brLen);
    ctx.stroke();

    if (settings.eventTitle) {
      const bannerH = Math.floor(height * (isStrip ? 0.06 : 0.09));
      ctx.fillStyle = 'rgba(6, 2, 20, 0.85)';
      ctx.fillRect(width * 0.15, height - inset - bannerH, width * 0.7, bannerH);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.strokeRect(width * 0.15, height - inset - bannerH, width * 0.7, bannerH);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#f43f5e';
      const titleSize = Math.max(14, Math.floor(width * 0.035));
      ctx.font = `700 ${titleSize}px 'Outfit', sans-serif`;
      ctx.fillText(settings.eventTitle, width / 2, height - inset - bannerH * 0.45);

      if (settings.eventDate) {
        ctx.fillStyle = '#38bdf8';
        ctx.font = `500 ${Math.max(10, Math.floor(titleSize * 0.6))}px 'JetBrains Mono', monospace`;
        ctx.fillText(settings.eventDate, width / 2, height - inset - bannerH * 0.18);
      }
    }
  }

  // ==========================================
  // 7. MINIMAL STUDIO
  // ==========================================
  else if (settings.style === 'minimal') {
    const inset = Math.floor(Math.min(width, height) * 0.025);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);

    if (settings.eventTitle) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      const bH = Math.floor(height * 0.08);
      ctx.fillRect(inset, height - inset - bH, width - inset * 2, bH);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      const titleSize = Math.max(14, Math.floor(width * 0.035));
      ctx.font = `600 ${titleSize}px 'Outfit', sans-serif`;
      ctx.fillText(settings.eventTitle, width / 2, height - inset - bH * 0.45);

      if (settings.eventDate) {
        ctx.font = `400 ${Math.max(11, Math.floor(titleSize * 0.6))}px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(settings.eventDate, width / 2, height - inset - bH * 0.18);
      }
    }
  }
  // ==========================================
  // 8. CUSTOM TRANSPARENT PNG FRAME OVERLAY
  // ==========================================
  else if (settings.style === 'custom' && settings.customFrameUrl) {
    const frameImg = new Image();
    frameImg.src = settings.customFrameUrl;
    if (frameImg.complete && frameImg.naturalWidth > 0) {
      ctx.drawImage(frameImg, 0, 0, width, height);
    }
  }

  ctx.restore();
}

/**
 * Composes 3 or 4 individual captured photo canvases into a classic vertical 2x6 photo booth strip.
 * Respects EventConfig for custom colors, background image, logos, hashtag, and font family.
 */
/**
 * Composes captured photo canvases into an elegant Horizontal Photo Strip (1920 x 1080 Landscape).
 * Displays 3 photos side-by-side with top event branding header and bottom date & hashtag footer.
 */
export function composePhotoStrip(
  shots: HTMLCanvasElement[],
  settings: FrameSettings,
  eventConfig?: EventConfig
): HTMLCanvasElement {
  const stripWidth = 1920;
  const stripHeight = 1080; // Strictly horizontal 16:9 landscape

  const stripCanvas = document.createElement('canvas');
  stripCanvas.width = stripWidth;
  stripCanvas.height = stripHeight;
  const ctx = stripCanvas.getContext('2d')!;

  const isXmas = settings.style === 'xmas_wreath' || settings.style === 'xmas_postcard';
  const isDarkFrame = settings.style === 'neon';
  const fontFam = settings.fontFamily || eventConfig?.fontFamily || 'Outfit';

  // 1. Draw Base Background (Custom image or Solid Color)
  if (eventConfig?.stripBgType === 'image' && eventConfig.stripBgImageUrl) {
    const bgImg = new Image();
    bgImg.src = eventConfig.stripBgImageUrl;
    if (bgImg.complete && bgImg.naturalWidth > 0) {
      ctx.drawImage(bgImg, 0, 0, stripWidth, stripHeight);
    } else {
      ctx.fillStyle = eventConfig.stripBgColor || '#7f1d1d';
      ctx.fillRect(0, 0, stripWidth, stripHeight);
    }
  } else if (eventConfig?.stripBgColor) {
    ctx.fillStyle = eventConfig.stripBgColor;
    ctx.fillRect(0, 0, stripWidth, stripHeight);
  } else if (isXmas) {
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(0, 0, stripWidth, stripHeight);
  } else if (isDarkFrame) {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, stripWidth, stripHeight);
  } else {
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, stripWidth, stripHeight);
  }

  // 2. Horizontal Strip Layout Dimensions
  const shotCount = eventConfig?.stripShotCount === 4 ? 4 : Math.min(3, Math.max(1, shots.length));
  const headerHeight = 120;
  const footerHeight = 110;
  const marginX = 50;
  const availableW = stripWidth - marginX * 2;
  const gap = 30;
  const photoW = Math.floor((availableW - gap * (shotCount - 1)) / shotCount);
  const photoH = stripHeight - headerHeight - footerHeight - 40;
  const photoY = headerHeight + 20;

  // 3. Draw Header (Logo + Title + Subtitle)
  let textStartX = stripWidth / 2;
  ctx.textAlign = 'center';
  ctx.fillStyle = isXmas ? '#fef08a' : isDarkFrame ? '#38bdf8' : eventConfig?.accentColor || '#f8fafc';
  ctx.font = `800 38px '${fontFam}', sans-serif`;
  ctx.fillText(settings.eventTitle || eventConfig?.eventTitle || (isXmas ? '¡FELIZ NAVIDAD!' : 'PHOTO BOOTH'), textStartX, 60);

  const sub = settings.eventSubtitle || eventConfig?.eventSubtitle;
  if (sub) {
    ctx.font = `500 20px '${fontFam}', sans-serif`;
    ctx.fillStyle = isXmas ? '#fecaca' : isDarkFrame ? '#94a3b8' : '#cbd5e1';
    ctx.fillText(sub, textStartX, 95);
  }

  // 4. Draw Shots (3 or 4 photos side-by-side horizontally)
  shots.slice(0, shotCount).forEach((shot, index) => {
    const px = marginX + index * (photoW + gap);

    ctx.save();
    ctx.beginPath();
    const radius = 16;
    ctx.roundRect(px, photoY, photoW, photoH, radius);
    ctx.clip();

    const sRatio = shot.width / shot.height;
    const tRatio = photoW / photoH;
    let sx = 0, sy = 0, sw = shot.width, sh = shot.height;

    if (sRatio > tRatio) {
      sw = shot.height * tRatio;
      sx = (shot.width - sw) / 2;
    } else {
      sh = shot.width / tRatio;
      sy = (shot.height - sh) / 2;
    }

    ctx.drawImage(shot, sx, sy, sw, sh, px, photoY, photoW, photoH);
    ctx.restore();

    // Outline stroke
    ctx.strokeStyle = isXmas ? '#fde047' : isDarkFrame ? 'rgba(255,255,255,0.2)' : eventConfig?.primaryColor || 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(px, photoY, photoW, photoH, radius);
    ctx.stroke();
  });

  // 5. Draw Footer (Date, Custom Hashtag & Footer Text)
  const fy = stripHeight - footerHeight + 25;
  ctx.textAlign = 'center';

  const showDate = eventConfig ? eventConfig.footerShowDate !== false : true;
  const showHashtag = eventConfig ? eventConfig.footerShowHashtag && !!eventConfig.eventHashtag : true;

  if (showDate) {
    ctx.fillStyle = isXmas ? '#ffffff' : '#f8fafc';
    ctx.font = `600 24px '${fontFam}', sans-serif`;
    const dateText = settings.eventDate || new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    ctx.fillText(dateText, stripWidth / 2 - 220, fy + 35);
  }

  if (showHashtag && eventConfig?.eventHashtag) {
    ctx.font = `800 24px '${fontFam}', sans-serif`;
    ctx.fillStyle = isXmas ? '#fef08a' : isDarkFrame ? '#38bdf8' : eventConfig?.primaryColor || '#ec4899';
    ctx.fillText(eventConfig.eventHashtag, stripWidth / 2 + 220, fy + 35);
  }

  const bottomText = eventConfig?.footerCustomText || (isXmas ? '★ RECUERDOS NAVIDEÑOS ★' : '★ SNAPKIOSK MEMORIES ★');
  ctx.font = `700 18px 'JetBrains Mono', monospace`;
  ctx.fillStyle = isXmas ? '#fef08a' : '#94a3b8';
  ctx.fillText(bottomText, stripWidth / 2, fy + 35);

  // Border
  ctx.strokeStyle = isXmas ? '#fde047' : 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, stripWidth - 40, stripHeight - 40);

  return stripCanvas;
}

/**
 * Composes 4 captured photo canvases into an elegant 2x2 grid Collage print in Landscape 16:9 (1920 x 1080 px).
 */
export function composePhotoCollage2x2(
  shots: HTMLCanvasElement[],
  settings: FrameSettings,
  eventConfig?: EventConfig
): HTMLCanvasElement {
  const collageWidth = 1920;
  const collageHeight = 1080;

  const canvas = document.createElement('canvas');
  canvas.width = collageWidth;
  canvas.height = collageHeight;
  const ctx = canvas.getContext('2d')!;

  const fontFam = settings.fontFamily || eventConfig?.fontFamily || 'Outfit';
  const isXmas = settings.style === 'xmas_wreath' || settings.style === 'xmas_postcard';

  // 1. Base Background
  if (eventConfig?.stripBgType === 'image' && eventConfig.stripBgImageUrl) {
    const bgImg = new Image();
    bgImg.src = eventConfig.stripBgImageUrl;
    if (bgImg.complete && bgImg.naturalWidth > 0) {
      ctx.drawImage(bgImg, 0, 0, collageWidth, collageHeight);
    } else {
      ctx.fillStyle = eventConfig.stripBgColor || '#0f172a';
      ctx.fillRect(0, 0, collageWidth, collageHeight);
    }
  } else if (eventConfig?.stripBgColor) {
    ctx.fillStyle = eventConfig.stripBgColor;
    ctx.fillRect(0, 0, collageWidth, collageHeight);
  } else {
    ctx.fillStyle = isXmas ? '#7f1d1d' : '#0a0f1d';
    ctx.fillRect(0, 0, collageWidth, collageHeight);
  }

  // 2. Left 2x2 Grid Area (1300px width), Right Branding Sidebar (520px width)
  const gridMarginX = 60;
  const gridMarginY = 60;
  const gridW = 1260;
  const gridH = collageHeight - gridMarginY * 2;
  const cellGap = 24;
  const cellW = (gridW - cellGap) / 2;
  const cellH = (gridH - cellGap) / 2;

  const positions = [
    { x: gridMarginX, y: gridMarginY },
    { x: gridMarginX + cellW + cellGap, y: gridMarginY },
    { x: gridMarginX, y: gridMarginY + cellH + cellGap },
    { x: gridMarginX + cellW + cellGap, y: gridMarginY + cellH + cellGap },
  ];

  positions.forEach((pos, i) => {
    const shot = shots[i % shots.length];
    if (!shot) return;

    ctx.save();
    ctx.beginPath();
    const radius = 16;
    ctx.roundRect(pos.x, pos.y, cellW, cellH, radius);
    ctx.clip();

    const sRatio = shot.width / shot.height;
    const tRatio = cellW / cellH;
    let sx = 0, sy = 0, sw = shot.width, sh = shot.height;

    if (sRatio > tRatio) {
      sw = shot.height * tRatio;
      sx = (shot.width - sw) / 2;
    } else {
      sh = shot.width / tRatio;
      sy = (shot.height - sh) / 2;
    }

    ctx.drawImage(shot, sx, sy, sw, sh, pos.x, pos.y, cellW, cellH);
    ctx.restore();

    // Outline
    ctx.strokeStyle = isXmas ? '#fde047' : eventConfig?.primaryColor || 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(pos.x, pos.y, cellW, cellH, radius);
    ctx.stroke();
  });

  // 3. Right Sidebar Branding Pane
  const sideX = gridMarginX + gridW + 40;
  const sideW = collageWidth - sideX - 50;
  const sideCenterX = sideX + sideW / 2;

  ctx.textAlign = 'center';
  ctx.fillStyle = isXmas ? '#fef08a' : eventConfig?.accentColor || '#ffffff';
  ctx.font = `800 44px '${fontFam}', sans-serif`;
  ctx.fillText(settings.eventTitle || eventConfig?.eventTitle || 'MEMORIES', sideCenterX, 280);

  const sub = settings.eventSubtitle || eventConfig?.eventSubtitle;
  if (sub) {
    ctx.font = `500 24px '${fontFam}', sans-serif`;
    ctx.fillStyle = isXmas ? '#fecaca' : '#94a3b8';
    ctx.fillText(sub, sideCenterX, 340);
  }

  // Date
  ctx.fillStyle = '#ffffff';
  ctx.font = `600 30px '${fontFam}', sans-serif`;
  ctx.fillText(
    settings.eventDate || new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    sideCenterX,
    440
  );

  // Hashtag
  if (eventConfig?.eventHashtag) {
    ctx.font = `700 28px '${fontFam}', sans-serif`;
    ctx.fillStyle = isXmas ? '#fde047' : eventConfig?.primaryColor || '#38bdf8';
    ctx.fillText(eventConfig.eventHashtag, sideCenterX, 510);
  }

  // Footer note
  ctx.font = `500 18px 'JetBrains Mono', monospace`;
  ctx.fillStyle = '#64748b';
  ctx.fillText('SNAPKIOSK PRO · 2026', sideCenterX, 780);

  // Outer border
  ctx.strokeStyle = isXmas ? '#fde047' : 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 3;
  ctx.strokeRect(25, 25, collageWidth - 50, collageHeight - 50);

  return canvas;
}

  // 4. Footer


/**
 * Korean Life4Cuts (인생네컷) 4-shot Horizontal Photo Strip (1920 x 1080 Landscape).
 * Classic high-end aesthetic with 4 sequential shots side-by-side, minimalist framing,
 * numbering (01, 02, 03, 04), event date, hashtag & barcode.
 */
export function composeLife4CutsStrip(
  shots: HTMLCanvasElement[],
  settings: FrameSettings,
  eventConfig?: EventConfig
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const stripWidth = 1920;
  const stripHeight = 1080;
  canvas.width = stripWidth;
  canvas.height = stripHeight;
  const ctx = canvas.getContext('2d')!;

  const bgColor = eventConfig?.life4cutsBgColor || '#ffffff';
  const isDarkBg = bgColor === '#000000' || bgColor === '#121212' || bgColor === '#0a0a0a';
  const textColor = isDarkBg ? '#f8fafc' : '#1e293b';
  const subtextColor = isDarkBg ? '#94a3b8' : '#64748b';
  const fontFam = settings.fontFamily || eventConfig?.fontFamily || 'Outfit';

  // 1. Background fill
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, stripWidth, stripHeight);

  // Top header (minimalist branding)
  const headerHeight = 90;
  ctx.textAlign = 'center';
  ctx.fillStyle = textColor;
  ctx.font = `800 24px '${fontFam}', sans-serif`;
  ctx.letterSpacing = '4px';
  ctx.fillText('• LIFE 4 CUTS •', stripWidth / 2, 55);
  ctx.letterSpacing = '0px';

  // 2. 4 sequential photo slots side-by-side horizontally
  const marginX = 40;
  const availableW = stripWidth - marginX * 2; // 1840px
  const gap = 24; // 3 * 24 = 72px
  const photoW = Math.floor((availableW - gap * 3) / 4); // ~442px
  const footerHeight = 130;
  const photoH = stripHeight - headerHeight - footerHeight - 30; // ~830px
  const photoY = headerHeight + 15;

  const totalShots = 4;
  for (let i = 0; i < totalShots; i++) {
    const shot = shots[i % shots.length];
    const px = marginX + i * (photoW + gap);

    if (shot) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(px, photoY, photoW, photoH);
      ctx.clip();

      const sRatio = shot.width / shot.height;
      const tRatio = photoW / photoH;
      let sx = 0, sy = 0, sw = shot.width, sh = shot.height;

      if (sRatio > tRatio) {
        sw = shot.height * tRatio;
        sx = (shot.width - sw) / 2;
      } else {
        sh = shot.width / tRatio;
        sy = (shot.height - sh) / 2;
      }

      ctx.drawImage(shot, sx, sy, sw, sh, px, photoY, photoW, photoH);
      ctx.restore();

      // Thin inner outline around photo
      ctx.strokeStyle = isDarkBg ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 2;
      ctx.strokeRect(px, photoY, photoW, photoH);

      // Minimalist sequence badge "01", "02", "03", "04" in top corner
      ctx.fillStyle = isDarkBg ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)';
      ctx.fillRect(px + 10, photoY + 10, 36, 24);
      ctx.fillStyle = isDarkBg ? '#ffffff' : '#0f172a';
      ctx.font = `700 13px '${fontFam}', monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`0${i + 1}`, px + 28, photoY + 27);
    }
  }

  // 3. Footer branding
  const footerStartY = stripHeight - footerHeight + 20;
  ctx.textAlign = 'center';

  // Event Title
  ctx.fillStyle = textColor;
  ctx.font = `800 24px '${fontFam}', sans-serif`;
  ctx.fillText(settings.eventTitle || eventConfig?.eventTitle || 'LIFE4CUTS MEMORIES', stripWidth / 2 - 240, footerStartY + 35);

  // Subtitle / Date
  const dateStr = settings.eventDate || new Date().toISOString().slice(0, 10).replace(/-/g, '.');
  ctx.fillStyle = subtextColor;
  ctx.font = `600 18px '${fontFam}', sans-serif`;
  ctx.fillText(dateStr, stripWidth / 2, footerStartY + 35);

  // Hashtag
  if (eventConfig?.eventHashtag) {
    ctx.fillStyle = eventConfig.primaryColor || (isDarkBg ? '#38bdf8' : '#e11d48');
    ctx.font = `800 20px '${fontFam}', sans-serif`;
    ctx.fillText(eventConfig.eventHashtag, stripWidth / 2 + 240, footerStartY + 35);
  }

  // Authentic barcode line graphic at bottom
  ctx.fillStyle = isDarkBg ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.18)';
  const barY = stripHeight - 45;
  const barW = 280;
  const barStartX = (stripWidth - barW) / 2;
  for (let b = 0; b < barW; b += 4) {
    const lineWidth = (b % 12 === 0) ? 2.5 : 1;
    ctx.fillRect(barStartX + b, barY, lineWidth, 16);
  }

  return canvas;
}

