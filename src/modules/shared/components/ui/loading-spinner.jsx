import { cn } from '../../lib/utils';

export function LoadingSpinner({ size = "default", className, ...props }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6", 
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function LoadingDots({ className, ...props }) {
  return (
    <div className={cn("loading-dots flex space-x-1", className)} {...props}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
} 