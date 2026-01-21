import Phaser from 'phaser';
import { io, Socket } from 'socket.io-client';
import { MapSystem } from '../systems/MapSystem';
import { GPSTracker } from '../systems/GPSTracker';
import { RestClient } from '../utils/RestClient';
import { useGameStore } from '../store/gameStore';
import { Character, ClientToServerEvents, ServerToClientEvents } from '@urban-xianxia/shared';
import { gameEventBus, GameEventMap } from '../utils/EventBus';

export class GameScene extends Phaser.Scene {
  private mapSystem: MapSystem | null = null;
  private gpsTracker: GPSTracker | null = null;
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private characterId!: string;
  private characterData: Character | null = null;
  
  // Handlers
  private handlers: { [K in keyof GameEventMap]?: (data: GameEventMap[K]) => void } = {};

  constructor() {
    super('GameScene');
  }

  init(data: { characterId: string }) {
    this.characterId = data.characterId;
  }

  async create() {
    useGameStore.getState().setScene('GAME');
    this.events.on('shutdown', this.shutdown, this);

    await this.fetchCharacterData();

    this.mapSystem = new MapSystem('map', (lat, lng) => {
      this.gpsTracker?.moveTo(lat, lng);
    });

    this.gpsTracker = new GPSTracker(this.characterData?.totalDistance || 0);
    // Init pos
    const startLat = this.characterData?.lastPosition?.lat || 21.0285;
    const startLng = this.characterData?.lastPosition?.lng || 105.8542;
    this.gpsTracker.setInitialPosition(startLat, startLng);
    this.mapSystem.updatePlayerPosition({ lat: startLat, lng: startLng, timestamp: Date.now() }, this.characterData?.avatar);
    this.mapSystem.setSelfId(this.characterId);

    this.setupSocket();
    this.setupEventBus();
    this.startGPS();
  }

  private setupEventBus() {
      // Listen for UI Commands
      this.handlers['CMD_MEDITATE_START'] = () => {
          this.socket?.emit('player:meditate', true);
      };
      this.handlers['CMD_MEDITATE_STOP'] = () => {
          this.socket?.emit('player:meditate', false);
      };

      gameEventBus.on('CMD_MEDITATE_START', this.handlers['CMD_MEDITATE_START']!);
      gameEventBus.on('CMD_MEDITATE_STOP', this.handlers['CMD_MEDITATE_STOP']!);
  }

  private async fetchCharacterData() {
    try {
      const data = await RestClient.get<Character>(`/player/${this.characterId}`);
      this.characterData = data;
      useGameStore.getState().setCharacter(data);
    } catch (e) {
      console.error('API Error', e);
    }
  }

  private setupSocket() {
    const url = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
    this.socket = io(url);

    this.socket.on('player:nearby', (players) => this.mapSystem?.updateOtherPlayers(players));
    this.socket.on('player:moved', (player) => this.mapSystem?.updateOtherPlayers([player]));
    this.socket.on('player:joined', (player) => this.mapSystem?.updateOtherPlayers([player]));
    
    // Listen for EXP gain from Server Loop
    this.socket.on('player:exp_gained', (data) => {
        if (data.id === this.characterId) {
            // Update Store
            useGameStore.getState().updateLinhKhi(data.amount);
            // Notify UI for Floating Text
            gameEventBus.emit('SIGNAL_LINH_KHI_GAINED', data.amount);
        } else {
            // TODO: Show floating text on other player's marker
        }
    });
  }

  private startGPS() {
    this.gpsTracker?.startTracking((result) => {
      // Client-side prediction for walking gain is disabled to prevent cheat/duplication with server logic?
      // Or keep it for "Walking" gain only. 
      // Current server loop is for "Meditating". 
      // Walking gain logic should also move to server validation, but for smooth UI we keep client optimistic update for walking.
      if (result.linhKhiGained > 0) {
        useGameStore.getState().updateLinhKhi(result.linhKhiGained);
      }
      
      useGameStore.getState().updateDistance(result.totalDistance);
      useGameStore.getState().setSpeed(result.speed);

      const avatarUrl = this.characterData?.avatar;
      this.mapSystem?.updatePlayerPosition(result.currentPosition, avatarUrl, this.characterData?.name);
      
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
    if (this.mapSystem) { this.mapSystem.destroy(); this.mapSystem = null; }
    if (this.gpsTracker) { this.gpsTracker.stopTracking(); this.gpsTracker = null; }
    if (this.socket) { this.socket.disconnect(); this.socket = null; }
    
    if (this.handlers['CMD_MEDITATE_START']) gameEventBus.off('CMD_MEDITATE_START', this.handlers['CMD_MEDITATE_START']!);
    if (this.handlers['CMD_MEDITATE_STOP']) gameEventBus.off('CMD_MEDITATE_STOP', this.handlers['CMD_MEDITATE_STOP']!);
  }
}
