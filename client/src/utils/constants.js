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

export const SKILLS_BY_CATEGORY = {
  'Web Development': [
    'React.js', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 'Express.js',
    'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Bootstrap',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Firebase', 'GraphQL', 'REST API',
    'Redux', 'Webpack', 'Vite', 'SASS/SCSS', 'PHP', 'Laravel', 'Django',
    'Ruby on Rails', 'Spring Boot', 'ASP.NET', 'WordPress', 'Shopify',
  ],
  'Mobile Development': [
    'React Native', 'Flutter', 'Swift', 'Kotlin', 'Java', 'Dart',
    'Xcode', 'Android Studio', 'Firebase', 'Expo', 'Objective-C',
    'SwiftUI', 'Jetpack Compose', 'Ionic', 'Capacitor', 'App Store Deployment',
  ],
  'UI/UX Design': [
    'Figma', 'Adobe XD', 'Sketch', 'InVision', 'Prototyping', 'Wireframing',
    'User Research', 'Usability Testing', 'Design Systems', 'Responsive Design',
    'Interaction Design', 'Information Architecture', 'Accessibility (WCAG)',
    'Material Design', 'Motion Design', 'Framer',
  ],
  'Graphic Design': [
    'Adobe Photoshop', 'Adobe Illustrator', 'CorelDRAW', 'Canva',
    'Logo Design', 'Brand Identity', 'Typography', 'Print Design',
    'Poster Design', 'Packaging Design', 'Social Media Graphics',
    'Infographics', 'Vector Art', 'Photo Editing', 'Banner Design',
  ],
  'Content Writing': [
    'Blog Writing', 'SEO Writing', 'Copywriting', 'Technical Writing',
    'Creative Writing', 'Ghostwriting', 'Editing & Proofreading',
    'Content Strategy', 'Social Media Content', 'Email Marketing Copy',
    'Scriptwriting', 'Research Writing', 'Press Releases', 'UX Writing',
  ],
  'Digital Marketing': [
    'Google Ads', 'Facebook Ads', 'SEO', 'SEM', 'Social Media Marketing',
    'Email Marketing', 'Content Marketing', 'Influencer Marketing',
    'Google Analytics', 'Affiliate Marketing', 'Marketing Automation',
    'Conversion Optimization', 'HubSpot', 'Mailchimp', 'Meta Business Suite',
  ],
  'Data Science': [
    'Python', 'R', 'Pandas', 'NumPy', 'SQL', 'Tableau', 'Power BI',
    'Data Visualization', 'Statistical Analysis', 'Data Cleaning',
    'Jupyter Notebook', 'Excel Advanced', 'ETL', 'Apache Spark',
    'Big Data', 'Data Mining', 'A/B Testing', 'Matplotlib', 'Seaborn',
  ],
  'Machine Learning': [
    'Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Keras',
    'Deep Learning', 'NLP', 'Computer Vision', 'OpenCV', 'Hugging Face',
    'Neural Networks', 'Reinforcement Learning', 'MLOps', 'LLMs',
    'GANs', 'Transfer Learning', 'Model Deployment', 'ONNX',
  ],
  'DevOps & Cloud': [
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform',
    'CI/CD', 'Jenkins', 'GitHub Actions', 'Linux', 'Nginx', 'Ansible',
    'Prometheus', 'Grafana', 'Serverless', 'CloudFormation', 'Helm',
    'Bash Scripting', 'Monitoring', 'Load Balancing',
  ],
  'Cybersecurity': [
    'Penetration Testing', 'Network Security', 'OWASP', 'Ethical Hacking',
    'SOC Analysis', 'Firewall Management', 'Vulnerability Assessment',
    'SIEM', 'Incident Response', 'Encryption', 'Compliance (GDPR/HIPAA)',
    'Malware Analysis', 'Security Auditing', 'Identity Management',
  ],
  'Video Editing': [
    'Adobe Premiere Pro', 'Final Cut Pro', 'DaVinci Resolve', 'After Effects',
    'Motion Graphics', 'Color Grading', 'Sound Design', 'YouTube Editing',
    'Short-form Video', 'Reels/TikTok', 'VFX', 'Screen Recording',
    'Subtitling', 'Storyboarding', 'Animation',
  ],
  'Photography': [
    'Portrait Photography', 'Product Photography', 'Photo Retouching',
    'Adobe Lightroom', 'Adobe Photoshop', 'Studio Lighting',
    'Drone Photography', 'Event Photography', 'Real Estate Photography',
    'Food Photography', 'Fashion Photography', 'HDR Photography',
  ],
  'Translation': [
    'English', 'Hindi', 'Spanish', 'French', 'German', 'Japanese',
    'Chinese (Mandarin)', 'Arabic', 'Korean', 'Portuguese', 'Russian',
    'Localization', 'Subtitling', 'Transcription', 'CAT Tools',
  ],
  'Legal': [
    'Contract Drafting', 'Legal Research', 'Compliance', 'IP Law',
    'Corporate Law', 'Privacy Policy', 'Terms of Service', 'GDPR',
    'Trademark Filing', 'Legal Writing', 'Due Diligence', 'NDAs',
  ],
  'Accounting & Finance': [
    'Tally', 'QuickBooks', 'GST Filing', 'Income Tax', 'Bookkeeping',
    'Financial Modeling', 'Excel', 'SAP', 'Zoho Books', 'Payroll',
    'Auditing', 'Budgeting', 'Cash Flow Management', 'Invoicing',
  ],
  'Virtual Assistant': [
    'Email Management', 'Calendar Management', 'Data Entry', 'CRM',
    'Project Coordination', 'Travel Booking', 'Social Media Management',
    'Research', 'Document Management', 'Customer Follow-up', 'Notion',
    'Slack', 'Trello', 'Asana', 'Google Workspace',
  ],
  'Customer Support': [
    'Live Chat', 'Zendesk', 'Freshdesk', 'Intercom', 'Ticketing Systems',
    'Phone Support', 'Email Support', 'CRM', 'Conflict Resolution',
    'Technical Support', 'Knowledge Base', 'Salesforce', 'HubSpot',
  ],
  'Other': [
    'Project Management', 'Agile/Scrum', 'Communication', 'Problem Solving',
    'Microsoft Office', 'Google Workspace', 'Presentation Skills',
    'Team Leadership', 'Strategic Planning', 'Process Improvement',
  ],
};
