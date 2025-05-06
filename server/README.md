# RunOut-Biliard Backend

## Giới Thiệu

Backend cho hệ thống RunOut-Biliard, xây dựng trên nền tảng Node.js, Express và MongoDB. Hệ thống được thiết kế với kiến trúc phân lớp, tách biệt rõ ràng các thành phần và dễ dàng mở rộng.

## Cấu Trúc Dự Án

server/
├── .env                      # Chứa các biến môi trường (API keys, database connection strings, ports, etc.)
├── .eslintrc.js              # Cấu hình ESLint - công cụ kiểm tra lỗi và format code JavaScript
├── .prettierrc               # Cấu hình Prettier - công cụ tự động format code
├── README.md                 # Tài liệu mô tả tổng quan về dự án, hướng dẫn cài đặt và sử dụng
├── jest.config.js            # Cấu hình Jest - framework testing cho JavaScript
├── jsconfig.json             # Cấu hình cho JavaScript trong VS Code (intellisense, path aliases)
├── package.json              # Quản lý dependencies và scripts của dự án
├── src/
│   ├── api/                       # API Layer - xử lý tất cả các HTTP request/response
│   │   ├── controllers/           # Xử lý logic nhận request từ routes và gọi services tương ứng
│   │   │   ├── authController.js       # Xử lý các request liên quan đến xác thực
│   │   │   ├── productController.js    # Xử lý các request liên quan đến sản phẩm
│   │   │   ├── userController.js       # Xử lý các request liên quan đến người dùng
│   │   │   ├── categoryController.js   # Xử lý các request liên quan đến danh mục
│   │   │   ├── orderController.js      # Xử lý các request liên quan đến đơn hàng
│   │   │   ├── cartController.js       # Xử lý các request liên quan đến giỏ hàng
│   │   │   └── reviewController.js     # Xử lý các request liên quan đến đánh giá
│   │   ├── middleware/            # Middleware cụ thể cho API endpoints
│   │   │   ├── errorMiddleware.js      # Xử lý các lỗi từ API routes
│   │   │   ├── loggingMiddleware.js    # Ghi log các request/response API
│   │   │   ├── validationMiddleware.js # Xác thực dữ liệu trước khi xử lý requests
│   │   │   └── authMiddleware.js       # Xác thực JWT và xác minh quyền người dùng
│   │   └── routes/                # Định nghĩa API endpoints và mapping tới controllers
│   │       ├── authRoutes.js           # Endpoints xác thực (đăng nhập, đăng ký, đặt lại mật khẩu)
│   │       ├── productRoutes.js        # Endpoints quản lý sản phẩm (CRUD)
│   │       ├── userRoutes.js           # Endpoints quản lý người dùng (CRUD)
│   │       ├── categoryRoutes.js       # Endpoints quản lý danh mục (CRUD)
│   │       ├── orderRoutes.js          # Endpoints quản lý đơn hàng (CRUD)
│   │       ├── cartRoutes.js           # Endpoints quản lý giỏ hàng (CRUD)
│   │       └── reviewRoutes.js         # Endpoints quản lý đánh giá (CRUD)
│   │
│   ├── app.js                     # Setup Express application, cấu hình middleware và routes
│   │
│   ├── common/                    # Shared code dùng chung trong toàn bộ ứng dụng
│   │   ├── errors/                # Custom error classes
│   │   │   └── apiError.js             # Class định nghĩa các loại lỗi API
│   │   ├── middleware/            # Middleware dùng chung
│   │   │   ├── errorHandler.js         # Middleware xử lý lỗi chung
│   │   │   ├── validate.js             # Middleware validation chung
│   │   │   └── requestLogger.js        # Middleware ghi log request/response
│   │   ├── types/                 # Type definitions và interfaces
│   │   ├── utils/                 # Các utility functions dùng trong nhiều modules
│   │   │   ├── apiFeatures.js          # Xử lý filtering, sorting, pagination
│   │   │   ├── catchAsync.js           # Wrapper function để xử lý async errors
│   │   │   ├── responseHandler.js      # Format response trả về từ API
│   │   │   └── validatorUtils.js       # Các helper functions cho validation
│   │   └── validators/            # Định nghĩa validation schema và rules
│   │       ├── authValidator.js        # Validation rules cho auth requests
│   │       ├── userValidator.js        # Validation rules cho user requests
│   │       ├── productValidator.js     # Validation rules cho product requests
│   │       ├── categoryValidator.js    # Validation rules cho category requests
│   │       ├── orderValidator.js       # Validation rules cho order requests
│   │       ├── cartValidator.js        # Validation rules cho cart requests
│   │       └── reviewValidator.js      # Validation rules cho review requests
│   │
│   ├── config/                    # Cấu hình ứng dụng
│   │   ├── database.js                 # Cấu hình kết nối MongoDB
│   │   ├── environment.js              # Quản lý biến môi trường
│   │   ├── indexes.js                  # Cấu hình indexes cho database
│   │   ├── logger.js                   # Cấu hình logging
│   │   ├── middleware.js               # Cấu hình middleware ứng dụng
│   │   └── monitoring.js               # Cấu hình health checks và monitoring
│   │
│   ├── data/                      # Data Layer - tương tác với database
│   │   ├── dto/                   # Data Transfer Objects - chuyển đổi dữ liệu giữa service và controller
│   │   │   ├── cartDTO.js              # DTO cho cart data
│   │   │   ├── categoryDTO.js          # DTO cho category data
│   │   │   ├── orderDTO.js             # DTO cho order data
│   │   │   ├── productDTO.js           # DTO cho product data
│   │   │   ├── reviewDTO.js            # DTO cho review data
│   │   │   └── userDTO.js              # DTO cho user data
│   │   │
│   │   ├── models/                # Mongoose Models - định nghĩa schema và validation
│   │   │   ├── cart.model.js           # Model cho collection carts
│   │   │   ├── category.model.js       # Model cho collection categories
│   │   │   ├── order.model.js          # Model cho collection orders
│   │   │   ├── product.model.js        # Model cho collection products
│   │   │   ├── review.model.js         # Model cho collection reviews
│   │   │   └── user.model.js           # Model cho collection users
│   │   │
│   │   └── repositories/          # Repository Pattern - truy vấn database và xử lý dữ liệu
│   │       ├── cartRepository.js       # Repository cho cart data
│   │       ├── categoryRepository.js   # Repository cho category data
│   │       ├── orderRepository.js      # Repository cho order data
│   │       ├── productRepository.js    # Repository cho product data
│   │       ├── reviewRepository.js     # Repository cho review data
│   │       └── userRepository.js       # Repository cho user data
│   │
│   ├── migrations/                # Database migrations - quản lý thay đổi schema
│   │   ├── config.js                   # Cấu hình migration framework
│   │   ├── scripts/                    # Scripts migration cụ thể
│   │   │   ├── 001-initial-categories.js  # Migration đầu tiên tạo categories
│   │   │   └── 002-add-indexes.js        # Migration thêm indexes
│   │   ├── index.js                    # Entry point cho migrations
│   │   └── migrationRunner.js          # Logic chạy migrations
│   │
│   ├── seeds/                     # Database seeds - tạo dữ liệu mẫu ban đầu
│   │   ├── data/                  # Dữ liệu mẫu dùng cho seeding
│   │   │   ├── categories.js           # Dữ liệu mẫu cho categories
│   │   │   ├── products.js             # Dữ liệu mẫu cho products
│   │   │   ├── users.js                # Dữ liệu mẫu cho users
│   │   │   ├── orders.js               # Dữ liệu mẫu cho orders
│   │   │   ├── carts.js                # Dữ liệu mẫu cho carts
│   │   │   └── reviews.js              # Dữ liệu mẫu cho reviews
│   │   ├── scripts/               # Scripts chạy seed data
│   │   │   ├── categorySeeder.js       # Seeder cho categories
│   │   │   ├── productSeeder.js        # Seeder cho products
│   │   │   ├── userSeeder.js           # Seeder cho users
│   │   │   ├── orderSeeder.js          # Seeder cho orders
│   │   │   ├── cartSeeder.js           # Seeder cho carts
│   │   │   └── reviewSeeder.js         # Seeder cho reviews
│   │   ├── index.js                    # Entry point cho seeds
│   │   └── runner.js                   # Logic chạy seeds
│   │
│   ├── server.js                  # Entry point của ứng dụng, khởi động server
│   │
│   ├── services/                  # Service Layer - chứa business logic
│   │   ├── auth/                  # Auth services
│   │   │   └── authService.js          # Logic xác thực và phân quyền
│   │   ├── base/                  # Base services
│   │   │   └── baseService.js          # Service cơ sở để extend
│   │   ├── cache/                 # Caching services
│   │   │   └── redisCache.js           # Service quản lý cache với Redis
│   │   ├── email/                 # Email services
│   │   │   ├── emailService.js         # Service gửi email
│   │   │   └── templates/              # Templates email
│   │   │       ├── resetPassword.hbs   # Template email đặt lại mật khẩu
│   │   │       └── verification.hbs    # Template email xác minh tài khoản
│   │   ├── product/               # Product services
│   │   │   └── productService.js       # Logic xử lý sản phẩm
│   │   ├── category/              # Category services
│   │   │   └── categoryService.js      # Logic xử lý danh mục
│   │   ├── user/                  # User services
│   │   │   └── userService.js          # Logic xử lý người dùng
│   │   ├── order/                 # Order services
│   │   │   └── orderService.js         # Logic xử lý đơn hàng
│   │   ├── cart/                  # Cart services
│   │   │   └── cartService.js          # Logic xử lý giỏ hàng
│   │   └── review/                # Review services
│   │       └── reviewService.js        # Logic xử lý đánh giá
│   │
│   └── utils/                     # Utilities chung ít dùng hơn
│       └── queryAnalyzer.js            # Phân tích hiệu suất truy vấn
│
├── tests/                         # Test files
│   ├── unit/                      # Unit tests - kiểm thử từng thành phần riêng lẻ
│   │   ├── services/                   # Tests cho services
│   │   ├── repositories/               # Tests cho repositories
│   │   └── controllers/                # Tests cho controllers
│   ├── integration/               # Integration tests - kiểm thử nhiều thành phần kết hợp
│   │   ├── api/                        # Tests cho API endpoints
│   │   └── repositories/               # Tests cho tương tác repositories với database
│   └── setup.js                   # Cấu hình môi trường test
│
└── logs/                          # Thư mục chứa các file log

```

## Kiến Trúc Phần Mềm

Backend được xây dựng theo kiến trúc phân lớp:

1. **API Layer**: Xử lý HTTP requests và responses, định tuyến và các middleware.
2. **Service Layer**: Chứa business logic, điều phối dữ liệu và xử lý các quy trình.
3. **Data Access Layer**: Tương tác với database, truy xuất và cập nhật dữ liệu.
4. **Common Layer**: Chứa các code dùng chung trong toàn ứng dụng.

## Cài Đặt và Chạy

### Yêu Cầu

- Node.js >= 18.x
- MongoDB >= 6.0
- npm hoặc yarn

### Cài Đặt Phụ Thuộc

```bash
# Cài đặt dependencies
npm install

# Hoặc sử dụng yarn
yarn install
```

### Cấu Hình Môi Trường

```bash
# Sao chép file .env.example thành .env
cp .env.example .env

# Chỉnh sửa file .env với cấu hình của bạn
nano .env
```

### Chạy Ứng Dụng

```bash
# Chạy trong môi trường development
npm run dev

# Chạy trong môi trường production
npm start
```

### Chạy Tests

```bash
# Chạy tất cả tests
npm test

# Chạy tests và theo dõi thay đổi
npm run test:watch
```

## API Endpoints

API của RunOut-Biliard tuân theo chuẩn RESTful và có các endpoints chính sau:

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Products**: `/api/products/*`
- **Categories**: `/api/categories/*`
- **Carts**: `/api/carts/*`
- **Orders**: `/api/orders/*`
- **Reviews**: `/api/reviews/*`

Chi tiết về các API endpoints có thể được tìm thấy trong API documentation.

## Docker

Dự án được containerized với Docker:

```bash
# Build image
docker build -t runout-biliard-server .

# Chạy container
docker run -p 5000:5000 runout-biliard-server
```

Hoặc sử dụng Docker Compose:

```bash
# Khởi động tất cả services
docker-compose up

# Chạy trong background
docker-compose up -d
```

## Tính Năng

- **Authentication & Authorization**: JWT-based authentication và role-based authorization.
- **User Management**: Đăng ký, đăng nhập, quản lý profile.
- **Email Service**: Gửi email xác thực và đặt lại mật khẩu.
- **Product Management**: CRUD cho sản phẩm, danh mục, và đánh giá.
- **Cart & Order**: Quản lý giỏ hàng và đơn hàng.
- **Payment Integration**: Tích hợp cổng thanh toán VNPay.
- **Error Handling**: Xử lý lỗi thống nhất.
- **Logging**: Logging đầy đủ cho debugging và monitoring.
- **Validation**: Validation dữ liệu đầu vào.

## Đóng Góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/amazing-feature`)
3. Commit thay đổi của bạn (`git commit -m 'feat: add some amazing feature'`)
4. Push lên branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## Giấy Phép

© 2025 RunOut-Biliard. Tất cả các quyền thuộc về Steve.
