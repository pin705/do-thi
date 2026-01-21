import { useEffect, useRef } from 'react';
import { gameEventBus, GameEventMap } from '../utils/EventBus';

/**
 * Hook để lắng nghe sự kiện từ Game Engine (Phaser)
 * @param event Tên sự kiện (có gợi ý code)
 * @param callback Hàm xử lý (data được type-safe)
 */
export function useGameEvent<K extends keyof GameEventMap>(
  event: K,
  callback: (data: GameEventMap[K]) => void
) {
  // Dùng ref để giữ callback mới nhất mà không gây re-run effect
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    const handler = (data: GameEventMap[K]) => {
      if (callbackRef.current) {
        callbackRef.current(data);
      }
    };

    gameEventBus.on(event, handler);

    // Auto cleanup khi component unmount
    return () => {
      gameEventBus.off(event, handler);
    };
  }, [event]);
}
