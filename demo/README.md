# VOP — Vocabulary Practice System

Bản demo tương tác bằng **HTML5, CSS3 và JavaScript thuần (ES6+)**. Giao diện tiếng Việt, học từ tiếng Anh, dành cho một người dùng.

## Mở và sử dụng

Mở trực tiếp **`index.html`** trong trình duyệt. Không cần npm, bước build, backend hoặc database. Font, biểu tượng và ảnh nền đều có sẵn trong thư mục dự án; không có CDN hay request dữ liệu bên ngoài.

Nếu muốn chạy qua HTTP, dùng Python có sẵn trên máy:

```sh
python3 -m http.server 4186 --bind 127.0.0.1
```

Sau đó mở http://127.0.0.1:4186. Phiên chạy qua HTTP và phiên mở file trực tiếp có vùng lưu trữ riêng.

## Những luồng đã triển khai

- **Tổng quan:** tổng vốn từ, số từ đã học/chưa học/đến hạn, biểu đồ năm Level, tỷ lệ câu đúng, hoạt động 7 hoặc 14 ngày. Mọi số liệu được tính từ dữ liệu hiện có.
- **Kho từ:** thêm từ/cụm từ, nghĩa Việt, IPA, từ loại và ví dụ; xem chi tiết, sửa, xóa có xác nhận, tìm kiếm, sắp xếp, lọc theo Level/đến hạn. Từ mới được lưu ở trạng thái Chưa học; lưu từ không mở bài học.
- **Luyện tập:** giới thiệu từ chưa học trước khi kiểm tra; bốn dạng bài chọn nghĩa, nghe-chọn, nghe-gõ và điền từ trong câu; phản hồi đúng/sai; lượt củng cố; kết quả và cập nhật tiến độ khi hoàn thành. Thoát giữa phiên có xác nhận và không ghi kết quả dở dang.
- **Flashcard:** bộ thẻ độc lập, lật mặt, phát âm, lọc Level, đánh giá Nhớ/Chưa nhớ, chuyển thẻ và tổng kết bộ thẻ. Tự đánh giá không thay đổi Level/lịch ôn.
- **Tiến độ:** phân bố năm Level, từ cần củng cố, lịch sử phiên và thống kê trả lời đúng.
- Giao diện sáng/tối, bố cục desktop/tablet/mobile, thao tác bàn phím, focus trong hộp thoại, hỗ trợ giảm chuyển động.

## Dữ liệu và giới hạn của demo

`VOP_Product_Concept_Brief.md` v0.1 là nguồn nghiệp vụ. Bản brief được giữ nguyên.

Ban đầu có **48 từ**: 8 từ chưa học và 40 từ đã học, phân bố L1–L5 lần lượt **4 / 6 / 8 / 10 / 12**, trong đó 12 từ đến hạn. Bảy phiên lịch sử đầu tiên là dữ liệu minh họa, được đánh dấu trong màn Tiến độ. Các phiên hoàn thành sau đó là tương tác thực tế trong demo. Thời điểm ôn được tạo tương đối tại lần khởi tạo đầu tiên.

Từ và tiến độ được lưu dưới khóa `vop-demo-v1` trong **localStorage**. Không đồng bộ giữa máy, trình duyệt hoặc các bản sao ở đường dẫn khác. Nếu trình duyệt chặn lưu trữ, ứng dụng thông báo và chỉ giữ thay đổi trong phiên đang mở. Hai tab cùng mở sẽ nhận thông báo khi dữ liệu thay đổi ở tab khác; cần tải lại để đồng bộ.

Âm thanh dùng **SpeechSynthesis của trình duyệt** với giọng tiếng Anh khi có. Khả năng phát âm ngoại tuyến phụ thuộc giọng đã được cài trên máy. Có thể chuyển bài nghe sang bài chọn nghĩa; thiết bị không có SpeechSynthesis sẽ được dùng bài không cần âm thanh. Demo không gọi dịch vụ từ điển/AI để tự tạo IPA hoặc ví dụ.

## Các quy tắc đang thử nghiệm, chưa chốt nghiệp vụ

Các giá trị sau triển khai theo **đề xuất** trong brief, không được xem là quyết định cuối cùng:

1. Tối đa 12 từ khác nhau mỗi phiên; ưu tiên 8 từ đến hạn + 4 từ chưa học khi đủ dữ liệu. Không lấy từ chưa đến hạn chỉ để đủ số.
2. Từ mới cần hai lượt đúng có câu hỏi xen kẽ và ít nhất một lượt nghĩa/ngữ cảnh. Với kho quá ít từ, khoảng xen kẽ có thể ngắn hơn.
3. Từ đã học chỉ tăng tối đa một Level khi ôn đến hạn, đúng hợp lệ và có kiểm tra nghĩa/ngữ cảnh. Đúng bài nghe-chép đơn thuần chưa đủ tăng cấp.
4. Một lần đánh giá sai giảm một Level, tối thiểu L1 với từ đã học. Từ mới từng sai chưa được công nhận L1 trong phiên đó. Mỗi từ chỉ được chèn tối đa một lượt củng cố để phiên không lặp vô hạn.
5. Lượt sửa sai được đặt sau tối đa năm câu khác còn lại nếu đủ câu; không cộng Level ngay khi sửa đúng.
6. Lịch sau khi đạt L1–L5: **10 phút / 6 giờ / 1 ngày / 3 ngày / 7 ngày**. Từ L5 được ôn duy trì sau 7 ngày rồi 14 ngày. Sai được hẹn lại sau 10 phút.
7. Flashcard không đổi Level hoặc lịch ôn. Không tự giảm Level vì nghỉ học.

Không có tài khoản, nhóm chủ đề, nhắc nhở, thanh toán hoặc bài chỉ nhìn nghĩa Việt rồi nhập từ Anh không kèm nghe/ngữ cảnh.

## Cấu trúc

```text
index.html                  Điểm vào, mở trực tiếp được
css/styles.css              Thành phần, màn hình và responsive cơ bản
css/components.css          Nút, bề mặt, thanh tiến độ dùng chung
css/liquid.css              Theme sáng/tối và shell cơ bản
css/glass-system.css        Token kính, shell và giao diện dùng chung toàn app
css/dashboard.css           Bố cục riêng của Dashboard theo ảnh tham khảo
css/organic-blob.css        Các lớp kính và biến thể blob tái sử dụng
js/organic-blob.js          SVG clipPath, viền kính và minh họa não
js/data.js                  Dữ liệu minh họa và tiện ích chuẩn hóa/escape
js/learning.js              Chọn từ, tạo câu hỏi, đánh giá và lịch ôn
js/views.js                 Các hàm dựng từng màn hình bằng HTML
js/app.js                   Điều hướng, sự kiện, hộp thoại, localStorage và phát âm
assets/                     Ảnh nền, font cục bộ và favicon
design/dashboard-reference.png  Ảnh hướng thiết kế do người dùng cung cấp
tests/                     Kiểm thử logic và luồng trình duyệt
```

## Kiểm tra dành cho người phát triển

Node/npm chỉ phục vụ kiểm thử, không cần để sử dụng app:

```sh
npm install
npm test
npm run test:e2e
```

Playwright dùng Chrome hiện có nếu tìm được. Có thể chỉ định `VOP_CHROME_PATH`, hoặc cài Chromium bằng `npx playwright install chromium`. Các kiểm thử trình duyệt chạy trực tiếp bằng `file://`; ảnh và kết quả kiểm thử nằm trong `/tmp`, không đưa vào runtime.

Đã kiểm tra 18 trường hợp logic và 9 luồng trình duyệt: CRUD/lưu sau reload, hoàn thành các dạng bài và sửa sai, Flashcard độc lập, tìm kiếm/lọc/hộp thoại bàn phím, chuyển khỏi bài nghe và thoát phiên, kiểu nút dùng chung và màu chữ theo theme; năm màn hình ở 320/390/768/820/1024/1440/1672px. Âm thanh thực tế qua loa và tương tác cảm ứng trên điện thoại thật chưa được kiểm chứng tự động.

## Thiết kế và tài sản

Dashboard bám ảnh tham khảo về bố cục ba vùng phía trên, biểu đồ/tỷ lệ ở hàng dưới ; các lối truy cập nhanh ở cuối Dashboard đã được bỏ theo yêu cầu. Chất liệu gồm kính trắng–đào, viền ngoài và viền trong nhẹ, nền ấm có nếp kính mềm. Các số liệu là DOM/CSS/SVG tương tác; không dùng ảnh chụp làm giao diện. Kho từ, Luyện tập, Flashcard, Tiến độ và các hộp thoại dùng cùng hệ chất liệu kính; nội dung, cấu trúc nghiệp vụ và dữ liệu được giữ nguyên.

`css/components.css` định nghĩa bộ nút `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-icon`, `.icon-button`. Mọi nút chính dùng cùng `.btn-primary`: nhãn trắng, chuyển sắc cam và highlight nhẹ; nút phụ có kính trung tính, chữ theo theme. Các màn hình/form không có skin nút chính riêng.

`css/glass-system.css` chứa token chất liệu sáng/tối và các class `.glass-panel`, `.glass-panel--peach`, `.glass-panel--dialog`, `.glass-control`, `.glass-inset`, `.glass-segmented`. Nền, sidebar và header được đưa từ Dashboard thành phần dùng chung. Blur chỉ đặt ở lớp bề mặt; Flashcard blur ở bezel cố định để giữ phép lật 3D. Form/hộp thoại dùng nền kính đậm hơn để dễ đọc.

Ảnh người dùng ở `design/dashboard-reference.png` là nguồn đối chiếu chính. `design/dashboard-refined-concept.png` là concept của lượt thiết kế trước, không phải đặc tả cho lượt chỉnh hiện tại và không được tải vào runtime. `assets/glass-background.jpg` chỉ là nền trang trí; `assets/dashboard-ambient.svg` bổ sung nếp kính phía trên. Font Manrope được lưu cục bộ, giấy phép ở `assets/fonts/LICENSE.txt`.

Đã chụp và xem ảnh thực tế ở desktop 1672×940, laptop, tablet và mobile, kiểm tra hai theme bằng Chromium/Playwright trực tiếp qua `file://`. Nội dung và tiến độ không đổi: 48 = 40 + 8; phân bố 4/6/8/10/12; tỷ lệ khởi tạo 96/110, làm tròn 87%. Không sao chép số tăng trưởng, tỷ lệ 75%, lịch sử hoạt động hay chuông thông báo từ mockup. Safari/Firefox và cảm ứng trên điện thoại thật chưa được kiểm tra.

## Organic Liquid Glass Blob

`VOP.organicBlob` hỗ trợ ba silhouette: `summary`, `accuracy` và `brain`. Đường Bézier SVG chuẩn hóa vừa cắt lớp backdrop blur 8px vừa dựng mép kính nhiều lớp. HTML độc lập ở trên nên chữ và nút không bị blur hoặc co giãn cùng hình. Minh họa não là SVG cục bộ với chuyển sắc cam–đào và nếp gấp mảnh.

Xem API, cấu trúc lớp, fallback và phạm vi kiểm chứng ở `design/ORGANIC-BLOBS.md`.


Lượt đồng bộ toàn ứng dụng đã kiểm tra thêm form thêm/sửa, chi tiết/xóa từ, trạng thái trống, giới thiệu từ mới, câu hỏi/phản hồi, kết quả học và Flashcard. Bắt đầu một giai đoạn/câu hỏi mới đưa vị trí cuộn về đầu; nút Tiếp tục được giữ phía trên thanh điều hướng mobile khi hiện phản hồi. Kiểm thử mở trực tiếp `file://`, không có Browser plugin trong phiên nên dùng Playwright/Chromium hiện có; không thêm dependency runtime.
