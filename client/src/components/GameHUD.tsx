import React from 'react';
import { useGameStore } from '../store/gameStore';

export const GameHUD = () => {
  const character = useGameStore((state) => state.character);
  const speed = useGameStore((state) => state.currentSpeed);

  if (!character) return null;

  const isMoving = speed > 0.5;

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 pointer-events-none">
      {/* Header */}
      <header className="flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className={`w-12 h-12 rounded-full border bg-[var(--circuit-slate)] flex items-center justify-center relative ${isMoving ? 'border-[var(--spirit-teal)]' : 'border-[var(--ancient-gold)]'}`}>
             {/* Status Indicator Ring */}
             {!isMoving && <div className="absolute inset-0 rounded-full animate-ping bg-[var(--ancient-gold)] opacity-20"></div>}
             <span className="text-xs text-[var(--spirit-teal)] relative z-10">{character.name.substring(0, 2)}</span>
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
                <span className={`text-[10px] px-1 rounded border ${isMoving ? 'text-teal border-teal' : 'text-gold border-gold'}`}>
                    {isMoving ? `HÀNH TẨU ${speed} KM/H` : 'THIỀN ĐỊNH'}
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
        <button className="artifact-btn">TU LUYỆN</button>
      </footer>
    </div>
  );
};
