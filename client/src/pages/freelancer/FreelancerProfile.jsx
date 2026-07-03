import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFreelancerById } from '../../features/freelancer/freelancerSlice';
import { getOrCreateConversation } from '../../features/chat/chatSlice';
import ReviewCard from '../../components/review/ReviewCard';
import SkillBadge from '../../components/freelancer/SkillBadge';
import StarRating from '../../components/ui/StarRating';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { getAvatarFallback, formatCurrency, formatDate, getBadgeIcon } from '../../utils/helpers';
import { MapPinIcon, CheckBadgeIcon, GlobeAltIcon, DocumentTextIcon, BriefcaseIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { StarIcon, CurrencyRupeeIcon } from '@heroicons/react/24/solid';
import api from '../../services/api';
import Footer from '../../components/layout/Footer';
import toast from 'react-hot-toast';

const FreelancerProfile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentFreelancer, isLoading } = useSelector((s) => s.freelancer);
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('about');
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    dispatch(fetchFreelancerById(id));
    api.get(`/reviews/${id}`).then(r => setReviews(r.data.data || [])).catch(() => {});
  }, [id]);

  const handleHire = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    navigate('/projects/create');
  };

  const handleMessage = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setStartingChat(true);
    try {
      const result = await dispatch(getOrCreateConversation({ participantId: id })).unwrap();
      navigate('/chat');
    } catch (err) { toast.error('Failed to start conversation'); }
    finally { setStartingChat(false); }
  };

  if (isLoading && !currentFreelancer) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FDFCFB' }}><LoadingSpinner size="lg" /></div>;
  if (!currentFreelancer) return <div className="min-h-screen flex items-center justify-center" style={{ color: '#9a9590', backgroundColor: '#FDFCFB' }}>Freelancer not found</div>;

  const profile = currentFreelancer.freelancerProfile || currentFreelancer;
  const u = currentFreelancer.user || currentFreelancer;
  const isOwnProfile = user?._id === (u._id || id);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFCFB' }}>
      {/* Cover */}
      <div className="h-40 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #fff3ec 0%, #fef9f5 50%, #fff3ec 100%)' }}>
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(234,108,42,0.05) 1px, transparent 1px), linear-gradient(to right, rgba(234,108,42,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-16 mb-8">
          <div className="relative">
            {u.avatar ? (
              <img src={u.avatar} alt={u.name} className="w-28 h-28 rounded-2xl object-cover shadow-xl" style={{ border: '4px solid #FDFCFB' }} />
            ) : (
              <div className="w-28 h-28 rounded-2xl flex items-center justify-center text-4xl font-black text-white shadow-xl" style={{ background: 'linear-gradient(135deg, #EA6C2A, #f59e42)', border: '4px solid #FDFCFB' }}>
                {getAvatarFallback(u.name)}
              </div>
            )}
            {profile.isVerified && (
              <CheckBadgeIcon className="w-7 h-7 absolute -bottom-2 -right-2 rounded-full p-0.5" style={{ color: '#EA6C2A', backgroundColor: '#FDFCFB' }} />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl font-black" style={{ color: '#111110' }}>{u.name}</h1>
              {profile.verificationBadge !== 'none' && (
                <span className="text-2xl">{getBadgeIcon(profile.verificationBadge)}</span>
              )}
            </div>
            <p className="text-lg font-medium mt-1" style={{ color: '#EA6C2A' }}>{profile.title || 'Freelancer'}</p>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              {profile.location?.city && (
                <div className="flex items-center gap-1.5 text-sm" style={{ color: '#9a9590' }}>
                  <MapPinIcon className="w-4 h-4" />
                  <span>{profile.location.city}, {profile.location.state || profile.location.country}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <StarIcon className="w-4 h-4 text-yellow-400" />
                <span className="font-semibold" style={{ color: '#111110' }}>{profile.averageRating?.toFixed(1) || '0.0'}</span>
                <span className="text-sm" style={{ color: '#9a9590' }}>({profile.totalReviews || 0} reviews)</span>
              </div>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-medium border"
                style={
                  profile.availability === 'available'
                    ? { backgroundColor: '#f0fdf4', color: '#16a34a', borderColor: 'rgba(22,163,74,0.3)' }
                    : profile.availability === 'busy'
                    ? { backgroundColor: '#fefce8', color: '#ca8a04', borderColor: 'rgba(202,138,4,0.3)' }
                    : { backgroundColor: '#fef2f2', color: '#dc2626', borderColor: 'rgba(220,38,38,0.3)' }
                }
              >
                {profile.availability === 'available' ? '● Available' : profile.availability === 'busy' ? '● Busy' : '● Unavailable'}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            {isOwnProfile ? (
              <Link to="/profile/edit" className="btn-secondary">Edit Profile</Link>
            ) : (
              <>
                <button onClick={handleMessage} disabled={startingChat} className="btn-secondary">
                  {startingChat ? '...' : '💬 Message'}
                </button>
                {user?.role === 'client' && (
                  <button onClick={handleHire} className="btn-primary">Hire Me</button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Hourly Rate', value: formatCurrency(profile.hourlyRate) + '/hr', color: '#16a34a' },
            { label: 'Completed Projects', value: profile.completedProjects || 0, color: '#EA6C2A' },
            { label: 'Total Earned', value: formatCurrency(profile.totalEarnings), color: '#7c3aed' },
            { label: 'Rating', value: `${profile.averageRating?.toFixed(1) || '—'} ★`, color: '#ca8a04' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card text-center">
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: '#9a9590' }}>{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="mb-6" style={{ borderBottom: '1px solid #e8e4df' }}>
              <div className="flex gap-1">
                {['about', 'portfolio', 'experience', 'reviews'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors"
                    style={{
                      borderColor: activeTab === tab ? '#EA6C2A' : 'transparent',
                      color: activeTab === tab ? '#EA6C2A' : '#9a9590',
                    }}
                  >
                    {tab} {tab === 'reviews' && `(${reviews.length})`}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'about' && (
              <div className="space-y-6">
                {profile.bio && (
                  <div className="card">
                    <h2 className="font-bold mb-3" style={{ color: '#111110' }}>About</h2>
                    <p className="leading-relaxed" style={{ color: '#6b6762' }}>{profile.bio}</p>
                  </div>
                )}
                <div className="card">
                  <h2 className="font-bold mb-3" style={{ color: '#111110' }}>Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {(profile.skills || []).map((skill, i) => (
                      <SkillBadge key={i} skill={skill} showLevel={true} />
                    ))}
                    {(!profile.skills || profile.skills.length === 0) && (
                      <p className="text-sm" style={{ color: '#9a9590' }}>No skills listed</p>
                    )}
                  </div>
                </div>
                {profile.languages?.length > 0 && (
                  <div className="card">
                    <h2 className="font-bold mb-3" style={{ color: '#111110' }}>Languages</h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((l, i) => (
                        <span key={i} className="px-3 py-1 text-sm rounded-lg" style={{ backgroundColor: '#f7f4f1', border: '1px solid #e8e4df', color: '#6b6762' }}>
                          {l.language} • <span className="capitalize" style={{ color: '#9a9590' }}>{l.proficiency}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'portfolio' && (
              <div className="space-y-4">
                {(profile.portfolio || []).length === 0 ? (
                  <div className="card text-center py-12 text-sm" style={{ color: '#9a9590' }}>No portfolio items yet</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.portfolio.map((item, i) => (
                      <div key={i} className="card group overflow-hidden">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover rounded-xl mb-3 group-hover:scale-105 transition-transform duration-300" />
                        )}
                        <h3 className="font-semibold" style={{ color: '#111110' }}>{item.title}</h3>
                        {item.description && <p className="text-sm mt-1" style={{ color: '#9a9590' }}>{item.description}</p>}
                        {item.projectUrl && (
                          <a href={item.projectUrl} target="_blank" rel="noopener noreferrer" className="text-xs mt-2 block font-medium" style={{ color: '#EA6C2A' }}>View Project →</a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="space-y-4">
                {(profile.experience || []).length > 0 && (
                  <div className="card">
                    <h2 className="font-bold mb-4" style={{ color: '#111110' }}>Work Experience</h2>
                    <div className="space-y-4">
                      {profile.experience.map((exp, i) => (
                        <div key={i} className="flex gap-4 pb-4 last:border-0" style={{ borderBottom: '1px solid #f0ede9' }}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fff3ec' }}>
                            <BriefcaseIcon className="w-5 h-5" style={{ color: '#EA6C2A' }} />
                          </div>
                          <div>
                            <p className="font-semibold" style={{ color: '#111110' }}>{exp.role}</p>
                            <p className="text-sm" style={{ color: '#9a9590' }}>{exp.company}</p>
                            <p className="text-xs mt-0.5" style={{ color: '#d0cbc5' }}>{formatDate(exp.from)} – {exp.current ? 'Present' : formatDate(exp.to)}</p>
                            {exp.description && <p className="text-sm mt-1" style={{ color: '#6b6762' }}>{exp.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(profile.education || []).length > 0 && (
                  <div className="card">
                    <h2 className="font-bold mb-4" style={{ color: '#111110' }}>Education</h2>
                    <div className="space-y-4">
                      {profile.education.map((edu, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f5f3ff' }}>
                            <AcademicCapIcon className="w-5 h-5" style={{ color: '#7c3aed' }} />
                          </div>
                          <div>
                            <p className="font-semibold" style={{ color: '#111110' }}>{edu.degree} in {edu.field}</p>
                            <p className="text-sm" style={{ color: '#9a9590' }}>{edu.institution}</p>
                            <p className="text-xs mt-0.5" style={{ color: '#d0cbc5' }}>{formatDate(edu.from)} – {formatDate(edu.to)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(profile.certifications || []).length > 0 && (
                  <div className="card">
                    <h2 className="font-bold mb-4" style={{ color: '#111110' }}>Certifications</h2>
                    <div className="space-y-3">
                      {profile.certifications.map((cert, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#f7f4f1' }}>
                          <span className="text-xl">🏆</span>
                          <div>
                            <p className="font-medium text-sm" style={{ color: '#111110' }}>{cert.name}</p>
                            <p className="text-xs" style={{ color: '#9a9590' }}>{cert.issuer} • {cert.year}</p>
                          </div>
                          {cert.url && <a href={cert.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs font-medium" style={{ color: '#EA6C2A' }}>View</a>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="card text-center py-12">
                    <div className="text-4xl mb-3">⭐</div>
                    <p className="font-medium" style={{ color: '#6b6762' }}>No reviews yet</p>
                    <p className="text-sm mt-1" style={{ color: '#9a9590' }}>Be the first to work with this freelancer</p>
                  </div>
                ) : (
                  reviews.map((review) => <ReviewCard key={review._id} review={review} />)
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="font-bold mb-4" style={{ color: '#111110' }}>Quick Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: '#9a9590' }}>Hourly Rate</span>
                  <span className="font-semibold" style={{ color: '#111110' }}>{formatCurrency(profile.hourlyRate)}/hr</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#9a9590' }}>Availability</span>
                  <span className="font-medium capitalize" style={{ color: profile.availability === 'available' ? '#16a34a' : profile.availability === 'busy' ? '#ca8a04' : '#dc2626' }}>
                    {profile.availability?.replace('_', ' ')}
                  </span>
                </div>
                {profile.availableFrom && (
                  <div className="flex justify-between">
                    <span style={{ color: '#9a9590' }}>Available From</span>
                    <span style={{ color: '#111110' }}>{formatDate(profile.availableFrom)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span style={{ color: '#9a9590' }}>Badge</span>
                  <span>{getBadgeIcon(profile.verificationBadge)} {profile.verificationBadge || 'None'}</span>
                </div>
              </div>
              {profile.resumeUrl && (
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 mt-4 p-3 rounded-xl text-sm font-medium transition-all"
                  style={{ backgroundColor: '#f7f4f1', border: '1px solid #e8e4df', color: '#EA6C2A' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#EA6C2A'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#e8e4df'}
                >
                  <DocumentTextIcon className="w-4 h-4" /> Download Resume
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-16"><Footer /></div>
    </div>
  );
};

export default FreelancerProfile;
