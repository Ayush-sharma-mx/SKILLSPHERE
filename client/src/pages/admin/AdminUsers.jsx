import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAdminUsers, updateUserStatus, verifyFreelancer } from '../../features/admin/adminSlice';
import { formatDate, getAvatarFallback } from '../../utils/helpers';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import Button from '../../components/ui/Button';
import { SkeletonCard } from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { users, isLoading } = useSelector((s) => s.admin);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { dispatch(getAdminUsers({ search, role: roleFilter, status: statusFilter })); }, [search, roleFilter, statusFilter]);

  const handleToggleStatus = async (userId, isActive) => {
    setActionLoading(userId);
    try {
      await dispatch(updateUserStatus({ id: userId, isActive: !isActive })).unwrap();
      toast.success(`User ${isActive ? 'suspended' : 'activated'}`);
    } catch { toast.error('Action failed'); }
    finally { setActionLoading(null); }
  };

  const handleVerifyFreelancer = async (userId) => {
    setActionLoading(userId);
    try {
      await dispatch(verifyFreelancer(userId)).unwrap();
      toast.success('Freelancer verified!');
    } catch { toast.error('Verification failed'); }
    finally { setActionLoading(null); }
  };

  const filteredUsers = (users || []).filter(u => {
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? u.isActive !== false : u.isActive === false);
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFCFB' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#111110' }}>Users</h1>
            <p className="text-sm mt-1" style={{ color: '#9a9590' }}>{filteredUsers.length} users shown</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-48">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9a9590' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none"
                style={{ backgroundColor: '#f7f4f1', border: '1px solid #e8e4df', color: '#111110' }}
              />
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field text-sm py-2 pr-8">
              <option value="all">All Roles</option>
              <option value="freelancer">Freelancers</option>
              <option value="client">Clients</option>
              <option value="admin">Admins</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field text-sm py-2 pr-8">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-3">{[1,2,3,4,5].map(i => <SkeletonCard key={i} />)}</div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e8e4df', backgroundColor: 'white' }}>
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#f7f4f1', borderBottom: '1px solid #e8e4df' }}>
                  {['User', 'Role', 'Joined', 'Status', 'Verified', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#9a9590' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#f0ede9' }}>
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-sm" style={{ color: '#9a9590' }}>No users found</td></tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u._id} className="transition-colors" style={{ borderBottom: '1px solid #f0ede9' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fafaf9'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-xl object-cover" style={{ border: '1px solid #e8e4df' }} />
                          ) : (
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg, #EA6C2A, #f59e42)' }}>
                              {getAvatarFallback(u.name)}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm" style={{ color: '#111110' }}>{u.name}</p>
                            <p className="text-xs" style={{ color: '#9a9590' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-lg text-xs font-medium capitalize" style={{
                          backgroundColor: u.role === 'admin' ? '#f5f3ff' : u.role === 'freelancer' ? '#fff3ec' : '#f0f9ff',
                          color: u.role === 'admin' ? '#7c3aed' : u.role === 'freelancer' ? '#EA6C2A' : '#0284c7',
                          border: '1px solid currentColor',
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#9a9590' }}>{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{
                          backgroundColor: u.isActive !== false ? '#f0fdf4' : '#fef2f2',
                          color: u.isActive !== false ? '#16a34a' : '#dc2626',
                          border: `1px solid ${u.isActive !== false ? 'rgba(22,163,74,0.3)' : 'rgba(220,38,38,0.3)'}`,
                        }}>
                          {u.isActive !== false ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.role === 'freelancer' ? (
                          u.freelancerProfile?.isVerified ? (
                            <div className="flex items-center gap-1 text-xs" style={{ color: '#16a34a' }}>
                              <CheckBadgeIcon className="w-4 h-4" />
                              <span>Verified</span>
                            </div>
                          ) : (
                            <Button size="xs" variant="secondary" onClick={() => handleVerifyFreelancer(u._id)} isLoading={actionLoading === u._id}>Verify</Button>
                          )
                        ) : <span className="text-xs" style={{ color: '#d0cbc5' }}>N/A</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="xs"
                          variant={u.isActive !== false ? 'danger' : 'success'}
                          onClick={() => handleToggleStatus(u._id, u.isActive !== false)}
                          isLoading={actionLoading === u._id}
                        >
                          {u.isActive !== false ? 'Suspend' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
