import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { verifyEmail } from '../../features/auth/authSlice';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';

const VerifyEmail = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const { isLoading, error, message } = useAuth();

  useEffect(() => {
    if (token) dispatch(verifyEmail(token));
  }, [token, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FDFCFB' }}>
      <div className="max-w-md w-full rounded-3xl p-10 text-center shadow-sm" style={{ backgroundColor: 'white', border: '1px solid #e8e4df' }}>
        {isLoading ? (
          <>
            <LoadingSpinner size="xl" className="mx-auto mb-6" />
            <h2 className="text-xl font-bold mb-2" style={{ color: '#111110' }}>Verifying your email...</h2>
            <p className="text-sm" style={{ color: '#9a9590' }}>Please wait while we verify your account</p>
          </>
        ) : error ? (
          <>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#fef2f2' }}>
              <span className="text-4xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#111110' }}>Verification Failed</h2>
            <p className="mb-8" style={{ color: '#9a9590' }}>{error}</p>
            <p className="text-sm mb-4" style={{ color: '#9a9590' }}>The link may have expired or already been used.</p>
            <Link to="/login">
              <Button variant="primary" fullWidth>Back to Login</Button>
            </Link>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#f0fdf4' }}>
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#111110' }}>Email Verified!</h2>
            <p className="mb-8" style={{ color: '#9a9590' }}>
              {message || 'Your email has been verified successfully. You can now access all features.'}
            </p>
            <Link to="/login">
              <Button variant="primary" fullWidth size="lg">Continue to Login</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
