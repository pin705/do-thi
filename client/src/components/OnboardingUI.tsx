import React from 'react';
import { useGameStore } from '../store/gameStore';

export const OnboardingUI = () => {
  const { isScanning, scanResult, setIsScanning } = useGameStore();

  // Handle Scan Trigger (Calls into Phaser via custom event or store flag?)
  // Better: Phaser watches 'isScanning' flag? 
  // No, simpler: Button sets flag -> Phaser Update loop sees flag -> Executes logic -> Sets Result -> Sets Flag False.
  
  // Or: Just let Phaser handle the camera logic, and this UI just displays the "Scan" button which dispatches an event.
  // We will dispatch a custom DOM event that Phaser listens to.

  const handleScanClick = () => {
    window.dispatchEvent(new CustomEvent('PHASER_ACTION', { detail: { type: 'SCAN_START' } }));
    setIsScanning(true);
  };

  const handleConfirm = () => {
    window.dispatchEvent(new CustomEvent('PHASER_ACTION', { detail: { type: 'CONFIRM_CHARACTER' } }));
  };

  if (scanResult) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/50 pointer-events-auto">
        <div className="artifact-panel p-8 max-w-sm w-full flex flex-col items-center text-center">
          <h2 className="text-2xl font-[family-name:var(--font-serif)] mb-2" style={{ color: scanResult.color }}>
            {scanResult.linhCan === 'kim' ? 'KIM LINH CĂN' : 
             scanResult.linhCan === 'moc' ? 'MỘC LINH CĂN' :
             scanResult.linhCan === 'thuy' ? 'THỦY LINH CĂN' :
             scanResult.linhCan === 'hoa' ? 'HỎA LINH CĂN' : 'THỔ LINH CĂN'}
          </h2>
          <div className="w-16 h-1 my-4" style={{ backgroundColor: scanResult.color, boxShadow: `0 0 10px ${scanResult.color}` }}></div>
          <p className="text-sm text-gray-300 mb-8 font-[family-name:var(--font-mono)]">
            Thiên tư trác tuyệt. Căn cơ vững chắc. Có thể nhập đạo.
          </p>
          <button className="artifact-btn w-full" onClick={handleConfirm}>
            NHẬP ĐẠO
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-8 pointer-events-none">
      <div className="mt-12 text-center">
        <h1 className="text-2xl text-[var(--mono-text)] font-[family-name:var(--font-serif)] tracking-widest">
          THỨC TỈNH
        </h1>
        <p className="text-xs text-[var(--spirit-teal)] mt-2 font-[family-name:var(--font-mono)]">
          HỆ THỐNG ĐANG QUÉT...
        </p>
      </div>

      {!isScanning && (
        <button 
          className="artifact-btn mb-12 pointer-events-auto animate-pulse"
          onClick={handleScanClick}
        >
          QUÉT LINH HỒN
        </button>
      )}

      {isScanning && (
        <div className="mb-12 text-[var(--spirit-teal)] font-[family-name:var(--font-mono)] text-sm">
          ĐANG PHÂN TÍCH...
        </div>
      )}
    </div>
  );
};
