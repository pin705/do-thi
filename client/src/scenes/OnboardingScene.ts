import Phaser from 'phaser';
import { CameraAnalyzer } from '../systems/CameraAnalyzer';
import { RestClient } from '../utils/RestClient';
import { useGameStore } from '../store/gameStore';
import { LinhCan } from '@urban-xianxia/shared';

export class OnboardingScene extends Phaser.Scene {
  private cameraAnalyzer: CameraAnalyzer;
  private videoElement: HTMLVideoElement | null = null;
  private eventListener: ((e: Event) => void) | null = null;

  constructor() {
    super('OnboardingScene');
    this.cameraAnalyzer = new CameraAnalyzer();
  }

  create() {
    useGameStore.getState().setScene('ONBOARDING');
    this.startCamera();
    this.setupReactListeners();
  }

  private setupReactListeners() {
    this.eventListener = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { type } = customEvent.detail;

      if (type === 'SCAN_START') {
        this.performScan();
      } else if (type === 'CONFIRM_CHARACTER') {
        const result = useGameStore.getState().scanResult;
        if (result) {
          this.registerCharacter(result.linhCan);
        }
      }
    };

    window.addEventListener('PHASER_ACTION', this.eventListener);
  }

  private async startCamera() {
    this.videoElement = document.createElement('video');
    Object.assign(this.videoElement.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      zIndex: '-1',
    });
    this.videoElement.playsInline = true;
    document.body.appendChild(this.videoElement);

    const success = await this.cameraAnalyzer.startCamera(this.videoElement);
    if (!success) {
      console.error('Camera failed');
      // Could allow fallback flow here
    }
  }

  private performScan() {
    // Logic delay simulation handled by React UI mostly, but here we do the work
    const result = this.cameraAnalyzer.captureAndAnalyze();

    // Simulate complex calculation delay
    this.time.delayedCall(1500, () => {
      if (result) {
        useGameStore.getState().setScanResult({
          linhCan: result.linhCan,
          color: result.dominantColor,
        });
        useGameStore.getState().setIsScanning(false);
      }
    });
  }

  private async registerCharacter(linhCan: LinhCan) {
    try {
      const data = await RestClient.post<{ id: string; name: string }>('/player', { linhCan });
      localStorage.setItem('character_id', data.id);

      this.cleanup();
      this.scene.start('GameScene', { characterId: data.id });
    } catch (error) {
      console.error(error);
    }
  }

  private cleanup() {
    this.cameraAnalyzer.stopCamera();
    if (this.videoElement) this.videoElement.remove();
    if (this.eventListener) window.removeEventListener('PHASER_ACTION', this.eventListener);

    // Reset Store Scan State
    useGameStore.getState().setScanResult(null);
    useGameStore.getState().setIsScanning(false);
  }
}
