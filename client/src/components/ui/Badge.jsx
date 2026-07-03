import React from 'react';

const variants = {
  success: 'bg-green-500/15 text-green-400 border border-green-500/30',
  warning: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  danger: 'bg-red-500/15 text-red-400 border border-red-500/30',
  info: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  default: 'bg-gray-500/15 text-gray-400 border border-gray-500/30',
  orange: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
};

const sizes = { sm: 'px-2 py-0.5 text-xs', md: 'px-2.5 py-1 text-xs' };

const Badge = ({ children, variant = 'default', size = 'md', className = '', dot = false }) => {
  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full bg-current`} />}
      {children}
    </span>
  );
};

export default Badge;
