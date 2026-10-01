# NoSpam VN frontend

Giao diện tĩnh (HTML/CSS/JS) cho tổng đài thao tác các nhóm nghiệp vụ DNC: phản ánh DNC, kho dữ liệu, hậu kiểm, phản ánh tin nhắn/cuộc gọi rác.

Server nhỏ `serve.js` (Node thuần) phục vụ file tĩnh, inject cấu hình qua `/js/config.js`, và map route SPA-like tới `index.html`.

Backend API mặc định: `http://localhost:5000` (xem repo `backend/`).

## Yêu cầu

- Node.js 18+ (chỉ cần runtime để chạy `serve.js`, không cần `npm install`)
- Backend đang chạy và mở CORS/`API_URL` đúng

## Chạy local

```bash
cd frontend
cp .env.example .env
# điền API_URL và RECAPTCHA_SITE_KEY
node serve.js
```

Mở [http://127.0.0.1:4173](http://127.0.0.1:4173).

| Biến môi trường | Mô tả | Mặc định |
| --- | --- | --- |
| `PORT` | Cổng HTTP của `serve.js` | `4173` |
| `API_URL` | Base URL backend Nest | `http://localhost:5000` |
| `RECAPTCHA_SITE_KEY` | Site key reCAPTCHA **v2** (checkbox trên form) | *(trống)* |
| `RECAPTCHA_SITE_KEY_V3` | Site key reCAPTCHA **v3** (dự phòng; UI hiện dùng v2) | *(trống)* |

Ưu tiên đọc từ file `.env` trong thư mục `frontend/`. Có thể ghi đè bằng biến môi trường process (`PORT=8080 node serve.js`).

`.env` không được commit. Dùng `.env.example` làm mẫu.

### Cấu hình runtime

Mỗi lần tải trang, trình duyệt gọi `/js/config.js`. `serve.js` sinh file này từ `.env`:

```js
window.CGV_API_URL = "...";
window.RECAPTCHA_SITE_KEY = "...";
window.RECAPTCHA_SITE_KEY_V3 = "...";
```

Đổi `.env` rồi **restart** `serve.js` (config được đọc lúc process khởi động).

## Route / trang nghiệp vụ

| Đường dẫn | File trang |
| --- | --- |
| `/` | Trang chủ (`index.html`) |
| `/phan-anh-dnc` | `template/pages/phan-anh-dnc.html` |
| `/kho-du-lieu` | `template/pages/kho-du-lieu.html` |
| `/hau-kiem` | `template/pages/hau-kiem.html` |
| `/phan-anh-tin-nhan-cuoc-goi-rac` | `template/pages/phan-anh-tin-nhan-cuoc-goi-rac.html` |

Các route nhóm nghiệp vụ đều trả về `index.html`; JS tải HTML con vào `#page`.

## Cấu trúc

```
frontend/
  .env.example
  .env                 # local, không commit
  serve.js             # static server + inject config
  index.html           # shell + routing
  js/
    config.js          # fallback khi không qua serve.js
    errors.js          # map mã lỗi DNC → tiếng Việt
  template/
    template.js        # form API, captcha, routing
    template-style.css
    pages/             # từng nhóm nghiệp vụ
  assets/              # logo, ảnh (nếu có)
```

## Captcha

- Form gửi API dùng **reCAPTCHA v2** (checkbox “Tôi không phải là người máy”).
- Token gửi kèm field `captchaToken` (JSON body hoặc multipart).
- Backend verify bằng `RECAPTCHA_SECRET_KEY` (v2). Domain site key phải khớp host đang mở (local / domain VPS).

## Ghi chú khi nối backend

1. `API_URL` phải trỏ đúng backend (local: `http://localhost:5000`, VPS: `https://api.example.com`).
2. Trình duyệt gọi thẳng backend → cần CORS trên Nest nếu frontend và API khác origin.
3. HTTPS trên VPS: site key Google phải thêm domain production.

---

## Hướng dẫn Docker (chưa tạo file — chỉ kế hoạch)

Chưa cần viết `Dockerfile` ngay. Khi triển khai, làm theo 2 môi trường dưới đây.

### Ý tưởng chung

- Image chỉ cần Node (Alpine) + copy thư mục `frontend/` + chạy `node serve.js`.
- **Không** bake `.env` có secret vào image. Truyền config bằng:
  - `env_file: .env`, hoặc
  - biến môi trường trong `docker compose` / systemd / panel VPS.
- `serve.js` đã đọc `process.env` khi không có (hoặc sau) file `.env` — khi Docker chỉ cần set env là đủ nếu **bổ sung** đọc env lúc runtime (hiện tại `API_URL` / reCAPTCHA được đọc **một lần lúc start** từ `.env` rồi fallback `process.env`). Khi viết Docker, giữ nguyên: mount `.env` hoặc export env trước `node serve.js`.

Gợi ý lệnh chạy trong container:

```bash
node serve.js
```

Expose cổng `4173` (hoặc map `80:4173` / `8080:4173`).

### Local (Docker Desktop / Docker Engine)

Mục tiêu: frontend container gọi backend trên máy host hoặc backend container cùng network.

**Phương án A — backend chạy trên host**

```text
API_URL=http://host.docker.internal:5000   # Docker Desktop (Win/Mac)
# Linux thường dùng IP bridge hoặc --add-host=host.docker.internal:host-gateway
RECAPTCHA_SITE_KEY=...
PORT=4173
```

Trình duyệt vẫn mở `http://localhost:4173`. `API_URL` là URL **trình duyệt** gọi backend, không phải URL từ trong container — vì JS chạy trên client. Vì vậy local thường để:

```text
API_URL=http://localhost:5000
```

(đúng với host máy bạn, không dùng hostname nội bộ Docker).

**Phương án B — frontend + backend cùng `docker compose`**

```text
services:
  backend: ...   # publish 5000
  frontend: ...  # publish 4173, depends_on backend
```

`API_URL` trên frontend **vẫn là URL trình duyệt thấy được**, ví dụ:

```text
API_URL=http://localhost:5000
```

không dùng `http://backend:5000` (hostname đó chỉ resolve trong mạng Docker, không resolve trong trình duyệt).

Checklist local Docker:

1. `Dockerfile` từ `node:20-alpine`, `WORKDIR /app`, `COPY . .`, `EXPOSE 4173`, `CMD ["node","serve.js"]`.
2. `.dockerignore`: `.env` (tuỳ chọn), `README.md`, file thừa.
3. `docker compose` map port `4173:4173`, truyền `API_URL` + `RECAPTCHA_SITE_KEY`.
4. Site key Google thêm domain `localhost`.

### Server VPS

Mục tiêu: domain công khai (HTTPS), frontend + API cùng hoặc khác subdomain.

Ví dụ:

| Thành phần | URL |
| --- | --- |
| Frontend | `https://nospam.example.com` |
| Backend | `https://api.nospam.example.com` hoặc cùng domain reverse-proxy `/api` |

**`API_URL` trên VPS** phải là URL public mà trình duyệt gọi được, ví dụ:

```text
API_URL=https://api.nospam.example.com
RECAPTCHA_SITE_KEY=...
PORT=4173
```

Luồng khuyến nghị:

1. Build/pull image frontend trên VPS (hoặc `docker compose up -d --build`).
2. Reverse proxy (Nginx / Caddy) lắng nghe `443`, proxy tới `127.0.0.1:4173`.
3. Backend proxy tương tự tới Nest.
4. Thêm domain production vào Google reCAPTCHA admin.
5. Bật HTTPS (Let’s Encrypt).
6. Không commit `.env` lên git; tạo `.env` trên server hoặc secret của compose.

Checklist VPS:

1. Firewall chỉ mở `80`/`443` (và SSH); không cần public `4173` nếu đã có reverse proxy.
2. `restart: unless-stopped` cho container.
3. Log: `docker compose logs -f frontend`.
4. Đổi API/captcha → sửa env → `docker compose up -d` (recreate) để `serve.js` đọc lại config.

### Khi nào viết file Docker

Khi sẵn sàng triển khai, tạo trong `frontend/`:

| File | Việc |
| --- | --- |
| `Dockerfile` | Image Node chạy `serve.js` |
| `.dockerignore` | Loại trừ `.env`, git, README nếu muốn |
| `docker-compose.yml` (optional) | Local / VPS một lệnh `up` |
| (repo gốc) `docker-compose.yml` | Ghép frontend + backend |

Ưu tiên compose ở **root monorepo** nếu chạy chung backend; giữ `Dockerfile` riêng trong `frontend/` để build độc lập.

---

## Xử lý nhanh

| Hiện tượng | Kiểm tra |
| --- | --- |
| Form báo thiếu API | `.env` / restart `serve.js`, xem `/js/config.js` trong DevTools |
| Captcha không hiện | `RECAPTCHA_SITE_KEY`, domain có trong Google console |
| Gọi API CORS lỗi | Nest cho phép origin frontend |
| Route `/phan-anh-dnc` 404 | Đang chạy đúng `serve.js` (không phải mở file HTML trực tiếp) |
