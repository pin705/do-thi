import Phaser from 'phaser';
import { io, Socket } from 'socket.io-client';
import { MapSystem } from '../systems/MapSystem';
import { GPSTracker } from '../systems/GPSTracker';
import { RestClient } from '../utils/RestClient';
import { useGameStore } from '../store/gameStore';
import { Character, ClientToServerEvents, ServerToClientEvents } from '@urban-xianxia/shared';

export class GameScene extends Phaser.Scene {
  private mapSystem!: MapSystem;
  private gpsTracker!: GPSTracker;
  private socket!: Socket<ServerToClientEvents, ClientToServerEvents>;
  private characterId!: string;
  private characterData: Character | null = null;

  constructor() {
    super('GameScene');
  }

  init(data: { characterId: string }) {
    this.characterId = data.characterId;
  }

  async create() {
    useGameStore.getState().setScene('GAME');

    // 1. Fetch Data
    await this.fetchCharacterData();

    // 2. Init Systems
    this.mapSystem = new MapSystem('map');
    this.gpsTracker = new GPSTracker(this.characterData?.totalDistance || 0);

    // 3. Connect Socket
    this.setupSocket();

    // 4. Start Tracking
    this.startGPS();
  }

  private async fetchCharacterData() {
    try {
      const data = await RestClient.get<Character>(`/player/${this.characterId}`);
      this.characterData = data;
      // Sync to React Store
      useGameStore.getState().setCharacter(data);
    } catch (error) {
      console.error('Failed to load character:', error);
    }
  }

  private setupSocket() {
    const url = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
    this.socket = io(url);

    this.socket.on('player:nearby', (players) => {
      this.mapSystem.updateOtherPlayers(players);
    });

    this.socket.on('player:moved', (player) => {
      this.mapSystem.updateOtherPlayers([player]);
    });

    this.socket.on('player:joined', (player) => {
      this.mapSystem.updateOtherPlayers([player]);
    });
  }

  private startGPS() {
    this.gpsTracker.startTracking((result) => {
      // Update Store (React will re-render HUD)
      if (result.linhKhiGained > 0) {
        useGameStore.getState().updateLinhKhi(result.linhKhiGained);
      }
      useGameStore.getState().updateDistance(result.totalDistance);

      // Update Map
      this.mapSystem.updatePlayerPosition(result.currentPosition);

      // Send to Server
      this.socket.emit('player:move', result.currentPosition);

      // Register initial position
      if (result.distanceMoved === 0 && this.socket.connected) {
        this.socket.emit('player:register', {
          characterId: this.characterId,
          position: result.currentPosition,
        });
      }
    });
  }
}
