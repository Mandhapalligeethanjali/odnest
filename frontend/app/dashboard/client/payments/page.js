'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import API from '../../../../utils/api';
import toast from 'react-hot-toast';
import {
  Briefcase, Search, DollarSign, Star,
  LogOut, Settings, Wallet, Clock,
  CheckCircle, AlertCircle, Download
} from 'lucide-react';

export default function ClientPayments() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_spent: 0,
    pending_payments: 0,
    completed_payments: 0,
    in_escrow: 0
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchPayments();
  }, [user]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      let paymentsData = [];
      
      try {
        const response = await API.get('/payments/client');
        paymentsData = response?.data?.payments || [];
      } catch (err) {
        console.error('API error:', err);
        paymentsData = [];
      }
      
      setPayments(paymentsData);
      
      // Safely calculate stats with null checks
      const totalSpent = paymentsData
        .filter(p => p?.escrow_status === 'released')
        .reduce((s, p) => s + Number(p?.amount || 0), 0);
      
      const pending = paymentsData
        .filter(p => p?.escrow_status === 'held')
        .reduce((s, p) => s + Number(p?.amount || 0), 0);
      
      const completed = paymentsData.filter(p => p?.escrow_status === 'released').length;
      const inEscrow = paymentsData.filter(p => p?.escrow_status === 'held').length;
      
      setStats({
        total_spent: totalSpent,
        pending_payments: pending,
        completed_payments: completed,
        in_escrow: inEscrow
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payment data');
      setPayments([]);
      setStats({
        total_spent: 0,
        pending_payments: 0,
        completed_payments: 0,
        in_escrow: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const releasePayment = async (paymentId) => {
    try {
      await API.put(`/payments/${paymentId}/release`);
      toast.success('Payment released successfully!');
      fetchPayments();
    } catch (error) {
      console.error('Error releasing payment:', error);
      toast.error(error.response?.data?.message || 'Failed to release payment');
    }
  };

  const statCards = [
    { label: 'Total Spent', value: `₹${(stats.total_spent || 0).toLocaleString()}`, icon: <DollarSign size={20} />, bg: 'rgba(201,168,76,0.08)' },
    { label: 'In Escrow', value: `₹${(stats.pending_payments || 0).toLocaleString()}`, icon: <Wallet size={20} />, bg: 'rgba(59,130,246,0.08)' },
    { label: 'Completed', value: stats.completed_payments || 0, icon: <CheckCircle size={20} />, bg: 'rgba(16,185,129,0.08)' },
    { label: 'Pending Release', value: stats.in_escrow || 0, icon: <Clock size={20} />, bg: 'rgba(245,158,11,0.08)' },
  ];

  if (!user) return null;

  if (loading) return (
    <div className="spinner-wrap">
      <div><div className="spinner" /><p className="spinner-text">Loading payments...</p></div>
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
          <div className="avatar avatar-gold">{user?.name?.charAt(0)?.toUpperCase() || 'C'}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--white)' }}>{user?.name || 'Client'}</div>
            <div style={{ fontSize: 12, color: 'var(--gold)' }}>Client</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button onClick={() => router.push('/dashboard/client')} className="sidebar-link">
            <Briefcase size={17} /> My Projects
          </button>
          <button onClick={() => router.push('/dashboard/client/find-talent')} className="sidebar-link">
            <Search size={17} /> Find Talent
          </button>
          <button onClick={() => router.push('/dashboard/client/post-project')} className="sidebar-link">
            <Briefcase size={17} /> Post Project
          </button>
          <button onClick={() => router.push('/dashboard/client/payments')} className="sidebar-link active-gold">
            <DollarSign size={17} /> Payments
          </button>
          <button onClick={() => router.push('/dashboard/client/reviews')} className="sidebar-link">
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
            <div className="dashboard-subtitle">Financial Transactions</div>
            <h1 className="dashboard-title">Payments</h1>
          </div>
          <button className="btn btn-outline btn-sm">
            <Download size={14} /> Export Statement
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {statCards.map((stat, idx) => (
            <div key={idx} className="stat-card">
              <div className="stat-icon" style={{ background: stat.bg }}>
                {stat.icon}
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Payments Table */}
        <div className="table-card">
          <div className="table-header">
            <h3 className="table-title">Payment History</h3>
          </div>
          <div className="table-head" style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr 1.5fr' }}>
            <span>Date</span>
            <span>Project</span>
            <span>Freelancer</span>
            <span>Amount</span>
            <span>Status</span>
          </div>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            {!payments || payments.length === 0 ? (
              <div className="empty-state" style={{ padding: 60 }}>
                <Wallet size={48} className="empty-icon" />
                <h3 className="empty-title">No payments yet</h3>
                <p className="empty-desc">Payments will appear here when you hire freelancers</p>
              </div>
            ) : (
              payments.map((payment) => (
                <div key={payment.id} className="table-row" style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr 1.5fr' }}>
                  <span style={{ fontSize: 13 }}>
                    {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{payment.project_title || 'N/A'}</span>
                  <span style={{ fontSize: 13 }}>{payment.freelancer_name || 'N/A'}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gold)' }}>
                    ₹{Number(payment.amount || 0).toLocaleString()}
                  </span>
                  <td>
                    {payment.escrow_status === 'held' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span className="badge badge-blue">
                          <Clock size={12} style={{ display: 'inline', marginRight: 4 }} /> In Escrow
                        </span>
                        <button
                          onClick={() => releasePayment(payment.id)}
                          className="btn btn-success btn-sm"
                          style={{ padding: '4px 12px' }}
                        >
                          Release Payment
                        </button>
                      </div>
                    ) : payment.escrow_status === 'released' ? (
                      <span className="badge badge-green">
                        <CheckCircle size={12} style={{ display: 'inline', marginRight: 4 }} /> Released
                      </span>
                    ) : (
                      <span className="badge badge-slate">Unknown</span>
                    )}
                  </td>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment Info */}
        <div className="card" style={{ marginTop: 24, background: 'rgba(59,130,246,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <AlertCircle size={20} style={{ color: 'var(--info)' }} />
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>How Payments Work</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, fontSize: 13, color: 'var(--slate-light)' }}>
            <div>1. Funds are held in escrow when you hire a freelancer</div>
            <div>2. Review the completed work</div>
            <div>3. Release payment when satisfied with deliverables</div>
            <div>4. Freelancer receives payment within 24 hours</div>
          </div>
        </div>
      </main>
    </div>
  );
}