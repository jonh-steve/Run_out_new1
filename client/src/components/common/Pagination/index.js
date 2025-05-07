import React from 'react';
import classNames from 'classnames';

const Pagination = ({ currentPage, totalPages, onPageChange, siblingCount = 1 }) => {
  // Generate page numbers
  const getPageNumbers = () => {
    const totalPageNumbers = siblingCount + 5; // Current + first + last + 2 ellipsis + siblings

    // If total pages is less than total page numbers, show all pages
    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Calculate left and right bounds
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    // Show ellipsis
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    // Always show first and last pages
    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Handle edge cases
    if (!shouldShowLeftDots && shouldShowRightDots) {
      // Show more pages on the left
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);

      return [...leftRange, '...', lastPageIndex];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      // Show more pages on the right
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );

      return [firstPageIndex, '...', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      // Show pages around current page with dots on both sides
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );

      return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center mt-8">
      <nav className="inline-flex">
        {/* Previous button */}
        <button
          className={classNames('px-3 py-1 rounded-l-md border border-gray-300', {
            'bg-gray-100 text-gray-500 cursor-not-allowed': currentPage === 1,
            'bg-white hover:bg-gray-50 text-gray-700': currentPage !== 1,
          })}
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Trước
        </button>

        {/* Page numbers */}
        {pageNumbers.map((pageNumber, index) => (
          <button
            key={index}
            className={classNames('px-3 py-1 border-t border-b border-gray-300', {
              'bg-blue-500 text-white': pageNumber === currentPage,
              'bg-white hover:bg-gray-50 text-gray-700':
                pageNumber !== currentPage && pageNumber !== '...',
              'bg-white text-gray-500': pageNumber === '...',
            })}
            onClick={() => pageNumber !== '...' && onPageChange(pageNumber)}
            disabled={pageNumber === '...'}
          >
            {pageNumber}
          </button>
        ))}

        {/* Next button */}
        <button
          className={classNames('px-3 py-1 rounded-r-md border border-gray-300', {
            'bg-gray-100 text-gray-500 cursor-not-allowed': currentPage === totalPages,
            'bg-white hover:bg-gray-50 text-gray-700': currentPage !== totalPages,
          })}
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Sau
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
