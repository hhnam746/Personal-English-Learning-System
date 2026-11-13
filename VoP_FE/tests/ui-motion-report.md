# VOP — UI refactor và motion

## Phạm vi và kết quả triển khai

Đã kiểm tra năm route chính: Dashboard `/`, Kho từ `/library`, Luyện tập `/practice`, Flashcard `/flashcards`, Tiến độ `/progress`, cùng shell và dialog dùng chung. Các route đã có chức năng/API thật trước đợt refactor; `setup.page.tsx` là scaffold không được route sử dụng, không phải một trang chức năng còn thiếu. Không triển khai thêm chỉ số chưa chốt trong brief.

Giữ nguyên cam `#FD5F01`, Liquid Glass, các organic dashboard component, routing, TanStack Query, RHF/Zod và hợp đồng backend. So sánh với snapshot trước tác vụ `/tmp/vop-motion-baseline/src` cho thấy không đổi services, hooks API, types nghiệp vụ hoặc logic SRS.

- **shadcn/ui tái sử dụng:** `Button`, `Input`, `Field`/`FieldGroup`, `Skeleton`, `Dialog`, `AlertDialog`, `NativeSelect`, `ToggleGroup`, `Checkbox`, `Progress`, `Collapsible`, `Sonner`. Không cài lại component hoặc thay toàn bộ thiết kế bằng card mặc định.
- **Animate UI đã nối vào luồng thật:** filter Kho từ (`ToggleGroup`), bật âm thanh (`Checkbox`), meter Dashboard và tiến độ phiên (`Progress`), bảng từng ngày (`Collapsible`), xác nhận thoát/bỏ bản nháp (`AlertDialog`); giữ Dialog/xác nhận xóa đã có. Giá trị `Progress` được chuyển xuống Root để bảo toàn ARIA.
- **Motion:** hàng từ dùng key ID thật, opacity khi xuất hiện và layout position khi đổi vị trí; không giữ hàng đã bị loại để tránh thao tác lên kết quả cũ. `MotionConfig` và `AnimateUIProvider` dùng `reducedMotion="user"`.
- **CSS:** chuyển trang fade 200ms; Dashboard stagger 40/80ms; câu hỏi/phản hồi, trường nghĩa/ví dụ mới, empty/result states; feedback nút và chip; cập nhật thanh Level. Flip Flashcard `perspective`/`rotateY` còn 280ms, giữ backface hiding và đổi mặt tức thời khi reduced motion.
- **Không thêm thư viện.** Animate UI, Motion, shadcn/Radix và Sonner đã có trong dependency. NativeSelect giữ picker/bàn phím native; không tính việc chọn option native là animation.

## Đo coverage

Đơn vị đo là **họ tương tác có ý nghĩa**, không phải DOM node, số hàng/option hoặc số property. Inventory cố định **42 họ**, mỗi họ tối đa một điểm. Chuyển trang dùng chung chỉ tính một lần; các animation có sẵn nhưng còn được dùng cũng được tính. Không animate typing, di chuyển focus hoặc số liệu đếm lên chỉ để đạt chỉ tiêu.

Bảng dưới là mức **bảo thủ xác nhận bằng source: 27/42 = 64,3%**, vượt mục tiêu 50% ở mức triển khai. Các họ có triển khai một phần/hiệu ứng chồng lặp được để **Không tính**, kể cả khi một số trạng thái thực tế có fade. Bộ E2E cuối đã kiểm chứng luồng chức năng và normal/reduced-motion; coverage vẫn là phép audit theo source, không phải số DOM node tự đo.

| Nhóm                | Đã tính / đủ điều kiện |
| ------------------- | ---------------------: |
| Shell dùng chung    |                    6/7 |
| Dialog/form từ vựng |                    5/6 |
| Dashboard           |                    5/7 |
| Kho từ              |                    2/6 |
| Luyện tập           |                    6/8 |
| Flashcard           |                    1/5 |
| Tiến độ             |                    2/3 |
| **Tổng**            |      **27/42 — 64,3%** |

### Inventory 42 họ

Các đường dẫn dưới tính từ thư mục frontend. “Có” nghĩa là có animation cụ thể trong source, không phải tuyên bố tất cả kiểm thử đã pass.

| ID  | Họ tương tác                      | Tính       | Bằng chứng / ranh giới                                                                                                                          |
| --- | --------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | Chuyển route                      | Có         | `src/layouts/workspace.layout.tsx`, `src/styles/motion.css`: `.page-transition` keyed theo pathname.                                            |
| S2  | Trạng thái active navigation      | Có         | `src/styles/liquid.css`, `motion.css`: `.nav-item.active`, transition màu/nền.                                                                  |
| S3  | Feedback nút theme                | Có         | `workspace.layout.tsx`, `liquid.css`, `motion.css`: nền theme control và press feedback. Không tính mỗi icon riêng.                             |
| S4  | Press nút dùng chung              | Có         | `src/components/ui/button.tsx`, `src/styles/components.css`, `motion.css`: transform/opacity ngắn.                                              |
| S5  | Loading → nội dung                | Không tính | `src/components/query-state.tsx`: có Skeleton/entrance, chưa tính như một handoff loading-content độc lập.                                      |
| S6  | Error/retry state                 | Có         | `query-state.tsx`, `motion.css`: error `.empty-state` xuất hiện, retry vẫn tức thời.                                                            |
| S7  | Toast vào/ra                      | Có         | `src/components/ui/sonner.tsx`, `src/layouts/app.layout.tsx`: Sonner đang dùng thật, theo theme store.                                          |
| F1  | Dialog xem/thêm/sửa từ            | Có         | `src/components/ui/dialog.tsx`, `features/vocabularies/components/vocabulary-dialog.tsx`: Animate UI Dialog.                                    |
| F2  | Xác nhận xóa                      | Có         | `vocabulary-dialog.tsx`, `ui/alert-dialog.tsx`: Animate UI AlertDialog.                                                                         |
| F3  | Xác nhận bỏ bản nháp              | Có         | `vocabulary-dialog.tsx`: AlertDialog dùng cho đóng/chuyển trang; giữ native beforeunload.                                                       |
| F4  | Thêm/bỏ nghĩa                     | Có         | `features/vocabularies/components/vocabulary-form.tsx`: `.meaning-editor.motion-field` animate **thêm**; bỏ ngay để không giữ field RHF đã xóa. |
| F5  | Thêm/bỏ ví dụ                     | Có         | `vocabulary-form.tsx`: `.example-editor.motion-field` animate **thêm**; bỏ ngay, không tuyên bố exit animation.                                 |
| F6  | Validation feedback               | Không tính | RHF/Zod/FieldError được giữ nguyên; không thêm chuyển động lên lỗi nhập.                                                                        |
| D1  | Dashboard sections xuất hiện      | Có         | `src/styles/motion.css`: `.dashboard-top/bottom > *`, stagger 40/80ms.                                                                          |
| D2  | Meter từ đã học                   | Có         | `features/dashboard/components/dashboard-content.tsx`, `ui/progress.tsx`: Animate UI transform.                                                 |
| D3  | Meter accuracy                    | Có         | Cùng `dashboard-content.tsx`, `ui/progress.tsx`; gradient kính giữ qua selector indicator trong `styles/dashboard.css`.                         |
| D4  | Cập nhật phân bố memory           | Không tính | Memory bars giữ hình học số liệu; hover không được dùng thay bằng chứng cập nhật giá trị.                                                       |
| D5  | Chọn khoảng thời gian             | Không tính | `dashboard-content.tsx`: NativeSelect, option native.                                                                                           |
| D6  | Dữ liệu activity thay đổi         | Có         | `features/dashboard/components/activity-chart.tsx`, `motion.css`: series keyed theo dữ liệu, fade; không morph tọa độ/nhãn.                     |
| D7  | Feedback chip từ đến hạn          | Có         | `dashboard-content.tsx`, `motion.css`: `.word-chip` hover chỉ pointer fine; không đếm riêng từng chip.                                          |
| L1  | Chọn sắp xếp                      | Không tính | `src/pages/library.page.tsx`: NativeSelect.                                                                                                     |
| L2  | Chọn filter                       | Có         | `library.page.tsx`, `ui/toggle-group.tsx`: Animate UI highlight/press, query vẫn server.                                                        |
| L3  | Thay kết quả tìm/lọc              | Không tính | Không cộng riêng animation hàng vào family này để tránh tính chồng.                                                                             |
| L4  | Thêm/sửa/xóa hàng                 | Không tính | Có insertion/layout qua `motion.tr`, nhưng không có animation cho mọi update và xóa; bỏ hàng ngay tránh stale interaction.                      |
| L5  | Thay trang kết quả                | Không tính | Không cộng lại fade từng hàng như một hiệu ứng phân trang riêng.                                                                                |
| L6  | Empty state                       | Có         | `library.page.tsx`, `motion.css`: `.empty-state` entrance.                                                                                      |
| P1  | Bật/tắt câu hỏi nghe              | Có         | `features/practice/components/practice-workspace.tsx`, `ui/checkbox.tsx`: Animate UI Checkbox.                                                  |
| P2  | Chuyển setup/intro/question stage | Không tính | Một số stage có entrance; không cộng chồng family next-question.                                                                                |
| P3  | Câu hỏi tiếp theo                 | Có         | `practice-workspace.tsx` key câu hỏi thật, `question-form.tsx`: `.motion-question`.                                                             |
| P4  | Chọn đáp án                       | Có         | `question-form.tsx`, `motion.css`: selected border/background transition, không đổi value ownership.                                            |
| P5  | Feedback đúng/sai                 | Có         | `question-form.tsx`, `motion.css`: `.feedback-copy` fade khi mount, role status giữ nguyên.                                                     |
| P6  | Tiến độ phiên                     | Có         | `practice-workspace.tsx`, `ui/progress.tsx`: Animate UI, giá trị/count từ backend.                                                              |
| P7  | Hoàn thành phiên                  | Không tính | `.result-page` có entrance nhưng không cộng riêng trong mức bảo thủ này.                                                                        |
| P8  | Xác nhận thoát                    | Có         | `practice-workspace.tsx`: Animate UI AlertDialog, Cancel/Action có tên rõ.                                                                      |
| C1  | Chọn Level Flashcard              | Không tính | `src/pages/flashcards.page.tsx`: NativeSelect.                                                                                                  |
| C2  | Flip thẻ                          | Có         | `features/flashcards/components/flashcard-study.tsx`, `styles/styles.css`: 3D 280ms, backface hiding, ARIA hai mặt.                             |
| C3  | Thẻ trước/sau                     | Không tính | Không cộng entrance bộ thẻ như một transition độc lập; giữ keyboard navigation nhanh.                                                           |
| C4  | Rating pending/success            | Không tính | Không cộng shared disabled/press feedback vào family rating riêng.                                                                              |
| C5  | Kết quả/ôn lại                    | Không tính | Có `.result-page` entrance nhưng để ngoài tử số bảo thủ.                                                                                        |
| G1  | Chọn khoảng hoạt động             | Không tính | `features/progress/components/progress-content.tsx`: NativeSelect.                                                                              |
| G2  | Thanh Level cập nhật              | Có         | `progress-content.tsx`, `motion.css`: `.journey-track > span` scaleX transition, số đọc không count-up.                                         |
| G3  | Mở/đóng số liệu từng ngày         | Có         | `progress-content.tsx`, `ui/collapsible.tsx`: Animate UI Collapsible; trạng thái mở được giữ khi đổi khoảng ở `pages/progress.page.tsx`.        |

## Kiểm chứng và phần còn lại

| Kiểm tra                            | Trạng thái tại thời điểm lập báo cáo                                                                                                                                                                                                                            |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API checks trên database test riêng | Đã thực thi thành công **158 checks**. Không chạy vào database cá nhân.                                                                                                                                                                                         |
| Unit tests                          | Đã thực thi thành công **5 tests**.                                                                                                                                                                                                                             |
| Production build                    | Đã thực thi thành công.                                                                                                                                                                                                                                         |
| TypeScript                          | `pnpm typecheck` pass sau thay đổi cuối.                                                                                                                                                                                                                        |
| Lint phần sửa                       | **0 errors**, 1 warning Fast Refresh sẵn có ở `button.tsx`, theo `/tmp/vop-motion-scoped-lint.log`.                                                                                                                                                             |
| Lint toàn repo                      | Baseline có **4 errors** ở `carousel.tsx`, `combobox.tsx`, `sidebar.tsx`, `use-mobile.ts`; giữ nguyên phần người dùng sửa phiên khác. Không tuyên bố full lint pass.                                                                                            |
| Browser E2E                         | **21 test riêng biệt pass**: full suite 20/20 trong `/tmp/vop-e2e-motion-verified.log`, sau đó touch test mới 1/1 trong `/tmp/vop-motion-touch.log`. Gồm CRUD/nháp, practice, Flashcard, Progress, responsive/theme/reduced-motion, focus và performance smoke. |
| Review độc lập                      | Đã sửa selector glass meter và bỏ exit retention hàng; return-focus đã được kiểm chứng normal/reduced-motion; reviewer chấp thuận không còn blocker.                                                                                                            |

Matrix đã chạy: luồng CRUD/nháp, practice/resume/thoát, rating Flashcard, số liệu Progress, theme sáng/tối, viewport 320/768/1440 và `prefers-reduced-motion`. Screenshot/trace nằm trong `test-results/` của lần chạy cuối. File báo cáo này không thay thế log thực thi.

Motion ưu tiên transform/opacity, không animate geometry biểu đồ hoặc số đếm, không thêm idle glow/loop; reduced motion bỏ chuyển động và giữ nội dung đọc được. Đây là kiểm tra source và Chromium local, **không phải bằng chứng ngân sách frame/INP trên production**. Đã kiểm tra touch giả lập qua `tap()` (flip, checkbox, điều hướng mobile); chưa xác minh Safari, điện thoại vật lý, âm thanh thật hoặc hiệu năng thiết bị cấu hình yếu.

## Tài liệu API đã tham chiếu

- [shadcn Progress](https://ui.shadcn.com/docs/components/radix/progress), [NativeSelect](https://ui.shadcn.com/docs/components/radix/native-select).
- [Animate UI primitives](https://animate-ui.com/docs/primitives), [Progress](https://animate-ui.com/docs/primitives/radix-ui/progress), [AlertDialog](https://animate-ui.com/docs/primitives/radix-ui/alert-dialog).
- [MotionConfig và reduced motion](https://motion.dev/docs/react-motion-config), [Motion accessibility](https://motion.dev/docs/react-accessibility).

### Tái lập kiểm tra

Dùng API test do `dotnet run --project VoP.ApiChecks -- --serve` tạo theo README (không dùng DB cá nhân):

```sh
VOP_TEST_API_URL='<isolated test URL>' pnpm test:e2e
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

Lượt kiểm tra dùng Chromium headless đã cài, thông qua `CHROMIUM_EXECUTABLE`. `pnpm lint` toàn repo vẫn báo bốn lỗi baseline, không phải pass. `git diff --check` pass. Scoped lint không có lỗi; warning Fast Refresh của `button.tsx` đã có từ trước.

Performance smoke ghi khoảng frame trong 700ms khi flip ở Chromium headless 1440×1000, không CPU-throttle; số đo tại [ui-motion-performance.json](ui-motion-performance.json). Đây không phải benchmark production hoặc cam kết 60 FPS trên thiết bị thật. Ảnh từng trang normal/reduced-motion và light/dark nằm tại `test-results/`; ảnh mobile sau khi animation kết thúc có prefix `final-`.

Mẫu đã ghi: **43 frame intervals**, median **16,7ms**, p95 **16,7ms**, **0 interval >50ms**. Không suy từ mẫu ngắn này ra hiệu năng điện thoại/production.
