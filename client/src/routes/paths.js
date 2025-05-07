// Định nghĩa tất cả các đường dẫn trong ứng dụng
const ROUTES = {
  // Public routes
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  CART: '/cart',
  WISHLIST: '/wishlist',
  COMPARE: '/compare',

  // Auth routes
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password/:token',
  VERIFY_EMAIL: '/auth/verify-email/:token',

  // Protected routes
  PROFILE: '/profile',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  CHECKOUT: '/checkout',

  // Admin routes
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_PRODUCT_ADD: '/admin/products/add',
  ADMIN_PRODUCT_EDIT: '/admin/products/:id',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_USERS: '/admin/users',
  ADMIN_REVIEWS: '/admin/reviews',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_REPORTS: '/admin/reports',

  // Legal & Info
  ABOUT: '/about',
  CONTACT: '/contact',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  SHIPPING: '/shipping',
  RETURN: '/return',
  FAQ: '/faq',

  // Error
  NOT_FOUND: '/404',
  ERROR: '/error',
  MAINTENANCE: '/maintenance',
};

export { ROUTES };
