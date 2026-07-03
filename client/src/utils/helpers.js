import { formatDistanceToNow, format } from 'date-fns';

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  if (!date) return 'N/A';
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const truncateText = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

export const getAvatarFallback = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export const getStatusColor = (status) => {
  const colors = {
    open: 'bg-green-500/20 text-green-400 border-green-500/30',
    in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    completed: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
    disputed: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    accepted: 'bg-green-500/20 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    withdrawn: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    created: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    captured: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    refunded: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    released: 'bg-green-500/20 text-green-400 border-green-500/30',
    paid: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    available: 'bg-green-500/20 text-green-400',
    busy: 'bg-yellow-500/20 text-yellow-400',
    not_available: 'bg-red-500/20 text-red-400',
    under_review: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    resolved_for_client: 'bg-green-500/20 text-green-400 border-green-500/30',
    resolved_for_freelancer: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };
  return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
};

export const getBadgeColor = (badge) => {
  const colors = {
    none: 'text-gray-400',
    bronze: 'text-amber-600',
    silver: 'text-gray-300',
    gold: 'text-yellow-400',
  };
  return colors[badge] || 'text-gray-400';
};

export const getBadgeIcon = (badge) => {
  const icons = { none: '', bronze: '🥉', silver: '🥈', gold: '🥇' };
  return icons[badge] || '';
};

export const calculateProjectProgress = (milestones) => {
  if (!milestones || milestones.length === 0) return 0;
  const done = milestones.filter(
    (m) => m.status === 'completed' || m.status === 'paid'
  ).length;
  return Math.round((done / milestones.length) * 100);
};

export const getSkillLevelColor = (level) => {
  const colors = {
    beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
    intermediate: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    expert: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };
  return colors[level] || 'bg-gray-500/20 text-gray-400';
};

export const formatStatusLabel = (status) => {
  if (!status) return '';
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
