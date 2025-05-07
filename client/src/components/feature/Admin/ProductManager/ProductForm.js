// src/components/feature/Admin/ProductManager/ProductForm.js
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '../../../common/Button/Button';
import { Input } from '../../../common/Input/Input';

const schema = yup.object({
  name: yup.string().required('Tên sản phẩm không được để trống'),
  description: yup.object({
    short: yup.string().required('Mô tả ngắn không được để trống'),
    long: yup.string().required('Mô tả chi tiết không được để trống'),
  }),
  category: yup.string().required('Danh mục không được để trống'),
  brand: yup.string().required('Thương hiệu không được để trống'),
  price: yup.number().required('Giá không được để trống').min(0, 'Giá không được âm'),
  stock: yup.number().required('Số lượng không được để trống').min(0, 'Số lượng không được âm'),
  sku: yup.string(),
  features: yup.array().of(yup.string()),
  specifications: yup.object(),
});

const ProductForm = ({ product, categories, onSubmit, isSubmitting }) => {
  const [features, setFeatures] = useState(product?.features || ['']);
  const [imageUrls, setImageUrls] = useState(product?.images?.map((img) => img.url) || ['']);
  const [specificationFields, setSpecificationFields] = useState(
    product?.specifications
      ? Object.entries(product.specifications).map(([key, value]) => ({ key, value }))
      : [{ key: '', value: '' }]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: product?.name || '',
      description: {
        short: product?.description?.short || '',
        long: product?.description?.long || '',
      },
      category: product?.category || '',
      brand: product?.brand || '',
      price: product?.price || 0,
      salePrice: product?.salePrice || 0,
      stock: product?.stock || 0,
      sku: product?.sku || '',
      isActive: product?.isActive ?? true,
      isPromoted: product?.isPromoted ?? false,
      isFeatured: product?.isFeatured ?? false,
      features: product?.features || [''],
      specifications: product?.specifications || {},
    },
  });

  // Cập nhật features và specifications vào form data
  useEffect(() => {
    setValue('features', features.filter(Boolean));

    const specsObject = {};
    specificationFields.forEach((field) => {
      if (field.key && field.value) {
        specsObject[field.key] = field.value;
      }
    });
    setValue('specifications', specsObject);
  }, [features, specificationFields, setValue]);

  // Xử lý thêm/xóa feature
  const handleAddFeature = () => {
    setFeatures([...features, '']);
  };

  const handleRemoveFeature = (index) => {
    const newFeatures = [...features];
    newFeatures.splice(index, 1);
    setFeatures(newFeatures);
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  // Xử lý thêm/xóa specification
  const handleAddSpecification = () => {
    setSpecificationFields([...specificationFields, { key: '', value: '' }]);
  };

  const handleRemoveSpecification = (index) => {
    const newFields = [...specificationFields];
    newFields.splice(index, 1);
    setSpecificationFields(newFields);
  };

  const handleSpecificationChange = (index, field, value) => {
    const newFields = [...specificationFields];
    newFields[index][field] = value;
    setSpecificationFields(newFields);
  };

  // Xử lý thêm/xóa hình ảnh
  const handleAddImage = () => {
    setImageUrls([...imageUrls, '']);
  };

  const handleRemoveImage = (index) => {
    const newUrls = [...imageUrls];
    newUrls.splice(index, 1);
    setImageUrls(newUrls);
  };

  const handleImageChange = (index, value) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  // Xử lý submit form
  const onFormSubmit = (data) => {
    // Thêm hình ảnh vào data
    const images = imageUrls.filter(Boolean).map((url, index) => ({
      url,
      alt: `${data.name} - Hình ${index + 1}`,
      isPrimary: index === 0,
    }));

    // Submit with images
    onSubmit({ ...data, images });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* Thông tin cơ bản */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin cơ bản</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              label="Tên sản phẩm"
              {...register('name')}
              error={errors.name?.message}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              {...register('category')}
              className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
                errors.category ? 'border-red-300' : ''
              }`}
            >
              <option value="">Chọn danh mục</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div>
            <Input
              label="Thương hiệu"
              {...register('brand')}
              error={errors.brand?.message}
              required
            />
          </div>

          <div>
            <Input
              label="Giá (VND)"
              type="number"
              {...register('price')}
              error={errors.price?.message}
              required
            />
          </div>

          <div>
            <Input
              label="Giá khuyến mãi (VND)"
              type="number"
              {...register('salePrice')}
              error={errors.salePrice?.message}
            />
          </div>

          <div>
            <Input
              label="Số lượng tồn kho"
              type="number"
              {...register('stock')}
              error={errors.stock?.message}
              required
            />
          </div>

          <div>
            <Input label="SKU" {...register('sku')} error={errors.sku?.message} />
          </div>

          <div className="md:col-span-2">
            <Input
              label="Mô tả ngắn"
              {...register('description.short')}
              error={errors.description?.short?.message}
              required
              multiline
              rows={2}
            />
          </div>

          <div className="md:col-span-2">
            <Input
              label="Mô tả chi tiết"
              {...register('description.long')}
              error={errors.description?.long?.message}
              required
              multiline
              rows={6}
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Sản phẩm đang bán
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPromoted"
              {...register('isPromoted')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPromoted" className="ml-2 block text-sm text-gray-900">
              Sản phẩm được quảng bá
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isFeatured"
              {...register('isFeatured')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
              Sản phẩm nổi bật
            </label>
          </div>
        </div>
      </div>

      {/* Tính năng sản phẩm */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tính năng sản phẩm</h3>

        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                placeholder={`Tính năng ${index + 1}`}
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                className="flex-1"
              />

              <button
                type="button"
                onClick={() => handleRemoveFeature(index)}
                className="text-red-500 hover:text-red-700"
              >
                Xóa
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddFeature}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            + Thêm tính năng
          </button>
        </div>
      </div>

      {/* Thông số kỹ thuật */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thông số kỹ thuật</h3>

        <div className="space-y-4">
          {specificationFields.map((field, index) => (
            <div key={index} className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Tên thông số"
                value={field.key}
                onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
              />

              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Giá trị"
                  value={field.value}
                  onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                  className="flex-1"
                />

                <button
                  type="button"
                  onClick={() => handleRemoveSpecification(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddSpecification}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            + Thêm thông số
          </button>
        </div>
      </div>

      {/* Hình ảnh sản phẩm */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Hình ảnh sản phẩm</h3>

        <div className="space-y-4">
          {imageUrls.map((url, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                placeholder="URL hình ảnh"
                value={url}
                onChange={(e) => handleImageChange(index, e.target.value)}
                className="flex-1"
              />

              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="text-red-500 hover:text-red-700"
              >
                Xóa
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddImage}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            + Thêm hình ảnh
          </button>
        </div>
      </div>

      {/* Submit button */}
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Hủy
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {product ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
