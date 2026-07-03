import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { getSocket, initSocket } from '../services/socket';
import { addMessage } from '../features/chat/chatSlice';
import { addNotification } from '../features/notification/notificationSlice';
import useAuth from './useAuth';

const useSocket = () => {
  const dispatch = useDispatch();
  const { token, user, isAuthenticated } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socket = initSocket(token);
    socketRef.current = socket;

    // Join user's personal room
    socket.emit('join', user?._id);

    // Listen for new messages
    socket.on('newMessage', (message) => {
      dispatch(addMessage(message));
    });

    // Listen for notifications
    socket.on('notification', (notification) => {
      dispatch(addNotification(notification));
    });

    // Typing events
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      socket.off('newMessage');
      socket.off('notification');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('error');
    };
  }, [isAuthenticated, token, dispatch, user?._id]);

  const joinRoom = (roomId) => {
    const socket = getSocket();
    if (socket) socket.emit('joinRoom', roomId);
  };

  const leaveRoom = (roomId) => {
    const socket = getSocket();
    if (socket) socket.emit('leaveRoom', roomId);
  };

  const emitTyping = (conversationId, isTyping) => {
    const socket = getSocket();
    if (socket) socket.emit('typing', { conversationId, isTyping, userId: user?._id });
  };

  const sendSocketMessage = (conversationId, message) => {
    const socket = getSocket();
    if (socket) socket.emit('sendMessage', { conversationId, message });
  };

  return {
    socket: socketRef.current,
    joinRoom,
    leaveRoom,
    emitTyping,
    sendSocketMessage,
  };
};

export default useSocket;
