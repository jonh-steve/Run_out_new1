// src/components/feature/Review/ReviewForm.js
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '../../common/Button';
import { Input } from '../../common/Input';

const schema = yup.object({
  rating: yup.number().required('Vui lòng chọn số sao').min(1, 'Vui lòng chọn số sao'),
  title: yup.string().required('Vui lòng nhập tiêu đề'),
  content: yup.string().required('Vui lòng nhập nội dung đánh giá'),
});

const ReviewForm = ({ productId, onSubmit, isSubmitting }) => {
  const [selectedRating, setSelectedRating] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      rating: 0,
      title: '',
      content: '',
    },
  });

  const handleRatingClick = (rating) => {
    setSelectedRating(rating);
  };

  const submitHandler = (data) => {
    onSubmit({ ...data, productId });
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Viết đánh giá</h3>

      <div className="mb-4">
        <label className="block mb-2">Đánh giá của bạn</label>
        <div className="flex items-center mb-1">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => handleRatingClick(rating)}
              className="text-2xl text-yellow-400 focus:outline-none"
            >
              {rating <= selectedRating ? '★' : '☆'}
            </button>
          ))}
          <input type="hidden" value={selectedRating} {...register('rating')} />
        </div>
        {errors.rating && <p className="text-red-500 text-sm">{errors.rating.message}</p>}
      </div>

      <div className="mb-4">
        <Input label="Tiêu đề" {...register('title')} error={errors.title?.message} />
      </div>

      <div className="mb-6">
        <Input
          label="Nội dung đánh giá"
          {...register('content')}
          error={errors.content?.message}
          multiline
          rows={4}
        />
      </div>

      <Button type="submit" isLoading={isSubmitting}>
        Gửi đánh giá
      </Button>
    </form>
  );
};

export default ReviewForm;
