'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../utils/api';
import toast from 'react-hot-toast';
import {
  Briefcase, Plus, Users, DollarSign,
  Clock, CheckCircle, LogOut, Star,
  ChevronRight, Bell, Settings, Search, TrendingUp
} from 'lucide-react';

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'client') { router.push('/dashboard/freelancer'); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [pRes, pyRes] = await Promise.all([
        API.get('/projects/my/projects'),
        API.get('/payments/my')
      ]);
      setProjects(pRes.data.projects);
      setPayments(pyRes.data.payments);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const totalSpent = payments.reduce((s, p) => s + Number(p.amount), 0);

  const stats = [
    { label: 'Total Projects', value: projects.length,                                          icon: <Briefcase size={20} style={{ color: 'var(--gold)' }} />,    bg: 'rgba(201,168,76,0.08)' },
    { label: 'In Progress',    value: projects.filter(p => p.status === 'in_progress').length,  icon: <Clock size={20} style={{ color: 'var(--info)' }} />,         bg: 'rgba(59,130,246,0.08)' },
    { label: 'Completed',      value: projects.filter(p => p.status === 'completed').length,    icon: <CheckCircle size={20} style={{ color: 'var(--success)' }} />, bg: 'rgba(16,185,129,0.08)' },
    { label: 'Total Spent',    value: `₹${totalSpent.toLocaleString()}`,                        icon: <TrendingUp size={20} style={{ color: 'var(--gold)' }} />,     bg: 'rgba(201,168,76,0.08)' },
  ];

  const statusBadge = {
    open:        'badge badge-blue',
    in_progress: 'badge badge-gold',
    completed:   'badge badge-green',
    cancelled:   'badge badge-red',
  };

  if (loading) return (
    <div className="spinner-wrap">
      <div><div className="spinner" /><p className="spinner-text">Loading dashboard...</p></div>
    </div>
  );

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon"><Briefcase size={18} style={{ color: 'var(--navy)' }} /></div>
          <span className="logo-text">FreelanceHub</span>
        </div>

        <div className="sidebar-user">
          <div className="avatar avatar-gold">{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--white)' }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--gold)' }}>Client Account</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {[
            { icon: <Briefcase size={17} />, label: 'My Projects',   active: true,  action: () => {} },
            { icon: <Search size={17} />,    label: 'Find Talent',   active: false, action: () => router.push('/freelancers') },
            { icon: <DollarSign size={17} />,label: 'Payments',      active: false, action: () => {} },
            { icon: <Star size={17} />,      label: 'Reviews',       active: false, action: () => {} },
            { icon: <Settings size={17} />,  label: 'Settings',      active: false, action: () => {} },
          ].map((item, i) => (
            <button key={i} onClick={item.action}
              className={`sidebar-link${item.active ? ' active-gold' : ''}`}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link danger" onClick={logout}>
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="dashboard-main">

        {/* Header */}
        <div className="dashboard-header">
          <div>
            <p className="dashboard-subtitle">Good day,</p>
            <h1 className="dashboard-title">{user?.name} 👋</h1>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--navy-3)', border: '1px solid rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={18} style={{ color: 'var(--slate-light)' }} />
            </button>
            <button className="btn btn-gold" onClick={() => router.push('/projects/create')}>
              <Plus size={16} /> Post Project
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Projects Table */}
        <div className="table-card">
          <div className="table-header">
            <span className="table-title">My Projects</span>
            <button className="btn btn-gold btn-sm" onClick={() => router.push('/projects/create')}>
              <Plus size={14} /> New Project
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="empty-state">
              <Briefcase size={40} className="empty-icon" />
              <p className="empty-title">No projects yet</p>
              <p className="empty-desc">Post your first project and start receiving bids</p>
              <button className="btn btn-gold" onClick={() => router.push('/projects/create')}>
                Post First Project
              </button>
            </div>
          ) : (
            <>
              <div className="table-head" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                <span>Project</span><span>Budget</span><span>Status</span><span>Action</span>
              </div>
              {projects.map(p => (
                <div key={p.id} className="table-row" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--white)', marginBottom: 4 }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--slate)' }}>{p.skills_required?.slice(0,2).join(', ')}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gold)' }}>₹{Number(p.budget).toLocaleString()}</div>
                  <div><span className={statusBadge[p.status] || 'badge badge-slate'}>{p.status.replace('_',' ')}</span></div>
                  <div>
                    <button className="btn btn-outline btn-sm" onClick={() => router.push(`/projects/${p.id}`)}>
                      View Bids <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Payments */}
        {payments.length > 0 && (
          <div className="table-card">
            <div className="table-header">
              <span className="table-title">Recent Payments</span>
            </div>
            {payments.slice(0, 5).map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 28px', borderBottom: '1px solid rgba(201,168,76,0.05)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--white)' }}>{p.milestone_title}</div>
                  <div style={{ fontSize: 12, color: 'var(--slate)' }}>{p.project_title}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gold)' }}>₹{Number(p.amount).toLocaleString()}</div>
                  <span className={p.escrow_status === 'released' ? 'badge badge-green' : 'badge badge-gold'}>
                    {p.escrow_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}