import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { formatDate, getStatusColor, formatStatusLabel } from '../../utils/helpers';
import { ScaleIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input, { Textarea } from '../../components/ui/Input';
import api from '../../services/api';
import Footer from '../../components/layout/Footer';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const DisputePage = () => {
  const { user } = useSelector((s) => s.auth);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ projectId: '', reason: '', description: '' });

  useEffect(() => {
    api.get('/disputes').then(r => { setDisputes(r.data.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await api.post('/disputes', form);
      setDisputes(prev => [data.data, ...prev]);
      setShowCreate(false);
      setForm({ projectId: '', reason: '', description: '' });
      toast.success('Dispute raised successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to raise dispute');
    } finally { setCreating(false); }
  };

  const statusTimeline = (status) => {
    const steps = ['open', 'under_review', 'resolved_for_client', 'closed'];
    const idx = steps.indexOf(status);
    return steps.map((s, i) => ({ label: formatStatusLabel(s), done: i <= idx }));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFCFB' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ScaleIcon className="w-8 h-8" style={{ color: '#EA6C2A' }} />
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#111110' }}>Disputes</h1>
              <p className="text-sm" style={{ color: '#9a9590' }}>{disputes.length} total disputes</p>
            </div>
          </div>
          <Button onClick={() => setShowCreate(true)} variant="danger">Raise a Dispute</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : disputes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">⚖️</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#111110' }}>No disputes</h3>
            <p style={{ color: '#9a9590' }}>Hopefully it stays that way! All disputes will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map(dispute => (
              <div key={dispute._id} className="card">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="font-semibold" style={{ color: '#111110' }}>{dispute.project?.title || 'Project'}</p>
                    <p className="text-sm mt-0.5" style={{ color: '#6b6762' }}>{dispute.reason}</p>
                    <p className="text-xs mt-1" style={{ color: '#9a9590' }}>{formatDate(dispute.createdAt)}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getStatusColor(dispute.status)}`}>
                    {formatStatusLabel(dispute.status)}
                  </span>
                </div>

                {dispute.description && (
                  <p className="text-sm mb-4 p-3 rounded-xl" style={{ backgroundColor: '#f7f4f1', color: '#6b6762' }}>{dispute.description}</p>
                )}

                {/* Status Timeline */}
                <div className="flex items-center gap-2">
                  {statusTimeline(dispute.status).map((step, i) => (
                    <React.Fragment key={i}>
                      <div className="flex items-center gap-1.5" style={{ color: step.done ? '#16a34a' : '#d0cbc5' }}>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: step.done ? '#16a34a' : '#e8e4df' }} />
                        <span className="text-xs hidden sm:block">{step.label}</span>
                      </div>
                      {i < 3 && <div className="flex-1 h-px" style={{ backgroundColor: step.done ? 'rgba(22,163,74,0.3)' : '#e8e4df' }} />}
                    </React.Fragment>
                  ))}
                </div>

                {dispute.adminNotes && (
                  <div className="mt-3 p-3 rounded-xl" style={{ backgroundColor: '#fff3ec', border: '1px solid rgba(234,108,42,0.2)' }}>
                    <p className="text-xs font-medium mb-1" style={{ color: '#EA6C2A' }}>Admin Decision</p>
                    <p className="text-sm" style={{ color: '#6b6762' }}>{dispute.adminNotes}</p>
                  </div>
                )}

                {dispute.evidence?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {dispute.evidence.map((e, i) => (
                      <a key={i} href={e.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs transition-colors" style={{ color: '#EA6C2A' }}>
                        <PaperClipIcon className="w-3.5 h-3.5" /> {e.description || `Evidence ${i + 1}`}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Dispute Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Raise a Dispute" size="md"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="danger" className="flex-1" onClick={handleCreate} isLoading={creating}>Raise Dispute</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input label="Project ID" required value={form.projectId} onChange={(e) => setForm(f => ({ ...f, projectId: e.target.value }))} placeholder="Enter project ID" hint="You can find the project ID in the URL of the project page" />
          <Input label="Reason" required value={form.reason} onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Brief reason for the dispute" />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the issue in detail..." rows={4} />
          <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: '#fff8f5', border: '1px solid rgba(234,108,42,0.2)', color: '#EA6C2A' }}>
            ⚠️ Disputes are reviewed by our team within 48 hours. Provide as much detail as possible.
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
};

export default DisputePage;
