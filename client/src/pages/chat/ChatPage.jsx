import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchConversations, setActiveConversation, fetchMessages } from '../../features/chat/chatSlice';
import ChatWindow from '../../components/chat/ChatWindow';
import { getAvatarFallback, formatRelativeTime, truncateText } from '../../utils/helpers';
import { MagnifyingGlassIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { initSocket } from '../../services/socket';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ChatPage = () => {
  const { conversationId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { conversations, activeConversation, isLoading } = useSelector((s) => s.chat);
  const { user, token } = useSelector((s) => s.auth);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (token) initSocket(token);
    dispatch(fetchConversations());
  }, []);

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c._id === conversationId);
      if (conv) dispatch(setActiveConversation(conv));
    }
  }, [conversationId, conversations.length]);

  const filteredConvs = conversations.filter(conv => {
    const other = conv.participants?.find(p => (p._id || p) !== user?._id);
    return !search || other?.name?.toLowerCase().includes(search.toLowerCase());
  });

  const handleSelectConversation = (conv) => {
    dispatch(setActiveConversation(conv));
    navigate(`/chat/${conv._id}`);
  };

  const getOtherUser = (conv) => conv.participants?.find(p => (p._id || p) !== user?._id);

  return (
    <div className="h-[calc(100vh-64px)] flex" style={{ backgroundColor: '#FDFCFB' }}>
      {/* Sidebar */}
      <div className="w-80 flex flex-col flex-shrink-0" style={{ backgroundColor: 'white', borderRight: '1px solid #e8e4df' }}>
        <div className="p-4" style={{ borderBottom: '1px solid #e8e4df' }}>
          <div className="flex items-center gap-2 mb-3">
            <ChatBubbleLeftRightIcon className="w-5 h-5" style={{ color: '#EA6C2A' }} />
            <h2 className="font-bold" style={{ color: '#111110' }}>Messages</h2>
          </div>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9a9590' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none"
              style={{
                backgroundColor: '#f7f4f1',
                border: '1px solid #e8e4df',
                color: '#111110',
              }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading && conversations.length === 0 ? (
            <div className="flex justify-center py-8"><LoadingSpinner /></div>
          ) : filteredConvs.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="text-4xl mb-2">💬</div>
              <p className="text-sm" style={{ color: '#9a9590' }}>No conversations yet</p>
              <p className="text-xs mt-1" style={{ color: '#d0cbc5' }}>Start chatting from a project page</p>
            </div>
          ) : (
            filteredConvs.map((conv) => {
              const other = getOtherUser(conv);
              const isActive = activeConversation?._id === conv._id;
              const lastMsg = conv.lastMessage;
              return (
                <button
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left"
                  style={{
                    backgroundColor: isActive ? '#fff3ec' : 'transparent',
                    borderBottom: '1px solid #f0ede9',
                    borderLeft: isActive ? '3px solid #EA6C2A' : '3px solid transparent',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#f7f4f1'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <div className="relative flex-shrink-0">
                    {other?.avatar ? (
                      <img src={other.avatar} alt={other.name} className="w-10 h-10 rounded-full object-cover" style={{ border: '1px solid #e8e4df' }} />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg, #EA6C2A, #f59e42)' }}>
                        {getAvatarFallback(other?.name || 'U')}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className="text-sm font-medium truncate" style={{ color: '#111110' }}>{other?.name || 'User'}</p>
                      {lastMsg && <p className="text-xs flex-shrink-0 ml-2" style={{ color: '#d0cbc5' }}>{formatRelativeTime(lastMsg.createdAt)}</p>}
                    </div>
                    <p className="text-xs truncate mt-0.5" style={{ color: '#9a9590' }}>
                      {lastMsg ? truncateText(lastMsg.text || 'Attachment', 35) : 'No messages yet'}
                    </p>
                    {conv.project && (
                      <p className="text-xs truncate mt-0.5" style={{ color: '#EA6C2A', opacity: 0.7 }}>📋 {conv.project?.title}</p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatWindow conversation={activeConversation} />
      </div>
    </div>
  );
};

export default ChatPage;
