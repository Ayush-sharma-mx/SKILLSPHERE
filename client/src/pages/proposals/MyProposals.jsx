import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyProposals } from '../../features/proposal/proposalSlice';
import ProposalCard from '../../components/proposal/ProposalCard';
import { SkeletonCard } from '../../components/ui/LoadingSpinner';
import Footer from '../../components/layout/Footer';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'withdrawn', label: 'Withdrawn' },
];

const MyProposals = () => {
  const dispatch = useDispatch();
  const { myProposals, isLoading } = useSelector((s) => s.proposal);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => { dispatch(fetchMyProposals()); }, []);

  const filtered = activeTab === 'all' ? myProposals : myProposals.filter(p => p.status === activeTab);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFCFB' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-2">
          <DocumentTextIcon className="w-8 h-8" style={{ color: '#EA6C2A' }} />
          <h1 className="text-3xl font-bold" style={{ color: '#111110' }}>My Proposals</h1>
        </div>
        <p className="mb-6" style={{ color: '#9a9590' }}>{myProposals.length} total proposals submitted</p>

        {/* Tabs */}
        <div className="flex gap-1 mb-6" style={{ borderBottom: '1px solid #e8e4df' }}>
          {TABS.map(tab => {
            const count = tab.id === 'all' ? myProposals.length : myProposals.filter(p => p.status === tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2"
                style={{
                  borderColor: activeTab === tab.id ? '#EA6C2A' : 'transparent',
                  color: activeTab === tab.id ? '#EA6C2A' : '#9a9590',
                }}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: activeTab === tab.id ? '#fff3ec' : '#f7f4f1',
                      color: activeTab === tab.id ? '#EA6C2A' : '#9a9590',
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="space-y-4">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#111110' }}>No proposals {activeTab !== 'all' ? `with status "${activeTab}"` : 'yet'}</h3>
            <p style={{ color: '#9a9590' }}>Browse projects to find opportunities</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(p => (
              <ProposalCard key={p._id} proposal={p} projectClientId={p.project?.client} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyProposals;
