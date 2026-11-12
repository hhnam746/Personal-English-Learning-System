# VOP Frontend — Agent Instructions

Rulebook canonical của VOP là [../VoP_BE/AGENT.md](../VoP_BE/AGENT.md). Đọc **toàn bộ** file đó trước mỗi tác vụ sửa code, đặc biệt mục stack, tổ chức source, Frontend UI/UX và data flow/form; không xem thư mục frontend là ngoại lệ. Đồng thời đọc đầy đủ skill `$ponytail`, source liên quan, [README.md](README.md), [brief sản phẩm](../demo/VOP_Product_Concept_Brief.md) và kiểm tra Git theo rulebook. Yêu cầu mới nhất đã được người dùng chấp thuận vẫn có ưu tiên cao hơn hướng dẫn cục bộ.

## Điểm tựa trong source hiện tại

- Bám `src/features/<feature>/` với services/types/validations/hooks/components; pages/layouts/routes chỉ ghép màn hình và điều hướng. Alias `@/` là `src/`, tên file kebab-case.
- Server state dùng TanStack Query; API client tại `src/lib/axios.ts`. Zustand chỉ cho client state cần chia sẻ, không giữ bản sao dữ liệu API.
- Form dùng React Hook Form + Zod; bảo toàn ID nghĩa/ví dụ khi sửa aggregate từ vựng. Không mất bản nháp khi API lỗi hoặc bỏ qua xác nhận dữ liệu chưa lưu.
- Giữ design system đã chuyển từ `../demo`: kiểm tra token và các class hiện có trong `src/styles/` trước khi thêm CSS. Không redesign Dashboard/Kho từ, đổi màu cam VOP hoặc sửa demo/reference nếu task không yêu cầu.
- Thống kê dùng hợp đồng API thật: ngày hoạt động UTC, accuracy chỉ tính assessment, `null` khi chưa có mẫu số. Search/filter/sort/count/paging của Kho từ chạy ở server; không lọc riêng một trang rồi trình bày như toàn kho.
- Mọi thao tác lưu/xóa/đánh giá trên app gọi backend thật. Không seed/reset dữ liệu cá nhân, copy dữ liệu demo vào runtime hoặc tự đổi SRS/những thông số brief chưa chốt.

Chạy các kiểm tra phù hợp theo README và báo đúng phần đã/chưa xác minh. Browser E2E có ghi dữ liệu: chỉ dùng `VOP_TEST_API_URL` của host/database test riêng; không trỏ vào database cá nhân. Không công bố pass dựa vào tên script hoặc kết quả lịch sử.
