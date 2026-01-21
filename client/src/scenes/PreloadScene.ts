import Phaser from 'phaser';
import { useGameStore } from '../store/gameStore';
import { gameEventBus } from '../utils/EventBus';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    useGameStore.getState().setScene('PRELOAD');
    this.generateTextures();
    this.createDummyLoad();

    this.load.on('progress', (value: number) => {
      gameEventBus.emit('SIGNAL_LOAD_PROGRESS', value);
    });
  }

  create() {
    const characterId = localStorage.getItem('character_id');
    this.time.delayedCall(500, () => {
      if (characterId) {
        this.scene.start('GameScene', { characterId });
      } else {
        this.scene.start('LoginScene'); // Go to Login instead of Onboarding
      }
    });
  }

  private createDummyLoad() {
    for (let i = 0; i < 50; i++) {
      this.load.image(
        `dummy${i}`,
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      );
    }
  }

  private generateTextures() {
    // Generate Particle
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x2dd4bf, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('particle', 8, 8);

    // Generate Herb Icon (Diamond)
    graphics.clear();
    graphics.lineStyle(2, 0x22c55e);
    graphics.fillStyle(0x22c55e, 0.5);
    graphics.beginPath();
    graphics.moveTo(16, 0);
    graphics.lineTo(32, 16);
    graphics.lineTo(16, 32);
    graphics.lineTo(0, 16);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
    graphics.generateTexture('herb_icon', 32, 32);
  }
}
