import { LinhCan } from '@urban-xianxia/shared';

export interface ColorRange {
  hueMin: number;
  hueMax: number;
  name: string;
  linhCan: LinhCan;
  color: string;
}

// Color ranges for Linh Căn detection (HSL-based)
const COLOR_RANGES: ColorRange[] = [
  { hueMin: 40, hueMax: 70, name: 'Vàng (Kim)', linhCan: LinhCan.KIM, color: '#FFD700' },
  { hueMin: 80, hueMax: 160, name: 'Xanh lá (Mộc)', linhCan: LinhCan.MOC, color: '#228B22' },
  { hueMin: 180, hueMax: 260, name: 'Xanh dương (Thủy)', linhCan: LinhCan.THUY, color: '#1E90FF' },
  { hueMin: 0, hueMax: 30, name: 'Đỏ (Hỏa)', linhCan: LinhCan.HOA, color: '#FF4500' },
  { hueMin: 330, hueMax: 360, name: 'Đỏ (Hỏa)', linhCan: LinhCan.HOA, color: '#FF4500' },
  { hueMin: 20, hueMax: 45, name: 'Nâu (Thổ)', linhCan: LinhCan.THO, color: '#8B4513' },
];

export class CameraAnalyzer {
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private stream: MediaStream | null = null;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Request camera permission and start video stream
   */
  async startCamera(videoElement: HTMLVideoElement): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      
      videoElement.srcObject = this.stream;
      await videoElement.play();
      
      this.video = videoElement;
      this.canvas.width = videoElement.videoWidth || 640;
      this.canvas.height = videoElement.videoHeight || 480;
      
      return true;
    } catch (error) {
      console.error('Camera access denied:', error);
      return false;
    }
  }

  /**
   * Stop camera stream
   */
  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.video = null;
  }

  /**
   * Capture current frame and analyze dominant color
   */
  captureAndAnalyze(): { linhCan: LinhCan; confidence: number; dominantColor: string } | null {
    if (!this.video) return null;

    // Draw current frame to canvas
    this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    
    // Get image data from center region (focus on face area)
    const centerX = this.canvas.width * 0.25;
    const centerY = this.canvas.height * 0.25;
    const sampleWidth = this.canvas.width * 0.5;
    const sampleHeight = this.canvas.height * 0.5;
    
    const imageData = this.ctx.getImageData(centerX, centerY, sampleWidth, sampleHeight);
    
    return this.analyzePixels(imageData);
  }

  /**
   * Analyze pixels to determine dominant color and Linh Căn
   */
  private analyzePixels(imageData: ImageData): { linhCan: LinhCan; confidence: number; dominantColor: string } {
    const pixels = imageData.data;
    const hueHistogram: Record<number, number> = {};
    
    // Sample every 4th pixel for performance
    for (let i = 0; i < pixels.length; i += 16) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      // Convert RGB to HSL
      const { h, s, l } = this.rgbToHsl(r, g, b);
      
      // Skip very dark or very light pixels (background/highlights)
      if (l < 0.15 || l > 0.85 || s < 0.2) continue;
      
      // Round hue to nearest 10 degrees for bucketing
      const hueBucket = Math.round(h / 10) * 10;
      hueHistogram[hueBucket] = (hueHistogram[hueBucket] || 0) + 1;
    }

    // Find dominant hue
    let dominantHue = 0;
    let maxCount = 0;
    let totalSamples = 0;

    for (const [hue, count] of Object.entries(hueHistogram)) {
      totalSamples += count;
      if (count > maxCount) {
        maxCount = count;
        dominantHue = parseInt(hue);
      }
    }

    // Determine Linh Căn from dominant hue
    const result = this.hueTolinhCan(dominantHue);
    const confidence = totalSamples > 0 ? maxCount / totalSamples : 0;

    return {
      linhCan: result.linhCan,
      confidence: Math.min(confidence * 2, 1), // Scale confidence
      dominantColor: result.color,
    };
  }

  /**
   * Convert RGB to HSL
   */
  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0;
    let s = 0;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
          break;
        case g:
          h = ((b - r) / d + 2) * 60;
          break;
        case b:
          h = ((r - g) / d + 4) * 60;
          break;
      }
    }

    return { h, s, l };
  }

  /**
   * Map hue value to Linh Căn
   */
  private hueTolinhCan(hue: number): { linhCan: LinhCan; color: string } {
    for (const range of COLOR_RANGES) {
      if (hue >= range.hueMin && hue <= range.hueMax) {
        return { linhCan: range.linhCan, color: range.color };
      }
    }
    
    // Default to Earth (Thổ) for undefined colors
    return { linhCan: LinhCan.THO, color: '#8B4513' };
  }

  /**
   * Get Linh Căn display info
   */
  static getLinhCanInfo(linhCan: LinhCan): { name: string; element: string; color: string; description: string } {
    const info: Record<LinhCan, { name: string; element: string; color: string; description: string }> = {
      [LinhCan.KIM]: {
        name: 'Kim Linh Căn',
        element: 'Kim (Metal)',
        color: '#FFD700',
        description: 'Sắc bén, cương nghị. Thiên phú về kiếm thuật và công pháp sát thương.',
      },
      [LinhCan.MOC]: {
        name: 'Mộc Linh Căn',
        element: 'Mộc (Wood)',
        color: '#228B22',
        description: 'Sinh sôi, trường thọ. Thiên phú về luyện đan và thuật trị liệu.',
      },
      [LinhCan.THUY]: {
        name: 'Thủy Linh Căn',
        element: 'Thủy (Water)',
        color: '#1E90FF',
        description: 'Linh hoạt, thâm sâu. Thiên phú về phòng ngự và thuật ẩn hình.',
      },
      [LinhCan.HOA]: {
        name: 'Hỏa Linh Căn',
        element: 'Hỏa (Fire)',
        color: '#FF4500',
        description: 'Mãnh liệt, bùng nổ. Thiên phú về luyện khí và công pháp diện rộng.',
      },
      [LinhCan.THO]: {
        name: 'Thổ Linh Căn',
        element: 'Thổ (Earth)',
        color: '#8B4513',
        description: 'Vững chãi, bền bỉ. Thiên phú về phòng thủ và trận pháp.',
      },
    };
    
    return info[linhCan];
  }
}
