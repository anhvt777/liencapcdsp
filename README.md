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
