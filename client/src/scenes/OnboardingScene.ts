import Phaser from 'phaser';
import { CameraAnalyzer } from '../systems/CameraAnalyzer';
import { RestClient } from '../utils/RestClient';
import { useGameStore } from '../store/gameStore';
import { LinhCan } from '@urban-xianxia/shared';
import { gameEventBus, GameEventMap } from '../utils/EventBus';

export class OnboardingScene extends Phaser.Scene {
  private cameraAnalyzer: CameraAnalyzer;
  private videoElement: HTMLVideoElement | null = null;
  private isCameraActive: boolean = false;
  
  // Handlers for cleanup
  private handlers: { [K in keyof GameEventMap]?: (data: GameEventMap[K]) => void } = {};

  constructor() {
    super('OnboardingScene');
    this.cameraAnalyzer = new CameraAnalyzer();
  }

  create() {
    useGameStore.getState().setScene('ONBOARDING');
    this.setupListeners();
  }

  private setupListeners() {
    // START CAMERA
    this.handlers['CMD_SCAN_CAMERA_START'] = () => this.startCameraScan();
    gameEventBus.on('CMD_SCAN_CAMERA_START', this.handlers['CMD_SCAN_CAMERA_START']!);

    // START RANDOM
    this.handlers['CMD_SCAN_RANDOM_START'] = () => this.performRandomScan();
    gameEventBus.on('CMD_SCAN_RANDOM_START', this.handlers['CMD_SCAN_RANDOM_START']!);

    // CONFIRM
    this.handlers['CMD_CONFIRM_CHARACTER'] = () => {
      const result = useGameStore.getState().scanResult;
      if (result) this.registerCharacter(result.linhCan);
    };
    gameEventBus.on('CMD_CONFIRM_CHARACTER', this.handlers['CMD_CONFIRM_CHARACTER']!);
  }

  // --- CAMERA MODE ---
  private async startCameraScan() {
    this.videoElement = document.createElement('video');
    Object.assign(this.videoElement.style, {
      position: 'absolute', top: '0', left: '0',
      width: '100%', height: '100%', objectFit: 'cover',
      zIndex: '-1',
    });
    this.videoElement.playsInline = true;
    document.body.appendChild(this.videoElement);

    const success = await this.cameraAnalyzer.startCamera(this.videoElement);

    if (success) {
      this.isCameraActive = true;
      this.time.delayedCall(2000, () => this.captureCameraResult());
    } else {
      if (this.videoElement) this.videoElement.remove();
      gameEventBus.emit('SIGNAL_SCAN_ERROR', 'CAMERA_DENIED');
    }
  }

  private captureCameraResult() {
    const result = this.cameraAnalyzer.captureAndAnalyze();
    this.stopCamera();

    if (result) {
      useGameStore.getState().setScanResult({
        linhCan: result.linhCan,
        color: result.dominantColor,
      });
    } else {
      this.performRandomScan();
    }
  }

  private stopCamera() {
    if (this.isCameraActive) {
      this.cameraAnalyzer.stopCamera();
      if (this.videoElement) this.videoElement.remove();
      this.isCameraActive = false;
    }
  }

  // --- RANDOM MODE ---
  private performRandomScan() {
    const linhCans = Object.values(LinhCan);
    const randomLinhCan = linhCans[Math.floor(Math.random() * linhCans.length)];
    const info = CameraAnalyzer.getLinhCanInfo(randomLinhCan);

    useGameStore.getState().setScanResult({
      linhCan: randomLinhCan,
      color: info.color,
    });
  }

  // --- REGISTRATION ---
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
    this.stopCamera();
    
    // Unsubscribe all
    if (this.handlers['CMD_SCAN_CAMERA_START']) 
        gameEventBus.off('CMD_SCAN_CAMERA_START', this.handlers['CMD_SCAN_CAMERA_START']!);
    if (this.handlers['CMD_SCAN_RANDOM_START']) 
        gameEventBus.off('CMD_SCAN_RANDOM_START', this.handlers['CMD_SCAN_RANDOM_START']!);
    if (this.handlers['CMD_CONFIRM_CHARACTER']) 
        gameEventBus.off('CMD_CONFIRM_CHARACTER', this.handlers['CMD_CONFIRM_CHARACTER']!);

    useGameStore.getState().setScanResult(null);
  }
}
