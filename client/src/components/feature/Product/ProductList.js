// client/src/components/feature/Product/ProductList.js

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../../../store/slices/productSlice';
import { addToCart } from '../../../store/slices/cartSlice';
import ProductCard from './ProductCard';
import { LoadingSpinner } from '../../../components/common';

const ProductList = ({ categoryId, filters = {} }) => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector(state => state.products);
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  useEffect(() => {
    dispatch(fetchProducts({ categoryId, ...filters }));
  }, [dispatch, categoryId, filters]);
  
  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);
  
  const handleAddToCart = (productId) => {
    dispatch(addToCart({ productId, quantity: 1 }));
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }
  
  if (!filteredProducts.length) {
    return <div className="text-center py-8">Không tìm thấy sản phẩm phù hợp.</div>;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredProducts.map(product => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onAddToCart={handleAddToCart} 
        />
      ))}
    </div>
  );
};

export default ProductList;