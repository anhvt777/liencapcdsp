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
