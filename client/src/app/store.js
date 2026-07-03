import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import projectReducer from '../features/project/projectSlice';
import proposalReducer from '../features/proposal/proposalSlice';
import chatReducer from '../features/chat/chatSlice';
import notificationReducer from '../features/notification/notificationSlice';
import paymentReducer from '../features/payment/paymentSlice';
import adminReducer from '../features/admin/adminSlice';
import freelancerReducer from '../features/freelancer/freelancerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    project: projectReducer,
    proposal: proposalReducer,
    chat: chatReducer,
    notification: notificationReducer,
    payment: paymentReducer,
    admin: adminReducer,
    freelancer: freelancerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
