import Phaser from 'phaser';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './components/App';
import './styles/global.css';

import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { OnboardingScene } from './scenes/OnboardingScene';
import { GameScene } from './scenes/GameScene';

// Initialize React UI
const uiRoot = document.getElementById('ui-root');
if (uiRoot) {
  ReactDOM.createRoot(uiRoot).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Initialize Phaser Game
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'phaser-container', // Attach to specific container
  backgroundColor: 'transparent',
  dom: {
    createContainer: true
  },
  scene: [BootScene, PreloadScene, OnboardingScene, GameScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
