import React from 'react';

const sizes = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const LoadingSpinner = ({ size = 'md', className = '', text }) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className={`${sizes[size]} animate-spin`}>
        <svg viewBox="0 0 50 50" className="w-full h-full">
          <circle
            cx="25" cy="25" r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="31.416"
            strokeDashoffset="31.416"
            style={{ color: '#e8e4df' }}
          />
          <circle
            cx="25" cy="25" r="20"
            fill="none"
            stroke="url(#spinner-gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="100"
            strokeDashoffset="25"
          />
          <defs>
            <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EA6C2A" />
              <stop offset="100%" stopColor="#f59e42" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {text && <p className="text-sm" style={{ color: '#9a9590' }}>{text}</p>}
    </div>
  );
};

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FDFCFB' }}>
    <LoadingSpinner size="xl" text="Loading..." />
  </div>
);

export const SkeletonCard = () => (
  <div className="card animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: '#f0ede9' }} />
      <div className="flex-1 space-y-3">
        <div className="h-4 rounded-lg w-3/4" style={{ backgroundColor: '#f0ede9' }} />
        <div className="h-3 rounded-lg w-1/2" style={{ backgroundColor: '#f0ede9' }} />
        <div className="h-3 rounded-lg w-full" style={{ backgroundColor: '#f0ede9' }} />
        <div className="h-3 rounded-lg w-4/5" style={{ backgroundColor: '#f0ede9' }} />
      </div>
    </div>
  </div>
);

// Alias for backward compatibility
export const CardSkeleton = SkeletonCard;

export default LoadingSpinner;
