// server/src/seeds/data/carts.js

module.exports = [
  {
    user: 'nguyenvana@example.com', // email của user
    items: [
      {
        product: 'gay-billiard-pro-series-x1', // slug của sản phẩm
        quantity: 1,
        price: 1500000,
        addedAt: new Date('2023-05-10T08:30:15.123Z'),
      },
    ],
    subtotal: 1500000,
    status: 'active',
    createdAt: new Date('2023-05-10T08:30:15.123Z'),
    updatedAt: new Date('2023-05-10T08:30:15.123Z'),
    lastActivity: new Date('2023-05-10T08:30:15.123Z'),
  },
  {
    user: 'tranthib@example.com', // email của user
    items: [
      {
        product: 'bo-bi-a-pro-tournament', // slug của sản phẩm
        quantity: 1,
        price: 850000,
        addedAt: new Date('2023-05-12T10:15:30.456Z'),
      },
      {
        product: 'gay-billiard-pro-series-x1', // slug của sản phẩm
        quantity: 1,
        price: 1500000,
        addedAt: new Date('2023-05-12T10:20:45.789Z'),
      },
    ],
    subtotal: 2350000,
    coupon: {
      code: 'SUMMER10',
      discount: 235000,
      appliedAt: new Date('2023-05-12T10:25:10.123Z'),
    },
    status: 'active',
    createdAt: new Date('2023-05-12T10:15:30.456Z'),
    updatedAt: new Date('2023-05-12T10:25:10.123Z'),
    lastActivity: new Date('2023-05-12T10:25:10.123Z'),
  },
  {
    sessionId: 'sess_12345abcde67890fghijk',
    items: [
      {
        product: 'ban-billiard-champion-9ft', // slug của sản phẩm
        quantity: 1,
        price: 45000000,
        addedAt: new Date('2023-05-15T14:45:20.321Z'),
      },
    ],
    subtotal: 45000000,
    status: 'active',
    createdAt: new Date('2023-05-15T14:45:20.321Z'),
    updatedAt: new Date('2023-05-15T14:45:20.321Z'),
    lastActivity: new Date('2023-05-15T14:45:20.321Z'),
    expiresAt: new Date('2023-05-22T14:45:20.321Z'), // 7 ngày sau
  },
];
