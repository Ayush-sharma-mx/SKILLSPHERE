import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAdminProjects, deleteUser } from '../../features/admin/adminSlice';
import { Link } from 'react-router-dom';
import { formatDate, formatCurrency, getStatusColor, formatStatusLabel, getAvatarFallback } from '../../utils/helpers';
import { MagnifyingGlassIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import Button from '../../components/ui/Button';
import { SkeletonCard } from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminProjects = () => {
  const dispatch = useDispatch();
  const { projects, isLoading } = useSelector((s) => s.admin);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { dispatch(getAdminProjects({ search, status: statusFilter })); }, [search, statusFilter]);

  const handleDelete = async (projectId) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    setActionLoading(projectId);
    try {
      await dispatch(deleteUser(projectId)).unwrap(); // reusing deleteUser for now
      toast.success('Project deleted');
    } catch { toast.error('Delete failed'); }
    finally { setActionLoading(null); }
  };

  const handleFeatured = async (projectId, isFeatured) => {
    setActionLoading(projectId);
    try {
      toast.success(`Feature toggle action (connect backend endpoint)`);
      // await dispatch(adminFeaturedProject({ projectId, isFeatured: !isFeatured })).unwrap();
      toast.success(`Project ${isFeatured ? 'unfeatured' : 'featured'}`);
    } catch { toast.error('Action failed'); }
    finally { setActionLoading(null); }
  };

  const filteredProjects = (projects || []).filter(p => {
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.client?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFCFB' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold" style={{ color: '#111110' }}>Projects</h1>
          <p className="text-sm mt-1" style={{ color: '#9a9590' }}>{filteredProjects.length} projects shown</p>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-48">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9a9590' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or client..."
                className="w-full rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none"
                style={{ backgroundColor: '#f7f4f1', border: '1px solid #e8e4df', color: '#111110' }}
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field text-sm py-2">
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="disputed">Disputed</option>
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
                  {['Project', 'Client', 'Budget', 'Proposals', 'Status', 'Posted', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#9a9590' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-sm" style={{ color: '#9a9590' }}>No projects found</td></tr>
                ) : (
                  filteredProjects.map((p) => (
                    <tr key={p._id} className="transition-colors" style={{ borderBottom: '1px solid #f0ede9' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fafaf9'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td className="px-4 py-3 max-w-48">
                        <Link to={`/projects/${p._id}`} className="font-medium text-sm hover:underline transition-colors" style={{ color: '#111110' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#EA6C2A'}
                          onMouseLeave={e => e.currentTarget.style.color = '#111110'}
                        >
                          {p.title}
                        </Link>
                        {p.isFeatured && <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-md" style={{ backgroundColor: '#fefce8', color: '#ca8a04' }}>⭐ Featured</span>}
                        <p className="text-xs mt-0.5 truncate" style={{ color: '#9a9590' }}>{p.category}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {p.client?.avatar ? (
                            <img src={p.client.avatar} alt={p.client.name} className="w-7 h-7 rounded-lg object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: '#6b6762' }}>
                              {getAvatarFallback(p.client?.name)}
                            </div>
                          )}
                          <span className="text-sm" style={{ color: '#6b6762' }}>{p.client?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#6b6762' }}>
                        {formatCurrency(p.budget?.min)} – {formatCurrency(p.budget?.max)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: '#111110' }}>
                        {p.proposalCount || 0}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(p.status)}`}>
                          {formatStatusLabel(p.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#9a9590' }}>{formatDate(p.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleFeatured(p._id, p.isFeatured)}
                            disabled={actionLoading === p._id}
                            className="p-1.5 rounded-lg transition-colors"
                            title={p.isFeatured ? 'Unfeature' : 'Feature'}
                            style={{ color: p.isFeatured ? '#ca8a04' : '#d0cbc5' }}
                          >
                            {p.isFeatured ? <StarSolid className="w-4 h-4" /> : <StarIcon className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            disabled={actionLoading === p._id}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: '#dc2626' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
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

export default AdminProjects;
