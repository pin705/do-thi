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
- [x] **Avatar Support:** API hỗ trợ lưu và trả về avatar URL.

### 📱 Client Architecture (`client/src/`)
- [x] **Hybrid Architecture:** Phaser (Game Loop/Canvas) + React (UI/HUD) + Leaflet (Map).
- [x] **Event Bus:** Type-safe Event System thay thế `window.dispatchEvent`.
- [x] **Styling:** Tailwind CSS + "Digital Artifact" Design System.

### 📱 Game Scenes & Features
- [x] **Map System:**
    - **Visual:** Dark Mode + CSS Filter (Theme Tu Tiên).
    - **Interaction:** Auto-Pathing (Click to Move).
    - **Markers:** Avatar thật (DiceBear) + Pulse Effect.
- [x] **Onboarding (Thức tỉnh):**
    - UI: Chọn chế độ Camera/Random.
    - Logic: Camera Analyzer (Pixel Analysis) -> API Create Character.
- [x] **GPS Logic:**
    - Fake GPS Simulation (cho Dev).
    - Real GPS Tracking (cho Mobile).
    - Fallback: Tự động chuyển sang Fake nếu GPS lỗi.

---

## 📝 2. UPCOMING TASKS (Công việc tiếp theo)

### Phase 2: Gameplay Loop & Content (Đang thực hiện)
- [ ] **Movement Logic:**
    - Hiện tại: Auto-pathing là giả lập (Teleport/Linear).
    - Cần làm: Pathfinding trên đường đi thực tế (Routing API - OSRM) hoặc giữ nguyên Linear nếu muốn đơn giản.
    - Server Validation: Chống hack speed/teleport.
- [ ] **Inventory System:**
    - **UI:** React Modal hiển thị lưới vật phẩm.
    - **Backend:** API `GET /inventory`, `POST /use-item`.
    - **Interaction:** Click Linh Thảo trên Map -> Loot -> Update Inventory.
- [ ] **Tu Luyện (Cultivation):**
    - UI: Màn hình ngồi thiền (Idle).
    - Logic: Tích lũy Linh khí theo thời gian (Passive) + Di chuyển (Active).
    - Đột phá: Minigame Rhythm khi đủ EXP.

### Phase 3: Deployment & Testing
- [ ] **HTTPS Setup:** Cấu hình Vite HTTPS hoặc Ngrok.
- [ ] **Mobile Optimization:** Test touch events, safe area (notch).

---

## ⚠️ 3. TECHNICAL NOTES

1.  **Map Interaction:**
    - Để click được xuống Map, các layer trên (`#ui-root`, `#phaser-container`) phải có `pointer-events: none`.
    - Các nút bấm UI phải set `pointer-events: auto` thủ công.
2.  **Avatar Rendering:**
    - Dùng CSS `background-image` trên Leaflet Marker (`divIcon`) để hiển thị avatar tròn.
3.  **GPS Simulation:**
    - `GPSTracker` tự động chạy mode Simulation nếu không có GPS thật hoặc timeout 3s.

---
*File này sẽ được cập nhật liên tục sau mỗi phiên làm việc.*
