# PROJECT ROADMAP & STATUS: URBAN XIANXIA H5

**Last Updated:** 2026-01-21
**Tech Stack:** Monorepo (pnpm), Phaser.js, Node.js (Socket.io), MongoDB, Redis.

---

## ✅ 1. COMPLETED MODULES (Đã hoàn thành)

Chúng ta đã xây dựng xong phần **Core Logic (Systems)** và hạ tầng.

### 🛠 Infrastructure & DevOps
- [x] **Monorepo Structure:** Setup pnpm workspaces (`client`, `server`, `packages/shared`).
- [x] **Linting Standard:** ESLint + Prettier + Auto-fix (`pnpm run lint:fix`) cho cả dự án.
- [x] **Docker Env:** Setup `docker-compose` (manual run) cho MongoDB & Redis.

### 📱 Client Core Systems (`client/src/systems/`)
- [x] **`CameraAnalyzer.ts`:**
    - Xử lý Camera Stream.
    - Thuật toán Pixel Analysis (RGB -> HSL) xác định 5 loại Linh Căn (Ngũ hành).
- [x] **`GPSTracker.ts`:**
    - Tracking vị trí realtime.
    - Công thức Haversine tính khoảng cách (100m = 1 Linh khí).
    - Logic Passive Mode (Tính thời gian Offline -> Idle rewards).
- [x] **`MapSystem.ts`:**
    - Tích hợp Leaflet.js & OpenStreetMap.
    - Render Markers: Người chơi (Pulse effect), Linh thảo (Icon).
    - Styling CSS cho Marker.
- [x] **`CombatSystem.ts`:**
    - Vẽ bùa (Gesture Recognition): Nhận diện hình V (Kiếm), Tròn (Khiên), Ngang (Sóng).
    - Voice Command: Web Speech API (Tiếng Việt: "Bộc phá", "Phòng thủ").

### 🚀 Server Core (`server/src/`)
- [x] **Socket.io Setup:** Real-time event broadcasting (Move, Join, Leave).
- [x] **Redis Integration:** Caching vị trí người chơi hiệu năng cao.
- [x] **Lão Tổ System (`LaoToSystem.ts`):** Logic Rule-based thay thế AI (Contextual Greetings & Events).
- [x] **Shared Types:** Đồng bộ type giữa Client/Server qua package `@urban-xianxia/shared`.

---

## 📝 2. UPCOMING TASKS (Công việc tiếp theo)

### Phase 1: UI & Scene Integration (Ưu tiên cao nhất ⭐️)
Mục tiêu: Biến các System rời rạc thành Flow game hoàn chỉnh.

- [ ] **Scene: Boot & Preload:**
    - Load assets giả lập (Placeholder graphics).
    - Kết nối Socket.io toàn cục.
- [ ] **Scene: Onboarding (Thức tỉnh):**
    - UI: Nút "Bắt đầu thức tỉnh".
    - Logic: Gọi `CameraAnalyzer` -> Hiển thị Camera -> Scan -> Gửi kết quả về Server -> Tạo nhân vật.
- [ ] **Scene: Main Game (Map HUD):**
    - UI Layer: Avatar, Thanh EXP, Số Linh khí.
    - Map Layer: Render `MapSystem` làm nền.
    - Logic: Gọi `GPSTracker` update số liệu lên UI.
- [ ] **Scene: Combat/AR View:**
    - UI: Canvas vẽ bùa đè lên Camera.
    - Logic: Gọi `CombatSystem` khi encounter quái/người chơi khác.

### Phase 2: Game Loop & Data Persistence
- [ ] **Server Persistence:**
    - Lưu data nhân vật vào MongoDB khi disconnect.
    - Load data từ MongoDB khi login lại.
- [ ] **Inventory System:**
    - UI túi đồ.
    - Logic nhặt vật phẩm trên map (Click marker -> Add to inventory).

### Phase 3: Deployment & Testing
- [ ] **HTTPS Setup:** Cấu hình Vite dùng HTTPS (mkcert) hoặc setup Ngrok để test Camera/GPS trên điện thoại thật.
- [ ] **Fake GPS Tool:** Tạo UI nhỏ trên DevMode để giả lập di chuyển mà không cần đi bộ thật.

---

## ⚠️ 3. TECHNICAL NOTES (Lưu ý quan trọng)

1.  **Browser Permissions:**
    - Camera, Mic, GPS chỉ hoạt động trên **HTTPS** hoặc **localhost**.
    - Trên iOS (Safari), user phải tương tác (click nút) trước khi chạy Audio hoặc Video.

2.  **Performance:**
    - `MapSystem`: Cần throttle sự kiện render nếu có quá nhiều player (>100).
    - `GPSTracker`: Cần lọc nhiễu GPS (Drift) khi đứng yên để tránh hack linh khí.

3.  **Leaflet & Phaser:**
    - Map Leaflet là DOM element, nó nằm **trên** hoặc **dưới** Canvas của Phaser. Cần quản lý `z-index` CSS cẩn thận để UI Phaser click được.

---
*File này sẽ được cập nhật liên tục sau mỗi phiên làm việc.*
