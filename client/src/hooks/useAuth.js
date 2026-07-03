import { useSelector } from 'react-redux';
import { ROLES } from '../utils/constants';

const useAuth = () => {
  const { user, token, isLoading, isAuthenticated, error, message } = useSelector((state) => state.auth);

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    error,
    message,
    role: user?.role || null,
    isClient: user?.role === ROLES.CLIENT,
    isFreelancer: user?.role === ROLES.FREELANCER,
    isAdmin: user?.role === ROLES.ADMIN,
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || null,
  };
};

export default useAuth;
