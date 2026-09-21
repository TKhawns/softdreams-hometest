Xây dựng một React Component (full new source code) quản lý lịch làm việc theo dạng Time Blocking, cho
phép người dùng tạo và quản lý các công việc (Event) trên lịch. Giao diện tương tự Google Calendar, cần đảm bảo các chức năng chính UX giống google calendar.

Yêu cầu:

1. Các việc (Event) bao gồm tiêu đề (title), mô tả (description), thời gian bắt đầu (start date time), thời
   gian kết thúc (end date time).

- Thời gian bao gồm cả ngày + thời gian (Không có all-day event).

2. Khoảng thời gian hiển thị là 7 ngày tính từ thời điểm hiện tại.
3. Khi kéo và thả trên một đoạn thời gian trống, hiện dialog cho phép tạo mới Event.
4. Khi kéo, thả Event, update lại thời gian của Event cho đúng với đoạn thời gian mới.
5. Khi click chuột trái vào Event hiện dialog mô tả Event.
6. Khi click chuột phải vào Event hiện context menu, gốm 2 action là Sửa (Edit) và Xóa (Delete)
7. Commit theo task plan flow, chưa push. Tôi tự push manual.

- Nếu chọn sửa, hiện dialog cho phép sửa Event.
- Nếu chọn xóa, thực hiện xóa Event.

Lưu ý:

- Techstack: React vite, tanstack router, pnpm, biome.
- Sử dụng Typescript để cài đặt.
- Không sử dụng bất kỳ thư viện bên ngoài nào.
- Được sử dụng Tailwind-Css cho việc style.
- Source code phân tách các component nhỏ gọn, dễ hiểu.
