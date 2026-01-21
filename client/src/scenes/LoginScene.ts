import Phaser from 'phaser';
import { useGameStore } from '../store/gameStore';
import { gameEventBus } from '../utils/EventBus';

export class LoginScene extends Phaser.Scene {
  constructor() {
    super('LoginScene');
  }

  create() {
    useGameStore.getState().setScene('LOGIN');

    // Listen for successful login from React UI
    const handler = () => {
        const charId = localStorage.getItem('character_id');
        if (charId) {
            this.scene.start('GameScene', { characterId: charId });
        }
    };
    
    // Use manual listener since we need to remove it? Or rely on scene shutdown.
    // gameEventBus.once is better if available, but our bus is simple on/off.
    const wrapper = () => {
        handler();
        gameEventBus.off('CMD_LOGIN_SUCCESS', wrapper);
    };
    
    gameEventBus.on('CMD_LOGIN_SUCCESS', wrapper);
  }
}
