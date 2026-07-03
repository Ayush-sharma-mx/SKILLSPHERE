import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAdminPayments } from '../../features/admin/adminSlice';
import { formatDate, formatCurrency, getStatusColor, formatStatusLabel } from '../../utils/helpers';
import { MagnifyingGlassIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import { SkeletonCard } from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminPayments = () => {
  const dispatch = useDispatch();
  const { payments, isLoading } = useSelector((s) => s.admin);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { dispatch(getAdminPayments({ search, status: statusFilter })); }, [search, statusFilter]);

  const handleRelease = async (paymentId) => {
    setActionLoading(paymentId);
    try {
      toast.success('Payment release sent (connect backend endpoint)');
      // await dispatch(adminReleasePayment(paymentId)).unwrap();
      toast.success('Payment released!');
    } catch { toast.error('Release failed'); }
    finally { setActionLoading(null); }
  };

  const filteredPayments = (payments || []).filter(p => {
    const matchSearch = !search || p.project?.title?.toLowerCase().includes(search.toLowerCase()) || p.razorpayPaymentId?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalVolume = filteredPayments.reduce((a, p) => a + p.amount, 0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFCFB' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#111110' }}>Payment Log</h1>
            <p className="text-sm mt-1" style={{ color: '#9a9590' }}>
              {filteredPayments.length} transactions · Total: <span className="font-medium" style={{ color: '#16a34a' }}>{formatCurrency(totalVolume)}</span>
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-48">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9a9590' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by project or payment ID..."
                className="w-full rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none"
                style={{ backgroundColor: '#f7f4f1', border: '1px solid #e8e4df', color: '#111110' }}
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field text-sm py-2">
              <option value="all">All Status</option>
              <option value="created">Pending</option>
              <option value="captured">In Escrow</option>
              <option value="released">Released</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => <SkeletonCard key={i} />)}</div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e8e4df', backgroundColor: 'white' }}>
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#f7f4f1', borderBottom: '1px solid #e8e4df' }}>
                  {['Project / Milestone', 'Client → Freelancer', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#9a9590' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-sm" style={{ color: '#9a9590' }}>No payments found</td></tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment._id} className="transition-colors" style={{ borderBottom: '1px solid #f0ede9' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fafaf9'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-sm" style={{ color: '#111110' }}>{payment.project?.title || 'Unknown Project'}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#9a9590' }}>{payment.milestoneTitle || 'Milestone'}</p>
                        {payment.razorpayPaymentId && (
                          <p className="text-xs mt-0.5 font-mono" style={{ color: '#d0cbc5' }}>{payment.razorpayPaymentId.substring(0, 14)}…</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <p style={{ color: '#6b6762' }}>
                          <span style={{ color: '#111110' }}>{payment.client?.name || '?'}</span>
                          {' → '}
                          <span style={{ color: '#111110' }}>{payment.freelancer?.name || '?'}</span>
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold" style={{ color: '#111110' }}>{formatCurrency(payment.amount)}</p>
                        <p className="text-xs" style={{ color: '#9a9590' }}>{payment.currency || 'INR'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                            {formatStatusLabel(payment.status)}
                          </span>
                          {payment.escrowHeld && payment.status === 'captured' && (
                            <div className="flex items-center gap-1 text-xs mt-1" style={{ color: '#EA6C2A' }}>
                              <ShieldCheckIcon className="w-3 h-3" /> In Escrow
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#9a9590' }}>{formatDate(payment.createdAt)}</td>
                      <td className="px-4 py-3">
                        {payment.status === 'captured' && (
                          <Button size="xs" variant="success" onClick={() => handleRelease(payment._id)} isLoading={actionLoading === payment._id}>
                            Release
                          </Button>
                        )}
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

export default AdminPayments;
