import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../../store/slices/productSlice';
import { ROUTES } from '../../routes/paths';
import LoadingSpinner from '../../components/common/LoadingSpiner';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { formatPrice } from '../../utils/formatters';

const HomePage = () => {
  const dispatch = useDispatch();
  const { products, categories, loading } = useSelector((state) => state.product);

  useEffect(() => {
    // Lấy sản phẩm nổi bật
    dispatch(fetchProducts({ limit: 8, featured: true }));

    // Lấy danh mục
    dispatch(fetchCategories());
  }, [dispatch]);
  u
  if (loading && products.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-16 mb-12 rounded-lg">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">RunOut-Biliard</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Chuyên cung cấp các sản phẩm Bi-a chất lượng cao, đa dạng mẫu mã, phù hợp với mọi nhu
            cầu từ người chơi nghiệp dư đến chuyên nghiệp.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to={ROUTES.PRODUCTS}>
              <Button variant="primary" size="lg">
                Mua Ngay
              </Button>
            </Link>
            <Link to={ROUTES.ABOUT}>
              <Button variant="outline" size="lg">
                Tìm Hiểu Thêm
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="mb-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Danh Mục Sản Phẩm</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.slice(0, 4).map((category) => (
              <Link
                key={category._id}
                to={`${ROUTES.PRODUCTS}?category=${category.slug}`}
                className="block"
              >
                <div className="bg-gray-100 rounded-lg p-6 transition-transform hover:transform hover:scale-105 hover:shadow-lg text-center">
                  {category.image && (
                    <img
                      src={category.image.url}
                      alt={category.name}
                      className="w-16 h-16 mx-auto mb-4"
                    />
                  )}
                  <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                  <p className="text-gray-600 mb-4">
                    {category.description
                      ? category.description.substring(0, 100)
                      : 'Xem các sản phẩm'}
                  </p>
                  <span className="text-blue-600 hover:text-blue-800 font-medium">
                    Xem sản phẩm →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="mb-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Sản Phẩm Nổi Bật</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link key={product._id} to={`${ROUTES.PRODUCTS}/${product._id}`}>
                <Card className="h-full flex flex-col transition-all hover:shadow-lg">
                  <div className="relative pb-[75%] overflow-hidden rounded-t-lg">
                    <img
                      src={product.images[0]?.url || '/placeholder.png'}
                      alt={product.name}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 flex-grow flex flex-col">
                    <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 flex-grow">
                      {product.description?.short?.substring(0, 100) || 'Không có mô tả'}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-blue-700">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {product.ratings?.average > 0 ? (
                          <span className="flex items-center">
                            <svg
                              className="w-4 h-4 text-yellow-500 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {product.ratings.average.toFixed(1)}
                          </span>
                        ) : (
                          'Chưa có đánh giá'
                        )}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to={ROUTES.PRODUCTS}>
              <Button variant="outline" size="lg">
                Xem Tất Cả Sản Phẩm
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="mb-16 bg-gray-100 py-16 rounded-lg">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <h2 className="text-3xl font-bold mb-6">Về RunOut-Biliard</h2>
              <p className="text-lg mb-6">
                RunOut-Biliard là nhà cung cấp hàng đầu các sản phẩm Bi-a chất lượng cao tại Việt
                Nam. Chúng tôi tự hào mang đến cho khách hàng những sản phẩm chính hãng với giá cả
                hợp lý.
              </p>
              <p className="text-lg mb-6">
                Với đội ngũ nhân viên nhiều kinh nghiệm và am hiểu về Bi-a, chúng tôi cam kết mang
                đến sự tư vấn tận tâm và chuyên nghiệp cho khách hàng.
              </p>
              <Link to={ROUTES.ABOUT}>
                <Button variant="primary">Xem Thêm</Button>
              </Link>
            </div>
            <div className="md:w-1/2">
              <img
                src="/assets/about.jpg"
                alt="RunOut-Biliard Store"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
