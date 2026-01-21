import React from 'react';
import { useGameStore } from '../store/gameStore';
import { GameHUD } from './GameHUD';
import { OnboardingUI } from './OnboardingUI';
import { PreloadUI } from './PreloadUI';
import { LoginUI } from './LoginUI';
import { FloatingTextLayer } from './FloatingTextLayer';

export const App = () => {
  const currentScene = useGameStore((state) => state.currentScene);

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
      <FloatingTextLayer />
      
      {currentScene === 'BOOT' && (
        <div className="w-full h-full flex items-center justify-center bg-[#020617] pointer-events-auto">
          <div className="text-[#2DD4BF] font-mono animate-pulse">
            SYSTEM BOOTING...
          </div>
        </div>
      )}
      
      {currentScene === 'PRELOAD' && <PreloadUI />}
      {currentScene === 'LOGIN' && <LoginUI />}
      {currentScene === 'ONBOARDING' && <OnboardingUI />}
      {currentScene === 'GAME' && <GameHUD />}
    </div>
  );
};
