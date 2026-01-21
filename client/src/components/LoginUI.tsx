import React, { useState } from 'react';
import { RestClient } from '../utils/RestClient';
import { gameEventBus } from '../utils/EventBus';

export const LoginUI = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [linhCan, setLinhCan] = useState('kim'); // Default for register
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const body = isRegister ? { username, password, linhCan } : { username, password };
      
      const res = await RestClient.post<any>(endpoint, body);
      
      // Save Token & ID
      localStorage.setItem('token', res.token);
      localStorage.setItem('character_id', res.character.id);
      
      // Notify Game
      gameEventBus.emit('CMD_LOGIN_SUCCESS');

    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-[var(--deep-void)] pointer-events-auto">
      <div className="artifact-panel p-8 w-full max-w-md flex flex-col gap-6">
        <h1 className="text-2xl text-[var(--spirit-teal)] font-[family-name:var(--font-serif)] text-center text-glow tracking-widest">
          {isRegister ? 'KHỞI TẠO HỒ SƠ' : 'XÁC THỰC DANH TÍNH'}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-400 font-mono block mb-1">ĐỊNH DANH (USERNAME)</label>
            <input 
              type="text" 
              className="w-full bg-[var(--deep-void)] border border-[var(--circuit-slate)] p-3 text-[var(--mono-text)] focus:border-[var(--spirit-teal)] outline-none font-mono"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 font-mono block mb-1">MẬT KHẨU (PASSWORD)</label>
            <input 
              type="password" 
              className="w-full bg-[var(--deep-void)] border border-[var(--circuit-slate)] p-3 text-[var(--mono-text)] focus:border-[var(--spirit-teal)] outline-none font-mono"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <div>
              <label className="text-xs text-gray-400 font-mono block mb-1">LINH CĂN KHỞI ĐẦU</label>
              <select 
                className="w-full bg-[var(--deep-void)] border border-[var(--circuit-slate)] p-3 text-[var(--mono-text)] focus:border-[var(--spirit-teal)] outline-none font-mono uppercase"
                value={linhCan}
                onChange={(e) => setLinhCan(e.target.value)}
              >
                <option value="kim">Kim (Metal)</option>
                <option value="moc">Mộc (Wood)</option>
                <option value="thuy">Thủy (Water)</option>
                <option value="hoa">Hỏa (Fire)</option>
                <option value="tho">Thổ (Earth)</option>
              </select>
            </div>
          )}

          {error && <div className="text-[var(--warning-red)] text-xs text-center">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="artifact-btn mt-4 flex justify-center items-center"
          >
            {loading ? <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"/> : (isRegister ? 'KHỞI TẠO' : 'TRUY CẬP')}
          </button>
        </form>

        <div className="text-center">
          <button 
            type="button"
            className="text-xs text-gray-500 hover:text-[var(--spirit-teal)] underline underline-offset-4 font-mono"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? 'Đã có hồ sơ? Đăng nhập ngay' : 'Chưa có hồ sơ? Khởi tạo mới'}
          </button>
        </div>
      </div>
    </div>
  );
};
