import React from 'react';
import { useFloatingTextStore } from '../store/floatingTextStore';

export const FloatingTextLayer = () => {
  const texts = useFloatingTextStore((state) => state.texts);

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-20">
      {texts.map((t) => (
        <div
          key={t.id}
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 font-[family-name:var(--font-mono)] font-bold text-lg animate-float-up"
          style={{ color: t.color, textShadow: `0 0 5px ${t.color}` }}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
};
