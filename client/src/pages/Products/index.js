// client/src/pages/Products/index.js

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductList from '../../components/feature/Product/ProductList';
import ProductFilter from '../../components/feature/Product/ProductFilter';
import CategoryBreadcrumb from '../../components/feature/Category/CategoryBreadcrumb';
import { MainLayout } from '../../components/layout';

const ProductsPage = () => {
  const { categoryId } = useParams();
  const [filters, setFilters] = useState({});
  
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <CategoryBreadcrumb categoryId={categoryId} />
        // client/src/pages/Products/index.js (tiếp tục)

        <h1 className="text-3xl font-bold mb-6">Sản Phẩm Billiard</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4">
            <ProductFilter onFilterChange={handleFilterChange} />
          </div>
          
          <div className="w-full md:w-3/4">
            <ProductList categoryId={categoryId} filters={filters} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductsPage;