#!/bin/bash

# Script tạo cấu trúc thư mục cho dự án RunOut-Biliard
# Tác giả: Steve
# Ngày: $(date +"%d/%m/%Y")

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Thư mục gốc
ROOT_DIR="server"

# Tạo thư mục gốc nếu chưa tồn tại
mkdir -p ${ROOT_DIR}

echo -e "${GREEN}Bắt đầu tạo cấu trúc thư mục cho dự án RunOut-Biliard...${NC}"

# Tạo các file cấu hình cơ bản
touch ${ROOT_DIR}/.env.example
touch ${ROOT_DIR}/.eslintrc.js
touch ${ROOT_DIR}/.prettierrc
touch ${ROOT_DIR}/README.md
touch ${ROOT_DIR}/jest.config.js
touch ${ROOT_DIR}/jsconfig.json
touch ${ROOT_DIR}/package.json

# Tạo thư mục logs và tests
mkdir -p ${ROOT_DIR}/logs
mkdir -p ${ROOT_DIR}/tests/unit/services
mkdir -p ${ROOT_DIR}/tests/unit/repositories
mkdir -p ${ROOT_DIR}/tests/unit/controllers
mkdir -p ${ROOT_DIR}/tests/integration/api
mkdir -p ${ROOT_DIR}/tests/integration/repositories
touch ${ROOT_DIR}/tests/setup.js

# Tạo cấu trúc thư mục src
mkdir -p ${ROOT_DIR}/src

# 1. API Layer
mkdir -p ${ROOT_DIR}/src/api/controllers
mkdir -p ${ROOT_DIR}/src/api/routes
mkdir -p ${ROOT_DIR}/src/api/middleware

# Tạo controllers
for controller in auth product user category order cart review; do
    touch ${ROOT_DIR}/src/api/controllers/${controller}Controller.js
done

# Tạo routes
for route in auth product user category order cart review; do
    touch ${ROOT_DIR}/src/api/routes/${route}Routes.js
done

# Tạo middleware API cụ thể
touch ${ROOT_DIR}/src/api/middleware/errorMiddleware.js
touch ${ROOT_DIR}/src/api/middleware/loggingMiddleware.js
touch ${ROOT_DIR}/src/api/middleware/validationMiddleware.js
touch ${ROOT_DIR}/src/api/middleware/authMiddleware.js

# 2. Common Layer
mkdir -p ${ROOT_DIR}/src/common/errors
mkdir -p ${ROOT_DIR}/src/common/middleware
mkdir -p ${ROOT_DIR}/src/common/utils
mkdir -p ${ROOT_DIR}/src/common/validators
mkdir -p ${ROOT_DIR}/src/common/types

# Tạo errors
touch ${ROOT_DIR}/src/common/errors/apiError.js

# Tạo middleware chung
touch ${ROOT_DIR}/src/common/middleware/errorHandler.js
touch ${ROOT_DIR}/src/common/middleware/validate.js
touch ${ROOT_DIR}/src/common/middleware/requestLogger.js

# Tạo utils chung
touch ${ROOT_DIR}/src/common/utils/apiFeatures.js
touch ${ROOT_DIR}/src/common/utils/catchAsync.js
touch ${ROOT_DIR}/src/common/utils/responseHandler.js
touch ${ROOT_DIR}/src/common/utils/validatorUtils.js

# Tạo validators
for validator in auth product user category order cart review; do
    touch ${ROOT_DIR}/src/common/validators/${validator}Validator.js
done

# 3. Config Layer
mkdir -p ${ROOT_DIR}/src/config
touch ${ROOT_DIR}/src/config/database.js
touch ${ROOT_DIR}/src/config/environment.js
touch ${ROOT_DIR}/src/config/indexes.js
touch ${ROOT_DIR}/src/config/logger.js
touch ${ROOT_DIR}/src/config/middleware.js
touch ${ROOT_DIR}/src/config/monitoring.js

# 4. Data Layer
mkdir -p ${ROOT_DIR}/src/data/models
mkdir -p ${ROOT_DIR}/src/data/repositories
mkdir -p ${ROOT_DIR}/src/data/dto

# Tạo models
touch ${ROOT_DIR}/src/data/models/user.model.js
touch ${ROOT_DIR}/src/data/models/product.model.js
touch ${ROOT_DIR}/src/data/models/category.model.js
touch ${ROOT_DIR}/src/data/models/order.model.js
touch ${ROOT_DIR}/src/data/models/cart.model.js
touch ${ROOT_DIR}/src/data/models/review.model.js

# Tạo repositories
touch ${ROOT_DIR}/src/data/repositories/userRepository.js
touch ${ROOT_DIR}/src/data/repositories/productRepository.js
touch ${ROOT_DIR}/src/data/repositories/categoryRepository.js
touch ${ROOT_DIR}/src/data/repositories/orderRepository.js
touch ${ROOT_DIR}/src/data/repositories/cartRepository.js
touch ${ROOT_DIR}/src/data/repositories/reviewRepository.js

# Tạo DTOs
touch ${ROOT_DIR}/src/data/dto/userDTO.js
touch ${ROOT_DIR}/src/data/dto/productDTO.js
touch ${ROOT_DIR}/src/data/dto/categoryDTO.js
touch ${ROOT_DIR}/src/data/dto/orderDTO.js
touch ${ROOT_DIR}/src/data/dto/cartDTO.js
touch ${ROOT_DIR}/src/data/dto/reviewDTO.js

# 5. Migrations
mkdir -p ${ROOT_DIR}/src/migrations/scripts
touch ${ROOT_DIR}/src/migrations/config.js
touch ${ROOT_DIR}/src/migrations/index.js
touch ${ROOT_DIR}/src/migrations/migrationRunner.js
touch ${ROOT_DIR}/src/migrations/scripts/001-initial-categories.js
touch ${ROOT_DIR}/src/migrations/scripts/002-add-indexes.js

# 6. Seeds
mkdir -p ${ROOT_DIR}/src/seeds/data
mkdir -p ${ROOT_DIR}/src/seeds/scripts
touch ${ROOT_DIR}/src/seeds/index.js
touch ${ROOT_DIR}/src/seeds/runner.js

# Tạo seed data
touch ${ROOT_DIR}/src/seeds/data/categories.js
touch ${ROOT_DIR}/src/seeds/data/products.js
touch ${ROOT_DIR}/src/seeds/data/users.js
touch ${ROOT_DIR}/src/seeds/data/orders.js
touch ${ROOT_DIR}/src/seeds/data/carts.js
touch ${ROOT_DIR}/src/seeds/data/reviews.js

# Tạo seed scripts
touch ${ROOT_DIR}/src/seeds/scripts/categorySeeder.js
touch ${ROOT_DIR}/src/seeds/scripts/productSeeder.js
touch ${ROOT_DIR}/src/seeds/scripts/userSeeder.js
touch ${ROOT_DIR}/src/seeds/scripts/orderSeeder.js
touch ${ROOT_DIR}/src/seeds/scripts/cartSeeder.js
touch ${ROOT_DIR}/src/seeds/scripts/reviewSeeder.js

# 7. Services
mkdir -p ${ROOT_DIR}/src/services/auth
mkdir -p ${ROOT_DIR}/src/services/base
mkdir -p ${ROOT_DIR}/src/services/cache
mkdir -p ${ROOT_DIR}/src/services/email/templates
mkdir -p ${ROOT_DIR}/src/services/product
mkdir -p ${ROOT_DIR}/src/services/category
mkdir -p ${ROOT_DIR}/src/services/user
mkdir -p ${ROOT_DIR}/src/services/order
mkdir -p ${ROOT_DIR}/src/services/cart
mkdir -p ${ROOT_DIR}/src/services/review

# Tạo services
touch ${ROOT_DIR}/src/services/auth/authService.js
touch ${ROOT_DIR}/src/services/base/baseService.js
touch ${ROOT_DIR}/src/services/cache/redisCache.js
touch ${ROOT_DIR}/src/services/email/emailService.js
touch ${ROOT_DIR}/src/services/email/templates/resetPassword.hbs
touch ${ROOT_DIR}/src/services/email/templates/verification.hbs
touch ${ROOT_DIR}/src/services/product/productService.js
touch ${ROOT_DIR}/src/services/category/categoryService.js
touch ${ROOT_DIR}/src/services/user/userService.js
touch ${ROOT_DIR}/src/services/order/orderService.js
touch ${ROOT_DIR}/src/services/cart/cartService.js
touch ${ROOT_DIR}/src/services/review/reviewService.js

# 8. Utils và Types
mkdir -p ${ROOT_DIR}/src/utils
mkdir -p ${ROOT_DIR}/src/types
touch ${ROOT_DIR}/src/utils/queryAnalyzer.js
touch ${ROOT_DIR}/src/types/express.d.ts

# 9. App và Server
touch ${ROOT_DIR}/src/app.js
touch ${ROOT_DIR}/src/server.js

echo -e "${GREEN}Đã tạo xong cấu trúc thư mục!${NC}"
echo -e "${BLUE}Tổng số file đã tạo: $(find ${ROOT_DIR} -type f | wc -l)${NC}"
echo -e "${BLUE}Tổng số thư mục đã tạo: $(find ${ROOT_DIR} -type d | wc -l)${NC}"
echo -e "${YELLOW}Cấu trúc thư mục đã được tạo tại thư mục: $(pwd)/${ROOT_DIR}${NC}"

# Hiển thị cấu trúc thư mục (nếu có lệnh tree)
if command -v tree &> /dev/null; then
    tree ${ROOT_DIR} -L 3
else
    echo -e "${YELLOW}Để xem cấu trúc thư mục đầy đủ, hãy cài đặt lệnh 'tree' và chạy: tree ${ROOT_DIR}${NC}"
fi

echo -e "${GREEN}Hoàn tất!${NC}"