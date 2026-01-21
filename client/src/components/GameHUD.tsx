import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useFloatingTextStore } from '../store/floatingTextStore';
import { gameEventBus } from '../utils/EventBus';
import { useGameEvent } from '../hooks/useGameEvent';

export const GameHUD = () => {
  const character = useGameStore((state) => state.character);
  const speed = useGameStore((state) => state.currentSpeed);
  const isMeditating = useGameStore((state) => state.isMeditating);
  const setMeditating = useGameStore((state) => state.setMeditating);
  const addText = useFloatingTextStore((state) => state.addText);

  // Listen for Server Updates
  useGameEvent('SIGNAL_LINH_KHI_GAINED', (amount) => {
    addText(`+${amount} Linh Khí`, '#2DD4BF');
  });

  const handleToggleMeditation = () => {
    const newState = !isMeditating;
    setMeditating(newState);
    gameEventBus.emit(newState ? 'CMD_MEDITATE_START' : 'CMD_MEDITATE_STOP');
  };

  // Safe Guard Render
  if (!character) return null;

  const isMoving = speed > 0.5;

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 pointer-events-none">
      {/* Header */}
      <header className="flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className={`w-12 h-12 rounded-full border bg-[var(--circuit-slate)] flex items-center justify-center relative ${isMoving || isMeditating ? 'border-[var(--spirit-teal)]' : 'border-[var(--ancient-gold)]'}`}
          >
            {/* Status Indicator Ring */}
            {isMeditating && (
              <div className="absolute inset-0 rounded-full animate-ping bg-[var(--spirit-teal)] opacity-20"></div>
            )}
            <span className="text-xs text-[var(--spirit-teal)] relative z-10">
              {character.name.substring(0, 2)}
            </span>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <h1 className="text-[var(--mono-text)] font-[family-name:var(--font-serif)] text-sm tracking-wider">
              {character.name.toUpperCase()}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[var(--ancient-gold)] text-xs font-[family-name:var(--font-mono)]">
                {character.level}
              </span>
              <span
                className={`text-[10px] px-1 rounded border ${isMoving ? 'text-teal border-teal' : isMeditating ? 'text-teal border-teal' : 'text-gold border-gold'}`}
              >
                {isMoving ? `HÀNH TẨU ${speed} KM/H` : isMeditating ? 'ĐANG BẾ QUAN' : 'THIỀN ĐỊNH'}
              </span>
            </div>
          </div>
        </div>

        {/* Resource */}
        <div className="artifact-panel px-4 py-2">
          <span className="text-[var(--spirit-teal)] font-[family-name:var(--font-mono)] text-lg text-glow">
            {character.linhKhi} LK
          </span>
        </div>
      </header>

      {/* Footer / Action Bar */}
      <footer className="flex justify-center gap-4 pb-6 pointer-events-auto">
        <button className="artifact-btn">TÚI ĐỒ</button>
        <button
          className={`artifact-btn ${isMeditating ? 'bg-teal/20' : ''}`}
          onClick={handleToggleMeditation}
        >
          {isMeditating ? 'XUẤT QUAN' : 'TU LUYỆN'}
        </button>
      </footer>
    </div>
  );
};
