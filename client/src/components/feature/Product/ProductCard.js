// src/components/feature/Product/ProductCard.js
// Component hiển thị thông tin sản phẩm trong trang danh sách sản phẩm

import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../common/Button';
import Card from '../../common/Card';
import { formatPrice } from '../../../utils/formatters';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../../store/slices/cartSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        productId: product.id,
        quantity: 1,
      })
    );
  };

  return (
    <Card className="product-card">
      <Link to={`/products/${product.id}`} className="block relative">
        <img
          src={product.images[0]?.url || '/placeholder.png'}
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        {product.isPromoted && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
            Khuyến mãi
          </span>
        )}
      </Link>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-2">{product.brand}</p>
        <p className="text-gray-800 font-bold mb-3">{formatPrice(product.price)}</p>
        <Button variant="primary" size="sm" onClick={handleAddToCart} className="w-full">
          Thêm vào giỏ hàng
        </Button>
      </div>
    </Card>
  );
};

// Sử dụng React.memo để tránh re-render không cần thiết
export default React.memo(ProductCard);
