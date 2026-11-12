# VOP Frontend

React + TypeScript + Vite, dành cho kho từ vựng cá nhân. Dashboard và Kho từ vựng dùng API thật; không đọc dữ liệu minh họa hoặc localStorage của bản demo.

## Chạy cả Backend và Frontend

Từ thư mục cha `Vocab_Practise_System`, chạy `pnpm dev`. Xem [hướng dẫn gốc](../README.md). Ctrl+C dừng cả hai source.

## Chạy local riêng frontend

Node >=24, pnpm 11 (`packageManager` pin 11.5.1).

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Mở http://127.0.0.1:5173. Chạy backend riêng theo [VoP_BE/README.md](../VoP_BE/README.md), dùng cấu hình local/User Secrets hiện có. Frontend không tự khởi động PostgreSQL, chạy migration hoặc khởi động API.

Axios mặc định gọi `/api`; Vite giữ nguyên path và proxy sang `http://127.0.0.1:5080`. Nếu cần đổi địa chỉ, copy `.env.example` thành `.env.local`:

- `VITE_API_BASE_URL`: base URL được đóng gói vào browser, mặc định `/api`.
- `API_PROXY_TARGET`: địa chỉ backend chỉ dùng bởi dev server.

Không đặt secrets trong `VITE_*`. Production cần reverse proxy `/api` hoặc base URL và CORS tương ứng; dev proxy không nằm trong `dist`.

## Phạm vi hiện có

### Dashboard (`/`)

- Tổng từ, số từ đã học/chưa học, phân bố Level 1–5 và từ đến hạn từ API.
- Biểu đồ hoạt động 7/14 ngày, đổi giao diện sáng/tối, tìm từ và thêm từ.
- Nhấn Level/chưa học/đến hạn để mở Kho từ với bộ lọc; nhấn từ đến hạn để xem chi tiết.
- Nút luyện tập mở luồng phiên học của backend.

`GET /api/dashboard?days=7|14` trả thống kê. Hoạt động dùng **ngày UTC**; tỷ lệ đúng là tổng lượt đánh giá đúng / tổng lượt đánh giá trên toàn bộ lịch sử, kể cả lượt đã trả lời trong phiên bỏ dở. Không đưa lượt củng cố hoặc Flashcard vào mẫu số. Khi chưa có lượt đánh giá, tỷ lệ là `null`, giao diện hiển thị `—`, không tự tạo phần trăm.

Danh sách xem trước từ đến hạn lấy từ `/api/learning-progress?dueOnly=true&pageSize=3`. Dashboard và danh sách này được làm mới định kỳ.

### Kho từ vựng (`/library`)

- Tìm theo từ hoặc nghĩa tiếng Việt; lọc tất cả, chưa học, Level 1–5 hoặc đến hạn.
- Sắp xếp mới nhất, A–Z hoặc Level; phân trang ở server.
- Thêm, xem, sửa và xóa từ có xác nhận; phát âm bằng URL đã lưu hoặc SpeechSynthesis khi thiết bị hỗ trợ.
- Form React Hook Form + Zod hỗ trợ nhiều nghĩa và nhiều ví dụ, IPA, từ loại và cặp câu/đáp án điền từ. Giữ ID của nghĩa/ví dụ hiện có khi sửa.
- Lỗi API giữ bản nháp; đóng/chuyển trang khi có sửa chưa lưu cần xác nhận.

`GET /api/vocabularies` kết hợp `search`, `level`, `dueOnly`, `sort=recent|alpha|level`, `page`, `pageSize`. Backend lọc, đếm và sắp xếp trước phân trang, không chỉ lọc trên trang đang xem. Response từ gồm `level`, `nextReviewAt`, `isSuspended` cùng các nghĩa/ví dụ. Tạo/sửa/xóa gọi API tương ứng; xóa là soft-delete, giữ lịch sử học.

**Mọi thao tác ghi trên giao diện đều thay đổi database backend đang cấu hình.** Không có chế độ lưu demo. Lưu từ không tự bắt đầu luyện tập hoặc tăng Level.

### Các đích điều hướng liên quan

`/practice`, `/flashcards`, `/progress` có luồng API tối thiểu để điều hướng và các thao tác từ Dashboard hoạt động. Practice lưu liên kết phiên đang mở để tiếp tục, chấm điểm/hoàn thành/bỏ phiên ở server. Flashcard ghi tự đánh giá riêng, không thay đổi SRS. Đây chưa phải tuyên bố đã chuyển toàn bộ giao diện/tính năng của demo sang React. Không bổ sung auth, tài khoản hoặc quy tắc SRS mới.

## Cấu trúc và thiết kế

- `src/features/<feature>/`: services, types, validations, hooks và components theo feature.
- `src/pages/`, `src/layouts/`, `src/routes/`: ghép màn hình, shell và React Router.
- `src/components/ui/`: shadcn/ui; `src/components/`: thành phần dùng chung.
- `src/lib/`: Axios, Query provider/query keys và Zustand cho client state.
- `src/shared/`, `src/types/`: tiện ích và kiểu dùng chung; alias `@/` trỏ đến `src/`.

TanStack Query quản lý server state; Zustand chỉ giữ theme/liên kết phiên phía client. Không copy server data sang store hoặc sử dụng response envelope/auth của source tham khảo.

Các stylesheet trong `src/styles/` và font/ảnh trong `src/assets/` được chuyển từ [demo](../demo/) để giữ bố cục, Manrope, cam `#FD5F01` và chất liệu Liquid Glass đã có. `integration.css` chỉ xử lý khác biệt React/Radix/Lucide và thành phần mới; giấy phép font giữ tại `src/assets/fonts/LICENSE.txt`. Không sửa source demo khi triển khai React.

Quy tắc phát triển: đọc [AGENTS.md](AGENTS.md) và rulebook canonical được dẫn trong đó trước khi sửa code.

## Kiểm tra

```sh
pnpm check       # ESLint + TypeScript
pnpm test        # Unit tests
pnpm build      # TypeScript + production bundle
pnpm preview    # Xem bundle đã build
```

### Browser E2E với database riêng

Các bài E2E có thao tác ghi. **Không trỏ `VOP_TEST_API_URL` đến API dùng database cá nhân.** Cấu hình Playwright yêu cầu biến này, nhưng người chạy vẫn phải chọn đúng API test.

Terminal thứ nhất, từ `VoP_BE`:

```sh
dotnet build
dotnet run --project VoP.ApiChecks -- --serve
```

Runner tạo database test riêng, chạy kiểm tra API rồi in `E2E_API_URL=http://127.0.0.1:<port>` và giữ host chạy. Database được giữ lại sau kiểm tra để đối chiếu, không reset database cá nhân.

Terminal thứ hai, từ `VoP_FE`, dùng đúng URL vừa in:

```sh
pnpm exec playwright install chromium
VOP_TEST_API_URL='http://127.0.0.1:<port>' pnpm test:e2e
```

Nếu dùng Chromium đã cài sẵn, có thể đặt thêm `CHROMIUM_EXECUTABLE` đến executable đó. Playwright tự chạy frontend test ở cổng **5175**, proxy sang API test, không dùng frontend cá nhân ở 5173. Kết quả/trace lỗi nằm trong `test-results/`.

Dừng host test bằng đường dẫn `E2E_STOP_FILE` runner vừa in (thư mục tạm tùy hệ điều hành):

```sh
touch '<đường dẫn E2E_STOP_FILE>'
```

Các lệnh trên là cách tái lập kiểm tra, không phải bằng chứng mọi kiểm tra đã được chạy trên máy khác. Phát âm thực tế phụ thuộc URL, giọng và hỗ trợ của thiết bị.
