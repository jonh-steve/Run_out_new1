import React from 'react';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {React.ReactNode} [props.header]
 * @param {React.ReactNode} [props.footer]
 * @param {string} [props.className]
 */
const Card = ({ children, header, footer, className = '', ...rest }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`} {...rest}>
      {header && <div className="px-6 py-4 border-b border-gray-200">{header}</div>}
      <div className="p-6">{children}</div>
      {footer && <div className="px-6 py-4 border-t border-gray-200">{footer}</div>}
    </div>
  );
};

export default Card;
