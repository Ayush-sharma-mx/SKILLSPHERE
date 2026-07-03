import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon, BriefcaseIcon, ChatBubbleLeftRightIcon,
  CreditCardIcon, UserCircleIcon, DocumentTextIcon,
  ChartBarIcon, UsersIcon, ShieldCheckIcon,
  ExclamationTriangleIcon, ChevronLeftIcon, ChevronRightIcon,
  FolderIcon, Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import useAuth from '../../hooks/useAuth';

const Sidebar = () => {
  const location = useLocation();
  const { isClient, isFreelancer, isAdmin, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const clientLinks = [
    { to: '/dashboard', icon: HomeIcon, label: 'Dashboard', emoji: '🏠' },
    { to: '/projects/create', icon: BriefcaseIcon, label: 'Post Project', emoji: '✍️' },
    { to: '/projects', icon: FolderIcon, label: 'Browse', emoji: '🔍' },
    { to: '/chat', icon: ChatBubbleLeftRightIcon, label: 'Messages', emoji: '💬' },
    { to: '/payments', icon: CreditCardIcon, label: 'Payments', emoji: '💳' },
    { to: '/disputes', icon: ExclamationTriangleIcon, label: 'Disputes', emoji: '⚖️' },
  ];

  const freelancerLinks = [
    { to: '/dashboard', icon: HomeIcon, label: 'Dashboard', emoji: '🏠' },
    { to: '/projects', icon: BriefcaseIcon, label: 'Browse Projects', emoji: '🔍' },
    { to: '/proposals', icon: DocumentTextIcon, label: 'My Proposals', emoji: '📋' },
    { to: '/chat', icon: ChatBubbleLeftRightIcon, label: 'Messages', emoji: '💬' },
    { to: '/payments', icon: CreditCardIcon, label: 'Earnings', emoji: '💰' },
    { to: '/disputes', icon: ExclamationTriangleIcon, label: 'Disputes', emoji: '⚖️' },
    { to: `/profile/${user?._id}`, icon: UserCircleIcon, label: 'My Profile', emoji: '👤' },
    { to: '/profile/edit', icon: Cog6ToothIcon, label: 'Edit Profile', emoji: '⚙️' },
  ];

  const adminLinks = [
    { to: '/admin', icon: ChartBarIcon, label: 'Dashboard', emoji: '📊' },
    { to: '/admin/users', icon: UsersIcon, label: 'Users', emoji: '👥' },
    { to: '/admin/projects', icon: FolderIcon, label: 'Projects', emoji: '📁' },
    { to: '/admin/payments', icon: CreditCardIcon, label: 'Payments', emoji: '💳' },
    { to: '/admin/disputes', icon: ShieldCheckIcon, label: 'Disputes', emoji: '🛡️' },
  ];

  const links = isAdmin ? adminLinks : isClient ? clientLinks : freelancerLinks;
  const isActive = (path) => path === '/dashboard' || path === '/admin' ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <aside
      className={`hidden lg:flex flex-col min-h-screen transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-[72px]' : 'w-60'}`}
      style={{ background: '#FDFCFB', borderRight: '1px solid #e8e4df' }}
    >
      {/* Logo area */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#f0ede9' }}>
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #EA6C2A, #c9531a)' }}>
              <SparklesIcon className="text-white" style={{ width: '0.9rem', height: '0.9rem' }} />
            </div>
            <span className="text-base font-black" style={{ color: '#111110' }}>
              Skill<span style={{ color: '#EA6C2A' }}>Sphere</span>
            </span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-xl transition-colors ml-auto"
          style={{ color: '#9a9590' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f0ede9'; e.currentTarget.style.color = '#111110'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9a9590'; }}
        >
          {collapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              title={collapsed ? link.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${collapsed ? 'justify-center' : ''}`}
              style={{
                background: active ? 'rgba(234,108,42,0.08)' : 'transparent',
                color: active ? '#EA6C2A' : '#6b6762',
                border: active ? '1px solid rgba(234,108,42,0.18)' : '1px solid transparent',
                fontWeight: active ? '600' : '500',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#f7f4f1'; e.currentTarget.style.color = '#111110'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b6762'; } }}
            >
              <Icon className="h-[18px] w-[18px] flex-shrink-0" />
              {!collapsed && <span className="text-sm truncate">{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      {!collapsed && (
        <div className="p-4 border-t" style={{ borderColor: '#f0ede9' }}>
          <div className="flex items-center gap-3 px-1">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #EA6C2A, #c9531a)' }}
            >
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: '#111110' }}>{user?.name}</p>
              <p className="text-xs capitalize" style={{ color: '#9a9590' }}>{user?.role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
