import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPinIcon, CurrencyRupeeIcon, ClockIcon,
  UserGroupIcon, ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency, formatRelativeTime } from '../../utils/helpers';

const categoryEmoji = {
  'Web Development': '🌐', 'Mobile Development': '📱', 'UI/UX Design': '🎨',
  'Graphic Design': '✏️', 'Content Writing': '✍️', 'Digital Marketing': '📣',
  'Data Science': '📊', 'Machine Learning': '🤖', 'DevOps & Cloud': '☁️',
  'Cybersecurity': '🔒', 'Video Editing': '🎬', 'Other': '💼',
};

const durationMap = {
  less_than_1_month: '< 1 mo', '1_to_3_months': '1–3 mo',
  '3_to_6_months': '3–6 mo', more_than_6_months: '6+ mo',
};

const levelStyle = {
  beginner:     { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  intermediate: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  expert:       { bg: '#fef3f2', color: '#b91c1c', border: '#fecaca' },
};

const ProjectCard = ({ project }) => {
  const {
    _id, title, description, category, requiredSkills = [],
    budget, duration, experienceLevel, proposalCount = 0,
    status, createdAt, isRemote, location,
  } = project;

  const emoji = categoryEmoji[category] || '💼';
  const lStyle = levelStyle[experienceLevel] || { bg: '#f7f4f1', color: '#6b6762', border: '#e4e0db' };

  return (
    <Link to={`/projects/${_id}`} className="group block">
      <div
        className="bg-white border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl cursor-pointer"
        style={{
          borderColor: '#e8e4df',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#d0cbc5'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#e8e4df'}
      >
        {/* Top row: emoji + status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{emoji}</span>
            <span className="text-xs font-medium text-[#9a9590]">{category || 'General'}</span>
          </div>
          {status === 'open' ? (
            <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
              style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Open
            </span>
          ) : (
            <span className="rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{ background: '#f7f4f1', color: '#9a9590', border: '1px solid #e4e0db' }}>
              {status}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-[#111110] mb-2 line-clamp-2 leading-snug group-hover:text-[#EA6C2A] transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-[#9a9590] text-sm leading-relaxed line-clamp-2 mb-4">{description}</p>

        {/* Skills */}
        {requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {requiredSkills.slice(0, 4).map((s) => (
              <span key={s} className="text-xs px-2.5 py-1 rounded-lg font-medium"
                style={{ background: '#f7f4f1', color: '#6b6762', border: '1px solid #e4e0db' }}>
                {s}
              </span>
            ))}
            {requiredSkills.length > 4 && (
              <span className="text-xs px-2.5 py-1 rounded-lg"
                style={{ background: '#f7f4f1', color: '#b5afa9', border: '1px solid #e4e0db' }}>
                +{requiredSkills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {budget?.min && (
            <div className="flex items-center gap-1 font-bold text-sm" style={{ color: '#EA6C2A' }}>
              <CurrencyRupeeIcon className="h-4 w-4" />
              {formatCurrency(budget.min)}
              {budget.max && budget.max !== budget.min ? `–${formatCurrency(budget.max)}` : ''}
              <span className="text-xs font-normal text-[#9a9590] ml-0.5">{budget.type === 'hourly' ? '/hr' : 'fixed'}</span>
            </div>
          )}
          {duration && (
            <div className="flex items-center gap-1 text-xs text-[#9a9590]">
              <ClockIcon className="h-3.5 w-3.5" />
              {durationMap[duration] || duration}
            </div>
          )}
          {(isRemote || location?.city) && (
            <div className="flex items-center gap-1 text-xs text-[#9a9590]">
              <MapPinIcon className="h-3.5 w-3.5" />
              {isRemote ? 'Remote' : location?.city}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#f0ede9' }}>
          <div className="flex items-center gap-2.5">
            {experienceLevel && (
              <span className="text-xs rounded-full px-2.5 py-0.5 font-semibold capitalize border"
                style={{ background: lStyle.bg, color: lStyle.color, borderColor: lStyle.border }}>
                {experienceLevel}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-[#b5afa9]">
              <UserGroupIcon className="h-3.5 w-3.5" />
              {proposalCount} bid{proposalCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#b5afa9]">{formatRelativeTime(createdAt)}</span>
            <ArrowRightIcon className="h-4 w-4 text-[#d0cbc5] group-hover:text-[#EA6C2A] group-hover:translate-x-0.5 transition-all duration-200" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
