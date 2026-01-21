import { GestureType, VoiceCommand } from '@urban-xianxia/shared';

// Web Speech API Types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event) => void;
  onend: () => void;
}

// Global declaration for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: { new(): SpeechRecognition };
    webkitSpeechRecognition: { new(): SpeechRecognition };
  }
}

export class CombatSystem {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private voiceCommands: VoiceCommand[] = [];
  
  // Gesture state
  private points: { x: number; y: number }[] = [];
  private isDrawing: boolean = false;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  
  // Callbacks
  private onGestureDetected: ((gesture: GestureType) => void) | null = null;
  private onVoiceCommand: ((command: VoiceCommand) => void) | null = null;

  constructor() {
    this.setupVoiceRecognition();
  }

  /**
   * Initialize Combat System UI (Canvas for drawing)
   */
  initCanvas(canvasId: string): void {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.setupTouchEvents();
      
      // Resize canvas to fit container
      const resize = () => {
        if (this.canvas && this.canvas.parentElement) {
          this.canvas.width = this.canvas.parentElement.clientWidth;
          this.canvas.height = this.canvas.parentElement.clientHeight;
        }
      };
      window.addEventListener('resize', resize);
      resize();
    }
  }

  /**
   * Start combat session
   */
  startCombat(
    onGesture: (gesture: GestureType) => void,
    onVoice: (command: VoiceCommand) => void
  ): void {
    this.onGestureDetected = onGesture;
    this.onVoiceCommand = onVoice;
    this.startVoiceRecognition();
  }

  /**
   * End combat session
   */
  stopCombat(): void {
    this.stopVoiceRecognition();
    this.onGestureDetected = null;
    this.onVoiceCommand = null;
    this.clearCanvas();
  }

  // --- Voice Recognition Logic ---

  private setupVoiceRecognition(): void {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Web Speech API not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'vi-VN'; // Vietnamese language

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        const transcript = lastResult[0].transcript.toLowerCase().trim();
        console.log('Voice detected:', transcript);
        this.processVoiceCommand(transcript);
      }
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        try {
            this.recognition?.start(); // Restart if still supposed to be listening
        } catch (e) {
            // Ignore already started errors
        }
      }
    };
    
    // Default commands
    this.voiceCommands = [
      { keyword: 'bộc phá', action: 'attack_boost', linhKhiCost: 10 },
      { keyword: 'tấn công', action: 'attack_boost', linhKhiCost: 10 },
      { keyword: 'phòng thủ', action: 'shield', linhKhiCost: 15 },
      { keyword: 'bảo vệ', action: 'shield', linhKhiCost: 15 },
      { keyword: 'hồi phục', action: 'heal', linhKhiCost: 20 },
      { keyword: 'chữa trị', action: 'heal', linhKhiCost: 20 },
    ];
  }

  private startVoiceRecognition(): void {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
      } catch (error) {
        console.error('Failed to start voice recognition:', error);
      }
    }
  }

  private stopVoiceRecognition(): void {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      this.recognition.stop();
    }
  }

  private processVoiceCommand(transcript: string): void {
    const command = this.voiceCommands.find(cmd => transcript.includes(cmd.keyword));
    if (command && this.onVoiceCommand) {
      this.onVoiceCommand(command);
    }
  }

  // --- Gesture Recognition Logic ---

  private setupTouchEvents(): void {
    if (!this.canvas) return;

    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e.offsetX, e.offsetY));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e.offsetX, e.offsetY));
    this.canvas.addEventListener('mouseup', () => this.endDrawing());
    this.canvas.addEventListener('mouseleave', () => this.endDrawing());

    // Touch events
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas!.getBoundingClientRect();
      this.startDrawing(touch.clientX - rect.left, touch.clientY - rect.top);
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas!.getBoundingClientRect();
      this.draw(touch.clientX - rect.left, touch.clientY - rect.top);
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.endDrawing();
    });
  }

  private startDrawing(x: number, y: number): void {
    this.isDrawing = true;
    this.points = [{ x, y }];
    this.ctx?.beginPath();
    this.ctx?.moveTo(x, y);
    
    // Visual feedback
    if (this.ctx) {
      this.ctx.strokeStyle = '#00ffff'; // Cyan glowing line
      this.ctx.lineWidth = 5;
      this.ctx.lineCap = 'round';
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = '#00ffff';
    }
  }

  private draw(x: number, y: number): void {
    if (!this.isDrawing) return;
    this.points.push({ x, y });
    this.ctx?.lineTo(x, y);
    this.ctx?.stroke();
  }

  private endDrawing(): void {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.analyzeGesture();
    
    // Fade out effect (optional, here we just clear after a short delay)
    setTimeout(() => this.clearCanvas(), 500);
  }

  private clearCanvas(): void {
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  /**
   * Simple gesture recognizer
   */
  private analyzeGesture(): void {
    if (this.points.length < 10) return; // Ignore small dots

    // Normalize points
    const minX = Math.min(...this.points.map(p => p.x));
    const maxX = Math.max(...this.points.map(p => p.x));
    const minY = Math.min(...this.points.map(p => p.y));
    const maxY = Math.max(...this.points.map(p => p.y));
    const width = maxX - minX;
    const height = maxY - minY;

    if (width === 0 || height === 0) return;

    // Detect shapes based on bounding box and start/end points
    const start = this.points[0];
    const end = this.points[this.points.length - 1];
    
    // Simple heuristic for "V" shape (Sword Strike)
    // Starts high, goes down-right/down-left, then goes up
    const midIndex = Math.floor(this.points.length / 2);
    const mid = this.points[midIndex];
    
    const isV = start.y < mid.y && end.y < mid.y && Math.abs(start.x - end.x) > width * 0.3;
    
    // Simple heuristic for "Circle" (Shield)
    // Start and end are close
    const distStartEnd = Math.hypot(start.x - end.x, start.y - end.y);
    const isCircle = distStartEnd < (width + height) / 4 && this.points.length > 20;

    // Simple heuristic for "Horizontal Line" (Wave)
    const isHorizontal = height < width * 0.3;

    let detected: GestureType | null = null;

    if (isV) detected = GestureType.SWORD_STRIKE;
    else if (isCircle) detected = GestureType.SHIELD;
    else if (isHorizontal) detected = GestureType.WAVE;

    if (detected && this.onGestureDetected) {
      console.log('Gesture detected:', detected);
      this.onGestureDetected(detected);
    }
  }
}
