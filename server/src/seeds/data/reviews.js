// server/src/seeds/data/reviews.js

module.exports = [
  {
    product: 'gay-billiard-pro-series-x1', // slug của sản phẩm
    user: 'nguyenvana@example.com', // email của user
    rating: 5,
    title: 'Sản phẩm tuyệt vời, đáng đồng tiền',
    review:
      'Gậy billiard Pro Series X1 có chất lượng rất tốt, cân bằng hoàn hảo và cho cảm giác rất thoải mái khi chơi. Tôi đặc biệt thích chất liệu gỗ sồi cao cấp và đầu tip cứng. Sau khi sử dụng, tôi cảm thấy kỹ năng chơi của mình cũng được cải thiện đáng kể. Rất hài lòng với sản phẩm này!',
    images: [
      {
        url: '/assets/reviews/review-1-1.jpg',
        thumbnail: '/assets/reviews/thumbnails/review-1-1.jpg',
        caption: 'Gậy billiard sau 2 tuần sử dụng',
      },
    ],
    isVerifiedPurchase: true,
    helpfulness: {
      upvotes: 12,
      downvotes: 1,
    },
    isVisible: true,
    createdAt: new Date('2023-03-25T10:15:20.123Z'),
    updatedAt: new Date('2023-03-25T10:15:20.123Z'),
  },
  {
    product: 'bo-bi-a-pro-tournament', // slug của sản phẩm
    user: 'tranthib@example.com', // email của user
    rating: 4,
    title: 'Bộ bi-a chất lượng tốt',
    review:
      'Bộ bi-a Pro Tournament có chất lượng rất tốt, đúng như mô tả. Các viên bi có trọng lượng cân đối, màu sắc tươi sáng. Tuy nhiên, hộp đựng không được chắc chắn lắm nên chỉ đánh giá 4 sao.',
    isVerifiedPurchase: true,
    helpfulness: {
      upvotes: 8,
      downvotes: 0,
    },
    isVisible: true,
    createdAt: new Date('2023-03-28T15:45:30.456Z'),
    updatedAt: new Date('2023-03-28T15:45:30.456Z'),
  },
  {
    product: 'ban-billiard-champion-9ft', // slug của sản phẩm
    user: 'levanc@example.com', // email của user
    rating: 5,
    title: 'Bàn billiard đẳng cấp chuyên nghiệp',
    review:
      'Bàn billiard Champion 9ft thực sự xứng đáng với giá tiền. Mặt bàn cực kỳ phẳng, viên bi lăn rất mượt mà và chính xác. Khung bàn vững chắc, thiết kế sang trọng và đẳng cấp. Tôi đã mua cho câu lạc bộ của mình và tất cả các thành viên đều rất hài lòng với sản phẩm này.',
    images: [
      {
        url: '/assets/reviews/review-3-1.jpg',
        thumbnail: '/assets/reviews/thumbnails/review-3-1.jpg',
        caption: 'Bàn billiard trong câu lạc bộ của tôi',
      },
      {
        url: '/assets/reviews/review-3-2.jpg',
        thumbnail: '/assets/reviews/thumbnails/review-3-2.jpg',
        caption: 'Chi tiết góc bàn',
      },
    ],
    isVerifiedPurchase: true,
    helpfulness: {
      upvotes: 20,
      downvotes: 0,
    },
    isVisible: true,
    createdAt: new Date('2023-04-05T09:30:15.789Z'),
    updatedAt: new Date('2023-04-05T09:30:15.789Z'),
  },
];
