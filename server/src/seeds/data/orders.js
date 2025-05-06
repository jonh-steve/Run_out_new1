// server/src/seeds/data/orders.js

module.exports = [
  {
    orderNumber: 'RO-2023-0001',
    customerInfo: {
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      phone: '0901234567',
    },
    items: [
      {
        product: 'gay-billiard-pro-series-x1', // slug của sản phẩm
        name: 'Gậy Billiard Pro Series X1',
        price: 1500000,
        quantity: 1,
        totalPrice: 1500000,
        discount: 0,
      },
    ],
    subtotal: 1500000,
    shippingCost: 30000,
    tax: 0,
    discount: {
      amount: 100000,
      code: 'WELCOME10',
    },
    totalAmount: 1430000,
    shippingAddress: {
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      street: '123 Nguyễn Huệ',
      city: 'Hồ Chí Minh',
      state: '',
      zipCode: '70000',
      country: 'Việt Nam',
      notes: 'Giao hàng vào buổi sáng',
    },
    shippingMethod: 'standard',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    status: 'processing',
    statusHistory: [
      {
        status: 'pending',
        date: new Date('2023-03-15T08:30:15.123Z'),
        note: 'Đơn hàng đã được tạo',
      },
      {
        status: 'processing',
        date: new Date('2023-03-15T09:45:30.456Z'),
        note: 'Đơn hàng đang được xử lý',
      },
    ],
    customerNotes: 'Vui lòng gọi trước khi giao hàng',
    createdAt: new Date('2023-03-15T08:30:15.123Z'),
    updatedAt: new Date('2023-03-15T09:45:30.456Z'),
  },
  {
    orderNumber: 'RO-2023-0002',
    customerInfo: {
      name: 'Trần Thị B',
      email: 'tranthib@example.com',
      phone: '0912345678',
    },
    items: [
      {
        product: 'bo-bi-a-pro-tournament', // slug của sản phẩm
        name: 'Bộ Bi-a Pro Tournament',
        price: 850000,
        quantity: 1,
        totalPrice: 850000,
        discount: 0,
      },
      {
        product: 'gay-billiard-pro-series-x1', // slug của sản phẩm
        name: 'Gậy Billiard Pro Series X1',
        price: 1500000,
        quantity: 1,
        totalPrice: 1500000,
        discount: 0,
      },
    ],
    subtotal: 2350000,
    shippingCost: 50000,
    tax: 0,
    totalAmount: 2400000,
    shippingAddress: {
      name: 'Trần Thị B',
      phone: '0912345678',
      street: '101 Lê Duẩn',
      city: 'Đà Nẵng',
      state: '',
      zipCode: '50000',
      country: 'Việt Nam',
    },
    shippingMethod: 'express',
    paymentMethod: 'bank_transfer',
    paymentStatus: 'paid',
    status: 'delivered',
    statusHistory: [
      {
        status: 'pending',
        date: new Date('2023-03-20T10:15:20.123Z'),
        note: 'Đơn hàng đã được tạo',
      },
      {
        status: 'processing',
        date: new Date('2023-03-20T11:30:45.456Z'),
        note: 'Đơn hàng đang được xử lý',
      },
      {
        status: 'shipped',
        date: new Date('2023-03-21T09:15:30.789Z'),
        note: 'Đơn hàng đã được giao cho đơn vị vận chuyển',
      },
      {
        status: 'delivered',
        date: new Date('2023-03-22T14:20:10.321Z'),
        note: 'Đơn hàng đã được giao thành công',
      },
    ],
    createdAt: new Date('2023-03-20T10:15:20.123Z'),
    updatedAt: new Date('2023-03-22T14:20:10.321Z'),
    completedAt: new Date('2023-03-22T14:20:10.321Z'),
  },
];
