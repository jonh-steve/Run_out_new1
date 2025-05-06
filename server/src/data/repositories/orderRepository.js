// server/src/data/repositories/orderRepository.js
const Order = require('../models/order.model');
const ApiError = require('../../common/errors/apiError');
const mongoose = require('mongoose');

class OrderRepository {
  async findAll(filter = {}, options = {}) {
    const { sort = { createdAt: -1 }, limit = 50, page = 1, populate = [] } = options;
    const skip = (page - 1) * limit;

    const query = Order.find(filter).sort(sort).skip(skip).limit(limit);

    if (populate.length > 0) {
      populate.forEach((field) => {
        query.populate(field);
      });
    }

    const [orders, totalCount] = await Promise.all([query.exec(), Order.countDocuments(filter)]);

    return {
      data: orders,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    };
  }

  async findById(id, options = {}) {
    const { populate = [] } = options;

    const query = Order.findById(id);

    if (populate.length > 0) {
      populate.forEach((field) => {
        query.populate(field);
      });
    }

    const order = await query.exec();

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    return order;
  }

  async findByOrderNumber(orderNumber, options = {}) {
    const { populate = [] } = options;

    const query = Order.findOne({ orderNumber });

    if (populate.length > 0) {
      populate.forEach((field) => {
        query.populate(field);
      });
    }

    const order = await query.exec();

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    return order;
  }

  async create(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Tạo order
      const order = new Order(data);
      await order.save({ session });

      await session.commitTransaction();
      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async updateStatus(id, status, note, updatedBy) {
    const order = await Order.findById(id);

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Kiểm tra trạng thái hợp lệ
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
      throw new ApiError(400, `Invalid status transition from ${order.status} to ${status}`);
    }

    // Cập nhật trạng thái
    order.status = status;

    // Thêm vào lịch sử trạng thái
    order.statusHistory.push({
      status,
      date: new Date(),
      note,
      updatedBy,
    });

    // Cập nhật các trường liên quan đến completion/cancellation
    if (status === 'delivered') {
      order.completedAt = new Date();
    } else if (status === 'cancelled') {
      order.cancelledAt = new Date();
    }

    // Cập nhật trạng thái thanh toán nếu COD
    if (status === 'delivered' && order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid';
      order.paymentDetails.paymentDate = new Date();
    }

    return await order.save();
  }

  async updatePaymentStatus(id, paymentStatus, paymentDetails = {}) {
    const order = await Order.findById(id);

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    order.paymentStatus = paymentStatus;

    if (Object.keys(paymentDetails).length > 0) {
      order.paymentDetails = {
        ...order.paymentDetails,
        ...paymentDetails,
      };
    }

    return await order.save();
  }

  async getUserOrders(userId, options = {}) {
    const filter = { user: userId };
    return await this.findAll(filter, options);
  }

  async getOrdersByStatus(status, options = {}) {
    const filter = { status };
    return await this.findAll(filter, options);
  }

  async getOrdersByPaymentStatus(paymentStatus, options = {}) {
    const filter = { paymentStatus };
    return await this.findAll(filter, options);
  }

  async getSalesReport(startDate, endDate) {
    const query = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
      status: { $in: ['delivered', 'completed'] },
      paymentStatus: 'paid',
    };

    return await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          totalSales: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1,
        },
      },
    ]);
  }

  async generateOrderNumber() {
    const year = new Date().getFullYear();

    // Tìm đơn hàng cuối cùng trong năm hiện tại
    const lastOrder = await Order.findOne(
      { orderNumber: new RegExp(`^RO-${year}-`) },
      { orderNumber: 1 },
      { sort: { orderNumber: -1 } }
    );

    let nextNumber = 1;

    if (lastOrder) {
      // Extract số từ orderNumber cuối (RO-2025-0001 -> 1)
      const lastNumber = parseInt(lastOrder.orderNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    // Format với số 0 đứng trước (1 -> 0001)
    return `RO-${year}-${nextNumber.toString().padStart(4, '0')}`;
  }
}

module.exports = new OrderRepository();
