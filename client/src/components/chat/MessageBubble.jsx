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
        <div className={`px-4 py-2.5 rounded-2xl text-sm ${
          isOwn
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-sm'
        }`}>
          {message.fileUrl && (
            <a href={message.fileUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 mb-1.5 text-xs underline opacity-80 hover:opacity-100">
              📎 {message.fileName || 'Attachment'}
            </a>
          )}
          {message.text && <p className="leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>}
        </div>
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-600">{timeStr}</span>
          {isOwn && (
            <div className={`flex ${message.isRead ? 'text-blue-400' : 'text-gray-600'}`}>
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
