import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';

// Toast component
const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!duration) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Icon based on type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-red-500"
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
        );
      case 'warning':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-yellow-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className={classNames(
        'fixed top-4 right-4 z-50 flex items-center bg-white rounded-lg shadow-lg border-l-4 p-4 transition-all duration-300',
        {
          'translate-x-0 opacity-100': isVisible,
          'translate-x-full opacity-0': !isVisible,
          'border-green-500': type === 'success',
          'border-red-500': type === 'error',
          'border-yellow-500': type === 'warning',
          'border-blue-500': type === 'info',
        }
      )}
    >
      <div className="mr-3">{getIcon()}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-700">{message}</p>
      </div>
      <button
        className="ml-4 text-gray-400 hover:text-gray-500"
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
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
    </div>
  );
};

// ToastContainer component
const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  // Add toast
  const addToast = (toast) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { ...toast, id }]);
    return id;
  };

  // Remove toast
  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // Expose methods globally
  useEffect(() => {
    window.toast = {
      success: (message, duration) => addToast({ message, type: 'success', duration }),
      error: (message, duration) => addToast({ message, type: 'error', duration }),
      warning: (message, duration) => addToast({ message, type: 'warning', duration }),
      info: (message, duration) => addToast({ message, type: 'info', duration }),
    };
  }, []);

  return createPortal(
    <div>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;
