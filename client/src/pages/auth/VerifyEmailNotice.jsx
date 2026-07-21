import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../features/auth/authSlice';
import { EnvelopeIcon, ArrowPathIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import api from '../../services/api';
import toast from 'react-hot-toast';

const VerifyEmailNotice = () => {
  const dispatch = useDispatch();
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-verification');
      toast.success('Verification email sent! Check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend. Try again later.');
    }
    setResending(false);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FDFCFB' }}>
      <div className="w-full max-w-md text-center animate-slide-up">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #EA6C2A, #c9531a)' }}>
          <EnvelopeIcon className="w-10 h-10 text-white" />
        </div>

        {/* Title */}
        <h1 className="font-black text-3xl mb-3" style={{ color: '#111110', letterSpacing: '-0.03em' }}>
          Verify Your Email
        </h1>
        <p className="text-base mb-8" style={{ color: '#9a9590' }}>
          We sent a verification link to your email address.<br />
          Please check your <strong>inbox</strong> (and spam folder) and click the link to activate your account.
        </p>

        {/* Card */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm mb-6" style={{ borderColor: '#e4e0db' }}>
          <div className="flex items-center gap-3 text-left mb-4">
            <SparklesIcon className="w-5 h-5 flex-shrink-0" style={{ color: '#EA6C2A' }} />
            <p className="text-sm" style={{ color: '#6b6762' }}>
              <strong>Why?</strong> Email verification protects you from unauthorized account access and ensures a trusted freelance community.
            </p>
          </div>

          <button
            onClick={handleResend}
            disabled={resending}
            className="w-full flex items-center justify-center gap-2 text-white font-bold rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-50"
            style={{ padding: '12px 20px', background: 'linear-gradient(135deg, #EA6C2A, #c9531a)' }}
          >
            {resending
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><ArrowPathIcon className="w-4 h-4" /> Resend Verification Email</>
            }
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 mx-auto text-sm font-semibold transition-colors"
          style={{ color: '#9a9590' }}
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          Sign out & use a different email
        </button>
      </div>
    </div>
  );
};

export default VerifyEmailNotice;
