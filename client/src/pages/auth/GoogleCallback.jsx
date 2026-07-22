import React, { useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setToken, loadUser } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  
  useEffect(() => {
    const isError = location.pathname.includes('/error');
    if (isError) {
      toast.error('Google login failed or was cancelled.');
      navigate('/login');
      return;
    }

    const token = searchParams.get('token');
    
    if (token) {
      // Store token and load user
      dispatch(setToken({ token }));
      dispatch(loadUser());
      
      toast.success('Successfully logged in with Google! 🎉');
      navigate('/dashboard');
    } else {
      toast.error('Authentication token missing. Please try again.');
      navigate('/login');
    }
  }, [searchParams, dispatch, navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center flex-col" style={{ backgroundColor: '#FDFCFB' }}>
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-[#9a9590] font-medium animate-pulse">Completing Google login...</p>
    </div>
  );
};

export default GoogleCallback;
