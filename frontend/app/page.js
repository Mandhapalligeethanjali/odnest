'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase, Users, Shield, Zap,
  Star, ArrowRight, MapPin, Globe,
  CheckCircle, TrendingUp, Award
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div style={{ background: 'var(--navy)', minHeight: '100vh' }}>

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-logo">
            <div className="logo-icon">
              <Briefcase size={18} style={{ color: 'var(--navy)' }} />
            </div>
            <span className="logo-text">FreelanceHub</span>
          </div>

          <div className="navbar-links">
            <button className="navbar-link" onClick={() => router.push('/projects')}>Projects</button>
            <button className="navbar-link" onClick={() => router.push('/freelancers')}>Talent</button>
            <button className="navbar-link">How It Works</button>
          </div>

          <div className="navbar-actions">
            {user ? (
              <button className="btn btn-gold btn-sm"
                onClick={() => router.push(user.role === 'client' ? '/dashboard/client' : '/dashboard/freelancer')}>
                Dashboard
              </button>
            ) : (
              <>
                <button className="btn btn-ghost btn-sm" onClick={() => router.push('/login')}>Sign In</button>
                <button className="btn btn-gold btn-sm" onClick={() => router.push('/register')}>Get Started</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg-glow-1" />
        <div className="hero-bg-glow-2" />
        <div className="hero-bg-dots" />

        <div className="container" style={{ position: 'relative' }}>
          <div className="hero-content">
            <div className="hero-pill">
              <MapPin size={13} />
              India's Premier Hyperlocal Freelance Platform
            </div>

            <h1 className="hero-title">
              Where Elite Talent<br />
              <span>Meets Opportunity</span>
            </h1>

            <p className="hero-desc">
              AI-powered matching, milestone-based escrow, and real-time collaboration.
              The professional standard for freelance work in India.
            </p>

            <div className="hero-actions">
              <button className="btn btn-gold btn-lg" onClick={() => router.push('/register')}>
                Post a Project <ArrowRight size={18} />
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => router.push('/freelancers')}>
                Browse Talent
              </button>
            </div>

            <div className="hero-checks">
              {['No upfront fees', 'Secure escrow payments', 'Verified professionals'].map((t, i) => (
                <div key={i} className="hero-check">
                  <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div className="hero-stats">
            {[
              { value: '12,000+', label: 'Active Freelancers', icon: <Users size={18} style={{ color: 'var(--gold)' }} /> },
              { value: '₹3.2 Cr+', label: 'Total Paid Out',    icon: <TrendingUp size={18} style={{ color: 'var(--success)' }} /> },
              { value: '8,500+',  label: 'Projects Done',      icon: <Briefcase size={18} style={{ color: 'var(--gold)' }} /> },
            ].map((s, i) => (
              <div key={i} className="hero-stat-card">
                <div style={{ marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--white)' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* FEATURES */}
      <section className="section">
        <div className="container">
          <p className="section-label">Why FreelanceHub</p>
          <h2 className="section-title">Built for the Modern<br />Professional</h2>

          <div className="feature-grid">
            {[
              { icon: <MapPin size={22} style={{ color: 'var(--gold)' }} />,    tag: 'Local + Global', title: 'Hyperlocal Discovery',    desc: 'Find verified professionals in your city for in-person collaboration and faster delivery.' },
              { icon: <Shield size={22} style={{ color: 'var(--success)' }} />, tag: '100% Secure',    title: 'Milestone Escrow',        desc: 'Funds held securely and released only upon your explicit approval of each deliverable.' },
              { icon: <Zap size={22} style={{ color: 'var(--gold)' }} />,       tag: 'Smart Matching', title: 'AI Skill Matching',        desc: 'Our TF-IDF algorithm surfaces the most relevant talent for your exact project needs.' },
              { icon: <Globe size={22} style={{ color: 'var(--gold)' }} />,     tag: 'Always On',      title: 'Real-Time Collaboration',  desc: 'Built-in messaging and video calls. Collaborate without ever leaving the platform.' },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <span className="feature-tag">{f.tag}</span>
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section section-alt">
        <div className="container">
          <p className="section-label">Process</p>
          <h2 className="section-title">How It Works</h2>

          <div className="how-grid">
            <div>
              <span className="how-role-badge" style={{ background: 'rgba(201,168,76,0.1)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.2)' }}>
                FOR CLIENTS
              </span>
              {[
                { n: '01', title: 'Post Your Project',   desc: 'Define scope, budget, skills and timeline' },
                { n: '02', title: 'Review Proposals',    desc: 'Evaluate bids from verified professionals' },
                { n: '03', title: 'Fund Escrow',         desc: 'Deposit securely — released when you approve' },
                { n: '04', title: 'Approve & Close',     desc: 'Review deliverables, release payment, leave review' },
              ].map((s, i) => (
                <div key={i} className="how-step">
                  <div className="how-step-num" style={{ color: 'rgba(201,168,76,0.2)' }}>{s.n}</div>
                  <div>
                    <div className="how-step-title">{s.title}</div>
                    <div className="how-step-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <span className="how-role-badge" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)' }}>
                FOR FREELANCERS
              </span>
              {[
                { n: '01', title: 'Build Your Profile', desc: 'Showcase skills, portfolio and set your rates' },
                { n: '02', title: 'Discover Projects',  desc: 'AI surfaces the most relevant opportunities' },
                { n: '03', title: 'Submit Proposals',   desc: 'Craft compelling bids and win quality projects' },
                { n: '04', title: 'Deliver & Earn',     desc: 'Complete milestones and receive instant payments' },
              ].map((s, i) => (
                <div key={i} className="how-step">
                  <div className="how-step-num" style={{ color: 'rgba(16,185,129,0.2)' }}>{s.n}</div>
                  <div>
                    <div className="how-step-title">{s.title}</div>
                    <div className="how-step-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section">
        <div className="container">
          <p className="section-label">Testimonials</p>
          <h2 className="section-title">Trusted by Professionals</h2>

          <div className="testimonial-grid">
            {[
              { name: 'Rahul Sharma', role: 'Startup Founder · Hyderabad', avatar: 'RS', text: 'Found an exceptional developer within hours. The escrow system eliminated all risk. This is how freelancing should work.' },
              { name: 'Priya Mehta',  role: 'UI/UX Designer · Bangalore',  avatar: 'PM', text: 'My revenue tripled in 3 months. The quality of clients here is unmatched. Highly professional platform.' },
              { name: 'Arun Kumar',  role: 'E-commerce Director · Mumbai', avatar: 'AK', text: 'AI matching found the perfect brand designer instantly. The milestone system kept everything on track.' },
            ].map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} style={{ color: 'var(--gold)', fill: 'var(--gold)' }} />
                  ))}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="avatar avatar-gold" style={{ width: 40, height: 40, fontSize: 13 }}>{t.avatar}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-box">
          <div className="cta-bg" />
          <Award size={44} style={{ color: 'var(--gold)', margin: '0 auto 24px' }} />
          <h2 className="cta-title">Begin Your Journey</h2>
          <p className="cta-desc">Join 12,000+ professionals already building their careers on FreelanceHub</p>
          <div className="cta-actions">
            <button className="btn btn-gold btn-lg" onClick={() => router.push('/register')}>
              Create Free Account <ArrowRight size={18} />
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => router.push('/login')}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="navbar-logo">
          <div className="logo-icon" style={{ width: 28, height: 28 }}>
            <Briefcase size={14} style={{ color: 'var(--navy)' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--white)' }}>FreelanceHub</span>
        </div>
        <p className="footer-copy">© 2025 FreelanceHub. Built for India, loved worldwide.</p>
        <div className="footer-links">
          {['Privacy', 'Terms', 'Support'].map(l => (
            <button key={l} className="footer-link">{l}</button>
          ))}
        </div>
      </footer>
    </div>
  );
}