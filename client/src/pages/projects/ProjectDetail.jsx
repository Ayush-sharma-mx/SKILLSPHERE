import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjectById, updateMilestone } from '../../features/project/projectSlice';
import { fetchProjectProposals, submitProposal } from '../../features/proposal/proposalSlice';
import ProposalCard from '../../components/proposal/ProposalCard';
import MilestoneTracker from '../../components/project/MilestoneTracker';
import AIRecommendationPanel from '../../components/freelancer/AIRecommendationPanel';
import PaymentModal from '../../components/payment/PaymentModal';
import ReviewModal from '../../components/review/ReviewModal';
import { getAvatarFallback, formatCurrency, formatDate, formatRelativeTime, getStatusColor, formatStatusLabel } from '../../utils/helpers';
import { MapPinIcon, CalendarIcon, UserGroupIcon, CurrencyRupeeIcon, PaperClipIcon, EyeIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { CheckBadgeIcon, SparklesIcon } from '@heroicons/react/24/solid';
import Input, { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Footer from '../../components/layout/Footer';
import toast from 'react-hot-toast';

const ProjectDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProject, isLoading } = useSelector((s) => s.project);
  const { proposals } = useSelector((s) => s.proposal);
  const { user, isAuthenticated } = useSelector((s) => s.auth);

  const [activeTab, setActiveTab] = useState('details');
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [paymentModal, setPaymentModal] = useState({ open: false, milestoneIndex: null, milestone: null });
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [proposalData, setProposalData] = useState({ coverLetter: '', bidAmount: '', estimatedDays: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchProjectById(id));
    if (isAuthenticated) dispatch(fetchProjectProposals(id));
  }, [id, isAuthenticated]);

  const isClient = user?._id === (currentProject?.client?._id || currentProject?.client);
  const isFreelancer = user?.role === 'freelancer';
  const hasApplied = proposals.some(p => (p.freelancer?._id || p.freelancer) === user?._id);
  const isHiredFreelancer = user?._id === (currentProject?.hiredFreelancer?._id || currentProject?.hiredFreelancer);

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    if (!proposalData.coverLetter || !proposalData.bidAmount || !proposalData.estimatedDays) {
      toast.error('Please fill all fields'); return;
    }
    setSubmitting(true);
    try {
      await dispatch(submitProposal({ project: id, ...proposalData, bidAmount: Number(proposalData.bidAmount), estimatedDays: Number(proposalData.estimatedDays) })).unwrap();
      toast.success('Proposal submitted successfully!');
      setShowProposalForm(false);
    } catch (err) { toast.error(err); }
    finally { setSubmitting(false); }
  };

  if (isLoading && !currentProject) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FDFCFB' }}><LoadingSpinner size="lg" /></div>;
  if (!currentProject) return <div className="min-h-screen flex items-center justify-center" style={{ color: '#9a9590', backgroundColor: '#FDFCFB' }}>Project not found</div>;

  const p = currentProject;
  const client = p.client;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFCFB' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="text-sm mb-6 flex items-center gap-1 transition-colors" style={{ color: '#9a9590' }}
          onMouseEnter={e => e.currentTarget.style.color = '#111110'}
          onMouseLeave={e => e.currentTarget.style.color = '#9a9590'}
        >
          ← Back to Projects
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Header */}
            <div className="card">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <Badge variant={p.status === 'open' ? 'success' : p.status === 'in_progress' ? 'info' : 'default'}>
                      {formatStatusLabel(p.status)}
                    </Badge>
                    {p.category && <Badge variant="default">{p.category}</Badge>}
                    {p.isRemote && <Badge variant="info">Remote</Badge>}
                  </div>
                  <h1 className="text-2xl font-bold" style={{ color: '#111110' }}>{p.title}</h1>
                  <div className="flex items-center gap-4 mt-2 text-sm" style={{ color: '#9a9590' }}>
                    <span className="flex items-center gap-1"><EyeIcon className="w-4 h-4" />{p.viewCount || 0} views</span>
                    <span>{formatRelativeTime(p.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl mb-4" style={{ backgroundColor: '#f7f4f1' }}>
                <div>
                  <p className="text-xs mb-1" style={{ color: '#9a9590' }}>Budget</p>
                  <p className="font-semibold text-sm" style={{ color: '#111110' }}>{formatCurrency(p.budget?.min)} – {formatCurrency(p.budget?.max)}</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: '#9a9590' }}>Duration</p>
                  <p className="font-semibold text-sm capitalize" style={{ color: '#111110' }}>{p.duration?.replace(/_/g, ' ') || 'Flexible'}</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: '#9a9590' }}>Experience</p>
                  <p className="font-semibold text-sm capitalize" style={{ color: '#111110' }}>{p.experienceLevel}</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: '#9a9590' }}>Proposals</p>
                  <p className="font-semibold text-sm" style={{ color: '#111110' }}>{p.proposalCount || 0}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2" style={{ color: '#111110' }}>Project Description</h3>
                <p className="leading-relaxed whitespace-pre-wrap" style={{ color: '#6b6762' }}>{p.description}</p>
              </div>

              {/* Skills */}
              {p.requiredSkills?.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2" style={{ color: '#111110' }}>Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {p.requiredSkills.map((s, i) => (
                      <span key={i} className="px-3 py-1 text-sm rounded-lg" style={{ backgroundColor: '#fff3ec', border: '1px solid rgba(234,108,42,0.2)', color: '#EA6C2A' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {p.attachments?.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2" style={{ color: '#111110' }}>Attachments</h3>
                  {p.attachments.map((att, i) => (
                    <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm transition-colors" style={{ color: '#EA6C2A' }}>
                      <PaperClipIcon className="w-4 h-4" /> {att.name}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div style={{ borderBottom: '1px solid #e8e4df' }}>
              <div className="flex gap-1">
                {[
                  { id: 'details', label: 'Milestones' },
                  { id: 'proposals', label: `Proposals (${proposals.length})`, show: isClient || isHiredFreelancer },
                  { id: 'ai', label: '✨ AI Matches', show: isClient },
                ].filter(t => t.show !== false).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
                    style={{
                      borderColor: activeTab === tab.id ? '#EA6C2A' : 'transparent',
                      color: activeTab === tab.id ? '#EA6C2A' : '#9a9590',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'details' && (
              <div>
                {p.milestones?.length > 0 ? (
                  <MilestoneTracker
                    project={p}
                    onPayMilestone={(index, milestone) => setPaymentModal({ open: true, milestoneIndex: index, milestone })}
                  />
                ) : (
                  <div className="card text-center py-8 text-sm" style={{ color: '#9a9590' }}>No milestones defined</div>
                )}
              </div>
            )}

            {activeTab === 'proposals' && isClient && (
              <div className="space-y-4">
                {proposals.length === 0 ? (
                  <div className="card text-center py-8 text-sm" style={{ color: '#9a9590' }}>No proposals yet</div>
                ) : (
                  proposals.map(prop => <ProposalCard key={prop._id} proposal={prop} projectClientId={p.client?._id || p.client} />)
                )}
              </div>
            )}

            {activeTab === 'ai' && isClient && (
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <SparklesIcon className="w-5 h-5" style={{ color: '#EA6C2A' }} />
                  <h3 className="font-bold" style={{ color: '#111110' }}>AI-Powered Freelancer Matches</h3>
                </div>
                <AIRecommendationPanel projectId={id} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Info */}
            {client && (
              <div className="card">
                <h3 className="font-semibold mb-4" style={{ color: '#111110' }}>About the Client</h3>
                <div className="flex items-center gap-3 mb-4">
                  {client.avatar ? (
                    <img src={client.avatar} alt={client.name} className="w-12 h-12 rounded-xl object-cover" style={{ border: '1px solid #e8e4df' }} />
                  ) : (
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, #6b6762, #9a9590)', border: '1px solid #e8e4df' }}>
                      {getAvatarFallback(client.name)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold" style={{ color: '#111110' }}>{client.name}</p>
                    <p className="text-xs" style={{ color: '#9a9590' }}>Client</p>
                  </div>
                </div>
                {p.location?.city && (
                  <div className="flex items-center gap-1.5 text-sm" style={{ color: '#9a9590' }}>
                    <MapPinIcon className="w-4 h-4" />
                    <span>{p.location.city}, {p.location.state}</span>
                  </div>
                )}
              </div>
            )}

            {/* Apply / Status */}
            {isAuthenticated && !isClient && p.status === 'open' && (
              <div className="card">
                {hasApplied ? (
                  <div className="text-center">
                    <div className="text-3xl mb-2">✅</div>
                    <p className="font-medium" style={{ color: '#111110' }}>Proposal Submitted</p>
                    <p className="text-sm mt-1" style={{ color: '#9a9590' }}>You've already applied to this project</p>
                    <Link to="/proposals" className="btn-secondary text-sm mt-3 block text-center">View My Proposals</Link>
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold mb-3" style={{ color: '#111110' }}>Submit a Proposal</h3>
                    {!showProposalForm ? (
                      <Button className="w-full" onClick={() => setShowProposalForm(true)}>Apply for this Project</Button>
                    ) : (
                      <form onSubmit={handleSubmitProposal} className="space-y-4">
                        <Textarea label="Cover Letter" required placeholder="Why are you the best fit for this project?" value={proposalData.coverLetter} onChange={(e) => setProposalData(d => ({ ...d, coverLetter: e.target.value }))} rows={4} />
                        <Input label="Bid Amount (₹)" type="number" required placeholder={`${p.budget?.min}–${p.budget?.max}`} value={proposalData.bidAmount} onChange={(e) => setProposalData(d => ({ ...d, bidAmount: e.target.value }))} />
                        <Input label="Estimated Days" type="number" required placeholder="30" value={proposalData.estimatedDays} onChange={(e) => setProposalData(d => ({ ...d, estimatedDays: e.target.value }))} />
                        <div className="flex gap-2">
                          <Button variant="secondary" onClick={() => setShowProposalForm(false)} className="flex-1">Cancel</Button>
                          <Button type="submit" isLoading={submitting} className="flex-1">Submit Proposal</Button>
                        </div>
                      </form>
                    )}
                  </>
                )}
              </div>
            )}

            {!isAuthenticated && (
              <div className="card text-center">
                <div className="text-3xl mb-2">🔐</div>
                <p className="font-medium mb-1" style={{ color: '#111110' }}>Login to Apply</p>
                <p className="text-sm mb-3" style={{ color: '#9a9590' }}>Create an account to submit proposals</p>
                <Link to="/register" className="btn-primary text-sm block">Get Started Free</Link>
              </div>
            )}

            {/* Completed Project Review CTA */}
            {isClient && p.status === 'completed' && p.hiredFreelancer && (
              <div className="card text-center bg-[#fff8f4] border border-[#EA6C2A]/30">
                <div className="text-3xl mb-2">🏆</div>
                <h3 className="font-bold text-[#111110] mb-1">Project Completed!</h3>
                <p className="text-xs text-[#9a9590] mb-3">Rate your experience working with the freelancer to build their reputation.</p>
                <Button onClick={() => setReviewModalOpen(true)} className="w-full">Leave a Review ⭐</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModal.open && (
        <PaymentModal
          isOpen={paymentModal.open}
          onClose={() => setPaymentModal({ open: false, milestoneIndex: null, milestone: null })}
          project={currentProject}
          milestoneIndex={paymentModal.milestoneIndex}
          milestone={paymentModal.milestone}
          onSuccess={() => dispatch(fetchProjectById(id))}
        />
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        project={currentProject}
        onSuccess={() => dispatch(fetchProjectById(id))}
      />

      <Footer />
    </div>
  );
};

export default ProjectDetail;
