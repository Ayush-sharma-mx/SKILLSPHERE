import React from 'react';
import StarRating from '../ui/StarRating';
import { getAvatarFallback, formatRelativeTime, truncateText } from '../../utils/helpers';
import { CheckBadgeIcon, HandThumbUpIcon } from '@heroicons/react/24/solid';
import { HandThumbUpIcon as HandThumbUpOutline } from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ReviewCard = ({ review, onHelpful }) => {
  const reviewer = review.reviewer;

  const handleHelpful = async () => {
    try {
      await api.patch(`/reviews/${review._id}/helpful`);
      toast.success('Marked as helpful');
      if (onHelpful) onHelpful();
    } catch (err) {
      toast.error('Already marked');
    }
  };

  return (
    <div className="card hover:border-gray-700 transition-all duration-200">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {reviewer?.avatar ? (
          <img src={reviewer.avatar} alt={reviewer.name} className="w-10 h-10 rounded-full border border-gray-700 object-cover flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 border border-gray-700">
            {getAvatarFallback(reviewer?.name || 'U')}
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-white text-sm">{reviewer?.name || 'Anonymous'}</span>
                {review.isVerified && (
                  <CheckBadgeIcon className="w-4 h-4 text-blue-400" title="Verified Review" />
                )}
              </div>
              <StarRating value={review.rating} readOnly size="sm" />
            </div>
            <span className="text-xs text-gray-500 flex-shrink-0">{formatRelativeTime(review.createdAt)}</span>
          </div>

          <p className="text-sm text-gray-400 mt-2 leading-relaxed">{review.comment}</p>

          {review.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {review.tags.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded-md border border-gray-700">{tag}</span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mt-3">
            <button onClick={handleHelpful} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-400 transition-colors">
              <HandThumbUpOutline className="w-3.5 h-3.5" />
              <span>Helpful ({review.helpfulCount || 0})</span>
            </button>
            {review.reviewType && (
              <span className="text-xs text-gray-600 capitalize">{review.reviewType.replace(/_/g, ' → ')}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
