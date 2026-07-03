import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProposalStatus, withdrawProposal } from '../../features/proposal/proposalSlice';
import { Link } from 'react-router-dom';
import { getAvatarFallback, formatCurrency, formatRelativeTime, truncateText, getStatusColor, formatStatusLabel } from '../../utils/helpers';
import { CurrencyRupeeIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { CheckBadgeIcon, StarIcon } from '@heroicons/react/24/solid';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const ProposalCard = ({ proposal, projectClientId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { isLoading } = useSelector((s) => s.proposal);

  const isClient = user?._id === projectClientId;
  const isOwner = user?._id === (proposal.freelancer?._id || proposal.freelancer);
  const freelancer = proposal.freelancer;
  const profile = proposal.freelancerProfile || {};

  const handleStatus = async (status) => {
    try {
      await dispatch(updateProposalStatus({ id: proposal._id, status })).unwrap();
      toast.success(`Proposal ${status}`);
    } catch (err) { toast.error(err); }
  };

  const handleWithdraw = async () => {
    try {
      await dispatch(withdrawProposal(proposal._id)).unwrap();
      toast.success('Proposal withdrawn');
    } catch (err) { toast.error(err); }
  };

  const statusVariant = { pending: 'warning', accepted: 'success', rejected: 'danger', withdrawn: 'default' };

  return (
    <div className="card hover:border-gray-700 transition-all duration-200">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {freelancer?.avatar ? (
            <img src={freelancer.avatar} alt={freelancer.name} className="w-12 h-12 rounded-xl border border-gray-700 object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {getAvatarFallback(freelancer?.name || 'F')}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link to={`/profile/${freelancer?._id}`} className="font-semibold text-white hover:text-blue-400 transition-colors flex items-center gap-1.5">
                {freelancer?.name || 'Freelancer'}
                {profile.isVerified && <CheckBadgeIcon className="w-4 h-4 text-blue-400" />}
              </Link>
              <div className="flex items-center gap-2 mt-0.5">
                {profile.averageRating > 0 && (
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-xs text-gray-300">{profile.averageRating?.toFixed(1)}</span>
                  </div>
                )}
                <span className="text-xs text-gray-500">{formatRelativeTime(proposal.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(proposal.status)}`}>
                {formatStatusLabel(proposal.status)}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3 p-3 bg-gray-800/50 rounded-xl">
            <div className="flex items-center gap-1.5 text-sm">
              <CurrencyRupeeIcon className="w-4 h-4 text-green-400" />
              <span className="font-semibold text-white">{formatCurrency(proposal.bidAmount)}</span>
            </div>
            <div className="w-px h-4 bg-gray-700" />
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <CalendarIcon className="w-4 h-4" />
              <span>{proposal.estimatedDays} days</span>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="mt-3">
            <p className="text-sm text-gray-400 leading-relaxed">{truncateText(proposal.coverLetter, 200)}</p>
          </div>

          {/* Actions */}
          {proposal.status === 'pending' && (
            <div className="flex gap-2 mt-3">
              {isClient && (
                <>
                  <Button size="sm" variant="success" onClick={() => handleStatus('accepted')} isLoading={isLoading}>
                    Accept
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleStatus('rejected')} isLoading={isLoading}>
                    Reject
                  </Button>
                  <Link to={`/chat`} className="px-3 py-1.5 text-xs border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-600 transition-colors">
                    Message
                  </Link>
                </>
              )}
              {isOwner && (
                <Button size="sm" variant="danger" onClick={handleWithdraw} isLoading={isLoading}>
                  Withdraw
                </Button>
              )}
            </div>
          )}
          {proposal.clientNote && (
            <p className="mt-2 text-xs text-gray-500 italic">Client note: {proposal.clientNote}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalCard;
