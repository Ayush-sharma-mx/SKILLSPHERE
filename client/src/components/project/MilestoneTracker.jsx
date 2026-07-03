import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateMilestone } from '../../features/project/projectSlice';
import { releaseMilestonePayment } from '../../features/payment/paymentSlice';
import { calculateProjectProgress, formatCurrency, formatDate, getStatusColor, formatStatusLabel } from '../../utils/helpers';
import { CheckCircleIcon, ClockIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const MilestoneTracker = ({ project, onPayMilestone }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { isLoading } = useSelector((s) => s.project);
  const milestones = project?.milestones || [];
  const progress = calculateProjectProgress(milestones);
  const isClient = user?._id === (project?.client?._id || project?.client);
  const isFreelancer = user?._id === (project?.hiredFreelancer?._id || project?.hiredFreelancer);

  const handleMarkComplete = async (index) => {
    try {
      await dispatch(updateMilestone({ projectId: project._id, milestoneIndex: index, status: 'completed' })).unwrap();
      toast.success('Milestone marked as completed');
    } catch (err) {
      toast.error(err);
    }
  };

  const statusColors = {
    pending: 'border-gray-700 bg-gray-800/50',
    in_progress: 'border-blue-500/50 bg-blue-500/5',
    completed: 'border-green-500/50 bg-green-500/5',
    paid: 'border-purple-500/50 bg-purple-500/5',
  };

  const statusIcons = {
    pending: <ClockIcon className="w-5 h-5 text-gray-500" />,
    in_progress: <ClockIcon className="w-5 h-5 text-blue-400 animate-pulse" />,
    completed: <CheckCircleIcon className="w-5 h-5 text-green-400" />,
    paid: <CheckCircleSolid className="w-5 h-5 text-purple-400" />,
  };

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-white">Overall Progress</h3>
          <span className="text-2xl font-bold text-blue-400">{progress}%</span>
        </div>
        <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {milestones.filter(m => m.status === 'completed' || m.status === 'paid').length} of {milestones.length} milestones completed
        </p>
      </div>

      {/* Milestones List */}
      <div className="space-y-3">
        {milestones.map((milestone, index) => (
          <div key={index} className={`p-4 rounded-xl border ${statusColors[milestone.status] || statusColors.pending} transition-all`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{statusIcons[milestone.status]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-medium text-white text-sm">{milestone.title}</h4>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <CurrencyRupeeIcon className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-sm font-semibold text-white">{formatCurrency(milestone.amount)}</span>
                  </div>
                </div>
                {milestone.description && <p className="text-xs text-gray-400 mt-1">{milestone.description}</p>}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <ClockIcon className="w-3.5 h-3.5" />
                    <span>Due: {milestone.dueDate ? formatDate(milestone.dueDate) : 'No deadline'}</span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(milestone.status)}`}>
                    {formatStatusLabel(milestone.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              {isFreelancer && milestone.status === 'in_progress' && (
                <Button size="sm" variant="success" onClick={() => handleMarkComplete(index)} isLoading={isLoading}>
                  Mark Complete
                </Button>
              )}
              {isClient && milestone.status === 'completed' && onPayMilestone && (
                <Button size="sm" onClick={() => onPayMilestone(index, milestone)}>
                  Release Payment
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MilestoneTracker;
