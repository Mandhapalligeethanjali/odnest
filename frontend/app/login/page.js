'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Briefcase, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      toast.success('Welcome back!');
      if (user.role === 'client') router.push('/dashboard/client');
      else if (user.role === 'freelancer') router.push('/dashboard/freelancer');
      else router.push('/dashboard/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* LEFT SECTION - Brand Side */}
      <div className="auth-left">
        <div className="auth-left-dots" />
        <div className="auth-left-glow" />

        <div className="navbar-logo" style={{ position: 'relative' }}>
          <div className="logo-icon">
            <Briefcase size={18} style={{ color: 'var(--navy)' }} />
          </div>
          <span className="logo-text">ODnest</span>
        </div>

        <div style={{ position: 'relative' }}>
          <h2 className="auth-tagline">
            Welcome<br />
            <span>Back to Success</span>
          </h2>
          <p className="auth-tagline-desc">
            Access your projects, connect with clients, and grow your freelance career on India's most professional platform.
          </p>
          
          <div className="auth-feature-list">
            {[
              'Access your personalized dashboard',
              'Manage ongoing projects',
              'Track your earnings in real-time',
              'Connect with top professionals'
            ].map((feature, i) => (
              <div key={i} className="auth-feature">
                <div className="auth-feature-dot">
                  <div className="auth-feature-dot-inner" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'var(--slate)', position: 'relative' }}>
          © 2025 ODnest. All rights reserved.
        </p>
      </div>

      {/* RIGHT SECTION - Login Form */}
      <div className="auth-right">
        <div className="auth-form-box">
          <button className="auth-back" onClick={() => router.push('/')}>
            <ArrowLeft size={16} /> Back to home
          </button>

          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to your account</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="input"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="input"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  style={{ paddingRight: 48 }}
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-gold btn-full"
              disabled={loading}
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="divider" style={{ margin: '24px 0' }} />

          {/* Test Accounts */}
          <div className="auth-quick">
            <div className="auth-quick-label">Quick Test Login:</div>
            <div className="auth-quick-btns">
              <button
                type="button"
                className="auth-quick-btn"
                onClick={() => setFormData({ email: 'client@test.com', password: '123456' })}
                style={{ 
                  background: 'rgba(201,168,76,0.05)', 
                  border: '1px solid rgba(201,168,76,0.2)',
                  borderRadius: '8px',
                  padding: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: 'var(--gold)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(201,168,76,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(201,168,76,0.05)'}
              >
                Client Account
              </button>
              <button
                type="button"
                className="auth-quick-btn"
                onClick={() => setFormData({ email: 'freelancer@test.com', password: '123456' })}
                style={{ 
                  background: 'rgba(201,168,76,0.05)', 
                  border: '1px solid rgba(201,168,76,0.2)',
                  borderRadius: '8px',
                  padding: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: 'var(--gold)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(201,168,76,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(201,168,76,0.05)'}
              >
                Freelancer Account
              </button>
            </div>
          </div>

          <p className="auth-footer-text">
            Don't have an account?{' '}
            <button className="auth-footer-link" onClick={() => router.push('/register')}>
              Create account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}