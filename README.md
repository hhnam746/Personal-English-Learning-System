# VOP — Chạy toàn hệ thống local

Đứng trong thư mục `Vocab_Practise_System` và chạy:

```sh
pnpm dev
```

Một terminal chạy cả hai source:

- Frontend: http://127.0.0.1:5173
- Backend/Swagger: http://127.0.0.1:5080/swagger
- Log có nhãn `[BE]` / `[FE]`. Nhấn **Ctrl+C** để dừng cả hai. Nếu một tiến trình kết thúc, tiến trình còn lại cũng được dừng; không để chạy mồ côi.

Lệnh build và chạy backend ở Development, sử dụng cấu hình/User Secrets hiện có; frontend dùng Vite. Không tự chạy migration, seed/reset dữ liệu, bật/tắt database hoặc giết ứng dụng đang chiếm cổng. Dừng phiên Rider/terminal cũ trước nếu cổng5080 hoặc5173 đang được sử dụng.

## Chuẩn bị một lần trên máy mới

Yêu cầu Node>=24, pnpm11, .NET8 SDK và PostgreSQL local đã cấu hình theo [backend README](VoP_BE/README.md). Cài dependencies:

```sh
pnpm install --frozen-lockfile
pnpm --dir VoP_FE install --frozen-lockfile
```

PostgreSQL phải đang chạy. Với container local đã thiết lập, có thể khởi động lại mà không reset dữ liệu bằng `docker compose -f database/compose.yaml start`. Không áp dụng SQL initializer vào database EF.

Chi tiết từng source: [Frontend](VoP_FE/README.md) · [Backend](VoP_BE/README.md).
