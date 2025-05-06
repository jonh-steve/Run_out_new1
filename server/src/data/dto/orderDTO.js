// server/src/data/dto/orderDTO.js
class OrderDTO {
  constructor(order) {
    this.id = order._id;
    this.orderNumber = order.orderNumber;
    this.customerInfo = order.customerInfo;
    this.items = order.items;
    this.subtotal = order.subtotal;
    this.shippingCost = order.shippingCost;
    this.tax = order.tax;
    this.discount = order.discount;
    this.totalAmount = order.totalAmount;
    this.shippingAddress = order.shippingAddress;
    this.shippingMethod = order.shippingMethod;
    this.trackingNumber = order.trackingNumber;
    this.paymentMethod = order.paymentMethod;
    this.paymentStatus = order.paymentStatus;
    this.paymentDetails = order.paymentDetails;
    this.status = order.status;
    this.statusHistory = order.statusHistory;
    this.customerNotes = order.customerNotes;
    this.createdAt = order.createdAt;
    this.updatedAt = order.updatedAt;
    this.completedAt = order.completedAt;
    this.cancelledAt = order.cancelledAt;
  }

  static fromEntity(order) {
    return new OrderDTO(order);
  }

  static fromEntities(orders) {
    return orders.map((order) => OrderDTO.fromEntity(order));
  }

  static toEntity(dto) {
    const entity = { ...dto };
    delete entity.id;
    return entity;
  }
}

module.exports = OrderDTO;
