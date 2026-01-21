import React from 'react';
import { useGameStore } from '../store/gameStore';
import { GameHUD } from './GameHUD';
import { OnboardingUI } from './OnboardingUI';
import { PreloadUI } from './PreloadUI';

export const App = () => {
  const currentScene = useGameStore((state) => state.currentScene);

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
      {/* Global Overlays can go here */}
      {currentScene === 'PRELOAD' && <PreloadUI />}
      {currentScene === 'ONBOARDING' && <OnboardingUI />}
      {currentScene === 'GAME' && <GameHUD />}
    </div>
  );
};
