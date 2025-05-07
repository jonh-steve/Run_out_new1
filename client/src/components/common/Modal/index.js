import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CSSTransition } from 'react-transition-group';
import { useOutsideClick } from '../../../hooks/useOutsideClick';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  footer = null,
}) => {
  const modalRef = useRef(null);
  const nodeRef = useRef(null);

  // Handle outside click
  useOutsideClick(modalRef, () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  });

  // Handle escape key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = ''; // Re-enable scrolling when modal is closed
    };
  }, [isOpen, onClose]);

  // Determine modal width based on size
  const getModalWidth = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'lg':
        return 'max-w-3xl';
      case 'xl':
        return 'max-w-5xl';
      case 'full':
        return 'max-w-full mx-4';
      default:
        return 'max-w-xl';
    }
  };

  return createPortal(
    <CSSTransition
      in={isOpen}
      timeout={300}
      classNames={{
        enter: 'opacity-0',
        enterActive: 'opacity-100 transition-opacity duration-300',
        exit: 'opacity-100',
        exitActive: 'opacity-0 transition-opacity duration-300',
      }}
      unmountOnExit
      nodeRef={nodeRef}
    >
      <div
        ref={nodeRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      >
        <div
          ref={modalRef}
          className={`bg-white rounded-lg shadow-xl w-full ${getModalWidth()} max-h-[90vh] flex flex-col`}
        >
          {/* Modal header */}
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            {showCloseButton && (
              <button type="button" className="text-gray-400 hover:text-gray-500" onClick={onClose}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Modal body */}
          <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>

          {/* Modal footer */}
          {footer && <div className="px-6 py-4 border-t">{footer}</div>}
        </div>
      </div>
    </CSSTransition>,
    document.body
  );
};

export default Modal;
