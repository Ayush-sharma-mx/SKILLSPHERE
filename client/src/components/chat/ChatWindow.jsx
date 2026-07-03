import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, sendMessage } from '../../features/chat/chatSlice';
import { addMessage, updateTyping } from '../../features/chat/chatSlice';
import { getSocket } from '../../services/socket';
import MessageBubble from './MessageBubble';
import { PaperAirplaneIcon, PaperClipIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { getAvatarFallback } from '../../utils/helpers';
import LoadingSpinner from '../ui/LoadingSpinner';

const ChatWindow = ({ conversation }) => {
  const dispatch = useDispatch();
  const { messages, isLoading } = useSelector((s) => s.chat);
  const { user } = useSelector((s) => s.auth);
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const bottomRef = useRef();
  const typingTimeout = useRef();

  const socket = getSocket();
  const otherUser = conversation?.participants?.find(p => (p._id || p) !== user?._id);

  useEffect(() => {
    if (conversation?._id) {
      dispatch(fetchMessages(conversation._id));
      socket?.emit('join_room', conversation._id);
    }
    return () => { if (conversation?._id) socket?.emit('leave_room', conversation._id); };
  }, [conversation?._id]);

  useEffect(() => {
    if (!socket) return;
    socket.on('receive_message', (msg) => dispatch(addMessage(msg)));
    socket.on('user_typing', ({ userId, isTyping, name }) => {
      if (userId !== user?._id) setTypingUser(isTyping ? name : null);
    });
    return () => { socket.off('receive_message'); socket.off('user_typing'); };
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = (val) => {
    setText(val);
    socket?.emit('typing', { conversationId: conversation._id, isTyping: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket?.emit('typing', { conversationId: conversation._id, isTyping: false });
    }, 2000);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const msg = text.trim();
    setText('');
    socket?.emit('typing', { conversationId: conversation._id, isTyping: false });
    await dispatch(sendMessage({ conversationId: conversation._id, text: msg }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSend(e);
  };

  if (!conversation) return (
    <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-950">
      <div className="text-center">
        <div className="text-5xl mb-3">💬</div>
        <p className="font-medium text-gray-400">Select a conversation</p>
        <p className="text-sm mt-1">Choose a chat from the sidebar to start messaging</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gray-900">
        {otherUser?.avatar ? (
          <img src={otherUser.avatar} alt={otherUser.name} className="w-9 h-9 rounded-full border border-gray-700 object-cover" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
            {getAvatarFallback(otherUser?.name || 'U')}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-white text-sm">{otherUser?.name || 'Conversation'}</h3>
          <p className="text-xs text-green-400">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-950">
        {isLoading ? (
          <div className="flex justify-center py-8"><LoadingSpinner /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-gray-600 text-sm">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg._id} message={msg} isOwn={(msg.sender?._id || msg.sender) === user?._id} />
          ))
        )}
        {typingUser && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <span key={i} className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <span>{typingUser} is typing...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-gray-800 p-4 bg-gray-900">
        <div className="flex items-center gap-3">
          <input
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 border border-gray-700 text-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors"
          >
            <PaperAirplaneIcon className="w-4 h-4 text-white" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
