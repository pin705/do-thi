import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    console.log('BootScene started');
    // Configure resizing
    this.scale.on('resize', this.resize, this);

    // Artificial delay to allow React to mount and user to see Boot screen
    this.scene.start('PreloadScene');
  }

  resize(gameSize: Phaser.Structs.Size) {
    const width = gameSize.width;
    const height = gameSize.height;

    this.cameras.resize(width, height);
  }
}
