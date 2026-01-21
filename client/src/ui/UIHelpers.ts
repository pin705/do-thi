import Phaser from 'phaser';
import { COLORS, FONTS, STYLES } from '../theme';

export class UIHelpers {
  /**
   * Tạo Panel Glassmorphism chuẩn "Artifact"
   */
  static createGlassPanel(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);

    // Background blur simulation (Translucent rect)
    const bg = scene.add.graphics();
    bg.fillStyle(STYLES.GLASS_PANEL.fillStyle.color, STYLES.GLASS_PANEL.fillStyle.alpha);
    bg.fillRect(0, 0, width, height);

    // Sharp border (0.5px simulation -> 1px with low alpha)
    const border = scene.add.graphics();
    border.lineStyle(
      STYLES.GLASS_PANEL.lineStyle.width,
      STYLES.GLASS_PANEL.lineStyle.color,
      STYLES.GLASS_PANEL.lineStyle.alpha,
    );
    border.strokeRect(0, 0, width, height);

    // Deco corners (Mã code chạy mờ / Tọa độ số)
    const cornerSize = 10;
    const corner = scene.add.graphics();
    corner.lineStyle(1, COLORS.SPIRIT_TEAL, 0.5);

    // Top-Left Corner
    corner.beginPath();
    corner.moveTo(0, cornerSize);
    corner.lineTo(0, 0);
    corner.lineTo(cornerSize, 0);
    corner.strokePath();

    // Bottom-Right Corner
    corner.beginPath();
    corner.moveTo(width, height - cornerSize);
    corner.lineTo(width, height);
    corner.lineTo(width - cornerSize, height);
    corner.strokePath();

    container.add([bg, border, corner]);
    return container;
  }

  /**
   * Tạo Nút bấm Line-art
   */
  static createButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    onClick: () => void,
  ): Phaser.GameObjects.Container {
    const width = 200;
    const height = 50;
    const container = scene.add.container(x, y);

    // Interactive Zone
    const zone = scene.add
      .zone(0, 0, width, height)
      .setOrigin(0)
      .setInteractive({ useHandCursor: true });

    // Graphics
    const graphics = scene.add.graphics();

    const drawState = (isHover: boolean) => {
      graphics.clear();

      // Fill
      const style = isHover ? STYLES.BUTTON.hover : STYLES.BUTTON.default;
      graphics.fillStyle(style.color, style.alpha);
      graphics.fillRect(0, 0, width, height);

      // Stroke (Line-art: không khép kín)
      graphics.lineStyle(STYLES.BUTTON.stroke.width, STYLES.BUTTON.stroke.color);
      graphics.beginPath();
      graphics.moveTo(0, height); // Bottom Left
      graphics.lineTo(0, 0); // Top Left
      graphics.lineTo(width, 0); // Top Right
      graphics.lineTo(width, height / 2); // Right half down
      // Gap at bottom right
      graphics.strokePath();

      // Dot accent
      graphics.fillStyle(COLORS.SPIRIT_TEAL, 1);
      graphics.fillCircle(width - 10, height - 10, 2);
    };

    drawState(false);

    // Text
    const label = scene.add
      .text(width / 2, height / 2, text.toUpperCase(), {
        fontFamily: FONTS.MONO,
        fontSize: '16px',
        color: COLORS.HEX.MONOCHROME_TEXT,
      })
      .setOrigin(0.5);

    // Events
    zone.on('pointerover', () => drawState(true));
    zone.on('pointerout', () => drawState(false));
    zone.on('pointerdown', () => {
      // Glitch effect click
      scene.tweens.add({
        targets: container,
        x: x + 5,
        duration: 50,
        yoyo: true,
        onComplete: onClick,
      });
    });

    container.add([graphics, label, zone]);
    return container;
  }

  /**
   * Tạo Loading Spinner (Particle Ring)
   */
  static createSpinner(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);
    const radius = 30;

    // Create multiple dots
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dotX = Math.cos(angle) * radius;
      const dotY = Math.sin(angle) * radius;

      const dot = scene.add.circle(dotX, dotY, 3, COLORS.SPIRIT_TEAL);
      container.add(dot);

      // Animate opacity
      scene.tweens.add({
        targets: dot,
        alpha: 0,
        duration: 1000,
        delay: i * 100,
        repeat: -1,
        yoyo: true,
      });
    }

    return container;
  }
}
