import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPaymentHistory, releaseMilestonePayment, requestRefund } from '../../features/payment/paymentSlice';
import { formatCurrency, formatDate, getStatusColor, formatStatusLabel } from '../../utils/helpers';
import { CurrencyRupeeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { SkeletonCard } from '../../components/ui/LoadingSpinner';
import Footer from '../../components/layout/Footer';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'created', label: 'Pending' },
  { id: 'captured', label: 'In Escrow' },
  { id: 'released', label: 'Released' },
  { id: 'refunded', label: 'Refunded' },
];

const PaymentsPage = () => {
  const dispatch = useDispatch();
  const { payments, isLoading } = useSelector((s) => s.payment);
  const { user } = useSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState('all');
  const [releasing, setReleasing] = useState(null);

  useEffect(() => { dispatch(getPaymentHistory()); }, []);

  const filtered = activeTab === 'all' ? payments : payments.filter(p => p.status === activeTab);

  const totalReleased = payments.filter(p => p.status === 'released').reduce((a, p) => a + p.amount, 0);
  const totalEscrow = payments.filter(p => p.status === 'captured').reduce((a, p) => a + p.amount, 0);

  const handleRelease = async (paymentId) => {
    setReleasing(paymentId);
    try {
      await dispatch(releaseMilestonePayment(paymentId)).unwrap();
      toast.success('Payment released to freelancer!');
    } catch (err) { toast.error(err || 'Failed to release'); }
    finally { setReleasing(null); }
  };

  const handleRefund = async (paymentId) => {
    try {
      await dispatch(requestRefund(paymentId)).unwrap();
      toast.success('Refund requested');
    } catch (err) { toast.error(err || 'Failed to request refund'); }
  };

  const isClient = user?.role === 'client';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFCFB' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-2">
          <CurrencyRupeeIcon className="w-8 h-8" style={{ color: '#16a34a' }} />
          <h1 className="text-3xl font-bold" style={{ color: '#111110' }}>Payments</h1>
        </div>
        <p className="mb-6" style={{ color: '#9a9590' }}>Track all your transactions</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="card text-center">
            <p className="text-2xl font-bold" style={{ color: '#7c3aed' }}>{formatCurrency(totalEscrow)}</p>
            <p className="text-xs mt-1" style={{ color: '#9a9590' }}>In Escrow</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold" style={{ color: '#16a34a' }}>{formatCurrency(totalReleased)}</p>
            <p className="text-xs mt-1" style={{ color: '#9a9590' }}>{isClient ? 'Total Paid' : 'Total Earned'}</p>
          </div>
          <div className="card text-center col-span-2 md:col-span-1">
            <p className="text-2xl font-bold" style={{ color: '#EA6C2A' }}>{payments.length}</p>
            <p className="text-xs mt-1" style={{ color: '#9a9590' }}>Total Transactions</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto" style={{ borderBottom: '1px solid #e8e4df' }}>
          {TABS.map(tab => {
            const count = tab.id === 'all' ? payments.length : payments.filter(p => p.status === tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex-shrink-0 flex items-center gap-2"
                style={{
                  borderColor: activeTab === tab.id ? '#EA6C2A' : 'transparent',
                  color: activeTab === tab.id ? '#EA6C2A' : '#9a9590',
                }}
              >
                {tab.label}
                {count > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#f7f4f1', color: '#9a9590' }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Payment List */}
        {isLoading ? (
          <div className="space-y-4">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">💳</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#111110' }}>No payments found</h3>
            <p style={{ color: '#9a9590' }}>Payment history will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((payment) => (
              <div key={payment._id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                        {formatStatusLabel(payment.status)}
                      </span>
                      {payment.escrowHeld && payment.status === 'captured' && (
                        <div className="flex items-center gap-1 text-xs" style={{ color: '#EA6C2A' }}>
                          <ShieldCheckIcon className="w-3.5 h-3.5" />
                          <span>In Escrow</span>
                        </div>
                      )}
                    </div>
                    <p className="font-semibold" style={{ color: '#111110' }}>{payment.milestoneTitle || 'Milestone Payment'}</p>
                    <p className="text-sm mt-0.5" style={{ color: '#9a9590' }}>{payment.project?.title || 'Project'}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: '#9a9590' }}>
                      <span>📅 {formatDate(payment.createdAt)}</span>
                      {payment.razorpayPaymentId && <span>🔑 {payment.razorpayPaymentId.substring(0, 12)}...</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold" style={{ color: '#111110' }}>{formatCurrency(payment.amount)}</p>
                    <p className="text-xs mt-1" style={{ color: '#9a9590' }}>{payment.currency || 'INR'}</p>
                  </div>
                </div>

                {/* Actions */}
                {payment.status === 'captured' && isClient && (
                  <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: '1px solid #e8e4df' }}>
                    <Button size="sm" variant="success" onClick={() => handleRelease(payment._id)} isLoading={releasing === payment._id}>
                      Release to Freelancer
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleRefund(payment._id)} disabled={!!releasing}>
                      Request Refund
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PaymentsPage;
