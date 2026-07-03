import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyProposals } from '../../features/proposal/proposalSlice';
import { fetchAssignedProjects, fetchAIMatches } from '../../features/project/projectSlice';
import { getFreelancerStats } from '../../features/freelancer/freelancerSlice';
import { getPaymentHistory } from '../../features/payment/paymentSlice';
import MilestoneTracker from '../../components/project/MilestoneTracker';
import AdminChart from '../../components/admin/AdminChart';
import { CurrencyRupeeIcon, BriefcaseIcon, DocumentTextIcon, StarIcon, ArrowRightIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { formatCurrency, formatRelativeTime, getStatusColor, formatStatusLabel, calculateProjectProgress } from '../../utils/helpers';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Footer from '../../components/layout/Footer';

const StatCard = ({ icon: Icon, label, value, iconBg, iconColor, sub }) => (
  <div className="card">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm" style={{ color: '#9a9590' }}>{label}</p>
        <p className="text-3xl font-bold mt-1" style={{ color: '#111110' }}>{value}</p>
        {sub && <p className="text-xs mt-1" style={{ color: '#9a9590' }}>{sub}</p>}
      </div>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: iconBg }}>
        <Icon className="w-6 h-6" style={{ color: iconColor }} />
      </div>
    </div>
  </div>
);

const FreelancerDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { myProposals } = useSelector((s) => s.proposal);
  const { assignedProjects, isLoading } = useSelector((s) => s.project);
  const { stats } = useSelector((s) => s.freelancer);
  const { payments } = useSelector((s) => s.payment);

  useEffect(() => {
    dispatch(fetchMyProposals());
    dispatch(fetchAssignedProjects());
    dispatch(getFreelancerStats());
    dispatch(getPaymentHistory());
  }, []);

  const totalEarned = payments.filter(p => p.status === 'released').reduce((acc, p) => acc + p.amount, 0);
  const pendingProposals = myProposals.filter(p => p.status === 'pending').length;
  const activeProjects = assignedProjects.filter(p => p.status === 'in_progress').length;

  if (isLoading && !assignedProjects.length) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FDFCFB' }}><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFCFB' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#111110' }}>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="mt-1" style={{ color: '#9a9590' }}>Here's what's happening with your freelancing</p>
          </div>
          <div className="flex gap-3">
            <Link to="/projects" className="btn-secondary text-sm">Browse Projects</Link>
            <Link to="/profile/edit" className="btn-primary text-sm">Edit Profile</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={BriefcaseIcon} label="Active Projects" value={activeProjects} iconBg="#fff3ec" iconColor="#EA6C2A" sub="In progress" />
          <StatCard icon={CurrencyRupeeIcon} label="Total Earned" value={formatCurrency(totalEarned)} iconBg="#f0fdf4" iconColor="#16a34a" sub="Released payments" />
          <StatCard icon={DocumentTextIcon} label="Proposals Sent" value={myProposals.length} iconBg="#f5f3ff" iconColor="#7c3aed" sub={`${pendingProposals} pending`} />
          <StatCard icon={StarIcon} label="Avg Rating" value={stats?.averageRating?.toFixed(1) || '—'} iconBg="#fefce8" iconColor="#ca8a04" sub={`${stats?.totalReviews || 0} reviews`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Projects */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: '#111110' }}>Active Projects</h2>
              <Link to="/proposals" className="text-sm flex items-center gap-1 font-medium" style={{ color: '#EA6C2A' }}>
                View all <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {assignedProjects.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-5xl mb-3">🔍</div>
                <p className="font-medium" style={{ color: '#6b6762' }}>No active projects yet</p>
                <p className="text-sm mt-1" style={{ color: '#9a9590' }}>Browse projects and submit proposals to get started</p>
                <Link to="/projects" className="btn-primary mt-4 inline-block">Browse Projects</Link>
              </div>
            ) : (
              assignedProjects.slice(0, 3).map((project) => (
                <div key={project._id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Link to={`/projects/${project._id}`} className="font-semibold transition-colors" style={{ color: '#111110' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#EA6C2A'}
                        onMouseLeave={e => e.currentTarget.style.color = '#111110'}
                      >
                        {project.title}
                      </Link>
                      <p className="text-sm mt-1" style={{ color: '#9a9590' }}>{formatCurrency(project.budget?.max)} budget</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                      {formatStatusLabel(project.status)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: '#9a9590' }}>Progress</span>
                      <span className="font-medium" style={{ color: '#111110' }}>{calculateProjectProgress(project.milestones)}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#f0ede9' }}>
                      <div className="h-full rounded-full" style={{ width: `${calculateProjectProgress(project.milestones)}%`, background: 'linear-gradient(to right, #EA6C2A, #f59e42)' }} />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link to={`/projects/${project._id}`} className="flex-1 text-center py-2 text-sm rounded-xl transition-colors font-medium" style={{ border: '1px solid #e8e4df', color: '#6b6762' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#EA6C2A'; e.currentTarget.style.color = '#EA6C2A'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e4df'; e.currentTarget.style.color = '#6b6762'; }}
                    >
                      View Project
                    </Link>
                    <Link to="/chat" className="flex-1 text-center py-2 text-sm rounded-xl text-white font-medium transition-colors" style={{ backgroundColor: '#EA6C2A' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#d4581e'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#EA6C2A'}
                    >
                      Message Client
                    </Link>
                  </div>
                </div>
              ))
            )}

            {/* Recent Proposals */}
            <div>
              <h2 className="text-xl font-bold mb-4" style={{ color: '#111110' }}>Recent Proposals</h2>
              {myProposals.length === 0 ? (
                <div className="card text-center py-8 text-sm" style={{ color: '#9a9590' }}>No proposals submitted yet</div>
              ) : (
                <div className="space-y-3">
                  {myProposals.slice(0, 4).map((p) => (
                    <div key={p._id} className="card flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: '#111110' }}>{p.project?.title || 'Project'}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#9a9590' }}>{formatRelativeTime(p.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold" style={{ color: '#111110' }}>{formatCurrency(p.bidAmount)}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(p.status)}`}>
                          {formatStatusLabel(p.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <div className="card">
              <h3 className="font-semibold mb-4" style={{ color: '#111110' }}>Profile Strength</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, #EA6C2A, #f59e42)' }}>
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: '#111110' }}>{user?.name}</p>
                  <p className="text-xs capitalize" style={{ color: '#9a9590' }}>{user?.role}</p>
                </div>
              </div>
              <div className="h-2 rounded-full mb-2" style={{ backgroundColor: '#f0ede9' }}>
                <div className="h-full w-3/4 rounded-full" style={{ background: 'linear-gradient(to right, #16a34a, #EA6C2A)' }} />
              </div>
              <p className="text-xs mb-3" style={{ color: '#9a9590' }}>75% complete — Add portfolio to reach 100%</p>
              <Link to="/profile/edit" className="btn-secondary text-sm w-full text-center block py-2">
                Complete Profile
              </Link>
            </div>

            {/* Quick Earnings */}
            <div className="card">
              <h3 className="font-semibold mb-4" style={{ color: '#111110' }}>Earnings Overview</h3>
              <div className="space-y-3">
                {[
                  { label: 'This Month', value: formatCurrency(stats?.thisMonthEarnings || 0), color: '#16a34a' },
                  { label: 'In Escrow', value: formatCurrency(stats?.escrowAmount || 0), color: '#ca8a04' },
                  { label: 'Total Lifetime', value: formatCurrency(stats?.totalEarnings || totalEarned), color: '#EA6C2A' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-2 last:border-0" style={{ borderBottom: '1px solid #f0ede9' }}>
                    <span className="text-sm" style={{ color: '#9a9590' }}>{item.label}</span>
                    <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <Link to="/payments" className="text-sm mt-3 block text-center font-medium" style={{ color: '#EA6C2A' }}>
                View Payment History
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FreelancerDashboard;
