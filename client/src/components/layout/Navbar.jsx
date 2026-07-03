import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../features/auth/authSlice';
import NotificationBell from '../ui/NotificationBell';
import {
  Bars3Icon, XMarkIcon, ChevronDownIcon,
  UserCircleIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { getAvatarFallback } from '../../utils/helpers';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((s) => s.auth);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await dispatch(logoutUser());
    toast.success('Signed out successfully');
    navigate('/');
  };

  const navLinks = [
    { to: '/projects', label: 'Browse Projects' },
    ...(isAuthenticated ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
    ...(user?.role === 'client' ? [{ to: '/projects/create', label: 'Post Project' }] : []),
    ...(user?.role === 'freelancer' ? [{ to: '/proposals', label: 'My Proposals' }] : []),
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin Panel' }] : []),
  ];

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <nav
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled || mobileOpen ? 'rgba(253,252,251,0.92)' : 'transparent',
        backdropFilter: scrolled || mobileOpen ? 'blur(16px)' : 'none',
        borderBottom: scrolled || mobileOpen ? '1px solid rgba(228,224,219,0.9)' : '1px solid transparent',
        boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-shadow group-hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #EA6C2A, #c9531a)' }}
            >
              <SparklesIcon className="w-4.5 h-4.5 text-white" style={{ width: '1.1rem', height: '1.1rem' }} />
            </div>
            <span className="text-xl font-black text-[#111110]">
              Skill<span style={{ color: '#EA6C2A' }}>Sphere</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  color: isActive(link.to) ? '#111110' : '#6b6762',
                  backgroundColor: isActive(link.to) ? '#f0ede9' : 'transparent',
                }}
                onMouseEnter={e => { if (!isActive(link.to)) e.target.style.color = '#111110'; }}
                onMouseLeave={e => { if (!isActive(link.to)) e.target.style.color = '#6b6762'; }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 py-1.5 pl-1.5 pr-3 rounded-xl transition-all duration-200"
                    style={{ background: userMenuOpen ? '#f0ede9' : 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0ede9'}
                    onMouseLeave={e => e.currentTarget.style.background = userMenuOpen ? '#f0ede9' : 'transparent'}
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-lg object-cover border border-[#e4e0db]" />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-sm"
                        style={{ background: 'linear-gradient(135deg, #EA6C2A, #c9531a)' }}
                      >
                        {getAvatarFallback(user?.name)}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-[#111110] max-w-[90px] truncate">{user?.name?.split(' ')[0]}</span>
                    <ChevronDownIcon className={`w-3.5 h-3.5 text-[#9a9590] transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div
                      className="absolute right-0 top-12 w-52 rounded-2xl shadow-xl z-50 overflow-hidden animate-scale-in border"
                      style={{ backgroundColor: '#FDFCFB', borderColor: '#e4e0db', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
                    >
                      <div className="px-4 py-3 border-b" style={{ borderColor: '#f0ede9' }}>
                        <p className="text-xs text-[#9a9590] mb-0.5">Signed in as</p>
                        <p className="text-sm font-semibold text-[#111110] truncate">{user?.email}</p>
                        <span
                          className="inline-flex items-center gap-1 mt-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full capitalize"
                          style={{ background: 'rgba(234,108,42,0.1)', color: '#EA6C2A' }}
                        >
                          {user?.role}
                        </span>
                      </div>
                      <div className="py-1.5">
                        {user?.role === 'freelancer' && (
                          <Link to="/profile/edit" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#6b6762] hover:text-[#111110] hover:bg-[#f7f4f1] transition-colors">
                            <UserCircleIcon className="w-4 h-4" /> Edit Profile
                          </Link>
                        )}
                        <Link to="/dashboard" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#6b6762] hover:text-[#111110] hover:bg-[#f7f4f1] transition-colors">
                          <Cog6ToothIcon className="w-4 h-4" /> Dashboard
                        </Link>
                        <div className="my-1 border-t" style={{ borderColor: '#f0ede9' }} />
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                          <ArrowRightOnRectangleIcon className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-[#6b6762] hover:text-[#111110] hover:bg-[#f0ede9] transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 text-white text-sm font-bold rounded-xl px-4 py-2 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.97]"
                  style={{ background: 'linear-gradient(135deg, #EA6C2A, #c9531a)', boxShadow: '0 4px 14px rgba(234,108,42,0.3)' }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-[#6b6762] hover:text-[#111110] hover:bg-[#f0ede9] transition-all"
          >
            {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t px-4 py-4 space-y-1 animate-slide-up"
          style={{ borderColor: '#e8e4df', backgroundColor: '#FDFCFB' }}
        >
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors"
              style={{
                color: isActive(link.to) ? '#111110' : '#6b6762',
                backgroundColor: isActive(link.to) ? '#f0ede9' : 'transparent',
              }}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t" style={{ borderColor: '#e8e4df' }}>
            {isAuthenticated ? (
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors">
                <ArrowRightOnRectangleIcon className="w-4 h-4" /> Sign Out
              </button>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link to="/login" className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-[#6b6762] bg-[#f0ede9] hover:bg-[#e8e4df] transition-all">Sign In</Link>
                <Link to="/register" className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #EA6C2A, #c9531a)' }}>
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
