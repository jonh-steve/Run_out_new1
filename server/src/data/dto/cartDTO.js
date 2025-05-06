// server/src/data/dto/cartDTO.js
class CartDTO {
  constructor(cart) {
    this.id = cart._id;
    this.items = cart.items.map((item) => ({
      id: item._id,
      product: item.product,
      quantity: item.quantity,
      price: item.price,
      attributes: item.attributes,
      addedAt: item.addedAt,
      updatedAt: item.updatedAt,
      totalPrice: item.price * item.quantity,
    }));

    this.subtotal = cart.subtotal;
    this.coupon = cart.coupon;
    this.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    this.lastActivity = cart.lastActivity;
    this.updatedAt = cart.updatedAt;
  }

  static fromEntity(cart) {
    return new CartDTO(cart);
  }

  static toEntity(dto) {
    const entity = { ...dto };
    delete entity.id;
    delete entity.totalItems;

    if (entity.items) {
      entity.items = entity.items.map((item) => {
        const itemEntity = { ...item };
        delete itemEntity.id;
        delete itemEntity.totalPrice;
        return itemEntity;
      });
    }

    return entity;
  }
}

module.exports = CartDTO;
