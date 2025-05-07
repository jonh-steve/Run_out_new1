1. Tổng quan cấu trúc
client/
├── public/                # Static files
│   ├── index.html         # HTML template
│   ├── favicon.ico        # Website icon
│   ├── manifest.json      # PWA manifest
│   └── assets/            # Static assets
├── src/                   # Source code
│   ├── index.js           # Entry point
│   ├── App.js             # Main component
│   ├── assets/            # Assets (images, fonts, etc.)
│   ├── components/        # Reusable components
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── routes/            # Route definitions
│   ├── services/          # API services
│   ├── store/             # Redux state management
│   └── utils/             # Utility functions
├── .env                   # Environment variables
├── .eslintrc.js           # ESLint configuration
├── .prettierrc            # Prettier configuration
├── jsconfig.json          # JavaScript configuration
├── package.json           # Dependencies & scripts
├── tailwind.config.js     # Tailwind CSS configuration
└── README.md              # Project documentation
2. Cấu trúc chi tiết từng thành phần
2.1. /src/components/
Components được chia thành 3 loại chính:
components/
├── common/                # Các components dùng chung
│   ├── Button/
│   │   ├── Button.js      # Component chính
│   │   └── Button.test.js # Unit tests
│   ├── Card/
│   ├── Input/
│   ├── Modal/
│   ├── Dropdown/
│   ├── Pagination/
│   ├── Alert/
│   ├── Badge/
│   ├── Breadcrumb/
│   ├── LoadingSpinner/
│   ├── Empty/
│   ├── ErrorMessage/
│   ├── Tag/
│   ├── Tooltip/
│   ├── Tabs/
│   ├── Avatar/
│   ├── Rating/
│   ├── Toast/
│   └── Watermark/
│
├── layout/                # Components liên quan đến layout
│   ├── Header/
│   │   ├── index.js
│   │   ├── Logo.js
│   │   ├── Navigation.js
│   │   └── UserMenu.js
│   ├── Footer/
│   │   ├── index.js
│   │   ├── FooterLinks.js
│   │   └── Copyright.js
│   ├── Sidebar/
│   │   ├── index.js
│   │   └── SidebarItem.js
│   ├── MainLayout/
│   │   └── index.js
│   └── AuthLayout/
│       └── index.js
│
└── feature/               # Components cho các tính năng cụ thể
    ├── Auth/
    │   ├── LoginForm.js
    │   ├── RegisterForm.js
    │   ├── ForgotPasswordForm.js
    │   └── ResetPasswordForm.js
    │
    ├── User/
    │   ├── UserProfile.js
    │   ├── UserAvatar.js
    │   ├── UserSettings.js
    │   └── UserOrders.js
    │
    ├── Product/
    │   ├── ProductCard.js
    │   ├── ProductList.js
    │   ├── ProductDetail.js
    │   ├── ProductImages.js
    │   ├── ProductInfo.js
    │   ├── ProductFilter.js
    │   ├── ProductSort.js
    │   ├── ProductPagination.js
    │   └── RelatedProducts.js
    │
    ├── Category/
    │   ├── CategoryList.js
    │   ├── CategoryItem.js
    │   └── CategoryBreadcrumb.js
    │
    ├── Cart/
    │   ├── CartItem.js
    │   ├── CartList.js
    │   ├── CartSummary.js
    │   ├── AddToCart.js
    │   └── MiniCart.js
    │
    ├── Checkout/
    │   ├── CheckoutForm.js
    │   ├── ShippingForm.js
    │   ├── PaymentForm.js
    │   ├── OrderSummary.js
    │   └── OrderConfirmation.js
    │
    ├── Review/
    │   ├── ReviewForm.js
    │   ├── ReviewList.js
    │   ├── ReviewItem.js
    │   └── ReviewStats.js
    │
    ├── Search/
    │   ├── SearchBar.js
    │   ├── SearchResults.js
    │   ├── SearchFilters.js
    │   └── RecentSearches.js
    │
    └── Admin/
        ├── Dashboard/
        │   ├── DashboardStats.js
        │   ├── RecentOrders.js
        │   └── SalesChart.js
        ├── ProductManager/
        │   ├── ProductTable.js
        │   ├── ProductForm.js
        │   └── ProductBulkActions.js
        ├── OrderManager/
        │   ├── OrderTable.js
        │   ├── OrderDetail.js
        │   └── OrderStatusUpdate.js
        └── UserManager/
            ├── UserTable.js
            └── UserForm.js
2.2. /src/pages/
pages/
├── Home/
│   └── index.js
│
├── Auth/
│   ├── Login/
│   │   └── index.js
│   ├── Register/
│   │   └── index.js
│   ├── ForgotPassword/
│   │   └── index.js
│   └── ResetPassword/
│       └── index.js
│
├── Products/
│   └── index.js
│
├── ProductDetail/
│   └── index.js
│
├── Cart/
│   └── index.js
│
├── Checkout/
│   ├── index.js
│   └── Success.js
│
├── Search/
│   └── index.js
│
├── Profile/
│   ├── index.js
│   ├── Settings.js
│   ├── Orders.js
│   └── Reviews.js
│
├── Admin/
│   ├── Dashboard/
│   │   └── index.js
│   ├── Products/
│   │   ├── index.js
│   │   └── Edit.js
│   ├── Orders/
│   │   ├── index.js
│   │   └── Detail.js
│   └── Users/
│       ├── index.js
│       └── Edit.js
│
└── NotFound/
    └── index.js
2.3. /src/routes/
routes/
├── index.js           # Cấu hình tất cả routes
├── paths.js           # Constants cho path URLs
├── PrivateRoute.js    # Higher-order component bảo vệ routes
└── PublicRoute.js     # Higher-order component cho public routes
2.4. /src/hooks/
hooks/
├── useAuth.js         # Hook xử lý authentication
├── useCart.js         # Hook quản lý giỏ hàng
├── useDebounce.js     # Hook debounce giá trị
├── useForm.js         # Hook quản lý form
├── useLocalStorage.js # Hook tương tác với localStorage
├── useOutsideClick.js # Hook phát hiện click bên ngoài element
├── usePayment.js      # Hook xử lý thanh toán
├── useProduct.js      # Hook lấy thông tin sản phẩm
├── useSearch.js       # Hook xử lý tìm kiếm
└── useWindowSize.js   # Hook lấy kích thước cửa sổ
2.5. /src/services/
services/
├── api.js             # Cấu hình Axios/Fetch
├── authService.js     # API cho authentication
├── cartService.js     # API cho cart operations
├── categoryService.js # API cho category operations
├── orderService.js    # API cho order operations
├── paymentService.js  # API cho payment integration
├── productService.js  # API cho product operations
├── reviewService.js   # API cho review operations
├── searchService.js   # API cho search functionality
└── userService.js     # API cho user operations
2.6. /src/store/
store/
├── index.js           # Cấu hình Redux store
├── hooks.js           # Custom Redux hooks (useAppDispatch, useAppSelector)
│
└── slices/
    ├── authSlice.js   # State management cho authentication
    ├── cartSlice.js   # State management cho shopping cart
    ├── productSlice.js # State management cho products
    ├── categorySlice.js # State management cho categories
    ├── orderSlice.js  # State management cho orders
    ├── reviewSlice.js # State management cho reviews
    ├── searchSlice.js # State management cho search
    ├── uiSlice.js     # State management cho UI (modals, sidebars, etc.)
    └── userSlice.js   # State management cho user profile
2.7. /src/utils/
utils/
├── authToken.js       # Utilities xử lý JWT tokens
├── formatters.js      # Formatting functions (dates, currency, etc.)
├── validators.js      # Validation functions
├── storage.js         # Local/session storage helpers
├── errorHandler.js    # Error handling utilities
├── analytics.js       # Analytics helpers
├── constants.js       # Application constants
└── helpers.js         # Các helper functions khác
2.8. /src/assets/
assets/
├── css/
│   └── index.css      # Global CSS
│
├── images/
│   ├── logo.png
│   ├── banners/
│   ├── icons/
│   └── products/
│
└── fonts/
    └── ...
