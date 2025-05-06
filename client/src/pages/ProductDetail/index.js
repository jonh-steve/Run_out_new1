// client/src/pages/ProductDetail/index.js

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../../store/slices/productSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { MainLayout } from '../../components/layout';
import { Button, LoadingSpinner } from '../../components/common';
import { formatPrice } from '../../utils/formatters';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { product, loading, error } = useSelector(state => state.products);
  const [quantity, setQuantity] = React.useState(1);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);
  
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };
  
  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart({ 
        productId: product.id, 
        quantity 
      }));
    }
  };
  
  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4 flex justify-center">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }
  
  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </MainLayout>
    );
  }
  
  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">Không tìm thấy sản phẩm.</div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Hình ảnh sản phẩm */}
          <div className="w-full md:w-1/2">
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <img 
                src={product.images[0]?.url || '/placeholder.png'} 
                alt={product.name} 
                className="w-full h-auto"
              />
            </div>
            
            {/* Hình ảnh phụ */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {product.images.map((image, index) => (
                  <div key={index} className="border rounded cursor-pointer overflow-hidden">
                    <img 
                      src={image.url} 
                      alt={image.alt || product.name} 
                      className="w-full h-20 object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Thông tin sản phẩm */}
          <div className="w-full md:w-1/2">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-gray-600 mb-4">Thương hiệu: {product.brand}</p>
            
            <div className="text-2xl font-bold text-blue-700 mb-4">
              {formatPrice(product.price)}
            </div>
            
            {/* Tình trạng kho */}
            <div className="mb-4">
              <span className="font-semibold">Tình trạng: </span>
              {product.stock > 0 ? (
                <span className="text-green-600">Còn hàng ({product.stock})</span>
              ) : (
                <span className="text-red-600">Hết hàng</span>
              )}
            </div>
            
            {/* Mô tả ngắn */}
            <div className="mb-6">
              <p>{product.description.short}</p>
            </div>
            
            {/* Số lượng và thêm vào giỏ hàng */}
            <div className="flex items-center mb-6">
              <div className="mr-4">
                <label htmlFor="quantity" className="block mb-1">Số lượng:</label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-20 border rounded p-2 text-center"
                />
              </div>
              
              <Button 
                variant="primary" 
                size="lg" 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                Thêm vào giỏ hàng
              </Button>
            </div>
            
            {/* Tính năng sản phẩm */}
            {product.features && product.features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Tính năng nổi bật:</h3>
                <ul className="list-disc pl-5">
                  {product.features.map((feature, index) => (
                    <li key={index} className="mb-1">{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Mô tả chi tiết */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Mô tả sản phẩm</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="whitespace-pre-line">{product.description.long}</p>
          </div>
        </div>
        
        {/* Thông số kỹ thuật */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Thông số kỹ thuật</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full border-collapse">
                <tbody>
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <tr key={key} className="border-b">
                      <td className="py-3 px-6 bg-gray-50 font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </td>
                      <td className="py-3 px-6">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ProductDetailPage;