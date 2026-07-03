import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { resetPassword, clearError, clearMessage } from '../../features/auth/authSlice';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, message } = useAuth();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
    if (message) { setSuccess(true); dispatch(clearMessage()); }
  }, [error, message, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    dispatch(resetPassword({ token, password: form.password }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#FDFCFB' }}>
      <div className="absolute top-1/3 right-1/3 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(234,108,42,0.06)' }} />

      <div className="w-full max-w-md relative z-10">
        <div className="rounded-3xl p-8 shadow-sm" style={{ backgroundColor: 'white', border: '1px solid #e8e4df' }}>
          {success ? (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#f0fdf4' }}>
                <span className="text-4xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold mb-3" style={{ color: '#111110' }}>Password Reset!</h2>
              <p className="mb-8" style={{ color: '#9a9590' }}>Your password has been successfully reset. You can now sign in with your new password.</p>
              <Link to="/login">
                <Button variant="primary" fullWidth size="lg">Sign In Now</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#fff3ec' }}>
                  <LockClosedIcon className="h-8 w-8" style={{ color: '#EA6C2A' }} />
                </div>
                <h1 className="text-2xl font-bold" style={{ color: '#111110' }}>Set New Password</h1>
                <p className="text-sm mt-2" style={{ color: '#9a9590' }}>Choose a strong password for your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="New Password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  icon={LockClosedIcon}
                  required
                  helperText="Use at least 8 characters"
                  RightIcon={() => (
                    <button type="button" onClick={() => setShowPw(!showPw)}>
                      {showPw ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  )}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Repeat your new password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  icon={LockClosedIcon}
                  required
                />
                <Button type="submit" isLoading={isLoading} fullWidth size="lg">
                  Reset Password
                </Button>
              </form>

              <p className="text-center text-sm mt-6">
                <Link to="/login" className="font-medium transition-colors" style={{ color: '#EA6C2A' }}>
                  ← Back to Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
