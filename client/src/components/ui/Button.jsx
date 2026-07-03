import React from 'react';

const variantStyles = {
  primary:   'bg-[#111110] hover:bg-[#2a2a28] text-white shadow-md shadow-black/10 hover:shadow-lg hover:shadow-black/15',
  secondary: 'bg-white hover:bg-[#f7f4f1] text-[#111110] border border-[#e4e0db] hover:border-[#ccc8c3] shadow-sm',
  accent:    'bg-[#EA6C2A] hover:bg-[#d45e20] text-white shadow-md shadow-orange-500/20 hover:shadow-orange-500/30',
  danger:    'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300',
  ghost:     'bg-transparent hover:bg-[#f0ede9] text-[#6b6762] hover:text-[#111110]',
  outline:   'bg-transparent border border-[#EA6C2A] text-[#EA6C2A] hover:bg-[#EA6C2A]/5',
  success:   'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20',
};

const sizeStyles = {
  xs: 'px-2.5 py-1 text-xs rounded-lg',
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-xl',
};

const Button = ({
  children, variant = 'primary', size = 'md',
  isLoading = false, disabled = false,
  className = '', onClick, type = 'button', icon, fullWidth, ...props
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || isLoading}
    className={`
      inline-flex items-center justify-center gap-2 font-semibold
      transition-all duration-200 active:scale-[0.97]
      disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
      ${variantStyles[variant] || variantStyles.primary}
      ${sizeStyles[size] || sizeStyles.md}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `}
    {...props}
  >
    {isLoading ? (
      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    ) : icon ? <span className="w-4 h-4 flex-shrink-0">{icon}</span> : null}
    {children}
  </button>
);

export default Button;
