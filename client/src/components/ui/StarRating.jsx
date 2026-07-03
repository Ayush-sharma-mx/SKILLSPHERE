import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

const StarRating = ({ value = 0, onChange, readOnly = false, size = 'md', showValue = false }) => {
  const [hovered, setHovered] = useState(0);

  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' };
  const iconSize = sizes[size];

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (hovered || value) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange && onChange(star)}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            className={`transition-transform ${!readOnly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
          >
            {filled ? (
              <StarIcon className={`${iconSize} text-yellow-400`} />
            ) : (
              <StarOutlineIcon className={`${iconSize} text-gray-600`} />
            )}
          </button>
        );
      })}
      {showValue && value > 0 && (
        <span className="ml-1 text-sm font-medium text-gray-300">{value.toFixed(1)}</span>
      )}
    </div>
  );
};

export default StarRating;
