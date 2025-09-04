// Base Button Component
// Story 2.1: Task Creation and Basic Management

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const variantStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-400',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-400',
  outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400',
  ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 disabled:text-gray-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={clsx(
        // Base styles
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg',
        'transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:cursor-not-allowed',
        // Variant styles
        variantStyles[variant],
        // Size styles
        sizeStyles[size],
        // Loading state
        isLoading && 'cursor-not-allowed',
        // Custom className
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {/* Left icon or loading spinner */}
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
      ) : (
        leftIcon
      )}
      
      {/* Button text */}
      <span className={clsx(isLoading && 'opacity-75')}>
        {children}
      </span>
      
      {/* Right icon */}
      {!isLoading && rightIcon}
    </button>
  );
}

// Floating Action Button component
interface FloatingActionButtonProps {
  onClick: () => void;
  icon: ReactNode;
  label: string;
  className?: string;
  size?: 'md' | 'lg';
}

const fabSizes = {
  md: 'w-14 h-14',
  lg: 'w-16 h-16',
};

export function FloatingActionButton({
  onClick,
  icon,
  label,
  className,
  size = 'md',
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'fixed bottom-6 right-6 z-40',
        'flex items-center justify-center',
        'bg-blue-600 text-white rounded-full shadow-lg',
        'hover:bg-blue-700 focus:bg-blue-700',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'transition-all duration-200 transform hover:scale-105',
        'active:scale-95',
        // Touch-friendly minimum size (44px)
        'min-w-[44px] min-h-[44px]',
        fabSizes[size],
        className
      )}
      aria-label={label}
    >
      {icon}
    </button>
  );
}