import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon, SparklesIcon as SparklesOutline,
  ShieldCheckIcon, ChatBubbleLeftRightIcon,
  CheckBadgeIcon, BoltIcon, StarIcon,
  CurrencyRupeeIcon,
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

/* ─── Data ─── */
const features = [
  {
    icon: SparklesOutline,
    label: 'AI Matching',
    title: 'Hire who actually fits',
    desc: 'Hugging Face semantic embeddings rank freelancers by true skill match — not just keywords.',
    accent: 'orange',
  },
  {
    icon: ShieldCheckIcon,
    label: 'Escrow Payments',
    title: 'Money moves when you say so',
    desc: 'Razorpay holds funds securely. Release only when each milestone is delivered to your satisfaction.',
    accent: 'green',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    label: 'Real-time Chat',
    title: 'Collaborate without leaving',
    desc: 'Built-in Socket.IO messaging with file sharing, typing indicators, and instant notifications.',
    accent: 'blue',
  },
  {
    icon: CheckBadgeIcon,
    label: 'Verified Badges',
    title: 'Trust built into the platform',
    desc: 'Bronze → Silver → Gold badges earned through completion rate, reviews, and on-time delivery.',
    accent: 'amber',
  },
  {
    icon: BoltIcon,
    label: 'Milestones',
    title: 'Projects, broken down simply',
    desc: 'Set clear milestones with individual budgets. Track progress visually, pay on approval.',
    accent: 'orange',
  },
  {
    icon: ShieldCheckIcon,
    label: 'Dispute Resolution',
    title: 'Conflicts resolved fairly',
    desc: 'Admin-mediated dispute system protects your escrow with full transparency at every step.',
    accent: 'green',
  },
];

const steps = [
  {
    n: '1',
    title: 'Describe your project',
    desc: 'Post in under 5 minutes — set your budget, skills needed, and milestone breakdown.',
  },
  {
    n: '2',
    title: 'Get matched by AI',
    desc: 'Our Hugging Face model ranks freelancers by semantic skill similarity. No guesswork.',
  },
  {
    n: '3',
    title: 'Work & pay securely',
    desc: 'Chat in real-time, approve milestones, and release Razorpay escrow on your terms.',
  },
];

const stats = [
  { value: 'AI-First',    label: 'Hugging Face semantic matching' },
  { value: '100%',        label: 'Escrow-secured payments' },
  { value: 'Real-time',   label: 'Socket.IO collaboration' },
  { value: 'India 🇮🇳',   label: 'Built for the Indian market' },
];


const accentColors = {
  orange: 'bg-orange-50 text-[#EA6C2A] border-orange-200',
  green:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  blue:   'bg-blue-50 text-blue-700 border-blue-200',
  amber:  'bg-amber-50 text-amber-700 border-amber-200',
};

/* ─── Component ─── */
const Landing = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFCFB' }}>


      {/* ══════════════════════ HERO ══════════════════════ */}
      <section className="relative overflow-hidden pt-16 pb-28 px-4">

        {/* Warm gradient background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(234,108,42,0.07) 0%, rgba(253,252,251,0) 70%), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(253,186,116,0.06) 0%, transparent 60%)',
          }}
        />
        {/* Subtle grid */}
        <div className="absolute inset-0 paper-grid opacity-60 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">

          {/* Pill badge */}
          <div className="flex justify-center mb-10 animate-fade-in">
            <span className="pill-badge">
              <span className="w-5 h-5 rounded-full bg-[#EA6C2A]/10 border border-[#EA6C2A]/25 flex items-center justify-center flex-shrink-0">
                <SparklesIcon className="w-3 h-3 text-[#EA6C2A]" />
              </span>
              AI-Powered Freelance Platform for India
              <span className="bg-[#EA6C2A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">NEW</span>
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-black tracking-tight text-[#111110] mb-7 animate-slide-up"
            style={{
              fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
              lineHeight: '1.04',
              letterSpacing: '-0.03em',
              animationDelay: '0.05s',
            }}
          >
            Connect with India's{' '}
            <span
              className="relative inline-block"
              style={{ color: '#EA6C2A' }}
            >
              best freelancers
              {/* Underline squiggle */}
              <svg
                className="absolute -bottom-1 left-0 w-full"
                height="8" viewBox="0 0 400 8" preserveAspectRatio="none"
                fill="none"
              >
                <path
                  d="M2 5 Q50 1 100 5 Q150 9 200 5 Q250 1 300 5 Q350 9 398 5"
                  stroke="#EA6C2A" strokeWidth="2.5" strokeLinecap="round"
                  opacity="0.45"
                />
              </svg>
            </span>
            <br />smarter than ever.
          </h1>

          {/* Sub-headline */}
          <p
            className="text-[#6b6762] mb-12 mx-auto leading-relaxed animate-slide-up"
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              maxWidth: '560px',
              animationDelay: '0.12s',
            }}
          >
            Post projects, get AI-matched freelancers, collaborate in real-time,
            and pay securely through escrow. Built for the Indian market.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14 animate-slide-up"
            style={{ animationDelay: '0.18s' }}
          >
            <Link
              to="/projects/create"
              className="group flex items-center gap-2.5 bg-[#111110] hover:bg-[#2a2a28] text-white font-bold rounded-2xl transition-all duration-200 shadow-xl shadow-black/15 hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-0.5 active:scale-[0.97]"
              style={{ padding: '14px 28px', fontSize: '1rem' }}
            >
              Post a Project Free
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/projects"
              className="group flex items-center gap-2.5 bg-white hover:bg-[#f7f4f1] text-[#111110] border border-[#ddd9d4] hover:border-[#ccc8c3] font-bold rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97]"
              style={{ padding: '14px 28px', fontSize: '1rem' }}
            >
              Browse Projects
              <ArrowRightIcon className="w-4 h-4 text-[#9a9590] group-hover:text-[#111110] group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>

          {/* Trust row */}
          <div
            className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5 animate-slide-up"
            style={{ animationDelay: '0.24s' }}
          >
            {[
              { icon: '🆓', label: 'Free to join' },
              { icon: '🔒', label: 'Escrow-secured payments' },
              { icon: '🤖', label: 'Hugging Face AI' },
              { icon: '⚡', label: 'Razorpay instant payouts' },
            ].map(item => (
              <span key={item.label} className="flex items-center gap-1.5 text-sm text-[#9a9590]">
                <span>{item.icon}</span>
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* Social proof avatars */}
        <div className="flex justify-center mt-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3 bg-white border border-[#e8e4df] rounded-2xl px-5 py-3.5 shadow-sm">
            <div className="flex -space-x-2.5">
              {['AK','RM','AP','KD','NJ'].map((init, i) => (
                <div
                  key={init}
                  className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm"
                  style={{
                    background: ['#EA6C2A','#3b82f6','#10b981','#f59e0b','#8b5cf6'][i],
                    zIndex: 5 - i,
                  }}
                >
                  {init}
                </div>
              ))}
            </div>
            <div>
              <div className="flex gap-px mb-0.5">
                {[1,2,3,4,5].map(i => <StarIcon key={i} className="w-3.5 h-3.5 text-[#EA6C2A] fill-[#EA6C2A]" />)}
              </div>
              <p className="text-[0.78rem] text-[#6b6762] font-medium">
                Joined by <span className="text-[#111110] font-bold">500+</span> early adopters
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ STATS ══════════════════════ */}
      <section className="py-16 border-y border-[#e8e4df]" style={{ background: 'linear-gradient(to bottom, #f7f4f1, #FDFCFB)' }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p
                  className="font-black text-[#111110] mb-1"
                  style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', letterSpacing: '-0.03em' }}
                >
                  {s.value}
                </p>
                <p className="text-sm text-[#9a9590] font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ FEATURES ══════════════════════ */}
      <section className="py-28 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Section header */}
          <div className="text-center mb-20">
            <span className="pill-badge mb-6 inline-flex">
              <SparklesIcon className="w-4 h-4 text-[#EA6C2A]" />
              Platform Features
            </span>
            <h2
              className="font-black text-[#111110] mb-5"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', letterSpacing: '-0.03em', lineHeight: 1.08 }}
            >
              Everything you need to{' '}
              <span style={{ color: '#EA6C2A' }}>succeed</span>
            </h2>
            <p className="text-[#6b6762] text-lg max-w-xl mx-auto">
              From AI matching to secure payments — every tool built for India's freelance economy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="group bg-white border border-[#e8e4df] hover:border-[#d0cbc5] rounded-2xl p-7 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5 cursor-default"
              >
                <div className={`inline-flex items-center gap-2 badge ${accentColors[f.accent]} rounded-full px-3 py-1 text-xs font-bold mb-5 border`}>
                  <f.icon className="w-3.5 h-3.5" />
                  {f.label}
                </div>
                <h3 className="text-lg font-bold text-[#111110] mb-2.5 leading-snug">{f.title}</h3>
                <p className="text-[#9a9590] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ HOW IT WORKS ══════════════════════ */}
      <section className="py-28 px-4" style={{ background: 'linear-gradient(to bottom, #f7f4f1, #FDFCFB)' }}>
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-20">
            <span className="pill-badge mb-6 inline-flex">How It Works</span>
            <h2
              className="font-black text-[#111110]"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', letterSpacing: '-0.03em', lineHeight: 1.08 }}
            >
              Up and running in{' '}
              <span style={{ color: '#EA6C2A' }}>3 steps</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line (desktop) */}
            <div
              className="hidden md:block absolute top-9 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px"
              style={{ background: 'linear-gradient(to right, #e4e0db, #EA6C2A40, #e4e0db)' }}
            />

            {steps.map((s, i) => (
              <div key={s.n} className="relative text-center group">
                {/* Number circle */}
                <div className="inline-flex w-[4.5rem] h-[4.5rem] rounded-2xl bg-white border border-[#e8e4df] shadow-sm items-center justify-center mb-7 group-hover:border-[#EA6C2A]/40 group-hover:shadow-md transition-all duration-300">
                  <span
                    className="font-black"
                    style={{ fontSize: '1.5rem', color: '#EA6C2A', letterSpacing: '-0.04em' }}
                  >
                    {s.n}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#111110] mb-2.5">{s.title}</h3>
                <p className="text-[#9a9590] text-sm leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ BUILT DIFFERENT ══════════════════════ */}
      <section className="py-28 px-4" style={{ background: 'linear-gradient(to bottom, #FDFCFB, #f7f4f1)' }}>
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-20">
            <span className="pill-badge mb-6 inline-flex">
              <BoltIcon className="w-4 h-4 text-[#EA6C2A]" />
              What makes us different
            </span>
            <h2
              className="font-black text-[#111110]"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', letterSpacing: '-0.03em', lineHeight: 1.08 }}
            >
              Not another{' '}
              <span style={{ color: '#EA6C2A' }}>copy-paste</span> platform
            </h2>
            <p className="text-[#9a9590] mt-5 max-w-xl mx-auto text-base leading-relaxed">
              SkillSphere was built ground-up for India — with real AI, real escrow, and real-time everything.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* Card 1 — AI matching */}
            <div className="relative rounded-3xl p-7 overflow-hidden group hover:-translate-y-1 transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #fff8f4 0%, #fff 100%)', border: '1px solid #f0c9a8' }}>
              <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-10"
                style={{ background: '#EA6C2A' }} />
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="font-black text-lg mb-2" style={{ color: '#111110' }}>Real AI, Not Rules</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#6b6762' }}>
                Most platforms match by keywords. We use <strong>Hugging Face</strong> sentence embeddings to understand <em>meaning</em> — so a "React expert" matches "frontend engineer" correctly.
              </p>
              <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: 'rgba(234,108,42,0.1)', color: '#EA6C2A' }}>
                🧠 Semantic matching engine
              </div>
            </div>

            {/* Card 2 — Escrow */}
            <div className="relative rounded-3xl p-7 overflow-hidden group hover:-translate-y-1 transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #f0fdf8 0%, #fff 100%)', border: '1px solid #a7f3d0' }}>
              <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-10"
                style={{ background: '#10b981' }} />
              <div className="text-3xl mb-4">🔐</div>
              <h3 className="font-black text-lg mb-2" style={{ color: '#111110' }}>Escrow That Actually Works</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#6b6762' }}>
                Powered by <strong>Razorpay</strong>. Funds are locked the moment a project starts — released only when <em>you</em> approve each milestone. No disputes over unpaid work.
              </p>
              <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#059669' }}>
                🛡️ Razorpay-secured escrow
              </div>
            </div>

            {/* Card 3 — India-first */}
            <div className="relative rounded-3xl p-7 overflow-hidden group hover:-translate-y-1 transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fff 100%)', border: '1px solid #fde68a' }}>
              <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-10"
                style={{ background: '#f59e0b' }} />
              <div className="text-3xl mb-4">🇮🇳</div>
              <h3 className="font-black text-lg mb-2" style={{ color: '#111110' }}>Built for Bharat</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#6b6762' }}>
                INR payments, local milestone structures, hyperlocal freelancer discovery by city — and UPI-friendly Razorpay checkout. Not a fork of a Western platform.
              </p>
              <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706' }}>
                💸 INR + Razorpay native
              </div>
            </div>

            {/* Card 4 — Real-time */}
            <div className="relative rounded-3xl p-7 overflow-hidden group hover:-translate-y-1 transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #fff 100%)', border: '1px solid #bfdbfe' }}>
              <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-10"
                style={{ background: '#3b82f6' }} />
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="font-black text-lg mb-2" style={{ color: '#111110' }}>Zero-lag Collaboration</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#6b6762' }}>
                <strong>Socket.IO</strong> powers instant messaging, live typing indicators, file sharing, and milestone update pings — all inside the platform, no WhatsApp needed.
              </p>
              <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: 'rgba(59,130,246,0.1)', color: '#2563eb' }}>
                💬 Socket.IO real-time chat
              </div>
            </div>

            {/* Card 5 — Open source stack */}
            <div className="relative rounded-3xl p-7 overflow-hidden group hover:-translate-y-1 transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #fdf4ff 0%, #fff 100%)', border: '1px solid #e9d5ff' }}>
              <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-10"
                style={{ background: '#8b5cf6' }} />
              <div className="text-3xl mb-4">🛠️</div>
              <h3 className="font-black text-lg mb-2" style={{ color: '#111110' }}>Production-grade Stack</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#6b6762' }}>
                MERN architecture with Redux Toolkit, JWT auth, Cloudinary media, Mongoose schemas, and a milestone-based payment engine — production-ready, not a prototype.
              </p>
              <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: 'rgba(139,92,246,0.1)', color: '#7c3aed' }}>
                ⚙️ MERN + Redux + Socket.IO
              </div>
            </div>

            {/* Card 6 — Milestone CTA */}
            <div className="relative rounded-3xl p-7 overflow-hidden group hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              style={{ background: 'linear-gradient(135deg, #111110 0%, #2a2520 100%)' }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 70% 60% at 80% 20%, rgba(234,108,42,0.25) 0%, transparent 70%)' }} />
              <div>
                <div className="text-3xl mb-4">🚀</div>
                <h3 className="font-black text-lg mb-2 text-white">Ready to try it?</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Create your free account in 60 seconds. No credit card. No setup fees. Just post your first project and let the AI do the rest.
                </p>
              </div>
              <Link to="/register"
                className="mt-6 inline-flex items-center gap-2 font-bold text-sm rounded-xl px-4 py-2.5 transition-all duration-200 hover:-translate-y-0.5 self-start"
                style={{ background: '#EA6C2A', color: 'white' }}>
                Get started free <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>


      {/* ══════════════════════ CTA BANNER ══════════════════════ */}
      <section className="px-4 py-10 pb-24">
        <div
          className="max-w-5xl mx-auto rounded-3xl text-center px-8 py-20 relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #111110 0%, #2a2520 100%)',
          }}
        >
          {/* Subtle orange radial inside dark card */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(234,108,42,0.18) 0%, transparent 70%)',
            }}
          />

          {/* Pill */}
          <div className="flex justify-center mb-8 relative">
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-sm text-white/80 font-semibold">
              <SparklesIcon className="w-4 h-4 text-[#EA6C2A]" />
              Be among our early adopters
            </span>
          </div>

          <h2
            className="font-black text-white mb-5 relative"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)', letterSpacing: '-0.03em', lineHeight: 1.05 }}
          >
            Ready to build{' '}
            <span style={{ color: '#EA6C2A' }}>something great?</span>
          </h2>

          <p className="text-white/55 text-lg mb-12 max-w-lg mx-auto relative">
            Post your first project for free. No credit card needed. Get matched in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
            <Link
              to="/register"
              className="group flex items-center gap-2.5 bg-white hover:bg-[#f7f4f1] text-[#111110] font-bold rounded-2xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:scale-[0.97]"
              style={{ padding: '15px 32px', fontSize: '1.05rem' }}
            >
              <SparklesIcon className="w-4 h-4 text-[#EA6C2A]" />
              Get Started — It's Free
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/projects"
              className="text-white/60 hover:text-white font-semibold text-base flex items-center gap-1.5 transition-colors"
              style={{ padding: '15px 24px' }}
            >
              Browse Projects
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          {/* Bottom payment badge */}
          <div className="flex items-center justify-center gap-2 mt-10 relative">
            <CurrencyRupeeIcon className="w-4 h-4 text-white/30" />
            <span className="text-sm text-white/35">Payments secured by Razorpay escrow</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
