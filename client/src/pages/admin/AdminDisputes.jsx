import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAdminDisputes } from '../../features/admin/adminSlice';
import { formatDate, getStatusColor, formatStatusLabel, getAvatarFallback } from '../../utils/helpers';
import { MagnifyingGlassIcon, ScaleIcon } from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Textarea, Select } from '../../components/ui/Input';
import { SkeletonCard } from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminDisputes = () => {
  const dispatch = useDispatch();
  const { disputes, isLoading } = useSelector((s) => s.admin);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [resolveModal, setResolveModal] = useState(null);
  const [resolveForm, setResolveForm] = useState({ status: 'resolved_for_client', adminNotes: '' });
  const [resolving, setResolving] = useState(false);

  useEffect(() => { dispatch(getAdminDisputes({ search, status: statusFilter })); }, [search, statusFilter]);

  const handleResolve = async () => {
    setResolving(true);
    try {
      // Resolve endpoint not in slice - notify admin via toast
      toast.success('Dispute resolution submitted (connect backend endpoint)');
      setResolveModal(null);
    } catch { toast.error('Resolution failed'); }
    finally { setResolving(false); }
  };

  const filteredDisputes = (disputes || []).filter(d => {
    const matchSearch = !search || d.project?.title?.toLowerCase().includes(search.toLowerCase()) || d.reason?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFCFB' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <ScaleIcon className="w-8 h-8" style={{ color: '#dc2626' }} />
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#111110' }}>Disputes</h1>
            <p className="text-sm mt-0.5" style={{ color: '#9a9590' }}>{filteredDisputes.length} disputes shown</p>
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
                placeholder="Search by project or reason..."
                className="w-full rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none"
                style={{ backgroundColor: '#f7f4f1', border: '1px solid #e8e4df', color: '#111110' }}
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field text-sm py-2">
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="under_review">Under Review</option>
              <option value="resolved_for_client">Resolved for Client</option>
              <option value="resolved_for_freelancer">Resolved for Freelancer</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e8e4df', backgroundColor: 'white' }}>
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#f7f4f1', borderBottom: '1px solid #e8e4df' }}>
                  {['Project', 'Raised By', 'Reason', 'Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#9a9590' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDisputes.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-sm" style={{ color: '#9a9590' }}>No disputes found</td></tr>
                ) : (
                  filteredDisputes.map((d) => (
                    <tr key={d._id} className="transition-colors" style={{ borderBottom: '1px solid #f0ede9' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fafaf9'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-sm" style={{ color: '#111110' }}>{d.project?.title || 'Unknown Project'}</p>
                        {d.description && <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#9a9590' }}>{d.description}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {d.raisedBy?.avatar ? (
                            <img src={d.raisedBy.avatar} alt={d.raisedBy.name} className="w-7 h-7 rounded-lg object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: '#dc2626' }}>
                              {getAvatarFallback(d.raisedBy?.name)}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium" style={{ color: '#111110' }}>{d.raisedBy?.name || 'Unknown'}</p>
                            <p className="text-xs capitalize" style={{ color: '#9a9590' }}>{d.raisedBy?.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm max-w-48">
                        <p className="line-clamp-2" style={{ color: '#6b6762' }}>{d.reason}</p>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#9a9590' }}>{formatDate(d.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(d.status)}`}>
                          {formatStatusLabel(d.status)}
                        </span>
                        {d.adminNotes && <p className="text-xs mt-1 line-clamp-1" style={{ color: '#9a9590' }}>📝 {d.adminNotes}</p>}
                      </td>
                      <td className="px-4 py-3">
                        {!['resolved_for_client', 'resolved_for_freelancer', 'closed'].includes(d.status) ? (
                          <Button size="xs" variant="warning" onClick={() => setResolveModal(d)}>
                            Resolve
                          </Button>
                        ) : (
                          <span className="text-xs" style={{ color: '#d0cbc5' }}>Done</span>
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

      {/* Resolve Modal */}
      <Modal
        isOpen={!!resolveModal}
        onClose={() => setResolveModal(null)}
        title="Resolve Dispute"
        size="md"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setResolveModal(null)}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={handleResolve} isLoading={resolving}>Resolve</Button>
          </div>
        }
      >
        {resolveModal && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#f7f4f1' }}>
              <p className="text-sm font-medium" style={{ color: '#111110' }}>{resolveModal.project?.title}</p>
              <p className="text-sm mt-1" style={{ color: '#6b6762' }}>{resolveModal.reason}</p>
              {resolveModal.description && <p className="text-xs mt-1" style={{ color: '#9a9590' }}>{resolveModal.description}</p>}
            </div>
            <Select
              label="Resolution"
              value={resolveForm.status}
              onChange={(e) => setResolveForm(f => ({ ...f, status: e.target.value }))}
            >
              <option value="resolved_for_client">Resolve for Client</option>
              <option value="resolved_for_freelancer">Resolve for Freelancer</option>
              <option value="closed">Close (No Action)</option>
            </Select>
            <Textarea
              label="Admin Notes"
              placeholder="Explain your decision..."
              value={resolveForm.adminNotes}
              onChange={(e) => setResolveForm(f => ({ ...f, adminNotes: e.target.value }))}
              rows={3}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDisputes;
