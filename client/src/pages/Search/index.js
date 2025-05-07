import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { searchProducts, setKeyword } from '../../store/slices/searchSlice';
import ProductCard from '../../components/feature/Product/ProductCard';
import SearchFilters from '../../components/feature/Search/SearchFilters';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/Empty';
import ErrorMessage from '../../components/common/ErrorMessage';

const SearchPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { results, loading, error, keyword } = useSelector((state) => state.search);

  // Extract search query from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryParam = searchParams.get('q');

    if (queryParam) {
      dispatch(setKeyword(queryParam));
      dispatch(searchProducts(queryParam));
    }
  }, [dispatch, location.search]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Trang chủ', path: '/' },
          { label: 'Tìm kiếm', path: '/search' },
          { label: keyword, path: `/search?q=${encodeURIComponent(keyword)}` },
        ]}
      />

      <h1 className="text-2xl font-bold mb-6">Kết quả tìm kiếm cho `{keyword}`</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar with filters */}
        <div className="w-full md:w-1/4 lg:w-1/5">
          <SearchFilters />
        </div>

        {/* Search results */}
        <div className="w-full md:w-3/4 lg:w-4/5">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : results.length === 0 ? (
            <EmptyState message={`Không tìm thấy sản phẩm nào phù hợp với "${keyword}"`} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
