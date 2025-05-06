# Hướng Dẫn CI/CD cho Dự Án RunOut-Biliard

## Tổng Quan

RunOut-Biliard sử dụng GitHub Actions để tự động hóa quy trình Continuous Integration (CI) và Continuous Deployment (CD). Tài liệu này mô tả cách thức hoạt động của các pipeline CI/CD và cách các developer có thể làm việc với chúng.

## Quy Trình Làm Việc (Workflow)

### 1. Quy Trình Phát Triển

1. **Tạo Branch Mới**: Bắt đầu từ nhánh `develop`, tạo một branch mới cho tính năng hoặc sửa lỗi của bạn:
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/your-feature-name
   ```

2. **Phát Triển**: Viết code, tests và commit thường xuyên:
   ```bash
   git add .
   git commit -m "feat: implement xyz feature"
   ```

3. **Push Branch**: Đẩy branch lên GitHub:
   ```bash
   git push -u origin feature/your-feature-name
   ```

4. **Tạo Pull Request**: Tạo Pull Request (PR) từ branch của bạn vào nhánh `develop`.
   - Điền thông tin theo template PR
   - Chỉ định reviewer thích hợp

5. **CI Tự Động Chạy**: Khi PR được tạo, workflow CI sẽ tự động chạy.

6. **Merge**: Sau khi PR được approve và tất cả checks đã thành công, bạn có thể merge PR vào nhánh `develop`.

### 2. Quy Trình Release

1. **Tạo Release Branch**: Khi chuẩn bị release, tạo branch từ `develop`:
   ```bash
   git checkout develop
   git checkout -b release/v1.0.0
   ```

2. **Cập Nhật Version**: Cập nhật version trong package.json và các tài liệu khác.

3. **Tạo PR vào Main**: Tạo Pull Request từ branch release vào nhánh `main`.

4. **Chạy Tests**: Đảm bảo CI hoàn thành thành công.

5. **Merge vào Main**: Sau khi PR được approve, merge vào `main`.

6. **Tạo Tag**: Tạo tag cho version mới:
   ```bash
   git checkout main
   git pull
   git tag -a v1.0.0 -m "Version 1.0.0"
   git push origin v1.0.0
   ```

7. **Đồng Bộ về Develop**: Tạo PR để merge `main` trở lại `develop`.

## Chi Tiết về CI Pipeline

Pipeline CI sẽ tự động chạy khi:
- Push vào nhánh `main` hoặc `develop`
- Tạo Pull Request vào `main` hoặc `develop`

### Các bước trong CI Pipeline

1. **Backend Tests**:
   - Khởi tạo môi trường với Node.js và MongoDB
   - Cài đặt dependencies
   - Kiểm tra linting
   - Chạy unit tests và integration tests
   - Tạo coverage report

2. **Frontend Tests**:
   - Cài đặt dependencies
   - Kiểm tra linting
   - Chạy unit tests
   - Build ứng dụng

3. **Security Scan**:
   - Chạy npm audit để kiểm tra các dependencies có vấn đề bảo mật không

## Chi Tiết về CD Pipeline

Pipeline CD sẽ tự động chạy khi:
- Push vào nhánh `main`
- Kích hoạt thủ công qua GitHub

### Các bước trong CD Pipeline

1. **Deploy Backend**:
   - Build Docker image
   - Push image lên Docker Hub
   - SSH vào production server và cập nhật container

2. **Deploy Frontend**:
   - Build ứng dụng React với biến môi trường production
   - Deploy lên service hosting (Netlify/Vercel)

3. **Notify**:
   - Gửi thông báo tới Slack về status của deployment

## Biến Môi Trường trong GitHub Secrets

Các GitHub Secrets sau cần được cấu hình:

- `DOCKER_HUB_USERNAME`: Username Docker Hub
- `DOCKER_HUB_TOKEN`: Token để authenticate với Docker Hub
- `PRODUCTION_HOST`: Hostname hoặc IP của production server
- `PRODUCTION_USERNAME`: Username SSH cho server
- `PRODUCTION_SSH_KEY`: Private key SSH
- `PRODUCTION_API_URL`: URL của API production
- `NETLIFY_AUTH_TOKEN`: Token Netlify (nếu sử dụng)
- `NETLIFY_SITE_ID`: ID site Netlify (nếu sử dụng)
- `SLACK_WEBHOOK`: Webhook URL cho thông báo Slack

## Troubleshooting

### Pipeline CI Failed

1. Kiểm tra build logs trong tab Actions của GitHub
2. Sửa các lỗi được báo cáo trong logs
3. Push changes vào PR branch
4. CI pipeline sẽ tự động chạy lại

### Pipeline CD Failed

1. Kiểm tra logs và errors
2. Đảm bảo tất cả secrets được cấu hình đúng
3. Kiểm tra kết nối đến production server
4. Thử deploy lại thủ công bằng cách kích hoạt workflow CD trong tab Actions

## Quy Ước Commit

Dự án này sử dụng quy ước [Conventional Commits](https://www.conventionalcommits.org/):

- `feat`: Thêm tính năng mới
- `fix`: Sửa lỗi
- `docs`: Thay đổi documentation
- `style`: Thay đổi không ảnh hưởng đến code (format, spaces, etc.)
- `refactor`: Thay đổi code không thêm tính năng hoặc sửa lỗi
- `perf`: Cải thiện hiệu suất
- `test`: Thêm hoặc sửa tests
- `chore`: Thay đổi build process, tools, etc.

Ví dụ:
```
feat: add user authentication
fix: correct product pagination
docs: update deployment instructions
```

---

© 2025 RunOut-Biliard. Tất cả các quyền thuộc về Steve.