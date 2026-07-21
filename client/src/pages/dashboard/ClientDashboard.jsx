import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  PlusIcon, BriefcaseIcon, CurrencyRupeeIcon,
  DocumentTextIcon, UserGroupIcon, ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { fetchMyProjects } from '../../features/project/projectSlice';
import { fetchMyProposals } from '../../features/proposal/proposalSlice';
import { getPaymentHistory } from '../../features/payment/paymentSlice';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import useAuth from '../../hooks/useAuth';
import Badge from '../../components/ui/Badge';
import { formatCurrency, formatDate, formatRelativeTime } from '../../utils/helpers';
import { CardSkeleton } from '../../components/ui/LoadingSpinner';

const statColors = [
  { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.18)', icon: '#3b82f6', iconBg: 'rgba(59,130,246,0.1)' },
  { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.18)', icon: '#10b981', iconBg: 'rgba(16,185,129,0.1)' },
  { bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.18)', icon: '#8b5cf6', iconBg: 'rgba(139,92,246,0.1)' },
  { bg: 'rgba(234,108,42,0.08)', border: 'rgba(234,108,42,0.18)', icon: '#EA6C2A', iconBg: 'rgba(234,108,42,0.1)' },
];

const StatCard = ({ title, value, icon: Icon, index, sub }) => {
  const c = statColors[index % 4];
  return (
    <div className="bg-white border rounded-2xl p-5 relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ borderColor: c.border, background: c.bg, boxShadow: `0 1px 4px rgba(0,0,0,0.04)` }}>
      <div className="inline-flex p-2.5 rounded-xl mb-4" style={{ background: c.iconBg }}>
        <Icon className="h-5 w-5" style={{ color: c.icon }} />
      </div>
      <p className="text-2xl font-black mb-0.5" style={{ color: '#111110', letterSpacing: '-0.03em' }}>{value}</p>
      <p className="text-sm font-medium" style={{ color: '#6b6762' }}>{title}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: '#b5afa9' }}>{sub}</p>}
    </div>
  );
};

const statusVariant = { open: 'success', in_progress: 'info', completed: 'purple', cancelled: 'default', disputed: 'danger' };

const ClientDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { myProjects, isLoading: projectLoading } = useSelector(s => s.project);
  const { myProposals } = useSelector(s => s.proposal);
  const { payments } = useSelector(s => s.payment);

  useEffect(() => {
    dispatch(fetchMyProjects());
    dispatch(fetchMyProposals());
    dispatch(getPaymentHistory());
  }, [dispatch]);

  const activeProjects = myProjects.filter(p => p.status === 'in_progress').length;
  const totalSpent = payments.filter(p => p.status === 'released').reduce((s, p) => s + p.amount, 0);
  const pendingProposals = myProposals.filter(p => p.status === 'pending').length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFCFB' }}>

      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black mb-1" style={{ color: '#111110', letterSpacing: '-0.02em' }}>
                Dashboard
              </h1>
              <p style={{ color: '#9a9590' }}>Welcome back, <strong style={{ color: '#111110' }}>{user?.name?.split(' ')[0]}</strong>! 👋</p>
            </div>
            <Link to="/projects/create" className="btn-primary text-sm gap-2">
              <PlusIcon className="h-4 w-4" /> Post Project
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard title="Active Projects" value={activeProjects} icon={BriefcaseIcon} index={0} sub={`${myProjects.length} total`} />
            <StatCard title="Total Spent" value={formatCurrency(totalSpent)} icon={CurrencyRupeeIcon} index={1} />
            <StatCard title="Proposals Received" value={pendingProposals} icon={DocumentTextIcon} index={2} sub="pending" />
            <StatCard title="Hired Freelancers" value={myProjects.filter(p => p.freelancer).length} icon={UserGroupIcon} index={3} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* My Projects */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold" style={{ color: '#111110' }}>My Projects</h2>
                <Link to="/projects" className="text-sm font-semibold flex items-center gap-1 transition-colors" style={{ color: '#EA6C2A' }}>
                  Browse all <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="space-y-2.5">
                {projectLoading ? (
                  [1, 2, 3].map(i => <CardSkeleton key={i} />)
                ) : myProjects.length === 0 ? (
                  <div className="bg-white border rounded-2xl p-10 text-center" style={{ borderColor: '#e8e4df' }}>
                    <BriefcaseIcon className="h-10 w-10 mx-auto mb-3" style={{ color: '#d0cbc5' }} />
                    <p className="mb-4 text-sm" style={{ color: '#9a9590' }}>No projects yet</p>
                    <Link to="/projects/create" className="btn-primary text-sm">Post Your First Project</Link>
                  </div>
                ) : myProjects.map(project => (
                  <Link
                    key={project._id}
                    to={`/projects/${project._id}`}
                    className="flex items-center gap-4 p-4 bg-white border rounded-xl hover:border-[#d0cbc5] hover:shadow-md transition-all group"
                    style={{ borderColor: '#e8e4df' }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate mb-1 group-hover:text-[#EA6C2A] transition-colors" style={{ color: '#111110' }}>
                        {project.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs" style={{ color: '#b5afa9' }}>
                        <span>{formatCurrency(project.budget?.min || project.budget)}</span>
                        <span>·</span>
                        <span>{formatRelativeTime(project.createdAt)}</span>
                      </div>
                    </div>
                    <Badge variant={statusVariant[project.status] || 'default'}>
                      {project.status?.replace('_', ' ')}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Payments */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold" style={{ color: '#111110' }}>Recent Payments</h2>
                <Link to="/payments" className="text-sm font-semibold flex items-center gap-1 transition-colors" style={{ color: '#EA6C2A' }}>
                  View all <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="space-y-2.5">
                {payments.slice(0, 5).map(payment => (
                  <div key={payment._id} className="bg-white border rounded-xl p-4 transition-all hover:shadow-sm" style={{ borderColor: '#e8e4df' }}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold truncate max-w-[130px]" style={{ color: '#111110' }}>
                        {payment.project?.title || 'Payment'}
                      </p>
                      <span className="text-sm font-black" style={{ color: '#10b981' }}>
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: '#b5afa9' }}>{formatDate(payment.createdAt)}</span>
                      <Badge variant={payment.status === 'released' ? 'success' : 'info'} size="sm">
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {payments.length === 0 && (
                  <div className="bg-white border rounded-2xl p-8 text-center" style={{ borderColor: '#e8e4df' }}>
                    <CurrencyRupeeIcon className="h-8 w-8 mx-auto mb-2" style={{ color: '#d0cbc5' }} />
                    <p className="text-sm" style={{ color: '#9a9590' }}>No payments yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientDashboard;
