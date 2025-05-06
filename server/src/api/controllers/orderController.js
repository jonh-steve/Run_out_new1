/**
 * Order Controller
 * Xử lý các request liên quan đến đơn hàng
 */

const { catchAsync } = require('../../common/utils/catchAsync');
const { responseHandler } = require('../../common/utils/responseHandler');
const orderService = require('../../services/order/orderService');

/**
 * Lấy tất cả đơn hàng (Admin)
 * @route GET /api/orders
 * @access Private (Admin only)
 */
const getAllOrders = catchAsync(async (req, res) => {
  const features = req.query;
  const orders = await orderService.getAllOrders(features);
  return responseHandler.success(res, orders);
});

/**
 * Lấy đơn hàng theo ID
 * @route GET /api/orders/:id
 * @access Private (Admin hoặc người dùng sở hữu đơn hàng)
 */
const getOrderById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';
  
  const order = await orderService.getOrderById(id, userId, isAdmin);
  return responseHandler.success(res, order);
});

/**
 * Lấy đơn hàng của người dùng đăng nhập
 * @route GET /api/orders/myorders
 * @access Private
 */
const getMyOrders = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const features = req.query;
  
  const orders = await orderService.getOrdersByUserId(userId, features);
  return responseHandler.success(res, orders);
});

/**
 * Tạo đơn hàng mới
 * @route POST /api/orders
 * @access Private
 */
const createOrder = catchAsync(async (req, res) => {
  const orderData = req.body;
  const userId = req.user.id;
  
  const newOrder = await orderService.createOrder(orderData, userId);
  return responseHandler.created(res, newOrder);
});

/**
 * Cập nhật trạng thái đơn hàng
 * @route PATCH /api/orders/:id/status
 * @access Private (Admin only)
 */
const updateOrderStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const adminId = req.user.id;
  
  const updatedOrder = await orderService.updateOrderStatus(id, status, note, adminId);
  return responseHandler.success(res, updatedOrder);
});

/**
 * Hủy đơn hàng
 * @route PATCH /api/orders/:id/cancel
 * @access Private (Admin hoặc người dùng sở hữu đơn hàng)
 */
const cancelOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';
  const { reason } = req.body;
  
  const cancelledOrder = await orderService.cancelOrder(id, userId, isAdmin, reason);
  return responseHandler.success(res, cancelledOrder);
});

/**
 * Xử lý webhook thanh toán từ VNPay
 * @route POST /api/orders/payment/vnpay-webhook
 * @access Public
 */
const processVnPayWebhook = catchAsync(async (req, res) => {
  const paymentData = req.body;
  await orderService.processPaymentWebhook(paymentData);
  return responseHandler.success(res, { message: 'Payment processed successfully' });
});

/**
 * Xử lý callback từ VNPay
 * @route GET /api/orders/payment/vnpay-return
 * @access Private
 */
const processVnPayReturn = catchAsync(async (req, res) => {
  const paymentData = req.query;
  const result = await orderService.processPaymentReturn(paymentData);
  return responseHandler.success(res, result);
});

module.exports = {
  getAllOrders,
  getOrderById,
  getMyOrders,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  processVnPayWebhook,
  processVnPayReturn
};