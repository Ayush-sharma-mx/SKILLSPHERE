import React from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, StarIcon, CheckBadgeIcon, CurrencyRupeeIcon } from '@heroicons/react/24/solid';
import { getAvatarFallback, getBadgeIcon, formatCurrency } from '../../utils/helpers';
import Badge from '../ui/Badge';

const FreelancerCard = ({ freelancer }) => {
  const profile = freelancer.freelancerProfile || freelancer;
  const user = freelancer.user || freelancer;

  return (
    <div
      className="card group transition-all duration-300"
      style={{ cursor: 'default' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#EA6C2A'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(234,108,42,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e4df'; e.currentTarget.style.boxShadow = ''; }}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-2xl object-cover" style={{ border: '1px solid #e8e4df' }} />
          ) : (
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg" style={{ background: 'linear-gradient(135deg, #EA6C2A, #f59e42)', border: '1px solid #e8e4df' }}>
              {getAvatarFallback(user.name)}
            </div>
          )}
          {profile.isVerified && (
            <CheckBadgeIcon className="w-5 h-5 absolute -bottom-1.5 -right-1.5 rounded-full" style={{ color: '#EA6C2A', backgroundColor: 'white' }} />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold truncate transition-colors" style={{ color: '#111110' }}>
                {user.name}
                {profile.verificationBadge && profile.verificationBadge !== 'none' && (
                  <span className="ml-1">{getBadgeIcon(profile.verificationBadge)}</span>
                )}
              </h3>
              <p className="text-sm truncate" style={{ color: '#9a9590' }}>{profile.title || 'Freelancer'}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <StarIcon className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium" style={{ color: '#111110' }}>{profile.averageRating?.toFixed(1) || '0.0'}</span>
              <span className="text-xs" style={{ color: '#9a9590' }}>({profile.totalReviews || 0})</span>
            </div>
          </div>

          {profile.location?.city && (
            <div className="flex items-center gap-1 mt-1.5 text-xs" style={{ color: '#9a9590' }}>
              <MapPinIcon className="w-3.5 h-3.5" />
              <span>{profile.location.city}, {profile.location.state}</span>
            </div>
          )}

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {(profile.skills || []).slice(0, 4).map((skill, i) => (
              <span key={i} className="px-2 py-0.5 text-xs rounded-lg" style={{ backgroundColor: '#f7f4f1', color: '#6b6762', border: '1px solid #e8e4df' }}>
                {typeof skill === 'string' ? skill : skill.name}
              </span>
            ))}
            {(profile.skills || []).length > 4 && (
              <span className="px-2 py-0.5 text-xs" style={{ color: '#9a9590' }}>+{profile.skills.length - 4} more</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid #e8e4df' }}>
        <div className="flex items-center gap-1" style={{ color: '#6b6762' }}>
          <CurrencyRupeeIcon className="w-4 h-4 text-green-500" />
          <span className="font-semibold" style={{ color: '#111110' }}>{formatCurrency(profile.hourlyRate)}</span>
          <span className="text-xs" style={{ color: '#9a9590' }}>/hr</span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={profile.availability === 'available' ? 'success' : profile.availability === 'busy' ? 'warning' : 'danger'} size="sm">
            {profile.availability === 'available' ? 'Available' : profile.availability === 'busy' ? 'Busy' : 'Unavailable'}
          </Badge>
          <Link
            to={`/profile/${user._id || user}`}
            className="px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-colors"
            style={{ backgroundColor: '#EA6C2A' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#d4581e'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#EA6C2A'}
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FreelancerCard;
