# VOP — Vocabulary Practice System

**BẢN BRIEF Ý TƯỞNG SẢN PHẨM**  
**Phiên bản:** 0.1 (bản tổng hợp để tiếp tục thảo luận)  
**Ngày cập nhật:** 07/11/2026  
**Đối tượng sử dụng:** Một người dùng duy nhất  
**Trạng thái:** Chưa phải bộ yêu cầu cuối cùng

> **Quy ước về mức độ xác nhận**
>
> - **[ĐÃ CHỐT]**: Quyết định do chủ sản phẩm đưa ra trong quá trình thảo luận.
> - **[ĐỀ XUẤT]**: Phương án được khuyến nghị dựa trên nghiên cứu và suy luận về học tập; chưa được chủ sản phẩm phê duyệt.
> - **[CHƯA CHỐT]**: Cần thảo luận hoặc xác nhận thêm, không được mặc định xem là yêu cầu bắt buộc.
>
> VOP lấy cảm hứng từ phương pháp ôn tập 5 cấp độ/“thời điểm vàng” của MochiMochi (MochiVocab), kết hợp các hình thức luyện tập đa dạng giống Duolingo. Các con số và quy tắc được **đề xuất cho VOP**, không phải bản sao hoặc công thức chính thức của MochiMochi.

---

## 1. Tầm nhìn và vấn đề cần giải quyết

### 1.1. Ý tưởng cốt lõi [ĐÃ CHỐT]

VOP là hệ thống học từ vựng tiếng Anh **cá nhân**. Khi gặp một từ tiếng Anh mới trong việc đọc, học, nghe hoặc sinh hoạt, người dùng có thể nhập từ đó kèm nghĩa tiếng Việt. Từ được lưu vào kho từ vựng và trở thành nội dung có thể xuất hiện trong những phiên luyện tập sau.

VOP không chỉ lưu danh sách từ. Mục tiêu chính là giúp người học **thực sự nhớ và sử dụng được từ theo thời gian**, thông qua kiểm tra khả năng nhớ lại (active recall), luyện tập nhiều hình thức và ôn tập cách quãng (spaced repetition).

### 1.2. Nguyên tắc sản phẩm [ĐÃ CHỐT]

1. Chỉ phục vụ **một người dùng**, không cần tính năng cộng đồng hoặc quản trị nhiều người.
2. **Kho từ do người dùng tự xây dựng**; không bắt buộc học theo khóa học hoặc danh sách từ có sẵn.
3. **Thêm từ không đồng nghĩa với bắt đầu học ngay**. Từ có thể được học trong phiên tiếp theo hoặc một phiên do người dùng chủ động bắt đầu.
4. **Luyện tập thông thường không lấy Flashcard làm hoạt động bắt buộc**; phải có nhiều kiểu câu hỏi giống tinh thần Duolingo.
5. **Flashcard là chế độ riêng** để xem lại và tự kiểm tra từ vựng.
6. Mỗi từ có **5 cấp độ ghi nhớ**; lên cấp dựa vào khả năng nhớ lại ở những lần ôn cách quãng, không đơn thuần dựa vào số câu trả lời đúng liên tục.
7. Từ đã đạt **Level 5 vẫn cần ôn duy trì**; thành thạo không đồng nghĩa với không bao giờ quên.

---

## 2. Phạm vi tính năng

### 2.1. Các chức năng đã chốt [ĐÃ CHỐT]

**Quản lý từ vựng**

- Thêm từ hoặc cụm từ tiếng Anh kèm nghĩa tiếng Việt.
- Xem, sửa và xóa từ vựng đã lưu.
- Lưu từ mới để đưa vào nội dung học về sau.
- Có thông tin **phát âm, phiên âm IPA** và **câu ví dụ** để hỗ trợ học từ.

**Luyện tập đa dạng**

- **Chọn nghĩa đúng:** Nhìn từ tiếng Anh và chọn nghĩa trong bốn đáp án.
- **Nghe và chọn:** Nghe phát âm rồi chọn từ tiếng Anh tương ứng.
- **Nghe và gõ (dictation):** Nghe phát âm rồi tự gõ từ nghe được.
- **Điền từ vào câu:** Xem câu có vị trí khuyết và gõ từ thích hợp theo ngữ cảnh.
- Có phản hồi khi trả lời đúng hoặc sai; từ trả lời sai được luyện lại trong phiên.
- **Tự đánh giá “Nhớ / Không nhớ”** là cách thức đã chọn để tự kiểm tra, đặc biệt phù hợp trong chế độ Flashcard. Việc tự đánh giá có ảnh hưởng trực tiếp đến Level hay không vẫn chưa chốt.

**Ôn tập và ghi nhớ**

- Áp dụng **5 Level** thể hiện tiến độ ghi nhớ.
- Khi ghi nhớ thành công qua ôn tập, từ có thể lên Level.
- Trả lời sai có thể làm từ **giảm Level**.
- Các từ đến hạn cần được đưa trở lại vào những phiên ôn tập.
- Từ đạt Level 5 vẫn được ôn định kỳ.
- Có **Dashboard thống kê việc học**, chẳng hạn tổng từ, từ chưa học, từ đến hạn ôn, số từ ở mỗi Level và tiến độ học.

**Flashcard**

- Là **chế độ học riêng biệt**, không phải bước mặc định của phiên luyện tập thông thường.
- Có thao tác lật thẻ để kiểm tra nghĩa và khả năng nhớ lại.

### 2.2. Những tính năng đã quyết định KHÔNG đưa vào [ĐÃ CHỐT]

- Bài tập **chỉ nhìn nghĩa tiếng Việt rồi tự gõ từ tiếng Anh**, không kèm nghe hoặc ngữ cảnh. Lưu ý: điều này **không loại bỏ** bài nghe-gõ hoặc bài điền từ vào câu.
- **Nhóm từ theo chủ đề** như Finance, Daily Life, Trading.
- **Nhắc nhở học hoặc ôn hằng ngày**.

---

## 3. Quy trình từ khi gặp từ mới đến khi học được từ

### 3.1. Ghi nhận từ mới [ĐÃ CHỐT]

1. Người dùng gặp một từ hoặc cụm từ tiếng Anh muốn ghi nhớ.
2. Người dùng nhập từ tiếng Anh và nghĩa tiếng Việt.
3. VOP lưu từ vào kho cá nhân.
4. Từ được xem là **chưa bắt đầu học** và có thể được đưa vào một phiên luyện tập sau đó.
5. Người dùng **không bị bắt buộc học ngay tại thời điểm thêm từ**.

**[CHƯA CHỐT]** Có giữ tùy chọn “Học ngay” để chủ động bắt đầu một phiên với từ vừa thêm hay không. Nếu có, đây chỉ là tùy chọn, không phải bước ép buộc.

### 3.2. Lần đầu học một từ [ĐỀ XUẤT]

Khi một từ chưa học lần đầu được chọn vào phiên luyện tập:

1. Người học được tiếp xúc với **từ, nghĩa, cách phát âm và một ví dụ** để hiểu nội dung trước khi kiểm tra.
2. Từ xuất hiện trong **ít nhất hai lượt nhớ lại thành công** ở hai dạng câu hỏi khác nhau nếu có thể.
3. Hai lượt này **không đặt cạnh nhau**; nên có khoảng **5–8 câu hỏi thuộc các từ khác** xen giữa để tránh nhớ đáp án chỉ nhờ vừa nhìn thấy.
4. Trong hai lượt thành công, **ít nhất một lượt phải kiểm tra nghĩa hoặc cách dùng từ trong ngữ cảnh**. Chỉ nghe và chép đúng chính tả chưa đủ để chứng minh đã hiểu nghĩa.
5. Khi đáp ứng điều kiện, từ được công nhận **Level 1 (bắt đầu ghi nhớ)** và được hẹn ôn lại.
6. Nếu trả lời sai, cho xem đáp án/nghĩa đúng rồi đưa từ trở lại một vị trí thích hợp trong phần luyện lại; không cộng cấp chỉ vì sửa đúng ngay sau khi đã nhìn thấy đáp án.

> Hai lượt đúng trong lần học đầu tiên chỉ chứng minh rằng người dùng đã **tiếp thu ban đầu**. Đó không phải bằng chứng đã nhớ lâu dài.

### 3.3. Những phiên tiếp theo [ĐỀ XUẤT]

- Phiên luyện tập ưu tiên các từ đã đến hạn ôn, sau đó bổ sung một lượng từ mới phù hợp.
- Hệ thống **trộn các kiểu câu hỏi** thay vì hỏi một từ chỉ bằng một hình thức mãi mãi.
- Mỗi từ đã học chỉ có thể **tăng tối đa một Level trong một phiên ôn hợp lệ**.
- Muốn lên cấp tiếp, từ phải trải qua **một lần ôn sau khoảng cách thời gian phù hợp**; việc hỏi lại ngay trong cùng phiên chỉ dùng để sửa lỗi/củng cố, không phải để tăng cấp nhiều lần.
- Lịch ôn được điều chỉnh dựa trên mức ghi nhớ và kết quả học, không dựa đơn thuần vào số lần nhìn thấy từ.

---

## 4. Các hình thức kiểm tra và mục đích học tập

| Hình thức | Người học phải làm gì? | Chủ yếu kiểm tra |
|---|---|---|
| Chọn nghĩa trong 4 đáp án | Nhìn từ tiếng Anh, chọn nghĩa tiếng Việt đúng | Nhận diện và hiểu nghĩa |
| Nghe và chọn | Nghe một từ, chọn chữ viết tiếng Anh tương ứng | Nhận diện âm thanh và mặt chữ |
| Nghe và gõ | Nghe từ rồi gõ lại | Nghe, nhớ mặt chữ, chính tả |
| Điền từ vào câu | Dựa vào câu ví dụ/ngữ cảnh để gõ từ còn thiếu | Nhớ cách dùng từ trong ngữ cảnh |
| Flashcard riêng | Tự nhớ rồi lật thẻ kiểm tra | Gợi nhớ và tự đánh giá |

**Nguyên tắc quan trọng [ĐỀ XUẤT]:** Mỗi dạng bài đo một kỹ năng khác nhau. Nghe-gõ chính xác không nhất thiết đồng nghĩa với hiểu nghĩa. Để xác nhận một từ tiến tới cấp ghi nhớ cao hơn, cần có **bằng chứng hiểu nghĩa hoặc sử dụng đúng theo ngữ cảnh** trong lần ôn hợp lệ, thay vì chỉ dùng các câu hỏi âm thanh/chính tả.

**Điều cần thảo luận [CHƯA CHỐT]:** Tỷ trọng các dạng câu hỏi ở từng Level; hình thức kiểm tra nào đủ điều kiện lên Level; cách xử lý các từ không có câu ví dụ hoặc không thể nghe phát âm.

---

## 5. Một phiên luyện tập nên có bao nhiêu từ?

### 5.1. Các phương án cân nhắc [ĐỀ XUẤT]

| Phương án | Số từ khác nhau mỗi phiên | Điểm mạnh | Hạn chế |
|---|---:|---|---|
| Ngắn | 6–8 | Dễ bắt đầu, ít áp lực | Ít từ để tạo khoảng cách giữa các lượt lặp |
| Cân bằng | **10–15** | Có đủ từ để xen kẽ, thời lượng vừa phải | Vẫn có thể dài nếu nhiều từ trả lời sai |
| Dài | 16–20 | Xử lý nhiều từ trong một lần | Tăng tải nhận thức, số câu hỏi có thể rất nhiều |

### 5.2. Mặc định đề xuất: 12 từ khác nhau/phiên [ĐỀ XUẤT]

- **12 từ là mục tiêu của một phiên**, không phải giới hạn cứng và **không phải 12 câu hỏi**.
- Một từ có thể xuất hiện nhiều lần, nhất là từ mới hoặc từ sai; do đó **số câu hỏi có thể lớn hơn số từ**.
- Nếu kho từ không đủ 12 từ phù hợp, cho phép phiên có ít từ hơn; không cần thêm từ không đến hạn chỉ để đủ số.
- Nếu có rất nhiều từ đến hạn, có thể tổ chức nhiều phiên; không cần ép giải quyết toàn bộ trong một phiên duy nhất.
- Nên tránh thường xuyên vượt **20 từ khác nhau** trong một phiên.

**Lý do:** Không có nghiên cứu xác lập chính xác “12” là con số tối ưu cho mọi người học. Đây là một giá trị khởi đầu thực dụng, dung hòa giữa khả năng tập trung và việc xen kẽ câu hỏi, có thể điều chỉnh khi đã có trải nghiệm học thực tế.

---

## 6. Bao nhiêu lần trả lời đúng thì tăng Level?

### 6.1. Các cách tiếp cận [ĐỀ XUẤT]

| Phương án | Cách tăng cấp | Đánh giá |
|---|---|---|
| A. Đếm tổng câu đúng | Đủ số câu đúng thì tăng một cấp, kể cả cùng phiên | Đơn giản nhưng dễ “cày” đáp án trong trí nhớ ngắn hạn |
| B. Mỗi lần ôn đúng hạn tăng 1 cấp | Từ đã học chỉ tăng khi nhớ đúng vào một lần ôn cách quãng | Phù hợp ý nghĩa 5 Level và SRS hơn |
| C. Mỗi lần ôn đúng hạn phải đúng nhiều dạng bài | Kiểm tra kỹ hơn trước khi tăng cấp | Có thể gây mệt, nhất là với từ đã nhớ tốt |

### 6.2. Quy tắc khuyến nghị [ĐỀ XUẤT]

- **Từ chưa học → Level 1:** Cần **2 lượt nhớ lại đúng**, có câu hỏi khác xen kẽ và tối thiểu một lượt kiểm tra nghĩa/ngữ cảnh.
- **Level 1 → 2, Level 2 → 3, Level 3 → 4, Level 4 → 5:** Một **lần ôn đến hạn và trả lời đúng hợp lệ** có thể tăng **tối đa 1 Level**.
- **Ở Level 5:** Trả lời đúng giữ Level 5, tiếp tục hẹn ôn duy trì.
- Lượt hỏi lại **sau khi đã sai và được xem đáp án** có tác dụng củng cố, **không cộng Level lại ngay trong phiên đó**.
- Chỉ tính một lần đánh giá chính cho mỗi từ trong một phiên; các lượt hỏi thêm không tạo cơ hội lên cấp lặp đi lặp lại.

**Vấn đề cần xác nhận [CHƯA CHỐT]:** Khi người dùng trả lời đúng bài nghe-gõ nhưng thất bại ở bài kiểm tra nghĩa, có tính là “đúng hợp lệ” để tăng cấp hay không? Khuyến nghị là **không**: Level ghi nhớ từ vựng nên phản ánh cả khả năng hiểu nghĩa.

---

## 7. Hệ thống 5 cấp độ ghi nhớ

| Cấp độ | Ý nghĩa dự kiến | Vai trò trong ôn tập |
|---|---|---|
| **Chưa học** | Đã lưu từ nhưng chưa học | Chờ đưa vào phiên học |
| **Level 1** | Đã tiếp thu ban đầu, rất dễ quên | Cần ôn lại sớm |
| **Level 2** | Bắt đầu nhớ được từ sau một khoảng ngắn | Vẫn cần ôn thường xuyên |
| **Level 3** | Nhớ tương đối ổn định | Kéo giãn thời gian ôn |
| **Level 4** | Nhớ tốt | Kiểm tra lại sau vài ngày |
| **Level 5** | Thành thạo ở thời điểm hiện tại | Ôn duy trì, không loại khỏi hệ thống |

**“Chưa học” chỉ là trạng thái trước khi học**, không bắt buộc tính là một cấp độ thứ sáu.

### 7.1. Trả lời sai [ĐÃ CHỐT VỀ NGUYÊN TẮC; CHƯA CHỐT CHI TIẾT]

- Trả lời sai làm giảm mức ghi nhớ.
- Từ sai được luyện lại trong phiên để củng cố.
- **Đề xuất mức giảm:** Mỗi lần đánh giá chính sai, giảm **1 Level**, tối thiểu giữ Level 1 đối với từ đã bắt đầu học.
- Nếu đã ở Level 1 mà sai, giữ Level 1 và tiếp tục ôn sớm; không đưa về trạng thái chưa học.
- Một từ sai nhiều câu hỏi trong cùng phiên không bị giảm liên tiếp nhiều cấp chỉ vì được hỏi lại để sửa lỗi.
- Từ Level 5 bị quên cũng phải có khả năng trở về Level thấp hơn.

---

## 8. Lịch ôn Spaced Repetition rút ngắn

### 8.1. Lịch trước đây và lịch đề xuất [ĐỀ XUẤT, CHƯA CHỐT]

| Cấp độ vừa đạt | Lịch trước đây | Lịch rút ngắn đề xuất |
|---|---:|---:|
| Level 1 | 30 phút | **10 phút** |
| Level 2 | 1 ngày | **6 giờ** |
| Level 3 | 3 ngày | **1 ngày** |
| Level 4 | 7 ngày | **3 ngày** |
| Level 5 | 30 ngày | **7 ngày** |

**Chuỗi đề xuất:** `10 phút → 6 giờ → 1 ngày → 3 ngày → 7 ngày`.

**Đây là các khoảng cách sau khi từ đạt Level tương ứng**, không phải điều kiện để tự động lên Level. Đến hạn chỉ có nghĩa là cần được kiểm tra. Level thay đổi sau khi đánh giá khả năng nhớ.

### 8.2. Lý do giảm khoảng cách

- Giai đoạn đầu người học thường chưa có trí nhớ đủ bền, nên cần gặp lại từ sớm hơn.
- Khoảng cách vẫn tăng dần để tránh hỏi lặp sát nhau không cần thiết.
- Không nên mặc định “càng ôn dày càng tốt”: ôn quá dày có thể tạo cảm giác thuộc nhanh nhưng không kiểm tra được trí nhớ dài hạn và làm tăng khối lượng luyện tập.
- Không có bằng chứng cho một lịch phút/giờ/ngày cố định phù hợp mọi từ và mọi người. Lịch này là **điểm bắt đầu để thử nghiệm**, không phải công thức được MochiVocab công bố.

### 8.3. Duy trì ở Level 5 [CHƯA CHỐT]

Có hai hướng hợp lý:

- **Phương án ưu tiên ôn thường xuyên:** Sau khi đạt L5, ôn sau **7 ngày**, nếu tiếp tục đúng thì **14 ngày**, rồi duy trì **14 ngày/lần**. Phù hợp mong muốn không để khoảng ôn quá dài; đổi lại có thể tăng số từ phải ôn về lâu dài.
- **Phương án giãn dần:** **7 ngày → 14 ngày → 30 ngày** nếu tiếp tục nhớ đúng. Tiết kiệm thời gian hơn khi số từ thành thạo tăng nhiều, nhưng lần ôn xa nhất sẽ quay lại mốc 30 ngày mà chủ sản phẩm từng thấy quá dài.

**Khuyến nghị tạm thời:** Chọn **7 → 14 → 14 ngày** khi chưa có dữ liệu thực tế, do chủ sản phẩm đã yêu cầu rút ngắn lịch. Chỉ mở rộng lên 30 ngày nếu sau này chính người dùng chấp nhận. Cả hai vẫn là đề xuất, **chưa được chốt**.

### 8.4. Nếu đến hạn mà không học ngay [ĐỀ XUẤT]

- Một từ quá hạn phải được **ưu tiên** trong phiên ôn tiếp theo.
- Không tự động hạ Level chỉ vì người dùng bỏ qua vài giờ/ngày; cần kiểm tra rồi mới xác định nhớ hay quên.
- Không có cơ chế ép người dùng phải học vào đúng phút đến hạn.
- Một khi có quá nhiều từ quá hạn, cần giảm lượng từ mới để xử lý ôn tập trước.

---

## 9. Trộn từ mới với từ cũ trong một phiên

### 9.1. Các phương án [ĐỀ XUẤT]

| Phương án | Từ cũ đến hạn | Từ mới | Nhận xét |
|---|---:|---:|---|
| Ưu tiên mở rộng vốn từ | 50% | 50% | Tăng số từ mới nhanh nhưng dễ tích lũy từ chưa ôn |
| **Cân bằng, thiên về ghi nhớ** | **~70%** | **~30%** | Duy trì ôn cũ nhưng vẫn học thêm đều đặn |
| Tập trung chống quên | 85–100% | 0–15% | Thích hợp khi có nhiều từ quá hạn |

### 9.2. Quy tắc mặc định [ĐỀ XUẤT]

- Mặc định một phiên **12 từ khác nhau** có thể gồm **8 từ cũ đến hạn + 4 từ mới** (xấp xỉ 70/30).
- Các từ mới và từ cũ được **xen kẽ**, không cần gom thành hai khối học tách biệt.
- Ưu tiên chọn: **từ quá hạn lâu / cần ôn gấp → từ đến hạn → từ chưa học**.
- Tỷ lệ là **mục tiêu linh hoạt**, không phải cam kết phiên nào cũng đúng 8/4.

| Tình trạng kho từ | Tỷ lệ gợi ý | Lý do |
|---|---|---|
| Rất ít từ đến hạn | Có thể tăng phần từ mới | Không tạo phiên ôn giả chỉ để đủ số |
| Bình thường | **70% cũ / 30% mới** | Học đều và không bỏ quên từ đã gặp |
| Nhiều từ quá hạn | **85% cũ / 15% mới** | Hạn chế làm tồn đọng trầm trọng hơn |
| Tồn đọng ôn tập nghiêm trọng | **100% cũ / 0% mới** (tạm thời) | Xử lý các từ có nguy cơ quên trước |

**[CHƯA CHỐT]** Ngưỡng thế nào được coi là “nhiều” hoặc “nghiêm trọng”, và có cho phép người dùng chủ động chọn phiên chỉ học mới hoặc chỉ ôn cũ hay không.

---

## 10. Xử lý từ trả lời sai trong phiên

### 10.1. Quy trình đề xuất [ĐỀ XUẤT]

1. Khi người học trả lời sai, cung cấp **đáp án đúng, nghĩa và/hoặc ví dụ phù hợp**.
2. Không hỏi lại đúng nguyên câu ngay lập tức.
3. Cho **5–10 câu hỏi khác** xen giữa nếu số lượng từ và độ dài phiên cho phép.
4. Đưa từ sai quay lại qua **một dạng bài khác** nếu phù hợp.
5. Lượt sửa sai là cơ hội củng cố, **không được dùng để tăng Level ngay**.
6. Nếu tiếp tục sai, vẫn đưa vào diện cần ôn sớm trong lần luyện tiếp theo; tránh kéo phiên học thành vòng lặp vô hạn.

**Lưu ý:** “5–10 câu xen giữa” là khoảng đề xuất chứ không phải luật bất biến. Phiên có quá ít từ có thể không đủ câu để tạo khoảng cách này.

---

## 11. Chế độ Flashcard độc lập

### 11.1. Vai trò [ĐÃ CHỐT]

- Người học có thể chủ động ôn bằng thẻ từ, lật thẻ để đối chiếu từ và nghĩa.
- Có thể sử dụng tự đánh giá **Nhớ / Không nhớ**.
- Đây **không phải hình thức bắt buộc** để hoàn thành một phiên luyện tập thông thường.

### 11.2. Ảnh hưởng đến Level [ĐỀ XUẤT, CHƯA CHỐT]

- **Khuyến nghị:** Flashcard dùng cho **luyện tập tự do**, không trực tiếp tăng Level, nhằm tránh việc lật thẻ và tự bấm “Nhớ” liên tục làm mất ý nghĩa của SRS.
- Có thể ghi nhận việc đã xem lại từ; tuy nhiên việc lên Level nên dựa vào các lượt ôn hợp lệ trong luyện tập chính.
- Nếu sau này muốn cho Flashcard ảnh hưởng Level, cần một quy tắc riêng bảo đảm thời gian cách quãng và tránh cộng cấp lặp trong một phiên.

---

## 12. Những tình huống cần xử lý hợp lý

| Tình huống | Hướng xử lý đề xuất |
|---|---|
| Kho chỉ có 1–5 từ | Vẫn học được phiên ngắn, không cần đủ 12 từ |
| Chưa có từ nào đến hạn | Có thể luyện từ mới; nếu không có từ mới thì không ép ôn sớm để lên cấp |
| Có hàng chục từ quá hạn | Ưu tiên ôn cũ; tạm hạn chế hoặc ngừng đưa từ mới vào phiên |
| Một từ liên tục trả lời sai | Giải thích, luyện lại có khoảng cách và ôn sớm; tránh lặp vô hạn |
| Một từ Level 5 bị quên | Giảm cấp theo nguyên tắc chung; không coi “đã thuộc” là vĩnh viễn |
| Không có câu ví dụ đủ rõ | Không tạo câu điền từ mơ hồ; dùng dạng bài phù hợp khác |
| Không có audio hoặc không thể nghe | Không ép dùng bài nghe; chuyển sang dạng bài không phụ thuộc âm thanh |
| Từ có nhiều nghĩa | Đánh giá đáp án theo đúng nghĩa/ngữ cảnh đang học; không coi mọi nghĩa khác nhau là sai |
| Người dùng nghỉ học nhiều ngày | Đưa từ quá hạn trở lại ưu tiên, không hạ Level tự động vì vắng mặt |
| Chỉ nhớ cách viết, không nhớ nghĩa | Không coi đó là bằng chứng đầy đủ để tăng mức thành thạo từ vựng |

Các cách xử lý trong bảng là **đề xuất nghiệp vụ**, chưa mặc định là quyết định cuối cùng.

---

## 13. Ví dụ hành trình học với từ “resilient”

**Từ được thêm:** `resilient` — *kiên cường; có khả năng phục hồi sau khó khăn*.

1. **Lưu từ:** Từ ở trạng thái **Chưa học**, không bị ép bắt đầu ngay.
2. **Phiên luyện tập đầu:** Khi được chọn vào phiên, người học tiếp xúc với nghĩa, phát âm, ví dụ. Hệ thống đưa ra câu chọn nghĩa. Sau một số câu khác, từ xuất hiện lại trong bài điền từ vào câu. Nếu hai lượt nhớ đúng và có ít nhất một lần xác minh nghĩa/ngữ cảnh, từ **đạt L1**.
3. **Sau khoảng 10 phút:** Từ đến hạn. Trong một phiên ôn hợp lệ, nếu nhớ đúng nghĩa hoặc dùng đúng theo ngữ cảnh, từ được **tăng L2**.
4. **Sau khoảng 6 giờ:** Từ lại đến hạn; trả lời đúng hợp lệ thì **lên L3**.
5. **Sau khoảng 1 ngày:** Trả lời đúng hợp lệ thì **lên L4**.
6. **Sau khoảng 3 ngày:** Trả lời đúng hợp lệ thì **lên L5**.
7. **Sau khoảng 7 ngày:** Vẫn ôn duy trì; nếu nhớ đúng, giữ L5 và lên lịch lần sau (có thể sau 14 ngày, tùy phương án được chốt).
8. **Nếu một lần kiểm tra chính bị sai:** Ví dụ từ đang L4, giảm xuống **L3** theo quy tắc đề xuất; từ được sửa sai trong phiên, sau đó xếp lịch ôn sớm. Việc trả lời lại đúng ngay sau khi đã xem đáp án **không đưa từ trở lại L4 ngay**.

Các mốc thời gian minh họa là **lịch đề xuất**, không phải kết quả đo trí nhớ cá nhân hoặc công thức của MochiMochi.

---

## 14. Các thống kê học tập đã chọn [ĐÃ CHỐT Ở MỨC TÍNH NĂNG]

VOP cần có khả năng tổng hợp thông tin giúp người dùng biết quá trình học có hiệu quả không, ví dụ:

- Tổng số từ đã lưu.
- Số từ chưa bắt đầu học.
- Số từ hiện đang ở Level 1, 2, 3, 4 và 5.
- Số từ đến hạn hoặc quá hạn ôn.
- Số từ đã học mới và số lượt ôn trong một khoảng thời gian.
- Tỷ lệ trả lời đúng/sai, những từ hay quên.
- Tiến độ tăng cấp theo thời gian.

**[CHƯA CHỐT]** Bộ chỉ số cụ thể, các chỉ số bắt buộc so với chỉ số tham khảo, cách tính “đã thuộc” khi từ đang ở Level 5 nhưng quá hạn lâu.

---

## 15. Các quyết định còn mở để chủ sản phẩm xác nhận

| Mã | Nội dung cần chốt | Khuyến nghị hiện tại |
|---|---|---|
| O1 | Có giữ tùy chọn “Học ngay” sau khi lưu từ? | Có, nhưng không bắt buộc |
| O2 | Số từ khác nhau trong phiên mặc định? | **12 từ**, linh hoạt 6–20 |
| O3 | Điều kiện từ mới trở thành Level 1? | **2 lượt đúng**, cách nhau bởi câu khác; ít nhất 1 lượt kiểm tra nghĩa/ngữ cảnh |
| O4 | Lên L2–L5 sau bao nhiêu lượt? | **1 lượt ôn đúng hợp lệ khi đến hạn**, tối đa +1 Level/phiên |
| O5 | Sai giảm bao nhiêu cấp? | **-1 Level** cho mỗi lần đánh giá chính bị sai, không giảm lặp khi sửa lỗi |
| O6 | Tỷ lệ trộn từ mới/cũ? | **8 cũ + 4 mới** ở phiên 12 từ, điều chỉnh theo lượng từ đến hạn |
| O7 | Lịch ôn rút ngắn? | **10 phút / 6 giờ / 1 ngày / 3 ngày / 7 ngày** |
| O8 | Ôn duy trì Level 5? | **7 → 14 → 14 ngày** nếu muốn tránh khoảng cách quá dài; phương án khác 7 → 14 → 30 |
| O9 | Flashcard ảnh hưởng Level? | Khuyến nghị **không tăng Level trực tiếp** |
| O10 | Một bài nghe-gõ đúng có đủ tăng Level? | Khuyến nghị **không**, phải kiểm tra nghĩa hoặc ngữ cảnh |
| O11 | Khi nào coi backlog quá nhiều để tạm ngừng từ mới? | Chưa xác định ngưỡng |
| O12 | Người dùng có thể chủ động chọn “chỉ học mới”/“chỉ ôn cũ” không? | Chưa chốt |

> Các dòng trong mục 15 là **điểm đang thảo luận**. Agent hoặc người đọc không nên hiểu chúng là yêu cầu triển khai đã duyệt.

---

## 16. Cơ sở tham khảo và giới hạn nghiên cứu

**Nguồn mô tả sản phẩm:**

1. [MochiVocab — Học từ vựng tiếng Anh hiệu quả](https://mochidemy.com/tienganh/) — giới thiệu cách tiếp cận ôn tập và 5 cấp độ ghi nhớ.
2. [MochiMochi — Tổng hợp các tính năng](https://mochidemy.com/blog/mochimochi-tinh-nang/) — thông tin về các đặc điểm học/ôn của Mochi.
3. [Duolingo — What Is Spaced Repetition, and Why Is It Good for Learning?](https://blog.duolingo.com/spaced-repetition-for-learning/) — mô tả cách ôn cách quãng.
4. [Duolingo — The Science Behind Duolingo’s Home Screen Redesign](https://blog.duolingo.com/new-duolingo-home-screen-design/) — giải thích việc xen nội dung cũ vào quá trình học mới.
5. [Duolingo — Measuring Lesson Recall](https://blog.duolingo.com/review-exercises-help-measure-learner-recall/) — vai trò đánh giá khả năng nhớ lại.

**Nghiên cứu về học tập và ghi nhớ:**

6. [Karpicke & Roediger (2008), *The critical importance of retrieval for learning*](https://pubmed.ncbi.nlm.nih.gov/18276894/) — củng cố bằng cách tự nhớ lại có giá trị cho ghi nhớ lâu dài.
7. [Rawson & Dunlosky, *Optimizing schedules of retrieval practice for durable and efficient learning*](https://pubmed.ncbi.nlm.nih.gov/21707204/) — học đến tiêu chí recall và học lại qua các khoảng cách.
8. [Nakata, *Does repeated practice make perfect?*](https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/abs/does-repeated-practice-make-perfect-the-effects-of-withinsession-repeated-retrieval-on-second-language-vocabulary-learning/F14BA8A576CD2563D14CEA46E35D842E) — tác dụng và hiệu suất của việc lặp retrieval trong một phiên học từ vựng ngoại ngữ.
9. [Nakata & Webb, *Does studying vocabulary in smaller sets increase learning?*](https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/abs/does-studying-vocabulary-in-smaller-sets-increase-learning/E17B75ABAE1300734AF014C363D59FBC) — ảnh hưởng của kích thước nhóm từ đối với kết quả học.
10. [Nakata, *Effects of expanding and equal spacing on second language vocabulary learning*](https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/abs/effects-of-expanding-and-equal-spacing-on-second-language-vocabulary-learning/D1D796306985C52F9BE7A1200AC50DB9) — so sánh lịch cách quãng tăng dần và đều nhau.
11. [Belardi và cộng sự (2021), *Spacing, Feedback, and Testing Boost Vocabulary Learning in a Web Application*](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.757262/full) — lợi ích phối hợp kiểm tra, phản hồi và ôn cách quãng.

### Giới hạn suy luận

- Nghiên cứu hỗ trợ **nguyên tắc** học theo retrieval, feedback và spacing, nhưng **không chứng minh các thông số “12 từ”, “2 lần đúng”, “70/30” hay “10 phút → 6 giờ → 1 ngày → 3 ngày → 7 ngày” là tối ưu cho riêng VOP**.
- Lịch và tỷ lệ trên là **đề xuất thiết kế sản phẩm để thử nghiệm**, không phải số liệu/công thức chính thức do MochiMochi hoặc Duolingo công bố.
- Chủ sản phẩm chưa xác nhận các đề xuất định lượng. Khi chốt ý tưởng, cần rà lại danh sách câu hỏi trong mục 15 và đổi trạng thái phù hợp.

---

## 17. Tóm tắt một đoạn dành cho người đọc/Agent

**VOP là app học từ vựng tiếng Anh cá nhân cho một người.** Người dùng tự thêm từ tiếng Anh + nghĩa tiếng Việt, quản lý kho từ và không bị ép học ngay sau khi thêm. Việc học chính diễn ra qua các phiên luyện tập trộn từ mới với từ đến hạn, sử dụng nhiều dạng bài tập: chọn nghĩa 4 đáp án, nghe-chọn, nghe-gõ và điền từ vào câu. Flashcard là chế độ riêng. Mỗi từ trải qua 5 Level ghi nhớ theo nguyên tắc active recall và spaced repetition; trả lời sai có thể giảm cấp, từ sai được luyện lại, và Level 5 vẫn có ôn duy trì. Có IPA, phát âm, ví dụ và thống kê học tập. Không có phân nhóm theo chủ đề, nhắc nhở hằng ngày hoặc dạng bài chỉ nhìn nghĩa Việt rồi nhập từ Anh độc lập. Các thông số **12 từ/phiên, 2 lượt đúng cho từ mới, mỗi lần ôn đến hạn đúng tăng tối đa 1 Level, trộn 70/30, lịch 10 phút–6 giờ–1 ngày–3 ngày–7 ngày và chính sách ôn Level 5** là **đề xuất đang chờ chủ sản phẩm chốt**, không phải quyết định đã phê duyệt.
