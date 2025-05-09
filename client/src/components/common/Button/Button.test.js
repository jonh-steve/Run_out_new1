// src/components/common/Button/Button.test.js
// File test cho component Button trong thư mục src/components/common/Button

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '.';

describe('Button component', () => {
  test('renders button with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  describe('variant tests', () => {
    test('applies the correct primary variant class', () => {
      const { container } = render(<Button variant="primary">Primary Button</Button>);
      expect(container.firstChild).toHaveClass('bg-blue-600');
    });

    test('applies the correct secondary variant class', () => {
      const { container } = render(<Button variant="secondary">Secondary Button</Button>);
      expect(container.firstChild).toHaveClass('bg-gray-600');
    });

    test('applies the correct outline variant class', () => {
      const { container } = render(<Button variant="outline">Outline Button</Button>);
      expect(container.firstChild).toHaveClass('bg-transparent');
      expect(container.firstChild).toHaveClass('border-blue-600');
    });

    test('applies the correct danger variant class', () => {
      const { container } = render(<Button variant="danger">Danger Button</Button>);
      expect(container.firstChild).toHaveClass('bg-red-600');
    });
  });

  describe('size tests', () => {
    test('applies the correct small size class', () => {
      const { container } = render(<Button size="sm">Small Button</Button>);
      expect(container.firstChild).toHaveClass('py-1 px-3 text-sm');
    });

    test('applies the correct medium size class', () => {
      const { container } = render(<Button size="md">Medium Button</Button>);
      expect(container.firstChild).toHaveClass('py-2 px-4 text-base');
    });

    test('applies the correct large size class', () => {
      const { container } = render(<Button size="lg">Large Button</Button>);
      expect(container.firstChild).toHaveClass('py-3 px-5 text-lg');
    });
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('is disabled when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('shows loading spinner when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>);
    // Tìm SVG loading spinner thay vì sử dụng data-testid
    const loadingSpinner = document.querySelector('svg.animate-spin');
    expect(loadingSpinner).toBeInTheDocument();
  });

  test('renders with left icon when provided', () => {
    const leftIcon = <span>🔍</span>;
    render(<Button leftIcon={leftIcon}>Search</Button>);
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });

  test('renders with right icon when provided', () => {
    const rightIcon = <span>→</span>;
    render(<Button rightIcon={rightIcon}>Next</Button>);
    expect(screen.getByText('→')).toBeInTheDocument();
  });

  test('applies custom className when provided', () => {
    const { container } = render(<Button className="custom-class">Custom Button</Button>);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  test('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
