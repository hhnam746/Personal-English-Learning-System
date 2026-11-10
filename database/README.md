> VOP backend now uses EF Core Code First in `../VoP_BE/` and database `vop_codefirst`. This directory retains the original standalone SQL setup for database `vop`; do not apply its init SQL to the EF-managed database. See `../VoP_BE/README.md`.

# PostgreSQL cho VOP (local)

PostgreSQL 17, 9 bảng và 6 enum theo DBML được cung cấp. Database chạy độc lập; demo hiện vẫn dùng localStorage, **chưa kết nối database**. Cần backend API riêng để frontend đọc/ghi PostgreSQL; không đưa mật khẩu database vào mã frontend.

## Chạy

Yêu cầu Docker với Compose. Thực hiện trong thư mục `database/`.

Nếu chưa có `.env`, sao chép `.env.example` thành `.env`, đặt `POSTGRES_PASSWORD` thành mật khẩu riêng và giữ file này riêng tư. `.env` không được commit. Nếu `.env` đã được setup sẵn thì dùng nguyên file đó.

```sh
docker compose up -d --wait
docker compose ps
```

Kết nối mặc định: host `127.0.0.1`, port `5433`, database `vop`, user `vop`; mật khẩu nằm trong `.env`. Có thể đổi port bằng `POSTGRES_PORT` trước khi khởi chạy.

```sh
psql -h 127.0.0.1 -p 5433 -U vop -d vop -W
```

Backend cùng Compose network dùng host `postgres`, port `5432`; backend chạy trên máy dùng `127.0.0.1:5433`. Khi xây dựng URL kết nối, URL-encode thông tin đăng nhập nếu có ký tự đặc biệt.

## Kiểm tra

```sh
docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1' < tests/schema.sql
```

Bài kiểm tra chạy trong transaction và rollback dữ liệu thử. Các assertion về số lượng dành cho schema mới chưa mở rộng. Bao gồm số bảng, enum, khóa ngoại, index, dữ liệu hợp lệ, unique/check/FK và hành vi RESTRICT/SET NULL.

## Dữ liệu và thay đổi schema

Volume `postgres_data` giữ dữ liệu khi container dừng. `docker compose stop` dừng database mà không xóa dữ liệu; `docker compose start` chạy lại.

`init/001_schema.sql` chỉ chạy tự động khi PostgreSQL khởi tạo data directory **trống**. Sửa SQL hay `.env` sau đó không tự migrate schema/đổi mật khẩu của database hiện có. Không chạy lại init SQL trên schema đã có; thay đổi tiếp theo cần migration riêng và backup trước khi áp dụng. Không xóa volume để cập nhật schema.

Bản dịch giữ nguyên ràng buộc DBML: `updated_at` chỉ có default `now()`, không tự cập nhật khi UPDATE; ứng dụng phải đặt giá trị này. `normalized_term` do ứng dụng chuẩn hóa. Các quan hệ meaning/example không bổ sung quy tắc cùng vocabulary ngoài những FK được cung cấp. Schema hiện không có user/tenant, vì vậy tiến độ là dùng chung theo vocabulary như thiết kế gốc.

Cấu hình này dành cho local, chỉ publish port trên loopback; chưa setup production, TLS, backup định kỳ hoặc backend API. User `vop` là tài khoản bootstrap của image PostgreSQL (superuser local); production cần tài khoản ứng dụng ít quyền riêng.
