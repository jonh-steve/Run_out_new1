```
server/
└── src/
    └── common/                    # Shared code dùng chung trong toàn bộ ứng dụng
        ├── errors/                # Custom error classes
        │   ├── apiError.js             # Class định nghĩa các loại lỗi API chung
        │   ├── authError.js            # Lỗi liên quan đến xác thực
        │   ├── validationError.js      # Lỗi liên quan đến validation
        │   ├── notFoundError.js        # Lỗi khi không tìm thấy tài nguyên
        │   ├── forbiddenError.js       # Lỗi về quyền truy cập
        │   └── businessError.js        # Lỗi liên quan đến business logic
        │
        ├── middleware/            # Middleware dùng chung
        │   ├── errorHandler.js         # Middleware xử lý lỗi chung
        │   ├── validate.js             # Middleware validation chung
        │   ├── requestLogger.js        # Middleware ghi log request/response
        │   └── rateLimiter.js          # Giới hạn số request trong một khoảng thời gian
        │
        │
        │
        └── validators/            # Định nghĩa validation schema và rules
            ├── authValidator.js        # Validation rules cho auth requests
            ├── userValidator.js        # Validation rules cho user requests
            ├── productValidator.js     # Validation rules cho product requests
            ├── categoryValidator.js    # Validation rules cho category requests
            ├── orderValidator.js       # Validation rules cho order requests
            ├── cartValidator.js        # Validation rules cho cart requests
            ├── reviewValidator.js      # Validation rules cho review requests
            └── commonValidator.js      # Validation rules dùng chung

        └── readme.md                 # README file for common package

```
1. errors/
Thư mục này chứa các class định nghĩa lỗi tùy chỉnh để xử lý lỗi một cách nhất quán trong toàn bộ ứng dụng.

apiError.js: Class cơ sở cho tất cả các loại lỗi API. Định nghĩa cấu trúc lỗi với statusCode, message, và các thông tin bổ sung.
authError.js: Lỗi xác thực như token không hợp lệ, hết hạn, không có quyền, v.v.
validationError.js: Lỗi xảy ra khi dữ liệu đầu vào không đạt yêu cầu validation.
notFoundError.js: Lỗi khi tài nguyên không tồn tại (404).
forbiddenError.js: Lỗi khi người dùng không có quyền truy cập tài nguyên (403).
businessError.js: Lỗi liên quan đến logic nghiệp vụ, ví dụ: sản phẩm hết hàng, đơn hàng đã bị hủy, v.v.

2. middleware/
Chứa các middleware dùng chung có thể áp dụng ở nhiều nơi trong ứng dụng.

errorHandler.js: Middleware xử lý tất cả các lỗi, chuyển đổi chúng thành response chuẩn.
validate.js: Middleware xác thực dữ liệu đầu vào dựa trên schema được định nghĩa.
requestLogger.js: Ghi log tất cả các requests và responses để debugging và monitoring.
rateLimiter.js: Giới hạn số lượng request trong một khoảng thời gian để ngăn chặn DoS.

3. types/
Định nghĩa các kiểu dữ liệu và interfaces để đảm bảo tính nhất quán trong toàn bộ ứng dụng.

express.d.ts: Mở rộng kiểu dữ liệu cho Express, ví dụ: thêm thuộc tính user vào Request.
auth.types.js: Định nghĩa các kiểu liên quan đến xác thực như UserRole, TokenPayload.
product.types.js: Định nghĩa các kiểu dữ liệu cho sản phẩm như ProductStatus, ProductVariant.
order.types.js: Định nghĩa các kiểu dữ liệu cho đơn hàng như OrderStatus, PaymentStatus.
common.types.js: Các kiểu dữ liệu dùng chung như PaginationParams, SortDirection.

4. utils/
Các hàm tiện ích dùng chung trong ứng dụng.

apiFeatures.js: Xử lý các tính năng API như filtering, sorting, pagination một cách nhất quán.
catchAsync.js: Wrapper function để bắt lỗi trong các hàm async mà không cần try/catch lặp lại.
responseHandler.js: Chuẩn hóa cấu trúc response từ API (success, error, data, message).
validatorUtils.js: Các hàm hỗ trợ cho validation như isValidEmail, isStrongPassword.
dateUtils.js: Xử lý các operations liên quan đến datetime như format, compare, diff.
fileUtils.js: Xử lý file upload, manipulation, validation.
securityUtils.js: Các hàm liên quan đến bảo mật như hash password, generate token.
formatters.js: Định dạng data như formatCurrency, formatPhoneNumber, formatAddress.

5. validators/
Chứa các schema và rules validation cho dữ liệu đầu vào.

authValidator.js: Validation cho request đăng nhập, đăng ký, đặt lại mật khẩu.
userValidator.js: Validation cho thông tin người dùng, cập nhật profile.
productValidator.js: Validation cho thông tin sản phẩm, thêm/sửa sản phẩm.
categoryValidator.js: Validation cho thông tin danh mục.
orderValidator.js: Validation cho thông tin đơn hàng, cập nhật trạng thái.
cartValidator.js: Validation cho thông tin giỏ hàng, thêm/sửa sản phẩm trong giỏ.
reviewValidator.js: Validation cho đánh giá sản phẩm.
commonValidator.js: Các rules validation dùng chung như validateObjectId, validatePagination.
```
