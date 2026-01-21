import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { gameEventBus } from '../utils/EventBus';
import { useGameEvent } from '../hooks/useGameEvent';

type OnboardingStep = 'SELECT_MODE' | 'SCANNING_CAMERA' | 'SCANNING_RANDOM' | 'RESULT';

export const OnboardingUI = () => {
  const { scanResult } = useGameStore();
  const [step, setStep] = useState<OnboardingStep>('SELECT_MODE');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Trigger Camera Scan
  const handleCameraMode = () => {
    setErrorMsg(null);
    setStep('SCANNING_CAMERA');
    gameEventBus.emit('CMD_SCAN_CAMERA_START');
  };

  // Trigger Random Roll
  const handleRandomMode = () => {
    setStep('SCANNING_RANDOM');
    setTimeout(() => {
        gameEventBus.emit('CMD_SCAN_RANDOM_START');
    }, 1000);
  };

  // Confirm Selection
  const handleConfirm = () => {
    gameEventBus.emit('CMD_CONFIRM_CHARACTER');
  };

  // Handle errors from Phaser
  useGameEvent('SIGNAL_SCAN_ERROR', (msg) => {
    setErrorMsg("Không thể truy cập Camera (" + msg + "). Đã chuyển sang chế độ ngẫu nhiên.");
    setStep('SELECT_MODE');
  });

  // --- RENDER STEPS ---

  if (scanResult) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/80 pointer-events-auto backdrop-blur-sm">
        <div className="artifact-panel p-8 max-w-sm w-full flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
          <h2 className="text-2xl font-[family-name:var(--font-serif)] mb-2 uppercase tracking-widest text-glow" style={{ color: scanResult.color }}>
            {scanResult.linhCan === 'kim' ? 'KIM LINH CĂN' : 
             scanResult.linhCan === 'moc' ? 'MỘC LINH CĂN' :
             scanResult.linhCan === 'thuy' ? 'THỦY LINH CĂN' :
             scanResult.linhCan === 'hoa' ? 'HỎA LINH CĂN' : 'THỔ LINH CĂN'}
          </h2>
          <div className="w-24 h-1 my-6" style={{ backgroundColor: scanResult.color, boxShadow: `0 0 15px ${scanResult.color}` }}></div>
          <p className="text-sm text-gray-300 mb-8 font-[family-name:var(--font-mono)] leading-relaxed">
            Thiên tư trác tuyệt.<br/>Căn cơ vững chắc.<br/>Có thể nhập đạo.
          </p>
          <button className="artifact-btn w-full" onClick={handleConfirm}>
            NHẬP ĐẠO
          </button>
        </div>
      </div>
    );
  }

  if (step === 'SCANNING_CAMERA') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-end pb-20 pointer-events-none">
        <div className="text-[var(--spirit-teal)] font-[family-name:var(--font-mono)] text-sm animate-pulse">
          ĐANG PHÂN TÍCH LINH HỒN...
        </div>
        <div className="text-xs text-gray-500 mt-2">Giữ camera ổn định</div>
      </div>
    );
  }

  if (step === 'SCANNING_RANDOM') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center pointer-events-none bg-black/90">
        <div className="text-[var(--ancient-gold)] font-[family-name:var(--font-serif)] text-2xl animate-bounce">
          ĐANG GIEO QUẺ...
        </div>
      </div>
    );
  }

  // DEFAULT: SELECT_MODE
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 pointer-events-auto bg-[var(--deep-void)]">
      <div className="mb-12 text-center">
        <h1 className="text-3xl text-[var(--mono-text)] font-[family-name:var(--font-serif)] tracking-[0.2em] mb-2 text-glow">
          THỨC TỈNH
        </h1>
        <div className="w-16 h-1 bg-[var(--spirit-teal)] mx-auto mb-4"></div>
        <p className="text-xs text-gray-400 font-[family-name:var(--font-mono)] max-w-xs mx-auto">
          Chọn phương thức để xác định Linh Căn của bạn.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3 border border-[var(--warning-red)] bg-red-900/20 text-[var(--warning-red)] text-xs">
          {errorMsg}
        </div>
      )}

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button 
          className="artifact-btn group relative overflow-hidden"
          onClick={handleCameraMode}
        >
          <div className="absolute inset-0 bg-[var(--spirit-teal)] opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <span className="relative z-10 block text-lg mb-1">CHÂN THỰC</span>
          <span className="relative z-10 text-[0.6rem] text-gray-400 block normal-case tracking-normal">
            Sử dụng Camera để phân tích Ngũ Hành thực tế
          </span>
        </button>

        <div className="text-center text-gray-600 text-xs my-1">- HOẶC -</div>

        <button 
          className="artifact-btn border-[var(--ancient-gold)] text-[var(--ancient-gold)] group relative overflow-hidden"
          onClick={handleRandomMode}
        >
           <div className="absolute inset-0 bg-[var(--ancient-gold)] opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <span className="relative z-10 block text-lg mb-1">NGẪU NHIÊN</span>
          <span className="relative z-10 text-gray-400 block normal-case tracking-normal">
            Để Thiên Đạo quyết định (Random)
          </span>
        </button>
      </div>
    </div>
  );
};
