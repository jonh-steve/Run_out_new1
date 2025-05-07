// src/components/feature/Review/ReviewItem.js
import React from 'react';
import { formatDate } from '../../../utils/formatters';

const ReviewItem = ({ review }) => {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <span key={index} className="text-yellow-400">
        {index < rating ? '★' : '☆'}
      </span>
    ));
  };

  return (
    <div className="border-b pb-4 mb-4 last:border-b-0 last:mb-0 last:pb-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="font-semibold mr-3">{review.user.name}</div>
          <div className="text-yellow-400">{renderStars(review.rating)}</div>
        </div>
        <div className="text-gray-500 text-sm">{formatDate(review.createdAt)}</div>
      </div>

      <h4 className="font-medium mb-1">{review.title}</h4>
      <p className="text-gray-700">{review.content}</p>

      {review.response && (
        <div className="mt-3 pl-4 border-l-2 border-gray-300">
          <p className="text-sm font-semibold">Phản hồi từ cửa hàng:</p>
          <p className="text-sm text-gray-700">{review.response.content}</p>
        </div>
      )}
    </div>
  );
};

export default ReviewItem;
