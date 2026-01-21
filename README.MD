# ĐÔ THỊ TU TIÊN H5 - SETUP GUIDE

## Prerequisites

- Node.js >= 18
- pnpm >= 8.0 (`npm install -g pnpm`)
- Docker (for MongoDB & Redis)

## Installation & Running

This project is a Monorepo using **pnpm workspaces**.

1.  **Install Dependencies:**

    ```bash
    pnpm install
    ```

2.  **Start Infrastructure (Database):**

    ```bash
    docker run -d -p 27017:27017 --name mongodb mongo:latest
    docker run -d -p 6379:6379 --name redis redis:alpine
    ```

3.  **Run Development Mode:**

    ```bash
    # Runs both Client and Server in parallel
    pnpm run dev
    ```

    - **Client:** http://localhost:3000
    - **Server:** http://localhost:3001

## Folder Structure

- `packages/shared`: Shared TypesScript types and interfaces.
- `client`: Phaser.js + Leaflet.js Frontend (Vite).
- `server`: Node.js Express + Socket.io Backend.

---

Bản cập nhật này tập trung vào việc tối ưu game chạy trên trình duyệt (**H5 - HTML5**) để người chơi có thể truy cập ngay lập tức qua link/QR code mà không cần cài đặt. Đồng thời, thay thế AI đắt tiền bằng **Hệ thống Logic Quy tắc (Rule-based System)** thông minh để tiết kiệm chi phí.

---

# TÀI LIỆU CHI TIẾT DỰ ÁN: ĐÔ THỊ TU TIÊN H5 (2026)

## 1. ĐỊNH HƯỚNG CÔNG NGHỆ (H5 STACK)

Thay vì đóng gói App, game sẽ chạy trực tiếp trên trình duyệt di động (Safari/Chrome).

- **Engine:** Phaser.js (Xử lý đồ họa 2D/2.5D và hiệu ứng).
- **AR:** WebXR API hoặc Simple Camera Overlay (Hiển thị vật phẩm đè lên luồng camera của trình duyệt).
- **Vị trí:** Geolocation API (Lấy tọa độ GPS trực tiếp từ trình duyệt).
- **Âm thanh:** Web Speech API (Nhận diện giọng nói miễn phí có sẵn trên trình duyệt).

---

## 2. MÔ TẢ CHI TIẾT TỪNG TÍNH NĂNG

### 2.1. Thức Tỉnh & Kiểm Tra Căn Cốt (Onboarding)

- **Mô tả:** Người chơi cấp quyền truy cập Camera. Một vòng tròn ma pháp 2D hiện lên, yêu cầu người chơi nhìn thẳng. Game sẽ lấy một frame ảnh, dùng thuật toán "Pixel Analysis" đơn giản để phân tích màu sắc chủ đạo của môi trường/khuôn mặt.
- **Logic:**
- Nếu màu chủ đạo là Xanh lá -> Linh căn **Mộc**.
- Nếu màu chủ đạo là Đỏ/Vàng -> Linh căn **Hỏa/Thổ**.

- **Ảnh hưởng:** Tạo ra một "Hồ sơ Tu sĩ" duy nhất dựa trên thực tế mà không tốn phí AI.

### 2.2. Tu Luyện Linh Khí (Passive & Active Cultivation)

- **Mô tả:** Vì H5 không chạy ngầm tốt như App, chúng ta chia làm 2 cách:
- **Active (Hành tẩu):** Người chơi mở trình duyệt khi đang di chuyển. Node.js sẽ tính toán khoảng cách giữa các điểm GPS. Mỗi 100m = 1 Linh khí.
- **Passive (Thiền định):** Khi người chơi đóng trình duyệt, server Node.js sẽ ghi lại thời điểm cuối cùng. Khi họ quay lại, game tính toán thời gian đã qua để cộng linh khí (Idle mode).

- **Ảnh hưởng:** Khuyến khích người chơi bật game khi đi dạo và quay lại game mỗi ngày.

### 2.3. Nhãn Quan Thần Thức (H5 AR Exploration)

- **Mô tả:** Bản đồ game sử dụng **Leaflet.js** (nhẹ hơn Mapbox). Các tài nguyên (Linh thảo, Quái vật) hiện lên dưới dạng Icon trên bản đồ 2D.
- **Tương tác:** Khi chạm vào Icon, trình duyệt mở Camera. Vật phẩm sẽ là một ảnh PNG/Sprite của Phaser hiện đè lên. Người chơi phải chạm nhanh vào để "Thu phục".
- **Ảnh hưởng:** Mang lại cảm giác AR mà không cần phần cứng mạnh hay thư viện đắt tiền.

### 2.4. Chiến Đấu & Kết Ấn (Combat System)

- **Mô tả:** Trận đấu diễn ra theo dạng "Hành động thời gian thực".
- **Vẽ Bùa (Pattern Recognition):** Phaser ghi lại tọa độ ngón tay di chuyển. Hệ thống đối chiếu hình vẽ với mẫu (ví dụ: vẽ chữ "V" để phóng kiếm).
- **Khấu Quyết:** Sử dụng **Web Speech API** để nhận diện từ khóa (Keyword). Người chơi nói "Bảo vệ" -> Kích hoạt khiên.

- **Liên kết:** Linh lực tích lũy từ việc đi bộ sẽ là "năng lượng" để tung chiêu.

### 2.5. Đột Phá & Thiên Lôi (The High-Stakes Event)

- **Mô tả:** Một mini-game thử thách nhịp điệu (Rhythm game). Các tia sét (Thunder) sẽ rơi xuống theo nhạc/nhịp. Người chơi phải chạm vào đúng thời điểm để đánh bật tia sét.
- **Ảnh hưởng:** Tạo cảm giác hồi hộp. Thất bại sẽ bị trừ cấp độ, buộc người chơi phải chuẩn bị kỹ vật phẩm hỗ trợ.

---

## 3. GIẢI PHÁP THAY THẾ AI (HỆ THỐNG LOGIC THÔNG MINH)

Thay vì dùng LLM (như GPT-4) tốn kém, chúng ta dùng **"Lão Tổ Logic"**:

- **Hệ thống lời thoại ngẫu nhiên (Randomized Narrative):** Xây dựng kho 500-1000 câu thoại của "Lão tổ". Kết hợp với biến số để tạo cảm giác thông minh.
- _Cấu trúc:_ `[Lời chào] + [Nhận xét Tu vi] + [Gợi ý hành động]`.
- _Ví dụ:_ "Chào tiểu tử, ta thấy ngươi vừa lên cấp **Trúc Cơ**, hãy đến **Công viên Thống Nhất** để tìm thêm linh thảo!"

- **Hệ thống Phản hồi Sự kiện:** Khi người chơi đến một địa điểm GPS cụ thể, hệ thống sẽ tự động gửi một thông điệp "duyên phận" đã soạn sẵn cho vùng đó.

---

## 4. CHI TIẾT LIÊN KẾT CÁC TÍNH NĂNG

| Tính năng chính    | Dữ liệu đầu vào | Liên kết với | Kết quả đầu ra                    |
| ------------------ | --------------- | ------------ | --------------------------------- |
| **Hành tẩu (GPS)** | Geolocation API | **Linh lực** | Tích lũy năng lượng chiến đấu     |
| **Thu thập (AR)**  | Camera + Touch  | **Túi đồ**   | Nguyên liệu luyện đan             |
| **Luyện đan**      | Nguyên liệu     | **Đột phá**  | Tăng tỷ lệ thành công khi lên cấp |
| **Chiến đấu**      | Voice/Gesture   | **Tông môn** | Chiếm đóng địa điểm trên bản đồ   |

---

## 5. KIẾN TRÚC HỆ THỐNG (TECHNICAL ARCHITECTURE)

1. **Client (Phaser.js):** Chạy trên trình duyệt, xử lý hình ảnh và âm thanh.
   1.2 **Client (React):** Chạy trên trình duyệt, xử lý giao diện và tương tác người dùng.
2. **Real-time (Socket.io):** Duy trì kết nối để người chơi thấy nhau trên bản đồ.
3. **Server (Node.js):** Xử lý mọi logic tính toán (Tránh người chơi hack linh khí).
4. **Database (MongoDB):** Lưu trữ lâu dài thông tin nhân vật.
5. **Cache (Redis):** Lưu vị trí GPS của toàn bộ người chơi hiện tại để xử lý tương tác "người gần người".

---

## 6. LỢI THẾ CỦA H5 TRONG NĂM 2026

- **Tiếp cận cực nhanh:** Gửi một link qua Facebook/Zalo/TikTok là chơi được ngay.
- **Chi phí thấp:** Không cần trả phí hoa hồng 30% cho App Store/Google Play.
- **Cập nhật tức thì:** Bạn sửa code trên server, người chơi F5 trình duyệt là có bản mới, không cần chờ duyệt app.
