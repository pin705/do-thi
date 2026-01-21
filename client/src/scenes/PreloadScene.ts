import Phaser from 'phaser';
import { useGameStore } from '../store/gameStore';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    // Sync Scene State
    useGameStore.getState().setScene('PRELOAD');

    this.generateTextures();
    this.createDummyLoad();

    this.load.on('progress', (value: number) => {
      // Dispatch Event for React UI
      window.dispatchEvent(
        new CustomEvent('PHASER_LOAD_PROGRESS', { detail: { progress: value } }),
      );
    });
  }

  create() {
    // Check LocalStorage for existing Character ID
    const characterId = localStorage.getItem('character_id');

    // Smooth transition delay
    this.time.delayedCall(500, () => {
      if (characterId) {
        this.scene.start('GameScene', { characterId });
      } else {
        this.scene.start('OnboardingScene');
      }
    });
  }

  private createDummyLoad() {
    // Fake loading time
    for (let i = 0; i < 50; i++) {
      this.load.image(
        `dummy${i}`,
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      );
    }
  }

  private generateTextures() {
    // Generate a simple "Particle" texture
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x2dd4bf, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('particle', 8, 8);

    // Generate Herb Icon (Simple Diamond Shape)
    graphics.clear();
    graphics.lineStyle(2, 0x22c55e);
    graphics.fillStyle(0x22c55e, 0.5);
    graphics.beginPath();
    graphics.moveTo(16, 0);    // Top
    graphics.lineTo(32, 16);   // Right
    graphics.lineTo(16, 32);   // Bottom
    graphics.lineTo(0, 16);    // Left
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
    graphics.generateTexture('herb_icon', 32, 32);
  }
}
