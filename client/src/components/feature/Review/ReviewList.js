// src/components/feature/Review/ReviewList.js
import React from 'react';
import ReviewItem from './ReviewItem';
import { Empty } from '../../common/Empty';

const ReviewList = ({ reviews, loading, error }) => {
  if (loading) {
    return <div className="text-center p-4">Đang tải đánh giá...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  if (!reviews || reviews.length === 0) {
    return <Empty message="Chưa có đánh giá nào" />;
  }

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Đánh giá ({reviews.length})</h3>

      <div>
        {reviews.map((review) => (
          <ReviewItem key={review._id} review={review} />
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
