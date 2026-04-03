'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import API from '../../../../utils/api';
import toast from 'react-hot-toast';
import {
  Briefcase, Search, DollarSign, Star, StarHalf,
  LogOut, Settings, Users, MapPin, Code,
  Mail, Filter, X
} from 'lucide-react';

export default function FindTalent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    minRating: '',
    maxHourlyRate: '',
    skills: [],
    location: ''
  });
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({
    project_id: '',
    message: ''
  });
  const [userProjects, setUserProjects] = useState([]);

  useEffect(() => {
    if (!user) router.push('/login');
    else {
      fetchFreelancers();
      fetchUserProjects();
    }
  }, [user, filters]);

  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (filters.maxHourlyRate) params.append('maxHourlyRate', filters.maxHourlyRate);
      if (filters.location) params.append('location', filters.location);
      if (filters.skills.length) params.append('skills', filters.skills.join(','));

      const response = await API.get(`/users/freelancers?${params.toString()}`);
      setFreelancers(response.data.freelancers || []);
    } catch (error) {
      console.error('Error fetching freelancers:', error);
      toast.error('Failed to load freelancers');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProjects = async () => {
    try {
      const response = await API.get('/projects/my');
      setUserProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Star key={i} size={14} fill="var(--gold)" color="var(--gold)" />);
      } else if (i - 0.5 <= rating) {
        stars.push(<StarHalf key={i} size={14} fill="var(--gold)" color="var(--gold)" />);
      } else {
        stars.push(<Star key={i} size={14} color="var(--slate)" />);
      }
    }
    return stars;
  };

  const sendInvitation = async (e) => {
    e.preventDefault();
    try {
      await API.post('/projects/invite', {
        freelancer_id: selectedFreelancer.id,
        project_id: inviteData.project_id,
        message: inviteData.message
      });
      toast.success('Invitation sent successfully!');
      setShowInviteModal(false);
      setInviteData({ project_id: '', message: '' });
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    }
  };

  const skillOptions = ['React', 'Node.js', 'Python', 'UI/UX', 'Graphic Design', 'Content Writing', 'SEO', 'Mobile Dev'];

  if (!user) return null;

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon"><Briefcase size={18} style={{ color: 'var(--navy)' }} /></div>
          <span className="logo-text">ODnest</span>
        </div>

        <div className="sidebar-user">
          <div className="avatar avatar-gold">{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--white)' }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--gold)' }}>Client</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button onClick={() => router.push('/dashboard/client')} className="sidebar-link">
            <Briefcase size={17} /> My Projects
          </button>
          <button onClick={() => router.push('/dashboard/client/find-talent')} className="sidebar-link active-gold">
            <Search size={17} /> Find Talent
          </button>
          <button onClick={() => router.push('/dashboard/client/post-project')} className="sidebar-link">
            <Briefcase size={17} /> Post Project
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
            <div className="dashboard-subtitle">Hire the Best</div>
            <h1 className="dashboard-title">Find Talent</h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="input-group">
            <div className="input-wrap">
              <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate)' }} />
              <input
                type="text"
                className="input"
                placeholder="Search freelancers by name, skills, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchFreelancers()}
                style={{ paddingLeft: 42 }}
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Filter size={16} style={{ color: 'var(--gold)' }} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Filters</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <input
              type="number"
              className="input"
              placeholder="Min Rating (1-5)"
              min="1"
              max="5"
              step="0.5"
              value={filters.minRating}
              onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
            />
            <input
              type="number"
              className="input"
              placeholder="Max Hourly Rate (₹)"
              value={filters.maxHourlyRate}
              onChange={(e) => setFilters({ ...filters, maxHourlyRate: e.target.value })}
            />
            <input
              type="text"
              className="input"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            />
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 8, display: 'block' }}>Skills</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {skillOptions.map(skill => (
                <button
                  key={skill}
                  onClick={() => {
                    if (filters.skills.includes(skill)) {
                      setFilters({ ...filters, skills: filters.skills.filter(s => s !== skill) });
                    } else {
                      setFilters({ ...filters, skills: [...filters.skills, skill] });
                    }
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: 12,
                    background: filters.skills.includes(skill) ? 'var(--gold)' : 'rgba(201,168,76,0.1)',
                    color: filters.skills.includes(skill) ? 'var(--navy)' : 'var(--slate-light)',
                    border: '1px solid rgba(201,168,76,0.2)',
                    cursor: 'pointer'
                  }}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Freelancers Grid */}
        {loading ? (
          <div className="empty-state">
            <div className="spinner" />
            <p>Loading freelancers...</p>
          </div>
        ) : freelancers.length === 0 ? (
          <div className="empty-state">
            <Users size={48} className="empty-icon" />
            <h3 className="empty-title">No freelancers found</h3>
            <p className="empty-desc">Try adjusting your search filters</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
            {freelancers.map((freelancer) => (
              <div key={freelancer.id} className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <div className="avatar avatar-green" style={{ width: 60, height: 60, fontSize: 24 }}>
                    {freelancer.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{freelancer.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {renderStars(freelancer.rating || 0)}
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--slate)' }}>({freelancer.total_reviews || 0})</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--gold)' }}>
                      ₹{freelancer.hourly_rate || 500}/hr
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: 'var(--slate-light)', marginBottom: 16, lineHeight: 1.6 }}>
                  {freelancer.bio || 'No bio provided'}
                </p>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--slate)', marginBottom: 8 }}>
                    <MapPin size={12} /> {freelancer.location || 'Location not specified'}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {freelancer.skills?.slice(0, 4).map((skill, idx) => (
                      <span key={idx} className="badge badge-gold" style={{ fontSize: 11 }}>
                        <Code size={10} style={{ marginRight: 4 }} /> {skill}
                      </span>
                    ))}
                    {freelancer.skills?.length > 4 && (
                      <span className="badge badge-slate" style={{ fontSize: 11 }}>+{freelancer.skills.length - 4}</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedFreelancer(freelancer);
                    setShowInviteModal(true);
                  }}
                  className="btn btn-gold btn-full"
                >
                  <Mail size={14} /> Invite to Project
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Invite Modal */}
      {showInviteModal && selectedFreelancer && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowInviteModal(false)}>
          <div className="card" style={{ maxWidth: 500, width: '90%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>Invite to Project</h3>
              <button onClick={() => setShowInviteModal(false)} style={{ color: 'var(--slate)' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: 14, color: 'var(--slate)', marginBottom: 16 }}>
              Inviting: <strong>{selectedFreelancer.name}</strong>
            </p>
            <form onSubmit={sendInvitation}>
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label">Select Project</label>
                <select
                  className="input"
                  value={inviteData.project_id}
                  onChange={(e) => setInviteData({ ...inviteData, project_id: e.target.value })}
                  required
                >
                  <option value="">Choose a project...</option>
                  {userProjects.map(project => (
                    <option key={project.id} value={project.id}>{project.title}</option>
                  ))}
                </select>
              </div>
              <div className="input-group" style={{ marginBottom: 24 }}>
                <label className="input-label">Invitation Message</label>
                <textarea
                  className="input"
                  rows={4}
                  value={inviteData.message}
                  onChange={(e) => setInviteData({ ...inviteData, message: e.target.value })}
                  required
                  placeholder="Describe your project and why you think this freelancer would be a great fit..."
                />
              </div>
              <button type="submit" className="btn btn-gold btn-full">
                Send Invitation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}