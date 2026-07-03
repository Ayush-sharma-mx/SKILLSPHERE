import React from 'react';

const Input = React.forwardRef(({ label, error, icon, type = 'text', className = '', required = false, hint, RightIcon, helperText, ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-semibold mb-2" style={{ color: '#3d3d3b' }}>
        {label} {required && <span style={{ color: '#EA6C2A' }}>*</span>}
      </label>
    )}
    <div className="relative">
      {icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#b5afa9' }}>
          {React.createElement(icon, { className: 'h-5 w-5' })}
        </div>
      )}
      <input
        ref={ref} type={type}
        className={`input-field ${icon ? 'pl-11' : ''} ${RightIcon ? 'pr-11' : ''} ${error ? 'border-red-300 focus:ring-red-300' : ''} ${className}`}
        {...props}
      />
      {RightIcon && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#b5afa9' }}>
          <RightIcon />
        </div>
      )}
    </div>
    {(hint || helperText) && !error && (
      <p className="mt-1.5 text-xs" style={{ color: '#9a9590' }}>{hint || helperText}</p>
    )}
    {error && <p className="mt-1.5 text-xs" style={{ color: '#ef4444' }}>⚠ {error}</p>}
  </div>
));
Input.displayName = 'Input';

export const Textarea = React.forwardRef(({ label, error, required, className = '', rows = 4, ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-semibold mb-2" style={{ color: '#3d3d3b' }}>
        {label} {required && <span style={{ color: '#EA6C2A' }}>*</span>}
      </label>
    )}
    <textarea
      ref={ref} rows={rows}
      className={`input-field resize-none ${error ? 'border-red-300' : ''} ${className}`}
      {...props}
    />
    {error && <p className="mt-1.5 text-xs" style={{ color: '#ef4444' }}>⚠ {error}</p>}
  </div>
));
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef(({ label, error, required, className = '', children, ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-semibold mb-2" style={{ color: '#3d3d3b' }}>
        {label} {required && <span style={{ color: '#EA6C2A' }}>*</span>}
      </label>
    )}
    <select
      ref={ref}
      className={`input-field appearance-none cursor-pointer ${error ? 'border-red-300' : ''} ${className}`}
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239a9590' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
      {...props}
    >
      {children}
    </select>
    {error && <p className="mt-1.5 text-xs" style={{ color: '#ef4444' }}>⚠ {error}</p>}
  </div>
));
Select.displayName = 'Select';

export default Input;
