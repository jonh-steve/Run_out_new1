/**
 * Order Service
 * Xử lý logic nghiệp vụ cho đơn hàng
 */

const { ApiError } = require('../../common/errors/apiError');
const orderRepository = require('../../data/repositories/orderRepository');
const cartRepository = require('../../data/repositories/cartRepository');
const productRepository = require('../../data/repositories/productRepository');
const emailService = require('../email/emailService');
const { generateOrderNumber } = require('../../utils/orderUtils');
const VNPayService = require('./vnpayService');

/**
 * Lấy tất cả đơn hàng (admin)
 * @param {Object} features - Các tham số truy vấn (filter, sort, pagination)
 * @returns {Promise<Object>} Danh sách đơn hàng và thông tin phân trang
 */
const getAllOrders = async (features = {}) => {
  return await orderRepository.findAll(features);
};

/**
 * Lấy đơn hàng theo ID
 * @param {string} id - ID của đơn hàng
 * @param {string} userId - ID của người dùng đang yêu cầu
 * @param {boolean} isAdmin - Người dùng có phải admin không
 * @returns {Promise<Object>} Thông tin đơn hàng
 * @throws {ApiError} Nếu không tìm thấy đơn hàng hoặc không có quyền truy cập
 */
const getOrderById = async (id, userId, isAdmin) => {
  const order = await orderRepository.findById(id);

  if (!order) {
    throw new ApiError(404, 'Không tìm thấy đơn hàng');
  }

  // Kiểm tra quyền truy cập
  if (!isAdmin && order.user.toString() !== userId) {
    throw new ApiError(403, 'Bạn không có quyền truy cập đơn hàng này');
  }

  return order;
};

/**
 * Lấy tất cả đơn hàng của một người dùng
 * @param {string} userId - ID của người dùng
 * @param {Object} features - Các tham số truy vấn (filter, sort, pagination)
 * @returns {Promise<Object>} Danh sách đơn hàng và thông tin phân trang
 */
const getOrdersByUserId = async (userId, features = {}) => {
  // Thêm filter cho user
  const userFilter = { ...features };
  userFilter.filter = { ...userFilter.filter, user: userId };

  return await orderRepository.findAll(userFilter);
};

/**
 * Tạo đơn hàng mới
 * @param {Object} orderData - Dữ liệu đơn hàng
 * @param {string} userId - ID của người dùng đặt hàng
 * @returns {Promise<Object>} Đơn hàng đã tạo
 * @throws {ApiError} Nếu có lỗi khi tạo đơn hàng
 */
const createOrder = async (orderData, userId) => {
  // Khởi tạo đơn hàng
  const orderInfo = {
    orderNumber: await generateOrderNumber(),
    user: userId,
    customerInfo: orderData.customerInfo,
    shippingAddress: orderData.shippingAddress,
    shippingMethod: orderData.shippingMethod,
    paymentMethod: orderData.paymentMethod,
    customerNotes: orderData.customerNotes,
    status: 'pending',
    statusHistory: [
      {
        status: 'pending',
        date: new Date(),
        note: 'Đơn hàng đã được tạo',
      },
    ],
  };

  let items = [];
  let subtotal = 0;

  // Trường hợp 1: Tạo đơn hàng từ giỏ hàng
  if (orderData.cartId) {
    const cart = await cartRepository.findById(orderData.cartId);

    if (!cart) {
      throw new ApiError(404, 'Không tìm thấy giỏ hàng');
    }

    // Kiểm tra quyền truy cập giỏ hàng
    if (cart.user.toString() !== userId) {
      throw new ApiError(403, 'Bạn không có quyền truy cập giỏ hàng này');
    }

    // Chuyển từ cart items sang order items
    items = await Promise.all(
      cart.items.map(async (item) => {
        const product = await productRepository.findById(item.product);

        if (!product) {
          throw new ApiError(404, `Không tìm thấy sản phẩm ${item.product}`);
        }

        // Kiểm tra tồn kho
        if (product.stock < item.quantity) {
          throw new ApiError(
            400,
            `Sản phẩm ${product.name} chỉ còn ${product.stock} sản phẩm trong kho`
          );
        }

        return {
          product: item.product,
          name: product.name,
          price: item.price,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
          attributes: item.attributes,
          sku: product.sku,
          image: product.images.length > 0 ? product.images[0].url : '',
        };
      })
    );

    // Tính tổng tiền
    subtotal = cart.subtotal;

    // Lấy thông tin khuyến mãi từ giỏ hàng
    if (cart.coupon) {
      orderInfo.discount = {
        amount: cart.coupon.discount,
        code: cart.coupon.code,
      };
    }

    // Đánh dấu giỏ hàng đã chuyển thành đơn hàng
    await cartRepository.update(cart._id, { status: 'converted' });
  }
  // Trường hợp 2: Tạo đơn hàng từ danh sách sản phẩm trực tiếp
  else if (orderData.items && orderData.items.length > 0) {
    items = await Promise.all(
      orderData.items.map(async (item) => {
        const product = await productRepository.findById(item.product);

        if (!product) {
          throw new ApiError(404, `Không tìm thấy sản phẩm ${item.product}`);
        }

        // Kiểm tra tồn kho
        if (product.stock < item.quantity) {
          throw new ApiError(
            400,
            `Sản phẩm ${product.name} chỉ còn ${product.stock} sản phẩm trong kho`
          );
        }

        const itemPrice = product.salePrice || product.price;
        const totalPrice = itemPrice * item.quantity;
        subtotal += totalPrice;

        return {
          product: item.product,
          name: product.name,
          price: itemPrice,
          quantity: item.quantity,
          totalPrice,
          attributes: item.attributes || {},
          sku: product.sku,
          image: product.images.length > 0 ? product.images[0].url : '',
        };
      })
    );

    // Áp dụng mã giảm giá nếu có
    if (orderData.couponCode) {
      // TODO: Triển khai logic áp dụng mã giảm giá
    }
  } else {
    throw new ApiError(400, 'Đơn hàng phải có ít nhất một sản phẩm');
  }

  // Tính giá vận chuyển
  const shippingCost = calculateShippingCost(
    orderData.shippingMethod,
    orderData.shippingAddress.country
  );

  // Tính thuế (nếu có)
  const tax = 0; // TODO: Triển khai tính thuế

  // Tính tổng tiền cuối cùng
  const discount = orderInfo.discount ? orderInfo.discount.amount : 0;
  const totalAmount = subtotal + shippingCost + tax - discount;

  // Hoàn thiện thông tin đơn hàng
  orderInfo.items = items;
  orderInfo.subtotal = subtotal;
  orderInfo.shippingCost = shippingCost;
  orderInfo.tax = tax;
  orderInfo.totalAmount = totalAmount;
  orderInfo.paymentStatus = orderData.paymentMethod === 'cod' ? 'pending' : 'pending';

  // Lưu đơn hàng vào database
  let newOrder;
  try {
    newOrder = await orderRepository.create(orderInfo);
  } catch (error) {
    throw new ApiError(500, 'Lỗi khi tạo đơn hàng: ' + error.message);
  }

  // Cập nhật tồn kho
  try {
    await updateInventory(items);
  } catch (error) {
    // Nếu cập nhật tồn kho thất bại, xóa đơn hàng đã tạo
    try {
      await orderRepository.delete(newOrder._id);
    } catch (deleteError) {
      console.error('Không thể xóa đơn hàng sau khi cập nhật tồn kho thất bại:', deleteError);
    }
    throw new ApiError(500, 'Lỗi khi cập nhật tồn kho: ' + error.message);
  }

  // Tạo URL thanh toán nếu phương thức là vnpay
  if (orderData.paymentMethod === 'vnpay') {
    try {
      const paymentUrl = await VNPayService.createPaymentUrl({
        orderId: newOrder._id,
        amount: totalAmount,
        orderInfo: `Thanh toán đơn hàng ${newOrder.orderNumber}`,
      });

      // Trả về URL thanh toán cùng với đơn hàng
      return { order: newOrder, paymentUrl };
    } catch (error) {
      // Nếu tạo URL thanh toán thất bại, không cần xóa đơn hàng
      // Chỉ ghi log và trả về đơn hàng mà không có URL thanh toán
      console.error('Lỗi khi tạo URL thanh toán VNPay:', error);
      return newOrder;
    }
  }

  // Gửi email xác nhận đơn hàng
  try {
    await sendOrderConfirmationEmail(newOrder);
  } catch (error) {
    // Nếu gửi email thất bại, chỉ ghi log lỗi nhưng không ảnh hưởng đến việc tạo đơn hàng
    console.error('Lỗi khi gửi email xác nhận đơn hàng:', error);
  }

  return newOrder;
};

/**
 * Cập nhật trạng thái đơn hàng
 * @param {string} id - ID của đơn hàng
 * @param {string} status - Trạng thái mới
 * @param {string} note - Ghi chú khi cập nhật trạng thái
 * @param {string} adminId - ID của admin thực hiện cập nhật
 * @returns {Promise<Object>} Đơn hàng đã cập nhật
 * @throws {ApiError} Nếu không tìm thấy đơn hàng hoặc trạng thái không hợp lệ
 */
const updateOrderStatus = async (id, status, note, adminId) => {
  const order = await orderRepository.findById(id);

  if (!order) {
    throw new ApiError(404, 'Không tìm thấy đơn hàng');
  }

  // Kiểm tra trạng thái hiện tại và trạng thái mới
  const validStatusTransitions = {
    pending: ['processing', 'cancelled'],
    processing: ['packed', 'cancelled'],
    packed: ['shipped', 'cancelled'],
    shipped: ['delivered', 'returned'],
    delivered: ['returned'],
    cancelled: [],
    returned: [],
  };

  if (!validStatusTransitions[order.status].includes(status)) {
    throw new ApiError(400, `Không thể chuyển từ trạng thái ${order.status} sang ${status}`);
  }

  // Cập nhật trạng thái đơn hàng
  const statusHistory = {
    status,
    date: new Date(),
    note: note || `Đơn hàng đã được chuyển sang trạng thái ${status}`,
    updatedBy: adminId,
  };

  const updateData = {
    status,
    statusHistory: [...order.statusHistory, statusHistory],
  };

  // Cập nhật các trường khác tùy theo trạng thái
  if (status === 'delivered') {
    updateData.completedAt = new Date();

    // Nếu thanh toán là COD, cập nhật trạng thái thanh toán
    if (order.paymentMethod === 'cod') {
      updateData.paymentStatus = 'paid';
      updateData.paymentDetails = {
        ...order.paymentDetails,
        paymentDate: new Date(),
      };
    }
  } else if (status === 'cancelled') {
    updateData.cancelledAt = new Date();

    // Hoàn trả sản phẩm vào kho
    await restoreInventory(order.items);
  } else if (status === 'returned') {
    // Hoàn trả sản phẩm vào kho
    await restoreInventory(order.items);
  }

  // Cập nhật đơn hàng
  let updatedOrder;
  try {
    updatedOrder = await orderRepository.update(id, updateData);
  } catch (error) {
    throw new ApiError(500, 'Lỗi khi cập nhật đơn hàng: ' + error.message);
  }

  // Gửi email thông báo thay đổi trạng thái
  try {
    await sendOrderStatusUpdateEmail(updatedOrder);
  } catch (error) {
    // Nếu gửi email thất bại, chỉ ghi log lỗi
    console.error('Lỗi khi gửi email thông báo thay đổi trạng thái:', error);
  }

  return updatedOrder;
};

/**
 * Hủy đơn hàng
 * @param {string} id - ID của đơn hàng
 * @param {string} userId - ID của người dùng yêu cầu hủy
 * @param {boolean} isAdmin - Người dùng có phải admin không
 * @param {string} reason - Lý do hủy đơn hàng
 * @returns {Promise<Object>} Đơn hàng đã hủy
 * @throws {ApiError} Nếu không tìm thấy đơn hàng hoặc không thể hủy
 */
const cancelOrder = async (id, userId, isAdmin, reason) => {
  const order = await orderRepository.findById(id);

  if (!order) {
    throw new ApiError(404, 'Không tìm thấy đơn hàng');
  }

  // Kiểm tra quyền truy cập
  if (!isAdmin && order.user.toString() !== userId) {
    throw new ApiError(403, 'Bạn không có quyền hủy đơn hàng này');
  }

  // Kiểm tra trạng thái hiện tại
  if (!['pending', 'processing'].includes(order.status)) {
    throw new ApiError(400, 'Chỉ có thể hủy đơn hàng ở trạng thái đang xử lý hoặc chờ xử lý');
  }

  // Nếu đơn hàng đã thanh toán, kiểm tra xem có thể hoàn tiền không
  if (order.paymentStatus === 'paid') {
    // TODO: Xử lý hoàn tiền
  }

  // Cập nhật trạng thái đơn hàng
  const statusHistory = {
    status: 'cancelled',
    date: new Date(),
    note: reason || 'Đơn hàng đã bị hủy bởi người dùng',
    updatedBy: isAdmin ? userId : null,
  };

  let updatedOrder;
  try {
    updatedOrder = await orderRepository.update(id, {
      status: 'cancelled',
      statusHistory: [...order.statusHistory, statusHistory],
      cancelledAt: new Date(),
    });
  } catch (error) {
    throw new ApiError(500, 'Lỗi khi cập nhật trạng thái đơn hàng: ' + error.message);
  }

  // Hoàn trả sản phẩm vào kho
  try {
    await restoreInventory(order.items);
  } catch (error) {
    // Nếu hoàn trả sản phẩm thất bại, ghi log lỗi nhưng vẫn giữ trạng thái đơn hàng đã hủy
    console.error('Lỗi khi hoàn trả sản phẩm vào kho:', error);
  }

  // Gửi email thông báo hủy đơn hàng
  try {
    await sendOrderCancelledEmail(updatedOrder, reason);
  } catch (error) {
    // Nếu gửi email thất bại, chỉ ghi log lỗi
    console.error('Lỗi khi gửi email thông báo hủy đơn hàng:', error);
  }

  return updatedOrder;
};

/**
 * Xử lý webhook từ cổng thanh toán VNPay
 * @param {Object} paymentData - Dữ liệu từ VNPay
 * @returns {Promise<void>}
 */
const processPaymentWebhook = async (paymentData) => {
  // Xác thực dữ liệu từ VNPay
  const isValid = VNPayService.verifyReturnUrl(paymentData);

  if (!isValid) {
    throw new ApiError(400, 'Dữ liệu thanh toán không hợp lệ');
  }

  // Lấy thông tin đơn hàng từ vnp_OrderInfo hoặc vnp_TxnRef
  const orderId = paymentData.vnp_OrderInfo;
  const order = await orderRepository.findById(orderId);

  if (!order) {
    throw new ApiError(404, 'Không tìm thấy đơn hàng');
  }

  // Cập nhật trạng thái thanh toán dựa vào response code
  if (paymentData.vnp_ResponseCode === '00') {
    // Thanh toán thành công
    try {
      await orderRepository.update(orderId, {
        paymentStatus: 'paid',
        paymentDetails: {
          provider: 'vnpay',
          transactionId: paymentData.vnp_TransactionNo,
          paymentDate: new Date(),
        },
      });
    } catch (error) {
      throw new ApiError(500, 'Lỗi khi cập nhật trạng thái thanh toán: ' + error.message);
    }

    // Gửi email xác nhận thanh toán
    try {
      const updatedOrder = await orderRepository.findById(orderId);
      await sendPaymentConfirmationEmail(updatedOrder);
    } catch (error) {
      // Nếu gửi email thất bại, chỉ ghi log lỗi
      console.error('Lỗi khi gửi email xác nhận thanh toán:', error);
    }
  } else {
    // Thanh toán thất bại
    try {
      await orderRepository.update(orderId, {
        paymentStatus: 'failed',
        paymentDetails: {
          provider: 'vnpay',
          transactionId: paymentData.vnp_TransactionNo,
          errorCode: paymentData.vnp_ResponseCode,
        },
      });
    } catch (error) {
      throw new ApiError(500, 'Lỗi khi cập nhật trạng thái thanh toán: ' + error.message);
    }
  }
};

/**
 * Xử lý redirect URL từ cổng thanh toán VNPay
 * @param {Object} paymentData - Dữ liệu từ VNPay
 * @returns {Promise<Object>} Kết quả thanh toán
 */
const processPaymentReturn = async (paymentData) => {
  // Xác thực dữ liệu từ VNPay
  const isValid = VNPayService.verifyReturnUrl(paymentData);

  if (!isValid) {
    throw new ApiError(400, 'Dữ liệu thanh toán không hợp lệ');
  }

  // Lấy thông tin đơn hàng từ vnp_OrderInfo hoặc vnp_TxnRef
  const orderId = paymentData.vnp_OrderInfo;
  const order = await orderRepository.findById(orderId);

  if (!order) {
    throw new ApiError(404, 'Không tìm thấy đơn hàng');
  }

  // Cập nhật trạng thái thanh toán dựa vào response code
  let result = {};

  if (paymentData.vnp_ResponseCode === '00') {
    // Thanh toán thành công
    try {
      const updatedOrder = await orderRepository.update(orderId, {
        paymentStatus: 'paid',
        paymentDetails: {
          provider: 'vnpay',
          transactionId: paymentData.vnp_TransactionNo,
          paymentDate: new Date(),
        },
      });

      // Gửi email xác nhận thanh toán
      try {
        await sendPaymentConfirmationEmail(updatedOrder);
      } catch (emailError) {
        console.error('Lỗi khi gửi email xác nhận thanh toán:', emailError);
      }

      result = {
        success: true,
        message: 'Thanh toán thành công',
        order: updatedOrder,
      };
    } catch (error) {
      throw new ApiError(500, 'Lỗi khi cập nhật trạng thái thanh toán: ' + error.message);
    }
  } else {
    // Thanh toán thất bại
    try {
      const updatedOrder = await orderRepository.update(orderId, {
        paymentStatus: 'failed',
        paymentDetails: {
          provider: 'vnpay',
          transactionId: paymentData.vnp_TransactionNo,
          errorCode: paymentData.vnp_ResponseCode,
        },
      });

      result = {
        success: false,
        message: 'Thanh toán thất bại',
        errorCode: paymentData.vnp_ResponseCode,
        order: updatedOrder,
      };
    } catch (error) {
      throw new ApiError(500, 'Lỗi khi cập nhật trạng thái thanh toán: ' + error.message);
    }
  }

  return result;
};

/**
 * Tính phí vận chuyển dựa trên phương thức và địa chỉ
 * @param {string} method - Phương thức vận chuyển
 * @param {string} country - Quốc gia giao hàng
 * @returns {number} Phí vận chuyển
 */
const calculateShippingCost = (method, country) => {
  // TODO: Triển khai tính phí vận chuyển thực tế
  const baseCost = method === 'express' ? 50000 : 30000;

  // Tính phí vận chuyển dựa trên quốc gia
  if (country !== 'Việt Nam') {
    return baseCost * 3;
  }

  return baseCost;
};

/**
 * Cập nhật tồn kho sau khi tạo đơn hàng
 * @param {Array} items - Danh sách sản phẩm trong đơn hàng
 * @returns {Promise<void>}
 */
const updateInventory = async (items) => {
  for (const item of items) {
    await productRepository.updateStock(item.product, -item.quantity);
  }
};

/**
 * Hoàn trả sản phẩm vào kho khi hủy đơn hàng
 * @param {Array} items - Danh sách sản phẩm trong đơn hàng
 * @returns {Promise<void>}
 */
const restoreInventory = async (items) => {
  for (const item of items) {
    await productRepository.updateStock(item.product, item.quantity);
  }
};

/**
 * Gửi email xác nhận đơn hàng
 * @param {Object} order - Thông tin đơn hàng
 * @returns {Promise<void>}
 */
const sendOrderConfirmationEmail = async (order) => {
  await emailService.sendOrderConfirmation(order.customerInfo.email, {
    orderNumber: order.orderNumber,
    customerName: order.customerInfo.name,
    orderDate: order.createdAt,
    orderItems: order.items,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    discount: order.discount ? order.discount.amount : 0,
    tax: order.tax,
    totalAmount: order.totalAmount,
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod,
  });
};

/**
 * Gửi email thông báo thay đổi trạng thái đơn hàng
 * @param {Object} order - Thông tin đơn hàng
 * @returns {Promise<void>}
 */
const sendOrderStatusUpdateEmail = async (order) => {
  await emailService.sendOrderStatusUpdate(order.customerInfo.email, {
    orderNumber: order.orderNumber,
    customerName: order.customerInfo.name,
    orderStatus: order.status,
    statusNote: order.statusHistory[order.statusHistory.length - 1].note,
    orderItems: order.items,
    totalAmount: order.totalAmount,
  });
};

/**
 * Gửi email thông báo hủy đơn hàng
 * @param {Object} order - Thông tin đơn hàng
 * @param {string} reason - Lý do hủy đơn hàng
 * @returns {Promise<void>}
 */
const sendOrderCancelledEmail = async (order, reason) => {
  await emailService.sendOrderCancelled(order.customerInfo.email, {
    orderNumber: order.orderNumber,
    customerName: order.customerInfo.name,
    cancelReason: reason,
    orderItems: order.items,
    totalAmount: order.totalAmount,
  });
};

/**
 * Gửi email xác nhận thanh toán
 * @param {Object} order - Thông tin đơn hàng
 * @returns {Promise<void>}
 */
const sendPaymentConfirmationEmail = async (order) => {
  await emailService.sendPaymentConfirmation(order.customerInfo.email, {
    orderNumber: order.orderNumber,
    customerName: order.customerInfo.name,
    paymentMethod: order.paymentMethod,
    paymentDate: order.paymentDetails.paymentDate,
    totalAmount: order.totalAmount,
    transactionId: order.paymentDetails.transactionId,
  });
};

module.exports = {
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  processPaymentWebhook,
  processPaymentReturn,
};
