'use client';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export function LoadingSpinner({ size = 18, className = '' }: LoadingSpinnerProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block animate-spin rounded-full border-2 border-white/30 border-t-white ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
