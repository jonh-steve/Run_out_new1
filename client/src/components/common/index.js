/**
 * File: client/src/components/common/index.js
 *
 * File này export tất cả các component common để có thể import dễ dàng từ một điểm duy nhất.
 * Thay vì phải import từng component riêng lẻ như:
 * import Button from './components/common/Button/Button';
 * import Card from './components/common/Card/Card';
 *
 * Bạn có thể import như sau:
 * import { Button, Card, Input, Pagination } from './components/common';
 */

// Export Button component
export { default as Button } from './Button';
// Export Card component
export { default as Card } from './Card';
// Export Input component
export { default as Input } from './Input';
// Export Pagination component
export { default as Pagination } from './Pagination';
// Export LoadingSpinner component
export { default as LoadingSpinner } from './LoadingSpiner';
// Export Modal component
export { default as Modal } from './Modal';
// Export Toast component
export { default as Toast } from './Toast';
// Export Watermark component
export { default as Watermark } from './Watermark';
// Export RefreshButton component
export { default as RefreshButton } from './RefreshButton';
// Export ErrorAlert component
export { default as ErrorAlert } from './ErrorAlert';
