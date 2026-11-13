/**
 * MediaPipe Face Mesh Integration for real-time AR facial accessory tracking.
 * Calculates facial anchors (eyes, forehead, chin, mouth) with angle tilt & scale.
 */

import { TrackedFace } from '../types/photobooth';

export class FaceTracker {
  private faceMesh: any = null;
  private isInitializing: boolean = false;
  private isReady: boolean = false;
  private trackedFaces: TrackedFace[] = [];
  private lastProcessedTimestamp: number = 0;
  private isProcessing: boolean = false;

  // Smoothing cache for jitter-free tracking
  private smoothedFace: TrackedFace | null = null;

  constructor() {
    this.initMediaPipe();
  }

  private async initMediaPipe() {
    if (typeof window === 'undefined') return;
    if (this.isInitializing || this.isReady) return;
    this.isInitializing = true;

    try {
      // Check if FaceMesh script from CDN is loaded on window
      const checkInterval = setInterval(() => {
        const FaceMeshClass = (window as any).FaceMesh;
        if (FaceMeshClass) {
          clearInterval(checkInterval);
          this.setupFaceMesh(FaceMeshClass);
        }
      }, 200);

      // Timeout check after 10s
      setTimeout(() => clearInterval(checkInterval), 10000);
    } catch (err) {
      console.warn('FaceMesh initialization notice:', err);
    }
  }

  private setupFaceMesh(FaceMeshClass: any) {
    try {
      this.faceMesh = new FaceMeshClass({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      this.faceMesh.setOptions({
        maxNumFaces: 2,
        refineLandmarks: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.faceMesh.onResults((results: any) => {
        this.handleResults(results);
        this.isProcessing = false;
      });

      this.isReady = true;
      this.isInitializing = false;
      console.log('MediaPipe FaceMesh initialized successfully.');
    } catch (err) {
      console.warn('Failed to configure FaceMesh instance:', err);
      this.isInitializing = false;
    }
  }

  public async processFrame(videoElement: HTMLVideoElement) {
    if (!this.isReady || !this.faceMesh || this.isProcessing) return;
    if (videoElement.readyState < 2) return;

    const now = performance.now();
    // Throttle inference to ~30 FPS for optimal battery and smooth canvas 60 FPS rendering
    if (now - this.lastProcessedTimestamp < 33) return;
    this.lastProcessedTimestamp = now;

    this.isProcessing = true;
    try {
      await this.faceMesh.send({ image: videoElement });
    } catch {
      this.isProcessing = false;
    }
  }

  private handleResults(results: any) {
    if (!results || !results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      this.trackedFaces = [];
      return;
    }

    const newFaces: TrackedFace[] = [];

    for (let f = 0; f < results.multiFaceLandmarks.length; f++) {
      const landmarks = results.multiFaceLandmarks[f];

      const p1 = landmarks[1] || landmarks[4] || landmarks[2];
      const p9 = landmarks[9] || landmarks[10];
      const p10 = landmarks[10];
      const p33 = landmarks[33] || landmarks[130];
      const p263 = landmarks[263] || landmarks[359];
      const p168 = landmarks[168] || landmarks[6];
      const p164 = landmarks[164] || landmarks[2] || landmarks[0] || landmarks[13];
      const p152 = landmarks[152];
      const p234 = landmarks[234];
      const p454 = landmarks[454];
      const p13 = landmarks[13] || landmarks[14] || landmarks[0] || p164;
      const p14 = landmarks[14] || landmarks[17] || landmarks[13] || p152;

      if (!p33 || !p263 || !p10 || !p152 || !p234 || !p454) continue;

      const rawFace: TrackedFace = {
        p1: { x: (p1 || p168).x, y: (p1 || p168).y },
        p33: { x: p33.x, y: p33.y },
        p263: { x: p263.x, y: p263.y },
        p168: { x: (p168 || p33).x, y: (p168 || p33).y },
        p10: { x: p10.x, y: p10.y },
        p9: { x: (p9 || p10).x, y: (p9 || p10).y },
        p164: { x: (p164 || p152).x, y: (p164 || p152).y },
        p152: { x: p152.x, y: p152.y },
        p234: { x: p234.x, y: p234.y },
        p454: { x: p454.x, y: p454.y },
        p13: { x: (p13 || p164).x, y: (p13 || p164).y },
        p14: { x: (p14 || p152).x, y: (p14 || p152).y },
      };

      // Linear interpolation (lerp) for buttery smooth face tracking (60 FPS without jitter)
      if (f === 0 && this.smoothedFace) {
        const lerpFactor = 0.45; // Smooth interpolation factor
        const s = this.smoothedFace;
        const lerpCoord = (curr: { x: number; y: number }, prev: { x: number; y: number }) => ({
          x: prev.x + (curr.x - prev.x) * lerpFactor,
          y: prev.y + (curr.y - prev.y) * lerpFactor,
        });

        const smoothed: TrackedFace = {
          p1: lerpCoord(rawFace.p1, s.p1 || rawFace.p1),
          p33: lerpCoord(rawFace.p33, s.p33),
          p263: lerpCoord(rawFace.p263, s.p263),
          p168: lerpCoord(rawFace.p168, s.p168), // Eyes / Glasses anchor
          p10: lerpCoord(rawFace.p10, s.p10),   // Forehead / Hats anchor
          p9: lerpCoord(rawFace.p9, s.p9 || rawFace.p9),
          p164: lerpCoord(rawFace.p164, s.p164), // Nose base / Mustache anchor
          p152: lerpCoord(rawFace.p152, s.p152), // Chin / Beard anchor
          p234: lerpCoord(rawFace.p234, s.p234), // Left ear / Face width
          p454: lerpCoord(rawFace.p454, s.p454), // Right ear / Face width
          p13: lerpCoord(rawFace.p13, s.p13 || rawFace.p13),
          p14: lerpCoord(rawFace.p14, s.p14 || rawFace.p14),
        };
        this.smoothedFace = smoothed;
        newFaces.push(smoothed);
      } else {
        if (f === 0) this.smoothedFace = rawFace;
        newFaces.push(rawFace);
      }
    }

    this.trackedFaces = newFaces;
  }

  public getFaces(): TrackedFace[] {
    return this.trackedFaces;
  }

  public getPrimaryFace(): TrackedFace | null {
    return this.trackedFaces.length > 0 ? this.trackedFaces[0] : null;
  }

  public isTracking(): boolean {
    return this.trackedFaces.length > 0;
  }

  public isInitialized(): boolean {
    return this.isReady;
  }
}

export const faceTracker = new FaceTracker();
