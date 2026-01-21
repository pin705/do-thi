import Phaser from 'phaser';
import { io, Socket } from 'socket.io-client';
import { MapSystem } from '../systems/MapSystem';
import { GPSTracker } from '../systems/GPSTracker';
import { RestClient } from '../utils/RestClient';
import { useGameStore } from '../store/gameStore';
import { Character, ClientToServerEvents, ServerToClientEvents } from '@urban-xianxia/shared';

export class GameScene extends Phaser.Scene {
  private mapSystem: MapSystem | null = null;
  private gpsTracker: GPSTracker | null = null;
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private characterId!: string;
  private characterData: Character | null = null;

  constructor() {
    super('GameScene');
  }

  init(data: { characterId: string }) {
    this.characterId = data.characterId;
  }

  async create() {
    console.log('GameScene: Created');
    useGameStore.getState().setScene('GAME');

    this.events.on('shutdown', this.shutdown, this);

    await this.fetchCharacterData();

    // 2. Init Systems
    // Auto-Pathing on Map Click
    this.mapSystem = new MapSystem('map', (lat, lng) => {
      console.log('Auto-Pathing to:', lat, lng);
      this.gpsTracker?.moveTo(lat, lng);
    });

    // Init GPS
    this.gpsTracker = new GPSTracker(this.characterData?.totalDistance || 0);

    // Init Socket
    this.setupSocket();

    // Force initial update to default location (Hanoi) so map isn't blank
    const avatarUrl = this.characterData?.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${this.characterId}&backgroundColor=b6e3f4`;
    this.mapSystem.updatePlayerPosition({
      lat: 21.0285,
      lng: 105.8542,
      timestamp: Date.now(),
    }, avatarUrl);

    this.startGPS();
  }

  private async fetchCharacterData() {
    try {
      const mockData: Character = {
        id: this.characterId,
        name: 'Đạo Hữu Test',
        linhCan: 'hoa' as any,
        level: 'truc_co' as any,
        linhKhi: 100,
        exp: 500,
        inventory: [],
        lastOnline: Date.now(),
        totalDistance: 1200,
        createdAt: Date.now(),
        avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${this.characterId}&backgroundColor=b6e3f4`
      };

      try {
        const data = await RestClient.get<Character>(`/player/${this.characterId}`);
        this.characterData = data;
      } catch (e) {
        console.warn('API Error, using mock data for GameScene');
        this.characterData = mockData;
      }

      useGameStore.getState().setCharacter(this.characterData);
    } catch (error) {
      console.error('Failed to load character:', error);
    }
  }

  private setupSocket() {
    const url = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
    this.socket = io(url);

    this.socket.on('connect', () => console.log('Socket: Connected'));

    this.socket.on('player:nearby', (players) => {
      console.log('Socket: Nearby players', players);
      this.mapSystem?.updateOtherPlayers(players);
    });

    this.socket.on('player:moved', (player) => {
      this.mapSystem?.updateOtherPlayers([player]);
    });

    this.socket.on('player:joined', (player) => {
      this.mapSystem?.updateOtherPlayers([player]);
    });
  }

  private startGPS() {
    console.log('GameScene: Starting GPS...');
    this.gpsTracker?.startTracking((result) => {
      if (result.linhKhiGained > 0) {
        useGameStore.getState().updateLinhKhi(result.linhKhiGained);
      }
      useGameStore.getState().updateDistance(result.totalDistance);

      const avatarUrl = this.characterData?.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${this.characterId}&backgroundColor=b6e3f4`;
      this.mapSystem?.updatePlayerPosition(result.currentPosition, avatarUrl);
      
      this.socket?.emit('player:move', result.currentPosition);

      if (result.distanceMoved === 0 && this.socket?.connected) {
        this.socket.emit('player:register', {
          characterId: this.characterId,
          position: result.currentPosition,
        });
      }
    });
  }

  private shutdown() {
    if (this.mapSystem) {
      this.mapSystem.destroy();
      this.mapSystem = null;
    }
    if (this.gpsTracker) {
      this.gpsTracker.stopTracking();
      this.gpsTracker = null;
    }
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
