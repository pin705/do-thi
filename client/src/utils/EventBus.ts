import { LinhCan } from '@urban-xianxia/shared';

// Định nghĩa toàn bộ Events và Data Type đi kèm
export type GameEventMap = {
  // --- UI COMMANDS (React -> Phaser) ---
  'CMD_SCAN_CAMERA_START': undefined;
  'CMD_SCAN_RANDOM_START': undefined;
  'CMD_CONFIRM_CHARACTER': undefined;
  
  // --- GAME SIGNALS (Phaser -> React) ---
  'SIGNAL_LOAD_PROGRESS': number; // 0.0 -> 1.0
  'SIGNAL_SCAN_ERROR': string;    // Error message
  
  // Có thể thêm các sự kiện khác sau này
  // 'SIGNAL_LEVEL_UP': number;
};

type EventCallback<T> = (data: T) => void;

class EventBus {
  private listeners: Map<keyof GameEventMap, Set<EventCallback<any>>> = new Map();

  // Subscribe
  on<K extends keyof GameEventMap>(event: K, callback: EventCallback<GameEventMap[K]>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  // Unsubscribe
  off<K extends keyof GameEventMap>(event: K, callback: EventCallback<GameEventMap[K]>) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback);
    }
  }

  // Emit
  emit<K extends keyof GameEventMap>(event: K, data?: GameEventMap[K]) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(cb => cb(data));
    }
  }
}

export const gameEventBus = new EventBus();
