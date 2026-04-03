'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import API from '../../../../utils/api';
import toast from 'react-hot-toast';
import { 
  DollarSign, TrendingUp, Calendar, Wallet, 
  Download, Briefcase, Search, Star, 
  LogOut, Settings, ArrowLeft 
} from 'lucide-react';

export default function Earnings() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [earnings, setEarnings] = useState({
    total_earned: 0,
    pending_payments: 0,
    completed_projects: 0,
    transactions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) router.push('/login');
    else fetchEarnings();
  }, [user]);

  const fetchEarnings = async () => {
    try {
      const response = await API.get('/payments/my');
      const payments = response.data.payments || [];
      
      const released = payments.filter(p => p.escrow_status === 'released');
      const pending = payments.filter(p => p.escrow_status === 'held');
      
      setEarnings({
        total_earned: released.reduce((s, p) => s + Number(p.amount), 0),
        pending_payments: pending.reduce((s, p) => s + Number(p.amount), 0),
        completed_projects: released.length,
        transactions: payments
      });
    } catch (error) {
      console.error('Error fetching earnings:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Earned', value: `₹${earnings.total_earned?.toLocaleString() || 0}`, icon: <DollarSign size={20} />, bg: 'rgba(201,168,76,0.08)' },
    { label: 'Pending Payments', value: `₹${earnings.pending_payments?.toLocaleString() || 0}`, icon: <Wallet size={20} />, bg: 'rgba(59,130,246,0.08)' },
    { label: 'Completed Projects', value: earnings.completed_projects || 0, icon: <TrendingUp size={20} />, bg: 'rgba(16,185,129,0.08)' }
  ];

  if (!user) return null;

  if (loading) return (
    <div className="spinner-wrap">
      <div><div className="spinner" /><p className="spinner-text">Loading earnings...</p></div>
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
          <button onClick={() => router.push('/dashboard/freelancer')} className="sidebar-link">
            <Briefcase size={17} /> My Bids
          </button>
          <button onClick={() => router.push('/dashboard/freelancer/browse-projects')} className="sidebar-link">
            <Search size={17} /> Browse Projects
          </button>
          <button onClick={() => router.push('/dashboard/freelancer/earnings')} className="sidebar-link active-green">
            <DollarSign size={17} /> Earnings
          </button>
          <button onClick={() => router.push('/dashboard/freelancer/reviews')} className="sidebar-link">
            <Star size={17} /> Reviews
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

      {/* MAIN CONTENT */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <div className="dashboard-subtitle">Financial Overview</div>
            <h1 className="dashboard-title">Earnings</h1>
          </div>
          <button className="btn btn-outline" onClick={() => router.push('/dashboard/freelancer')}>
            Back to Dashboard
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-card">
              <div className="stat-icon" style={{ background: stat.bg }}>
                {stat.icon}
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Transactions Table */}
        <div className="table-card">
          <div className="table-header">
            <h3 className="table-title">Transaction History</h3>
            <button className="btn btn-outline btn-sm">
              <Download size={14} /> Export
            </button>
          </div>
          <div className="table-head" style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr' }}>
            <span>Date</span>
            <span>Project</span>
            <span>Amount</span>
            <span>Status</span>
          </div>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            {earnings.transactions?.length === 0 ? (
              <div className="empty-state" style={{ padding: 40 }}>
                <p className="empty-desc">No transactions yet</p>
              </div>
            ) : (
              earnings.transactions?.map((transaction) => (
                <div key={transaction.id} className="table-row" style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr' }}>
                  <span style={{ fontSize: 13 }}>{new Date(transaction.created_at).toLocaleDateString()}</span>
                  <span style={{ fontSize: 13 }}>{transaction.project_title || 'N/A'}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gold)' }}>₹{Number(transaction.amount).toLocaleString()}</span>
                  <span>
                    <span className={`badge ${transaction.escrow_status === 'released' ? 'badge-green' : 'badge-blue'}`}>
                      {transaction.escrow_status === 'released' ? 'Released' : 'In Escrow'}
                    </span>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}