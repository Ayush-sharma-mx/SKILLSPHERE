import React from 'react';
import { getSkillLevelColor } from '../../utils/helpers';

const SkillBadge = ({ skill, showLevel = true }) => {
  const name = typeof skill === 'string' ? skill : skill?.name;
  const level = typeof skill === 'object' ? skill?.level : null;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${level && showLevel ? getSkillLevelColor(level) : 'bg-gray-800 text-gray-300 border-gray-700'}`}>
      {name}
      {level && showLevel && (
        <span className="opacity-70 capitalize">• {level}</span>
      )}
    </span>
  );
};

export default SkillBadge;
