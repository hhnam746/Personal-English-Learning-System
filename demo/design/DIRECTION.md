# VOP — đối chiếu Dashboard với ảnh tham khảo

Nguồn chính: `dashboard-reference.png` (1672×940), theo yêu cầu mới nhất ngày 07/11/2026. Giữ HTML/CSS/JavaScript thuần và toàn bộ nghiệp vụ hiện có. Concept `dashboard-refined-concept.png` thuộc lượt chỉnh trước; không dùng để thay thế ảnh tham khảo mới.

## Năm khác biệt đã xử lý

| Trước khi chỉnh | Triển khai hiện tại |
| --- | --- |
| Blob phẳng, chủ yếu là một đường viền | Silhouette Bézier, lớp nền được clip, gradient tâm/mép, viền ngoài, mép trong, highlight chọn lọc và bóng môi trường nhẹ |
| Não giống icon cam phẳng | SVG cam–đào chuyển sắc hướng sáng, nếp gấp sáng và bóng chìm nhẹ trong blob kính riêng |
| Nền xám ít chiều sâu | Nền trung tính ấm, nếp kính ở góc trái dưới và phía trên; giảm chi tiết ở cạnh phải |
| Cỡ chữ, nút và thanh tiến độ nhỏ | H1 48px, số tổng 100px; CTA dùng chung modifier `.btn-glass`; thanh tiến độ 23px ở desktop |
| Các khối chưa cân theo ảnh | Hàng trên summary/phân bố/ôn tập; hàng dưới hoạt động/tỷ lệ; ba lối truy cập nhanh phía cuối |

`css/dashboard.css` giữ phần bố cục riêng của Dashboard. Theo yêu cầu đồng bộ tiếp theo, các rule nền, shell và header đã được chuyển sang `css/glass-system.css` để dùng chung trên mọi view. `css/components.css` dùng một `.btn-primary` cho mọi CTA chính, gồm nút viết trực tiếp trong form. `js/organic-blob.js` và CSS tương ứng giữ component có thể tái sử dụng.

## Hình học và chất liệu

Summary giữ dáng bất đối xứng, vai trái cao, sườn phải thấp và đáy uốn nhẹ. Đường clip trùng đường viền. Lớp blur chỉ tác động bề mặt phía sau; HTML không filter/transform. Mép kính thứ hai được thu nhẹ vào trong, kết hợp chuyển sắc trắng–đào để cảm nhận độ dày mà không có halo. Brain dùng cùng cấu trúc lớp, với silhouette riêng.

Accuracy cũng dùng đường bao hữu cơ nhẹ để gần ảnh mẫu; biểu đồ cấp độ và phần ôn tập giữ vai trò chức năng, không lồng thêm khối trang trí. Không có animation tự chạy.

## Các khác biệt về nội dung được giữ có chủ đích

48 từ = 40 đã học + 8 chưa học. Phân bố 4/6/8/10/12 cộng đúng 40. Tỷ lệ 96/110 làm tròn 87%, thay vì 75% trong ảnh; biểu đồ hoạt động lấy các phiên trong state. Không thêm số +8/+6%, thời gian luyện tập ước lượng hoặc tính năng thông báo từ mockup. Ngày là ngày hiện tại.

## Kiểm chứng

Đã xem ảnh thực tế ở cùng viewport 1672×940, chỉnh lại vị trí/chiều cao các hàng, mép kính, typography và nền sau lượt render đầu. Hàng biểu đồ bắt đầu gần y=514, nhóm truy cập nhanh gần y=783. Có kiểm tra ảnh light/dark, tablet và mobile. Đây là tái dựng CSS/SVG theo ảnh, không phải bản sao pixel tuyệt đối.

18 kiểm thử logic và 9 kiểm thử trình duyệt chạy qua `file://`: các luồng dữ liệu/luyện tập vẫn hoạt động; class nút nhất quán theo variant; clip/viền trùng hình; HTML không blur/scale; chữ/tiến độ không nằm ngoài summary; não không đè lên dữ liệu. Kiểm tra 320/390/768/820/1024/1440/1672px ở hai theme. Chưa kiểm tra Safari, Firefox hoặc thiết bị cảm ứng thật.


## Đồng bộ toàn ứng dụng

Đã đọc và chụp trạng thái hiện tại trước khi sửa code; baseline 18 kiểm thử logic + 8 luồng trình duyệt đạt. Bốn điểm lệch chính là shell/nền chưa đồng bộ, hai kiểu nút chính khác nhau, Flashcard/form phẳng, và màn Tiến độ dùng các bề mặt khác nhau.

Các lớp `.glass-panel`, `.glass-control`, `.glass-inset`, `.glass-segmented` dùng token sáng/tối chung. Kho từ là một tấm kính với hàng phân cách nhẹ; phần chuẩn bị học và Tiến độ dùng các panel kính; câu hỏi giữ rõ trạng thái chọn/đúng/sai; Flashcard giữ phép lật 3D, blur ở bezel cố định; hộp thoại dùng kính có độ đục cao hơn để chữ/field dễ đọc. Không thêm tính năng hoặc đổi thuật toán/lịch ôn.

Sau render đã sửa khoảng trống header để bộ lọc không đè lên nút Thêm từ mới; bỏ kéo giãn khung chuẩn bị học. Bổ sung đưa cuộn về đầu khi bắt đầu giai đoạn/câu hỏi và đưa nút Tiếp tục vào vùng nhìn thấy phía trên nav mobile. Kiểm tra thêm form/hộp thoại và các bước học ở 1440/820/390/320px, cả hai theme. Screenshot tạm đặt ngoài repo tại `/tmp/vop-ui-before` và `/tmp/vop-ui-after`.
