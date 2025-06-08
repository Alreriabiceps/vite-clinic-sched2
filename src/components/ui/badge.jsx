import React from 'react';

const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'outline':
        return 'border border-gray-200 text-gray-700 bg-transparent';
      case 'destructive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getVariantClasses()} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export { Badge }; 