import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './features/auth/authSlice';

// Layout
import Navbar from './components/layout/Navbar';

// Auth Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import VerifyEmailNotice from './pages/auth/VerifyEmailNotice';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import GoogleCallback from './pages/auth/GoogleCallback';

// Dashboard Pages
import ClientDashboard from './pages/dashboard/ClientDashboard';
import FreelancerDashboard from './pages/dashboard/FreelancerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

// Freelancer Pages
import FreelancerProfile from './pages/freelancer/FreelancerProfile';
import EditProfile from './pages/freelancer/EditProfile';

// Project Pages
import BrowseProjects from './pages/projects/BrowseProjects';
import ProjectDetail from './pages/projects/ProjectDetail';
import CreateProject from './pages/projects/CreateProject';

// Feature Pages
import MyProposals from './pages/proposals/MyProposals';
import ChatPage from './pages/chat/ChatPage';
import PaymentsPage from './pages/payments/PaymentsPage';
import DisputePage from './pages/disputes/DisputePage';

// Admin Pages
import AdminUsers from './pages/admin/AdminUsers';
import AdminProjects from './pages/admin/AdminProjects';
import AdminPayments from './pages/admin/AdminPayments';
import AdminDisputes from './pages/admin/AdminDisputes';

// Other
import NotFound from './pages/NotFound';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Protected Route
const ProtectedRoute = ({ children, roles, skipVerification }) => {
  const { isAuthenticated, user, isLoading } = useSelector((s) => s.auth);
  if (isLoading) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FDFCFB' }}><LoadingSpinner size="lg" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  

  
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

// Dashboard Router
const DashboardRouter = () => {
  const { user } = useSelector((s) => s.auth);
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'freelancer') return <FreelancerDashboard />;
  return <ClientDashboard />;
};

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);

  useEffect(() => {
    if (token) dispatch(loadUser());
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFCFB' }}>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/google/success" element={<GoogleCallback />} />
        <Route path="/auth/google/error" element={<GoogleCallback />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/projects" element={<BrowseProjects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/profile/:id" element={<FreelancerProfile />} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute roles={['freelancer']}><EditProfile /></ProtectedRoute>} />
        <Route path="/projects/create" element={<ProtectedRoute roles={['client']}><CreateProject /></ProtectedRoute>} />
        <Route path="/proposals" element={<ProtectedRoute><MyProposals /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/chat/:conversationId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
        <Route path="/disputes" element={<ProtectedRoute><DisputePage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/projects" element={<ProtectedRoute roles={['admin']}><AdminProjects /></ProtectedRoute>} />
        <Route path="/admin/payments" element={<ProtectedRoute roles={['admin']}><AdminPayments /></ProtectedRoute>} />
        <Route path="/admin/disputes" element={<ProtectedRoute roles={['admin']}><AdminDisputes /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
