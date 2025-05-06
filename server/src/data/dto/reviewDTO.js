// server/src/data/dto/reviewDTO.js
class ReviewDTO {
  constructor(review) {
    this.id = review._id;
    this.product = review.product;
    this.user = review.user;
    this.rating = review.rating;
    this.title = review.title;
    this.review = review.review;
    this.images = review.images;
    this.isVerifiedPurchase = review.isVerifiedPurchase;
    this.helpfulness = {
      upvotes: review.helpfulness.upvotes,
      downvotes: review.helpfulness.downvotes,
    };
    this.responses = review.responses.map((response) => ({
      id: response._id,
      user: response.user,
      isAdmin: response.isAdmin,
      content: response.content,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
    }));
    this.createdAt = review.createdAt;
  }

  static fromEntity(review) {
    return new ReviewDTO(review);
  }

  static fromEntities(reviews) {
    return reviews.map((review) => ReviewDTO.fromEntity(review));
  }

  static toEntity(dto) {
    const entity = { ...dto };
    delete entity.id;

    if (entity.responses) {
      entity.responses = entity.responses.map((response) => {
        const responseEntity = { ...response };
        delete responseEntity.id;
        return responseEntity;
      });
    }

    return entity;
  }
}

module.exports = ReviewDTO;
