import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { loginUser, clearError } from '../../features/auth/authSlice';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

// Features shown on the left panel — all real platform capabilities
const leftPanelFeatures = [
  { emoji: '🤖', text: 'AI matches you by skill meaning, not just keywords' },
  { emoji: '🔐', text: 'Razorpay escrow holds funds until you approve work' },
  { emoji: '⚡', text: 'Real-time chat with file sharing via Socket.IO' },
  { emoji: '🏅', text: 'Earn Bronze → Silver → Gold verification badges' },
];

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Check if Google OAuth is configured on the backend
  const googleOAuthEnabled = false; // Set to true once you add GOOGLE_CLIENT_ID to server/.env

  useEffect(() => { if (isAuthenticated) navigate('/dashboard'); }, [isAuthenticated, navigate]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return; }
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) { toast.success('Welcome back! 🎉'); navigate('/dashboard'); }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#FDFCFB' }}>

      {/* ── Left dark panel ── */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #111110 0%, #1e1b18 100%)' }}
      >
        {/* Orange glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 10% 10%, rgba(234,108,42,0.18) 0%, transparent 55%)' }} />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full pointer-events-none opacity-5"
          style={{ background: '#EA6C2A', transform: 'translate(30%, 30%)' }} />

        {/* Logo */}
        <Link to="/" className="relative flex items-center gap-2.5 w-fit">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #EA6C2A, #c9531a)' }}>
            <SparklesIcon style={{ width: '1.1rem', height: '1.1rem', color: 'white' }} />
          </div>
          <span className="text-xl font-black text-white">Skill<span style={{ color: '#EA6C2A' }}>Sphere</span></span>
        </Link>

        {/* Middle content */}
        <div className="relative space-y-8">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'rgba(234,108,42,0.7)' }}>
              Why SkillSphere?
            </p>
            <h2 className="font-black text-white leading-tight mb-2"
              style={{ fontSize: '1.75rem', letterSpacing: '-0.03em' }}>
              India's first<br />
              <span style={{ color: '#EA6C2A' }}>AI-native</span> freelance platform
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Built ground-up for the Indian market — not a clone of a Western platform.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3.5">
            {leftPanelFeatures.map((f) => (
              <li key={f.text} className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0 mt-0.5">{f.emoji}</span>
                <span className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {f.text}
                </span>
              </li>
            ))}
          </ul>

          {/* Tech stack pills */}
          <div className="flex flex-wrap gap-2">
            {['Hugging Face AI', 'Razorpay Escrow', 'Socket.IO', 'MongoDB'].map((tag) => (
              <span key={tag}
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom — platform stats (real/honest) */}
        <div className="relative flex items-center gap-8 flex-wrap">
          {[
            { value: 'AI-First', label: 'Matching engine' },
            { value: '100%', label: 'Escrow-secured' },
            { value: 'India 🇮🇳', label: 'Built for Bharat' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-white font-black text-lg" style={{ letterSpacing: '-0.02em' }}>{value}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Form ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-slide-up">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #EA6C2A, #c9531a)' }}>
                <SparklesIcon style={{ width: '1.1rem', height: '1.1rem', color: 'white' }} />
              </div>
              <span className="text-xl font-black text-[#111110]">Skill<span style={{ color: '#EA6C2A' }}>Sphere</span></span>
            </Link>
          </div>

          <div className="mb-10">
            <h1 className="font-black text-[#111110] mb-2" style={{ fontSize: '2rem', letterSpacing: '-0.03em' }}>
              Welcome back 👋
            </h1>
            <p className="text-[#9a9590]">Sign in to your SkillSphere workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#3d3d3b] mb-2">Email Address</label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#b5afa9]" />
                <input type="email" placeholder="you@example.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-11" required autoComplete="email" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-[#3d3d3b]">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold transition-colors"
                  style={{ color: '#EA6C2A' }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#b5afa9]" />
                <input type={showPassword ? 'text' : 'password'} placeholder="Your password" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-11 pr-11" required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#b5afa9] hover:text-[#6b6762] transition-colors">
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading}
              className="w-full flex items-center justify-center gap-2.5 text-white font-bold rounded-2xl transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-50 shadow-lg"
              style={{ padding: '14px 24px', background: 'linear-gradient(135deg, #111110, #2a2520)', boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}
            >
              {isLoading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Sign In</span><ArrowRightIcon className="h-4 w-4" /></>
              }
            </button>
          </form>

          {/* Google OAuth — only shown when configured */}
          {googleOAuthEnabled && (
            <>
              <div className="relative my-6 flex items-center">
                <div className="flex-1 border-t" style={{ borderColor: '#e4e0db' }} />
                <span className="px-3 text-xs text-[#b5afa9] font-medium">or</span>
                <div className="flex-1 border-t" style={{ borderColor: '#e4e0db' }} />
              </div>
              <a href="http://localhost:5000/api/auth/google"
                className="w-full flex items-center justify-center gap-3 bg-white border rounded-2xl text-sm font-semibold text-[#3d3d3b] hover:border-[#ccc8c3] hover:bg-[#f7f4f1] transition-all shadow-sm hover:shadow-md"
                style={{ padding: '13px 20px', borderColor: '#e4e0db' }}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </a>
            </>
          )}

          <p className="text-center text-sm text-[#9a9590] mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold transition-colors" style={{ color: '#EA6C2A' }}>
              Create one free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
