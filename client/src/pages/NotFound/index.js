import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/paths';
import Button from '../../components/common/Button/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
      <h2 className="text-3xl font-semibold mb-6">Trang Không Tìm Thấy</h2>
      <p className="text-lg text-gray-600 max-w-md mb-8">
        Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to={ROUTES.HOME}>
          <Button variant="primary" size="lg">
            Quay Lại Trang Chủ
          </Button>
        </Link>
        <Link to={ROUTES.PRODUCTS}>
          <Button variant="outline" size="lg">
            Xem Sản Phẩm
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
