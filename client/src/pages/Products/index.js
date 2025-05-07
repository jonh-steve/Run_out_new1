// src/pages/Products/index.js
// Trang hiển thị danh sách sản phẩm, bao gồm bộ lọc và breadcrumb

import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchProducts } from '../../store/slices/productSlice';
import ProductList from '../../components/feature/Product/ProductList';
import ProductFilter from '../../components/feature/Product/ProductFilter';
import CategoryBreadcrumb from '../../components/feature/Category/CategoryBreadcrumb';
import MainLayout from '../../components/layout/MainLayout';
import LoadingSpinner from '../../components/common/LoadingSpiner';

const ProductsPage = () => {
  const { categoryId } = useParams();
  const dispatch = useAppDispatch();
  const { products, isLoading, filters } = useAppSelector((state) => state.products);

  // Fetch sản phẩm khi component mount hoặc categoryId thay đổi
  useEffect(() => {
    dispatch(fetchProducts({ categoryId }));
  }, [dispatch, categoryId]);

  // Sử dụng useMemo để tối ưu hóa filtering
  const filteredProducts = useMemo(() => {
    if (!products.length) return [];

    return products.filter((product) => {
      // Filter by price range
      if (filters.minPrice && product.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && product.price > filters.maxPrice) {
        return false;
      }

      // Filter by brand
      if (filters.brand && product.brand !== filters.brand) {
        return false;
      }

      // Filter by stock
      if (filters.inStock && !product.inStock) {
        return false;
      }

      return true;
    });
  }, [products, filters]);

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <CategoryBreadcrumb categoryId={categoryId} />
        <h1 className="text-3xl font-bold mb-6">Sản Phẩm Billiard</h1>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4">
            <ProductFilter />
          </div>

          <div className="w-full md:w-3/4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : (
              <ProductList products={filteredProducts} />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductsPage;
