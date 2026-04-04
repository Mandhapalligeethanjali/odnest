'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';  // 4 levels up
import API from '../../../../utils/api';  // 4 levels up - THIS WAS THE ISSUE
import toast from 'react-hot-toast';
import { 
  Briefcase, Mail, CheckCircle, XCircle, Clock, 
  Search, DollarSign, Star, LogOut, Settings, 
  MessageSquare 
} from 'lucide-react';

export default function InvitationsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) router.push('/login');
    else fetchInvitations();
  }, [user]);

  const fetchInvitations = async () => {
    try {
      const response = await API.get('/projects/invitations');
      setInvitations(response.data.invitations || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async (invitationId) => {
    try {
      await API.put(`/projects/invitations/${invitationId}/accept`);
      toast.success('Invitation accepted!');
      fetchInvitations();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Failed to accept invitation');
    }
  };

  const declineInvitation = async (invitationId) => {
    try {
      await API.put(`/projects/invitations/${invitationId}/decline`);
      toast.success('Invitation declined');
      fetchInvitations();
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast.error('Failed to decline invitation');
    }
  };

  if (!user) return null;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
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
          <button onClick={() => router.push('/dashboard/freelancer/invitations')} className="sidebar-link active-green">
            <Mail size={17} /> Invitations
            {invitations.length > 0 && (
              <span className="badge badge-gold" style={{ marginLeft: 'auto' }}>{invitations.length}</span>
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

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <div className="dashboard-subtitle">Project Opportunities</div>
            <h1 className="dashboard-title">Invitations</h1>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="spinner" />
            <p>Loading invitations...</p>
          </div>
        ) : invitations.length === 0 ? (
          <div className="empty-state">
            <Mail size={48} className="empty-icon" />
            <h3 className="empty-title">No invitations yet</h3>
            <p className="empty-desc">When clients invite you to projects, they'll appear here</p>
            <button className="btn btn-gold" onClick={() => router.push('/dashboard/freelancer/browse-projects')}>
              Browse Projects
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {invitations.map((invite) => (
              <div key={invite.id} className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 600 }}>{invite.project_title}</h3>
                      <span className="badge badge-gold">Invitation</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--slate)' }}>
                      From: {invite.client_name} • Budget: ₹{Number(invite.project_budget).toLocaleString()}
                    </p>
                  </div>
                  <Clock size={18} style={{ color: 'var(--slate)' }} />
                </div>
                
                <p style={{ fontSize: 14, color: 'var(--slate-light)', marginBottom: 20, lineHeight: 1.6 }}>
                  {invite.message || "You've been invited to work on this project!"}
                </p>
                
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => acceptInvitation(invite.id)}
                    className="btn btn-success"
                    style={{ flex: 1 }}
                  >
                    <CheckCircle size={16} /> Accept
                  </button>
                  <button
                    onClick={() => declineInvitation(invite.id)}
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                  >
                    <XCircle size={16} /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}