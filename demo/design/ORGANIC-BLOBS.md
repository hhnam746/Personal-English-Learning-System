# Organic Liquid Glass Blob

Component SVG/HTML dùng chung, triển khai tại `js/organic-blob.js` và `css/organic-blob.css`. Dashboard dùng các biến thể cho tổng vốn từ, bề mặt tỷ lệ và hình não.

## Cách dùng

```js
V.organicBlob({
  variant: "summary", // 'summary' | 'accuracy' | 'brain'
  tag: "section", // 'div' | 'section' | 'aside'
  className: "vocabulary-summary",
  labelledBy: "vocabulary-title",
  content: '<h2 id="vocabulary-title">Tổng số từ vựng</h2><p>48</p>',
});

V.organicBlob({
  variant: "brain",
  decorative: true,
  content: V.brainIllustration(),
});
```

`content` là HTML do ứng dụng dựng: có thể chứa text, icon, button, SVG chart hoặc ảnh bình thường. Escape dữ liệu người dùng bằng `VOP.escape` trước khi ghép HTML, giống các view hiện có; không truyền HTML thô từ người dùng. `decorative: true` chỉ dành cho hình trang trí không chứa nội dung/thao tác thiết yếu.

Mỗi lần gọi tạo ID riêng cho clipPath và gradient để dùng được nhiều blob trong cùng trang hoặc sau khi render lại.

## Cấu trúc các lớp

1. SVG định nghĩa đường Bézier chuẩn hóa theo miền 0–1, `clipPathUnits="objectBoundingBox"`.
2. Lớp `.organic-blob__glass` có nền trong mờ và `backdrop-filter: blur(8px)`, được cắt bằng clipPath.
3. Bóng môi trường nhẹ theo silhouette; SVG `.organic-blob__edge` thêm lớp chuyển sắc mặt kính/tâm–mép, viền ngoài, một mép trong mờ và hai đoạn highlight chọn lọc. Không dùng glow.
4. `.organic-blob__content` là HTML độc lập. Không filter, scale, clip hay blur lớp này; các thao tác đi qua lớp trang trí có `pointer-events: none`.

Chỉ hình dáng bề mặt và đường viền thay đổi theo kích thước khung. Chữ và control vẫn dùng kích thước CSS bình thường. Nội dung được đặt trong vùng an toàn bên trong đường cong. Khi cần thêm nhiều nội dung, để container tăng chiều cao thay vì scale toàn bộ component.

## Các biến thể

- **Summary:** dáng ngang bất đối xứng với vai cong thấp ở bên phải, đáy lõm nhẹ; sắc cam rất nhẹ phía trái dưới. Nội dung tổng từ, đã học, chưa học lấy từ state thật. Thanh tiến độ = đã học / tổng từ.
- **Accuracy:** bề mặt ngang uốn nhẹ chứa tỷ lệ trả lời đúng, tiến độ và blob não lồng bên trong.
- **Brain:** dáng lệch bất đối xứng nhỏ, chứa hình não cam dạng SVG với các nếp gấp mảnh. Chỉ điều chỉnh khoảng trống trong phần tỷ lệ trả lời đúng; không thay số liệu hoặc gán chức năng đo trí nhớ cho hình não.

Các màu nền, viền, highlight và não theo theme sáng/tối. Không có chuyển động tự chạy hoặc thư viện bổ sung. Nếu không hỗ trợ backdrop-filter, bề mặt dùng màu nền đục hơn nhưng vẫn giữ đúng đường SVG.

## Đối chiếu tham khảo

Dáng Summary bám khối kính bất quy tắc ở góc trái ảnh người dùng; Brain bám hình kính nhỏ bất đối xứng ở bên phải phần tỷ lệ. Không sao chép các con số tăng trưởng hoặc thay các màn không liên quan. Lượt chỉnh hiện tại phục hồi chiều sâu kính theo ảnh chính, đồng thời giữ viền/reflection nhẹ và không có glow.

## Kiểm chứng

Chromium ở 1672, 1440, 1024, 820, 768, 390 và 320px, trên cả hai theme:

- Mỗi bề mặt kính thực sự dùng SVG clipPath và backdrop blur.
- Path clip và path viền trùng nhau; ID không lặp khi render lại.
- Chữ, số, thanh tiến độ và breakdown nằm trong đường cong; nội dung không bị scale/blur.
- Não không đè lên số liệu hoặc thanh tiến độ.
- Nút Chưa học vẫn mở bộ lọc đúng; cập nhật số liệu và các luồng hiện có vẫn hoạt động.

Đã kiểm tra ảnh hiển thị và chạy kiểm thử trực tiếp bằng `file://`. Safari/Firefox và điện thoại thật chưa được kiểm tra; khai báo `-webkit-backdrop-filter` và fallback đã có sẵn.
