# PROJECT ROADMAP & STATUS: URBAN XIANXIA H5

**Last Updated:** 2026-01-21
**Tech Stack:** Monorepo (pnpm), Phaser.js, React (UI), Node.js (Socket.io), MongoDB, Redis.

---

## ✅ 1. COMPLETED MODULES (Đã hoàn thành)

### 🛠 Infrastructure & DevOps
- [x] **Monorepo Structure:** Setup pnpm workspaces (`client`, `server`, `packages/shared`).
- [x] **Linting Standard:** ESLint + Prettier + Auto-fix cho cả TS và TSX/React.
- [x] **Docker Env:** Setup `docker-compose` cho MongoDB & Redis.

### 🚀 Server Core (`server/src/`)
- [x] **Database:** Mongoose Models (`Character`), Controller API (Create/Get).
- [x] **Socket.io:** Real-time sync, Redis integration.
- [x] **Lão Tổ System:** Rule-based logic.

### 📱 Client Architecture (`client/src/`)
- [x] **Hybrid Architecture:** Phaser (Game Loop/Canvas) + React (UI/HUD) + Zustand (State Bridge).
- [x] **Event Bus:** Type-safe Event System thay thế `window.dispatchEvent`.
- [x] **Styling:** Tailwind CSS + "Digital Artifact" Design System (Glassmorphism, Neon).

### 📱 Game Scenes & Features
- [x] **Boot & Preload:**
    - Fake loading process.
    - Programmatic textures (tránh lỗi thiếu assets).
- [x] **Onboarding (Thức tỉnh):**
    - UI: Chọn chế độ Camera (Real) hoặc Random (Simulated).
    - Logic: Camera Analyzer (Pixel Analysis) -> API Create Character.
    - Fallback: Tự động chuyển sang Random nếu Camera lỗi.
- [x] **Main Game (Map HUD):**
    - UI: React HUD (Avatar, Level, Linh Khí) đè lên Phaser Canvas.
    - Map: Leaflet.js render lớp dưới cùng (Z-0).
    - Logic: Socket.io sync vị trí thời gian thực.

---

## 📝 2. UPCOMING TASKS (Công việc tiếp theo)

### Phase 2: Gameplay Loop & Content
- [ ] **Game Loop:**
    - Di chuyển thật (GPS) -> Cộng Linh Khí (Server validate).
    - Level Up System (Exp threshold).
- [ ] **Inventory System:**
    - UI Túi đồ (React Modal).
    - Logic nhặt vật phẩm trên map (Click marker -> Add to inventory).
- [ ] **Combat System Integration:**
    - Khi encounter -> Chuyển Scene Combat.
    - Vẽ bùa trên Canvas (Phaser) -> Trừ máu quái.

### Phase 3: Deployment & Testing
- [ ] **HTTPS Setup:** Cấu hình Vite HTTPS hoặc Ngrok.
- [ ] **Fake GPS Tool:** DevTool UI để giả lập di chuyển.

---

## ⚠️ 3. TECHNICAL NOTES

1.  **React x Phaser:**
    - `Map` (DOM z-0) < `Phaser` (Canvas z-1 pointer-none) < `React` (DOM z-2 pointer-none).
    - React UI elements phải có `pointer-events-auto`.
    - Dùng `useGameStore` (Zustand) để sync data từ Phaser -> React.
    - Dùng `gameEventBus` để gửi lệnh từ React -> Phaser.

---
*File này sẽ được cập nhật liên tục sau mỗi phiên làm việc.*
