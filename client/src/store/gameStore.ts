import { create } from 'zustand';
import { Character, LinhCan, CultivationLevel } from '@urban-xianxia/shared';

type GameSceneType = 'BOOT' | 'PRELOAD' | 'LOGIN' | 'ONBOARDING' | 'GAME';

interface GameState {
  // Scene Management
  currentScene: GameSceneType;
  setScene: (scene: GameSceneType) => void;

  // Character Data (Synced from Phaser/Server)
  character: Character | null;
  setCharacter: (char: Character) => void;
  updateLinhKhi: (amount: number) => void;
  updateDistance: (dist: number) => void;
  
  // Real-time Status
  currentSpeed: number;
  setSpeed: (s: number) => void;
  isMeditating: boolean;
  setMeditating: (v: boolean) => void;

  // UI State
  isScanning: boolean;
  setIsScanning: (v: boolean) => void;
  scanResult: { linhCan: LinhCan; color: string } | null;
  setScanResult: (res: { linhCan: LinhCan; color: string } | null) => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentScene: 'BOOT',
  setScene: (scene) => set({ currentScene: scene }),

  character: null,
  setCharacter: (char) => set({ character: char }),
  updateLinhKhi: (amount) =>
    set((state) => ({
      character: state.character
        ? { ...state.character, linhKhi: state.character.linhKhi + amount }
        : null,
    })),
  updateDistance: (dist) =>
    set((state) => ({
      character: state.character ? { ...state.character, totalDistance: dist } : null,
    })),
    
  currentSpeed: 0,
  setSpeed: (s) => set({ currentSpeed: s }),
  isMeditating: false,
  setMeditating: (v) => set({ isMeditating: v }),

  isScanning: false,
  setIsScanning: (v) => set({ isScanning: v }),
  scanResult: null,
  setScanResult: (res) => set({ scanResult: res }),
}));
