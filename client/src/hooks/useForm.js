import { useState } from 'react';

/**
 * Custom hook để quản lý form state
 * @param {Object} initialValues - Giá trị ban đầu của form
 * @param {Function} [validate] - Hàm validate form (optional)
 * @param {Function} [onSubmit] - Hàm xử lý submit form (optional)
 * @returns {Object} - Form state và các hàm xử lý
 */
const useForm = (initialValues, validate, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Xử lý giá trị dựa trên loại input
    const inputValue = type === 'checkbox' ? checked : value;

    setValues({
      ...values,
      [name]: inputValue,
    });

    // Nếu field đã được touched, chạy validate khi thay đổi
    if (touched[name] && validate) {
      const validationErrors = validate({ ...values, [name]: inputValue });
      setErrors(validationErrors);
    }
  };

  // Xử lý khi blur khỏi field
  const handleBlur = (e) => {
    const { name } = e.target;

    setTouched({
      ...touched,
      [name]: true,
    });

    // Chạy validate khi blur
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
    }
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Đánh dấu tất cả các field là touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});

    setTouched(allTouched);

    // Validate form trước khi submit
    let validationErrors = {};
    if (validate) {
      validationErrors = validate(values);
      setErrors(validationErrors);
    }

    // Nếu không có lỗi và có hàm onSubmit
    if (Object.keys(validationErrors).length === 0 && onSubmit) {
      setIsSubmitting(true);

      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  // Cập nhật giá trị form từ bên ngoài
  const setFieldValue = (name, value) => {
    setValues({
      ...values,
      [name]: value,
    });
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
  };
};

export default useForm;
