# Quản lý thu học sinh — Trường Phổ thông Liên cấp Cao đẳng Sư phạm Quảng Trị

Bản triển khai độc lập được kế thừa từ ứng dụng SchoolCollect của Trường THCS Số 2 Hiếu Giang; giữ nguyên logic quản lý thu và xuất báo cáo hiện có.

## Khởi chạy
Repo: https://github.com/anhvt777/liencapcdsp

Để xuất bản qua GitHub Pages: vào **Settings → Pages → Build and deployment → Deploy from a branch**, chọn **main**, thư mục **/(root)**, sau đó **Save**. Đường dẫn dự kiến khi GitHub Pages đã được bật: https://anhvt777.github.io/liencapcdsp/

## Cấu hình bắt buộc trước khi thu thật
1. Kiểm tra tên trường, cơ quan chủ quản và địa chỉ chứng từ tại màn hình cấu hình; không mặc định chủ quản khi chưa xác nhận chính thức.
2. Cấu hình đúng tài khoản nhận tiền, ngân hàng, mã dịch vụ BIDV và các tham số QR theo hợp đồng thu hộ của trường.
3. Khởi tạo danh sách học sinh **của trường mới** từ tệp Excel và các kỳ/khoản thu đúng nghiệp vụ. Không nhập dữ liệu Hiếu Giang.
4. Thử trên **dữ liệu giả lập** trước khi phát hành QR thu thật; kiểm tra nhận dạng mã, đối soát sao kê, kiểm thử thu thiếu/thu trùng và báo cáo.
5. Sao lưu dữ liệu thường xuyên; dữ liệu thuộc IndexedDB cục bộ, không tự đồng bộ giữa các thiết bị.

## Phân tách dữ liệu
- IndexedDB: `so-thu-hoc-sinh-liencapcdsp-local`.
- Service-worker cache: `so-thu-hoc-sinh-liencapcdsp-shell-`.
- Mã học sinh mặc định: `LCSP-xxxxx` và mã lớp `LCSP-<LOP>-<STT>`.
- Mã học sinh, phân giao khoản thu và QR phải xác nhận khớp từng giao dịch thực tế.
- Không có dữ liệu học sinh thực trong mã nguồn.

## Lưu ý về an toàn và tính phù hợp
Ứng dụng tĩnh hoạt động local-first. GitHub Pages không phải hệ thống đăng nhập và phân quyền cán bộ. Không đưa danh sách học sinh, file sao kê, khoá API hoặc thông tin nhạy cảm vào repository public. Không sử dụng làm hệ thống ghi nhận thu chính thức đa thiết bị trước khi kiểm thử khôi phục/đối soát và bổ sung kiểm soát truy cập phù hợp.

## Nguồn gốc
Kế thừa mã nguồn tại: https://github.com/anhvt777/thcs_so2_hieugiang . Không sửa đổi repo nguồn.

## Triển khai đối chiếu đầu kỳ 2026–2027 (05/11/2026)

- Đối chiếu 714 hồ sơ với 202 học sinh trong danh sách còn thu theo **Lớp + Họ tên + Ngày sinh**; tất cả 202 khớp duy nhất.
- 202 BHYT 683.100đ và 196 BHTT 120.000đ còn thu, tổng 398 món / 161.506.200đ; 6 trường hợp chưa có số tiền BHTT phải xác minh.
- 512 học sinh ngoài danh sách chưa thu là **chờ xác minh đã thu**, không tự sinh giao dịch giả.
- Mở tệp đối chiếu được cung cấp riêng, nhập sheet `06_Nhap_web` (hoặc lưu sheet này thành CSV) vào tab **Nhập dữ liệu**; phải chọn đúng cột tên/lớp/ngày sinh/BHYT/BHTT khi ghép cột.
- Tab **Thu trước BIDV**: chọn bảng CSV xác nhận; chỉ dòng có `XÁC NHẬN` và tham chiếu chứng từ mới được ghi nhận, hỏi lại trước khi ghi. Khoản đã có nghĩa vụ trong hệ thống sẽ đối soát vào sổ giao dịch, ngăn xuất lại; khoản không có nghĩa vụ được lưu hồ sơ lịch sử tách biệt.
- Tab **Bảng kê BIDV** và **Xuất QR theo món**: luôn bật `Chỉ xuất các khoản chưa thu`; cấu hình kỳ thu và mã định danh theo hợp đồng thực tế trước khi phát hành.
- Chỉ lưu file danh sách học sinh và file xác nhận trên thiết bị trường, không upload lên repo public.

## Kết nối nền tảng cổng phụ huynh dùng chung (08/11/2026)

- Cổng Cloudflare hiện tại: `school-parent-dev.tuananh0001.workers.dev`. School ID dành riêng cho trường là `LIENCAPCDSP`, đăng ký trong D1 ở trạng thái `active=0` (chưa công bố). Trưng Vương được giữ nguyên.
- Tab **Sao lưu & cài đặt → Xuất gói chờ duyệt** xuất JSON `school-parent-sync/2` từ IndexedDB của đúng trình duyệt đang sử dụng. Ứng dụng **không truyền tự động** thông tin học sinh, số tiền hoặc giao dịch lên mạng.
- Gói gồm: hồ sơ học sinh, các khoản đang phải thu, tham chiếu thanh toán đã gán, giao dịch thực tế đã đối soát. Các giao dịch giả lập `TESTBIDV` bị loại khỏi nhóm thanh toán và gói được đánh dấu `publish_blocked=true` nếu có giao dịch thử nghiệm trong sổ.
- **Đã triển khai API đa trường** tại `/api/admin/multi-school-sync`, và giao diện có xác thực tại `/admin/multi-school`. Luồng cũ `/api/admin/sync` của Trưng Vương vẫn giữ nguyên. API mới hỗ trợ `preview`, `stage` theo 20 học sinh/lô, `payments_preview`, `payments_commit`, `reissue_codes`, `publish`. Với trường đã công bố có thể tiếp tục đồng bộ các giao dịch mới bằng lô đã `COMMITTED`; chưa hỗ trợ thêm nghĩa vụ mới/đổi khoản thu sau công bố.
- **Kiểm soát:** Cloudflare Access áp dụng cho `/admin*` và `/api/admin/*`, server xác thực JWT và email quản trị, dữ liệu được chia theo mã trường, khóa giao dịch theo `(school_id, source_ref)`, kiểm tra phân bổ cùng mã tham chiếu và không chấp nhận lô có TEST/giả lập.
- **Công bố:** chỉ sau đủ các lô, đúng số hồ sơ/món/giao dịch, xuất và lưu đầy đủ mã tra cứu, cán bộ xác nhận. `LIENCAPCDSP` hiện `active=0`, chưa có học sinh nào được đưa lên D1; QR chỉ hiển thị khi đã được xác minh và duyệt. Cần kiểm thử end-to-end có tài khoản Access của cán bộ và quyết định công bố trước khi sử dụng thực tế.
- Không gửi bản JSON có họ tên/ngày sinh cho bất kỳ trang công khai hoặc repository GitHub; sử dụng kênh nội bộ có phân quyền sau khi backend sẵn sàng. Cần duy trì quyết định đồng ý và thông báo xử lý dữ liệu cá nhân phù hợp của nhà trường.
- Cổng phụ huynh không được hiển thị QR mới được sinh độc lập hoặc tự chuyển QR chưa được nhà trường phê duyệt; chỉ nhận dữ liệu QR kiểm chứng từ nguồn trường.
