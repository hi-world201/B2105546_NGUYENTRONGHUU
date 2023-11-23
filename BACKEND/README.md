# Hiworld BookStore

## Mô tả

HiworldBookStore là một ứng dụng web để quản lý và buôn bán sách của một cửa hàng sách, được phát triển bởi _Nguyễn Trọng Hữu_ - Sinh viên Trường Công nghệ thông tin và truyền thông - Đại học Cần Thơ.

Đây là Bài tập lớn Học phần Phát triển ứng dụng web CT449.

## Cài đặt

Để bắt đầu với ứng dụng Hiworld BookStore, làm theo các bước sau:

1. Sao chép kho lưu trữ:

   ```bash
   git clone https://github.com/hi-world201/B2105546_NGUYENTRONGHUU.git
   ```

2. Di chuyển đến thư mục dự án:

   ```bash
   cd B2105546_NGUYENTRONGHUU/BACKEND
   ```

3. Cài đặt tất cả các gói cần thiết:

   ```bash
   npm install
   ```

## Cấu hình

Trước khi chạy máy chủ, bạn cần cấu hình ứng dụng. Thực hiện các bước sau:

1. Tìm tệp `config.sample.env` trong thư mục gốc của dự án.

2. Đổi tên tệp thành `config.env`:

   ```bash
   mv config.sample.env config.env # Đối với bash
   ren config.sample.env config.env
   ```

3. Mở `config.env` và cập nhật các biến cấu hình cần thiết.

## Khởi động máy chủ

Bây giờ sau khi cài đặt và cấu hình đã hoàn tất, bạn có thể khởi động máy chủ:

```bash
npm run start
```

Lệnh này sẽ khởi động máy chủ ở chế độ production.

## Sử dụng

Truy cập [http://localhost:8080](http://localhost:8080) trong trình duyệt web của bạn để truy cập phía backend của HiworldBookStore.

## Đóng góp

Nếu bạn muốn đóng góp vào Hiworld BookStore, vui lòng fork kho lưu trữ và tạo pull request. Chúng tôi rất hoan nghênh sự đóng góp và cải thiện!

## Hãy thoải mái sửa đổi và phân phối mã nguồn theo nhu cầu của bạn.

Chúc bạn tận hưởng cửa hàng sách của mình với HiworldBookStore!

