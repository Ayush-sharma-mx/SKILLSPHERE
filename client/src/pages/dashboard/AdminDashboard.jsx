import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getAdminStats, getAdminUsers, getAdminDisputes, getPlatformAnalytics } from '../../features/admin/adminSlice';
import AdminStats from '../../components/admin/AdminStats';
import AdminChart from '../../components/admin/AdminChart';
import { formatDate, formatCurrency, getAvatarFallback, getStatusColor, formatStatusLabel } from '../../utils/helpers';
import { ArrowRightIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Footer from '../../components/layout/Footer';
import toast from 'react-hot-toast';
import { verifyFreelancer, updateUserStatus } from '../../features/admin/adminSlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, users, disputes, analytics, isLoading } = useSelector((s) => s.admin);

  useEffect(() => {
    dispatch(getAdminStats());
    dispatch(getAdminUsers({ limit: 8 }));
    dispatch(getAdminDisputes({ status: 'open', limit: 5 }));
    dispatch(getPlatformAnalytics());
  }, []);

  const handleVerify = async (userId) => {
    try {
      await dispatch(verifyFreelancer(userId)).unwrap();
      toast.success('Freelancer verified!');
    } catch (err) { toast.error(err || 'Failed'); }
  };

  const handleToggleStatus = async (userId, current) => {
    try {
      await dispatch(updateUserStatus({ id: userId, isActive: !current })).unwrap();
      toast.success(`User ${!current ? 'activated' : 'deactivated'}`);
    } catch (err) { toast.error(err || 'Failed'); }
  };

  if (isLoading && !stats) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  const recentUsers = users.slice(0, 6);
  const openDisputes = disputes.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">Platform overview and management</p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/users" className="btn-secondary text-sm">Manage Users</Link>
            <Link to="/admin/disputes" className="btn-primary text-sm">Review Disputes</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <AdminStats stats={stats} />
        </div>

        {/* Charts */}
        <div className="mb-8">
          <AdminChart analytics={analytics} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white text-lg">Recent Users</h2>
              <Link to="/admin/users" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                View all <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentUsers.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No users yet</p>
              ) : (
                recentUsers.map((u) => (
                  <div key={u._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/40 hover:bg-gray-800/60 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 border border-gray-700">
                      {getAvatarFallback(u.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{u.name}</p>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize border ${u.role === 'admin' ? 'bg-red-500/20 text-red-400 border-red-500/30' : u.role === 'freelancer' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                        {u.role}
                      </span>
                      {u.role === 'freelancer' && !u.isVerified && (
                        <button onClick={() => handleVerify(u._id)} title="Verify freelancer" className="p-1 text-gray-500 hover:text-green-400 transition-colors">
                          <CheckBadgeIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleStatus(u._id, u.isActive)}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${u.isActive ? 'text-green-400 hover:text-red-400' : 'text-red-400 hover:text-green-400'}`}
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Open Disputes */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white text-lg">Open Disputes</h2>
              <Link to="/admin/disputes" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                View all <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
            {openDisputes.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                <div className="text-3xl mb-2">✅</div>
                No open disputes
              </div>
            ) : (
              <div className="space-y-3">
                {openDisputes.map((d) => (
                  <div key={d._id} className="p-3 rounded-xl bg-gray-800/40 hover:bg-gray-800/60 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{d.project?.title || 'Project'}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{d.reason}</p>
                        <p className="text-xs text-gray-600 mt-1">by {d.raisedBy?.name} • {formatDate(d.createdAt)}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border flex-shrink-0 ${getStatusColor(d.status)}`}>
                        {formatStatusLabel(d.status)}
                      </span>
                    </div>
                    <Link to="/admin/disputes" className="mt-2 block text-xs text-blue-400 hover:text-blue-300">
                      Resolve dispute →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'All Users', to: '/admin/users', color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400', icon: '👥' },
            { label: 'All Projects', to: '/admin/projects', color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400', icon: '📋' },
            { label: 'Payments', to: '/admin/payments', color: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400', icon: '💳' },
            { label: 'Disputes', to: '/admin/disputes', color: 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400', icon: '⚖️' },
          ].map(({ label, to, color, icon }) => (
            <Link key={label} to={to} className={`bg-gradient-to-br ${color} border rounded-2xl p-5 text-center hover:opacity-90 transition-opacity`}>
              <div className="text-3xl mb-2">{icon}</div>
              <p className="font-semibold text-sm">{label}</p>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
