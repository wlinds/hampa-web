// src/components/ui/Button.tsx
import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  loading?: boolean;
  as?: 'button' | 'a';
  href?: string;
  target?: string;
  rel?: string;
}

const getButtonClasses = (variant: ButtonVariant, size: ButtonSize, disabled?: boolean, loading?: boolean) => {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-hemp-600 hover:bg-hemp-700 text-white shadow-lg hover:shadow-xl focus:ring-hemp-500 disabled:bg-hemp-300",
    secondary: "bg-white hover:bg-hemp-50 text-hemp-700 border-2 border-hemp-600 shadow-md hover:shadow-lg focus:ring-hemp-500 disabled:bg-gray-50 disabled:border-gray-300 disabled:text-gray-400",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl focus:ring-red-500 disabled:bg-red-300",
    ghost: "bg-transparent hover:bg-hemp-50 text-hemp-700 focus:ring-hemp-500"
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm rounded-md",
    md: "px-6 py-3 text-base rounded-lg",
    lg: "px-8 py-4 text-lg rounded-xl"
  };

  const disabledClasses = (disabled || loading) ? "opacity-50 cursor-not-allowed" : "";

  return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses}`.trim();
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  disabled = false,
  className = '',
  as = 'button',
  href,
  target,
  rel,
  ...props
}) => {
  const classes = `${getButtonClasses(variant, size, disabled, loading)} ${className}`;
  const isDisabled = disabled || loading;

  if (as === 'a' && href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={classes}
        {...(isDisabled && { 'aria-disabled': 'true' })}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </a>
    );
  }

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={classes}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};