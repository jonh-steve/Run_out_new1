// client/src/components/feature/Category/CategoryBreadcrumb.js

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCategoryById } from '../../../store/slices/categorySlice';
import { PATHS } from '../../../routes/paths';

const CategoryBreadcrumb = ({ categoryId }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector(state => state.categories);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  
  useEffect(() => {
    if (categoryId) {
      dispatch(fetchCategoryById(categoryId));
    }
  }, [dispatch, categoryId]);
  
  useEffect(() => {
    if (categoryId && categories[categoryId]) {
      const category = categories[categoryId];
      
      // Tạo breadcrumb từ ancestors
      const breadcrumbItems = [
        { name: 'Trang Chủ', path: PATHS.HOME },
        { name: 'Sản Phẩm', path: PATHS.PRODUCTS }
      ];
      
      // Thêm ancestors nếu có
      if (category.ancestors && category.ancestors.length > 0) {
        category.ancestors.forEach(ancestor => {
          breadcrumbItems.push({
            name: ancestor.name,
            path: `${PATHS.PRODUCTS}?category=${ancestor._id}`
          });
        });
      }
      
      // Thêm category hiện tại
      breadcrumbItems.push({
        name: category.name,
        path: `${PATHS.PRODUCTS}?category=${category._id}`,
        active: true
      });
      
      setBreadcrumbs(breadcrumbItems);
    } else {
      // Default breadcrumb nếu không có category
      setBreadcrumbs([
        { name: 'Trang Chủ', path: PATHS.HOME },
        { name: 'Sản Phẩm', path: PATHS.PRODUCTS, active: true }
      ]);
    }
  }, [categoryId, categories]);
  
  return (
    <nav className="flex py-3 px-5 text-gray-700 bg-gray-50 rounded-lg mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {breadcrumbs.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
            )}
            
            {item.active ? (
              <span className="ml-1 md:ml-2 text-sm font-medium text-gray-500">
                {item.name}
              </span>
            ) : (
              <Link
                to={item.path}
                className={`ml-1 md:ml-2 text-sm font-medium text-blue-600 hover:text-blue-800 ${index === 0 ? '' : 'ml-2'}`}
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default CategoryBreadcrumb;