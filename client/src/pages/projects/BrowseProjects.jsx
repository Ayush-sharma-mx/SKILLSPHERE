import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects } from '../../features/project/projectSlice';
import ProjectCard from '../../components/project/ProjectCard';
import { SkeletonCard } from '../../components/ui/LoadingSpinner';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { CATEGORIES, DURATION_OPTIONS, EXPERIENCE_LEVELS } from '../../utils/constants';
import { debounce } from '../../utils/helpers';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const inputStyle = {
  background: 'white',
  border: '1px solid #e4e0db',
  color: '#111110',
  borderRadius: '10px',
  padding: '8px 12px',
  fontSize: '0.875rem',
  outline: 'none',
  transition: 'border-color 0.15s',
  width: '100%',
};

const BrowseProjects = () => {
  const dispatch = useDispatch();
  const { projects, isLoading, pagination } = useSelector((s) => s.project);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', minBudget: '', maxBudget: '', duration: '', experienceLevel: '', skills: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);

  const loadProjects = () => {
    const params = {
      page, sort,
      ...(search && { search }),
      ...(filters.category && { category: filters.category }),
      ...(filters.minBudget && { minBudget: filters.minBudget }),
      ...(filters.maxBudget && { maxBudget: filters.maxBudget }),
      ...(filters.duration && { duration: filters.duration }),
      ...(filters.experienceLevel && { experienceLevel: filters.experienceLevel }),
      ...(filters.skills && { skills: filters.skills }),
    };
    dispatch(fetchProjects(params));
  };

  useEffect(() => { loadProjects(); }, [page, sort, filters]);

  const debouncedSearch = debounce((val) => { setSearch(val); setPage(1); }, 400);
  const clearFilters = () => { setFilters({ category: '', minBudget: '', maxBudget: '', duration: '', experienceLevel: '', skills: '' }); setSearch(''); setPage(1); };
  const hasFilters = Object.values(filters).some(Boolean) || search;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFCFB' }}>
      <Navbar />

      {/* Page Header */}
      <div className="border-b" style={{ borderColor: '#e8e4df', background: 'linear-gradient(to bottom, #f7f4f1, #FDFCFB)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-1">
            <span className="pill-badge mb-4 inline-flex">🔍 Browse Projects</span>
          </div>
          <h1 className="font-black mb-2" style={{ color: '#111110', fontSize: '2rem', letterSpacing: '-0.03em' }}>
            Find your next <span style={{ color: '#EA6C2A' }}>opportunity</span>
          </h1>
          <p style={{ color: '#9a9590' }}>
            {pagination.total || 0} projects available across all categories
          </p>

          {/* Search + Controls */}
          <div className="flex gap-3 mt-7">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#b5afa9' }} />
              <input
                type="text"
                placeholder="Search projects by title or skills..."
                defaultValue={search}
                onChange={(e) => debouncedSearch(e.target.value)}
                className="input-field pl-11"
                id="project-search"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 border rounded-xl text-sm font-semibold transition-all"
              style={{
                background: showFilters ? '#EA6C2A' : 'white',
                borderColor: showFilters ? '#EA6C2A' : '#e4e0db',
                color: showFilters ? 'white' : '#6b6762',
              }}
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              Filters
              {hasFilters && <span className="w-2 h-2 rounded-full" style={{ background: showFilters ? 'white' : '#EA6C2A' }} />}
            </button>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="input-field"
              style={{ width: 'auto', paddingRight: '2rem' }}
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="-budget.max">Highest Budget</option>
              <option value="budget.min">Lowest Budget</option>
              <option value="-proposalCount">Most Proposals</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white border rounded-2xl p-6 mb-6 animate-fade-in" style={{ borderColor: '#e4e0db' }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-4 h-4" style={{ color: '#EA6C2A' }} />
                <h3 className="font-bold" style={{ color: '#111110' }}>Filter Projects</h3>
              </div>
              {hasFilters && (
                <button onClick={clearFilters} className="text-sm font-semibold flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors">
                  <XMarkIcon className="w-4 h-4" /> Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <select value={filters.category} onChange={(e) => { setFilters(f => ({ ...f, category: e.target.value })); setPage(1); }} style={inputStyle}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" placeholder="Min ₹" value={filters.minBudget} onChange={(e) => setFilters(f => ({ ...f, minBudget: e.target.value }))} style={inputStyle} />
              <input type="number" placeholder="Max ₹" value={filters.maxBudget} onChange={(e) => setFilters(f => ({ ...f, maxBudget: e.target.value }))} style={inputStyle} />
              <select value={filters.duration} onChange={(e) => setFilters(f => ({ ...f, duration: e.target.value }))} style={inputStyle}>
                <option value="">Any Duration</option>
                {DURATION_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
              <select value={filters.experienceLevel} onChange={(e) => setFilters(f => ({ ...f, experienceLevel: e.target.value }))} style={inputStyle}>
                <option value="">Any Level</option>
                {EXPERIENCE_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
              <input type="text" placeholder="Skills (comma-sep)" value={filters.skills} onChange={(e) => setFilters(f => ({ ...f, skills: e.target.value }))} style={inputStyle} />
            </div>
            <button onClick={loadProjects} className="btn-accent mt-5 text-sm px-6">Apply Filters</button>
          </div>
        )}

        {/* Results count */}
        {!isLoading && projects.length > 0 && (
          <p className="text-sm mb-5" style={{ color: '#9a9590' }}>
            Showing <strong style={{ color: '#111110' }}>{projects.length}</strong> of{' '}
            <strong style={{ color: '#111110' }}>{pagination.total}</strong> projects
          </p>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-5">🔍</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#111110' }}>No projects found</h3>
            <p className="mb-6" style={{ color: '#9a9590' }}>Try adjusting your filters or search terms</p>
            {hasFilters && <button onClick={clearFilters} className="btn-primary">Clear Filters</button>}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((project) => <ProjectCard key={project._id} project={project} />)}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 bg-white border rounded-xl text-sm font-semibold disabled:opacity-40 transition-all hover:border-[#ccc8c3] hover:-translate-y-0.5"
                  style={{ borderColor: '#e4e0db', color: '#6b6762' }}
                >← Prev</button>
                <span className="px-4 py-2 text-sm font-medium" style={{ color: '#9a9590' }}>
                  Page {page} of {pagination.pages}
                </span>
                <button
                  disabled={page === pagination.pages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 bg-white border rounded-xl text-sm font-semibold disabled:opacity-40 transition-all hover:border-[#ccc8c3] hover:-translate-y-0.5"
                  style={{ borderColor: '#e4e0db', color: '#6b6762' }}
                >Next →</button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BrowseProjects;
