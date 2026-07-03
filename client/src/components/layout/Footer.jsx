import React from 'react';
import { Link } from 'react-router-dom';
import { SparklesIcon } from '@heroicons/react/24/solid';

const Footer = () => (
  <footer className="border-t" style={{ borderColor: '#e8e4df', backgroundColor: '#f7f4f1' }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

        {/* Brand */}
        <div className="md:col-span-5">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #EA6C2A, #c9531a)' }}
            >
              <SparklesIcon className="w-4.5 h-4.5 text-white" style={{ width: '1.1rem', height: '1.1rem' }} />
            </div>
            <span className="text-lg font-black text-[#111110]">
              Skill<span style={{ color: '#EA6C2A' }}>Sphere</span>
            </span>
          </Link>

          <p className="text-sm text-[#9a9590] leading-relaxed max-w-xs mb-6">
            India's AI-powered freelance marketplace. Powered by Hugging Face semantic matching and Razorpay secure escrow.
          </p>

          {/* Tech badges */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: '🤗 Hugging Face AI', color: '#f59e0b' },
              { label: '💳 Razorpay', color: '#3b82f6' },
              { label: '⚡ Socket.IO', color: '#EA6C2A' },
            ].map((t) => (
              <span
                key={t.label}
                className="text-xs border rounded-full px-3 py-1 font-semibold"
                style={{
                  background: `${t.color}10`,
                  borderColor: `${t.color}30`,
                  color: t.color,
                }}
              >
                {t.label}
              </span>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 md:col-start-7">
          <h4 className="text-sm font-bold text-[#111110] mb-4">Platform</h4>
          <ul className="space-y-3">
            {[
              ['Browse Projects', '/projects'],
              ['Post a Project', '/projects/create'],
              ['Dashboard', '/dashboard'],
              ['Find Freelancers', '/freelancers'],
            ].map(([label, to]) => (
              <li key={label}>
                <Link to={to}
                  className="text-sm text-[#9a9590] hover:text-[#111110] transition-colors flex items-center gap-2 group">
                  <span
                    className="w-1 h-1 rounded-full transition-colors"
                    style={{ background: '#d0cbc5' }}
                  />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-sm font-bold text-[#111110] mb-4">Legal</h4>
          <ul className="space-y-3">
            {['Privacy Policy', 'Terms of Service', 'Help Center', 'Contact Us'].map((label) => (
              <li key={label}>
                <a href="#" className="text-sm text-[#9a9590] hover:text-[#111110] transition-colors">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: '#e4e0db' }}>
        <p className="text-sm text-[#b5afa9]">
          © 2025 SkillSphere. All rights reserved. Made with ❤️ in India 🇮🇳
        </p>
        <div className="flex items-center gap-3">
          {['T', 'L', 'G'].map((s) => (
            <a key={s} href="#"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all hover:-translate-y-0.5"
              style={{ background: '#fff', border: '1px solid #e4e0db', color: '#9a9590' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#111110'; e.currentTarget.style.borderColor = '#ccc8c3'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#9a9590'; e.currentTarget.style.borderColor = '#e4e0db'; }}
            >
              {s}
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
