/**
 * Chroma Key (Green / Blue screen) algorithm with color suppression,
 * tolerance, smoothing, and edge spill removal.
 */

export interface ChromaKeySettings {
  enabled: boolean;
  color: string; // Hex color e.g. '#00ff00'
  tolerance: number; // 0.05 to 0.70
  smoothness: number; // 0.01 to 0.30
  spillSuppression: boolean;
  backdropId: string;
  customBackdropUrl: string | null;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 0, g: 255, b: 0 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Applies chroma keying directly to an ImageData object.
 * Returns the modified ImageData where key color pixels are made transparent.
 */
export function applyChromaKey(
  imageData: ImageData,
  keyR: number,
  keyG: number,
  keyB: number,
  tolerance: number, // 0 to 1
  smoothness: number, // 0 to 1
  spillSuppression: boolean = true
): void {
  const data = imageData.data;
  const len = data.length;

  // Max Euclidean distance is sqrt(255^2 + 255^2 + 255^2) ≈ 441.6729559
  const maxDist = 441.6729559;
  const tolDist = tolerance * maxDist;
  const smoothDist = Math.max(1, smoothness * maxDist);
  const minThreshold = Math.max(0, tolDist - smoothDist);

  const isGreenKey = keyG > keyR + 30 && keyG > keyB + 30;
  const isBlueKey = keyB > keyR + 30 && keyB > keyG + 30;

  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Euclidean distance in RGB color space
    const dr = r - keyR;
    const dg = g - keyG;
    const db = b - keyB;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);

    if (dist <= minThreshold) {
      // Fully within key color tolerance -> full transparency
      data[i + 3] = 0;
    } else if (dist < tolDist) {
      // Transition range -> linear alpha ramp for smooth feathering
      const alphaFactor = (dist - minThreshold) / smoothDist;
      data[i + 3] = Math.floor(alphaFactor * data[i + 3]);

      // Spill suppression on transition edges
      if (spillSuppression) {
        if (isGreenKey) {
          const maxRB = Math.max(r, b);
          if (data[i + 1] > maxRB) {
            data[i + 1] = maxRB;
          }
        } else if (isBlueKey) {
          const maxRG = Math.max(r, g);
          if (data[i + 2] > maxRG) {
            data[i + 2] = maxRG;
          }
        }
      }
    } else if (spillSuppression && dist < tolDist + 25) {
      // Subtle edge color decontamination
      if (isGreenKey) {
        const maxRB = Math.max(r, b);
        if (data[i + 1] > maxRB) {
          data[i + 1] = Math.floor((data[i + 1] + maxRB) / 2);
        }
      } else if (isBlueKey) {
        const maxRG = Math.max(r, g);
        if (data[i + 2] > maxRG) {
          data[i + 2] = Math.floor((data[i + 2] + maxRG) / 2);
        }
      }
    }
  }
}
