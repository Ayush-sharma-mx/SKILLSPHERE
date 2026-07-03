import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { EnvelopeIcon, LockClosedIcon, UserIcon, EyeIcon, EyeSlashIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { SparklesIcon, BriefcaseIcon, CommandLineIcon } from '@heroicons/react/24/solid';
import { registerUser, clearError } from '../../features/auth/authSlice';
import useAuth from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';
import toast from 'react-hot-toast';

// ── Defined OUTSIDE Register so React never recreates the component type on re-render ──
const Field = ({ label, type, placeholder, value, onChange, Icon, error, required, children }) => (
  <div>
    <label className="block text-sm font-semibold mb-2" style={{ color: '#3d3d3b' }}>{label}</label>
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none" style={{ color: '#b5afa9' }} />
      <input
        type={type || 'text'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`input-field pl-11 ${children ? 'pr-11' : ''} ${error ? 'border-red-300 focus:ring-red-300' : ''}`}
      />
      {children}
    </div>
    {error && <p className="text-red-500 text-xs mt-1.5">⚠ {error}</p>}
  </div>
);

const strengthLabel = ['', 'Too short', 'Weak', 'Good', 'Strong'];
const strengthColors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: ROLES.CLIENT });
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => { if (isAuthenticated) navigate('/dashboard'); }, [isAuthenticated, navigate]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error, dispatch]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    if (form.password.length < 8) e.password = 'Min. 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!agreed) e.agreed = 'Please agree to continue';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const { confirmPassword, ...data } = form;
    const result = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(result)) {
      toast.success('🎉 Account created! Welcome to SkillSphere.');
      navigate('/dashboard');
    }
  };

  const pwStrength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2
    : /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) ? 4 : 3;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12" style={{ backgroundColor: '#FDFCFB' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 70% 10%, rgba(234,108,42,0.05) 0%, transparent 60%)' }} />

      <div className="relative w-full max-w-lg animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #EA6C2A, #c9531a)' }}>
              <SparklesIcon className="text-white" style={{ width: '1.15rem', height: '1.15rem' }} />
            </div>
            <span className="text-2xl font-black" style={{ color: '#111110' }}>
              Skill<span style={{ color: '#EA6C2A' }}>Sphere</span>
            </span>
          </Link>
          <h1 className="font-black mb-2" style={{ color: '#111110', fontSize: '2rem', letterSpacing: '-0.03em' }}>
            Create your account
          </h1>
          <p style={{ color: '#9a9590' }}>Join thousands of Indian freelancers &amp; clients</p>
        </div>

        {/* Card */}
        <div className="bg-white border rounded-3xl p-8 shadow-lg shadow-black/5" style={{ borderColor: '#e4e0db' }}>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3 mb-7">
            {[
              { value: ROLES.CLIENT, Icon: BriefcaseIcon, title: "I'm a Client", desc: 'Hire top talent', emoji: '🏢' },
              { value: ROLES.FREELANCER, Icon: CommandLineIcon, title: "I'm a Freelancer", desc: 'Find great work', emoji: '💻' },
            ].map((opt) => {
              const selected = form.role === opt.value;
              return (
                <button key={opt.value} type="button" onClick={() => setForm(f => ({ ...f, role: opt.value }))}
                  className="relative p-4 rounded-2xl border text-left transition-all duration-200 overflow-hidden"
                  style={{
                    borderColor: selected ? '#EA6C2A' : '#e4e0db',
                    background: selected ? 'rgba(234,108,42,0.05)' : 'white',
                  }}>
                  {selected && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: '#EA6C2A' }}>
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                  <span className="text-2xl mb-2 block">{opt.emoji}</span>
                  <p className="text-sm font-bold mb-0.5" style={{ color: '#111110' }}>{opt.title}</p>
                  <p className="text-xs" style={{ color: '#9a9590' }}>{opt.desc}</p>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="Full Name"
              placeholder="Ayush Sharma"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              Icon={UserIcon}
              error={errors.name}
              required
            />

            <Field
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              Icon={EnvelopeIcon}
              error={errors.email}
              required
            />

            <Field
              label="Password"
              type={showPw ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
              Icon={LockClosedIcon}
              error={errors.password}
              required
            >
              <button type="button" onClick={() => setShowPw(s => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: '#b5afa9' }}>
                {showPw ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </Field>

            {/* Password strength */}
            {form.password.length > 0 && (
              <div>
                <div className="flex gap-1.5 mb-1.5">
                  {[1, 2, 3, 4].map((l) => (
                    <div key={l} className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{ background: pwStrength >= l ? strengthColors[pwStrength] : '#f0ede9' }} />
                  ))}
                </div>
                <p className="text-xs font-medium" style={{ color: strengthColors[pwStrength] }}>
                  {strengthLabel[pwStrength]}
                </p>
              </div>
            )}

            <Field
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={(e) => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              Icon={LockClosedIcon}
              error={errors.confirmPassword}
              required
            />

            {/* Terms */}
            <div className="flex items-start gap-3 mt-1">
              <button type="button" onClick={() => setAgreed(a => !a)} className="flex-shrink-0 mt-0.5">
                <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all"
                  style={{ borderColor: agreed ? '#EA6C2A' : '#ccc8c3', background: agreed ? '#EA6C2A' : 'white' }}>
                  {agreed && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </button>
              <span className="text-sm" style={{ color: '#6b6762' }}>
                I agree to SkillSphere's{' '}
                <a href="#" className="font-semibold" style={{ color: '#EA6C2A' }}>Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="font-semibold" style={{ color: '#EA6C2A' }}>Privacy Policy</a>
              </span>
            </div>
            {errors.agreed && <p className="text-red-500 text-xs">⚠ {errors.agreed}</p>}

            {/* Submit */}
            <button type="submit" disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2.5 text-white font-bold rounded-2xl transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ padding: '14px 24px', background: 'linear-gradient(135deg, #111110, #2a2520)', boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}
            >
              {isLoading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><SparklesIcon className="h-4 w-4 text-[#EA6C2A]" />Create Free Account<ArrowRightIcon className="h-4 w-4" /></>
              }
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: '#9a9590' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-bold transition-colors" style={{ color: '#EA6C2A' }}>Sign in →</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
