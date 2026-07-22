import React from 'react';
import { formatDate } from '../../utils/helpers';
import { CheckIcon } from '@heroicons/react/24/solid';

const MessageBubble = ({ message, isOwn }) => {
  const timeStr = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] group`}>
        <div 
          className={`px-4 py-2.5 rounded-2xl text-sm ${isOwn ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
          style={{
            backgroundColor: isOwn ? '#EA6C2A' : '#f7f4f1',
            color: isOwn ? 'white' : '#111110',
            border: isOwn ? 'none' : '1px solid #e8e4df'
          }}
        >
          {message.fileUrl && (
            <a href={message.fileUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 mb-1.5 text-xs underline opacity-80 hover:opacity-100">
              📎 {message.fileName || 'Attachment'}
            </a>
          )}
          {message.text && <p className="leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>}
        </div>
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs" style={{ color: '#9a9590' }}>{timeStr}</span>
          {isOwn && (
            <div className="flex" style={{ color: message.isRead ? '#16a34a' : '#d0cbc5' }}>
              <CheckIcon className="w-3 h-3" />
              <CheckIcon className="w-3 h-3 -ml-1.5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
