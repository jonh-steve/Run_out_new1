// src/pages/ProductDetail/index.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../../store/slices/productSlice';
import { fetchProductReviews, submitProductReview } from '../../store/slices/reviewSlice';
import { addToCart } from '../../store/slices/cartSlice';
import MainLayout from '../../components/layout/MainLayout';
import { Button, LoadingSpinner } from '../../components/common';
import { formatPrice } from '../../utils/formatters';
import ReviewForm from '../../components/feature/Review/ReviewForm';
import ReviewList from '../../components/feature/Review/ReviewList';
import ReviewStats from '../../components/feature/Review/ReviewStats';
import { toast } from 'react-toastify';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { product, loading, error } = useSelector((state) => state.products);
  const {
    reviews,
    stats: reviewStats,
    loading: reviewsLoading,
    error: reviewsError,
  } = useSelector((state) => state.review);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
      dispatch(fetchProductReviews(id));
    }

    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [dispatch, id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= (product?.stock || 1)) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      dispatch(
        addToCart({
          productId: product.id,
          quantity,
          name: product.name,
          price: product.price,
          image: product.images[0]?.url || '/placeholder.png',
        })
      );
      toast.success('Đã thêm sản phẩm vào giỏ hàng!');
    }
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      setIsSubmittingReview(true);
      await dispatch(submitProductReview({ ...reviewData, productId: id })).unwrap();
      toast.success('Đánh giá của bạn đã được gửi thành công!');
      // Refresh reviews
      dispatch(fetchProductReviews(id));
    } catch (error) {
      toast.error(error || 'Không thể gửi đánh giá. Vui lòng thử lại sau.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleImageClick = (index) => {
    setSelectedImage(index);
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
          <div className="text-red-500">Lỗi: {error}</div>
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

  // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
  const hasUserReviewed = isAuthenticated && reviews.some((review) => review.userId === user?.id);

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <a href="/" className="hover:text-blue-600">
            Trang chủ
          </a>{' '}
          &gt;
          <a href="/products" className="hover:text-blue-600">
            {' '}
            Sản phẩm
          </a>{' '}
          &gt;
          <span className="text-gray-800"> {product.name}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Hình ảnh sản phẩm */}
          <div className="w-full md:w-1/2">
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <img
                src={product.images[selectedImage]?.url || '/placeholder.png'}
                alt={product.name}
                className="w-full h-auto object-contain"
                style={{ maxHeight: '500px' }}
              />
            </div>

            {/* Hình ảnh phụ */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 mt-4">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className={`border rounded cursor-pointer overflow-hidden ${selectedImage === index ? 'border-blue-500 border-2' : ''}`}
                    onClick={() => handleImageClick(index)}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `${product.name} - Ảnh ${index + 1}`}
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
            <p className="text-gray-600 mb-2">Thương hiệu: {product.brand}</p>

            {/* Đánh giá sao */}
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400 mr-2">
                {'★'.repeat(Math.floor(product.ratings?.average || 0))}
                {'☆'.repeat(5 - Math.floor(product.ratings?.average || 0))}
              </div>
              <p className="text-gray-600">({product.ratings?.count || 0} đánh giá)</p>
            </div>

            <div className="text-2xl font-bold text-blue-700 mb-4">
              {formatPrice(product.price)}
              {product.salePrice && product.salePrice < product.price && (
                <span className="text-gray-500 line-through ml-2 text-lg">
                  {formatPrice(product.salePrice)}
                </span>
              )}
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
                <label htmlFor="quantity" className="block mb-1">
                  Số lượng:
                </label>
                <div className="flex items-center border rounded">
                  <button
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200"
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-16 border-x p-2 text-center"
                  />
                  <button
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200"
                    onClick={() => quantity < product.stock && setQuantity(quantity + 1)}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1"
              >
                {product.stock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
              </Button>
            </div>

            {/* Tính năng sản phẩm */}
            {product.features && product.features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Tính năng nổi bật:</h3>
                <ul className="list-disc pl-5">
                  {product.features.map((feature, index) => (
                    <li key={index} className="mb-1">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Chính sách bán hàng */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Chính sách mua hàng:</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  Giao hàng toàn quốc
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  Đổi trả trong vòng 7 ngày
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  Bảo hành chính hãng 12 tháng
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tabs cho mô tả và thông số kỹ thuật */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <a
                href="#description"
                className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600"
              >
                Mô tả sản phẩm
              </a>
              <a
                href="#specifications"
                className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                Thông số kỹ thuật
              </a>
              <a
                href="#reviews"
                className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                Đánh giá ({product.ratings?.count || 0})
              </a>
            </nav>
          </div>

          {/* Mô tả chi tiết */}
          <div id="description" className="mt-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="whitespace-pre-line">{product.description.long}</p>
            </div>
          </div>

          {/* Thông số kỹ thuật */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div id="specifications" className="mt-10">
              <h2 className="text-2xl font-bold mb-4">Thông số kỹ thuật</h2>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full border-collapse">
                  <tbody>
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <tr key={key} className="border-b">
                        <td className="py-3 px-6 bg-gray-50 font-medium capitalize w-1/3">
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

          {/* Đánh giá sản phẩm */}
          <div id="reviews" className="mt-10">
            <h2 className="text-2xl font-bold mb-6">Đánh giá sản phẩm</h2>

            {/* Thống kê đánh giá */}
            <ReviewStats stats={reviewStats} />

            {/* Form đánh giá - chỉ hiển thị cho người dùng đã đăng nhập và chưa đánh giá */}
            {isAuthenticated && !hasUserReviewed && (
              <div className="mb-8 mt-6">
                <h3 className="text-lg font-semibold mb-3">Viết đánh giá của bạn</h3>
                <ReviewForm
                  productId={product.id}
                  onSubmit={handleSubmitReview}
                  isSubmitting={isSubmittingReview}
                />
              </div>
            )}

            {/* Danh sách đánh giá */}
            <ReviewList reviews={reviews} loading={reviewsLoading} error={reviewsError} />
          </div>
        </div>

        {/* Sản phẩm liên quan */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Placeholder cho sản phẩm liên quan - sẽ được thay thế bằng dữ liệu thực */}
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4">
                  <div className="aspect-w-1 aspect-h-1 bg-gray-200 mb-3"></div>
                  <h3 className="font-medium">Sản phẩm liên quan {item}</h3>
                  <p className="text-blue-600 font-bold mt-2">1.000.000₫</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductDetailPage;
