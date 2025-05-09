// Vị trí file: client/src/components/common/Input/index.js
// Component Input cải tiến cho phép tương tác với rightIcon
import React, { forwardRef } from 'react';

/**
 * Component Input cải tiến với khả năng tương tác với rightIcon
 * @param {Object} props
 * @param {string} [props.id] - ID của input
 * @param {string} [props.label] - Nhãn hiển thị trên input
 * @param {string} [props.error] - Thông báo lỗi
 * @param {string} [props.helperText] - Văn bản trợ giúp
 * @param {React.ReactNode} [props.leftIcon] - Biểu tượng bên trái
 * @param {React.ReactNode} [props.rightIcon] - Biểu tượng bên phải
 * @param {boolean} [props.rightIconInteractive=true] - Cho phép tương tác với rightIcon
 * @param {boolean} [props.leftIconInteractive=false] - Cho phép tương tác với leftIcon
 * @param {string} [props.className] - Class CSS bổ sung
 */
const Input = forwardRef(
  (
    {
      id,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      rightIconInteractive = true,
      leftIconInteractive = false,
      className = '',
      ...rest
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className="mb-4">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div
              className={`absolute inset-y-0 left-0 pl-3 flex items-center ${!leftIconInteractive ? 'pointer-events-none' : ''}`}
            >
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={`
            block w-full rounded-md shadow-sm 
            ${leftIcon ? 'pl-10' : 'pl-3'} 
            ${rightIcon ? 'pr-10' : 'pr-3'} 
            py-2 border 
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} 
            ${className}
          `}
            {...rest}
          />

          {rightIcon && (
            <div
              className={`absolute inset-y-0 right-0 pr-3 flex items-center ${!rightIconInteractive ? 'pointer-events-none' : ''}`}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

        {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
