'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../utils/api';
import toast from 'react-hot-toast';
import {
  Briefcase, Search, DollarSign, Clock,
  Star, LogOut, Settings, Bell,
  ChevronRight, TrendingUp, CheckCircle, MessageSquare, Mail
} from 'lucide-react';

export default function FreelancerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [bids, setBids] = useState([]);
  const [payments, setPayments] = useState([]);
  const [invitationsCount, setInvitationsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'freelancer') { router.push('/dashboard/client'); return; }
    fetchData();
    fetchInvitationsCount();
  }, [user]);

  const fetchData = async () => {
    try {
      const [bRes, pRes] = await Promise.all([
        API.get('/bids/my/bids'),
        API.get('/payments/my')
      ]);
      setBids(bRes.data.bids || []);
      setPayments(pRes.data.payments || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitationsCount = async () => {
    try {
      const response = await API.get('/projects/invitations');
      setInvitationsCount(response.data.invitations?.length || 0);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const earned = payments.filter(p => p.escrow_status === 'released').reduce((s, p) => s + Number(p.amount), 0);

  const stats = [
    { label: 'Proposals Sent', value: bids.length, icon: <Briefcase size={20} style={{ color: 'var(--gold)' }} />, bg: 'rgba(201,168,76,0.08)' },
    { label: 'Accepted', value: bids.filter(b => b.status === 'accepted').length, icon: <CheckCircle size={20} style={{ color: 'var(--success)' }} />, bg: 'rgba(16,185,129,0.08)' },
    { label: 'Pending', value: bids.filter(b => b.status === 'pending').length, icon: <Clock size={20} style={{ color: 'var(--info)' }} />, bg: 'rgba(59,130,246,0.08)' },
    { label: 'Total Earned', value: `₹${earned.toLocaleString()}`, icon: <TrendingUp size={20} style={{ color: 'var(--gold)' }} />, bg: 'rgba(201,168,76,0.08)' },
  ];

  const bidBadge = {
    pending: 'badge badge-blue',
    accepted: 'badge badge-green',
    rejected: 'badge badge-red',
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
          <span className="logo-text">ODnest</span>
        </div>

        <div className="sidebar-user">
          <div className="avatar avatar-green">{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--white)' }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--success)' }}>Freelancer</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button onClick={() => router.push('/dashboard/freelancer')} className="sidebar-link active-green">
            <Briefcase size={17} /> My Bids
          </button>
          <button onClick={() => router.push('/dashboard/freelancer/browse-projects')} className="sidebar-link">
            <Search size={17} /> Browse Projects
          </button>
          <button onClick={() => router.push('/dashboard/freelancer/invitations')} className="sidebar-link">
            <Mail size={17} /> Invitations
            {invitationsCount > 0 && (
              <span className="badge badge-gold" style={{ marginLeft: 'auto' }}>
                {invitationsCount}
              </span>
            )}
          </button>
          <button onClick={() => router.push('/dashboard/freelancer/earnings')} className="sidebar-link">
            <DollarSign size={17} /> Earnings
          </button>
          <button onClick={() => router.push('/dashboard/freelancer/reviews')} className="sidebar-link">
            <Star size={17} /> Reviews
          </button>
          <button onClick={() => router.push('/dashboard/messages')} className="sidebar-link">
            <MessageSquare size={17} /> Messages
          </button>
          <button onClick={() => router.push('/dashboard/settings')} className="sidebar-link">
            <Settings size={17} /> Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link danger" onClick={logout}>
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT - Keep your existing main content here */}
      <main className="dashboard-main">
        {/* Your existing dashboard content */}
        <div className="dashboard-header">
          <div>
            <p className="dashboard-subtitle">Welcome back,</p>
            <h1 className="dashboard-title">{user?.name} 👋</h1>
          </div>
          <button className="btn btn-success" onClick={() => router.push('/dashboard/freelancer/browse-projects')}>
            <Search size={16} /> Find Projects
          </button>
        </div>

        <div className="stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bids Table */}
        <div className="table-card">
          <div className="table-header">
            <span className="table-title">My Proposals</span>
            <button className="btn btn-success btn-sm" onClick={() => router.push('/dashboard/freelancer/browse-projects')}>
              Browse Projects →
            </button>
          </div>

          {bids.length === 0 ? (
            <div className="empty-state">
              <Search size={40} className="empty-icon" />
              <p className="empty-title">No proposals yet</p>
              <p className="empty-desc">Browse open projects and start submitting proposals</p>
              <button className="btn btn-success" onClick={() => router.push('/dashboard/freelancer/browse-projects')}>
                Browse Projects
              </button>
            </div>
          ) : (
            <>
              <div className="table-head" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                <span>Project</span><span>My Bid</span><span>Status</span><span>Action</span>
              </div>
              {bids.map(b => (
                <div key={b.id} className="table-row" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--white)', marginBottom: 4 }}>{b.project_title}</div>
                    <div style={{ fontSize: 12, color: 'var(--slate)' }}>{b.delivery_days} day delivery</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--success)' }}>₹{Number(b.amount).toLocaleString()}</div>
                  <div><span className={bidBadge[b.status] || 'badge badge-slate'}>{b.status}</span></div>
                  <div>
                    <button className="btn btn-outline btn-sm" onClick={() => router.push(`/projects/${b.project_id}`)}>
                      View <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </main>
    </div>
  );
}