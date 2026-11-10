# VOP — Agent Development Rules

> Áp dụng cho mọi coding agent làm việc trên **VOP (Vocabulary Practice System)**. Đây là quy tắc làm việc, không phải yêu cầu tự ý triển khai mọi tính năng.
>
> **BẮT BUỘC:** Đọc tài liệu này, source code liên quan và **toàn bộ skill `$ponytail`** trước **mỗi tác vụ có sửa code**. Không dựa hoàn toàn vào lần đọc của phiên trước.

## 1. Nguồn sự thật và thứ tự ưu tiên

1. Yêu cầu mới nhất của người dùng và các quyết định đã được xác nhận.
2. `VOP_Product_Concept_Brief.md`: phạm vi sản phẩm, quy tắc học tập và trạng thái **ĐÃ CHỐT / ĐỀ XUẤT / CHƯA CHỐT**.
3. Quy tắc trong `AGENTS.md` / `AGENT.md` và các quy ước thực tế của repository.
4. Các dự án tham khảo trên máy, **chỉ để học cách tổ chức và viết code**, không sao chép nghiệp vụ hoặc phụ thuộc mù quáng.

Nếu có xung đột, không âm thầm tự chọn. Nêu xung đột, ưu tiên yêu cầu mới nhất đã xác nhận và hỏi khi quyết định đó ảnh hưởng đến nghiệp vụ. Không xem thông số **đề xuất** trong brief là thông số đã duyệt.

**Phạm vi VOP:** ứng dụng học từ vựng tiếng Anh cá nhân, hiện tại một người dùng; CRUD từ vựng, luyện tập đa dạng, Flashcard riêng, ghi nhớ 5 Level và SRS. Không tự bổ sung đăng nhập, thanh toán, mạng xã hội hoặc các chức năng brief đã loại bỏ.

## 2. Quy trình bắt buộc TRƯỚC MỖI LẦN CODE

Thực hiện lại các bước sau cho **mỗi yêu cầu sửa code**, kể cả thay đổi nhỏ:

1. **Đọc lại hướng dẫn:** `AGENTS.md` (nếu có), `AGENT.md`, brief VOP, README, cấu hình, convention và tài liệu có liên quan đến tác vụ.
2. **Đọc FULL skill `$ponytail`:** xác định nguồn skill mà agent thực sự có thể truy cập, mở file hướng dẫn chính và **đọc đầy đủ nội dung**, không chỉ tên, phần giới thiệu hay bản tóm tắt. Đọc các tài liệu phụ mà skill yêu cầu. Tuân thủ hướng dẫn áp dụng cho việc viết code ngắn gọn, rõ ràng, dễ bảo trì.
3. **Nếu `$ponytail` không tồn tại/không truy cập được:** báo rõ đường dẫn đã kiểm tra và **không bắt đầu sửa code** cho đến khi skill được cung cấp hoặc người dùng cho phép bỏ yêu cầu này. Tuyệt đối không tuyên bố đã đọc khi chưa đọc.
4. **Khảo sát repository hiện tại:** cấu trúc thư mục, dependency, package manager, quy tắc đặt tên, routing, state, API client, theme, CSS utilities, cấu trúc BE, migration và test. Chỉ đọc những file liên quan, nhưng đọc đủ luồng thay đổi từ đầu tới cuối.
5. **Đọc code sẽ bị ảnh hưởng:** component/module/service cùng nơi gọi, kiểu dữ liệu, logic liên quan, test hiện có. Tìm lại cách giải quyết tương tự đã được codebase sử dụng.
6. **Kiểm tra Git:** trạng thái working tree và các thay đổi sẵn có; tuyệt đối không ghi đè hoặc đảo ngược thay đổi không thuộc tác vụ.
7. **Lập kế hoạch ngắn** cho thay đổi có nhiều bước; nêu file dự kiến sửa và các ràng buộc cần giữ. Tránh refactor ngoài phạm vi.

**Nguyên tắc:** đọc trước → hiểu → sửa tối thiểu → chạy kiểm tra → báo cáo. Không code bằng suy đoán về source hiện tại.

## 3. Tech stack đã chọn

### Frontend

- **React + TypeScript**.
- **React DOM**, **React Router DOM** cho render/routing theo convention dự án.
- **TanStack Query (React Query)** cho server state: fetching, mutations, caching, invalidation.
- **Zustand** cho client/shared state thực sự cần chia sẻ; không chuyển dữ liệu server sang Zustand khi Query đã quản lý.
- **shadcn/ui** cho nền tảng component, điều chỉnh nhất quán với hệ thống thiết kế hiện tại.
- **Tailwind CSS** cho styling theo convention của repo.
- **React Hook Form + Zod** cho form, validation và thông báo lỗi phù hợp; tận dụng resolver nếu dự án đã dùng.
- Chỉ bổ sung thư viện khác khi có nhu cầu cụ thể và đã kiểm tra dependency hiện có. Giữ phiên bản, package manager và tooling nhất quán với repository; nếu repo mới và chưa có quy ước, ưu tiên `pnpm`.

### Backend

- **C# / ASP.NET Core** (lựa chọn framework cụ thể, version và cách tổ chức theo repository đang dùng).
- **PostgreSQL** làm hệ quản trị dữ liệu.
- Phương án ORM, migrations, validation, DI, logging, error handling, authentication (nếu thực sự cần) và testing phải dựa trên codebase hoặc được thống nhất trước. Không tự mặc định áp dụng nguyên xi từ dự án mẫu.

## 4. Repository tham khảo bắt buộc khảo sát

**Frontend reference:**

```text
/Users/hohoangnam/Documents/Local Disk/VNZ_Internship/FE_Internship/taskcoper-fe
```

**Backend reference:**

```text
/Users/hohoangnam/Documents/Local Disk/UNI_FPTU/FPT_SU26/SWP391/SWP391-AutoWashPro-BE
```

Quy tắc sử dụng:

- Trước khi code **Frontend**, khảo sát repo FE tham khảo: bố cục thư mục, naming, hooks, services, shared components, form/state management và conventions.
- Trước khi code **Backend**, khảo sát repo BE tham khảo: phân tầng, xử lý nghiệp vụ, endpoints, validation, persistence, dependency injection, lỗi và tests.
- Ưu tiên cấu trúc và conventions **đã tồn tại trong VOP** nếu chúng hợp lý; tham khảo chỉ nhằm giữ tính nhất quán, không tạo thêm kiến trúc song song.
- Các đường dẫn chứa khoảng trắng; luôn **quote path** khi làm việc với terminal.
- Nếu đường dẫn tham khảo không tồn tại trong môi trường đang chạy, thông báo rõ và tiếp tục khảo sát repository VOP nếu có thể; **không giả vờ đã đọc** reference. Với quyết định kiến trúc lớn phụ thuộc reference, đề nghị người dùng cung cấp repo/quyền truy cập.
- Không sửa file trong các repository tham khảo; chỉ đọc.

## 5. Quy tắc tổ chức source code

- **Không tự tạo cấu trúc mới trước khi khảo sát cấu trúc cũ.** Bám sát thư mục, cách chia module và naming convention của dự án đang có.
- Ưu tiên tổ chức theo feature khi dự án đang dùng hướng đó; chia sẻ code chung trong `shared/` hoặc vị trí dùng chung **đã có sẵn**, không tạo bản sao.
- Đặt mỗi thay đổi tại đúng layer. Tái sử dụng hook, component, utility, type, schema, service và extension có sẵn trước khi viết mới.
- Không tạo file/module/helper chỉ cho một thao tác đơn giản nếu đặt tại code hiện tại sẽ rõ ràng hơn.
- Viết code **ngắn gọn nhưng dễ đọc**: tên rõ nghĩa, logic tuyến tính, hàm có trách nhiệm cụ thể, không lạm dụng abstraction, generic, wrapper, comment hiển nhiên hoặc defensive code vô ích.
- Không hardcode magic numbers, magic strings, URL hoặc các thông số nghiệp vụ đang có cách quản lý tập trung.
- Tránh `any`, type assertions tùy tiện, duplicate code, side effects khó theo dõi và logic không có test ở các phần quan trọng.
- Không đổi public contracts hay luồng hiện có khi task không yêu cầu.

## 6. Frontend UI/UX & Glassmorphism

**Brand primary:** `#FD5F01` (cam VOP).

- Bám sát **ngôn ngữ thiết kế VOP hiện hữu**: Glassmorphism / Liquid Glass tinh tế, các blob hữu cơ khi thực sự cần, chất liệu kính mềm, độ trong vừa đủ, viền nhẹ, tương phản chữ tốt.
- Giữ tính nhất quán giữa **Light/Dark Mode** trên toàn bộ page, card, modal, form, chart, menu, tooltip và trạng thái tương tác.
- Ưu tiên dùng lại **CSS variables, design tokens, utility classes, Tailwind classes và CSS class dùng chung** trong source. Kiểm tra CSS hiện tại **trước khi tạo class**.
- Không tạo class CSS trùng chức năng, đặt tên ngẫu hứng hoặc rải những giá trị màu/blur/shadow khác nhau khắp dự án.
- **Hạn chế inline styles trong JSX.** Chỉ dùng khi giá trị thực sự động theo dữ liệu, duy nhất hoặc cần thiết cho thư viện/chart; phần còn lại đặt trong class/style system.
- Không bọc mọi thành phần trong card chữ nhật giống nhau. Bố cục cần có chủ đích, phân cấp rõ ràng và khoảng thở hợp lý.
- **Không** làm bóng loáng, glow, shadow, gradient hoặc blur quá đà; tránh hiệu ứng làm giảm khả năng đọc hay hiệu năng.
- Không thêm text trang trí, CTA trùng lặp hoặc tính năng chỉ để lấp chỗ trống.
- Dashboard phải thể hiện dữ liệu đúng nghĩa: tổng số từ không phải tỷ lệ tiến độ; chỉ sử dụng biểu đồ % khi tử số/mẫu số được xác định và nhất quán.
- Chart và nội dung bên trong phải **responsive theo container**, không chỉ kéo cao khung ngoài; không bóp méo SVG/chữ để lấp đầy.
- Giữ giao diện hoạt động trên desktop/mobile, có trạng thái hover/focus/disabled/error/empty hợp lý và hỗ trợ thao tác bàn phím cơ bản.
- Không thay đổi diện mạo hoặc business flow ngoài phạm vi yêu cầu. Nếu ảnh mẫu được cung cấp, so sánh kết quả render thực tế với ảnh mẫu khi có khả năng chụp màn hình.

## 7. Frontend data flow và form

- Server state: TanStack Query, query keys ổn định, mutation + invalidation đúng nơi; không fetch trùng hoặc copy server data vào nhiều store vô cớ.
- Client/shared state: Zustand **chỉ khi cần**; state cục bộ giữ trong component khi đơn giản hơn.
- Form: React Hook Form + Zod; tái sử dụng schema/rules phù hợp, validate cả tình huống nhập sai và lỗi trả về.
- Routing: React Router DOM theo định dạng hiện có; tránh tự thêm route và navigation dư.
- Không bỏ qua loading, error, empty, success và accessibility của thao tác chính.
- Những thay đổi về kiểu dữ liệu giữa FE và BE phải được kiểm tra đồng bộ; không lặng lẽ đổi shape response.

## 8. Backend & PostgreSQL

- Bám sát cách tổ chức C# của **VOP hiện tại** sau khi đã nghiên cứu dự án AutoWashPro-BE tham khảo.
- Giữ phân định rõ: transport/request handling, validation, business rules và data access; **không nhét toàn bộ nghiệp vụ vào controller/endpoint**.
- Mọi dữ liệu đầu vào cần được validate; lỗi trả về nhất quán, tránh tiết lộ thông tin nhạy cảm.
- Dùng dependency injection và async APIs theo convention hiện có; hỗ trợ cancellation khi phù hợp.
- Sử dụng truy vấn có tham số / ORM an toàn; tránh SQL nối chuỗi từ input. Xem xét transaction khi một thao tác cập nhật nhiều trạng thái liên quan.
- Các thay đổi schema/migration phải có chủ đích, bảo toàn dữ liệu; **không tự xóa database, reset migration hoặc chạy thao tác phá hủy**.
- Lưu thời gian và tính lịch ôn nhất quán; kiểm tra timezone, deadline, boundary và các quy tắc SRS của brief khi task liên quan.
- Không viết hoặc commit mật khẩu, connection string chứa secrets, API keys hay file môi trường nhạy cảm.
- Không đưa tính năng multi-user/auth vào chỉ vì repo mẫu có sẵn: VOP hiện phục vụ một người dùng, trừ khi có yêu cầu mới.

### 8.1. Quy ước backend cụ thể từ source mẫu

- Giữ phân tầng **Api → Service → Repository**: controller bind request/gọi service/trả HTTP; Service giữ validation và nghiệp vụ; Repository giữ entities, enums, DbContext, migrations. Service dùng AppDbContext trực tiếp; không thêm generic repository/unit-of-work chỉ để bọc EF.
- Trong `VoP.Service/<Feature>`, tách `Request.cs`, `Response.cs`, `IService.cs`, `Service.cs` theo trách nhiệm hiện có. Không gộp DTO/interface với implementation; không tạo Request rỗng cho feature chỉ đọc. DTO liên quan cùng hướng được cùng file.
- `WordPlan`/`PlannedQuestion` đặt trong `QuestionPlan.cs`, tách khỏi public response; giữ JSON đã lưu, không lộ expected answer hay snapshot nội bộ.
- Common tách exception, Page, rules, transaction helper vào file đúng trách nhiệm.
- Dùng **EF Core LINQ** cho query nghiệp vụ. Chuỗi Include/Where/OrderBy/Select/Skip/Take, projection nhiều field, record dài và initializer nhiều property phải xuống dòng rõ ràng. Ngắn gọn không phải dồn mọi thao tác một dòng.
- Giữ filter/paging/aggregation ở PostgreSQL; không tải toàn bộ lịch sử thay query. Bảo toàn ordering, null semantics, async và CancellationToken.
- Ngoại lệ SQL hạ tầng hẹp: giữ `pg_advisory_xact_lock` trong transaction helper để serialize learning mutations xuyên process; không thay bằng lock bộ nhớ hoặc giả lập bằng LINQ. SQL migration không phải query nghiệp vụ.
- Refactor giữ routes/status/JSON shape/enum/validation, ProblemDetails, dữ liệu, SRS. Không copy envelope, auth hay tích hợp ngoài từ mẫu.
- Căn cứ kiểm chứng: AutoWashPro Service/Admin/{IService,Request,Response,Service}.cs; Admin/Service.cs:184–447 (query/grouping/paging), Wallet/Service.cs (named LINQ stages). Báo cáo và manifest đầy đủ: `/Users/hohoangnam/.openclaw/workspace/nexus/reports/vop-reference-reread.md` và `vop-reference-service-reread.md`. Mẫu có điểm không đồng nhất; không sao chép lỗi count sau paging hoặc nghiệp vụ ngoài VOP.

## 9. Quy tắc nghiệp vụ học từ cần bảo vệ

- Thêm từ không ép bắt đầu luyện tập; từ có thể chờ phiên sau.
- Bài luyện tập chính gồm **nhiều dạng câu hỏi**; Flashcard là **chế độ riêng**, không bắt buộc để bắt đầu hoặc hoàn tất bài thường.
- Hệ thống **5 Level** dựa trên trả lời và ôn tập cách quãng; từ sai được luyện lại; Level 5 vẫn có ôn duy trì.
- Không thêm lại dạng bài **chỉ nhìn nghĩa tiếng Việt rồi gõ từ tiếng Anh** đã bị loại bỏ. Vẫn có thể gõ từ trong **nghe-chép** hoặc **điền từ vào câu**.
- Không tự thêm phân loại theo chủ đề hoặc nhắc nhở học hằng ngày khi brief vẫn loại bỏ các tính năng này.
- Các số lượng từ/phiên, điều kiện lên Level, tỷ lệ trộn từ mới/cũ, khoảng ôn và ảnh hưởng của Flashcard tới Level trong brief **có thể đang là ĐỀ XUẤT**. Trước khi triển khai logic quyết định hành vi, phải đọc trạng thái của từng quy tắc và xác nhận nếu chưa được chốt.
- Mọi thống kê, số từ theo Level, tỷ lệ đúng và lịch ôn phải có logic tính nhất quán với dữ liệu thực.

## 10. Chất lượng, kiểm thử và hoàn tất task

**Trong lúc sửa:**

- Thay đổi tối thiểu, đúng phạm vi; không refactor lan rộng hoặc xóa code cũ chỉ vì không thích cách viết.
- Cập nhật tests phù hợp với thay đổi nghiệp vụ; đặc biệt ưu tiên trường hợp biên của SRS, lên/xuống Level, ôn sai, tính lịch và thống kê.
- Tránh sửa nhiều file không liên quan; không tự cài dependency nếu code hiện tại đã giải quyết được.

**Trước khi báo hoàn tất:**

1. Đọc lại diff và xác minh không có thay đổi ngoài phạm vi hoặc bỏ sót luồng liên quan.
2. Chạy lint, typecheck, test, build và backend tests **nếu repo có thiết lập tương ứng**; không tự bịa lệnh.
3. Với UI task, kiểm tra thực tế bố cục, theme, responsive và tương tác; với BE task, kiểm tra validation, response, persistence và các trường hợp lỗi.
4. Nếu không thể chạy kiểm tra vì môi trường thiếu tool/quyền/DB, báo chính xác kiểm tra nào chưa chạy; **không khẳng định đã pass**.
5. Báo cáo ngắn: đã thay đổi gì, file nào, đã kiểm tra gì, còn điểm nào chưa chốt hoặc rủi ro cần biết.

## 11. Tóm tắt hành vi bắt buộc

**Mỗi task:** `re-read AGENT(S).md → read full $ponytail → inspect VOP code + relevant reference → implement smallest consistent change → verify → report`.

**Cấm:** đoán cấu trúc repo, bỏ qua skill, copy code tham khảo thiếu kiểm chứng, tạo CSS bừa bãi, inline style tràn lan, tự chốt tính năng chưa duyệt, tự ý đổi framework, refactor ngoài task và tuyên bố đã kiểm tra khi chưa kiểm tra.
