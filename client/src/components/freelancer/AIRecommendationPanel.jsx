import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { SparklesIcon, StarIcon } from '@heroicons/react/24/solid';
import { CurrencyRupeeIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { getAvatarFallback } from '../../utils/helpers';

const AIRecommendationPanel = ({ projectId }) => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasRun, setHasRun] = useState(false);

  const runAIMatching = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/freelancers/match/${projectId}`);
      setFreelancers(data.data || []);
      setHasRun(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch AI recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Automatically trigger on mount if desired, or let user click
    runAIMatching();
  }, [projectId]);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="w-8 h-8 border-3 border-[#e4e0db] border-t-[#EA6C2A] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-[#111110]">AI is analyzing project skills and matching profiles...</p>
        <p className="text-xs text-[#9a9590] mt-1">Using Hugging Face semantic embeddings</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center">
        <p className="text-sm font-semibold text-red-600 mb-2">{error}</p>
        <button
          onClick={runAIMatching}
          className="px-4 py-2 bg-[#EA6C2A] text-white text-xs font-bold rounded-xl hover:bg-[#d55e1e] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#e8e4df]">
        <p className="text-xs text-[#9a9590]">
          Ranked by semantic skill match, rating, and availability.
        </p>
        <button
          onClick={runAIMatching}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#EA6C2A] bg-[#EA6C2A]/10 hover:bg-[#EA6C2A]/20 transition-colors"
        >
          <SparklesIcon className="w-3.5 h-3.5" /> Re-run Match
        </button>
      </div>

      {freelancers.length === 0 ? (
        <div className="py-10 text-center bg-[#f7f4f1] rounded-2xl border border-[#e8e4df]">
          <div className="text-3xl mb-2">🔍</div>
          <p className="text-sm font-bold text-[#111110]">No matches found</p>
          <p className="text-xs text-[#9a9590] mt-1">Try adding more required skills or broadening budget</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {freelancers.map((item) => {
            const profile = item.freelancer || item;
            const user = profile.user || {};
            const matchScore = item.matchScore ? Math.round(item.matchScore * 100) : 85;

            return (
              <div
                key={profile._id || user._id}
                className="p-4 rounded-2xl bg-white border border-[#e8e4df] hover:border-[#EA6C2A]/40 transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-xl object-cover border border-[#e8e4df]" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-sm" style={{ background: 'linear-gradient(135deg, #EA6C2A, #c9531a)' }}>
                          {getAvatarFallback(user.name || 'Freelancer')}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-[#111110] leading-tight">{user.name || 'Anonymous Freelancer'}</h4>
                        <p className="text-xs text-[#9a9590]">{profile.title || 'Full Stack Developer'}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-[#EA6C2A]/10 text-[#EA6C2A]">
                        <SparklesIcon className="w-3 h-3" /> {matchScore}% Match
                      </span>
                    </div>
                  </div>

                  {/* Match Bar */}
                  <div className="w-full bg-[#f0ede9] h-1.5 rounded-full overflow-hidden mb-3">
                    <div className="bg-[#EA6C2A] h-full rounded-full transition-all duration-500" style={{ width: `${matchScore}%` }} />
                  </div>

                  {/* Skills */}
                  {profile.skills && profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {profile.skills.slice(0, 4).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-[#f7f4f1] text-[#6b6762] border border-[#e8e4df]">
                          {typeof skill === 'string' ? skill : skill.name}
                        </span>
                      ))}
                      {profile.skills.length > 4 && (
                        <span className="px-1.5 py-0.5 rounded-lg text-[10px] font-semibold text-[#9a9590]">
                          +{profile.skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#f0ede9] text-xs mt-2">
                  <div className="flex items-center gap-3 font-semibold text-[#6b6762]">
                    <span className="flex items-center gap-1">
                      <StarIcon className="w-3.5 h-3.5 text-amber-500" />
                      {profile.averageRating || '5.0'}
                    </span>
                    <span>₹{profile.hourlyRate || 800}/hr</span>
                  </div>

                  <Link
                    to={`/freelancer/${profile._id || user._id}`}
                    className="px-3 py-1.5 rounded-xl font-bold text-white transition-all hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg, #111110, #2a2520)' }}
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AIRecommendationPanel;
