/**
 * Các kiểu dữ liệu liên quan đến đơn hàng
 */

// Enum trạng thái đơn hàng
const OrderStatus = {
  PENDING: 'pending', // Chờ xác nhận
  PROCESSING: 'processing', // Đang xử lý
  PACKED: 'packed', // Đã đóng gói
  SHIPPED: 'shipped', // Đang giao hàng
  DELIVERED: 'delivered', // Đã giao hàng
  CANCELLED: 'cancelled', // Đã hủy
  RETURNED: 'returned', // Đã trả hàng
};

// Enum trạng thái thanh toán
const PaymentStatus = {
  PENDING: 'pending', // Chờ thanh toán
  AUTHORIZED: 'authorized', // Đã ủy quyền
  PAID: 'paid', // Đã thanh toán
  FAILED: 'failed', // Thanh toán thất bại
  REFUNDED: 'refunded', // Đã hoàn tiền
  PARTIALLY_REFUNDED: 'partially_refunded', // Hoàn tiền một phần
};

// Enum phương thức thanh toán
const PaymentMethod = {
  COD: 'cod', // Thanh toán khi nhận hàng
  CREDIT_CARD: 'credit_card', // Thẻ tín dụng
  VNPAY: 'vnpay', // VNPay
  BANK_TRANSFER: 'bank_transfer', // Chuyển khoản ngân hàng
  MOMO: 'momo', // Ví MoMo
};

module.exports = {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
};
