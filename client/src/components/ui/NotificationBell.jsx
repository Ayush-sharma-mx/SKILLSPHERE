import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { BellIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/solid';
import {
  fetchNotifications, markAsRead, markAllAsRead,
  deleteNotification,
} from '../../features/notification/notificationSlice';

const typeEmoji = {
  new_proposal: '📋',
  proposal_accepted: '🎉',
  proposal_rejected: '❌',
  project_assigned: '🚀',
  payment_received: '💰',
  payment_released: '✅',
  review_received: '⭐',
  message_received: '💬',
  dispute_raised: '⚠️',
  dispute_resolved: '🔒',
  milestone_completed: '🏆',
  system: '🔔',
};

const NotificationBell = () => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const { notifications, unreadCount, isLoading } = useSelector(s => s.notification);
  const { isAuthenticated } = useSelector(s => s.auth);

  // Fetch on mount when authenticated
  useEffect(() => {
    if (isAuthenticated) dispatch(fetchNotifications());
  }, [isAuthenticated, dispatch]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen(prev => !prev);
  };

  const handleMarkRead = (e, id) => {
    e.stopPropagation();
    dispatch(markAsRead(id));
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    dispatch(deleteNotification(id));
  };

  const handleMarkAll = () => {
    dispatch(markAllAsRead());
  };

  const formatTime = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    if (m > 0) return `${m}m ago`;
    return 'just now';
  };

  if (!isAuthenticated) return null;

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-xl transition-all duration-200 hover:bg-[#f0ede9]"
        title="Notifications"
      >
        {unreadCount > 0
          ? <BellAlertIcon className="w-5 h-5" style={{ color: '#EA6C2A' }} />
          : <BellIcon className="w-5 h-5 text-[#6b6762]" />
        }
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-white font-black"
            style={{ background: '#EA6C2A', fontSize: '10px', padding: '0 4px' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-12 w-96 rounded-2xl shadow-2xl z-50 overflow-hidden border animate-scale-in"
          style={{
            backgroundColor: '#FDFCFB',
            borderColor: '#e4e0db',
            boxShadow: '0 16px 48px rgba(0,0,0,0.14)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b" style={{ borderColor: '#f0ede9' }}>
            <div className="flex items-center gap-2">
              <BellIcon className="w-4 h-4 text-[#6b6762]" />
              <span className="font-black text-sm text-[#111110]">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(234,108,42,0.1)', color: '#EA6C2A' }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs font-semibold transition-colors flex items-center gap-1"
                style={{ color: '#EA6C2A' }}
              >
                <CheckIcon className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="w-6 h-6 border-2 border-[#e4e0db] border-t-[#EA6C2A] rounded-full animate-spin mx-auto" />
              </div>
            ) : notifications?.length === 0 ? (
              <div className="py-14 text-center">
                <div className="text-4xl mb-3">🔔</div>
                <p className="text-sm font-semibold text-[#9a9590]">All caught up!</p>
                <p className="text-xs text-[#b5afa9] mt-1">No notifications yet</p>
              </div>
            ) : (
              notifications?.map((n) => (
                <div
                  key={n._id}
                  className="group flex items-start gap-3 px-4 py-3.5 border-b cursor-pointer transition-colors hover:bg-[#f7f4f1]"
                  style={{
                    borderColor: '#f7f4f1',
                    backgroundColor: n.isRead ? 'transparent' : 'rgba(234,108,42,0.03)',
                  }}
                  onClick={() => !n.isRead && dispatch(markAsRead(n._id))}
                >
                  {/* Emoji */}
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                    style={{ background: n.isRead ? '#f7f4f1' : 'rgba(234,108,42,0.08)' }}>
                    {typeEmoji[n.type] || '🔔'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#111110] mb-0.5 leading-snug">{n.title}</p>
                    <p className="text-xs text-[#9a9590] leading-relaxed line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-[#c5c0ba] mt-1">{formatTime(n.createdAt)}</p>
                  </div>

                  {/* Unread dot + actions */}
                  <div className="flex-shrink-0 flex flex-col items-end gap-1.5 pt-0.5">
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#EA6C2A' }} />
                    )}
                    <button
                      onClick={(e) => handleDelete(e, n._id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all hover:bg-red-50"
                    >
                      <TrashIcon className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications?.length > 0 && (
            <div className="px-4 py-3 border-t text-center" style={{ borderColor: '#f0ede9' }}>
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold transition-colors"
                style={{ color: '#EA6C2A' }}
              >
                View all in Dashboard →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
