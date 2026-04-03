'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Briefcase, Eye, EyeOff, ArrowLeft, Users, Building2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm]         = useState({ name: '', email: '', password: '', role: '', location: '' });
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.role) return toast.error('Please select your role');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role, form.location);
      toast.success('Account created!');
      router.push(user.role === 'client' ? '/dashboard/client' : '/dashboard/freelancer');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">

      {/* LEFT */}
      <div className="auth-left">
        <div className="auth-left-dots" />
        <div className="auth-left-glow" />

        <div className="navbar-logo" style={{ position: 'relative' }}>
          <div className="logo-icon"><Briefcase size={18} style={{ color: 'var(--navy)' }} /></div>
          <span className="logo-text">FreelanceHub</span>
        </div>

        <div style={{ position: 'relative' }}>
          <h2 className="auth-tagline">Join the<br /><span>Elite Network.</span></h2>
          <p className="auth-tagline-desc">
            Connect with top clients and premium projects.
            Build your reputation on India's most professional platform.
          </p>
          <div className="auth-stat-row">
            {[
              { v: '12,000+', l: 'Verified Professionals' },
              { v: '₹3.2 Cr+', l: 'Paid to Freelancers' },
              { v: '4.9★', l: 'Average Platform Rating' },
            ].map((s, i) => (
              <div key={i} className="auth-stat">
                <span className="auth-stat-val">{s.v}</span>
                <span className="auth-stat-label">{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'var(--slate)', position: 'relative' }}>© 2025 FreelanceHub</p>
      </div>

      {/* RIGHT */}
      <div className="auth-right">
        <div className="auth-form-box">
          <button className="auth-back" onClick={() => router.push('/')}>
            <ArrowLeft size={16} /> Back to home
          </button>

          <h2 className="auth-title">Create account</h2>
          <p className="auth-subtitle">Join the FreelanceHub professional network</p>

          <form className="auth-form" onSubmit={submit}>

            {/* Role */}
            <div className="input-group">
              <label className="input-label">I want to</label>
              <div className="role-grid">
                {[
                  { role: 'client',     icon: <Building2 size={20} />, title: 'Hire Talent',  sub: "I'm a client" },
                  { role: 'freelancer', icon: <Users size={20} />,     title: 'Find Work',    sub: "I'm a freelancer" },
                ].map((r) => (
                  <button key={r.role} type="button"
                    className={`role-card${form.role === r.role ? ' active' : ''}`}
                    onClick={() => setForm({ ...form, role: r.role })}
                    style={{ color: form.role === r.role ? 'var(--gold)' : 'var(--slate-light)' }}>
                    {r.icon}
                    <div className="role-card-title">{r.title}</div>
                    <div className="role-card-sub">{r.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {[
              { label: 'Full Name',      name: 'name',     type: 'text',  placeholder: 'John Doe',           req: true },
              { label: 'Email Address',  name: 'email',    type: 'email', placeholder: 'you@example.com',    req: true },
              { label: 'Location',       name: 'location', type: 'text',  placeholder: 'Hyderabad, India',   req: false },
            ].map((f) => (
              <div key={f.name} className="input-group">
                <label className="input-label">{f.label}</label>
                <input className="input" type={f.type} name={f.name}
                  value={form[f.name]} onChange={handle}
                  required={f.req} placeholder={f.placeholder} />
              </div>
            ))}

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrap">
                <input className="input" type={showPass ? 'text' : 'password'}
                  name="password" value={form.password} onChange={handle}
                  required placeholder="Min 6 characters"
                  style={{ paddingRight: 48 }} />
                <button type="button" className="input-icon-right" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-gold btn-full"
              style={{ opacity: loading ? 0.6 : 1 }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account?{' '}
            <button className="auth-footer-link" onClick={() => router.push('/login')}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}