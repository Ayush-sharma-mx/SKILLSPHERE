export const API_URL = '/api';

export const ROLES = {
  CLIENT: 'client',
  FREELANCER: 'freelancer',
  ADMIN: 'admin',
};

export const PROJECT_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
};

export const PROPOSAL_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
};

export const PAYMENT_STATUS = {
  CREATED: 'created',
  CAPTURED: 'captured',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  RELEASED: 'released',
};

export const MILESTONE_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  PAID: 'paid',
};

export const SKILL_LEVELS = ['beginner', 'intermediate', 'expert'];

export const AVAILABILITY = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  NOT_AVAILABLE: 'not_available',
};

export const BADGE_TYPES = {
  NONE: 'none',
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
};

export const DISPUTE_STATUS = {
  OPEN: 'open',
  UNDER_REVIEW: 'under_review',
  RESOLVED_CLIENT: 'resolved_for_client',
  RESOLVED_FREELANCER: 'resolved_for_freelancer',
  CLOSED: 'closed',
};

export const NOTIFICATION_TYPES = {
  NEW_PROPOSAL: 'new_proposal',
  PROPOSAL_ACCEPTED: 'proposal_accepted',
  PROPOSAL_REJECTED: 'proposal_rejected',
  PROJECT_ASSIGNED: 'project_assigned',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_RELEASED: 'payment_released',
  REVIEW_RECEIVED: 'review_received',
  MESSAGE_RECEIVED: 'message_received',
  DISPUTE_RAISED: 'dispute_raised',
  DISPUTE_RESOLVED: 'dispute_resolved',
  MILESTONE_COMPLETED: 'milestone_completed',
  SYSTEM: 'system',
};

export const CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Graphic Design',
  'Content Writing',
  'Digital Marketing',
  'Data Science',
  'Machine Learning',
  'DevOps & Cloud',
  'Cybersecurity',
  'Video Editing',
  'Photography',
  'Translation',
  'Legal',
  'Accounting & Finance',
  'Virtual Assistant',
  'Customer Support',
  'Other',
];

export const DURATION_OPTIONS = [
  { value: 'less_than_1_month', label: 'Less than 1 month' },
  { value: '1_to_3_months', label: '1 to 3 months' },
  { value: '3_to_6_months', label: '3 to 6 months' },
  { value: 'more_than_6_months', label: 'More than 6 months' },
];

export const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner', desc: 'Entry level' },
  { value: 'intermediate', label: 'Intermediate', desc: '2-5 years' },
  { value: 'expert', label: 'Expert', desc: '5+ years' },
];

export const AVAILABILITY_OPTIONS = [
  { value: 'available', label: 'Available for Work' },
  { value: 'busy', label: 'Currently Busy' },
  { value: 'not_available', label: 'Not Available' },
];
