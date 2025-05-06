// client/src/components/feature/Product/ProductCard.js

import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '../../../components/common';
import { formatPrice } from '../../../utils/formatters';

const ProductCard = ({ product, onAddToCart }) => {
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product.id);
    }
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
        <Button 
          variant="primary" 
          size="sm" 
          onClick={handleAddToCart}
          className="w-full"
        >
          Thêm vào giỏ hàng
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;