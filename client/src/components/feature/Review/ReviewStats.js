// src/components/feature/Review/ReviewStats.js
import React from 'react';

const ReviewStats = ({ stats }) => {
  const { average, count, distribution } = stats;

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <span key={index} className="text-yellow-400 text-lg">
        {index < Math.floor(rating) ? '★' : '☆'}
      </span>
    ));
  };

  const renderDistribution = () => {
    return [5, 4, 3, 2, 1].map((rating) => {
      const count = distribution[rating] || 0;
      const percentage = count > 0 ? (count / stats.count) * 100 : 0;

      return (
        <div key={rating} className="flex items-center mb-1">
          <div className="w-12 text-sm">{rating} sao</div>
          <div className="w-full mx-4 bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-yellow-400 h-2.5 rounded-full"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="w-12 text-sm text-right">{count}</div>
        </div>
      );
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg border mb-6">
      <div className="flex flex-col md:flex-row md:items-center mb-4">
        <div className="flex flex-col items-center mr-6 mb-4 md:mb-0">
          <div className="text-4xl font-bold text-center">
            {average ? average.toFixed(1) : '0.0'}
          </div>
          <div className="mb-1">{renderStars(average || 0)}</div>
          <div className="text-sm text-gray-500">({count} đánh giá)</div>
        </div>

        <div className="flex-1">{renderDistribution()}</div>
      </div>
    </div>
  );
};

export default ReviewStats;
