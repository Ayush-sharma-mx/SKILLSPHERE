import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { forgotPassword, clearError, clearMessage } from '../../features/auth/authSlice';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const { isLoading, error, message } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
    if (message) { setSent(true); dispatch(clearMessage()); }
  }, [error, message, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    dispatch(forgotPassword(email));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#FDFCFB' }}>
      {/* Subtle warm blob */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(234,108,42,0.06)' }} />

      <div className="w-full max-w-md relative z-10">
        <div className="rounded-3xl p-8 shadow-sm" style={{ backgroundColor: 'white', border: '1px solid #e8e4df' }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#fff3ec' }}>
              <EnvelopeIcon className="h-8 w-8" style={{ color: '#EA6C2A' }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: '#111110' }}>Forgot Password?</h1>
            <p className="text-sm mt-2" style={{ color: '#9a9590' }}>
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#f0fdf4' }}>
                <span className="text-3xl">📧</span>
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#111110' }}>Check your inbox!</h3>
              <p className="text-sm mb-6" style={{ color: '#9a9590' }}>
                We've sent a password reset link to <span className="font-medium" style={{ color: '#111110' }}>{email}</span>
              </p>
              <p className="text-xs mb-6" style={{ color: '#d0cbc5' }}>
                Didn't receive the email? Check spam or try again.
              </p>
              <Button variant="secondary" onClick={() => setSent(false)} fullWidth>
                Try Again
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={EnvelopeIcon}
                required
              />
              <Button type="submit" isLoading={isLoading} fullWidth size="lg">
                Send Reset Link
              </Button>
            </form>
          )}

          <p className="text-center text-sm mt-6">
            <Link to="/login" className="font-medium transition-colors flex items-center justify-center gap-1" style={{ color: '#EA6C2A' }}>
              ← Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
