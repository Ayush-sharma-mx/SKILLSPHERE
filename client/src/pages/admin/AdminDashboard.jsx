import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAdminStats } from '../../features/admin/adminSlice';
import { Link } from 'react-router-dom';
import { UsersIcon, BriefcaseIcon, CurrencyRupeeIcon, ScaleIcon, DocumentTextIcon, ExclamationCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../../utils/helpers';
import AdminChart from '../../components/admin/AdminChart';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const StatCard = ({ icon: Icon, label, value, sub, iconBg, iconColor, to }) => (
  <Link to={to || '#'} className="card group transition-all duration-200 block"
    onMouseEnter={e => { e.currentTarget.style.borderColor = '#EA6C2A'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(234,108,42,0.08)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e4df'; e.currentTarget.style.boxShadow = ''; }}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: iconBg }}>
        <Icon className="w-6 h-6" style={{ color: iconColor }} />
      </div>
      <ArrowRightIcon className="w-4 h-4 transition-colors" style={{ color: '#d0cbc5' }} />
    </div>
    <p className="text-3xl font-black mb-1" style={{ color: '#111110' }}>{value}</p>
    <p className="text-sm font-medium" style={{ color: '#6b6762' }}>{label}</p>
    {sub && <p className="text-xs mt-1" style={{ color: '#9a9590' }}>{sub}</p>}
  </Link>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, isLoading } = useSelector((s) => s.admin);

  useEffect(() => { dispatch(getAdminStats()); }, []);

  if (isLoading && !stats) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FDFCFB' }}><LoadingSpinner size="lg" /></div>;

  const s = stats || {};

  const chartData = [
    { name: 'Jan', users: 30, projects: 20, revenue: 15000 },
    { name: 'Feb', users: 45, projects: 28, revenue: 21000 },
    { name: 'Mar', users: 55, projects: 35, revenue: 28000 },
    { name: 'Apr', users: 70, projects: 48, revenue: 38000 },
    { name: 'May', users: 60, projects: 41, revenue: 33000 },
    { name: 'Jun', users: 90, projects: 65, revenue: 52000 },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFCFB' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fff3ec' }}>
              <span className="text-base">⚡</span>
            </div>
            <h1 className="text-3xl font-black" style={{ color: '#111110' }}>Admin Dashboard</h1>
          </div>
          <p style={{ color: '#9a9590' }}>Platform overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard icon={UsersIcon} label="Total Users" value={s.totalUsers ?? '—'} sub={`${s.newUsersToday || 0} new today`} iconBg="#f0f9ff" iconColor="#0284c7" to="/admin/users" />
          <StatCard icon={BriefcaseIcon} label="Total Projects" value={s.totalProjects ?? '—'} sub={`${s.openProjects || 0} open`} iconBg="#fff3ec" iconColor="#EA6C2A" to="/admin/projects" />
          <StatCard icon={DocumentTextIcon} label="Total Proposals" value={s.totalProposals ?? '—'} sub={`${s.pendingProposals || 0} pending`} iconBg="#f5f3ff" iconColor="#7c3aed" to="/admin/projects" />
          <StatCard icon={CurrencyRupeeIcon} label="Total Revenue" value={formatCurrency(s.totalRevenue || 0)} sub="Platform earnings" iconBg="#f0fdf4" iconColor="#16a34a" to="/admin/payments" />
          <StatCard icon={ScaleIcon} label="Open Disputes" value={s.openDisputes ?? '—'} sub={`${s.closedDisputes || 0} closed`} iconBg="#fef2f2" iconColor="#dc2626" to="/admin/disputes" />
          <StatCard icon={UsersIcon} label="Freelancers" value={s.totalFreelancers ?? '—'} sub={`${s.verifiedFreelancers || 0} verified`} iconBg="#fefce8" iconColor="#ca8a04" to="/admin/users" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <h2 className="font-bold mb-4" style={{ color: '#111110' }}>User & Project Growth</h2>
            <AdminChart data={chartData} dataKeys={[{ key: 'users', color: '#EA6C2A' }, { key: 'projects', color: '#7c3aed' }]} />
          </div>
          <div className="card">
            <h2 className="font-bold mb-4" style={{ color: '#111110' }}>Revenue Trend</h2>
            <AdminChart data={chartData} dataKeys={[{ key: 'revenue', color: '#16a34a' }]} />
          </div>
        </div>

        {/* Quick Nav */}
        <div className="card">
          <h2 className="font-bold mb-4" style={{ color: '#111110' }}>Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { to: '/admin/users', label: 'Manage Users', emoji: '👥', color: '#0284c7' },
              { to: '/admin/projects', label: 'Review Projects', emoji: '📁', color: '#EA6C2A' },
              { to: '/admin/payments', label: 'Payment Log', emoji: '💳', color: '#16a34a' },
              { to: '/admin/disputes', label: 'Handle Disputes', emoji: '⚖️', color: '#dc2626' },
            ].map(item => (
              <Link key={item.to} to={item.to} className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all text-center"
                style={{ border: '1px solid #e8e4df' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.backgroundColor = '#f7f4f1'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e4df'; e.currentTarget.style.backgroundColor = ''; }}
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-sm font-medium" style={{ color: '#6b6762' }}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
