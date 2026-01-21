import React, { useState } from 'react';
import { useGameEvent } from '../hooks/useGameEvent';

export const PreloadUI = () => {
  const [progress, setProgress] = useState(0);

  useGameEvent('SIGNAL_LOAD_PROGRESS', (value) => {
    setProgress(value);
  });

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--deep-void)] pointer-events-auto">
      <div className="text-[var(--spirit-teal)] font-[family-name:var(--font-mono)] mb-4 text-glow">
        INITIALIZING SYSTEM... {Math.floor(progress * 100)}%
      </div>
      <div className="w-64 h-1 bg-[var(--circuit-slate)] relative overflow-hidden">
        <div 
          className="h-full bg-[var(--spirit-teal)] absolute top-0 left-0 transition-all duration-100"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
};
