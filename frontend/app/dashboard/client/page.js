'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../utils/api';
import toast from 'react-hot-toast';
import {
  Briefcase, Search, DollarSign, Star,
  LogOut, Settings, Bell, Users,
  PlusCircle, TrendingUp, CheckCircle, Clock, MessageSquare
} from 'lucide-react';

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { 
      router.push('/login'); 
      return; 
    }
    if (user.role !== 'client') { 
      router.push('/dashboard/freelancer'); 
      return; 
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [pRes, bRes] = await Promise.all([
        API.get('/projects/my').catch(err => ({ data: { projects: [] } })),
        API.get('/bids/my/projects').catch(err => ({ data: { bids: [] } }))
      ]);
      
      // Safely set data with fallbacks
      setProjects(pRes?.data?.projects || []);
      setBids(bRes?.data?.bids || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
      // Set empty arrays to prevent null errors
      setProjects([]);
      setBids([]);
    } finally {
      setLoading(false);
    }
  };

  // Safely calculate stats with null checks
  const openProjects = projects?.filter(p => p?.status === 'open')?.length || 0;
  const inProgressProjects = projects?.filter(p => p?.status === 'in_progress')?.length || 0;
  const completedProjects = projects?.filter(p => p?.status === 'completed')?.length || 0;
  const totalBids = bids?.length || 0;

  const stats = [
    { label: 'Open Projects', value: openProjects, icon: <Briefcase size={20} />, bg: 'rgba(201,168,76,0.08)' },
    { label: 'In Progress', value: inProgressProjects, icon: <Clock size={20} />, bg: 'rgba(59,130,246,0.08)' },
    { label: 'Completed', value: completedProjects, icon: <CheckCircle size={20} />, bg: 'rgba(16,185,129,0.08)' },
    { label: 'Total Bids', value: totalBids, icon: <Users size={20} />, bg: 'rgba(139,92,246,0.08)' },
  ];

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
          <div className="avatar avatar-gold">{user?.name?.charAt(0)?.toUpperCase() || 'C'}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--white)' }}>{user?.name || 'Client'}</div>
            <div style={{ fontSize: 12, color: 'var(--gold)' }}>Client</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button onClick={() => router.push('/dashboard/client')} className="sidebar-link active-gold">
            <Briefcase size={17} /> My Projects
          </button>
          <button onClick={() => router.push('/dashboard/client/find-talent')} className="sidebar-link">
            <Search size={17} /> Find Talent
          </button>
          <button onClick={() => router.push('/dashboard/client/post-project')} className="sidebar-link">
            <PlusCircle size={17} /> Post Project
          </button>
          <button onClick={() => router.push('/dashboard/client/payments')} className="sidebar-link">
            <DollarSign size={17} /> Payments
          </button>
          <button onClick={() => router.push('/dashboard/client/reviews')} className="sidebar-link">
            <Star size={17} /> Reviews
          </button>
          <button onClick={() => router.push('/dashboard/settings')} className="sidebar-link">
            <Settings size={17} /> Settings
          </button>
          <button onClick={() => router.push('/dashboard/messages')} className="sidebar-link">
            <MessageSquare size={17} /> Messages
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
            <p className="dashboard-subtitle">Welcome back,</p>
            <h1 className="dashboard-title">{user?.name || 'Client'} 👋</h1>
          </div>
          <button className="btn btn-gold" onClick={() => router.push('/dashboard/client/post-project')}>
            <PlusCircle size={16} /> Post New Project
          </button>
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

        {/* Recent Projects */}
        <div className="table-card">
          <div className="table-header">
            <span className="table-title">My Projects</span>
            <button className="btn btn-outline btn-sm" onClick={() => router.push('/dashboard/client/post-project')}>
              Post New Project →
            </button>
          </div>

          {!projects || projects.length === 0 ? (
            <div className="empty-state">
              <Briefcase size={40} className="empty-icon" />
              <p className="empty-title">No projects yet</p>
              <p className="empty-desc">Post your first project to start hiring freelancers</p>
              <button className="btn btn-gold" onClick={() => router.push('/dashboard/client/post-project')}>
                Post Project
              </button>
            </div>
          ) : (
            <>
              <div className="table-head" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                <span>Project Title</span>
                <span>Budget</span>
                <span>Status</span>
                <span>Bids</span>
              </div>
              {projects.slice(0, 5).map(project => (
                <div key={project.id} className="table-row" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--white)', marginBottom: 4 }}>
                      {project.title || 'Untitled'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--slate)' }}>
                      Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not set'}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gold)' }}>
                    ₹{Number(project.budget || 0).toLocaleString()}
                  </div>
                  <div>
                    <span className={`badge ${
                      project.status === 'open' ? 'badge-gold' : 
                      project.status === 'in_progress' ? 'badge-blue' : 'badge-green'
                    }`}>
                      {project.status || 'unknown'}
                    </span>
                  </div>
                  <div>
                    <button 
                      className="btn btn-outline btn-sm" 
                      onClick={() => router.push(`/dashboard/client/projects/${project.id}/bids`)}
                    >
                      View Bids →
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