import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { updateCartItem, removeFromCart, clearCart, fetchCart } from '../../store/slices/cartSlice';
import CartList from '../../components/feature/Cart/CartList';
import CartSummary from '../../components/feature/Cart/CartSummary';
import EmptyState from '../../components/common/Empty';
import Breadcrumb from '../../components/common/Breadcrumb';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import MainLayout from '../../components/layout/MainLayout';
import { PATHS } from '../../routes/paths';

const CartPage = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Handle quantity change
  const handleQuantityChange = (productId, quantity) => {
    dispatch(updateCartItem({ productId, quantity }));
  };

  // Handle remove item
  const handleRemoveItem = (productId) => {
    dispatch(removeFromCart(productId));
  };

  // Handle clear cart
  const handleClearCart = () => {
    if (window.confirm('Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?')) {
      dispatch(clearCart());
    }
  };

  // Render loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: 'Trang chủ', path: '/' },
              { label: 'Giỏ hàng', path: '/cart' },
            ]}
          />
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        </div>
      </MainLayout>
    );
  }

  // Render error state
  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: 'Trang chủ', path: '/' },
              { label: 'Giỏ hàng', path: '/cart' },
            ]}
          />
          <div className="text-center text-red-500 mt-8">
            <p>Đã xảy ra lỗi: {error}</p>
            <Button variant="primary" className="mt-4" onClick={() => dispatch(fetchCart())}>
              Thử lại
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Render empty state if cart is empty
  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: 'Trang chủ', path: '/' },
              { label: 'Giỏ hàng', path: '/cart' },
            ]}
          />

          <EmptyState
            message="Giỏ hàng của bạn đang trống"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
            action={
              <Link to={PATHS.PRODUCTS}>
                <Button variant="primary">Tiếp tục mua sắm</Button>
              </Link>
            }
          />
        </div>
      </MainLayout>
    );
  }

  // Render cart with items
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: 'Trang chủ', path: '/' },
            { label: 'Giỏ hàng', path: '/cart' },
          ]}
        />

        <h1 className="text-2xl font-bold mb-6">Giỏ hàng của bạn</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <CartList
              items={items}
              onQuantityChange={handleQuantityChange}
              onRemoveItem={handleRemoveItem}
              loading={loading}
            />

            <div className="mt-4 flex justify-between items-center">
              <Button variant="outline" onClick={handleClearCart} disabled={items.length === 0}>
                Xóa tất cả
              </Button>

              <Link to={PATHS.PRODUCTS}>
                <Button variant="link">Tiếp tục mua sắm</Button>
              </Link>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <CartSummary items={items} checkoutLink={PATHS.CHECKOUT} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CartPage;
