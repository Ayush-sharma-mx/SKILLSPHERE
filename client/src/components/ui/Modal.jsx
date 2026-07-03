import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Modal = ({ isOpen, onClose, title, children, size = 'md', footer }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      {/* Backdrop */}
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(17,17,16,0.45)' }} onClick={onClose} />

      {/* Modal panel */}
      <div
        className={`relative w-full ${sizes[size]} animate-scale-in max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden`}
        style={{ background: '#FDFCFB', border: '1px solid #e4e0db', boxShadow: '0 24px 64px rgba(0,0,0,0.14)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 flex-shrink-0 border-b" style={{ borderColor: '#f0ede9' }}>
          <h3 className="text-lg font-bold" style={{ color: '#111110' }}>{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl transition-colors"
            style={{ color: '#9a9590' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f0ede9'; e.currentTarget.style.color = '#111110'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9a9590'; }}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 flex-shrink-0 border-t" style={{ borderColor: '#f0ede9', background: '#f7f4f1' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
